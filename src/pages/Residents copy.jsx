import { useEffect, useState } from "react";

export default function Residents() {
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  };

  const user = getUser();
  const barangay = user?.barangay;

  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    sex: "",
    birth_date: "",
    civil_status: "",

    purok: "",
    house_number: "",
    street: "",

    household_name: "",
    relationship_to_head: "",

    father_name: "",
    mother_name: "",
    spouse_name: "",
    guardian_name: "",

    contact_number: "",
    occupation: "",

    is_voter: false,
    is_pwd: false,
    pwd_type: "",

    resident_status: "Active",
  });

  // FETCH
  const fetchResidents = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/residents?barangay=${barangay}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();
      setResidents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  // INPUT
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // VALIDATION (STRICT REQUIRED FIELDS)
  const validateForm = () => {
    const required = [
      "first_name",
      "last_name",
      "sex",
      "birth_date",
      "civil_status",
      "purok",
      "house_number",
      "household_name",
      "relationship_to_head",
    ];

    for (let field of required) {
      if (!form[field]) {
        alert(`${field} is required`);
        return false;
      }
    }

    return true;
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const res = await fetch("http://localhost:8000/api/residents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...form,
          barangay,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        fetchResidents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Residents Census System</h3>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Resident
        </button>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Resident</th>
                    <th>Sex</th>
                    <th>Age</th>
                    <th>Birth Date</th>
                    <th>Address</th>
                    <th>Household</th>
                    <th>Contact</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {residents.map((r) => {
                    const age = r.birth_date
                      ? new Date().getFullYear() -
                        new Date(r.birth_date).getFullYear()
                      : "-";

                    return (
                      <tr key={r.id}>
                        <td>
                          <div className="fw-semibold">
                            {r.fullname}
                          </div>

                          <small className="text-muted">
                            {r.middle_name} {r.suffix}
                          </small>
                        </td>

                        <td>{r.sex}</td>

                        <td>{age}</td>

                        <td>
                          {r.birth_date
                            ? new Date(r.birth_date).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>
                          <div>{r.house_number}</div>
                          <small className="text-muted">
                            {r.purok} {r.street}
                          </small>
                        </td>

                        <td>{r.household_name}</td>

                        <td>{r.contact_number || "-"}</td>

                        <td>
                          <span
                            className={`badge ${
                              r.resident_status === "Active"
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
                          >
                            {r.resident_status}
                          </span>

                          <div className="mt-1 d-flex gap-1 flex-wrap">
                            {r.is_voter && (
                              <span className="badge bg-primary">Voter</span>
                            )}

                            {r.is_pwd && (
                              <span className="badge bg-warning text-dark">
                                PWD
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
                className="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered"
              >
            <div className="modal-content">

              <div className="modal-header">
                <h5>Add Resident (Census Form)</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>

                  {/* PERSONAL INFORMATION */}
                  <div className="mb-4">
                    <h6 className="fw-bold border-bottom pb-2 mb-3">
                      Personal Information
                    </h6>

                    <div className="row g-3">

                      <div className="col-md-3">
                        <label className="form-label">First Name</label>
                        <input
                          required
                          name="first_name"
                          className="form-control"
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Middle Name</label>
                        <input
                          name="middle_name"
                          className="form-control"
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Last Name</label>
                        <input
                          required
                          name="last_name"
                          className="form-control"
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Suffix</label>
                        <input
                          name="suffix"
                          className="form-control"
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Sex</label>

                        <select
                          required
                          name="sex"
                          className="form-select"
                          onChange={handleChange}
                        >
                          <option value="">Select</option>
                          <option>Male</option>
                          <option>Female</option>
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Birth Date</label>

                        <input
                          required
                          type="date"
                          name="birth_date"
                          className="form-control"
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Civil Status</label>

                        <select
                          required
                          name="civil_status"
                          className="form-select"
                          onChange={handleChange}
                        >
                          <option value="">Select</option>
                          <option>Single</option>
                          <option>Married</option>
                          <option>Widowed</option>
                          <option>Separated</option>
                        </select>
                      </div>

                    </div>
                  </div>

                  {/* ADDRESS */}
                  <div className="mb-4">
                    <h6 className="fw-bold border-bottom pb-2 mb-3">
                      Address Information
                    </h6>

                    <div className="row g-3">

                      <div className="col-md-4">
                        <label className="form-label">Purok</label>

                        <input
                          required
                          name="purok"
                          className="form-control"
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">House Number</label>

                        <input
                          required
                          name="house_number"
                          className="form-control"
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Street</label>

                        <input
                          name="street"
                          className="form-control"
                          onChange={handleChange}
                        />
                      </div>

                    </div>
                  </div>

                  {/* HOUSEHOLD */}
                  <div className="mb-4">
                    <h6 className="fw-bold border-bottom pb-2 mb-3">
                      Household Information
                    </h6>

                    <div className="row g-3">

                      <div className="col-md-6">
                        <label className="form-label">Household Name</label>

                        <input
                          required
                          name="household_name"
                          className="form-control"
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Relationship to Head
                        </label>

                        <input
                          required
                          name="relationship_to_head"
                          className="form-control"
                          onChange={handleChange}
                        />
                      </div>

                    </div>
                  </div>

                  {/* CONTACT */}
                  <div className="mb-4">
                    <h6 className="fw-bold border-bottom pb-2 mb-3">
                      Contact & Occupation
                    </h6>

                    <div className="row g-3">

                      <div className="col-md-6">
                        <label className="form-label">Contact Number</label>

                        <input
                          name="contact_number"
                          className="form-control"
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Occupation</label>

                        <input
                          name="occupation"
                          className="form-control"
                          onChange={handleChange}
                        />
                      </div>

                    </div>
                  </div>

                  {/* FLAGS */}
                  <div className="mb-3">
                    <h6 className="fw-bold border-bottom pb-2 mb-3">
                      Resident Tags
                    </h6>

                    <div className="d-flex flex-wrap gap-4">

                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="is_voter"
                          onChange={handleChange}
                        />

                        <label className="form-check-label">
                          Registered Voter
                        </label>
                      </div>

                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="is_pwd"
                          onChange={handleChange}
                        />

                        <label className="form-check-label">
                          Person With Disability
                        </label>
                      </div>

                    </div>
                  </div>

                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>

                  <button type="submit" className="btn btn-primary">
                    Save Resident
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