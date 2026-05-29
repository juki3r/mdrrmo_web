import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Officials() {
  const [officials, setOfficials] = useState([]);
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
    full_name: "",
    gender: "",
    position: "",
    committee: "",
    address: "",
    contact_number: "",
    email: "",
    term_start: "",
    term_end: "",
    status: "active",
    remarks: "",
    photo: null,
  });

  // ================= FETCH =================
  const fetchOfficials = async (pageNum = 1, searchTerm = "") => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/officials?page=${pageNum}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      setOfficials(data.data || []);
      setPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch {
      toast.error("Failed to load officials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficials(1, "");
  }, []);

  // ================= CHANGE =================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: false,
    });
  };

  // ================= FILE =================
  const handleFile = (e) => {
    setForm({
      ...form,
      photo: e.target.files[0],
    });
  };

  // ================= RESET =================
  const resetForm = () => {
    setForm({
      id: null,
      full_name: "",
      gender: "",
      position: "",
      committee: "",
      address: "",
      contact_number: "",
      email: "",
      term_start: "",
      term_end: "",
      status: "active",
      remarks: "",
      photo: null,
    });

    setErrors({});
  };

  // ================= VALIDATION =================
  const validate = () => {
    const err = {};

    if (!form.full_name) err.full_name = true;
    if (!form.position) err.position = true;

    setErrors(err);

    return Object.keys(err).length === 0;
  };

  // ================= CREATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (form[key] !== null) {
          formData.append(key, form[key]);
        }
      });

      const res = await fetch(
        "https://ajcpisonet.com/api/officials",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed");
        return;
      }

      toast.success("Official created");

      setShowModal(false);
      resetForm();
      fetchOfficials(page, search);
    } catch {
      toast.error("Server error");
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    if (!validate()) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (form[key] !== null) {
          formData.append(key, form[key]);
        }
      });

      formData.append("_method", "PUT");

      const res = await fetch(
        `https://ajcpisonet.com/api/officials/${form.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Update failed");
        return;
      }

      toast.success("Official updated");

      setShowModal(false);
      resetForm();
      fetchOfficials(page, search);
    } catch {
      toast.error("Server error");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this official?")) return;

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/officials/${id}`,
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

      toast.success("Official deleted");

      fetchOfficials(page, search);
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

        <div style={{ width: "350px" }} className="position-relative">

          <i className="bi bi-search position-absolute"
            style={{
              top: "50%",
              left: "14px",
              transform: "translateY(-50%)",
              color: "#94a3b8"
            }}
          />

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
                placeholder="Search officials..."
                value={search}
                onChange={(e) => {
                const value = e.target.value;
                setSearch(value);
                fetchOfficials(1, value);
                }}
                style={{
                height: "46px",
                borderRadius: "14px",
                background: "#f8fafc",
                paddingLeft: "42px",
                paddingRight: "42px",
                }}
            />

            {/* ❌ CLEAR BUTTON */}
            {search && (
                <button
                type="button"
                className="btn p-0 border-0 position-absolute"
                onClick={() => {
                    setSearch("");
                    fetchOfficials(1, "");
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

        </div>

        <button
          className="btn btn-primary d-flex align-items-center gap-2 px-3"
          onClick={() => {
            resetForm();
            setMode("create");
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-lg"></i>
          Add Official
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

                <table className="table table-hover align-middle">

                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {officials.length > 0 ? (
                      officials.map((o, i) => (
                        <tr key={o.id}>

                          <td>{(page - 1) * 10 + i + 1}</td>

                          <td className="fw-semibold">
                            {o.photo && (
                              <img
                                src={`https://ajcpisonet.com/${o.photo}`}
                                width="35"
                                height="35"
                                className="rounded-circle me-2"
                              />
                            )}
                            {o.full_name}
                          </td>

                          <td>{o.position}</td>
                          <td>{o.contact_number || "-"}</td>

                          <td>
                            <span className="badge bg-success">
                              {o.status}
                            </span>
                          </td>

                          <td className="text-end">

                            <button
                              className="btn btn-primary btn-sm me-1"
                              onClick={() => {
                                setForm(o);
                                setMode("view");
                                setShowModal(true);
                              }}
                            >
                              View
                            </button>

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(o.id)}
                            >
                              Delete
                            </button>

                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          No officials found
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
                  onClick={() => fetchOfficials(page - 1, search)}
                >
                  ← Prev
                </button>

                {getPages().map((p, idx) =>
                  p === "..." ? (
                    <span key={idx} className="px-2 text-muted">...</span>
                  ) : (
                    <button
                      key={idx}
                      className={`btn rounded-circle ${
                        p === page ? "btn-primary" : "btn-light border"
                      }`}
                      style={{ width: "42px", height: "42px" }}
                      onClick={() => fetchOfficials(p, search)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  className="btn btn-light border rounded-pill px-3"
                  disabled={page === lastPage}
                  onClick={() => fetchOfficials(page + 1, search)}
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
    style={{ background: "rgba(0,0,0,0.6)" }}
  >
    <div className="modal-dialog modal-lg modal-dialog-centered">
      <div className="modal-content rounded-4 border-0 shadow-lg">

        {/* HEADER */}
        <div className="modal-header border-0">
          <div>
            <h5 className="fw-bold mb-0">
              {mode === "create"
                ? "➕ Add Official"
                : mode === "view"
                ? "👤 Official Details"
                : "✏️ Edit Official"}
            </h5>
            <small className="text-muted">
              Barangay Officials Management
            </small>
          </div>

          <button
            className="btn-close"
            onClick={() => setShowModal(false)}
          />
        </div>

        <div className="modal-body">

          {/* PHOTO */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Profile Photo
            </label>

            <input
              type="file"
              className="form-control"
              disabled={mode === "view"}
              onChange={handleFile}
            />
          </div>

          {/* ================= BASIC INFO ================= */}
          <div className="mb-3">
            <h6 className="text-primary fw-bold">📌 Basic Information</h6>

            <div className="row g-3 mt-1">

              {/* FULL NAME */}
              <div className="col-md-6">
                <label className="form-label">
                  Full Name <span className="text-danger">*</span>
                </label>

                <input
                  className={`form-control ${errors.full_name ? "border-danger" : ""}`}
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Juan Dela Cruz"
                  disabled={mode === "view"}
                />
              </div>

              {/* POSITION */}
              <div className="col-md-6">
                <label className="form-label">
                  Position <span className="text-danger">*</span>
                </label>

                <select
                    className={`form-select ${errors.position ? "border-danger" : ""}`}
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    >
                    <option value="">Select Position</option>
                    <option value="Barangay Captain">Barangay Captain</option>
                    <option value="Kagawad">Barangay Kagawad</option>
                    <option value="Secretary">Barangay Secretary</option>
                    <option value="Treasurer">Barangay Treasurer</option>
                    <option value="SK Chairperson">SK Chairperson</option>
                    <option value="SK Kagawad">SK Kagawad</option>
                </select>
              </div>

              {/* GENDER */}
              <div className="col-md-6">
                <label className="form-label">Gender</label>

                <select
                  className="form-select"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  disabled={mode === "view"}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* COMMITTEE */}
              <div className="col-md-6">
                <label className="form-label">Committee</label>

                <select
                    className="form-select"
                    name="committee"
                    value={form.committee}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    >
                    <option value="">Select Committee</option>
                    <option value="Peace and Order">Peace and Order</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Environmental Protection">Environmental Protection</option>
                    <option value="Finance & Budget">Finance & Budget</option>
                    <option value="Social Services">Social Services</option>
                    <option value="Youth & Sports">Youth & Sports</option>
                </select>
              </div>

            </div>
          </div>

          {/* ================= CONTACT INFO ================= */}
          <div className="mb-3">
            <h6 className="text-primary fw-bold">📞 Contact Information</h6>

            <div className="row g-3 mt-1">

              {/* CONTACT NUMBER */}
              <div className="col-md-6">
                <label className="form-label">Contact Number</label>

                <input
                  className="form-control"
                  name="contact_number"
                  value={form.contact_number}
                  onChange={handleChange}
                  placeholder="09xxxxxxxxx"
                  disabled={mode === "view"}
                />
              </div>

              {/* EMAIL */}
              <div className="col-md-6">
                <label className="form-label">Email</label>

                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  disabled={mode === "view"}
                />
              </div>

              {/* ADDRESS */}
              <div className="col-12">
                <label className="form-label">Address</label>

                <input
                  className="form-control"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Purok / Street / Barangay"
                  disabled={mode === "view"}
                />
              </div>

            </div>
          </div>

          {/* ================= TERM INFO ================= */}
          <div className="mb-3">
            <h6 className="text-primary fw-bold">📅 Term Information</h6>

            <div className="row g-3 mt-1">

              <div className="col-md-6">
                <label className="form-label">Term Start</label>

                <input
                  type="date"
                  className="form-control"
                  name="term_start"
                  value={form.term_start}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Term End</label>

                <input
                  type="date"
                  className="form-control"
                  name="term_end"
                  value={form.term_end}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
              </div>

            </div>
          </div>

          {/* STATUS */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Status</label>

            <select
              className="form-select"
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={mode === "view"}
            >
              <option value="active">🟢 Active</option>
              <option value="inactive">🟡 Inactive</option>
              <option value="former">🔴 Former</option>
            </select>
          </div>

          {/* REMARKS */}
          <div className="mb-2">
            <label className="form-label fw-semibold">Remarks</label>

            <textarea
              className="form-control"
              rows="3"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              placeholder="Optional notes..."
              disabled={mode === "view"}
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
              <button className="btn btn-primary px-4" onClick={handleSubmit}>
                Save Official
              </button>
            )}

            {mode === "edit" && (
              <button className="btn btn-success px-4" onClick={handleUpdate}>
                Update
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