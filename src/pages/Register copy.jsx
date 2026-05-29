import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

const PH_DATA = {
  Iloilo: ["Carles", "Estancia", "Barotac Nuevo", "Pototan"],
  Cebu: ["Cebu City", "Mandaue", "Lapu-Lapu", "Carcar"],
  Manila: ["Tondo", "Ermita", "Binondo", "Malate"],
};

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullname: "",
    province: "",
    municipality: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [municipalities, setMunicipalities] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;

    setForm({
      ...form,
      province,
      municipality: "",
    });

    setMunicipalities(PH_DATA[province] || []);
  };

  // const handleRegister = async (e) => {
  //   e.preventDefault(); // 🔥 required for form submit
  //   console.log(form.username);
  // }

  const handleRegister = async (e) => {
    e.preventDefault(); // 🔥 required for form submit

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://ajcpisonet.com/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          fullname: form.fullname,
          province: form.province,
          municipality: form.municipality,
          username: form.username,
          phone: form.phone,
          password: form.password,
          password_confirmation: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          Object.values(data.errors).forEach((errArray) => {
            toast.error(errArray[0]);
          });
        } else {
          toast.error(data.message || "Registration failed");
        }
        return;
      }

      toast.success("Registration successful!\nPlease Login to continue!");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      
      // navigate("/login"); // optional

    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center w-100"
      style={{
        height: "100vh",
        backgroundColor: "#07162d",
        overflow: "hidden",
      }}
    >
      <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 px-3">

        {/* 🔥 FORM WRAPPER */}
        <form
          onSubmit={handleRegister}
          className="card border-0 shadow-lg"
          style={{
            backgroundColor: "#0b2347",
            color: "white",
            borderRadius: "12px",
          }}
        >
          <div className="card-body p-3">

            {/* HEADER */}
            <div className="text-center mb-2">
              <p className="text-uppercase small text-info mb-0">
                MDRRMO Secure Registration
              </p>
              <h5 className="fw-bold mb-0">Create Account</h5>
            </div>

            {/* PERSONAL */}
            <div className="mb-2 p-2 rounded" style={{ background: "#0e2f5c" }}>
              <h6 className="text-info small mb-2">👤 Personal Info</h6>

              <div className="row g-2">
                <div className="col-7">
                  <input
                    name="fullname"
                    className="form-control form-control-sm"
                    placeholder="Full Name"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-5">
                  <input
                    name="phone"
                    className="form-control form-control-sm"
                    placeholder="Phone Number"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* LOCATION */}
            <div className="mb-2 p-2 rounded" style={{ background: "#0e2f5c" }}>
              <h6 className="text-info small mb-2">📍 Location</h6>

              <div className="row g-2">
                <div className="col-6">
                  <select
                    name="province"
                    className="form-control form-control-sm"
                    value={form.province}
                    onChange={handleProvinceChange}
                    required
                  >
                    <option value="">Province</option>
                    {Object.keys(PH_DATA).map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-6">
                  <select
                    name="municipality"
                    className="form-control form-control-sm"
                    value={form.municipality}
                    onChange={handleChange}
                    disabled={!form.province}
                    required
                  >
                    <option value="">Municipality</option>
                    {municipalities.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ACCOUNT */}
            <div className="mb-3 p-2 rounded" style={{ background: "#0e2f5c" }}>
              <h6 className="text-info small mb-2">🔐 Account Info</h6>

              <div className="row g-2 mb-2">
                <div className="col-12">
                  <input
                    name="username"
                    className="form-control form-control-sm"
                    placeholder="Username"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <input
                    type="password"
                    name="password"
                    className="form-control form-control-sm"
                    placeholder="Password"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-6">
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control form-control-sm"
                    placeholder="Confirm Password"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-info btn-sm w-100 fw-semibold py-2 mb-2"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            {/* LOGIN */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="btn btn-outline-light btn-sm w-100"
              >
                Already have an account? Login
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}