import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("create");

  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    id: null,
    title: "",
    description: "",
    type: "",
    event_date: "",
    start_time: "",
    end_time: "",
    location: "",
  });

  // ================= FETCH =================
  const fetchEvents = async (pageNum = 1, searchTerm = "") => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/events?page=${pageNum}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      setEvents(data.data || []);
      setPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(1, "");
  }, []);

  // ================= CHANGE =================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ================= RESET =================
  const resetForm = () => {
    setForm({
      id: null,
      title: "",
      description: "",
      type: "",
      event_date: "",
      start_time: "",
      end_time: "",
      location: "",
    });
  };

  // ================= CREATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://ajcpisonet.com/api/events", {
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
        toast.error(result.message || "Failed");
        return;
      }

      toast.success("Event created");

      setShowModal(false);
      resetForm();
      fetchEvents(page, search);
    } catch {
      toast.error("Server error");
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/events/${form.id}`,
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

      toast.success("Event updated");

      setShowModal(false);
      resetForm();
      fetchEvents(page, search);
    } catch {
      toast.error("Server error");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/events/${id}`,
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

      toast.success("Event deleted");
      fetchEvents(page, search);
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
      if (i === 1 || i === lastPage || (i >= page - delta && i <= page + delta)) {
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

        {/* SEARCH */}
        <div className="position-relative" style={{ width: "350px" }}>
          <i
            className="bi bi-search position-absolute"
            style={{
              top: "50%",
              left: "14px",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />

          <input
            type="text"
            className="form-control border-0 shadow-sm"
            placeholder="Search events..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              fetchEvents(1, value);
            }}
            style={{
              height: "46px",
              borderRadius: "14px",
              background: "#f8fafc",
              paddingLeft: "42px",
              paddingRight: "42px",
            }}
          />

          {search && (
            <button
              className="btn p-0 position-absolute"
              onClick={() => {
                setSearch("");
                fetchEvents(1, "");
              }}
              style={{
                top: "50%",
                right: "14px",
                transform: "translateY(-50%)",
              }}
            >
              <i className="bi bi-x-circle-fill text-secondary"></i>
            </button>
          )}
        </div>

        {/* ADD */}
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setMode("create");
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-lg me-1"></i>
          Add Event
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
                      <th>Title</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Location</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {events.length > 0 ? (
                      events.map((e, index) => (
                        <tr key={e.id}>
                          <td>{(page - 1) * 10 + index + 1}</td>
                          <td className="fw-semibold">{e.title}</td>
                          <td>{e.type || "-"}</td>
                          <td>{e.event_date}</td>
                          <td>
                            {e.start_time || "-"} - {e.end_time || "-"}
                          </td>
                          <td>{e.location || "-"}</td>

                          <td>
                            <div className="d-flex gap-2 justify-content-end">

                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  setForm(e);
                                  setMode("view");
                                  setShowModal(true);
                                }}
                              >
                                View
                              </button>

                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(e.id)}
                              >
                                Delete
                              </button>

                            </div>
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          No events found
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>

              {/* PAGINATION */}
              <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap">

                <button
                  className="btn btn-light border"
                  disabled={page === 1}
                  onClick={() => fetchEvents(page - 1, search)}
                >
                  Prev
                </button>

                {getPages().map((p, i) =>
                  p === "..." ? (
                    <span key={i} className="px-2 text-muted">...</span>
                  ) : (
                    <button
                      key={i}
                      className={`btn ${p === page ? "btn-primary" : "btn-light border"}`}
                      onClick={() => fetchEvents(p, search)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  className="btn btn-light border"
                  disabled={page === lastPage}
                  onClick={() => fetchEvents(page + 1, search)}
                >
                  Next
                </button>

              </div>
            </>
          )}

        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 p-3">

              <h5>
                {mode === "create"
                  ? "Add Event"
                  : mode === "view"
                  ? "Event Details"
                  : "Edit Event"}
              </h5>

              <input
                className="form-control my-2"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Title"
                disabled={mode === "view"}
              />

              <select
                className="form-select my-2"
                name="type"
                value={form.type}
                onChange={handleChange}
                disabled={mode === "view"}
              >
                <option value="">Select Type</option>
                <option value="Meeting">Meeting</option>
                <option value="Hearing">Hearing</option>
                <option value="Event">Event</option>
                <option value="Emergency">Emergency</option>
              </select>

              <input
                type="date"
                className="form-control my-2"
                name="event_date"
                value={form.event_date}
                onChange={handleChange}
                disabled={mode === "view"}
              />

              <input
                type="time"
                className="form-control my-2"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                disabled={mode === "view"}
              />

              <input
                type="time"
                className="form-control my-2"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                disabled={mode === "view"}
              />

              <input
                className="form-control my-2"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Location"
                disabled={mode === "view"}
              />

              <textarea
                className="form-control my-2"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                disabled={mode === "view"}
              />

              <div className="d-flex justify-content-end gap-2 mt-3">

                {mode === "create" && (
                  <button className="btn btn-primary" onClick={handleSubmit}>
                    Save
                  </button>
                )}

                {mode === "edit" && (
                  <button className="btn btn-success" onClick={handleUpdate}>
                    Update
                  </button>
                )}

                {mode === "view" && (
                  <button
                    className="btn btn-warning"
                    onClick={() => setMode("edit")}
                  >
                    Edit
                  </button>
                )}

                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
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