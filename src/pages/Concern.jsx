import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { onMessage } from "firebase/messaging";
import { messaging } from "../notifications/firebase";

export default function Concern() {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState(null);

  const [showActionModal, setShowActionModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [statusValue, setStatusValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const token = localStorage.getItem("token");

  // ================= FETCH =================
  const fetchConcerns = async (pageNum = 1, searchTerm = "") => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/concerns?page=${pageNum}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error("Failed to load concerns");
        return;
      }

      setConcerns(data.data || []);
      setPage(data.current_page);
      setLastPage(data.last_page);
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcerns(1, "");
  }, []);

  useEffect(() => {
    const unsubscribe = onMessage(messaging, () => {
      fetchConcerns(page, search);
    });

    return () => unsubscribe();
  }, [page, search]);

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!confirm("Delete this concern?")) return;

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/concerns/${id}`,
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

      toast.success("Deleted successfully");
      fetchConcerns(page, search);
    } catch {
      toast.error("Server error");
    }
  };

  // ================= STATUS UPDATE =================
  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/concerns/${id}/status`,
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

      if (!res.ok) {
        toast.error("Update failed");
        return;
      }

      toast.success("Status updated");
      setShowStatusModal(false);
      fetchConcerns(page, search);
    } catch {
      toast.error("Server error");
    }
  };

  const filteredConcerns = concerns.filter((c) => {
    const matchSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.location?.toLowerCase().includes(search.toLowerCase()) ||
      c.user?.full_name?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" ? true : c.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // ================= PAGINATION =================
  const getPages = () => {
    const delta = 2;
    const range = [];
    const pages = [];
    let l;

    for (let i = 1; i <= lastPage; i++) {
      if (i === 1 || i === lastPage || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) pages.push(l + 1);
        else if (i - l !== 1) pages.push("...");
      }
      pages.push(i);
      l = i;
    }

    return pages;
  };

  const statusBadge = (status) => {
    switch (status) {
      case "resolved":
        return "bg-success";
      case "in_progress":
        return "bg-warning text-dark";
      case "rejected":
        return "bg-danger";
      case "under_review":
        return "bg-info text-dark";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* ================= HEADER (LIKE BLOTTER) ================= */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Concern Management</h5>
          </div>

          {/* SEARCH ROW */}
          <div className="row g-2">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  className="form-control"
                  placeholder="Search concerns..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    fetchConcerns(1, e.target.value);
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
                <option value="received">Received</option>
                <option value="under_review">Under Review</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
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
                    <th>Submitted By</th>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {concerns.length > 0 ? (
                    filteredConcerns.map((c, i) => (
                      <tr
                        key={c.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSelected(c);
                          setShowActionModal(true);
                        }}
                      >
                        <td>{(page - 1) * 10 + i + 1}</td>
                        <td>{c.user?.full_name || "Unknown"}</td>
                        <td className="fw-semibold">{c.title}</td>
                        <td>{c.location}</td>

                        <td>
                          <span className={`badge px-3 py-2 ${statusBadge(c.status)}`}>
                            {c.status}
                          </span>
                        </td>

                        <td className="text-end">

                          <button
                            className="btn btn-sm btn-outline-warning me-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(c);
                              setStatusValue(c.status);
                              setShowStatusModal(true);
                            }}
                          >
                            Status
                          </button>

                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(c);
                              setShowActionModal(true);
                            }}
                          >
                            View
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(c.id);
                            }}
                          >
                            Delete
                          </button>

                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        No concerns found
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
                    <button className="page-link" onClick={() => fetchConcerns(page - 1, search)}>
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
                        <button className="page-link" onClick={() => fetchConcerns(p, search)}>
                          {p}
                        </button>
                      </li>
                    )
                  )}

                  <li className={`page-item ${page === lastPage ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => fetchConcerns(page + 1, search)}>
                      Next
                    </button>
                  </li>

                </ul>
              </nav>

            </div>
          )}

        </div>
      </div>

      {/* ================= VIEW MODAL ================= */}
      {showActionModal && selected && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">

              <div className="p-3 border-bottom d-flex justify-content-between">
                <h5 className="fw-bold mb-0">Concern Details</h5>
                <button className="btn-close" onClick={() => setShowActionModal(false)} />
              </div>

              <div className="p-4">

                <div className="mb-3">
                  <span className={`badge ${statusBadge(selected.status)}`}>
                    {selected.status}
                  </span>
                </div>

                <div className="row g-3">

                  <div className="col-md-6">
                    <div className="border rounded p-3 bg-light">
                      <small className="text-muted">Title</small>
                      <div className="fw-semibold">{selected.title}</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded p-3 bg-light">
                      <small className="text-muted">Location</small>
                      <div className="fw-semibold">{selected.location}</div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="border rounded p-3 bg-light">
                      <small className="text-muted">Description</small>
                      <div>{selected.description}</div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="p-3 border-top text-end">
                <button className="btn btn-secondary" onClick={() => setShowActionModal(false)}>
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= STATUS MODAL ================= */}
      {showStatusModal && selected && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Update Status</h5>
                <button className="btn-close" onClick={() => setShowStatusModal(false)} />
              </div>

              <div className="modal-body">
                <select
                  className="form-select"
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                >
                  <option value="received">Received</option>
                  <option value="under_review">Under Review</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => updateStatus(selected.id, statusValue)}
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