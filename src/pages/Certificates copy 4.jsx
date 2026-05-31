import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { onMessage } from "firebase/messaging";
import { messaging } from "../notifications/firebase";

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusValue, setStatusValue] = useState("pending");

  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    full_name: "",
    age: "",
    gender: "",
    address: "",
    document_type: "",
    purpose: "",
    company_name: "",
    business_nature: "",
  });

  // ================= FETCH =================
  const fetchCertificates = async (pageNum = 1, searchTerm = "") => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/certificates?page=${pageNum}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      setCertificates(data.data || []);
      setPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch (err) {
      toast.error("Error loading certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates(1, "");
  }, []);

  useEffect(() => {
    const unsubscribe = onMessage(messaging, () => {
      fetchCertificates(page, search);
    });

    return () => unsubscribe();
  }, [page, search]);

  // ================= STATUS UPDATE =================
  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/certificates/${id}/status`,
        {
          method: "PATCH",
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
      fetchCertificates(page, search);
    } catch (err) {
      toast.error("Server error");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!confirm("Delete this certificate?")) return;

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/certificates/${id}`,
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
        toast.error(result.message);
        return;
      }

      toast.success("Deleted successfully");
      fetchCertificates(page, search);
    } catch (err) {
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
            <h5 className="fw-bold mb-0">Certificate Requests</h5>

            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <i className="bi bi-plus-lg me-2"></i>
              Add Request
            </button>
          </div>

          {/* SEARCH */}
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search"></i>
            </span>

            <input
              className="form-control"
              placeholder="Search certificates..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchCertificates(1, e.target.value);
              }}
            />
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
                    <th>Name</th>
                    <th>Document</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {certificates.length > 0 ? (
                    certificates.map((c, i) => (
                      <tr
                        key={c.id}
                        onClick={() => {
                          setSelectedCert(c);
                          setShowActionModal(true);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{(page - 1) * 10 + i + 1}</td>
                        <td className="fw-semibold">{c.full_name}</td>
                        <td>{c.document_type}</td>
                        <td>{c.purpose}</td>

                        <td>
                          <span
                            className={`badge bg-${
                              c.status === "approved"
                                ? "success"
                                : c.status === "rejected"
                                ? "danger"
                                : "warning"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>

                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCert(c);
                              setShowActionModal(true);
                            }}
                          >
                            View
                          </button>

                          <button
                            className="btn btn-sm btn-outline-warning me-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCert(c);
                              setStatusValue(c.status);
                              setShowStatusModal(true);
                            }}
                          >
                            Status
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
                        No certificates found
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

              <ul className="pagination pagination-sm mb-0">

                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => fetchCertificates(page - 1, search)}>
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
                      <button className="page-link" onClick={() => fetchCertificates(p, search)}>
                        {p}
                      </button>
                    </li>
                  )
                )}

                <li className={`page-item ${page === lastPage ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => fetchCertificates(page + 1, search)}>
                    Next
                  </button>
                </li>

              </ul>

            </div>
          )}

        </div>
      </div>

    {showActionModal && selectedCert && (
      <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content rounded-3">

            {/* HEADER */}
            <div className="modal-header">
              <div>
                <h5 className="modal-title mb-0">Certificate Details</h5>
             
              </div>

              <button
                className="btn-close"
                onClick={() => setShowActionModal(false)}
              />
            </div>

            {/* BODY */}
            <div className="modal-body">

              <div className="mb-3">
                <span className={`badge bg-${
                  selectedCert.status === "approved"
                    ? "success"
                    : selectedCert.status === "rejected"
                    ? "danger"
                    : "warning"
                }`}>
                  {selectedCert.status}
                </span>
              </div>

              <div className="list-group">

                <div className="list-group-item d-flex justify-content-between">
                  <span className="text-muted">Full Name</span>
                  <span className="fw-semibold">{selectedCert.full_name}</span>
                </div>

                <div className="list-group-item d-flex justify-content-between">
                  <span className="text-muted">Age</span>
                  <span className="fw-semibold">{selectedCert.age || "-"}</span>
                </div>

                <div className="list-group-item d-flex justify-content-between">
                  <span className="text-muted">Gender</span>
                  <span className="fw-semibold">{selectedCert.gender || "-"}</span>
                </div>

                <div className="list-group-item">
                  <span className="text-muted d-block">Address</span>
                  <span className="fw-semibold">{selectedCert.address}</span>
                </div>

                <div className="list-group-item d-flex justify-content-between">
                  <span className="text-muted">Document</span>
                  <span className="fw-semibold">{selectedCert.document_type}</span>
                </div>

                <div className="list-group-item">
                  <span className="text-muted d-block">Purpose</span>
                  <span className="fw-semibold">{selectedCert.purpose}</span>
                </div>

              </div>
            </div>

            {/* FOOTER */}
            <div className="modal-footer">

              <button
                className="btn btn-warning"
                onClick={() => {
                  setShowActionModal(false);
                  setShowStatusModal(true);
                  setStatusValue(selectedCert.status);
                }}
              >
                Update Status
              </button>

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
    {showStatusModal && selectedCert && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content rounded-3">

              {/* HEADER */}
              <div className="modal-header">
                <div>
                  <h5 className="modal-title mb-0">Update Status</h5>
                </div>

                <button
                  className="btn-close"
                  onClick={() => setShowStatusModal(false)}
                />
              </div>

              {/* BODY */}
              <div className="modal-body">
                <div className="d-flex flex-column mb-3">
                  <h5 className="fw-bold">
                    Name: {selectedCert.full_name}
                  </h5>
                  <small className="">
                    What: Requesting {selectedCert.document_type}
                  </small>
                </div>
                 <div className="mt-3 p-2 rounded bg-warning mb-4">
                  <small className="text-muted d-block">Current Status</small>
                  <span className="fw-semibold text-capitalize">
                    {selectedCert.status}
                  </span>
                </div>
                

                <label className="form-label text-muted">
                  Select new status
                </label>

                <select
                  className="form-select"
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

               

              </div>

              {/* FOOTER */}
              <div className="modal-footer">

                <button
                  className="btn btn-light"
                  onClick={() => setShowStatusModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => {
                    updateStatus(selectedCert.id, statusValue);
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