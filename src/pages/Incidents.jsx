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
  const fetchIncidents = async (pageNum = 1, searchTerm = "") => {
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

  // ================= FORM =================
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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
      const res = await fetch("https://ajcpisonet.com/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });

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

  // ================= STATUS BADGE =================
  const getStatusBadge = (status) => {
    const map = {
      resolved: "success",
      ongoing: "primary",
      dismissed: "danger",
      pending: "warning",
    };

    return (
      <span className={`badge bg-${map[status] || "secondary"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="container-fluid py-4">

      {/* HEADER */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body d-flex justify-content-between align-items-center">

          <div className="input-group w-50">
            <span className="input-group-text bg-white">
              <i className="bi bi-search"></i>
            </span>

            <input
              className="form-control"
              placeholder="Search incidents..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchIncidents(1, e.target.value);
              }}
            />

            {search && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearch("");
                  fetchIncidents(1, "");
                }}
              >
                Clear
              </button>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setMode("create");
              setShowModal(true);
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Incident
          </button>

        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          {loading ? (
            <div className="text-center py-5">Loading...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
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
                  {incidents.length ? (
                    incidents.map((i, index) => (
                      <tr key={i.id}>
                        <td>{(page - 1) * 10 + index + 1}</td>
                        <td className="fw-semibold">{i.incident_no}</td>
                        <td>{i.incident_type}</td>
                        <td>{i.location || "-"}</td>
                        <td>{i.incident_date}</td>
                        <td>{getStatusBadge(i.status)}</td>

                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => {
                              setForm(i);
                              setMode("view");
                              setShowModal(true);
                            }}
                          >
                            View
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(i.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        No incidents found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">

              {/* HEADER */}
              <div className="modal-header">
                <h5 className="modal-title">
                  {mode === "create"
                    ? "Create Incident"
                    : mode === "view"
                    ? "Incident Details"
                    : "Edit Incident"}
                </h5>

                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>

              {/* BODY */}
              <div className="modal-body">

                {form.incident_no && (
                  <div className="alert alert-light border">
                    <strong>Incident No:</strong> {form.incident_no}
                  </div>
                )}

                {/* BASIC */}
                <div className="mb-3">
                  <h6 className="fw-bold text-primary">Basic Info</h6>

                  <div className="row g-2">
                    <div className="col-md-6">
                      <label>Type</label>
                      <select
                        className="form-select"
                        name="incident_type"
                        value={form.incident_type}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      >
                        <option value="">Select</option>
                        <option>Theft</option>
                        <option>Assault</option>
                        <option>Accident</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label>Category</label>
                      <input
                        className="form-control"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                    </div>

                    <div className="col-12">
                      <label>Location</label>
                      <input
                        className="form-control"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                    </div>
                  </div>
                </div>

                {/* REPORT */}
                <div className="mb-3">
                  <h6 className="fw-bold text-primary">Report Info</h6>

                  <div className="row g-2">
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        name="reported_by"
                        placeholder="Reported By"
                        value={form.reported_by}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                    </div>

                    <div className="col-md-6">
                      <input
                        className="form-control"
                        name="contact_number"
                        placeholder="Contact"
                        value={form.contact_number}
                        onChange={handleChange}
                        disabled={mode === "view"}
                      />
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <textarea
                  className="form-control mb-3"
                  rows="3"
                  placeholder="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />

                {/* STATUS */}
                <select
                  className="form-select mb-3"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={mode === "view"}
                >
                  <option value="pending">Pending</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>

                {/* ACTION */}
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Action Taken"
                  name="action_taken"
                  value={form.action_taken}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />

              </div>

              {/* FOOTER */}
              <div className="modal-footer">

                {mode === "create" && (
                  <button className="btn btn-primary" onClick={handleSubmit}>
                    Save
                  </button>
                )}

                {mode === "view" && (
                  <button className="btn btn-warning" onClick={() => setMode("edit")}>
                    Edit
                  </button>
                )}

                {mode === "edit" && (
                  <button className="btn btn-success" onClick={handleUpdate}>
                    Update
                  </button>
                )}

                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}