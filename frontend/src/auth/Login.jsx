import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Shield, Lock, User, ArrowRight } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      if (result.role === "CUSTOMER") navigate("/customer/dashboard");
      else if (result.role === "DELIVERY_AGENT") navigate("/agent/dashboard");
      else if (result.role === "ADMIN") navigate("/admin/dashboard");
      else navigate("/");
    } else {
      if (typeof result.error === "object") {
        const text = result.error.non_field_errors?.[0] || result.error.detail || "Invalid username or password.";
        setError(text);
      } else {
        setError(result.error || "An error occurred.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 text-blue-500">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Last-Mile Delivery
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to manage your shipments and dispatches
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Username
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 glass-input text-white text-sm"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 glass-input text-white text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Sign In
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ArrowRight className="h-5 w-5 text-blue-300 group-hover:translate-x-1 transition-transform" />
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-blue-500 hover:text-blue-400 transition">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
