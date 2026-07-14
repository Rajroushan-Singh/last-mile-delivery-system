import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { agentApi } from "../api/agentApi";
import { orderApi } from "../api/orderApi";
import { useAuth } from "../auth/AuthContext";
import { Package, Truck, Compass, CheckCircle2, User, RefreshCw, LogOut, ArrowRight, AlertTriangle } from "lucide-react";

const AgentDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [agentProfile, setAgentProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState(null);

  const fetchAgentData = async () => {
    setError(null);
    try {
      const loggedUserId = parseInt(localStorage.getItem("user_id"));
      const allAgents = await agentApi.list();
      
      // Find agent profile corresponding to current logged in user
      const matchingAgent = allAgents.find(a => a.user === loggedUserId);
      
      if (!matchingAgent) {
        setError("No Delivery Agent profile is associated with this account. Please contact an administrator.");
        setLoading(false);
        return;
      }

      setAgentProfile(matchingAgent);

      // Load agent dashboard status & assigned orders
      const [dash, orders] = await Promise.all([
        agentApi.dashboard(matchingAgent.id),
        agentApi.getAssignedOrders(matchingAgent.id),
      ]);

      setDashboardData(dash);
      setAssignedOrders(orders);
    } catch (err) {
      setError("Failed to fetch agent profile or assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
  }, []);

  const handleStatusChange = async (newStatus) => {
    if (!agentProfile) return;
    setUpdatingStatus(true);
    try {
      const result = await agentApi.updateStatus(agentProfile.id, { status: newStatus });
      setDashboardData(prev => ({ ...prev, status: result.status }));
    } catch (err) {
      alert("Failed to update status. Remember: IsAgent permission may require fixing on the backend.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleTransition = async (orderId, currentStatus) => {
    try {
      let updatedOrder;
      if (currentStatus === "ASSIGNED") {
        updatedOrder = await orderApi.pickup(orderId);
      } else if (currentStatus === "PICKED_UP") {
        updatedOrder = await orderApi.inTransit(orderId);
      } else if (currentStatus === "IN_TRANSIT") {
        updatedOrder = await orderApi.outForDelivery(orderId);
      } else if (currentStatus === "OUT_FOR_DELIVERY") {
        updatedOrder = await orderApi.delivered(orderId);
      }

      if (updatedOrder) {
        // Refresh orders and agent dashboard state
        const orders = await agentApi.getAssignedOrders(agentProfile.id);
        setAssignedOrders(orders);
        
        // Refresh dashboard (delivering an order updates agent status to AVAILABLE automatically on backend)
        const dash = await agentApi.dashboard(agentProfile.id);
        setDashboardData(dash);
      }
    } catch (err) {
      alert("Error transitioning order status. Verify that the agent account has IsAgent permissions.");
    }
  };

  const getTransitionButtonText = (status) => {
    switch (status) {
      case "ASSIGNED": return "Confirm Pickup";
      case "PICKED_UP": return "Ship In-Transit";
      case "IN_TRANSIT": return "Out For Delivery";
      case "OUT_FOR_DELIVERY": return "Mark Delivered";
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "OUT_FOR_DELIVERY":
      case "IN_TRANSIT":
      case "PICKED_UP": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "ASSIGNED": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-550";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0f19]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 pb-12">
      {/* Top Navbar */}
      <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg text-white">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Last-Mile Portal</h1>
            <span className="text-xs text-emerald-400 font-semibold tracking-wider uppercase">Delivery Agent</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold text-gray-300">Agent: {user}</span>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="flex items-center gap-1.5 text-sm bg-red-950/40 text-red-400 px-3 py-1.5 rounded-lg border border-red-900/30 hover:bg-red-900/40 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {error ? (
          <div className="glass-panel p-8 rounded-2xl border border-red-500/20 text-center max-w-xl mx-auto space-y-4">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="text-lg font-bold text-white">Profile Missing</h3>
            <p className="text-sm text-gray-400">{error}</p>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="bg-red-900/30 text-red-400 border border-red-800/40 hover:bg-red-900/50 px-4 py-2 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <>
            {/* Status overview and details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Agent info */}
              <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 font-semibold uppercase">Vehicular Assignment</span>
                  <h3 className="text-xl font-bold text-white uppercase">{dashboardData?.vehicle_type || "BIKE"}</h3>
                  <p className="text-sm text-gray-400">Phone: {dashboardData?.phone}</p>
                </div>
                <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-sm">
                  <span className="text-gray-400">Active Zone:</span>
                  <span className="font-semibold text-blue-400">{dashboardData?.current_zone?.name || "None"}</span>
                </div>
              </div>

              {/* Status control */}
              <div className="glass-panel p-6 rounded-2xl border border-gray-800 md:col-span-2 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Duty Status</h3>
                  <p className="text-sm text-gray-400 mt-1">Set your availability. Busy status is set automatically when dispatches are in-progress.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">Current Status:</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                      dashboardData?.status === "AVAILABLE" 
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : dashboardData?.status === "BUSY"
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        : "bg-gray-500/10 text-gray-400 border-gray-550"
                    }`}>
                      {dashboardData?.status || "OFFLINE"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm text-gray-400 whitespace-nowrap">Change to:</span>
                    <select
                      disabled={updatingStatus}
                      value={dashboardData?.status || "OFFLINE"}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="py-1.5 px-3 glass-input bg-[#0b0f19] text-xs font-bold cursor-pointer w-full sm:w-auto"
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="BUSY">BUSY</option>
                      <option value="OFFLINE">OFFLINE</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignments Panel */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Assigned Shipments</h3>
                <button
                  onClick={fetchAgentData}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh List</span>
                </button>
              </div>

              {assignedOrders.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <Package className="mx-auto h-16 w-16 text-gray-750 mb-3" />
                  <p className="text-sm">No shipments currently assigned to you.</p>
                  <p className="text-xs text-gray-500 mt-1">Set your status to AVAILABLE to receive auto-assigned orders.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {assignedOrders.map((order) => {
                    const nextActionText = getTransitionButtonText(order.status);
                    return (
                      <div key={order.id} className="glass-card p-5 rounded-xl border border-gray-800/80 flex flex-col justify-between space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs text-gray-400 font-semibold font-mono">ORDER #{order.id}</span>
                            <span className="text-xs text-gray-500 block">{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs text-gray-300">
                          <div>
                            <strong className="text-gray-400">Pickup address:</strong>
                            <p className="text-gray-200 mt-0.5">{order.pickup_address}</p>
                          </div>
                          <div>
                            <strong className="text-gray-400">Drop address:</strong>
                            <p className="text-gray-200 mt-0.5">{order.drop_address}</p>
                          </div>
                          <div className="flex gap-4 pt-1">
                            <p><strong>Billable Wt:</strong> {order.billable_weight} kg</p>
                            <p><strong>Payment:</strong> {order.payment_type}</p>
                          </div>
                        </div>

                        {nextActionText && (
                          <div className="pt-2 border-t border-gray-800/40">
                            <button
                              onClick={() => handleTransition(order.id, order.status)}
                              className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              <span>{nextActionText}</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
