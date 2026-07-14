# Last-Mile Delivery Management System

A Django REST Framework backend (+ React frontend) for managing last-mile
deliveries: customer order creation, automatic rate calculation, automatic
agent assignment, delivery-status tracking, and admin management of zones,
areas, rate cards, and delivery agents.

> **Status note:** This README documents the system as designed. A few
> endpoints/permissions listed below are marked **(pending fix)** — see
> [Known Issues](#known-issues--pending-fixes) for the current state of the
> codebase and what still needs to land before they work as documented.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 5.2, Django REST Framework 3.17, SimpleJWT |
| Database | MySQL |
| API docs | drf-yasg (Swagger/OpenAPI) |
| Frontend | React (Vite), React Router, Axios, Tailwind CSS |

---

## Setup Guide

### Prerequisites
- Python 3.10+
- MySQL Server 8+ (running locally or reachable)
- Node.js 18+ and npm (for the frontend)

### 1. Clone and set up the backend

```bash
git clone <your-repo-url>
cd last_mile_delivery

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

### 2. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

See [`.env.example`](#envexample) below for every variable and what it does.

### 3. Create the database

```sql
CREATE DATABASE last_mile_delivery CHARACTER SET utf8mb4;
```//

### 4. Run migrations and create an admin user

```bash
python manage.py migrate
python manage.py createsuperuser   # optional: for /admin/ Django admin site
```

To get an `ADMIN`-role API user (for the JWT-protected admin endpoints, not
the Django admin site), register normally through the API with
`"role": "ADMIN"`.

### 5. Run the backend

```bash
python manage.py runserver
```

API is now available at `http://127.0.0.1:8000/api/v1/`.
Swagger docs (if `drf_yasg` urls are wired up in your `config/urls.py`) at
`/swagger/`.

### 6. Set up and run the frontend

```bash
cd frontend
npm install
npm run dev
```

Configure the frontend's API base URL via its own `.env`
(e.g. `VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1/`).

---

## `.env.example`

See the file [`.env.example`](./.env.example) in the repo root. Copy it to
`.env` and fill in real values — never commit `.env` itself.

---

## Database Schema

MySQL, 6 tables. `id` on every table is an auto-incrementing `BigAutoField`.

### `accounts_user` (custom `User`, extends Django's `AbstractUser`)
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| username, email, password | — | inherited from `AbstractUser` |
| role | varchar(20) | `ADMIN` \| `CUSTOMER` \| `DELIVERY_AGENT` |
| phone_number | varchar(15) | nullable |
| created_at, updated_at | datetime | auto |

### `zones_zone`
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| name | varchar(100) | unique |
| description | text | blank |
| is_active | bool | default true |
| created_at, updated_at | datetime | auto |

### `zones_area`
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| zone_id | FK → Zone | `on_delete=CASCADE`, related_name `areas` |
| name | varchar(100) | |
| pincode | varchar(10) | |
| created_at, updated_at | datetime | auto |
| — | — | unique together: (`zone`, `name`) |

### `ratecards_ratecard`
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| order_type | varchar(3) | `B2B` \| `B2C` |
| intra_zone_rate | decimal(10,2) | per unit billable weight, same zone |
| inter_zone_rate | decimal(10,2) | per unit billable weight, cross zone |
| cod_surcharge | decimal(10,2) | flat add-on when `payment_type=COD` |
| is_active | bool | only active card is used at order time |
| created_at, updated_at | datetime | auto |

### `agents_deliveryagent`
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| user_id | FK → User | `OneToOneField`, `on_delete=CASCADE` |
| phone | varchar(15) | |
| vehicle_type | varchar(10) | `BIKE` \| `SCOOTER` \| `VAN` |
| current_zone_id | FK → Zone | nullable, `on_delete=SET_NULL` |
| status | varchar(10) | `AVAILABLE` \| `BUSY` \| `OFFLINE` |
| created_at, updated_at | datetime | auto |

### `orders_order`
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| customer_id | FK → User | `on_delete=CASCADE` |
| assigned_agent_id | FK → DeliveryAgent | nullable, `on_delete=SET_NULL` |
| pickup_zone_id / drop_zone_id | FK → Zone | `on_delete=PROTECT` |
| rate_card_id | FK → RateCard | `on_delete=PROTECT`, set server-side at creation |
| pickup_address, drop_address | text | |
| length, breadth, height, actual_weight | decimal(10,2) | customer-supplied |
| volumetric_weight, billable_weight | decimal(10,2) | server-computed |
| order_type | varchar(3) | `B2B` \| `B2C` |
| payment_type | varchar(10) | `PREPAID` \| `COD` |
| delivery_charge | decimal(10,2) | server-computed |
| status | varchar(30) | see status list below |
| assigned_at, picked_up_at, in_transit_at, out_for_delivery_at, delivered_at | datetime | nullable, set as each transition happens |
| created_at, updated_at | datetime | auto |

**Order status values:** `CREATED`, `ASSIGNED`, `PICKED_UP`, `IN_TRANSIT`,
`OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`, `CANCELLED`, `RESCHEDULED`. Only
the first six currently have an API transition wired up — see Known Issues.

### Relationships (ERD, text form)

```
User 1───∞ Order (customer)
User 1───1 DeliveryAgent
DeliveryAgent 1───∞ Order (assigned_agent)
Zone 1───∞ Order (pickup_zone)
Zone 1───∞ Order (drop_zone)
Zone 1───∞ Area
Zone 1───∞ DeliveryAgent (current_zone)
RateCard 1───∞ Order
```

---

## API Documentation

Base URL: `http://127.0.0.1:8000/api/v1/`
Auth: `Authorization: Bearer <access_token>` on every endpoint except
register/login.

### Auth
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/auth/register/` | none | `username, email, password, confirm_password, phone_number, role` | |
| POST | `/auth/login/` | none | `username, password` | returns `access`, `refresh`, `username`, `role` |
| POST | `/auth/token/refresh/` | none | `refresh` | **(pending fix — not yet wired up)** |

### Zones — `/zones/` (full CRUD router)
| Method | Path | Auth |
|---|---|---|
| GET | `/zones/`, `/zones/{id}/` | any authenticated user |
| POST / PUT / PATCH / DELETE | `/zones/`, `/zones/{id}/` | ADMIN only |

### Areas — `/areas/` (full CRUD router, same pattern as Zones)

### Rate Cards — `/ratecards/` (full CRUD router, same pattern as Zones)

### Orders
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/orders/` | CUSTOMER | creates order, auto-computes charge, attempts auto-assignment |
| GET | `/orders/` | authenticated | **(pending fix)** role-scoped list: own orders / assigned orders / all |
| GET | `/orders/{id}/` | authenticated | **(pending fix)** role-scoped detail |
| PATCH | `/orders/{id}/pickup/` | DELIVERY_AGENT | **(pending fix — role check bug)** |
| PATCH | `/orders/{id}/in-transit/` | DELIVERY_AGENT | **(pending fix)** |
| PATCH | `/orders/{id}/out-for-delivery/` | DELIVERY_AGENT | **(pending fix)** |
| PATCH | `/orders/{id}/delivered/` | DELIVERY_AGENT | **(pending fix)** — also frees the agent |

### Agents — `/agents/` (router + custom actions)
| Method | Path | Auth |
|---|---|---|
| GET/POST/PUT/PATCH/DELETE | `/agents/`, `/agents/{id}/` | ADMIN only for writes **(pending fix — currently ungated)** |
| GET | `/agents/{id}/dashboard/` | authenticated |
| PATCH | `/agents/{id}/update_status/` | authenticated |
| GET | `/agents/{id}/orders/` | **(pending fix — not yet implemented)** |

Full request/response payload examples are in the frontend integration prompt
generated earlier in this project; this table is the quick-reference version.

---

## Rate Calculation Logic

Implemented in `DeliveryChargeService.calculate()`:

1. **Volumetric weight** = `(length × breadth × height) / 5000` (standard
   courier-industry volumetric divisor; dimensions in cm, result in kg).
2. **Billable weight** = `max(volumetric_weight, actual_weight)` — the
   customer is always charged for whichever is larger, so oversized-but-light
   packages don't undercharge.
3. **Base rate** depends on whether `pickup_zone == drop_zone`:
   - Same zone → `intra_zone_rate × billable_weight`
   - Different zones → `inter_zone_rate × billable_weight`
4. **COD surcharge**: if `payment_type == "COD"`, add the active rate card's
   flat `cod_surcharge` on top.
5. The **active** `RateCard` for the order's `order_type` (`B2B`/`B2C`) is
   selected server-side at creation time (`is_active=True`); the client never
   supplies pricing — this prevents client-side price tampering.

All three computed values (`volumetric_weight`, `billable_weight`,
`delivery_charge`) are stored on the `Order` row at creation and returned in
the response.

---

## Deployment Guide

Two services to deploy: the Django API and the React frontend.

### Backend → Render (or Railway)
1. Push this repo to GitHub.
2. On Render: **New → Web Service**, connect the repo, root directory =
   backend folder.
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn config.wsgi:application` (add `gunicorn` to
   `requirements.txt` — it isn't there yet).
5. Add a managed MySQL instance (Render/Railway both offer one, or use
   PlanetScale/Aiven) and set `DB_*` env vars from `.env.example` to point at it.
6. Set `SECRET_KEY`, `DEBUG=False`, and `ALLOWED_HOSTS=<your-render-domain>`.
7. After first deploy, run migrations via the platform's shell:
   `python manage.py migrate`.
8. Once `django-cors-headers` is added (see Known Issues), set
   `CORS_ALLOWED_ORIGINS` to your deployed frontend's URL.

### Frontend → Vercel
1. **New Project**, import the same repo, root directory = `frontend/`.
2. Framework preset: Vite.
3. Set `VITE_API_BASE_URL=https://<your-render-backend-domain>/api/v1/` as
   an environment variable.
4. Deploy — Vercel auto-detects `npm run build`.

Once both are live, update the backend's `ALLOWED_HOSTS`/`CORS_ALLOWED_ORIGINS`
with the final Vercel domain and redeploy the backend.

---

## Known Issues / Pending Fixes

These are real gaps in the current codebase, not documentation errors:

1. `IsAgent` permission checks `role == "AGENT"`; actual role value is
   `DELIVERY_AGENT` — blocks all agent status-transition endpoints until fixed.
2. `DeliveryAgentSerializer` references a non-existent `vehicle_number` field
   — causes a 500 on any agent list/retrieve/create.
3. `DeliveryAgentViewSet` has no write-permission gate — currently any
   authenticated user can create/edit/delete agent records.
4. No `GET /orders/` or `GET /orders/{id}/` — customers/agents/admins can't
   list or view orders yet, only create and PATCH-transition them.
5. No `GET /agents/{id}/orders/` for an agent's assigned-orders list.
6. No `TokenRefreshView` wired up despite SimpleJWT being installed.
7. No CORS configuration (`django-cors-headers` not installed/enabled).
8. No admin user-management endpoints exist at all (list/promote/deactivate
   users) — an admin currently has no backend-supported way to browse users
   when creating an Agent profile.
9. `ALLOWED_HOSTS = []` in settings — will reject all requests once
   `DEBUG=False` in production; must be set via env var before deploying.
