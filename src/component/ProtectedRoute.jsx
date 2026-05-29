import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { generateToken, messaging  } from '../notifications/firebase'
import { onMessage } from "firebase/messaging";

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [blocked, setBlocked] = useState(false);

   // 🔥 Firebase init (MUST be here)
  useEffect(() => {
    const init = async () => {
      await generateToken();
    };

    init();

    const unsubscribe = onMessage(messaging, (payload) => {
      // console.log("Foreground:", payload);
      new Notification(payload.data?.title || "Notification", {
        body: payload.data?.body || "",
        icon: "/drr.png",
      });
    });

    return () => unsubscribe?.();
  }, []);

  // 🔒 check backend revoke status
  useEffect(() => {
    if (!user?.id || !token) return;

    const checkStatus = async () => {
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
    };

    checkStatus(); // run immediately

    const interval = setInterval(checkStatus, 10000);

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

  // ❌ role check (SAFE FIX)
  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }



  // ✅ allow access
  return <Outlet />;
}