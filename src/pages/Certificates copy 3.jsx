import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { onMessage } from "firebase/messaging";
import { messaging } from "../notifications/firebase";

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  };

  const user = getUser();

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

  // FETCH CERTIFICATES
 
  useEffect(() => {
    fetchCertificates(page, search);
  }, []);

  useEffect(() => {
    const unsubscribe = onMessage(messaging, () => {
      fetchCertificates(page, search);
    });

    return () => unsubscribe();
  }, [page, search]);

  const fetchCertificates = async (
    pageNum = 1,
    searchTerm = search
  ) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `https://ajcpisonet.com/api/certificates?page=${pageNum}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const result = await res.json();

      setCertificates(result.data || []);
      setPage(result.current_page || 1);
      setLastPage(result.last_page || 1);

    } catch (err) {
      console.error(err);
      toast.error("Error loading certificates");
    } finally {
      setLoading(false);
    }
  };

  // HANDLE INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://ajcpisonet.com/api/certificates", {
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
        console.error("Error response:", result);
        toast.error(result.message || "Failed to submit request");
        return;
      }

      setShowModal(false);

      setForm({
        full_name: "",
        age: "",
        gender: "",
        address: "",
        document_type: "",
        purpose: "",
        company_name: "",
        business_nature: "",
      });

      fetchCertificates(page, search);
      toast.success("Certificate request successfully added!");
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again.");
    }
  };

  //Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this certificate?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`https://ajcpisonet.com/api/certificates/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed to delete");
        return;
      }

      toast.success("Deleted successfully");

      // refresh table
      fetchCertificates(page, search);
    } catch (err) {
      console.error(err);
      toast.error("Server error while deleting");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

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
      console.error(err);
      toast.error("Server error");
    }
  };

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
        <div className="d-flex align-items-center gap-2 w-100">

          <div
            className="position-relative"
            style={{ width: "350px" }}
          >
            {/* SEARCH ICON */}
            <i
              className="bi bi-search position-absolute"
              style={{
                top: "50%",
                left: "14px",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                fontSize: "14px",
                zIndex: 2,
              }}
            />

            {/* INPUT */}
            <input
              type="text"
              className="form-control border-0 shadow-sm"
              placeholder="Search certificates..."
              value={search}
              onChange={(e) => {
                const value = e.target.value;

                setSearch(value);
                fetchCertificates(1, value);
              }}
              style={{
                height: "46px",
                borderRadius: "14px",
                background: "#f8fafc",
                paddingLeft: "42px",
                paddingRight: "42px",
                fontSize: "14px",
              }}
            />

            {/* CLEAR BUTTON */}
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  fetchCertificates(1, "");
                }}
                className="btn p-0 border-0 position-absolute"
                style={{
                  top: "50%",
                  right: "14px",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  color: "#94a3b8",
                  zIndex: 2,
                }}
              >
                <i
                  className="bi bi-x-circle-fill"
                  style={{
                    fontSize: "16px",
                  }}
                />
              </button>
            )}
          </div>

        </div>

        <button
            className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-plus-lg"></i>
            <span>Add</span>
          </button>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-3">

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead className="table-light">
                  <tr>
                    <th className="px-3 py-3">#</th>
                    <th>Name</th>
                    <th>Document Type</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th className="text-end px-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                    {certificates.length > 0 ? (
                      certificates.map((c, index) => (
                        <tr key={c.id} className="align-middle">
                          <td>{(page - 1) * 10 + index + 1}</td>
                          <td>{c.full_name}</td>

                          <td>{c.document_type}</td>

                          <td>{c.purpose}</td>

                          <td>
                            <span
                              style={{
                                  background:
                                    c.status === "approved"
                                      ? "#16a34a" // green-600
                                      : c.status === "rejected"
                                      ? "#dc2626" // red-600
                                      : "#f59e0b", // amber-500

                                  color: "#fff",
                                  padding: "5px 10px",
                                  borderRadius: "999px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  letterSpacing: "0.3px",
                                  textTransform: "capitalize",
                                  display: "inline-block",
                                }}
                            >
                              {c.status}
                            </span>
                          </td>

                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                                onClick={() => {
                                  setSelectedCert(c);
                                  setShowActionModal(true);
                                }}
                              >
                                <i className="bi bi-eye"></i>
                                View
                              </button>

                              <button
                                className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                                onClick={() => handleDelete(c.id)}
                              >
                                <i className="bi bi-trash"></i>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <div className="d-flex flex-column align-items-center justify-content-center">

                            <i
                              className="bi bi-inbox"
                              style={{
                                fontSize: "48px",
                                color: "#cbd5e1",
                                marginBottom: "10px",
                              }}
                            ></i>

                            <h6 className="fw-semibold mb-1 text-muted">
                              No certificates found
                            </h6>

                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>

              </table>

              <div className="d-flex justify-content-center align-items-center mt-4 gap-2 flex-wrap">

                {/* PREV */}
                <button
                  className="btn btn-light border rounded-pill px-3"
                  disabled={page === 1}
                  onClick={() => fetchCertificates(page - 1, search)}
                >
                  ← Prev
                </button>

                {/* PAGE NUMBERS */}
                {getPages().map((p, idx) =>
                  p === "..." ? (
                    <span key={idx} className="px-2 text-muted">
                      ...
                    </span>
                  ) : (
                    <button
                      key={idx}
                      className={`btn rounded-pill ${
                        p === page ? "btn-primary shadow-sm" : "btn-light border"
                      }`}
                      style={{
                        minWidth: "42px",
                        height: "42px",
                      }}
                      onClick={() => fetchCertificates(p, search)}
                    >
                      {p}
                    </button>
                  )
                )}

                {/* NEXT */}
                <button
                  className="btn btn-light border rounded-pill px-3"
                  disabled={page === lastPage}
                  onClick={() => fetchCertificates(page + 1, search)}
                >
                  Next →
                </button>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================= MODAL ================= */}
    {showModal && (
      <div
        className="modal d-block"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content rounded-4 shadow-lg">

            {/* HEADER */}
            <div className="modal-header border-0">
              <div>
                <h5 className="mb-0 fw-bold">📄 Certificate Request</h5>
                <small className="text-muted">
                  Fill out the form to submit your request
                </small>
              </div>

              <button
                className="btn-close"
                onClick={() => setShowModal(false)}
              />
            </div>

            <form onSubmit={handleSubmit}>

              <div className="modal-body">

                {/* ================= PERSONAL INFO ================= */}
                <div className="mb-3">
                  <h6 className="text-primary fw-bold">👤 Personal Information</h6>

                  <div className="row g-2 mt-2">

                    <div className="col-md-6">
                      <label className="form-label">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        name="full_name"
                        className="form-control"
                        placeholder="Juan Dela Cruz"
                        value={form.full_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Age</label>
                      <input
                        name="age"
                        type="number"
                        className="form-control"
                        placeholder="25"
                        value={form.age}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Gender</label>
                      <select
                        name="gender"
                        className="form-select"
                        value={form.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <input
                        name="address"
                        className="form-control"
                        placeholder="Complete Address"
                        value={form.address}
                        onChange={handleChange}
                      />
                    </div>

                  </div>
                </div>

                {/* ================= REQUEST INFO ================= */}
                <div className="mb-3">
                  <h6 className="text-primary fw-bold">📌 Request Details</h6>

                  <div className="row g-2 mt-2">

                    <div className="col-md-6">
                      <label className="form-label">
                        Document Type <span className="text-danger">*</span>
                      </label>

                      <select
                        name="document_type"
                        className="form-select"
                        value={form.document_type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Document Type</option>

                        {/* BASIC */}
                        <option value="Barangay Clearance">Barangay Clearance</option>
                        <option value="Certificate of Residency">Certificate of Residency</option>
                        <option value="Certificate of Indigency">Certificate of Indigency</option>
                        <option value="Certificate of Low Income">Certificate of Low Income</option>
                        <option value="Certificate of Good Moral Character">Certificate of Good Moral Character</option>
                        <option value="Certificate of Appearance">Certificate of Appearance</option>
                        <option value="Certificate of Solo Parent">Certificate of Solo Parent</option>
                        <option value="Certificate of Cohabitation">Certificate of Cohabitation</option>
                        <option value="Certificate of Unemployment">Certificate of Unemployment</option>
                        <option value="Certificate of Residency for Voter Registration">
                          Residency for Voter Registration
                        </option>

                        {/* BUSINESS */}
                        <option value="Business Permit">Business Permit</option>
                        <option value="Business Clearance">Business Clearance</option>
                        <option value="Mayor's Permit Endorsement">Mayor's Permit Endorsement</option>

                        {/* LEGAL */}
                        <option value="Barangay Blotter">Barangay Blotter</option>
                        <option value="Certificate to File Action">Certificate to File Action</option>
                        <option value="Summon / Mediation Notice">Summon / Mediation Notice</option>
                        <option value="Settlement Agreement">Settlement Agreement</option>

                        {/* CONSTRUCTION */}
                        <option value="Fence Clearance">Fence Clearance</option>
                        <option value="Building Clearance">Building Clearance</option>
                        <option value="Excavation Clearance">Excavation Clearance</option>

                        {/* TRAVEL */}
                        <option value="Travel Permit">Travel Permit</option>
                        <option value="Tricycle Franchise Clearance">Tricycle Franchise Clearance</option>

                        {/* EVENTS */}
                        <option value="Barangay Event Permit">Barangay Event Permit</option>
                        <option value="Videoke Permit">Videoke Permit</option>

                        {/* MDRR */}
                        <option value="Disaster Assistance Certificate">Disaster Assistance Certificate</option>
                        <option value="Calamity Assistance Certificate">Calamity Assistance Certificate</option>
                        <option value="Emergency Verification Certificate">Emergency Verification Certificate</option>

                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Purpose</label>
                      <input
                        name="purpose"
                        className="form-control"
                        placeholder="e.g. Employment, School Requirement"
                        value={form.purpose}
                        onChange={handleChange}
                      />
                    </div>

                  </div>
                </div>

                {/* ================= BUSINESS SECTION ================= */}
                {(form.document_type === "Business Permit" ||
                  form.document_type === "Business Clearance" ||
                  form.document_type === "Mayor's Permit Endorsement") && (
                  <div className="p-3 border rounded-3 bg-light">

                    <h6 className="text-warning fw-bold">🏢 Business Information</h6>

                    <div className="row g-2 mt-2">

                      <div className="col-md-6">
                        <label className="form-label">Company Name</label>
                        <input
                          name="company_name"
                          className="form-control"
                          placeholder="ABC Trading"
                          value={form.company_name}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Nature of Business</label>
                        <input
                          name="business_nature"
                          className="form-control"
                          placeholder="Retail / Food / Services"
                          value={form.business_nature}
                          onChange={handleChange}
                        />
                      </div>

                    </div>

                    <small className="text-muted">
                      Required for business-related documents
                    </small>

                  </div>
                )}

              </div>

              {/* ================= FOOTER ================= */}
              <div className="modal-footer border-0 d-flex justify-content-between">

                <small className="text-muted">
                  <span className="text-danger">*</span> Required fields
                </small>

                <div className="d-flex gap-2">

                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="btn btn-primary px-4">
                    Submit Request
                  </button>

                </div>

              </div>

            </form>

          </div>
        </div>
      </div>
    )}

     {showActionModal && selectedCert && (
      <div
        className="modal d-block"
        style={{
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 rounded-4 overflow-hidden shadow">

            {/* HEADER */}
            <div className="p-4 border-bottom bg-white d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1 fw-bold">Certificate Request</h5>
                <small className="text-muted">Review application details</small>
              </div>

              <button
                className="btn-close"
                onClick={() => setShowActionModal(false)}
              />
            </div>

            {/* BODY */}
            <div className="p-4 bg-white">

              {/* STATUS */}
              <div className="mb-3">
                <span
                  className={`px-3 py-1 rounded-pill small fw-semibold ${
                    selectedCert.status === "approved"
                      ? "bg-success text-white"
                      : selectedCert.status === "rejected"
                      ? "bg-danger text-white"
                      : "bg-warning text-dark"
                  }`}
                >
                  {selectedCert.status?.toUpperCase()}
                </span>
              </div>

              {/* CONTENT */}
              <div className="row g-3">

                <div className="col-md-6">
                  <div>
                    <small className="text-muted">Full Name</small>
                    <div className="fw-semibold">{selectedCert.full_name}</div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div>
                    <small className="text-muted">Age / Gender</small>
                    <div className="fw-semibold">
                      {selectedCert.age} • {selectedCert.gender}
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div>
                    <small className="text-muted">Address</small>
                    <div className="fw-semibold">{selectedCert.address}</div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div>
                    <small className="text-muted">Document Type</small>
                    <div className="fw-semibold">{selectedCert.document_type}</div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div>
                    <small className="text-muted">Purpose</small>
                    <div className="fw-semibold">{selectedCert.purpose}</div>
                  </div>
                </div>

                {selectedCert.company_name && (
                  <div className="col-md-6">
                    <div>
                      <small className="text-muted">Company</small>
                      <div className="fw-semibold">{selectedCert.company_name}</div>
                    </div>
                  </div>
                )}

                {selectedCert.business_nature && (
                  <div className="col-md-6">
                    <div>
                      <small className="text-muted">Business Nature</small>
                      <div className="fw-semibold">
                        {selectedCert.business_nature}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* FOOTER */}
            <div className="p-3 bg-light d-flex justify-content-end gap-2">

              <button
                className="btn btn-outline-danger"
                onClick={() => {
                  updateStatus(selectedCert.id, "rejected");
                  setShowActionModal(false);
                }}
              >
                Reject
              </button>

              <button
                className="btn btn-success"
                onClick={() => {
                  updateStatus(selectedCert.id, "approved");
                  setShowActionModal(false);
                }}
              >
                Approve
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

    </div>
  );
}