# System Design Write-Up

## Rate Calculation Engine

Pricing happens entirely server-side, inside `DeliveryChargeService.calculate()`,
at the moment an order is created — the client never sends a price, only raw
package dimensions and metadata, which closes off client-side price
tampering as an attack surface.

The engine runs three steps. First, it derives **volumetric weight** as
`(length × breadth × height) / 5000`, the standard courier-industry
volumetric divisor, which approximates how much cargo space a package
occupies relative to its physical weight. Second, it takes **billable
weight** as `max(volumetric_weight, actual_weight)` — this is the industry-
standard rule that prevents large, light packages (e.g. a big box of pillows)
from being underpriced relative to the truck space they actually consume.
Third, it applies a **zone-aware base rate**: if `pickup_zone == drop_zone`,
the `RateCard.intra_zone_rate` applies; otherwise `inter_zone_rate` applies,
each multiplied by billable weight. A flat `cod_surcharge` is added on top
when `payment_type == "COD"`, reflecting the extra collection/reconciliation
overhead COD imposes on the delivery network.

The rate card itself is selected server-side by filtering
`RateCard.objects.filter(order_type=..., is_active=True).first()` — meaning
pricing changes are operationally simple (deactivate one card, activate a
replacement) without touching code, and historical orders keep referencing
the exact rate card that priced them via a `PROTECT`-on-delete foreign key,
preserving an accurate audit trail even after rates change.

## Zone Detection Approach

The current implementation does **not** perform automatic zone detection
from a pickup/drop address or pincode. `pickup_zone` and `drop_zone` are
explicit foreign keys the customer selects from a dropdown populated by
`GET /zones/` at order-creation time. This was a deliberate simplification:
zone boundaries in last-mile logistics are rarely a clean function of a
pincode alone (a single pincode can straddle two operational zones, or a
zone can span several pincodes), so a naive automated mapping risks being
wrong in exactly the cases that matter — mispriced or misrouted orders.

The `Area` model (pincode → zone mapping, nested under `Zone`) already exists
in the schema specifically to support automatic detection as a follow-up: the
natural next step is an endpoint that accepts a pincode and resolves it to a
zone via `Area.objects.filter(pincode=...).select_related("zone")`, falling
back to manual selection when a pincode has no mapped area (e.g. new service
regions) rather than blocking order creation entirely.

## Auto-Assignment Logic

Immediately after an order is priced, `AgentAssignmentService.assign()` runs
a single, intentionally simple query: the first `DeliveryAgent` with
`status="AVAILABLE"` and `current_zone == order.pickup_zone`. If found, the
agent is marked `BUSY` and linked to the order, whose status advances from
`CREATED` to `ASSIGNED`; if no agent is currently available in that zone, the
order stays in `CREATED` with `assigned_agent = null` rather than failing the
request outright — order creation and agent assignment are decoupled so a
temporary capacity shortage never blocks a customer from placing an order.

This "first available agent in-zone" strategy is a reasonable v1 — it's
O(1) conceptually and avoids double-booking — but it doesn't yet account for
agent workload balancing (an agent who's just been freed vs. one idle for
hours), proximity within the zone, or vehicle-type suitability (a `VAN`
agent for a bulky B2B order vs. a `BIKE` agent for a small parcel). A
natural extension is scoring candidates instead of taking the first match:
weight recency-of-availability, current order count, and vehicle/package fit
before assigning.

## Failed Delivery Handling

The `Order.STATUS_CHOICES` already reserves `FAILED`, `CANCELLED`, and
`RESCHEDULED` as terminal/recovery states, but no API endpoint currently
transitions an order into any of them — only the happy-path chain
(`PICKED_UP` → `IN_TRANSIT` → `OUT_FOR_DELIVERY` → `DELIVERED`) is wired up.
The intended design mirrors the existing tracking-service pattern: an agent-
facing `PATCH /orders/{id}/failed/` endpoint that requires a `reason` field
(e.g. "customer unreachable," "address not found," "refused delivery"),
records a `failed_at` timestamp, and — critically — frees the assigned agent
back to `AVAILABLE`, exactly as `delivered()` already does. A failed order
should then support a customer- or admin-initiated
`PATCH /orders/{id}/reschedule/`, which resets status to `ASSIGNED` (or
re-runs auto-assignment if the original agent is no longer available) rather
than requiring an entirely new order, preserving delivery-charge history and
package details.
