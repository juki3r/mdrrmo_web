import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { onMessage } from "firebase/messaging";
import { messaging } from "../notifications/firebase";

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("create");

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const token = localStorage.getItem("token");

//pagination declaration
  const getPages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    let last;

    for (let i = 1; i <= lastPage; i++) {
      if (
        i === 1 ||
        i === lastPage ||
        (i >= page - delta && i <= page + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (last) {
        if (i - last === 2) {
          rangeWithDots.push(last + 1);
        } else if (i - last !== 1) {
          rangeWithDots.push("...");
        }
      }

      rangeWithDots.push(i);
      last = i;
    }

    return rangeWithDots;
  };
  // End of declare pagination

  

  const [form, setForm] = useState({
    id: null,
    type: "",
    description: "",
    location: "",
  });

  const [editForm, setEditForm] = useState({
    id: null,
    status: "",
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
      const unsubscribe = onMessage(messaging, () => {
        fetchIncidents(page, search);
      });
  
      return () => unsubscribe();
    }, [page, search]);

  useEffect(() => {
    fetchIncidents(1, "");
  }, []);

  // ================= FILTERED DATA =================
  const filteredIncidents = incidents.filter((i) => {
    const matchSearch =
      i.incident_no?.toLowerCase().includes(search.toLowerCase()) ||
      i.incident_type?.toLowerCase().includes(search.toLowerCase()) ||
      i.location?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" ? true : i.status === statusFilter;

    return matchSearch && matchStatus;
  });

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
      type: "",
      description: "",
      location: "",
    });
  };

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
          body: JSON.stringify({
            type: form.type,
            description: form.description,
            location: form.location,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed to create incident");
        return;
      }

      toast.success("Incident created successfully");

      setShowCreateModal(false);

      resetForm();

      fetchIncidents(page, search);

    } catch (error) {
      console.error(error);
      toast.error("Server error");
    }
  };

  const toProperCase = (str = "") =>
    str
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/incidents/${editForm.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            status: editForm.status,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Update failed");
        return;
      }

      toast.success("Status updated successfully");

      setShowModal(false);
      fetchIncidents(page, search);

    } catch (error) {
      toast.error("Server error");
    }
  };

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

      } catch (error) {
        console.error(error);
        toast.error("Server error");
      }
    };

  // ================= BADGE =================
  const getStatusBadge = (status) => {
    const map = {
      pending: "warning",
      ongoing: "primary",
      resolved: "success",
      dismissed: "danger",
    };
    

    return (
      <span className={`badge bg-${map[status] || "secondary"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="container-fluid py-4">

      {/* ================= HEADER ================= */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body">

          {/* TOP ROW */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Incident Management</h5>

            <button
              className="btn btn-primary"
              onClick={() => {
                setShowCreateModal(true);
                resetForm();
              }}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add Incident
            </button>
          </div>

          {/* SEARCH + FILTER ROW */}
          <div className="row g-2">

            {/* SEARCH */}
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  className="form-control"
                  placeholder="Search incidents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* DROPDOWN FILTER */}
            <div className="col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="received">Received</option>
                <option value="action_taken">Action Taken</option>
                <option value="resolved">Resolved</option>
                <option value="declined">Declined</option>
              </select>
            </div>

          </div>

        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          {loading ? (
            <div className="text-center py-5">Loading...</div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Incident No</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Reported By</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredIncidents.length > 0 ? (
                    filteredIncidents.map((i, index) => (
                      <tr
                        key={i.id}
                        style={{ cursor: "pointer" }}
                        className="align-middle"
                        onClick={() => {
                          setSelectedIncident(i);
                          setShowViewModal(true);
                        }}
                      >
                        <td>{(page - 1) * 10 + index + 1}</td>
                        <td className="fw-semibold">{i.incident_no}</td>
                        <td>{i.type}</td>
                        <td>{i.location || "-"}</td>
                        <td>
                          {new Date(i.incident_datetime).toLocaleString("en-PH", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td>{getStatusBadge(i.status)}</td>
                        <td>{toProperCase(i.reported_by)}</td>

                        <td className="text-end">

                          <button
                            className="btn btn-sm btn-outline-warning me-2"
                            onClick={(e) => {
                              e.stopPropagation();

                              setEditForm({
                                id: i.id,
                                status: i.status || "",
                              });

                              setShowStatusModal(true);
                            }}
                          >
                            Edit Status
                          </button>

                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIncident(i);
                              setShowViewModal(true);
                            }}
                          >
                            View
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(i.id);
                            }}
                          >
                            Delete
                          </button>

                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        No incidents found
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
              
              {/* Pagination Button */}
              {lastPage > 1 && (
               <div className="d-flex justify-content-between align-items-center mt-4">

                  <div className="text-muted small">
                    Page {page} of {lastPage}
                  </div>

                  <nav>
                    <ul className="pagination pagination-sm mb-0">

                      <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => fetchIncidents(page - 1, search)}>
                          Prev
                        </button>
                      </li>

                      {getPages().map((p, i) =>
                        p === "..." ? (
                          <li key={i} className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        ) : (
                          <li key={i} className={`page-item ${p === page ? "active" : ""}`}>
                            <button className="page-link" onClick={() => fetchIncidents(p, search)}>
                              {p}
                            </button>
                          </li>
                        )
                      )}

                      <li className={`page-item ${page === lastPage ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => fetchIncidents(page + 1, search)}>
                          Next
                        </button>
                      </li>

                    </ul>
                  </nav>
                </div>
              )}
            </div>
          )}

          

        </div>
      </div>

      {/* MODAL */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Create Incident</h5>
                <button className="btn-close" onClick={() => setShowCreateModal(false)} />
              </div>

              <div className="modal-body">

                <div className="mb-3">
                  <label className="form-label">Incident Type</label>

                  <select
                    className="form-select"
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value })
                    }
                  >
                    <option value="">Select type</option>
                    <option value="Fire">Fire</option>
                    <option value="Accident">Accident</option>
                    <option value="Flood">Flood</option>
                    <option value="Crime">Crime</option>
                    <option value="Medical">Medical</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Location</label>

                  <input
                    className="form-control"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>

                  <textarea
                    className="form-control"
                    rows="4"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

              </div>

              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleSubmit}>
                  Save
                </button>

                <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

     {showViewModal && selectedIncident && (
      <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">Incident Details</h5>
              <button className="btn-close" onClick={() => setShowViewModal(false)} />
            </div>

            <div className="modal-body bg-light">

              <div className="bg-white p-3 border rounded mb-3">
                <div className="fw-bold text-uppercase">
                  {selectedIncident.type}
                </div>
                <div className="text-muted small">
                  {new Date(selectedIncident.created_at).toLocaleString("en-PH", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
              </div>

              <div className="mb-3">
                <label className="text-muted small">Location</label>
                <div className="border rounded p-2 bg-white">
                  {selectedIncident.location || "N/A"}
                </div>
              </div>

              <div className="mb-3">
                <label className="text-muted small">Description</label>
                <div className="border rounded p-2 bg-white">
                  {selectedIncident.description}
                </div>
              </div>

              <div className="mb-3">
                <label className="text-muted small">Status</label>
                <div>
                  <span className="badge bg-primary text-uppercase">
                    {selectedIncident.status}
                  </span>
                </div>
              </div>

            </div>

            <div className="modal-footer">
              <button
                className="btn btn-warning"
                onClick={() => {
                  setEditForm({
                    id: selectedIncident.id,
                    status: selectedIncident.status || "",
                  });

                  setShowViewModal(false);
                  setMode("edit");
                  setShowModal(true);
                }}
              >
                Edit Status
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      </div>
    )}

    {showModal && mode === "edit" && (
      <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-sm modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">Update Status</h5>
              <button className="btn-close" onClick={() => setShowModal(false)} />
            </div>

            <div className="modal-body">

              <label className="form-label">Status</label>

              <select
                className="form-select"
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value })
                }
              >
                <option value="">Select status</option>
                <option value="received">Received</option>
                <option value="action_taken">Action Taken</option>
                <option value="resolved">Resolved</option>
                <option value="declined">Declined</option>
              </select>

            </div>

            <div className="modal-footer">
              <button className="btn btn-success" onClick={handleUpdate}>
                Update
              </button>

              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>

          </div>
        </div>
      </div>
    )}

    {showStatusModal && (
      <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-sm modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">Update Status</h5>
              <button
                className="btn-close"
                onClick={() => setShowStatusModal(false)}
              />
            </div>

            <div className="modal-body">

              <label className="form-label">Status</label>

              <select
                className="form-select"
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value })
                }
              >
                <option value="">Select status</option>
                <option value="received">Received</option>
                <option value="action_taken">Action Taken</option>
                <option value="resolved">Resolved</option>
                <option value="declined">Declined</option>
              </select>

            </div>

            <div className="modal-footer">

              <button
                className="btn btn-success"
                onClick={() => {
                  handleUpdate();
                  setShowStatusModal(false);
                }}
              >
                Update
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>

            </div>

          </div>
        </div>
      </div>
    )}

    </div>
  );
}