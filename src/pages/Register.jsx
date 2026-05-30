import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function Register() {
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
    fullname: "",
    province: "",
    provinceCode: "",
    municipality: "",
    municipalityCode: "",
    barangay: "",
    barangayCode: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  // ======================
  // SORT A-Z
  // ======================
  const sortAZ = (arr) =>
    [...arr].sort((a, b) => a.name.localeCompare(b.name));

  // ======================
  // LOAD PROVINCES
  // ======================
  useEffect(() => {
    fetch("https://psgc.gitlab.io/api/provinces/")
      .then((res) => res.json())
      .then((data) => setProvinces(sortAZ(data)))
      .catch(() => toast.error("Failed to load provinces"));
  }, []);

  // ======================
  // PROVINCE CHANGE
  // ======================
  const handleProvinceChange = async (e) => {
    const code = e.target.value;
    const selected = provinces.find((p) => p.code === code);

    setForm({
      ...form,
      province: selected?.name || "",
      provinceCode: code,
      municipality: "",
      municipalityCode: "",
      barangay: "",
      barangayCode: "",
    });

    setMunicipalities([]);
    setBarangays([]);

    if (!code) return;

    try {
      const res = await fetch(
        `https://psgc.gitlab.io/api/provinces/${code}/cities-municipalities/`
      );
      const data = await res.json();
      setMunicipalities(sortAZ(data));
    } catch {
      toast.error("Failed to load municipalities");
    }
  };

  // ======================
  // MUNICIPALITY CHANGE
  // ======================
  const handleMunicipalityChange = async (e) => {
    const code = e.target.value;
    const selected = municipalities.find((m) => m.code === code);

    setForm({
      ...form,
      municipality: selected?.name || "",
      municipalityCode: code,
      barangay: "",
      barangayCode: "",
    });

    setBarangays([]);

    if (!code) return;

    try {
      const res = await fetch(
        `https://psgc.gitlab.io/api/cities-municipalities/${code}/barangays/`
      );
      const data = await res.json();
      setBarangays(sortAZ(data));
    } catch {
      toast.error("Failed to load barangays");
    }
  };

  // ======================
  // INPUT CHANGE
  // ======================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ======================
  // REGISTER
  // ======================
  const handleRegister = async (e) => {
    e.preventDefault();

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
          barangay: form.barangay,
          username: form.username,
          phone: form.phone,
          password: form.password,
          password_confirmation: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          Object.values(data.errors).forEach((err) => {
            toast.error(err[0]);
          });
        } else {
          toast.error(data.message || "Registration failed");
        }
        return;
      }

      toast.success("Registration successful!");
      setTimeout(() => navigate("/login"), 1000);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // UI (UNCHANGED DESIGN)
  // ======================
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

              {/* PROVINCE */}
              <select
                className="form-control form-control-sm mb-2"
                value={form.provinceCode}
                onChange={handleProvinceChange}
                required
              >
                <option value="">Select Province</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* MUNICIPALITY */}
              <select
                className="form-control form-control-sm mb-2"
                value={form.municipalityCode}
                onChange={handleMunicipalityChange}
                disabled={!form.provinceCode}
                required
              >
                <option value="">
                  {form.provinceCode
                    ? "Select Municipality"
                    : "Select Province first"}
                </option>

                {municipalities.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.name}
                  </option>
                ))}
              </select>

              {/* BARANGAY */}
              <select
                className="form-control form-control-sm"
                value={form.barangayCode}
                onChange={(e) => {
                  const selected = barangays.find(
                    (b) => b.code === e.target.value
                  );

                  setForm({
                    ...form,
                    barangay: selected?.name || "",
                    barangayCode: e.target.value,
                  });
                }}
                disabled={!form.municipalityCode}
                required
              >
                <option value="">
                  {form.municipalityCode
                    ? "Select Barangay"
                    : "Select Municipality first"}
                </option>

                {barangays.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ACCOUNT */}
            <div className="mb-2 p-2 rounded" style={{ background: "#0e2f5c" }}>
              <input
                name="username"
                className="form-control form-control-sm mb-2"
                placeholder="Username"
                onChange={handleChange}
                required
              />

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
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="btn btn-outline-light btn-sm w-100"
            >
              Already have an account? Login
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}