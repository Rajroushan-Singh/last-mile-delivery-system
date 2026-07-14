import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { orderApi } from "../api/orderApi";
import { useAuth } from "../auth/AuthContext";
import { Package, ArrowLeft, Loader2, Calendar, MapPin, Truck, CheckCircle2, User, LogOut } from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderApi.retrieve(id);
        setOrder(data);
      } catch (err) {
        setError("Failed to load order tracking details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0f19]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel p-8 rounded-2xl text-center space-y-4">
          <p className="text-red-400 font-semibold">{error || "Order not found."}</p>
          <button
            onClick={() => navigate("/customer/dashboard")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition cursor-pointer"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Constructing timeline checkpoints
  const timelineSteps = [
    { label: "Order Created", key: "created_at", desc: "Your booking was logged." },
    { label: "Agent Assigned", key: "assigned_at", desc: "A delivery agent was secured." },
    { label: "Picked Up", key: "picked_up_at", desc: "Parcel collected from origin." },
    { label: "In Transit", key: "in_transit_at", desc: "Shipment is routing through zones." },
    { label: "Out For Delivery", key: "out_for_delivery_at", desc: "Agent is en route to drop destination." },
    { label: "Delivered", key: "delivered_at", desc: "Package handoff completed successfully." },
  ];

  // Helper to determine status order for styling the active track line
  const statusIndexes = {
    "CREATED": 0,
    "ASSIGNED": 1,
    "PICKED_UP": 2,
    "IN_TRANSIT": 3,
    "OUT_FOR_DELIVERY": 4,
    "DELIVERED": 5
  };
  const currentStatusIdx = statusIndexes[order.status] ?? 0;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 pb-12">
      {/* Top Navbar */}
      <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Last-Mile Portal</h1>
            <span className="text-xs text-blue-400 font-semibold tracking-wider uppercase">Customer</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/customer/dashboard" className="text-sm font-medium text-gray-400 hover:text-white transition pb-1">
            Dashboard
          </Link>
          <Link to="/customer/my-orders" className="text-sm font-medium text-gray-400 hover:text-white transition pb-1">
            My Orders
          </Link>
          <div className="h-6 w-px bg-gray-800"></div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-300">Welcome, {user}</span>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="flex items-center gap-1.5 text-sm bg-red-950/40 text-red-400 px-3 py-1.5 rounded-lg border border-red-900/30 hover:bg-red-900/40 transition cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Details Layout */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <Link to="/customer/dashboard" className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white transition mb-6">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Order Specs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-gray-850 pb-4">
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase">Tracking Number</span>
                  <h2 className="text-xl font-bold font-mono text-white mt-1">#{order.id}</h2>
                </div>
                <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg text-sm font-bold border border-blue-500/20">
                  {order.status}
                </span>
              </div>

              {/* Addresses details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase">
                    <MapPin className="h-4 w-4" />
                    <span>Pickup Address (Zone {order.pickup_zone})</span>
                  </div>
                  <p className="text-sm bg-gray-900/40 border border-gray-800 p-3 rounded-lg text-gray-300">
                    {order.pickup_address}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-green-400 uppercase">
                    <MapPin className="h-4 w-4" />
                    <span>Drop Address (Zone {order.drop_zone})</span>
                  </div>
                  <p className="text-sm bg-gray-900/40 border border-gray-800 p-3 rounded-lg text-gray-300">
                    {order.drop_address}
                  </p>
                </div>
              </div>

              {/* Package specs table */}
              <div className="border-t border-gray-800 pt-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-300">Specifications & Computation Details</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-800/40">
                    <span className="text-xs text-gray-400">Dimensions</span>
                    <p className="text-sm font-semibold mt-1">{parseInt(order.length)}x{parseInt(order.breadth)}x{parseInt(order.height)} cm</p>
                  </div>
                  <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-800/40">
                    <span className="text-xs text-gray-400">Actual Weight</span>
                    <p className="text-sm font-semibold mt-1">{order.actual_weight} kg</p>
                  </div>
                  <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-800/40">
                    <span className="text-xs text-gray-400">Volumetric Weight</span>
                    <p className="text-sm font-semibold mt-1">{order.volumetric_weight} kg</p>
                  </div>
                  <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-800/40">
                    <span className="text-xs text-gray-400">Billable Weight</span>
                    <p className="text-sm font-semibold mt-1">{order.billable_weight} kg</p>
                  </div>
                </div>
              </div>

              {/* Billing and Assign status */}
              <div className="border-t border-gray-800 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <span className="text-xs text-gray-400">Delivery Charge</span>
                  <p className="text-2xl font-black text-white mt-1">₹{order.delivery_charge}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Payment Mode</span>
                  <p className="text-sm font-bold text-gray-200 mt-1.5 uppercase font-mono">{order.payment_type}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Assigned Delivery Agent</span>
                  <p className="text-sm font-bold text-gray-200 mt-1.5">
                    {order.assigned_agent ? (
                      <span className="inline-flex items-center gap-1.5 bg-gray-800 text-gray-300 border border-gray-700 px-2.5 py-0.5 rounded">
                        <User className="h-3 w-3" />
                        <span>Agent #{order.assigned_agent}</span>
                      </span>
                    ) : (
                      <span className="text-yellow-500 font-semibold">Awaiting Agent Assignment</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Timeline Track */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 shadow-xl space-y-6">
            <h3 className="text-lg font-bold">Live Status Tracking</h3>
            <div className="relative pl-6 border-l-2 border-gray-800 space-y-6">
              {timelineSteps.map((step, index) => {
                const stepTime = order[step.key];
                const isCompleted = stepTime !== null && stepTime !== undefined;
                const isCurrent = order.status === step.key.replace("_at", "").toUpperCase() || 
                                  (step.key === "created_at" && order.status === "CREATED") ||
                                  (step.key === "assigned_at" && order.status === "ASSIGNED");
                
                return (
                  <div key={step.key} className="relative group">
                    {/* Circle Node */}
                    <span className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${
                      isCompleted 
                        ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/50" 
                        : isCurrent
                        ? "bg-yellow-600 border-yellow-500 shadow-lg shadow-yellow-500/50"
                        : "bg-[#0b0f19] border-gray-700"
                    }`} />

                    <div className="space-y-1">
                      <span className={`text-sm font-bold ${
                        isCompleted ? "text-white" : isCurrent ? "text-yellow-400" : "text-gray-500"
                      }`}>
                        {step.label}
                      </span>
                      <p className="text-xs text-gray-400 leading-normal">{step.desc}</p>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 font-medium font-mono mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(stepTime).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
