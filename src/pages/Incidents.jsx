import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [showModal, setShowModal] = useState(false);

  const [mode, setMode] = useState("create");

  const token = localStorage.getItem("token");

  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    id: null,
    incident_no: "",
    incident_type: "",
    category: "",
    description: "",
    location: "",
    reported_by: "",
    contact_number: "",
    incident_date: "",
    incident_time: "",
    status: "pending",
    action_taken: "",
  });

  // ================= FETCH =================
  const fetchIncidents = async (
    pageNum = 1,
    searchTerm = ""
  ) => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/incidents?page=${pageNum}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      setIncidents(data.data || []);
      setPage(data.current_page || 1);
      setLastPage(data.last_page || 1);

    } catch {
      toast.error("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents(1, "");
  }, []);

  // ================= CHANGE =================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ================= RESET =================
  const resetForm = () => {
    setForm({
      id: null,
      incident_no: "",
      incident_type: "",
      category: "",
      description: "",
      location: "",
      reported_by: "",
      contact_number: "",
      incident_date: "",
      incident_time: "",
      status: "pending",
      action_taken: "",
    });
  };

  // ================= CREATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "https://ajcpisonet.com/api/incidents",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed");
        return;
      }

      toast.success("Incident created");

      setShowModal(false);

      resetForm();

      fetchIncidents(page, search);

    } catch {
      toast.error("Server error");
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/incidents/${form.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Update failed");
        return;
      }

      toast.success("Incident updated");

      setShowModal(false);

      resetForm();

      fetchIncidents(page, search);

    } catch {
      toast.error("Server error");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this incident?")) return;

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/incidents/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) {
        toast.error("Delete failed");
        return;
      }

      toast.success("Incident deleted");

      fetchIncidents(page, search);

    } catch {
      toast.error("Server error");
    }
  };

  // ================= PAGINATION =================
  const getPages = () => {
    const delta = 2;

    const range = [];
    const rangeWithDots = [];

    let l;

    for (let i = 1; i <= lastPage; i++) {
      if (
        i === 1 ||
        i === lastPage ||
        (i >= page - delta && i <= page + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }

      rangeWithDots.push(i);

      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">

        {/* SEARCH */}
        <div
          className="position-relative"
          style={{ width: "350px" }}
        >
          <i
            className="bi bi-search position-absolute"
            style={{
              top: "50%",
              left: "14px",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              zIndex: 2,
            }}
          />

          <input
            type="text"
            className="form-control border-0 shadow-sm"
            placeholder="Search incidents..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;

              setSearch(value);

              fetchIncidents(1, value);
            }}
            style={{
              height: "46px",
              borderRadius: "14px",
              background: "#f8fafc",
              paddingLeft: "42px",
              paddingRight: "42px",
            }}
          />

          {search && (
            <button
              type="button"
              className="btn p-0 border-0 position-absolute"
              onClick={() => {
                setSearch("");
                fetchIncidents(1, "");
              }}
              style={{
                top: "50%",
                right: "14px",
                transform: "translateY(-50%)",
                background: "transparent",
              }}
            >
              <i className="bi bi-x-circle-fill text-secondary"></i>
            </button>
          )}
        </div>

        {/* ADD */}
        <button
          className="btn btn-primary d-flex align-items-center gap-2 px-3"
          onClick={() => {
            resetForm();

            setMode("create");

            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-lg"></i>
          Add Incident
        </button>

      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm rounded-4">

        <div className="card-body">

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="table-responsive">

                <table className="table align-middle table-hover">

                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Incident No</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {incidents.length > 0 ? (
                      incidents.map((i, index) => (
                        <tr key={i.id}>

                          <td>
                            {(page - 1) * 10 + index + 1}
                          </td>

                          <td className="fw-semibold">
                            {i.incident_no}
                          </td>

                          <td>{i.incident_type}</td>

                          <td>{i.location || "-"}</td>

                          <td>{i.incident_date}</td>

                          <td>
                            <span
                              className={`badge rounded-pill px-3 py-2 ${
                                i.status === "resolved"
                                  ? "bg-success-subtle text-success"
                                  : i.status === "ongoing"
                                  ? "bg-primary-subtle text-primary"
                                  : i.status === "dismissed"
                                  ? "bg-danger-subtle text-danger"
                                  : "bg-warning-subtle text-warning"
                              }`}
                            >
                              {i.status}
                            </span>
                          </td>

                          <td>

                            <div className="d-flex gap-2 justify-content-end">

                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  setForm(i);

                                  setMode("view");

                                  setShowModal(true);
                                }}
                              >
                                View
                              </button>

                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(i.id)}
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center py-5"
                        >
                          No incidents found
                        </td>
                      </tr>
                    )}

                  </tbody>

                </table>

              </div>

              {/* PAGINATION */}
              <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap">

                <button
                  className="btn btn-light border rounded-pill px-3"
                  disabled={page === 1}
                  onClick={() => fetchIncidents(page - 1, search)}
                >
                  ← Prev
                </button>

                {getPages().map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={idx}
                      className="px-2 text-muted"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={idx}
                      className={`btn rounded-circle d-flex align-items-center justify-content-center ${
                        p === page
                          ? "btn-primary shadow-sm"
                          : "btn-light border"
                      }`}
                      onClick={() => fetchIncidents(p, search)}
                      style={{
                        width: "42px",
                        height: "42px",
                        padding: 0,
                      }}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  className="btn btn-light border rounded-pill px-3"
                  disabled={page === lastPage}
                  onClick={() => fetchIncidents(page + 1, search)}
                >
                  Next →
                </button>

              </div>
            </>
          )}

        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className="modal d-block"
          style={{
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">

              {/* HEADER */}
              <div className="modal-header border-0">
                <div>
                  <h5 className="fw-bold mb-0">
                    {mode === "create"
                      ? "➕ Create Incident"
                      : mode === "view"
                      ? "📄 Incident Details"
                      : "✏️ Edit Incident"}
                  </h5>
                  <small className="text-muted">
                    Incident Management Record
                  </small>
                </div>

                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">

                {/* INCIDENT NO */}
                {form.incident_no && (
                  <div className="alert alert-light border d-flex justify-content-between">
                    <span className="fw-semibold">Incident No:</span>
                    <span className="fw-bold text-primary">
                      {form.incident_no}
                    </span>
                  </div>
                )}

                {/* ================= BASIC INFO ================= */}
                <div className="mb-3">
                  <h6 className="text-primary fw-bold">📌 Basic Information</h6>

                  <div className="row g-3 mt-1">

                    {/* INCIDENT TYPE */}
                    <div className="col-md-6">
                      <label className="form-label">
                        Incident Type <span className="text-danger">*</span>
                      </label>

                      <select
                        className="form-select"
                        name="incident_type"
                        value={form.incident_type}
                        disabled={mode === "view"}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Incident Type</option>
                        <option value="Theft">Theft</option>
                        <option value="Assault">Assault</option>
                        <option value="Domestic Violence">Domestic Violence</option>
                        <option value="Dispute">Dispute / Altercation</option>
                        <option value="Vandalism">Vandalism</option>
                        <option value="Accident">Accident</option>
                        <option value="Fire Incident">Fire Incident</option>
                        <option value="Missing Person">Missing Person</option>
                        <option value="Drugs Related">Drugs Related</option>
                        <option value="Noise Complaint">Noise Complaint</option>
                        <option value="Trespassing">Trespassing</option>
                        <option value="Public Disturbance">Public Disturbance</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>

                    {/* CATEGORY */}
                    <div className="col-md-6">
                      <label className="form-label">Category</label>

                      <select
                        className="form-select"
                        name="category"
                        value={form.category}
                        disabled={mode === "view"}
                        onChange={handleChange}
                      >
                        <option value="">Select Category</option>
                        <option value="Crime">Crime</option>
                        <option value="Accident">Accident</option>
                        <option value="Disturbance">Public Disturbance</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>

                    {/* LOCATION */}
                    <div className="col-12">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        name="location"
                        value={form.location}
                        disabled={mode === "view"}
                        onChange={handleChange}
                        placeholder="Purok / Street / Landmark"
                      />
                    </div>

                  </div>
                </div>

                {/* ================= REPORT INFO ================= */}
                <div className="mb-3">
                  <h6 className="text-primary fw-bold">👤 Report Information</h6>

                  <div className="row g-3 mt-1">

                    <div className="col-md-6">
                      <label className="form-label">
                        Reported By <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="reported_by"
                        value={form.reported_by}
                        disabled={mode === "view"}
                        onChange={handleChange}
                        placeholder="Full Name"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Contact Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="contact_number"
                        value={form.contact_number}
                        disabled={mode === "view"}
                        onChange={handleChange}
                        placeholder="09xxxxxxxxx"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Incident Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="incident_date"
                        value={form.incident_date}
                        disabled={mode === "view"}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Incident Time</label>
                      <input
                        type="time"
                        className="form-control"
                        name="incident_time"
                        value={form.incident_time}
                        disabled={mode === "view"}
                        onChange={handleChange}
                      />
                    </div>

                  </div>
                </div>

                {/* ================= DESCRIPTION ================= */}
                <div className="mb-3">
                  <h6 className="text-primary fw-bold">📝 Description</h6>

                  <textarea
                    className="form-control"
                    rows="4"
                    name="description"
                    value={form.description}
                    disabled={mode === "view"}
                    onChange={handleChange}
                    placeholder="Describe what happened..."
                  />
                </div>

                {/* ================= STATUS ================= */}
                <div className="mb-3">
                  <h6 className="text-primary fw-bold">📊 Status</h6>

                  <select
                    className="form-select"
                    name="status"
                    value={form.status}
                    disabled={mode === "view"}
                    onChange={handleChange}
                  >
                    <option value="pending">🟡 Pending</option>
                    <option value="ongoing">🔵 Ongoing</option>
                    <option value="resolved">🟢 Resolved</option>
                    <option value="dismissed">🔴 Dismissed</option>
                  </select>
                </div>

                {/* ================= ACTION ================= */}
                <div className="mb-2">
                  <h6 className="text-primary fw-bold">⚙️ Action Taken</h6>

                  <textarea
                    className="form-control"
                    rows="3"
                    name="action_taken"
                    value={form.action_taken}
                    disabled={mode === "view"}
                    onChange={handleChange}
                    placeholder="What action was taken?"
                  />
                </div>

              </div>

              {/* FOOTER */}
              <div className="modal-footer border-0 d-flex justify-content-between">

                <small className="text-muted">
                  <span className="text-danger">*</span> Required fields
                </small>

                <div className="d-flex gap-2">

                  {mode === "create" && (
                    <button
                      className="btn btn-primary px-4"
                      onClick={handleSubmit}
                    >
                      Save Incident
                    </button>
                  )}

                  {mode === "view" && (
                    <button
                      className="btn btn-warning px-4"
                      onClick={() => setMode("edit")}
                    >
                      Edit
                    </button>
                  )}

                  {mode === "edit" && (
                    <button
                      className="btn btn-success px-4"
                      onClick={handleUpdate}
                    >
                      Update
                    </button>
                  )}

                  <button
                    className="btn btn-light border"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}