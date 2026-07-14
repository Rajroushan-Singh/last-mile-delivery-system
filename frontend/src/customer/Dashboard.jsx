import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { orderApi } from "../api/orderApi";
import { useAuth } from "../auth/AuthContext";
import { PlusCircle, Package, CheckCircle2, AlertCircle, TrendingUp, LogOut } from "lucide-react";

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderApi.list();
        setOrders(data);
      } catch (err) {
        setError("Failed to fetch order history.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => ["CREATED", "ASSIGNED"].includes(o.status)).length,
    inTransit: orders.filter(o => ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(o.status)).length,
    delivered: orders.filter(o => o.status === "DELIVERED").length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED": return "bg-green-500/25 text-green-400 border-green-500/30";
      case "PICKED_UP":
      case "IN_TRANSIT":
      case "OUT_FOR_DELIVERY": return "bg-blue-500/25 text-blue-400 border-blue-500/30";
      case "ASSIGNED": return "bg-indigo-500/25 text-indigo-400 border-indigo-500/30";
      case "CREATED": return "bg-yellow-500/25 text-yellow-400 border-yellow-500/30";
      default: return "bg-gray-500/25 text-gray-400 border-gray-500/30";
    }
  };

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
          <Link to="/customer/dashboard" className="text-sm font-medium text-white border-b-2 border-blue-500 pb-1">
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* Banner Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-[#0b0f19] border border-blue-500/20 p-6 rounded-2xl">
          <div>
            <h2 className="text-2xl font-bold">Manage Your Deliveries</h2>
            <p className="text-sm text-gray-400 mt-1">Book new parcel dispatches or track existing dispatches in real time.</p>
          </div>
          <Link
            to="/customer/create-order"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-semibold transition cursor-pointer shadow-lg shadow-blue-600/15 w-fit"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Create New Order</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium">Total Shipments</span>
              <h3 className="text-2xl font-bold mt-0.5">{stats.total}</h3>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-lg">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium">Pending/Assigned</span>
              <h3 className="text-2xl font-bold mt-0.5">{stats.pending}</h3>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium">In Transit</span>
              <h3 className="text-2xl font-bold mt-0.5">{stats.inTransit}</h3>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-green-500/10 text-green-400 rounded-lg">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium">Successfully Delivered</span>
              <h3 className="text-2xl font-bold mt-0.5">{stats.delivered}</h3>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Recent Orders</h3>
            <Link to="/customer/my-orders" className="text-sm font-semibold text-blue-500 hover:text-blue-400 transition">
              View All Orders →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-gray-400">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="mx-auto h-12 w-12 text-gray-600 mb-3" />
              <p className="text-sm">You haven't placed any orders yet.</p>
              <Link to="/customer/create-order" className="mt-4 inline-block text-sm font-semibold text-blue-500 hover:underline">
                Create your first order now
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Delivery Path</th>
                    <th className="pb-3">Charge</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="text-sm group hover:bg-gray-800/10">
                      <td className="py-4 font-mono font-semibold text-gray-300">#{order.id}</td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-200">
                            Zone {order.pickup_zone} → Zone {order.drop_zone}
                          </span>
                          <span className="text-xs text-gray-400 truncate max-w-[240px]">
                            {order.drop_address}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 font-semibold text-white">₹{order.delivery_charge}</td>
                      <td className="py-4">
                        <span className="text-xs font-mono bg-gray-800 text-gray-300 px-2 py-1 rounded">
                          {order.payment_type}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Link
                          to={`/customer/order-details/${order.id}`}
                          className="inline-flex items-center justify-center bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
                        >
                          Track Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
