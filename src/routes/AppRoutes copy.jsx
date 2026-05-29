import { Routes, Route, Navigate } from "react-router-dom";

import Welcome from "../pages/Welcome";
import Login from "../pages/Login";
import Register from "../pages/Register";
import OTP from "../pages/OTP";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "../component/ProtectedRoute";
import AccessDenied from "../pages/AccessDenied";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/welcome" />} />

      {/* public routes */}
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/otp" element={<OTP />} />
      <Route path="/accessdenied" element={<AccessDenied />} />

      {/* protected route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}