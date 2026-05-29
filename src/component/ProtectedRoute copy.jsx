import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!user?.id || !token) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          "https://ajcpisonet.com/api/me/granted-status",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.data.granted) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setBlocked(true);
        }

      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setBlocked(true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [token, user?.id]);

  // ❌ not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ❌ revoked access
  if (blocked) {
    return <Navigate to="/accessdenied" replace />;
  }


  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ IMPORTANT: use Outlet (not children)
  return <Outlet />;
}