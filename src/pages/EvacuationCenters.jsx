import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function EvacuationCenters() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("create");

  const token = localStorage.getItem("token");

  const [errors, setErrors] = useState({});

  const [facilityInput, setFacilityInput] = useState("");


  const [form, setForm] = useState({
    id: null,
    name: "",
    location: "",

    capacity: "",
    current_occupancy: "",

    contact_person: "",
    contact_number: "",

    event_type: "",

    status: "Standby",
    facilities: [],
    
  });

  const addFacility = () => {
    if (!facilityInput.trim()) return;

    setForm((prev) => ({
      ...prev,
      facilities: [...(prev.facilities || []), facilityInput.trim()],
    }));

    setFacilityInput("");
  };

  const removeFacility = (index) => {
    setForm((prev) => ({
      ...prev,
      facilities: (prev.facilities || []).filter((_, i) => i !== index),
    }));
  };

  // ================= FETCH =================
  const fetchCenters = async (pageNum = 1, searchTerm = "") => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/evacuation-centers?page=${pageNum}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();
      console.log("EVAC DATA:", data);
      setCenters(data.data || []);
      setPage(1);
      setLastPage(1);
    } catch {
      toast.error("Failed to load evacuation centers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

 const normalizePayload = (data) => ({
    ...data,
    facilities: Array.isArray(data.facilities)
      ? data.facilities
      : [],
  });
  const normalizeCenter = (c) => ({
    ...c,
    facilities: Array.isArray(c.facilities)
      ? c.facilities
      : c.facilities
      ? String(c.facilities).split(",")
      : [],
  });

  // ================= CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= RESET =================
  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      location: "",

      capacity: "",
      current_occupancy: "",

      contact_person: "",
      contact_number: "",

      event_type: "",
      status: "Standby",
      facilities: [],
    });

    setErrors({});
  };

  // ================= CREATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("SUBMIT FACILITIES:", form.facilities);

    try {
      const res = await fetch(
        "https://ajcpisonet.com/api/evacuation-centers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify(normalizePayload(form))
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setErrors(result.errors || {});
        toast.error(result.message || "Failed");
        return;
      }

      toast.success("Evacuation saved");
      setShowModal(false);
      resetForm();
      fetchCenters(page, search);
    } catch {
      toast.error("Server error");
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!form.id) {
      toast.error("Missing ID");
      return;
    }

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/evacuation-centers/${form.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify(normalizePayload(form)),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        console.log("UPDATE ERROR:", result);
        setErrors(result.errors || {});
        toast.error(result.message || "Update failed");
        return;
      }

      toast.success("Updated successfully");
      setShowModal(false);
      resetForm();
      fetchCenters(page, search);
    } catch (err) {
      console.log(err);
      toast.error("Server error");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/evacuation-centers/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Deleted successfully");
      fetchCenters(page, search);
    } catch {
      toast.error("Delete failed");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Open":
        return "border bg-success fw-light bg-opacity-25 text-dark";
      case "Full":
        return "border bg-danger bg-opacity-25 text-dark fw-light";
      case "Closed":
        return "border bg-blue bg-opacity-25 text-dark fw-light";
      case "Standby":
      default:
        return "border bg-warning bg-opacity-25 text-dark fw-light";
    }
  };

  const getEventBadge = (type) => {
    switch (type) {
      case "Typhoon":
        return {
          className:
            "border border-success border-opacity-25 text-success d-inline-flex align-items-center gap-1 px-2 py-1 rounded",
          icon: "bi-wind",
        };

      case "Flood":
        return {
          className:
            "border border-primary border-opacity-25 text-primary d-inline-flex align-items-center gap-1 px-2 py-1 rounded",
          icon: "bi-water",
        };

      case "Fire":
        return {
          className:
            "border border-danger border-opacity-25 text-danger d-inline-flex align-items-center gap-1 px-2 py-1 rounded",
          icon: "bi-fire",
        };

      case "Earthquake":
        return {
          className:
            "border border-warning border-opacity-25 text-warning d-inline-flex align-items-center gap-1 px-2 py-1 rounded",
          icon: "bi-broadcast-pin",
        };

      default:
        return {
          className:
            "border border-secondary border-opacity-25 text-secondary d-inline-flex align-items-center gap-1 px-2 py-1 rounded",
          icon: "bi-exclamation-triangle",
        };
    }
  };



  // ================= ROLE-BASED VIEW =================

  const user = JSON.parse(localStorage.getItem("user"));

  // ================= MDRRMO VIEW =================
  if (user?.role === "mdrrmo_admin") {

    const totalOccupants = centers.reduce(
      (sum, c) => sum + Number(c.current_occupancy || 0),
      0
    );

    const totalCapacity = centers.reduce(
      (sum, c) => sum + Number(c.capacity || 0),
      0
    );
    const [selectedBarangay, setSelectedBarangay] = useState(null);
    const [barangayCenters, setBarangayCenters] = useState([]);
    const [showCentersModal, setShowCentersModal] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState("create");

    const [errors, setErrors] = useState({});

    const [facilityInput, setFacilityInput] = useState("");


    const [form, setForm] = useState({
      id: null,
      name: "",
      location: "",
      barangay: "",

      capacity: "",
      current_occupancy: "",

      contact_person: "",
      contact_number: "",

      event_type: "",

      status: "Standby",
      facilities: [],
      
    });

    const addFacility = () => {
      if (!facilityInput.trim()) return;

      setForm((prev) => ({
        ...prev,
        facilities: [...(prev.facilities || []), facilityInput.trim()],
      }));

      setFacilityInput("");
    };

    const removeFacility = (index) => {
      setForm((prev) => ({
        ...prev,
        facilities: (prev.facilities || []).filter((_, i) => i !== index),
      }));
    };

    const normalizePayload = (data) => ({
    ...data,
    facilities: Array.isArray(data.facilities)
      ? data.facilities
      : [],
  });
  const normalizeCenter = (c) => ({
    ...c,
    facilities: Array.isArray(c.facilities)
      ? c.facilities
      : c.facilities
      ? String(c.facilities).split(",")
      : [],
  });

  // ================= CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= RESET =================
  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      location: "",
      barangay: "",

      capacity: "",
      current_occupancy: "",

      contact_person: "",
      contact_number: "",

      event_type: "",
      status: "Standby",
      facilities: [],
    });

    setErrors({});
  };

  // ================= CREATE =================
  const handleSubmitmdrrmo = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "https://ajcpisonet.com/api/evacuation-center",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify(normalizePayload(form))
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setErrors(result.errors || {});
        toast.error(result.message || "Failed");
        return;
      }

      toast.success("Evacuation saved");
      setShowModal(false);
      resetForm();
      fetchCenters(page, search);
    } catch {
      toast.error("Server error");
    }
  };

  // ================= UPDATE =================
  const handleUpdatemddrmo = async (e) => {
    e.preventDefault();

    if (!form.id) {
      toast.error("Missing ID");
      return;
    }

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/evacuation-center/${form.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify(normalizePayload(form)),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        console.log("UPDATE ERROR:", result);
        setErrors(result.errors || {});
        toast.error(result.message || "Update failed");
        return;
      }

      toast.success("Updated successfully");
      setShowModal(false);
      resetForm();
      fetchCenters(page, search);
    } catch (err) {
      console.log(err);
      toast.error("Server error");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/evacuation-centers/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Deleted successfully");
      fetchCenters(page, search);
    } catch {
      toast.error("Delete failed");
    }
  };


    // View centers for a specific barangay
    const viewCenters = async (barangay) => {

      try {

        const res = await fetch(
          `https://ajcpisonet.com/api/evacuation-centers/barangay/${barangay}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await res.json();

        setBarangayCenters(data.data || []);
        setSelectedBarangay(barangay);
        setShowCentersModal(true);

      } catch {
        toast.error("Failed to load centers");
      }

    };

    // ================= UI MDRRMO =================
    return (
      <div className="container-fluid p-4">

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>
            <h3 className="fw-bold mb-0">
              MDRRMO Evacuation Dashboard
            </h3>

            <small className="text-muted">
              Municipality-wide Monitoring
            </small>
          </div>

         <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            resetForm();
            setMode("create");
            setShowModal(true);
          }}
        >
          + Add Evacuation
        </button>

        </div>

        <div className="row g-3 mb-4">

          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <small className="text-muted">
                  Total Barangays
                </small>
                <h2>{centers.length}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <small className="text-muted">
                  Total Occupants
                </small>
                <h2>
                  {centers.reduce(
                    (sum, x) => sum + Number(x.occupants || 0),
                    0
                  )}
                </h2>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <small className="text-muted">
                  Total Capacity
                </small>
                <h2>
                  {centers.reduce(
                    (sum, x) => sum + Number(x.capacity || 0),
                    0
                  )}
                </h2>
              </div>
            </div>
          </div>

        </div>

        <div className="card border-0 shadow-sm">

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>
                  <th>Barangay</th>
                  <th>Centers</th>
                  <th>Occupants</th>
                  <th>Capacity</th>
                  <th>Utilization</th>
                  <th></th>
                </tr>

              </thead>

              <tbody>

                {centers.map((c) => {

                  const percent =
                    c.capacity > 0
                      ? Math.round(
                          (c.occupants / c.capacity) * 100
                        )
                      : 0;

                  return (
                    <tr key={c.barangay}>

                      <td className="fw-semibold">
                        {c.barangay}
                      </td>

                      <td>
                        {c.centers}
                      </td>

                      <td>
                        {c.occupants}
                      </td>

                      <td>
                        {c.capacity}
                      </td>

                      <td style={{width: 250}}>

                        <div className="d-flex align-items-center gap-2">

                          <div
                            className="progress flex-grow-1"
                            style={{height: 8}}
                          >
                            <div
                              className={`progress-bar ${
                                percent >= 90
                                  ? "bg-danger"
                                  : percent >= 70
                                  ? "bg-warning"
                                  : "bg-success"
                              }`}
                              style={{
                                width: `${percent}%`
                              }}
                            />
                          </div>

                          <small>
                            {percent}%
                          </small>

                        </div>

                      </td>

                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => viewCenters(c.barangay)}
                          >
                            View Centers
                          </button>
                        </div>

                      </td>

                    </tr>
                  );

                })}

              </tbody>

            </table>

          </div>

        </div>
        {showCentersModal && (

          <div
            className="modal d-block"
            style={{
              background: "rgba(0,0,0,.7)"
            }}
          >

            <div className="modal-dialog modal-md modal-dialog-centered">

            <div className="modal-content border-0 shadow-lg">

              <div className="modal-header">

                <h5 className="fw-bold">
                  {selectedBarangay} Evacuation Centers
                </h5>

                <button
                  className="btn-close"
                  onClick={() => setShowCentersModal(false)}
                />

              </div>

              <div className="modal-body">

              <div className="row g-3 justify-content-center">

                {barangayCenters.map((c) => {

                  const badge = getEventBadge(c.event_type);

                  return (

                    <div
                      key={c.id}
                      className="col-12 col-12"
                    >

                      <div className="card shadow-sm border h-100 rounded-4">

                        <div className="card-body">

                          <div className="d-flex justify-content-between align-items-start mb-2">

                            <div>

                              <h5
                                className="mb-0 text-capitalize fw-semibold"
                                style={{ fontSize: 18 }}
                              >
                                {c.name}
                              </h5>

                              <small
                                className="text-muted text-capitalize fw-light"
                                style={{ fontSize: 14 }}
                              >
                                <i className="bi bi-geo-alt-fill me-1"></i>
                                {c.location}
                              </small>

                            </div>

                            <div className="d-flex flex-column gap-1">

                              <span
                                className={`badge ${getStatusClass(
                                  c.status
                                )}`}
                              >
                                {c.status}
                              </span>

                              <span
                                className={badge.className}
                                style={{ fontSize: 12 }}
                              >
                                <i
                                  className={`bi ${badge.icon}`}
                                ></i>

                                <span className="ms-1">
                                  {c.event_type}
                                </span>
                              </span>

                            </div>

                          </div>

                          {/* OCCUPANCY */}

                          <div className="mt-3">

                            <div className="d-flex justify-content-between mb-1">

                              <small className="text-muted">
                                Occupancy
                              </small>

                              <small
                                className="fw-light"
                                style={{ fontSize: 13 }}
                              >
                                {c.current_occupancy || 0}
                                {" "}Pax /
                                {" "}
                                {c.capacity || 0}
                              </small>

                            </div>

                            <div
                              className="progress"
                              style={{
                                height: "10px",
                                borderRadius: "20px",
                                background: "#edf2f7",
                              }}
                            >

                              <div
                                className={`progress-bar ${
                                  (c.current_occupancy /
                                    c.capacity) >= 1
                                    ? "bg-danger"
                                    : (c.current_occupancy /
                                        c.capacity) >= 0.7
                                    ? "bg-warning"
                                    : "bg-success"
                                }`}
                                style={{
                                  width: `${
                                    Math.min(
                                      ((c.current_occupancy || 0) /
                                        (c.capacity || 1)) *
                                        100,
                                      100
                                    )
                                  }%`,
                                  borderRadius: "20px",
                                }}
                              />

                            </div>

                          </div>

                          {/* FACILITIES */}

                          {c.facilities && (

                            <div className="mt-3">

                              <div className="d-flex flex-wrap gap-2">

                                {(Array.isArray(c.facilities)
                                  ? c.facilities
                                  : c.facilities.split(",")
                                ).map((facility, index) => (

                                  <span
                                    key={index}
                                    className="badge rounded-pill text-bg-light border"
                                  >
                                    {facility}
                                  </span>

                                ))}

                              </div>

                            </div>

                          )}

                          {/* CONTACT */}

                          <div className="mt-3 border-top pt-3">

                            <div className="d-flex justify-content-between">

                              <div>

                                <small
                                  className="text-muted d-block"
                                  style={{ fontSize: 11 }}
                                >
                                  <i className="bi bi-person me-1"></i>
                                  Contact Person
                                </small>

                                <span
                                  className="fw-light text-capitalize"
                                  style={{ fontSize: 13 }}
                                >
                                  {c.contact_person || "N/A"}
                                </span>

                              </div>

                              <div className="text-end">

                                <small
                                  className="text-muted d-block"
                                  style={{ fontSize: 11 }}
                                >
                                  <i className="bi bi-telephone me-1"></i>
                                  Contact Number
                                </small>

                                <span
                                  className="fw-light"
                                  style={{ fontSize: 13 }}
                                >
                                  {c.contact_number || "N/A"}
                                </span>

                              </div>

                            </div>

                          </div>

                        </div>
                        <div className="card-footer border-0">
                        <div className="row g-2">
                          
                          <div className="col-10">
                            <button
                                className="btn btn-sm btn-outline-primary w-100"
                                onClick={() => {
                                    setForm(normalizeCenter(c));
                                    setShowCentersModal(false);
                                    setMode("edit");
                                    setShowModal(true);
                                  }}
                              >
                                <i className="bi bi-pencil me-1"></i>
                                Edit
                              </button>
                          </div>

                          <div className="col-2">
                            <button
                              className="btn btn-sm btn-outline-danger w-100"
                              onClick={() => {
                                handleDelete(c.id);
                                setShowCentersModal(false);
                              }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>

                        </div>
                      </div>


                      </div>

                    </div>

                  );

                })}

              </div>

            </div>

          </div>
          </div>

        </div>

          )}

          {showModal && (
          <div
            className="modal d-block"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div className="modal-dialog modal-md modal-dialog-centered">
              <div className="modal-content border-0 shadow-xl rounded-4 overflow-hidden">

                {/* HEADER */}
                <div className="modal-header bg-light border-0">
                  <div>
                    <h5 className="fw-bold mb-0">
                      {mode === "create"
                        ? "Add Evacuation Center"
                        : mode === "view"
                        ? "Evacuation Details"
                        : "Edit Evacuation Center"}
                    </h5>
                    <small className="text-muted">
                      Manage evacuation center & disaster response schedule
                    </small>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>

                {/* ================= FORM START ================= */}
                <form
                  onSubmit={(e) => {
                      if (mode === "edit") return handleUpdatemddrmo(e);
                      return handleSubmitmdrrmo(e);
                    }}
                >
                  <div className="modal-body p-4">

                    {/* ================= BASIC INFO ================= */}
                    <div className="row g-2">

                      <div className="col-12">
                        <label className="form-label">Evacuation Type *</label>
                        <select
                          className="form-select"
                          name="event_type"
                          value={form.event_type}
                          onChange={handleChange}
                          required
                          disabled={mode === "view"}
                        >
                          <option value="">Select disaster type</option>
                          <option value="Typhoon">🌪 Typhoon</option>
                          <option value="Flood">🌊 Flood</option>
                          <option value="Fire">🔥 Fire</option>
                          <option value="Earthquake">🌎 Earthquake</option>
                          <option value="Other">⚠️ Other</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Center Name *</label>
                        <input
                          className="form-control text-capitalize"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          disabled={mode === "view"}
                          placeholder="Gymnasium, School, Health Center"
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Barangay *</label>
                        <input
                          className="form-control text-capitalize"
                          name="barangay"
                          value={form.barangay}
                          onChange={handleChange}
                          required
                          disabled={mode === "view"}
                          placeholder="Barangay"
                        />
                      </div>

                      <div className="col-8">
                        <label className="form-label">Purok/Zone/Sitio *</label>
                        <input
                          className="form-control text-capitalize"
                          name="location"
                          value={form.location}
                          onChange={handleChange}
                          required
                          disabled={mode === "view"}
                          placeholder="Purok, Zone, Sitio"
                        />
                      </div>

                      <div className="col-4">
                        <label className="form-label">Status *</label>
                        <select
                          className="form-select"
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          required
                          disabled={mode === "view"}
                        >
                          <option value="Standby">Standby</option>
                          <option value="Open">Open</option>
                          <option value="Full">Full</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Capacity *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="capacity"
                          value={form.capacity}
                          onChange={handleChange}
                          required
                          disabled={mode === "view"}
                          placeholder="100"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Current Occupancy</label>
                        <input
                          type="number"
                          className="form-control"
                          name="current_occupancy"
                          value={form.current_occupancy}
                          onChange={handleChange}
                          disabled={mode === "view"}
                          placeholder="0"
                        />
                      </div>

                      
                    </div>

                    {/* ================= FACILITIES ================= */}
                    <div className="mt-3">
                      <h6 className="fw-bold text-primary mb-2">Facilities</h6>

                      <div className="d-flex gap-2 mb-2">
                        <input
                          type="text"
                          className="form-control text-capitalize"
                          value={facilityInput}
                          onChange={(e) => setFacilityInput(e.target.value)}
                          placeholder="Water Kitchen Food"
                          disabled={mode === "view"}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addFacility();
                            }
                          }}
                        />

                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={addFacility}
                          disabled={mode === "view"}
                        >
                          Add
                        </button>
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        {(form.facilities || []).map((item, index) => (
                          <span
                            key={index}
                            className="badge bg-secondary d-flex align-items-center gap-2 px-3 py-2"
                          >
                            {item}

                            {mode !== "view" && (
                              <button
                                type="button"
                                onClick={() => removeFacility(index)}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  color: "white",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                }}
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* ================= CONTACT ================= */}
                    <div className="mt-3">
                      <h6 className="fw-bold text-primary mb-2">Contact Person</h6>

                      <div className="row g-2">
                        <div className="col-md-6">
                          <input
                            className="form-control"
                            name="contact_person"
                            value={form.contact_person}
                            onChange={handleChange}
                            disabled={mode === "view"}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <input
                            className="form-control"
                            name="contact_number"
                            value={form.contact_number}
                            onChange={handleChange}
                            disabled={mode === "view"}
                            required
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* FOOTER */}
                  <div className="modal-footer bg-light border-0 d-flex justify-content-between">

                    <small className="text-muted">
                      * Required fields must be filled
                    </small>

                    <div className="d-flex gap-2">

                      {mode === "create" && (
                        <button type="submit" className="btn btn-primary px-4">
                          Save
                        </button>
                      )}

                      {mode === "edit" && (
                        <button type="submit" className="btn btn-success px-4">
                          Update
                        </button>
                      )}

                      {mode === "view" && (
                        <button
                          type="button"
                          className="btn btn-warning px-4"
                          onClick={() => 
                            setMode("edit")}
                        >
                          Edit
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-outline-secondary px-4"
                        onClick={() => setShowModal(false)}
                      >
                        Close
                      </button>

                    </div>
                  </div>
                </form>
                {/* ================= FORM END ================= */}

              </div>
            </div>
          </div>
        )}

         

      </div>
    );
  }

  
  // ================= UI =================
  // For Barangay Officials
  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="d-md-flex justify-content-between mb-5">
        <div className="d-flex flex-column mb-3 mb-md-0">
          <h3 className="p-0 m-0">Evacuation Centers</h3>
          <span className="text-muted">Manage evacuation sites and monitor capacity</span>
        </div>
        <div className="text-end mb-3">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            resetForm();
            setMode("create");
            setShowModal(true);
          }}
        >
          + Add Evacuation
        </button>
      </div>
      
      </div>
      

      {/* TABLE */}
      <div className="">
          {loading ? (
              <p>Loading...</p>
            ) : centers.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <h5>No Evacuation Centers Found</h5>
                <small>Click “Add Evacuation” to create one</small>
              </div>
            ) : (
              <div className="row g-3">
                {centers.map((c) =>{
                  const badge = getEventBadge(c.event_type);
                 return (
                  
                  <div key={c.id} className="col-12 col-md-6">
                    <div className="card shadow-sm border h-100 rounded-4">

                      <div className="card-body">

                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h5 className="mb-0 text-capitalize fw-semibold" style={{ fontSize: 18 }}>{c.name}</h5>
                            <small className="text-muted text-capitalize fw-light" style={{ fontSize: 14 }}>
                              <i className="bi bi-geo-alt-fill me-1" ></i>
                              {c.location}
                            </small>
                          </div>

                          <div className="d-flex flex-column gap-1">
                            <span className={`badge ${getStatusClass(c.status)}`}>
                              {c.status}
                            </span>

                            {/* EVENT BADGE */}
                            <span className={badge.className} style={{ fontSize: 12 }}>
                              <i className={`bi ${badge.icon}`}></i>
                              <span className="ms-1 text-capitalize">
                                {c.event_type}
                              </span>
                            </span>

                          </div>
                        </div>

                        {/* OCCUPANCY BAR */}
                          <div className="mt-3">

                            <div className="d-flex justify-content-between mb-1">
                              <small className="text-muted">Occupancy</small>

                              <small className="fw-light" style={{ fontSize: 13 }}>
                                {c.current_occupancy || 0} Pax / {c.capacity || 0} Capacity
                              </small>
                            </div>

                            <div
                              className="progress"
                              style={{
                                height: "10px",
                                borderRadius: "20px",
                                background: "#edf2f7",
                              }}
                            >
                              <div
                                className={`progress-bar ${
                                  (c.current_occupancy / c.capacity) >= 1
                                    ? "bg-danger"
                                    : (c.current_occupancy / c.capacity) >= 0.7
                                    ? "bg-warning"
                                    : "bg-success"
                                }`}
                                role="progressbar"
                                style={{
                                  width: `${
                                    Math.min(
                                      ((c.current_occupancy || 0) / (c.capacity || 1)) * 100,
                                      100
                                    )
                                  }%`,
                                  borderRadius: "20px",
                                }}
                              />
                            </div>

                          </div>

                        {/* FACILITIES */}
                          {c.facilities && (
                            <div className="mt-3">
                              

                              <div className="d-flex flex-wrap gap-2">
                                {(Array.isArray(c.facilities)
                                  ? c.facilities
                                  : c.facilities.split(",")
                                ).map((facility, index) => (
                                  <span
                                    key={index}
                                    className="badge rounded-pill text-bg-light border text-capitalize fw-light"
                                  >
                                    {facility}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* CONTACT PERSON */}
                            <div className="mt-3 border-top pt-3">
                              
                              <div className="d-flex justify-content-between align-items-center">
                                
                                <div>
                                  <small className="text-muted d-block fw-light" style={{ fontSize: 11 }}>
                                    <i className="bi bi-person me-1"></i>
                                    Contact Person
                                  </small>

                                  <span className=" text-capitalize fw-light" style={{ fontSize: 13 }}>
                                    {c.contact_person || "N/A"}
                                  </span>
                                </div>

                                <div className="text-end">
                                  <small className="text-muted d-block fw-light" style={{ fontSize: 11 }}>
                                    <i className="bi bi-telephone me-1"></i>
                                    Contact Number
                                  </small>

                                  <span className="fw-light" style={{ fontSize: 13 }}>
                                    {c.contact_number
                                      ? `${c.contact_number.slice(0,4)}-${c.contact_number.slice(4,7)}-${c.contact_number.slice(7,11)}`
                                      : "N/A"}
                                  </span>
                                </div>

                              </div>

                            </div>
                      </div>

                      
                      <div className="card-footer border-0">
                        <div className="row g-2">
                          
                          <div className="col-10">
                            <button
                                className="btn btn-sm btn-outline-primary w-100"
                                onClick={() => {
                                  setForm(normalizeCenter(c));
                                  setMode("edit");
                                  setShowModal(true);
                                }}
                              >
                                <i className="bi bi-pencil me-1"></i>
                                Edit
                              </button>
                          </div>

                          <div className="col-2">
                            <button
                              className="btn btn-sm btn-outline-danger w-100"
                              onClick={() => handleDelete(c.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
      </div>

    {showModal && (
          <div
            className="modal d-block"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div className="modal-dialog modal-md modal-dialog-centered">
              <div className="modal-content border-0 shadow-xl rounded-4 overflow-hidden">

                {/* HEADER */}
                <div className="modal-header bg-light border-0">
                  <div>
                    <h5 className="fw-bold mb-0">
                      {mode === "create"
                        ? "Add Evacuation Center"
                        : mode === "view"
                        ? "Evacuation Details"
                        : "Edit Evacuation Center"}
                    </h5>
                    <small className="text-muted">
                      Manage evacuation center & disaster response schedule
                    </small>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>

                {/* ================= FORM START ================= */}
                <form
                  onSubmit={(e) => {
                      if (mode === "edit") return handleUpdate(e);
                      return handleSubmit(e);
                    }}
                >
                  <div className="modal-body p-4">

                    {/* ================= BASIC INFO ================= */}
                    <div className="row g-2">

                      <div className="col-12">
                        <label className="form-label">Evacuation Type *</label>
                        <select
                          className="form-select"
                          name="event_type"
                          value={form.event_type}
                          onChange={handleChange}
                          required
                          disabled={mode === "view"}
                        >
                          <option value="">Select disaster type</option>
                          <option value="Typhoon">🌪 Typhoon</option>
                          <option value="Flood">🌊 Flood</option>
                          <option value="Fire">🔥 Fire</option>
                          <option value="Earthquake">🌎 Earthquake</option>
                          <option value="Other">⚠️ Other</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Center Name *</label>
                        <input
                          className="form-control text-capitalize"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          disabled={mode === "view"}
                          placeholder="Gymnasium, School, Health Center"
                        />
                      </div>

                      <div className="col-8">
                        <label className="form-label">Location *</label>
                        <input
                          className="form-control text-capitalize"
                          name="location"
                          value={form.location}
                          onChange={handleChange}
                          required
                          disabled={mode === "view"}
                          placeholder="Purok, Zone, Sitio"
                        />
                      </div>

                      <div className="col-4">
                        <label className="form-label">Status *</label>
                        <select
                          className="form-select"
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          required
                          disabled={mode === "view"}
                        >
                          <option value="Standby">Standby</option>
                          <option value="Open">Open</option>
                          <option value="Full">Full</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Capacity *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="capacity"
                          value={form.capacity}
                          onChange={handleChange}
                          required
                          disabled={mode === "view"}
                          placeholder="100"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Current Occupancy</label>
                        <input
                          type="number"
                          className="form-control"
                          name="current_occupancy"
                          value={form.current_occupancy}
                          onChange={handleChange}
                          disabled={mode === "view"}
                          placeholder="0"
                        />
                      </div>

                      
                    </div>

                    {/* ================= FACILITIES ================= */}
                    <div className="mt-3">
                      <h6 className="fw-bold text-primary mb-2">Facilities</h6>

                      <div className="d-flex gap-2 mb-2">
                        <input
                          type="text"
                          className="form-control text-capitalize"
                          value={facilityInput}
                          onChange={(e) => setFacilityInput(e.target.value)}
                          placeholder="Water Kitchen Food"
                          disabled={mode === "view"}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addFacility();
                            }
                          }}
                        />

                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={addFacility}
                          disabled={mode === "view"}
                        >
                          Add
                        </button>
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        {(form.facilities || []).map((item, index) => (
                          <span
                            key={index}
                            className="badge bg-secondary d-flex align-items-center gap-2 px-3 py-2"
                          >
                            {item}

                            {mode !== "view" && (
                              <button
                                type="button"
                                onClick={() => removeFacility(index)}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  color: "white",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                }}
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* ================= CONTACT ================= */}
                    <div className="mt-3">
                      <h6 className="fw-bold text-primary mb-2">Contact Person</h6>

                      <div className="row g-2">
                        <div className="col-md-6">
                          <input
                            className="form-control"
                            name="contact_person"
                            value={form.contact_person}
                            onChange={handleChange}
                            disabled={mode === "view"}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <input
                            className="form-control"
                            name="contact_number"
                            value={form.contact_number}
                            onChange={handleChange}
                            disabled={mode === "view"}
                            required
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* FOOTER */}
                  <div className="modal-footer bg-light border-0 d-flex justify-content-between">

                    <small className="text-muted">
                      * Required fields must be filled
                    </small>

                    <div className="d-flex gap-2">

                      {mode === "create" && (
                        <button type="submit" className="btn btn-primary px-4">
                          Save
                        </button>
                      )}

                      {mode === "edit" && (
                        <button type="submit" className="btn btn-success px-4">
                          Update
                        </button>
                      )}

                      {mode === "view" && (
                        <button
                          type="button"
                          className="btn btn-warning px-4"
                          onClick={() => setMode("edit")}
                        >
                          Edit
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-outline-secondary px-4"
                        onClick={() => setShowModal(false)}
                      >
                        Close
                      </button>

                    </div>
                  </div>
                </form>
                {/* ================= FORM END ================= */}

              </div>
            </div>
          </div>
        )}

    </div>
  );
}