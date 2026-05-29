import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-toastify";

export default function EventsCalendar() {
  const [events, setEvents] = useState([]);
  const token = localStorage.getItem("token");

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("create");

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
  const fetchEvents = async () => {
    try {
      const res = await fetch("https://ajcpisonet.com/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      // convert to FullCalendar format
      const formatted = data.data.map((e) => ({
        id: e.id,
        title: e.title,
        start: `${e.event_date}T${e.start_time || "00:00"}`,
        end: e.end_time ? `${e.event_date}T${e.end_time}` : null,
        extendedProps: e,
      }));

      setEvents(formatted);
    } catch {
      toast.error("Failed to load calendar");
    }
  };

  const defaultForm = {
    id: null,
    title: "",
    description: "",
    type: "",
    event_date: "",
    start_time: "",
    end_time: "",
    location: "",
    };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ================= CLICK DATE =================
  const handleDateClick = (arg) => {
    setForm({
        ...defaultForm,
        event_date: arg.dateStr,
    });

    setMode("create");
    setShowModal(true);
    };

  // ================= CLICK EVENT =================
  const handleEventClick = (info) => {
    const e = info.event.extendedProps;

    setForm({
      id: e.id,
      title: e.title,
      description: e.description,
      type: e.type,
      event_date: e.event_date,
      start_time: e.start_time,
      end_time: e.end_time,
      location: e.location,
    });

    setMode("view");
    setShowModal(true);
  };

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ================= SAVE =================
  const handleSubmit = async () => {
    try {
      const res = await fetch("https://ajcpisonet.com/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      toast.success("Event created");
      setForm(defaultForm);
      setShowModal(false);
      fetchEvents();
    } catch {
      toast.error("Failed to create event");
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
          },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Event updated");
      setShowModal(false);
      fetchEvents();
    } catch {
      toast.error("Update failed");
    }
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    if (!window.confirm("Delete this event?")) return;

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/events/${form.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Event deleted");
      setShowModal(false);
      fetchEvents();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="mb-3">
        <h4 className="fw-bold">📅 Barangay Calendar</h4>
        <small className="text-muted">
          Click a date to create event, click event to view
        </small>
      </div>

      {/* CALENDAR */}
      <div className="card border-0 shadow-sm p-3 rounded-4">

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="80vh"
          editable={true}
          selectable={true}
        />

      </div>

      {/* MODAL */}
        {showModal && (
        <div
            className="modal d-block"
            style={{
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(3px)",
            }}
        >
            <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">

                {/* HEADER */}
                <div className="modal-header border-0 pb-0">
                <div>
                    <h5 className="fw-bold mb-0">
                    {mode === "create"
                        ? "➕ Create Event"
                        : mode === "view"
                        ? "📄 Event Details"
                        : "✏️ Edit Event"}
                    </h5>
                    <small className="text-muted">
                    Barangay Event Management
                    </small>
                </div>

                <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                />
                </div>

                <div className="modal-body">

                {/* TITLE */}
                <div className="mb-2">
                    <label className="form-label fw-semibold">
                    Title <span className="text-danger">*</span>
                    </label>
                    <input
                    className={`form-control ${
                        !form.title && mode !== "view" ? "border-danger" : ""
                    }`}
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Barangay Assembly Meeting"
                    disabled={mode === "view"}
                    />
                </div>

                {/* TYPE */}
                <div className="mb-2">
                    <label className="form-label fw-semibold">Type</label>
                    <select
                    className="form-select"
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
                </div>

                {/* DATE + TIME */}
                <div className="row g-2">
                    <div className="col-md-6">
                    <label className="form-label fw-semibold">
                        Date <span className="text-danger">*</span>
                    </label>
                    <input
                        type="date"
                        className={`form-control ${
                        !form.event_date && mode !== "view" ? "border-danger" : ""
                        }`}
                        name="event_date"
                        value={form.event_date}
                        onChange={handleChange}
                        disabled={mode === "view"}
                    />
                    </div>

                    <div className="col-md-6">
                    <label className="form-label fw-semibold">Start Time</label>
                    <input
                        type="time"
                        className="form-control"
                        name="start_time"
                        value={form.start_time}
                        onChange={handleChange}
                        disabled={mode === "view"}
                    />
                    </div>

                    <div className="col-md-6">
                    <label className="form-label fw-semibold">End Time</label>
                    <input
                        type="time"
                        className="form-control"
                        name="end_time"
                        value={form.end_time}
                        onChange={handleChange}
                        disabled={mode === "view"}
                    />
                    </div>

                    <div className="col-md-6">
                    <label className="form-label fw-semibold">Location</label>
                    <input
                        className="form-control"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="Barangay Hall / Sitio"
                        disabled={mode === "view"}
                    />
                    </div>
                </div>

                {/* DESCRIPTION */}
                <div className="mt-2">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                    className="form-control"
                    rows="3"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Details of the event..."
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
                    <button
                        className="btn btn-primary px-4"
                        onClick={handleSubmit}
                        disabled={!form.title || !form.event_date}
                    >
                        Save
                    </button>
                    )}

                    {mode === "edit" && (
                    <button
                        className="btn btn-success px-4"
                        onClick={handleUpdate}
                        disabled={!form.title || !form.event_date}
                    >
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

                    {mode !== "create" && (
                    <button
                        className="btn btn-danger px-4"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                    )}

                    <button
                    className="btn btn-light border px-4"
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