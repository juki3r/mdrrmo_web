import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { onMessage } from "firebase/messaging";
import { messaging } from "../notifications/firebase";

export default function Concern() {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");

  // =========================
  // FETCH
  // =========================
  const fetchConcerns = async (pageNum = 1, searchTerm = "") => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/concerns?page=${pageNum}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error("Failed to load concerns");
        return;
      }

      setConcerns(data.data || []);
      setPage(data.current_page);
      setLastPage(data.last_page);
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcerns(1, "");
  }, []);

  useEffect(() => {
      const unsubscribe = onMessage(messaging, () => {
        fetchConcerns(page, search);
        // fetchConcerns(1, "");
      });
  
      return () => unsubscribe();
    }, [page, search]);

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    if (!confirm("Delete this concern?")) return;

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/concerns/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Delete failed");
        return;
      }

      toast.success("Concern deleted");
      fetchConcerns(page, search);
    } catch {
      toast.error("Server error");
    }
  };

  // =========================
  // STATUS UPDATE
  // =========================
  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/concerns/${id}/status`,
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

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Update failed");
        return;
      }

      toast.success("Status updated");
      setShowModal(false);
      fetchConcerns(page, search);
    } catch {
      toast.error("Server error");
    }
  };

  // =========================
  // PAGINATION
  // =========================
  const getPages = () => {
    const delta = 2;
    const range = [];
    const pages = [];
    let l;

    for (let i = 1; i <= lastPage; i++) {
      if (i === 1 || i === lastPage || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) pages.push(l + 1);
        else if (i - l !== 1) pages.push("...");
      }
      pages.push(i);
      l = i;
    });

    return pages;
  };

  const statusBadge = (status) => {
    switch (status) {
      case "resolved":
        return "bg-success";
      case "in_progress":
        return "bg-warning text-dark";
      case "rejected":
        return "bg-danger";
      case "under_review":
        return "bg-info text-dark";
      default:
        return "bg-secondary"; // received
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* HEADER */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">

        <div className="position-relative" style={{ width: 320 }}>
          <input
            className="form-control ps-4 pe-4 shadow-sm"
            placeholder="Search concerns..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
              fetchConcerns(1, e.target.value);
            }}
          />

          {search && (
            <button
              className="btn btn-sm position-absolute end-0 top-50 translate-middle-y me-2"
              onClick={() => {
                setSearch("");
                fetchConcerns(1, "");
              }}
            >
              ✕
            </button>
          )}
        </div>

      </div>

      {/* TABLE CARD */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">

          {loading ? (
            <div className="text-center py-5">Loading...</div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Submitted By</th>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {concerns.length > 0 ? (
                    concerns.map((c, i) => (
                      <tr key={c.id}>
                        <td>{(page - 1) * 10 + i + 1}</td>
                        <td className="">
                            {c.user?.full_name || "Unknown User"}
                        </td>
                        <td className="">{c.title}</td>
                        <td className="text-muted">{c.location}</td>

                        <td>
                          <span className={`badge px-3 py-2 ${statusBadge(c.status)}`}>
                            {c.status}
                          </span>
                        </td>

                        <td className="text-end">

                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => {
                              setSelected(c);
                              setShowModal(true);
                            }}
                          >
                            View
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(c.id)}
                          >
                            Delete
                          </button>

                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        No concerns found
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>

      {/* PAGINATION */}
      <div className="d-flex justify-content-center mt-4 flex-wrap gap-2">

        <button
          className="btn btn-outline-secondary rounded-pill"
          disabled={page === 1}
          onClick={() => fetchConcerns(page - 1, search)}
        >
          Prev
        </button>

        {getPages().map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-2 text-muted">...</span>
          ) : (
            <button
              key={i}
              className={`btn rounded-pill ${
                p === page ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => fetchConcerns(p, search)}
            >
              {p}
            </button>
          )
        )}

        <button
          className="btn btn-outline-secondary rounded-pill"
          disabled={page === lastPage}
          onClick={() => fetchConcerns(page + 1, search)}
        >
          Next
        </button>

      </div>

      {/* MODAL */}
      {showModal && selected && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

                {/* HEADER */}
                <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
                <div>
                    <h5 className="fw-bold mb-1">{selected.title}</h5>
                </div>

                <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                />
                </div>

                {/* STATUS STRIP */}
                <div
                className={`px-4 py-2 text-white fw-semibold ${
                    selected.status === "resolved"
                    ? "bg-success"
                    : selected.status === "in_progress"
                    ? "bg-warning text-dark"
                    : selected.status === "rejected"
                    ? "bg-danger"
                    : selected.status === "under_review"
                    ? "bg-info text-dark"
                    : "bg-secondary"
                }`}
                >
                Status: {selected.status}
                </div>

                {/* BODY */}
                <div className="p-4">

                <div className="row g-3">

                    {/* LOCATION */}
                    <div className="col-md-6">
                    <div className="p-3 border rounded-3 bg-light h-100">
                        <small className="text-muted">Location</small>
                        <div className="fw-semibold">{selected.location}</div>
                    </div>
                    </div>

                    {/* STATUS */}
                    <div className="col-md-6">
                    <div className="p-3 border rounded-3 bg-light h-100 ">
                        <small className="text-muted text-dark">Current Status</small>
                        <div>
                        <span className="px-3 py-2 mt-1">
                            {selected.status}
                        </span>
                        </div>
                    </div>
                    </div>

                    {/* DESCRIPTION FULL WIDTH */}
                    <div className="col-12">
                    <div className="p-3 border rounded-3 bg-light">
                        <small className="text-muted">Description</small>
                        <div className="mt-1">
                        {selected.description}
                        </div>
                    </div>
                    </div>

                </div>
                </div>

                {/* ACTION FOOTER */}
                <div className="p-3 border-top bg-white">

                <div className="d-flex flex-wrap gap-2 justify-content-center">

                    <button
                    className="btn btn-outline-secondary rounded-pill px-3"
                    onClick={() => updateStatus(selected.id, "received")}
                    >
                    Step 1: Mark as Received
                    </button>

                    <button
                    className="btn btn-outline-info rounded-pill px-3"
                    onClick={() => updateStatus(selected.id, "under_review")}
                    >
                    Step 2: Under Review
                    </button>

                    <button
                    className="btn btn-outline-warning rounded-pill px-3"
                    onClick={() => updateStatus(selected.id, "in_progress")}
                    >
                    Step 3: Mark as In Progress
                    </button>

                    <button
                    className="btn btn-outline-success rounded-pill px-3"
                    onClick={() => updateStatus(selected.id, "resolved")}
                    >
                    Step 4: Mark as Resolve
                    </button>

                    <button
                    className="btn btn-outline-danger rounded-pill px-3"
                    onClick={() => updateStatus(selected.id, "rejected")}
                    >
                    Reject or Declined
                    </button>

                </div>

                {/* CLOSE BUTTON */}
                <div className="text-center mt-3">
                    <button
                    className="btn btn-light border rounded-pill px-4"
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