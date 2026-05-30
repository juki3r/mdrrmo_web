import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Residents() {
  const token = localStorage.getItem("token");

  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedResident, setSelectedResident] = useState(null);

  const [showActionModal, setShowActionModal] = useState(false);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  

  const [filters, setFilters] = useState({
    gender: "",
    civil_status: "",
    is_voter: "",
  });

  const emptyForm = {
    first_name: "",
    middle_name: "",
    last_name: "",

    purok_zone: "",
    household_number: "",

    mobile_number: "",
    gender: "",
    birth_date: "",
    civil_status: "",
  };

  const [form, setForm] = useState(emptyForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= FETCH =================
  const fetchResidents = async (pageNum = 1, searchTerm = "", currentFilters = filters) => {
    setLoading(true);

    try {
      const query = new URLSearchParams({
        page: pageNum,
        search: searchTerm,
        gender: currentFilters.gender,
        civil_status: currentFilters.civil_status,
        is_voter: currentFilters.is_voter,
      });

      const res = await fetch(
        `https://ajcpisonet.com/api/residents?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      setResidents(data.data || []);
      setPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch {
      toast.error("Failed to load residents");
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
    fetchResidents(page, search);
  }, [
    page,
    search,
    filters.gender,
    filters.civil_status,
    filters.is_voter
  ]);

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!confirm("Delete this resident?")) return;

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/residents/${id}`,
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

      toast.success("Resident deleted");
      fetchResidents(page, search);
    } catch {
      toast.error("Server error");
    }
  };

  const handleUpdate = async () => {
  try {
    const res = await fetch(
      `https://ajcpisonet.com/api/residents/${editForm.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(editForm),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Update failed");
      return;
    }

    toast.success("Resident updated");

    setShowEditModal(false);
    setEditForm(null);

    fetchResidents(page, search);
  } catch {
    toast.error("Server error");
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("https://ajcpisonet.com/api/residents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Failed to create resident");
      return;
    }

    toast.success("Resident added successfully");

    setModalOpen(false);
    setForm(emptyForm);

    fetchResidents(page, search);
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

  const formatMobile = (num) => {
    if (!num) return "-";

    const cleaned = num.replace(/\D/g, ""); // remove non-numbers

    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }

    return num; // fallback if not 11 digits
  };

  return (
    <div className="container-fluid py-4">

      {/* ================= HEADER ================= */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Residents</h5>

            <button
              className="btn btn-primary"
              onClick={() => {
                setForm(emptyForm);
                setMode("create");
                setModalOpen(true);
              }}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add Resident
            </button>
          </div>
          <div className="row mb-3">
            <div className="col">
              {/* SEARCH */}
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  className="form-control"
                  placeholder="Search residents..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
            {/* GENDER */}
              <div className="col-md-2">
                <select
                  className="form-select form-select-sm"
                  value={filters.gender}
                  onChange={(e) => {
                      const value = e.target.value;

                      setFilters((prev) => ({
                        ...prev,
                        gender: value,
                      }));

                      setPage(1); // reset page when filtering
                    }}
                >
                  <option value="">All Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* CIVIL STATUS */}
              <div className="col-md-2">
                <select
                  className="form-select form-select-sm"
                  value={filters.civil_status}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      civil_status: e.target.value,
                    }));
                    setPage(1);
                  }}
                >
                  <option value="">All Civil Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>

              {/* VOTER */}
              <div className="col-md-2">
                <select
                  className="form-select form-select-sm"
                  value={filters.is_voter}
                  onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        is_voter: e.target.value,
                      }));
                      setPage(1);
                    }}
                >
                  <option value="">All Voters</option>
                  <option value="1">Voter</option>
                  <option value="0">Non-Voter</option>
                </select>
              </div>

            </div>

          </div>

          

          <div className="row g-2 mt-3">

  

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
                    <th>Gender</th>
                    <th>Barangay</th>
                    <th>Purok</th>
                    <th>Contact</th>
                    <th>Age</th>
                    <th>Civil Status</th>
                    <th>Voter</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {residents.length > 0 ? (
                    residents.map((r, i) => (
                      <tr
                        key={r.id}
                        onClick={() => {
                          setSelectedResident(r);
                          setShowActionModal(true);
                        }}
                        style={{ cursor: "pointer" }}
                      >

                        <td>{(page - 1) * 10 + i + 1}</td>

                        <td className="fw-semibold text-capitalize">
                          {r.first_name} {r.last_name}
                        </td>
                        <td>{r.gender}</td>

                        <td className="text-capitalize">{r.barangay || "-"}</td>
                        <td className="text-capitalize">{r.purok_zone || "-"}</td>

                        <td>{formatMobile(r.mobile_number) || "-"}</td>

                        <td>
                          {r.birth_date
                            ? new Date().getFullYear() -
                              new Date(r.birth_date).getFullYear()
                            : "-"}
                        </td>
                        <td className="text-capitalize">{r.civil_status || "-"}</td>

                        <td>
                          <span className={`badge ${r.is_voter ? "bg-primary" : "bg-secondary"}`}>
                            {r.is_voter ? "Yes" : "No"}
                          </span>
                        </td>

                        <td className="text-end">

                          <button
                            className="btn btn-sm btn-outline-warning me-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditForm(r);
                              setShowEditModal(true);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedResident(r);
                              setShowActionModal(true);
                            }}
                          >
                            View
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(r.id);
                            }}
                          >
                            Delete
                          </button>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        No residents found
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
                  <button
                    className="page-link"
                    onClick={() => fetchResidents(page - 1, search)}
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
                    <li key={i} className={`page-item ${p === page ? "active" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => fetchResidents(p, search)}
                      >
                        {p}
                      </button>
                    </li>
                  )
                )}

                <li className={`page-item ${page === lastPage ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => fetchResidents(page + 1, search)}
                  >
                    Next
                  </button>
                </li>

              </ul>

            </div>
          )}

        </div>
      </div>

      {/* ================= VIEW MODAL ================= */}
      {showActionModal && selectedResident && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">

              {/* HEADER */}
              <div className="modal-header py-2 px-3">
                <div>
                  <h6 className="mb-0 fw-bold">Resident Profile</h6>
                  <small className="text-muted" style={{ fontSize: "11px" }}>
                    Basic information overview
                  </small>
                </div>

                <button
                  className="btn-close"
                  onClick={() => setShowActionModal(false)}
                />
              </div>

              {/* BODY */}
              <div className="modal-body p-3">

                {/* NAME CARD */}
                <div className="text-center mb-3">
                  <div
                    className="text-uppercase rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-2"
                    style={{ width: "60px", height: "60px", fontSize: "20px" }}
                  >
                    {selectedResident.first_name?.charAt(0)}
                    {selectedResident.last_name?.charAt(0)}
                  </div>

                  <h6 className="mb-0 fw-bold text-capitalize">
                    {selectedResident.first_name} {selectedResident.last_name}
                  </h6>

                  <small className="text-muted">
                    {selectedResident.barangay || "No barangay"}
                  </small>
                </div>

                {/* INFO GRID */}
                <div className="row g-2">

                  <div className="col-6">
                    <div className="border rounded-3 p-2">
                      <small className="text-muted">Gender</small>
                      <div className="fw-semibold">
                        {selectedResident.gender || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="border rounded-3 p-2">
                      <small className="text-muted">Mobile</small>
                      <div className="fw-semibold">
                        {formatMobile(selectedResident.mobile_number) || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="border rounded-3 p-2">
                      <small className="text-muted">Barangay</small>
                      <div className="fw-semibold">
                        {selectedResident.barangay || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="border rounded-3 p-2 d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Voter Status</small>
                        <div className="fw-semibold">
                          {selectedResident.is_voter ? "YES" : "NO"}
                        </div>
                      </div>

                
                    </div>
                  </div>

                </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer py-2 px-3">
                <button
                  className="btn btn-light btn-sm w-100"
                  onClick={() => setShowActionModal(false)}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {showEditModal && editForm && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content rounded-3">

              {/* HEADER */}
              <div className="modal-header">
                <h5 className="modal-title">Edit Resident</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                />
              </div>

              {/* BODY */}
              <div className="modal-body">

                <div className="row g-3">

                  <div className="col-6">
                    <label className="form-label ">First Name <span className="text-danger">*</span></label>
                    <input
                      className="form-control text-capitalize"
                      value={editForm.first_name || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, first_name: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-6">
                    <label className="form-label">Last Name <span className="text-danger">*</span></label>
                    <input
                      className="form-control text-capitalize"
                      value={editForm.last_name || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, last_name: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Gender <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={editForm.gender || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, gender: e.target.value })
                      }
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Civil Status <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={editForm.civil_status || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, civil_status: e.target.value })
                      }
                    >
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Purok / Sitio / Zone <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      value={editForm.purok_zone || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, purok_zone: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Mobile <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      value={editForm.mobile_number || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, mobile_number: e.target.value })
                      }
                    />
                  </div>

                </div>

              </div>

              {/* FOOTER */}
              <div className="modal-footer">

                <button
                  className="btn btn-light"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handleUpdate}
                >
                  Save Changes
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

      {modalOpen && mode === "create" && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-md modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 rounded-4 shadow">

              {/* HEADER */}
              <div className="modal-header py-2 px-3">
                <div>
                  <h6 className="mb-0 fw-bold">Add Resident</h6>
                  <small className="text-muted" style={{ fontSize: "11px" }}>
                    Quick barangay registration
                  </small>
                </div>

                <button
                  className="btn-close"
                  onClick={() => setModalOpen(false)}
                />
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-3">

                  

                  <div className="row g-2 mb-3">
                    {/* NAME */}
                    <div className="col-6">
                      <label className="form-label small mb-1">First Name <span className="text-danger">*</span></label>
                      <input
                        className="form-control form-control-sm text-capitalize"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small mb-1">Middle Name <span className="text-danger">*</span></label>
                      <input
                        className="form-control form-control-sm text-capitalize"
                        name="middle_name"
                        value={form.middle_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small mb-1">Last Name <span className="text-danger">*</span></label>
                      <input
                        className="form-control form-control-sm text-capitalize"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
             
       
                    <div className="col-6">
                        <label className="form-label small mb-1">Sitio / Purok / Zone <span className="text-danger">*</span></label>
                        <input
                          className="form-control form-control-sm mb-2 text-capitalize"
                          name="purok_zone"
                          value={form.purok_zone}
                          onChange={handleChange}
                          required
                        />
                    </div>


                    {/* CONTACT */}
                    <div className="col-6">
                      <label className="form-label small mb-1">Mobile Number <span className="text-danger">*</span></label>
                      <input
                        className="form-control form-control-sm"
                        name="mobile_number"
                        value={form.mobile_number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small mb-1">Household Number <span className="text-danger">*</span></label>
                        <input
                          className="form-control form-control-sm"
                          name="household_number"
                          value={form.household_number}
                          onChange={handleChange}
                          required
                        />
                    </div>


                  {/* BASIC INFO */}
         
                    <div className="col-6">
                      <label className="form-label small mb-1">Gender <span className="text-danger">*</span></label>
                      <select
                        className="form-select form-select-sm"
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    
                    <div className="col-6">
                      <label className="form-label small mb-1">Civil Status <span className="text-danger">*</span></label>
                      <select
                        className="form-select form-select-sm"
                        name="civil_status"
                        value={form.civil_status}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Civil Status *</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                    </div>
                  </div>

              

                </div>

                {/* FOOTER */}
                <div className="modal-footer py-2 px-3">
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="btn btn-primary btn-sm">
                    Save
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