import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

export default function OTP() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [seconds, setSeconds] = useState(120);

  const navigate = useNavigate();
  const location = useLocation();

  const phone = location.state?.phone;

  // ----------------------------
  // TIMER
  // ----------------------------
  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  // ----------------------------
  // VERIFY OTP
  // ----------------------------
  const verifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://ajcpisonet.com/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          phone,
          otp,
        }),
      });

      const data = await response.json();

      const status = data.status || data.data?.status;

      // 🔥 1. APPROVAL CHECK FIRST
      if (status === "approval_needed") {
        toast.error(data.message || "Account needs admin approval");

        localStorage.setItem(
          "user",
          JSON.stringify(data.user || data.data?.user)
        );

        navigate("/accessdenied");

        return;
      }

      // 🔥 2. INVALID RESPONSE
      if (!response.ok) {
        toast.error(data.message || "Invalid OTP");
        return;
      }

      // 🔥 3. SUCCESS
      toast.success("OTP verified successfully!");

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user || data.data?.user)
      );

      navigate("/dashboard");


    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // RESEND OTP
  // ----------------------------
  const resendOtp = async () => {
    setResendLoading(true);

    try {
      const response = await fetch("https://ajcpisonet.com/api/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to resend OTP");
        return;
      }

      toast.success("OTP resent successfully!");

      // reset timer
      setSeconds(120);

    } catch (error) {
      toast.error("Network error");
    } finally {
      setResendLoading(false);
    }
  };

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #07162d, #0b2347)",
        padding: "20px",
      }}
    >
      <div
        className="card shadow-lg border-0"
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#0b2347",
          color: "white",
          borderRadius: "14px",
        }}
      >
        <div className="card-body p-4 text-center">

          {/* HEADER */}
          <h3 className="fw-bold mb-2">OTP Verification</h3>
          <p className="text-light opacity-75 small mb-3">
            Enter the code sent to your phone
          </p>

          {/* PHONE */}
          <div className="mb-3">
            <span className="badge bg-info text-dark">
              {phone}
            </span>
          </div>

          {/* OTP INPUT */}
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            className="form-control text-center fw-bold mb-3"
            style={{
              letterSpacing: "8px",
              fontSize: "20px",
            }}
          />

          {/* VERIFY BUTTON */}
          <button
            onClick={verifyOtp}
            disabled={loading}
            className="btn btn-success w-100 fw-semibold py-2 mb-3"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          {/* TIMER */}
          <p className="small text-light opacity-75 mb-2">
            {seconds > 0
              ? `Resend OTP in ${seconds}s`
              : "Didn't receive OTP?"}
          </p>

          {/* RESEND BUTTON */}
          <button
            onClick={resendOtp}
            disabled={seconds > 0 || resendLoading}
            className="btn btn-outline-info w-100"
          >
            {resendLoading
              ? "Sending..."
              : seconds > 0
              ? "Resend Disabled"
              : "Resend OTP"}
          </button>

          {/* BACK */}
          <button
            onClick={() => navigate("/login")}
            className="btn btn-link text-light mt-3"
          >
            Back to Login
          </button>

        </div>
      </div>
    </div>
  );
}