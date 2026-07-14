import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { orderApi } from "../api/orderApi";
import { useAuth } from "../auth/AuthContext";
import { Package, ArrowLeft, Search, Filter, LogOut } from "lucide-react";

const MyOrders = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(search) ||
      order.drop_address.toLowerCase().includes(search.toLowerCase()) ||
      order.pickup_address.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;
      
    return matchesSearch && matchesStatus;
  });

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
          <Link to="/customer/my-orders" className="text-sm font-medium text-white border-b-2 border-blue-500 pb-1">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Link to="/customer/dashboard" className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white transition">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h2 className="text-2xl font-bold text-white hidden sm:block">My Order History</h2>
        </div>

        {/* Filter Controls */}
        <div className="glass-panel p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Search by Order ID or Address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 glass-input text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 glass-input bg-[#0b0f19] text-sm cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="CREATED">Created</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
        </div>

        {/* Table or Empty State */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-gray-400 bg-red-900/10 border border-red-500/20 rounded-xl">
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-24 glass-panel border-gray-800 rounded-2xl">
            <Package className="mx-auto h-16 w-16 text-gray-700 mb-4" />
            <p className="text-gray-400 text-lg font-medium">No shipments found</p>
            <p className="text-gray-500 text-sm mt-1">Try modifying your search query or filter settings.</p>
          </div>
        ) : (
          <div className="glass-panel border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/30 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Date Booked</th>
                    <th className="p-4">Delivery Route</th>
                    <th className="p-4">Charge</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="text-sm hover:bg-gray-800/10 transition">
                      <td className="p-4 font-mono font-bold text-gray-300">#{order.id}</td>
                      <td className="p-4 text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-200">
                            Zone {order.pickup_zone} → Zone {order.drop_zone}
                          </span>
                          <span className="text-xs text-gray-400 truncate max-w-[300px]">
                            {order.drop_address}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-white">₹{order.delivery_charge}</td>
                      <td className="p-4">
                        <span className="text-xs font-mono bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                          {order.payment_type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to={`/customer/order-details/${order.id}`}
                          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          Track Shipment
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
