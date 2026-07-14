import React, { createContext, useState, useEffect, useContext } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const username = localStorage.getItem("username");
    const userRole = localStorage.getItem("role");
    const token = localStorage.getItem("access_token");

    if (username && userRole && token) {
      setUser(username);
      setRole(userRole);
    }
    setLoading(false);
  }, []);

  // Listen for session expiry from axios interceptor
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setRole(null);
    };

    window.addEventListener("auth_session_expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth_session_expired", handleSessionExpired);
    };
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await authApi.login({ username, password });
      if (data.success && data.access) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);
        localStorage.setItem("user_id", data.user_id);
        
        setUser(data.username);
        setRole(data.role);
        setLoading(false);
        return { success: true, role: data.role };
      }
      setLoading(false);
      return { success: false, error: "Invalid response from server" };
    } catch (error) {
      setLoading(false);
      const message = error.response?.data || { non_field_errors: ["Login failed"] };
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authApi.register(userData);
      setLoading(false);
      return { success: true, message: data.message };
    } catch (error) {
      setLoading(false);
      const message = error.response?.data || { non_field_errors: ["Registration failed"] };
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
