import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Authentication
import Login from "./auth/Login";
import Register from "./auth/Register";

// Customer
import CustomerDashboard from "./customer/Dashboard";
import CreateOrder from "./customer/CreateOrder";
import MyOrders from "./customer/MyOrders";
import OrderDetails from "./customer/OrderDetails";

// Agent
import AgentDashboard from "./agent/Dashboard";
import AssignedOrders from "./agent/AssignedOrders";
import UpdateStatus from "./agent/UpdateStatus";

// Admin
import AdminDashboard from "./admin/Dashboard";
import Agents from "./admin/Agents";
import Zones from "./admin/Zones";
import Areas from "./admin/Areas";
import RateCards from "./admin/RateCards";

import "./App.css";

const RootRedirect = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0f19]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === "CUSTOMER") return <Navigate to="/customer/dashboard" replace />;
  if (role === "DELIVERY_AGENT") return <Navigate to="/agent/dashboard" replace />;
  if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/create-order"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <CreateOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/my-orders"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/order-details/:id"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <OrderDetails />
              </ProtectedRoute>
            }
          />

          {/* Agent Routes */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute allowedRoles={["DELIVERY_AGENT"]}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/assigned-orders"
            element={
              <ProtectedRoute allowedRoles={["DELIVERY_AGENT"]}>
                <AssignedOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/update-status"
            element={
              <ProtectedRoute allowedRoles={["DELIVERY_AGENT"]}>
                <UpdateStatus />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agents"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Agents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/zones"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Zones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/areas"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Areas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rate-cards"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <RateCards />
              </ProtectedRoute>
            }
          />

          {/* Default Root Redirect */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
