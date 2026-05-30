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
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">

        <div className="position-relative" style={{ width: "350px" }}>

            {/* SEARCH ICON */}
            <i
              className="bi bi-search position-absolute"
              style={{
                top: "50%",
                left: "12px",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            />

            {/* INPUT */}
            <input
              className="form-control"
              placeholder="Search blotter..."
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                setSearch(value);
                setPage(1);
                fetchBlotters(1, value);
              }}
              style={{
                paddingLeft: "40px",
                paddingRight: "40px",
              }}
            />

            {/* CLEAR BUTTON (X) */}
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  fetchBlotters(1, "");
                }}
                className="btn p-0 border-0 position-absolute"
                style={{
                  top: "50%",
                  right: "12px",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  color: "#94a3b8",
                }}
              >
                <i className="bi bi-x-circle-fill" style={{ fontSize: "16px" }} />
              </button>
            )}

          </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-lg me-1"></i>
          Add Blotter
        </button>

      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">

                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Blotter number</th>
                    <th>Complainant</th>
                    <th>Respondent</th>
                    <th>Incident</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {blotters.length > 0 ? (
                    blotters.map((b, i) => (
                      <tr key={b.id}>
                        <td>{(page - 1) * 10 + i + 1}</td>
                        <td>{b.blotter_number}</td>
                        <td>{b.complainant_name}</td>
                        <td>{b.respondent_name ? b.respondent_name : "-"}</td>
                        <td>{b.incident_type}</td>
                        <td>{b.incident_location}</td>
                        <td>
                            {new Date(b.incident_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "2-digit",
                            })}
                          </td>
                          <td>
                            {b.incident_time
                              ? new Date(`1970-01-01T${b.incident_time}`).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )
                              : "-"}
                          </td>

                        <td>
                          <span className={`badge ${
                            b.status === "Resolved"
                              ? "bg-success"
                              : b.status === "Ongoing"
                              ? "bg-warning text-dark"
                              : b.status === "Dismissed"
                              ? "bg-danger"
                              : "bg-secondary"
                          }`}>
                            {b.status}
                          </span>
                        </td>

                        <td className="text-end d-flex gap-2 justify-content-end">

                          {/* VIEW */}
                          <button
                            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                            onClick={() => {
                              setSelectedBlotter(b);
                              setShowActionModal(true);
                            }}
                          >
                            <i className="bi bi-eye"></i>
                            <span>View</span>
                          </button>

                          {/* DELETE */}
                          <button
                            className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                            onClick={() => handleDelete(b.id)}
                          >
                            <i className="bi bi-trash"></i>
                            <span>Delete</span>
                          </button>

                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center py-5">
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
                              No blotters found
                            </h6>

                          </div>
                        </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          )}

          {/* PAGINATION */}
         <div className="d-flex justify-content-center align-items-center mt-4 gap-2 flex-wrap">

          {/* PREV */}
          <button
            className="btn btn-light border rounded-pill px-3"
            disabled={page === 1}
            onClick={() => fetchBlotters(page - 1, search)}
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
                onClick={() => fetchBlotters(p, search)}
              >
                {p}
              </button>
            )
          )}

          {/* NEXT */}
          <button
            className="btn btn-light border rounded-pill px-3"
            disabled={page === lastPage}
            onClick={() => fetchBlotters(page + 1, search)}
          >
            Next →
          </button>

        </div>

        </div>
      </div>

      {/* VIEW / ACTION MODAL */}
      {showActionModal && selectedBlotter && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">

              {/* HEADER */}
              <div className="p-4 border-bottom d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="fw-bold mb-1">Blotter Details</h5>
                  <small className="text-muted">
                    Case #: {selectedBlotter.blotter_number || "N/A"}
                  </small>
                </div>

                <button
                  className="btn-close"
                  onClick={() => setShowActionModal(false)}
                />
              </div>

              {/* BODY */}
              <div className="p-4">

                {/* STATUS BADGE */}
                <div className="mb-3">
                  <span
                    className={`px-3 py-1 rounded-pill small fw-semibold ${
                      selectedBlotter.status === "Resolved"
                        ? "bg-success text-white"
                        : selectedBlotter.status === "Ongoing"
                        ? "bg-warning text-dark"
                        : selectedBlotter.status === "Dismissed"
                        ? "bg-danger text-white"
                        : "bg-secondary text-white"
                    }`}
                  >
                    {selectedBlotter.status}
                  </span>
                </div>

                {/* GRID DETAILS */}
                <div className="row g-3">

                  <div className="col-md-6">
                    <div className="border rounded-3 p-3 bg-light">
                      <small className="text-muted">Incident Type</small>
                      <div className="fw-semibold">{selectedBlotter.incident_type}</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded-3 p-3 bg-light">
                      <small className="text-muted">Location</small>
                      <div className="fw-semibold">
                        {selectedBlotter.incident_location}
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="border rounded-3 p-3 bg-light">
                      <small className="text-muted">Details</small>
                      <div className="fw-semibold">
                        {selectedBlotter.incident_details}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded-3 p-3 bg-light">
                      <small className="text-muted">Complainant</small>
                      <div className="fw-semibold">
                        {selectedBlotter.complainant_name}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="border rounded-3 p-3 bg-light">
                      <small className="text-muted">Respondent</small>
                      <div className="fw-semibold">
                        {selectedBlotter.respondent_name || "N/A"}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="p-3 border-top bg-white d-flex justify-content-end gap-2">

                <button
                  className="btn btn-warning d-flex align-items-center gap-1"
                  onClick={() =>
                    updateStatus(selectedBlotter.id, "Ongoing")
                  }
                >
                  <i className="bi bi-arrow-repeat"></i>
                  Ongoing
                </button>

                <button
                  className="btn btn-success d-flex align-items-center gap-1"
                  onClick={() =>
                    updateStatus(selectedBlotter.id, "Resolved")
                  }
                >
                  <i className="bi bi-check-circle"></i>
                  Resolved
                </button>

                <button
                  className="btn btn-danger d-flex align-items-center gap-1"
                  onClick={() =>
                    updateStatus(selectedBlotter.id, "Dismissed")
                  }
                >
                  <i className="bi bi-x-circle"></i>
                  Dismiss
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


      {showModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "950px" }}>
            <div className="modal-content rounded-4 shadow">

              {/* HEADER */}
              <div className="modal-header border-0">
                <div>
                  <h5 className="fw-bold mb-0">Add Blotter Record</h5>
                  <small className="text-muted">
                    Fields marked with <span className="text-danger">*</span> are required
                  </small>
                </div>

                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">

                  {/* ================= INCIDENT INFO ================= */}
                  <div className="mb-3">
                    <h6 className="fw-semibold text-primary">Incident Information</h6>
                    <hr />

                    <div className="row g-3">

                      {/* INCIDENT TYPE */}
                      <div className="col-md-6">
                        <label className="form-label">
                          Incident Type <span className="text-danger">*</span>
                        </label>

                        <select
                          name="incident_type"
                          className="form-control border-primary"
                          value={form.incident_type}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select incident type</option>
                          <option>Theft</option>
                          <option>Assault</option>
                          <option>Domestic Violence</option>
                          <option>Alarm and Scandal</option>
                          <option>Property Damage</option>
                          <option>Threat</option>
                          <option>Missing Person</option>
                          <option>Fire Incident</option>
                          <option>Disaster Incident</option>
                          <option>Others</option>
                        </select>
                      </div>

                      {/* CATEGORY */}
                      <div className="col-md-6">
                        <label className="form-label">Category</label>
                        <input
                          name="incident_category"
                          className="form-control"
                          placeholder="Optional"
                          value={form.incident_category}
                          onChange={handleChange}
                        />
                      </div>

                      {/* DATE */}
                      <div className="col-md-6">
                        <label className="form-label">
                          Date <span className="text-danger">*</span>
                        </label>

                        <input
                          type="date"
                          name="incident_date"
                          className="form-control border-primary"
                          value={form.incident_date}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* TIME */}
                      <div className="col-md-6">
                        <label className="form-label">Time</label>
                        <input
                          type="time"
                          name="incident_time"
                          className="form-control"
                          value={form.incident_time}
                          onChange={handleChange}
                        />
                      </div>

                      {/* LOCATION */}
                      <div className="col-12">
                        <label className="form-label">
                          Location <span className="text-danger">*</span>
                        </label>

                        <input
                          name="incident_location"
                          className="form-control border-primary"
                          placeholder="Exact incident location"
                          value={form.incident_location}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* DETAILS */}
                      <div className="col-12">
                        <label className="form-label">
                          Incident Details <span className="text-danger">*</span>
                        </label>

                        <textarea
                          name="incident_details"
                          className="form-control border-primary"
                          placeholder="Describe what happened..."
                          value={form.incident_details}
                          onChange={handleChange}
                          required
                        />
                      </div>

                    </div>
                  </div>

                  {/* ================= PEOPLE ================= */}
                  <div className="mb-3">
                    <h6 className="fw-semibold text-primary">People Involved</h6>
                    <hr />

                    <div className="row g-3">

                      {/* COMPLAINANT */}
                      <div className="col-md-6">
                        <label className="form-label">
                          Complainant <span className="text-danger">*</span>
                        </label>

                        <input
                          name="complainant_name"
                          className="form-control border-primary"
                          placeholder="Full name"
                          value={form.complainant_name}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Contact</label>
                        <input
                          name="complainant_contact"
                          className="form-control"
                          placeholder="Optional"
                          value={form.complainant_contact}
                          onChange={handleChange}
                        />
                      </div>

                      {/* RESPONDENT */}
                      <div className="col-md-6">
                        <label className="form-label">Respondent</label>
                        <input
                          name="respondent_name"
                          className="form-control"
                          placeholder="Optional"
                          value={form.respondent_name}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Contact</label>
                        <input
                          name="respondent_contact"
                          className="form-control"
                          placeholder="Optional"
                          value={form.respondent_contact}
                          onChange={handleChange}
                        />
                      </div>

                    </div>
                  </div>

                  {/* ================= CLASSIFICATION ================= */}
                  <div>
                    <h6 className="fw-semibold text-primary">Classification</h6>
                    <hr />

                    <div className="row g-3">

                      {/* STATUS */}
                      <div className="col-md-6">
                        <label className="form-label">Status</label>
                        <select
                          name="status"
                          className="form-control"
                          value={form.status || "Pending"}
                          onChange={handleChange}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Ongoing">Ongoing</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Dismissed">Dismissed</option>
                        </select>
                      </div>

                      {/* PRIORITY */}
                      <div className="col-md-6">
                        <label className="form-label">Priority Level</label>
                        <select
                          name="priority_level"
                          className="form-control"
                          value={form.priority_level || "Medium"}
                          onChange={handleChange}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>

                    </div>
                  </div>

                </div>

                {/* FOOTER */}
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="btn btn-primary px-4">
                    Save Blotter
                  </button>
                </div>

              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}