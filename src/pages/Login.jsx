import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");


  const check_creds = () => {
    if(token && user){
      navigate("/dashboard")
    }else{
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }
  }

  useEffect(()=>{
    check_creds();
  });

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // 🔥 required for form submit

    setLoading(true);

    try {
      const response = await fetch("https://ajcpisonet.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      const status = data.status || data.data?.status;

      if (status === "approval_needed") {
        toast.error(data.message || "Account needs admin approval");

        localStorage.setItem("user", JSON.stringify(data.user || data.data?.user));

        navigate("/accessdenied");

        return;
      }

      // 🔥 2. OTP FLOW
      if (data.status === "otp_required") {
        toast.info(
          <div>
            OTP sent to your phone.<br />
            Redirecting...
          </div>
        );

        navigate("/otp", {
          state: {
            phone: data.phone,
          },
        });

        return;
      }

      // 🔥 3. VALIDATION / ERROR RESPONSE
      if (!response.ok) {
        if (data.errors) {
          Object.values(data.errors).forEach((errArray) => {
            toast.error(errArray[0]);
          });
        } else {
          toast.error(data.message || "Login failed");
        }
        return;
      }

      // 🔥 4. SUCCESS ONLY HERE
      toast.success(
        <div>
          Login successful!<br />
          Welcome back, {data.user.fullname}
        </div>
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");

    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center px-3"
      style={{ backgroundColor: "#07162d" }}
    >
      <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">

        {/* 🔥 FORM WRAPPER */}
        <form
          onSubmit={handleLogin}
          className="card border-0 shadow-lg"
          style={{ backgroundColor: "#0b2347", color: "white" }}
        >
          <div className="card-body p-4 p-md-5">

            {/* HEADER */}
            <div className="text-center mb-4">
              <p className="text-uppercase small text-info mb-1">
                MDRRMO Secure Access
              </p>
              <h3 className="fw-bold mb-2">System Login</h3>
              <p className="text-light small opacity-75">
                Municipal Disaster Risk Reduction & Management Office
              </p>
            </div>

            {/* USERNAME */}
            <label className="form-label small">Username</label>
            <input
              type="text"
              name="username"
              className="form-control mb-3"
              placeholder="Enter username"
              value={form.username}
              onChange={handleChange}
              required
            />

            {/* PASSWORD */}
            <label className="form-label small">Password</label>
            <input
              type="password"
              name="password"
              className="form-control mb-4"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
            />

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-info w-100 fw-semibold py-2"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* FOOTER */}
            <div className="text-center mt-4">
              <small className="text-light opacity-50 d-block mb-2">
                Authorized personnel only
              </small>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="btn btn-outline-light btn-sm"
              >
                Create Account
              </button>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}