import { space } from "postcss/lib/list";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Residents() {
  const token = localStorage.getItem("token");

  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedResident, setSelectedResident] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | view
  const [isEditing, setIsEditing] = useState(false);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [search, setSearch] = useState("");

  const emptyForm = {
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    civil_status: "",

    barangay: "",
    purok_zone: "",
    street_address: "",
    city_municipality: "",

    household_number: "",
    household_head: false,

    occupation: "",
    monthly_income: "",
    email: "",
    mobile_number: "",

    blood_type: "",
    disability_status: false,

    sss_number: "",
    tin_number: "",
    voters_id_number: "",
    is_voter: false,
  };

  const [form, setForm] = useState(emptyForm);

  const [editForm, setEditForm] = useState(emptyForm);

  // ================= FETCH =================
  const fetchResidents = async (
    pageNum = 1,
    searchTerm = ""
  ) => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/residents?page=${pageNum}&search=${searchTerm}`,
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
    fetchResidents(1, "");
  }, []);

  // ================= CREATE =================
  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "https://ajcpisonet.com/api/residents",
        {
          method: "POST",
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
        toast.error(
          result.message || "Failed to create"
        );
        return;
      }

      toast.success("Resident added");

      setModalOpen(false);

      setForm(emptyForm);

      fetchResidents();
    } catch {
      toast.error("Server error");
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/residents/${selectedResident.id}`,
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

      const result = await res.json();

      if (!res.ok) {
        toast.error(
          result.message || "Update failed"
        );
        return;
      }

      toast.success("Resident updated");

      setIsEditing(false);
      setModalOpen(false);
      setSelectedResident(null);

      fetchResidents();
    } catch {
      toast.error("Server error");
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "-";

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!confirm("Delete this resident?"))
      return;

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/residents/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        toast.error("Delete failed");
        return;
      }

      toast.success("Resident deleted");

      fetchResidents();
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
        (i >= page - delta &&
          i <= page + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2)
          rangeWithDots.push(l + 1);
        else if (i - l !== 1)
          rangeWithDots.push("...");
      }

      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  // ================= UI =================
  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-3 flex-wrap gap-2">

        <input
          className="form-control"
          style={{ width: "350px" }}
          placeholder="Search resident..."
          value={search}
          onChange={(e) => {
            const value = e.target.value;

            setSearch(value);
            setPage(1);

            fetchResidents(1, value);
          }}
        />

        <button
          className="btn btn-primary"
          onClick={() => {
            setForm(emptyForm);

            setModalOpen(true);
            setMode("create");
          }}
        >
          <i className="bi bi-plus-lg me-1"></i>
          Add Resident
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
                    <th>Resident</th>
                    <th>Address</th>
                    <th>Contact</th>
                    <th>Age</th>
                    <th>Civil status</th>
                    <th>Housing type</th>
                    <th>Voter</th>
                    <th className="text-end">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {residents.length > 0 ? (
                    residents.map((r, i) => (
                      <tr key={r.id}>

                        <td>{i + 1}</td>

                        {/* RESIDENT */}
                        <td>
                          <div className="d-flex align-items-center gap-3">

                            <div
                              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
                              style={{
                                width: "50px",
                                height: "50px",
                              }}
                            >
                              {r.first_name?.charAt(
                                0
                              )}
                              {r.last_name?.charAt(0)}
                            </div>

                            <div>

                              <div className="fw-bold">
                                {r.first_name}{" "}
                                {r.last_name}
                              </div>

                              <small className="text-muted">
                                {r.gender || "N/A"} •{" "}
                                {r.civil_status ||
                                  "N/A"}
                              </small>

                            </div>

                          </div>
                        </td>

                        {/* ADDRESS */}
                        <td>
                          <div className="fw-semibold">
                            {r.barangay || "-"}
                          </div>

                          <small className="text-muted">
                            {r.purok_zone ||
                              "No purok"}
                          </small>
                        </td>

                        {/* CONTACT */}
                        <td>
                          <div className="fw-semibold">
                            {r.mobile_number
                              ? r.mobile_number.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-$3")
                              : "-"}
                          </div>

                          <small className="text-muted">
                            {r.email || "No email"}
                          </small>
                        </td>
                        <td>
                            {r.birth_date ? (
                              <>
                                <div className="fw-semibold">
                                  {calculateAge(r.birth_date)} yrs old
                                </div>

                                <small className="text-muted">
                                  {r.birth_date
                                    ? new Date(r.birth_date).toLocaleDateString("en-PH", {
                                        year: "numeric",
                                        month: "long",
                                        day: "2-digit",
                                      })
                                    : "-"}
                                </small>
                              </>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td>
                              {r.civil_status}
                          </td>
                          <td>
                              {r.housing_type}
                          </td>

                        {/* STATUS */}
                        <td>
                          <span className={`badge ${r.is_voter ? "bg-primary" : "bg-secondary"}`}>
                            {r.is_voter ? "Yes" : "No"}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td>
                            <div  className="text-end d-flex gap-2 justify-content-end">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setSelectedResident(r);

                              setEditForm({
                                ...r,
                              });

                              setMode("view");
                              setIsEditing(false);
                              setModalOpen(true);
                            }}
                          >
                            View
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              handleDelete(r.id)
                            }
                          >
                            Delete
                          </button>
                          </div>

                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center py-5"
                      >

                        <div className="d-flex flex-column align-items-center justify-content-center">

                          <i
                            className="bi bi-people"
                            style={{
                              fontSize: "48px",
                              color: "#cbd5e1",
                              marginBottom: "10px",
                            }}
                          ></i>

                          <h6 className="fw-semibold mb-1 text-muted">
                            No residents found
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
              onClick={() =>
                fetchResidents(page - 1, search)
              }
            >
              ← Prev
            </button>

            {/* NUMBERS */}
            {getPages().map((p, idx) =>
              p === "..." ? (
                <span
                  key={idx}
                  className="px-2 text-muted"
                >
                  ...
                </span>
              ) : (
                <button
                  key={idx}
                  className={`btn rounded-pill ${
                    p === page
                      ? "btn-primary shadow-sm"
                      : "btn-light border"
                  }`}
                  style={{
                    minWidth: "42px",
                    height: "42px",
                  }}
                  onClick={() =>
                    fetchResidents(p, search)
                  }
                >
                  {p}
                </button>
              )
            )}

            {/* NEXT */}
            <button
              className="btn btn-light border rounded-pill px-3"
              disabled={page === lastPage}
              onClick={() =>
                fetchResidents(page + 1, search)
              }
            >
              Next →
            </button>

          </div>

        </div>
      </div>

      {/* ================= CREATE MODAL ================= */}
      {modalOpen && mode === "create" && (
        <div
          className="modal d-block"
          style={{
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">

            <div className="modal-content rounded-4 shadow-lg border-0 overflow-hidden">

              {/* HEADER */}
              <div className="modal-header border-0 bg-light px-4 py-3">

                <div>
                  <h5 className="mb-0 fw-bold">
                    Add Resident
                  </h5>

                  <small className="text-muted">
                    Create resident profile and
                    census information
                  </small>
                </div>

                <button
                  className="btn-close"
                  onClick={() =>
                    setModalOpen(false)
                  }
                />

              </div>

              <form onSubmit={handleSubmit}>

                <div className="modal-body px-4 py-3">

                  <div className="row g-4">

                    {/* PERSONAL */}
                    <div className="col-12">
                      <div className="border rounded-4 p-4">

                        <h5 className="fw-bold mb-3">
                          Personal Information
                        </h5>

                        <div className="row g-3">

                          <div className="col-md-4">
                            <label className="form-label fw-semibold">
                              First Name
                            </label>

                            <input
                              className="form-control"
                              name="first_name"
                              value={
                                form.first_name
                              }
                              onChange={
                                handleChange
                              }
                              required
                            />
                          </div>

                          <div className="col-md-4">
                            <label className="form-label fw-semibold">
                              Middle Name
                            </label>

                            <input
                              className="form-control"
                              name="middle_name"
                              value={
                                form.middle_name
                              }
                              onChange={
                                handleChange
                              }
                            />
                          </div>

                          <div className="col-md-4">
                            <label className="form-label fw-semibold">
                              Last Name
                            </label>

                            <input
                              className="form-control"
                              name="last_name"
                              value={
                                form.last_name
                              }
                              onChange={
                                handleChange
                              }
                              required
                            />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              Gender
                            </label>

                            <select
                              className="form-select"
                              name="gender"
                              value={form.gender}
                              onChange={
                                handleChange
                              }
                              required
                            >
                              <option value="">
                                Select gender
                              </option>

                              <option value="Male">
                                Male
                              </option>

                              <option value="Female">
                                Female
                              </option>
                            </select>
                          </div>

                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              Civil Status
                            </label>

                            <select
                              className="form-select"
                              name="civil_status"
                              value={
                                form.civil_status
                              }
                              onChange={
                                handleChange
                              }
                              required
                            >
                              <option value="">
                                Select status
                              </option>

                              <option value="Single">
                                Single
                              </option>

                              <option value="Married">
                                Married
                              </option>

                              <option value="Widowed">
                                Widowed
                              </option>
                            </select>
                          </div>

                        </div>

                      </div>
                    </div>

                    {/* ADDRESS */}
                    <div className="col-12">
                      <div className="border rounded-4 p-4">

                        <h5 className="fw-bold mb-3">
                          Address Information
                        </h5>

                        <div className="row g-3">

                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              Barangay
                            </label>

                            <input
                              className="form-control"
                              name="barangay"
                              value={form.barangay}
                              onChange={
                                handleChange
                              }
                              required
                            />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              Purok / Zone
                            </label>

                            <input
                              className="form-control"
                              name="purok_zone"
                              value={
                                form.purok_zone
                              }
                              onChange={
                                handleChange
                              }
                              required
                            />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              Street Address
                            </label>

                            <input
                              className="form-control"
                              name="street_address"
                              value={
                                form.street_address
                              }
                              onChange={
                                handleChange
                              }
                            />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              City / Municipality
                            </label>

                            <input
                              className="form-control"
                              name="city_municipality"
                              value={
                                form.city_municipality
                              }
                              onChange={
                                handleChange
                              }
                            />
                          </div>

                        </div>

                      </div>
                    </div>

                    {/* OTHER */}
                    <div className="col-12">
                      <div className="border rounded-4 p-4">

                        <h5 className="fw-bold mb-3">
                          Other Information
                        </h5>

                        <div className="row g-3">

                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              Mobile Number
                            </label>

                            <input
                              className="form-control"
                              name="mobile_number"
                              value={
                                form.mobile_number
                              }
                              onChange={
                                handleChange
                              }
                            />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              Email
                            </label>

                            <input
                              type="email"
                              className="form-control"
                              name="email"
                              value={form.email}
                              onChange={
                                handleChange
                              }
                            />
                          </div>

                        </div>

                      </div>
                    </div>

                  </div>

                </div>

                {/* FOOTER */}
                <div className="modal-footer border-0 px-4 py-3 d-flex justify-content-between">

                  <small className="text-muted">
                    Fields marked required must be
                    completed
                  </small>

                  <div className="d-flex gap-2">

                    <button
                      type="button"
                      className="btn btn-light px-3"
                      onClick={() =>
                        setModalOpen(false)
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                    >
                      Save Resident
                    </button>

                  </div>

                </div>

              </form>

            </div>

          </div>
        </div>
      )}

      {/* ================= VIEW / EDIT ================= */}
      {modalOpen &&
        selectedResident &&
        (mode === "view" ||
          mode === "edit") && (
          <div
            className="modal d-block"
            style={{
              background:
                "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered">

              <div
                className="modal-content rounded-4 shadow-lg overflow-hidden"
                style={{
                  maxHeight: "90vh",
                }}
              >

                {/* HEADER */}
                <div className="px-4 py-3 bg-light border-bottom d-flex justify-content-between align-items-center">

                  <div>
                    <h5 className="mb-0 fw-bold">
                      {isEditing
                        ? "Edit Resident"
                        : "Resident Profile"}
                    </h5>

                    <small className="text-muted">
                      {isEditing
                        ? "Update resident information"
                        : "View resident details"}
                    </small>
                  </div>

                  <button
                    className="btn-close"
                    onClick={() => {
                      setModalOpen(false);
                      setSelectedResident(
                        null
                      );
                      setIsEditing(false);
                    }}
                  />

                </div>

                {/* CONTENT */}
                <div
                  className="p-4"
                  style={{
                    overflowY: "auto",
                  }}
                >

                  {!isEditing ? (
                   <>
                    <div className="row g-4">

                      {/* ================= LEFT PROFILE PANEL ================= */}
                      <div className="col-md-4">

                        <div className="p-4 rounded-4 bg-white shadow-sm h-100">

                          {/* Avatar */}
                          <div className="text-center mb-4">
                            <div
                              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold mx-auto"
                              style={{ width: 100, height: 100, fontSize: 32 }}
                            >
                              {selectedResident.first_name?.[0]}
                              {selectedResident.last_name?.[0]}
                            </div>

                            <h4 className="fw-bold mt-3 mb-1">
                              {selectedResident.first_name} {selectedResident.last_name}
                            </h4>

                            <div className="text-muted small">
                              Resident Profile Record
                            </div>
                          </div>

                          {/* Quick Info */}
                          <div className="border-top pt-3">

                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-muted">Gender</span>
                              <span className="fw-semibold">{selectedResident.gender || "-"}</span>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-muted">Civil Status</span>
                              <span className="fw-semibold">{selectedResident.civil_status || "-"}</span>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-muted">Age</span>
                              <span className="fw-semibold">
                                {selectedResident.birth_date
                                  ? new Date().getFullYear() -
                                    new Date(selectedResident.birth_date).getFullYear()
                                  : "-"}
                              </span>
                            </div>

                            <div className="d-flex justify-content-between">
                              <span className="text-muted">Barangay</span>
                              <span className="fw-semibold">
                                {selectedResident.barangay || "-"}
                              </span>
                            </div>

                          </div>

                        </div>
                      </div>

                      {/* ================= RIGHT CONTENT ================= */}
                      <div className="col-md-8">

                        <div className="p-4 rounded-4 bg-white shadow-sm">

                          {/* SECTION TITLE */}
                          <h5 className="fw-bold mb-4">Resident Information Record</h5>

                          {/* ================= PERSONAL ================= */}
                          <div className="mb-4">
                            <h6 className="text-uppercase text-muted small mb-3">
                              Personal Information
                            </h6>

                            <div className="row">

                              <div className="col-md-6 mb-2">
                                <span className="text-muted">Birth Date</span>
                                <div className="fw-semibold">
                                  {selectedResident.birth_date
                                    ? new Date(selectedResident.birth_date).toLocaleDateString()
                                    : "-"}
                                </div>
                              </div>

                              <div className="col-md-6 mb-2">
                                <span className="text-muted">Gender</span>
                                <div className="fw-semibold">
                                  {selectedResident.gender || "-"}
                                </div>
                              </div>

                              <div className="col-md-6 mb-2">
                                <span className="text-muted">Civil Status</span>
                                <div className="fw-semibold">
                                  {selectedResident.civil_status || "-"}
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* DIVIDER */}
                          <hr />

                          {/* ================= ADDRESS ================= */}
                          <div className="mb-4">
                            <h6 className="text-uppercase text-muted small mb-3">
                              Address Information
                            </h6>

                            <div className="row">

                              <div className="col-md-6 mb-2">
                                <span className="text-muted">Barangay</span>
                                <div className="fw-semibold">{selectedResident.barangay || "-"}</div>
                              </div>

                              <div className="col-md-6 mb-2">
                                <span className="text-muted">Purok / Zone</span>
                                <div className="fw-semibold">{selectedResident.purok_zone || "-"}</div>
                              </div>

                              <div className="col-md-6 mb-2">
                                <span className="text-muted">Street</span>
                                <div className="fw-semibold">{selectedResident.street_address || "-"}</div>
                              </div>

                              <div className="col-md-6 mb-2">
                                <span className="text-muted">City / Municipality</span>
                                <div className="fw-semibold">
                                  {selectedResident.city_municipality || "-"}
                                </div>
                              </div>

                            </div>
                          </div>

                          <hr />

                          {/* ================= CONTACT ================= */}
                          <div className="mb-4">
                            <h6 className="text-uppercase text-muted small mb-3">
                              Contact Information
                            </h6>

                            <div className="row">

                              <div className="col-md-6 mb-2">
                                <span className="text-muted">Mobile</span>
                                <div className="fw-semibold">
                                  {selectedResident.mobile_number || "-"}
                                </div>
                              </div>

                              <div className="col-md-6 mb-2">
                                <span className="text-muted">Email</span>
                                <div className="fw-semibold">
                                  {selectedResident.email || "-"}
                                </div>
                              </div>

                            </div>
                          </div>

                          <hr />

                          {/* ================= STATUS (LIVEBIRTH STYLE TAGS) ================= */}
                          <div>
                            <h6 className="text-uppercase text-muted small mb-3">
                              Status & Classification
                            </h6>

                            <div className="d-flex flex-wrap gap-2">

                              <span className={`px-3 py-1 rounded-pill small fw-semibold ${
                                selectedResident.household_head
                                  ? "bg-success text-white"
                                  : "bg-light text-dark border"
                              }`}>
                                Household Head
                              </span>

                              <span className={`px-3 py-1 rounded-pill small fw-semibold ${
                                selectedResident.is_voter
                                  ? "bg-primary text-white"
                                  : "bg-light text-dark border"
                              }`}>
                                Registered Voter
                              </span>

                              <span className={`px-3 py-1 rounded-pill small fw-semibold ${
                                selectedResident.disability_status
                                  ? "bg-warning text-dark"
                                  : "bg-light text-dark border"
                              }`}>
                                PWD
                              </span>

                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  </>
                  ) : (
                    <div className="row g-3">

                      {Object.keys(editForm).map(
                        (field) => (
                          <div
                            className="col-md-6"
                            key={field}
                          >

                            <label className="form-label fw-semibold text-capitalize">
                              {field.replaceAll(
                                "_",
                                " "
                              )}
                            </label>

                            {typeof editForm[
                              field
                            ] === "boolean" ? (
                              <div className="form-check">

                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={
                                    editForm[
                                      field
                                    ]
                                  }
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      [field]:
                                        e.target
                                          .checked,
                                    })
                                  }
                                />

                              </div>
                            ) : (
                              <input
                                className="form-control"
                                value={
                                  editForm[
                                    field
                                  ] || ""
                                }
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    [field]:
                                      e.target
                                        .value,
                                  })
                                }
                              />
                            )}

                          </div>
                        )
                      )}

                    </div>
                  )}

                </div>

                {/* FOOTER */}
                <div className="modal-footer border-0 px-4 py-3 d-flex justify-content-end">

                  <div className="d-flex gap-2">

                    {!isEditing ? (
                      <button
                        className="btn btn-primary px-3"
                        onClick={() =>
                          setIsEditing(true)
                        }
                      >
                        Edit
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn btn-success px-3"
                          onClick={handleUpdate}
                        >
                          Save Changes
                        </button>

                        <button
                          className="btn btn-secondary px-3"
                          onClick={() => {
                            setIsEditing(false);

                            setEditForm({
                              ...selectedResident,
                            });
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    <button
                      className="btn btn-dark px-3"
                      onClick={() => {
                        setModalOpen(false);
                        setSelectedResident(
                          null
                        );
                        setIsEditing(false);
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