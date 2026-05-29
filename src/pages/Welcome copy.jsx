import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="container-fluid min-vh-100 p-0"
      style={{ backgroundColor: "#07162d" }}
    >

      <div className="row g-0 min-vh-100">

        {/* LEFT PANEL */}
        <div
          className="
            col-12 col-lg-7
            d-flex align-items-center
            px-4 px-md-5 py-5
            text-white
          "
        >
          <div className="w-100">

            {/* HEADER */}
            <p className="text-uppercase small text-info mb-2">
              Republic of the Philippines • LGU System
            </p>

            <h1 className="fw-bold"
              style={{
                fontSize: "clamp(1.8rem, 3vw, 3rem)",
                lineHeight: 1.2
              }}
            >
              Municipal Disaster Risk<br />
              Reduction & Management Office
            </h1>

            <p className="text-light opacity-75 mt-3"
              style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.2rem)" }}
            >
              A centralized command system for disaster monitoring,
              emergency response coordination, and barangay-level risk management.
            </p>

            {/* FEATURES */}
            <div className="mt-4 small">

              <div className="d-flex gap-2 mb-2">
                <span>⚠️</span>
                <span>Real-time hazard monitoring and alerts</span>
              </div>

              <div className="d-flex gap-2 mb-2">
                <span>🗺️</span>
                <span>GIS mapping for barangay risk zones</span>
              </div>

              <div className="d-flex gap-2 mb-2">
                <span>📊</span>
                <span>Disaster reporting and analytics dashboard</span>
              </div>

              <div className="d-flex gap-2">
                <span>🚨</span>
                <span>Emergency response coordination system</span>
              </div>

            </div>

            {/* BUTTONS */}
            <div className="
              mt-4 mt-md-5
              d-flex flex-column flex-sm-row
              gap-2 gap-sm-3
            ">

              <button
                onClick={() => navigate("/login")}
                className="btn btn-info fw-semibold px-4 py-2 w-100 w-sm-auto"
              >
                Access System
              </button>

              <button
                onClick={() => navigate("/register")}
                className="btn btn-outline-light px-4 py-2 w-100 w-sm-auto"
              >
                Create Account
              </button>

            </div>

            <p className="text-light small mt-3 opacity-50">
              Secure government infrastructure • Authorized personnel only
            </p>

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          className="
            col-12 col-lg-5
            d-flex align-items-center
            px-4 px-md-5 py-5
          "
          style={{ backgroundColor: "#0b2347" }}
        >
          <div className="text-white w-100">

            <h4 className="fw-bold text-info">
              Disaster Command System
            </h4>

            <p className="opacity-75 small">
              Supporting LGUs in building resilient communities through
              data-driven disaster risk reduction.
            </p>

            <hr className="border-light opacity-25 my-3" />

            <div className="small">

              <div className="mb-2">✔ Active Monitoring System</div>
              <div className="mb-2">✔ Municipal Integration Ready</div>
              <div className="mb-2">✔ Role-Based Access Control</div>
              <div>✔ Secure Data Management</div>

            </div>

            <div className="mt-4 small text-info">
              MDRRMO SaaS Platform v1.0 - PONG-MTA Technology
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}