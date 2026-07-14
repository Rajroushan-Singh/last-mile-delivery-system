import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { agentApi } from "../api/agentApi";
import { zoneApi } from "../api/zoneApi";
import { areaApi } from "../api/areaApi";
import { ratecardApi } from "../api/ratecardApi";
import { orderApi } from "../api/orderApi";
import { useAuth } from "../auth/AuthContext";
import { Shield, Users, MapPin, Globe, CreditCard, Package, LogOut } from "lucide-react";

export const AdminNavbar = ({ activeTab }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="w-full md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between p-6">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Admin Console</h1>
            <span className="text-xs text-blue-400 font-semibold tracking-wider uppercase">Operations</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <Link
            to="/admin/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
              activeTab === "dashboard" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-850 hover:text-white"
            }`}
          >
            <Package className="h-4.5 w-4.5" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/agents"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
              activeTab === "agents" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-850 hover:text-white"
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            <span>Delivery Agents</span>
          </Link>
          <Link
            to="/admin/zones"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
              activeTab === "zones" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-850 hover:text-white"
            }`}
          >
            <Globe className="h-4.5 w-4.5" />
            <span>Zones</span>
          </Link>
          <Link
            to="/admin/areas"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
              activeTab === "areas" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-850 hover:text-white"
            }`}
          >
            <MapPin className="h-4.5 w-4.5" />
            <span>Areas</span>
          </Link>
          <Link
            to="/admin/rate-cards"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
              activeTab === "ratecards" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-850 hover:text-white"
            }`}
          >
            <CreditCard className="h-4.5 w-4.5" />
            <span>Rate Cards</span>
          </Link>
        </nav>
      </div>

      <div className="pt-6 border-t border-gray-800 space-y-4">
        <div className="text-sm font-medium text-gray-300">
          Admin: <span className="font-bold text-white">{user}</span>
        </div>
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="w-full flex items-center justify-center gap-1.5 text-sm bg-red-950/40 text-red-400 px-3 py-2.5 rounded-lg border border-red-900/30 hover:bg-red-900/40 transition cursor-pointer font-bold"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    agents: 0,
    zones: 0,
    areas: 0,
    ratecards: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [agents, zones, areas, ratecards, orders] = await Promise.all([
          agentApi.list(),
          zoneApi.list(),
          areaApi.list(),
          ratecardApi.list(),
          orderApi.list(),
        ]);
        setStats({
          agents: agents.length,
          zones: zones.length,
          areas: areas.length,
          ratecards: ratecards.length,
          orders: orders.length,
        });
      } catch (err) {
        console.error("Failed to load statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col md:flex-row">
      <AdminNavbar activeTab="dashboard" />

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white">System Overview</h2>
          <p className="text-gray-400 mt-1">Real-time statistics across last-mile delivery components.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl flex items-center gap-5 border border-gray-800">
              <div className="p-4 bg-blue-500/10 text-blue-400 rounded-xl">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Active Agents</span>
                <h3 className="text-3xl font-black mt-1 text-white">{stats.agents}</h3>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center gap-5 border border-gray-800">
              <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Globe className="h-7 w-7" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Operational Zones</span>
                <h3 className="text-3xl font-black mt-1 text-white">{stats.zones}</h3>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center gap-5 border border-gray-800">
              <div className="p-4 bg-purple-500/10 text-purple-400 rounded-xl">
                <MapPin className="h-7 w-7" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Pincode Areas</span>
                <h3 className="text-3xl font-black mt-1 text-white">{stats.areas}</h3>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center gap-5 border border-gray-800">
              <div className="p-4 bg-amber-500/10 text-amber-400 rounded-xl">
                <CreditCard className="h-7 w-7" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Rate Cards</span>
                <h3 className="text-3xl font-black mt-1 text-white">{stats.ratecards}</h3>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex items-center gap-5 border border-gray-800 sm:col-span-2 lg:col-span-1">
              <div className="p-4 bg-rose-500/10 text-rose-400 rounded-xl">
                <Package className="h-7 w-7" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Total Orders</span>
                <h3 className="text-3xl font-black mt-1 text-white">{stats.orders}</h3>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
