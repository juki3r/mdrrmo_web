import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AccessDenied() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // 🔥 safe redirect
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #07162d, #0b2347)",
        color: "white",
        padding: "20px",
      }}
    >
      <div
        className="card border-0 shadow-lg text-center"
        style={{
          maxWidth: "420px",
          width: "100%",
          backgroundColor: "#0b2347",
          borderRadius: "14px",
        }}
      >
        <div className="card-body p-5">

          {/* ICON */}
          <div className="mb-3">
            <div style={{ fontSize: "60px" }}>
              🚫
            </div>
          </div>

          {/* TITLE */}
          <h3 className="fw-bold mb-2 text-danger">
            Access Denied
          </h3>

          {/* MESSAGE */}
          <p className="text-light opacity-75 mb-4">
            You don’t have permission to access this page.
            <br />
            Please contact the administrator or login with a valid account.
          </p>

          {/* BUTTONS */}
          <button
            onClick={() => navigate("/login")}
            className="btn btn-info w-100 fw-semibold mb-2"
          >
            Go to Login
          </button>

          <button
            onClick={() => navigate("/")}
            className="btn btn-outline-light w-100"
          >
            Back to Home
          </button>

        </div>
      </div>
    </div>
  );
}