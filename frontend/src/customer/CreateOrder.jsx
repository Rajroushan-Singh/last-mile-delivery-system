import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zoneApi } from "../api/zoneApi";
import { orderApi } from "../api/orderApi";
import { useAuth } from "../auth/AuthContext";
import { Package, ArrowLeft, Loader2, LogOut, CheckCircle2, ShieldCheck } from "lucide-react";

const CreateOrder = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    pickup_zone: "",
    drop_zone: "",
    pickup_address: "",
    drop_address: "",
    length: "",
    breadth: "",
    height: "",
    actual_weight: "",
    order_type: "B2C",
    payment_type: "COD",
  });

  // Success state (holds created order data)
  const [successOrder, setSuccessOrder] = useState(null);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const data = await zoneApi.list();
        setZones(data);
        if (data.length > 0) {
          setFormData(prev => ({
            ...prev,
            pickup_zone: data[0].id.toString(),
            drop_zone: data.length > 1 ? data[1].id.toString() : data[0].id.toString(),
          }));
        }
      } catch (err) {
        setError("Failed to load delivery zones.");
      } finally {
        setLoadingZones(false);
      }
    };
    fetchZones();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      pickup_zone: parseInt(formData.pickup_zone),
      drop_zone: parseInt(formData.drop_zone),
      pickup_address: formData.pickup_address,
      drop_address: formData.drop_address,
      length: parseFloat(formData.length),
      breadth: parseFloat(formData.breadth),
      height: parseFloat(formData.height),
      actual_weight: parseFloat(formData.actual_weight),
      order_type: formData.order_type,
      payment_type: formData.payment_type,
    };

    try {
      const createdOrder = await orderApi.create(payload);
      setSuccessOrder(createdOrder);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.detail || "Failed to create order. Please try again.";
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (successOrder) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl glass-panel p-8 rounded-2xl shadow-2xl border border-blue-500/20 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-white">Order Confirmed!</h2>
            <p className="text-gray-400 mt-2">Your order has been booked successfully in the system.</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-left grid grid-cols-2 gap-4">
            <div className="col-span-2 border-b border-gray-800 pb-3 flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400 uppercase">Order ID</span>
              <span className="font-mono font-bold text-blue-400 text-lg">#{successOrder.id}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium">Delivery Charge</span>
              <p className="text-lg font-bold text-white">₹{successOrder.delivery_charge}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium">Status</span>
              <p className="text-sm font-semibold mt-1">
                {successOrder.status === "ASSIGNED" ? (
                  <span className="bg-green-500/15 text-green-400 px-2 py-0.5 rounded border border-green-500/20">
                    ASSIGNED
                  </span>
                ) : (
                  <span className="bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20">
                    {successOrder.status}
                  </span>
                )}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium">Billable Weight</span>
              <p className="text-sm font-semibold text-gray-200">{successOrder.billable_weight} kg</p>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium">Assigned Agent</span>
              <p className="text-sm font-semibold text-gray-200">
                {successOrder.assigned_agent ? `Agent #${successOrder.assigned_agent}` : "No available agents in pickup zone"}
              </p>
            </div>
            <div className="col-span-2 border-t border-gray-800 pt-3 text-xs text-gray-400">
              <p><strong>Pickup address:</strong> {successOrder.pickup_address}</p>
              <p className="mt-1"><strong>Drop address:</strong> {successOrder.drop_address}</p>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => navigate("/customer/dashboard")}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 py-3 rounded-lg font-semibold transition cursor-pointer"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate(`/customer/order-details/${successOrder.id}`)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition cursor-pointer"
            >
              Track Order
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Form Page */}
      <div className="max-w-3xl mx-auto px-6 mt-8">
        <Link to="/customer/dashboard" className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white transition mb-6">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="glass-panel p-8 rounded-2xl border border-gray-800 shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-bold">Book a Delivery</h2>
            <p className="text-sm text-gray-400">Fill in the dispatch details. Delivery charge is calculated based on active rate cards.</p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {loadingZones ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Zones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pickup Zone</label>
                  <select
                    name="pickup_zone"
                    value={formData.pickup_zone}
                    onChange={handleChange}
                    className="w-full mt-1.5 py-2.5 px-3 glass-input bg-[#0b0f19] text-sm cursor-pointer"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Drop Zone</label>
                  <select
                    name="drop_zone"
                    value={formData.drop_zone}
                    onChange={handleChange}
                    className="w-full mt-1.5 py-2.5 px-3 glass-input bg-[#0b0f19] text-sm cursor-pointer"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Addresses */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pickup Address</label>
                  <textarea
                    name="pickup_address"
                    required
                    rows={2}
                    value={formData.pickup_address}
                    onChange={handleChange}
                    className="w-full mt-1.5 py-2 px-3 glass-input text-sm"
                    placeholder="Enter full pickup location details..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Drop Address</label>
                  <textarea
                    name="drop_address"
                    required
                    rows={2}
                    value={formData.drop_address}
                    onChange={handleChange}
                    className="w-full mt-1.5 py-2 px-3 glass-input text-sm"
                    placeholder="Enter full delivery destination details..."
                  />
                </div>
              </div>

              {/* Package Dimensions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 border-b border-gray-800 pb-2 mb-4">Package Details & Dimensions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400">Length (cm)</label>
                    <input
                      type="number"
                      name="length"
                      required
                      min="0.1"
                      step="any"
                      value={formData.length}
                      onChange={handleChange}
                      className="w-full mt-1.5 py-2 px-3 glass-input text-sm"
                      placeholder="e.g. 20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400">Breadth (cm)</label>
                    <input
                      type="number"
                      name="breadth"
                      required
                      min="0.1"
                      step="any"
                      value={formData.breadth}
                      onChange={handleChange}
                      className="w-full mt-1.5 py-2 px-3 glass-input text-sm"
                      placeholder="e.g. 10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400">Height (cm)</label>
                    <input
                      type="number"
                      name="height"
                      required
                      min="0.1"
                      step="any"
                      value={formData.height}
                      onChange={handleChange}
                      className="w-full mt-1.5 py-2 px-3 glass-input text-sm"
                      placeholder="e.g. 5"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400">Actual Weight (kg)</label>
                    <input
                      type="number"
                      name="actual_weight"
                      required
                      min="0.01"
                      step="any"
                      value={formData.actual_weight}
                      onChange={handleChange}
                      className="w-full mt-1.5 py-2 px-3 glass-input text-sm"
                      placeholder="e.g. 3"
                    />
                  </div>
                </div>
              </div>

              {/* Order Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Order Type</label>
                  <select
                    name="order_type"
                    value={formData.order_type}
                    onChange={handleChange}
                    className="w-full mt-1.5 py-2.5 px-3 glass-input bg-[#0b0f19] text-sm cursor-pointer"
                  >
                    <option value="B2C">B2C (Business to Customer)</option>
                    <option value="B2B">B2B (Business to Business)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Type</label>
                  <select
                    name="payment_type"
                    value={formData.payment_type}
                    onChange={handleChange}
                    className="w-full mt-1.5 py-2.5 px-3 glass-input bg-[#0b0f19] text-sm cursor-pointer"
                  >
                    <option value="COD">Cash On Delivery (COD)</option>
                    <option value="PREPAID">Prepaid</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm transition cursor-pointer shadow-lg shadow-blue-600/15 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Booking order...</span>
                    </>
                  ) : (
                    <span>Confirm Order Booking</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;
