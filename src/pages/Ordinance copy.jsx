import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Ordinance() {
  const [ordinances, setOrdinances] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const token = localStorage.getItem("token");

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | view | edit

  const [selectedOrdinance, setSelectedOrdinance] = useState(null);

  const [form, setForm] = useState({
    ordinance_number: "",
    title: "",
    description: "",
    category: "",
    status: "active",
    effectivity_date: "",
    approved_date: "",
    penalties: "",
  });

  // ================= FETCH =================
  const fetchOrdinances = async (pageNum = 1, searchTerm = "") => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/ordinances?page=${pageNum}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      setOrdinances(data.data || []);
      setPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch {
      toast.error("Failed to load ordinances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdinances(1, "");
  }, []);

  // ================= FORM =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      ordinance_number: "",
      title: "",
      description: "",
      category: "",
      status: "active",
      effectivity_date: "",
      approved_date: "",
      penalties: "",
    });
  };

  // ================= CREATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://ajcpisonet.com/api/ordinances", {
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
        toast.error(result.message || "Failed to create ordinance");
        return;
      }

      toast.success("Ordinance created");

      setModalOpen(false);
      setMode("create");
      resetForm();

      fetchOrdinances(page, search);
    } catch {
      toast.error("Server error");
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/ordinances/${selectedOrdinance.id}`,
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

      toast.success("Ordinance updated");

      setModalOpen(false);
      setMode("create");
      setSelectedOrdinance(null);

      resetForm();
      fetchOrdinances(page, search);
    } catch {
      toast.error("Server error");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!confirm("Delete this ordinance?")) return;

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/ordinances/${id}`,
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

      toast.success("Deleted");
      fetchOrdinances(page, search);
    } catch {
      toast.error("Server error");
    }
  };

  // ================= PAGINATION =================
  const getPages = () => {
    const delta = 2;
    const range = [];
    const result = [];
    let l;

    for (let i = 1; i <= lastPage; i++) {
      if (i === 1 || i === lastPage || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) result.push(l + 1);
        else if (i - l !== 1) result.push("...");
      }
      result.push(i);
      l = i;
    });

    return result;
  };

  // ================= UI =================
  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-3">

        <div className="position-relative" style={{ width: "350px" }}>

          <input
            className="form-control pe-5"
            placeholder="Search ordinance..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              setPage(1);
              fetchOrdinances(1, value);
            }}
          />

          {/* CLEAR BUTTON */}
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
                fetchOrdinances(1, "");
              }}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                fontSize: "18px",
                cursor: "pointer",
                color: "#888",
              }}
              title="Clear search"
            >
              ×
            </button>
          )}

        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setSelectedOrdinance(null);
            setMode("create");
            setModalOpen(true);
          }}
        >
          + Add Ordinance
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
                    <th>Ordinance #</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {ordinances.length > 0 ? (
                    ordinances.map((o, i) => (
                      <tr key={o.id}>
                        <td>{(page - 1) * 10 + i + 1}</td>
                        <td>{o.ordinance_number || "-"}</td>
                        <td>{o.title}</td>
                        <td>{o.category || "-"}</td>

                        <td>
                          <span className={`badge ${
                            o.status === "active"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}>
                            {o.status}
                          </span>
                        </td>

                        <td className="text-end d-flex gap-2 justify-content-end">

                          {/* VIEW */}
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setForm(o);
                              setSelectedOrdinance(o);
                              setMode("view");
                              setModalOpen(true);
                            }}
                          >
                            View
                          </button>

                          {/* DELETE */}
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
                              No ordinance found
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
          <div className="d-flex justify-content-center gap-2 mt-3">

            <button
              className="btn btn-light border rounded-pill px-3"
              disabled={page === 1}
              onClick={() => fetchOrdinances(page - 1, search)}
            >
              ← Prev
            </button>

            {getPages().map((p, i) =>
              p === "..." ? (
                <span key={i} className="px-2">...</span>
              ) : (
                
                <button
                  key={i}
                  className={`btn rounded-pill ${
                    p === page ? "btn-primary shadow-sm" : "btn-light border"
                  }`}
                  onClick={() => fetchOrdinances(p, search)}
                  style={{ minWidth: "42px", height: "42px" }}
                >
                  {p}
                </button>
              )
            )}

            <button
              className="btn btn-light border rounded-pill px-3"
              disabled={page === lastPage}
              onClick={() => fetchOrdinances(page + 1, search)}
            >
              Next →
            </button>

          </div>

        </div>
      </div>

      {/* ================= MODAL ================= */}
      {modalOpen && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content p-4 rounded-4 shadow-lg">

              {/* HEADER */}
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="mb-0 fw-bold">
                    {mode === "create" && "➕ Create Ordinance"}
                    {mode === "view" && "📄 Ordinance Details"}
                    {mode === "edit" && "✏️ Edit Ordinance"}
                  </h5>

                  <small className="text-muted">
                    {mode === "create" && "Fill out the form to add a new ordinance"}
                    {mode === "view" && "Read ordinance information"}
                    {mode === "edit" && "Update ordinance information"}
                  </small>
                </div>

                <button
                  className="btn-close"
                  onClick={() => {
                    setModalOpen(false);
                    setMode("create");
                    resetForm();
                  }}
                />
              </div>

              {/* ORDINANCE NUMBER (AUTO DISPLAY) */}
              {form.ordinance_number && (
                <div className="alert alert-light border mb-3">
                  <small className="text-muted">Ordinance Number</small>
                  <div className="fw-bold">
                    {form.ordinance_number}
                  </div>
                </div>
              )}

              {/* ================= FORM ================= */}
              <div className="row g-2">

                {/* TITLE */}
                <div className="col-12">
                  <label className="form-label">Title</label>
                  <input
                    className="form-control"
                    name="title"
                    placeholder="e.g. Traffic Regulation Ordinance"
                    value={form.title}
                    disabled={mode === "view"}
                    onChange={handleChange}
                    required
                  />
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
                    <option value="">Select category</option>
                    <option value="Safety">Safety</option>
                    <option value="Health">Health</option>
                    <option value="Traffic">Traffic</option>
                    <option value="Environment">Environment</option>
                    <option value="General">General</option>
                  </select>
                </div>

                {/* STATUS */}
                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={form.status}
                    disabled={mode === "view"}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="amended">Amended</option>
                    <option value="repealed">Repealed</option>
                  </select>
                </div>

                {/* DESCRIPTION */}
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    name="description"
                    placeholder="Full ordinance description..."
                    value={form.description}
                    disabled={mode === "view"}
                    onChange={handleChange}
                  />
                </div>

                {/* EFFECTIVITY DATE */}
                <div className="col-md-6">
                  <label className="form-label">Effectivity Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="effectivity_date"
                    value={form.effectivity_date || ""}
                    disabled={mode === "view"}
                    onChange={handleChange}
                  />
                </div>

                {/* APPROVED DATE */}
                <div className="col-md-6">
                  <label className="form-label">Approved Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="approved_date"
                    value={form.approved_date || ""}
                    disabled={mode === "view"}
                    onChange={handleChange}
                  />
                </div>

                {/* PENALTIES */}
                <div className="col-12">
                  <label className="form-label">Penalties</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    name="penalties"
                    placeholder="e.g. Fine of ₱500 or community service..."
                    value={form.penalties || ""}
                    disabled={mode === "view"}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* ================= FOOTER ================= */}
              <div className="d-flex justify-content-between align-items-center mt-4">

                {/* LEFT INFO */}
                <small className="text-muted">
                  {mode === "create" && "Fill all required fields before saving"}
                  {mode === "view" && "Click Edit to modify this ordinance"}
                  {mode === "edit" && "Make changes then click Update"}
                </small>

                {/* RIGHT BUTTONS */}
                <div className="d-flex gap-2">

                  {/* CREATE MODE */}
                  {mode === "create" && (
                    <button className="btn btn-primary px-4" onClick={handleSubmit}>
                      Save Ordinance
                    </button>
                  )}

                  {/* VIEW MODE */}
                  {mode === "view" && (
                    <button
                      className="btn btn-warning px-4"
                      onClick={() => setMode("edit")}
                    >
                      Edit
                    </button>
                  )}

                  {/* EDIT MODE */}
                  {mode === "edit" && (
                    <button
                      className="btn btn-success px-4"
                      onClick={handleUpdate}
                    >
                      Update
                    </button>
                  )}

                  <button
                    className="btn btn-dark px-4"
                    onClick={() => {
                      setModalOpen(false);
                      setMode("create");
                      resetForm();
                    }}
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