import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Residents() {
  const token = localStorage.getItem("token");

  // ==================================================
  // STATE
  // ==================================================
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("create");

  const [selectedId, setSelectedId] = useState(null);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState("personal");

  const [errors, setErrors] = useState({});

  // ==================================================
  // FORM
  // ==================================================
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

  // ==================================================
  // TABS
  // ==================================================
  const tabs = [
    "personal",
    "address",
    "household",
    "health",
    "government",
    "other",
  ];

  const required = {
    personal: ["first_name", "last_name", "gender", "civil_status"],
    address: ["barangay", "purok_zone"],
    household: ["household_number"],
    health: [],
    government: [],
    other: [],
  };

  // ==================================================
  // FETCH
  // ==================================================
  const fetchResidents = async (p = 1, s = "") => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/residents?page=${p}&search=${s}`,
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
    fetchResidents();
  }, []);

  // ==================================================
  // INPUT
  // ==================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  // ==================================================
  // VALIDATION
  // ==================================================
  const validateTab = (tab) => {
    const fields = required[tab] || [];

    let err = {};

    fields.forEach((f) => {
      if (!form[f]) {
        err[f] = "Required";
      }
    });

    setErrors(err);

    return Object.keys(err).length === 0;
  };

  const validateAll = () => {
    let err = {};

    Object.keys(required).forEach((tab) => {
      required[tab].forEach((f) => {
        if (!form[f]) {
          err[f] = "Required";
        }
      });
    });

    setErrors(err);

    return Object.keys(err).length === 0;
  };

  // ==================================================
  // CRUD
  // ==================================================
  const createResident = async () => {
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
      throw new Error(data.message);
    }
  };

  const updateResident = async () => {
    const res = await fetch(
      `https://ajcpisonet.com/api/residents/${selectedId}`,
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

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }
  };

  const deleteResident = async (id) => {
    if (!confirm("Delete resident?")) return;

    try {
      await fetch(`https://ajcpisonet.com/api/residents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      toast.success("Resident deleted");
      fetchResidents(page, search);
    } catch {
      toast.error("Delete failed");
    }
  };

  // ==================================================
  // SUBMIT
  // ==================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      toast.error("Please complete required fields");
      return;
    }

    try {
      if (mode === "create") {
        await createResident();
      }

      if (mode === "edit") {
        await updateResident();
      }

      toast.success(
        mode === "create"
          ? "Resident created"
          : "Resident updated"
      );

      setShowModal(false);
      setForm(emptyForm);

      fetchResidents(page, search);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  // ==================================================
  // MODALS
  // ==================================================
  const openCreate = () => {
    setMode("create");
    setForm(emptyForm);
    setActiveTab("personal");
    setShowModal(true);
  };

  const openEdit = (r) => {
    setMode("edit");
    setSelectedId(r.id);
    setForm(r);
    setActiveTab("personal");
    setShowModal(true);
  };

  const openView = (r) => {
    setMode("view");
    setForm(r);
    setShowModal(true);
  };

  // ==================================================
  // UI HELPERS
  // ==================================================
  const input = (label, name, type = "text") => (
    <div className="col-md-6">
      <label className="form-label fw-semibold">
        {label}

        {required[activeTab]?.includes(name) && (
          <span className="text-danger ms-1">*</span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={form[name] || ""}
        disabled={mode === "view"}
        onChange={handleChange}
        className={`form-control form-control-lg ${
          errors[name] ? "is-invalid" : ""
        }`}
      />

      {errors[name] && (
        <div className="invalid-feedback">
          {errors[name]}
        </div>
      )}
    </div>
  );

  const checkbox = (label, name) => (
    <div className="col-md-6">
      <div className="form-check mt-4">
        <input
          type="checkbox"
          className="form-check-input"
          name={name}
          checked={form[name] || false}
          disabled={mode === "view"}
          onChange={handleChange}
        />

        <label className="form-check-label fw-semibold">
          {label}
        </label>
      </div>
    </div>
  );

  // ==================================================
  // UI
  // ==================================================
  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">

          <div>
            <h3 className="fw-bold mb-1">
              Residents Management
            </h3>

            <div className="text-muted">
              Barangay resident profiling and census system
            </div>
          </div>

          <div className="d-flex gap-2">

            <div
              className="input-group"
              style={{ width: "320px" }}
            >
              <span className="input-group-text bg-white">
                🔍
              </span>

              <input
                className="form-control"
                placeholder="Search resident..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  fetchResidents(1, e.target.value);
                }}
              />
            </div>

            <button
              className="btn btn-primary px-4"
              onClick={openCreate}
            >
              + Add Resident
            </button>

          </div>

        </div>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">
                <tr>
                  <th className="ps-4">Resident</th>
                  <th>Address</th>
                  <th>Household</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th width="220">Actions</th>
                </tr>
              </thead>

              <tbody>

                {loading && (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      Loading residents...
                    </td>
                  </tr>
                )}

                {!loading && residents.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5">

                      <div className="mb-2 fs-3">
                        👥
                      </div>

                      <div className="fw-semibold">
                        No residents found
                      </div>

                    </td>
                  </tr>
                )}

                {residents.map((r) => (
                  <tr key={r.id}>

                    {/* RESIDENT */}
                    <td className="ps-4">

                      <div className="d-flex align-items-center gap-3">

                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                          style={{
                            width: 50,
                            height: 50,
                            fontSize: "14px",
                          }}
                        >
                          {r.first_name?.charAt(0)}
                          {r.last_name?.charAt(0)}
                        </div>

                        <div>

                          <div className="fw-bold">
                            {r.first_name} {r.last_name}
                          </div>

                          <small className="text-muted">
                            {r.gender || "N/A"} •{" "}
                            {r.civil_status || "N/A"}
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
                        {r.purok_zone || "No purok"}
                      </small>

                    </td>

                    {/* HOUSEHOLD */}
                    <td>

                      <span className="badge bg-light text-dark border px-3 py-2">
                        {r.household_number || "-"}
                      </span>

                      {r.household_head && (
                        <div className="mt-1">

                          <small className="text-success fw-semibold">
                            Household Head
                          </small>

                        </div>
                      )}

                    </td>

                    {/* CONTACT */}
                    <td>

                      <div>
                        {r.mobile_number || "-"}
                      </div>

                      <small className="text-muted">
                        {r.email || "No email"}
                      </small>

                    </td>

                    {/* STATUS */}
                    <td>

                      <div className="d-flex flex-column gap-1">

                        {r.is_voter && (
                          <span className="badge bg-primary">
                            Voter
                          </span>
                        )}

                        {r.disability_status && (
                          <span className="badge bg-warning text-dark">
                            PWD
                          </span>
                        )}

                        {!r.is_voter &&
                          !r.disability_status && (
                            <span className="text-muted">
                              —
                            </span>
                          )}

                      </div>

                    </td>

                    {/* ACTIONS */}
                    <td>

                      <div className="d-flex gap-2">

                        <button
                          className="btn btn-light btn-sm border"
                          onClick={() => openView(r)}
                        >
                          View
                        </button>

                        <button
                          className="btn btn-warning btn-sm text-white"
                          onClick={() => openEdit(r)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteResident(r.id)}
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>
      </div>

      {/* PAGINATION */}
      <div className="d-flex justify-content-between align-items-center mt-3">

        <div className="text-muted">
          Page {page} of {lastPage}
        </div>

        <div className="d-flex gap-2">

          <button
            className="btn btn-light border"
            disabled={page <= 1}
            onClick={() => fetchResidents(page - 1, search)}
          >
            Previous
          </button>

          <button
            className="btn btn-light border"
            disabled={page >= lastPage}
            onClick={() => fetchResidents(page + 1, search)}
          >
            Next
          </button>

        </div>

      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className="modal d-block"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">

            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">

              {/* HEADER */}
              <div className="modal-header border-0 bg-white">

                <div>

                  <h4 className="fw-bold mb-1">

                    {mode === "create" &&
                      "Add Resident"}

                    {mode === "edit" &&
                      "Edit Resident"}

                    {mode === "view" &&
                      "Resident Profile"}

                  </h4>

                  <small className="text-muted">
                    Complete resident information
                  </small>

                </div>

                <button
                  className="btn-close"
                  onClick={() =>
                    setShowModal(false)
                  }
                />

              </div>

              {/* BODY */}
              <form onSubmit={handleSubmit}>

                <div className="row g-0">

                  {/* SIDEBAR */}
                  {mode !== "view" && (
                    <div
                      className="col-md-3 border-end bg-light"
                      style={{ minHeight: "700px" }}
                    >

                      <div className="p-4">

                        <div className="fw-bold mb-4">
                          Form Sections
                        </div>

                        <div className="d-flex flex-column gap-2">

                          {tabs.map((t, i) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() =>
                                setActiveTab(t)
                              }
                              className={`btn text-start p-3 ${
                                activeTab === t
                                  ? "btn-primary"
                                  : "btn-light border"
                              }`}
                            >
                              <div className="fw-semibold text-capitalize">
                                {i + 1}. {t}
                              </div>

                              <small>
                                {
                                  required[t]
                                    ?.length
                                }{" "}
                                required fields
                              </small>

                            </button>
                          ))}

                        </div>

                      </div>

                    </div>
                  )}

                  {/* CONTENT */}
                  <div className={mode === "view" ? "col-12" : "col-md-9"}>

                    <div
                      className="modal-body p-4"
                      style={{
                        maxHeight: "75vh",
                        overflowY: "auto",
                      }}
                    >

                      {/* VIEW */}
                      {mode === "view" ? (
                        <div className="row g-3">

                          {Object.entries(form).map(
                            ([key, value]) => (
                              <div
                                className="col-md-6"
                                key={key}
                              >
                                <div className="border rounded-4 p-3 bg-light h-100">

                                  <small className="text-muted text-uppercase">
                                    {key.replaceAll(
                                      "_",
                                      " "
                                    )}
                                  </small>

                                  <div className="fw-semibold mt-1">
                                    {String(
                                      value || "-"
                                    )}
                                  </div>

                                </div>
                              </div>
                            )
                          )}

                        </div>
                      ) : (
                        <>
                          {/* PERSONAL */}
                          {activeTab === "personal" && (
                            <div className="border rounded-4 p-4 bg-light-subtle">

                              <div className="mb-4">

                                <h5 className="fw-bold">
                                  Personal Information
                                </h5>

                                <div className="text-muted">
                                  Resident identity details
                                </div>

                              </div>

                              <div className="row g-4">

                                {input(
                                  "First Name",
                                  "first_name"
                                )}

                                {input(
                                  "Middle Name",
                                  "middle_name"
                                )}

                                {input(
                                  "Last Name",
                                  "last_name"
                                )}

                                {input(
                                  "Gender",
                                  "gender"
                                )}

                                {input(
                                  "Civil Status",
                                  "civil_status"
                                )}

                              </div>

                            </div>
                          )}

                          {/* ADDRESS */}
                          {activeTab === "address" && (
                            <div className="border rounded-4 p-4 bg-light-subtle">

                              <div className="mb-4">

                                <h5 className="fw-bold">
                                  Address Information
                                </h5>

                                <div className="text-muted">
                                  Resident location and address
                                </div>

                              </div>

                              <div className="row g-4">

                                {input(
                                  "Barangay",
                                  "barangay"
                                )}

                                {input(
                                  "Purok Zone",
                                  "purok_zone"
                                )}

                                {input(
                                  "Street Address",
                                  "street_address"
                                )}

                                {input(
                                  "City / Municipality",
                                  "city_municipality"
                                )}

                              </div>

                            </div>
                          )}

                          {/* HOUSEHOLD */}
                          {activeTab === "household" && (
                            <div className="border rounded-4 p-4 bg-light-subtle">

                              <div className="mb-4">

                                <h5 className="fw-bold">
                                  Household Information
                                </h5>

                                <div className="text-muted">
                                  Household and family grouping
                                </div>

                              </div>

                              <div className="row g-4">

                                {input(
                                  "Household Number",
                                  "household_number"
                                )}

                                {checkbox(
                                  "Household Head",
                                  "household_head"
                                )}

                              </div>

                            </div>
                          )}

                          {/* HEALTH */}
                          {activeTab === "health" && (
                            <div className="border rounded-4 p-4 bg-light-subtle">

                              <div className="mb-4">

                                <h5 className="fw-bold">
                                  Health Information
                                </h5>

                              </div>

                              <div className="row g-4">

                                {input(
                                  "Blood Type",
                                  "blood_type"
                                )}

                                {checkbox(
                                  "PWD Status",
                                  "disability_status"
                                )}

                              </div>

                            </div>
                          )}

                          {/* GOV */}
                          {activeTab === "government" && (
                            <div className="border rounded-4 p-4 bg-light-subtle">

                              <div className="mb-4">

                                <h5 className="fw-bold">
                                  Government IDs
                                </h5>

                              </div>

                              <div className="row g-4">

                                {input(
                                  "SSS Number",
                                  "sss_number"
                                )}

                                {input(
                                  "TIN Number",
                                  "tin_number"
                                )}

                                {input(
                                  "Voter ID Number",
                                  "voters_id_number"
                                )}

                                {checkbox(
                                  "Registered Voter",
                                  "is_voter"
                                )}

                              </div>

                            </div>
                          )}

                          {/* OTHER */}
                          {activeTab === "other" && (
                            <div className="border rounded-4 p-4 bg-light-subtle">

                              <div className="mb-4">

                                <h5 className="fw-bold">
                                  Other Information
                                </h5>

                              </div>

                              <div className="row g-4">

                                {input(
                                  "Occupation",
                                  "occupation"
                                )}

                                {input(
                                  "Monthly Income",
                                  "monthly_income",
                                  "number"
                                )}

                                {input(
                                  "Email",
                                  "email",
                                  "email"
                                )}

                                {input(
                                  "Mobile Number",
                                  "mobile_number"
                                )}

                              </div>

                            </div>
                          )}

                        </>
                      )}

                    </div>

                    {/* FOOTER */}
                    {mode !== "view" && (
                      <div className="modal-footer border-0 bg-white px-4 py-3">

                        <div className="d-flex justify-content-between w-100">

                          <button
                            type="button"
                            className="btn btn-light border px-4"
                            disabled={
                              activeTab ===
                              "personal"
                            }
                            onClick={() => {
                              const i =
                                tabs.indexOf(
                                  activeTab
                                );

                              setActiveTab(
                                tabs[i - 1]
                              );
                            }}
                          >
                            ← Back
                          </button>

                          {activeTab !==
                          "other" ? (
                            <button
                              type="button"
                              className="btn btn-primary px-4"
                              onClick={() => {
                                if (
                                  !validateTab(
                                    activeTab
                                  )
                                )
                                  return;

                                const i =
                                  tabs.indexOf(
                                    activeTab
                                  );

                                setActiveTab(
                                  tabs[i + 1]
                                );
                              }}
                            >
                              Next →
                            </button>
                          ) : (
                            <button className="btn btn-success px-5">
                              {mode === "create"
                                ? "Save Resident"
                                : "Update Resident"}
                            </button>
                          )}

                        </div>

                      </div>
                    )}

                  </div>

                </div>

              </form>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}