import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Shield, Lock, User, Mail, Phone, Tag, ArrowRight } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    phone_number: "",
    role: "CUSTOMER",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear errors for this field
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    if (formData.password !== formData.confirm_password) {
      setFieldErrors({ confirm_password: ["Passwords do not match."] });
      return;
    }

    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      navigate("/login", { state: { registered: true } });
    } else {
      if (typeof result.error === "object") {
        setFieldErrors(result.error);
        if (result.error.non_field_errors) {
          setGeneralError(result.error.non_field_errors[0]);
        }
      } else {
        setGeneralError(result.error || "An error occurred during registration.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 glass-panel p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 text-blue-500">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Register to join the Last-Mile Delivery system
          </p>
        </div>

        {generalError && (
          <div className="rounded-lg bg-red-900/30 border border-red-500/30 p-4 text-sm text-red-400">
            {generalError}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Username */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Username
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 glass-input text-white text-sm"
                  placeholder="john"
                />
              </div>
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.username[0]}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Email
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 glass-input text-white text-sm"
                  placeholder="john@gmail.com"
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.email[0]}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="phone_number"
                  required
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 glass-input text-white text-sm"
                  placeholder="9876543210"
                />
              </div>
              {fieldErrors.phone_number && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.phone_number[0]}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Role
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Tag className="h-4 w-4" />
                </span>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 glass-input text-white text-sm bg-[#0b0f19] cursor-pointer"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="DELIVERY_AGENT">Delivery Agent</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {fieldErrors.role && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.role[0]}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 glass-input text-white text-sm"
                  placeholder="••••••••"
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.password[0]}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  name="confirm_password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 glass-input text-white text-sm"
                  placeholder="••••••••"
                />
              </div>
              {fieldErrors.confirm_password && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.confirm_password[0]}</p>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Register
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
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-500 hover:text-blue-400 transition">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
