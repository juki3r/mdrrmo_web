import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { onMessage } from "firebase/messaging";
import { messaging } from "../notifications/firebase";

export default function Blotter() {
  const [blotters, setBlotters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedBlotter, setSelectedBlotter] = useState(null);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusValue, setStatusValue] = useState("");

  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    incident_type: "",
    incident_category: "",
    incident_date: "",
    incident_time: "",
    incident_location: "",
    incident_details: "",

    complainant_name: "",
    complainant_contact: "",
    complainant_address: "",

    respondent_name: "",
    respondent_contact: "",
    respondent_address: "",

    witness_name: "",
    witness_contact: "",
  });

  // =========================
  // FETCH BLOTTERS
  // =========================
  const fetchBlotters = async (pageNum = 1, searchTerm = "") => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/blotters?page=${pageNum}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error("Unauthorized or failed request");
        return;
      }

      setBlotters(data.data || []);
      setPage(data.current_page);
      setLastPage(data.last_page);
    } catch (err) {
      toast.error("Failed to load blotters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlotters(1, "");
  }, []);

  useEffect(() => {
      const unsubscribe = onMessage(messaging, () => {
        fetchBlotters(page, search);
      });
  
      return () => unsubscribe();
    }, [page, search]);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =========================
  // CREATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://ajcpisonet.com/api/blotters", {
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
        toast.error(result.message || "Failed to create blotter");
        return;
      }

      toast.success("Blotter created successfully");

      setShowModal(false);

      setForm({
        incident_type: "",
        incident_category: "",
        incident_date: "",
        incident_time: "",
        incident_location: "",
        incident_details: "",

        complainant_name: "",
        complainant_contact: "",
        complainant_address: "",

        respondent_name: "",
        respondent_contact: "",
        respondent_address: "",

        witness_name: "",
        witness_contact: "",
      });

      fetchBlotters(page, search);
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const filteredBlotters = blotters.filter((b) => {
    const matchSearch =
      b.blotter_number?.toLowerCase().includes(search.toLowerCase()) ||
      b.incident_type?.toLowerCase().includes(search.toLowerCase()) ||
      b.incident_location?.toLowerCase().includes(search.toLowerCase()) ||
      b.complainant_name?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" ? true : b.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    if (!confirm("Delete this blotter?")) return;

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/blotters/force/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Delete failed");
        return;
      }

      toast.success("Deleted successfully");
      fetchBlotters(page, search);
    } catch (err) {
      toast.error("Server error");
    }
  };

  // =========================
  // UPDATE STATUS
  // =========================
  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/blotters/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed to update status");
        return;
      }

      toast.success("Status updated");

      setShowActionModal(false);
      fetchBlotters(page, search);
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const formatMobile = (num) => {
    if (!num) return "-";

    const cleaned = num.replace(/\D/g, ""); // remove non-numbers

    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }

    return num; // fallback if not 11 digits
  };

  // =========================
  // PAGINATION
  // =========================
  const getPages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= lastPage; i++) {
      if (i === 1 || i === lastPage || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

 return (
  <div className="container-fluid py-4">

    {/* ================= HEADER ================= */}
    <div className="card shadow-sm border-0 mb-3">
      <div className="card-body">

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Blotter Management</h5>

          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Blotter
          </button>
        </div>

        {/* SEARCH */}
        <div className="row g-2">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-search"></i>
              </span>

              <input
                className="form-control"
                placeholder="Search blotters..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  fetchBlotters(1, e.target.value);
                }}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Resolved">Resolved</option>
              <option value="Dismissed">Dismissed</option>
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
                  <th>Blotter No</th>
                  <th>Complainant</th>
                  <th>Mobile Number</th>
                  <th>Respondent</th>
                  <th>Incident Type</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {blotters.length > 0 ? (
                  filteredBlotters.map((b, i) => (
                    <tr
                        key={b.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSelectedBlotter(b);
                          setShowActionModal(true);
                        }}
                      >

                      <td>{(page - 1) * 10 + i + 1}</td>
                      <td className="fw-semibold">{b.blotter_number}</td>

                      <td>{b.complainant_name}</td>
                      <td>{formatMobile(b.complainant_contact)}</td>
                      <td>{b.respondent_name || "-"}</td>

                      <td>{b.incident_type}</td>
                      <td>{b.incident_location}</td>

                      <td>
                        {new Date(b.incident_date).toLocaleString("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        })}
                      </td>

                      <td>
                        {b.incident_time
                          ? new Date(`1970-01-01T${b.incident_time}`).toLocaleTimeString(
                              "en-PH",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )
                          : "-"}
                      </td>

                      <td>
                        <span className={`badge bg-${
                          b.status === "Resolved"
                            ? "success"
                            : b.status === "Ongoing"
                            ? "primary"
                            : b.status === "Dismissed"
                            ? "danger"
                            : "secondary"
                        }`}>
                          {b.status}
                        </span>
                      </td>

                      <td className="text-end">

                        <button
                          className="btn btn-sm btn-outline-warning me-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBlotter(b);
                            setStatusValue(b.status);
                            setShowStatusModal(true);
                          }}
                        >
                          Status
                        </button>

                        <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBlotter(b);
                              setShowActionModal(true);
                            }}
                          >
                            View
                          </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(b.id)}
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      No blotters found
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        )}

        {/* ================= PAGINATION ================= */}
        {lastPage > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-4">

            <div className="text-muted small">
              Page {page} of {lastPage}
            </div>

            <nav>
              <ul className="pagination pagination-sm mb-0">

                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => fetchBlotters(page - 1, search)}
                  >
                    Prev
                  </button>
                </li>

                {getPages().map((p, i) =>
                  p === "..." ? (
                    <li key={i} className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  ) : (
                    <li
                      key={i}
                      className={`page-item ${p === page ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => fetchBlotters(p, search)}
                      >
                        {p}
                      </button>
                    </li>
                  )
                )}

                <li className={`page-item ${page === lastPage ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => fetchBlotters(page + 1, search)}
                  >
                    Next
                  </button>
                </li>

              </ul>
            </nav>

          </div>
        )}

      </div>
    </div>

    {showActionModal && selectedBlotter && (
      <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">

            {/* HEADER */}
            <div className="p-3 border-bottom d-flex justify-content-between">
              <div>
                <h5 className="fw-bold mb-0">Blotter Details</h5>
                <small className="text-muted">
                  #{selectedBlotter.blotter_number}
                </small>
              </div>

              <button
                className="btn-close"
                onClick={() => setShowActionModal(false)}
              />
            </div>

            {/* BODY */}
            <div className="p-4">

              <div className="mb-3">
                <span className="badge bg-primary text-uppercase">
                  {selectedBlotter.status}
                </span>
              </div>

              <div className="row g-3">

                <div className="col-md-6">
                  <div className="border rounded p-3 bg-light">
                    <small className="text-muted">Incident Type</small>
                    <div className="fw-semibold">
                      {selectedBlotter.incident_type}
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="border rounded p-3 bg-light">
                    <small className="text-muted">Location</small>
                    <div className="fw-semibold">
                      {selectedBlotter.incident_location}
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="border rounded p-3 bg-light">
                    <small className="text-muted">Details</small>
                    <div className="fw-semibold">
                      {selectedBlotter.incident_details}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* FOOTER (VIEW ONLY ACTIONS) */}
            <div className="p-3 border-top d-flex justify-content-end">

              <button
                className="btn btn-secondary"
                onClick={() => setShowActionModal(false)}
              >
                Close
              </button>

            </div>

          </div>
        </div>
      </div>
    )}


    {showStatusModal && selectedBlotter && (
      <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content">

            {/* HEADER */}
            <div className="modal-header">
              <h5 className="modal-title">Update Status</h5>
              <button
                className="btn-close"
                onClick={() => setShowStatusModal(false)}
              />
            </div>

            {/* BODY */}
            <div className="modal-body">

              <p className="mb-2">
                Blotter #: <strong>{selectedBlotter.blotter_number}</strong>
              </p>

              <label className="form-label">Select Status</label>

              <select
                className="form-select"
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Resolved">Resolved</option>
                <option value="Dismissed">Dismissed</option>
              </select>

            </div>

            {/* FOOTER */}
            <div className="modal-footer">

              <button
                className="btn btn-secondary"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={() => {
                  updateStatus(selectedBlotter.id, statusValue);
                  setShowStatusModal(false);
                }}
              >
                Save Changes
              </button>

            </div>

          </div>
        </div>
      </div>
    )}
  </div>
);
}