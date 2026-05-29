import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

 
  const [selectedNews, setSelectedNews] = useState(null);


  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); 
// "create" | "view" | "edit"


  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
    status: "published",
    image: null,
  });

  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    category: "",
    status: "",
    image: null,
    });

  // ================= FETCH NEWS =================
  const fetchNews = async (searchTerm = "") => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/news?search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();
      setNews(data.data || data);
    } catch (err) {
      toast.error("Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  // ================= CREATE NEWS =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const formData = new FormData();

        formData.append("title", form.title);
        formData.append("content", form.content);
        formData.append("category", form.category || "");
        formData.append("status", form.status || "draft");

        // ✅ IMPORTANT FIX
        if (form.image instanceof File) {
        formData.append("image", form.image);
        }

        const res = await fetch("https://ajcpisonet.com/api/news", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        body: formData,
        });

        const result = await res.json();

        if (!res.ok) {
        toast.error(result.message || "Failed to create news");
        return;
        }

        toast.success("News published");

        setShowModal(false);

        setForm({
        title: "",
        content: "",
        category: "",
        status: "published",
        image: null,
        });

        fetchNews();

    } catch (err) {
        toast.error("Server error");
    }
    };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!confirm("Delete this news?")) return;

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/news/${id}`,
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

      toast.success("Deleted");
      fetchNews();
    } catch {
      toast.error("Server error");
    }
  };

  const handleUpdate = async () => {
    try {
        const formData = new FormData();

        formData.append("title", editForm.title);
        formData.append("content", editForm.content);
        formData.append("category", editForm.category);
        formData.append("status", editForm.status);

        if (editForm.image instanceof File) {
        formData.append("image", editForm.image);
        }

        const res = await fetch(
        `https://ajcpisonet.com/api/news/${selectedNews.id}`,
        {
            method: "POST", // or PUT if backend supports multipart PUT
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

        toast.success("News updated");

        setIsEditing(false);
        setModalOpen(false);
        setSelectedNews(null);
        setMode("create");
        fetchNews();

    } catch (err) {
        toast.error("Server error");
    }
    };

  

  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-3">

        <input
          className="form-control"
          style={{ width: "350px" }}
          placeholder="Search news..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchNews(e.target.value);
          }}
        />

        <button
          className="btn btn-primary"
          onClick={() => {
                setForm({
                    title: "",
                    content: "",
                    category: "",
                    status: "published",
                    image: null,
                });

                setSelectedNews(null);
                setMode("create");
                setModalOpen(true);
                }}
        >
          <i className="bi bi-plus-lg me-1"></i>
          Add News
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
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {news.length > 0 ? (
                    news.map((n, i) => (
                      <tr key={n.id}>
                        <td>{i + 1}</td>
                        <td>{n.title}</td>
                        <td>{n.category}</td>

                        <td>
                          <span
                            className={`badge ${
                              n.status === "published"
                                ? "bg-success"
                                : n.status === "draft"
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                            }`}
                          >
                            {n.status}
                          </span>
                        </td>

                        <td className="text-end d-flex gap-2 justify-content-end">

                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                                const newsItem = n;

                                setSelectedNews(newsItem);

                                setEditForm({
                                    title: newsItem.title || "",
                                    content: newsItem.content || "",
                                    category: newsItem.category || "",
                                    status: newsItem.status || "draft",
                                    image: null,
                                });

                                setIsEditing(false);
                                setMode("view");

                                // IMPORTANT: delay modal open to ensure state is set first
                                setTimeout(() => {
                                    setModalOpen(true);
                                }, 0);
                                }}
                          >
                            View
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(n.id)}
                          >
                            Delete
                          </button>

                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No news found
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>

      {/* ================= CREATE MODAL ================= */}
      {modalOpen && mode === "create" && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg border-0">

              {/* HEADER */}
              <div className="modal-header border-0">
                <div>
                  <h5 className="fw-bold mb-0">Create News / Announcement</h5>
                  <small className="text-muted">
                    Publish updates, alerts, and emergency information
                  </small>
                </div>

                <button
                  className="btn-close"
                  onClick={() => {
                    setModalOpen(false);
                    setMode("create");
                    setSelectedNews(null);
                  }}
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">

                  {/* TITLE */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Title <span className="text-danger">*</span>
                    </label>

                    <input
                      name="title"
                      className="form-control form-control-lg"
                      placeholder="e.g. Typhoon Advisory for Cebu City"
                      value={form.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* CATEGORY + STATUS */}
                  <div className="row g-3 mb-3">

                    {/* CATEGORY */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Category <span className="text-danger">*</span>
                      </label>

                      <select
                        name="category"
                        className="form-select"
                        value={form.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select category</option>
                        <option value="Announcement">📢 Announcement</option>
                        <option value="Alert">⚠️ Alert</option>
                        <option value="Emergency">🚨 Emergency</option>
                        <option value="Event">📅 Event</option>
                      </select>
                    </div>

                    {/* STATUS */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Status
                      </label>

                      <select
                        name="status"
                        className="form-select"
                        value={form.status}
                        onChange={handleChange}
                      >
                        <option value="draft">📝 Save as Draft</option>
                        <option value="published">🌍 Publish Now</option>
                      </select>

                      <small className="text-muted">
                        Draft will not be visible to public
                      </small>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Content <span className="text-danger">*</span>
                    </label>

                    <textarea
                      name="content"
                      className="form-control"
                      rows="5"
                      placeholder="Write the full details of the announcement..."
                      value={form.content}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* IMAGE UPLOAD */}
                  <div className="mb-2">
                    <label className="form-label fw-semibold">
                      Image (optional)
                    </label>

                    <input
                      type="file"
                      className="form-control"
                      onChange={handleFile}
                      accept="image/*"
                    />

                    <small className="text-muted">
                      Recommended: landscape image for better display
                    </small>
                  </div>

                </div>

                {/* FOOTER */}
                <div className="modal-footer border-0 d-flex justify-content-between">

                  <small className="text-muted">
                    Fields marked * are required
                  </small>

                  <div className="d-flex gap-2">

                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => {
                        setModalOpen(false);
                        setMode("create");
                        setSelectedNews(null);

                        setForm({
                          title: "",
                          content: "",
                          category: "",
                          status: "published",
                          image: null,
                        });
                      }}
                    >
                      Cancel
                    </button>

                    <button type="submit" className="btn btn-primary px-4">
                      Publish
                    </button>

                  </div>

                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW/Edit MODAL ================= */}
     {modalOpen && selectedNews && (mode === "view" || mode === "edit") && (
        <div
            className="modal d-block"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
            <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">

                {/* IMAGE */}
                {!isEditing && selectedNews.image_url && (
                <img
                    src={selectedNews.image_url}
                    className="w-100"
                    style={{ maxHeight: "300px", objectFit: "cover" }}
                />
                )}

                <div className="p-4">

                {/* CATEGORY + DATE */}
                <div className="d-flex justify-content-between mb-2">
                    <span className="badge bg-info">
                    {selectedNews.category}
                    </span>

                    <small className="text-muted">
                    {selectedNews.published_at
                        ? new Date(selectedNews.published_at).toLocaleString()
                        : "Draft"}
                    </small>
                </div>

                {/* ================= VIEW MODE ================= */}
                {!isEditing ? (
                    <>
                    <h4 className="fw-bold">{selectedNews.title}</h4>

                    <p className="text-secondary mt-3" style={{ whiteSpace: "pre-line" }}>
                        {selectedNews.content}
                    </p>
                    </>
                ) : (
                    <>
                    {/* ================= EDIT MODE ================= */}

                    <input
                        className="form-control mb-2"
                        value={editForm.title}
                        onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                        }
                    />

                    <textarea
                        className="form-control mb-2"
                        rows="5"
                        value={editForm.content}
                        onChange={(e) =>
                        setEditForm({ ...editForm, content: e.target.value })
                        }
                    />

                    <select
                        className="form-control mb-2"
                        value={editForm.category}
                        onChange={(e) =>
                        setEditForm({ ...editForm, category: e.target.value })
                        }
                    >
                        <option>Announcement</option>
                        <option>Alert</option>
                        <option>Event</option>
                        <option>Emergency</option>
                    </select>

                    <input
                        type="file"
                        className="form-control mb-2"
                        onChange={(e) =>
                        setEditForm({ ...editForm, image: e.target.files[0] })
                        }
                    />
                    </>
                )}

                </div>

                {/* FOOTER */}
                <div className="modal-footer d-flex justify-content-between">

                <small className="text-muted">
                    ID: #{selectedNews.id}
                </small>

                <div className="d-flex gap-2">

                    {!isEditing ? (
                    <>
                        <button
                        className="btn btn-primary"
                        onClick={() => {
                            setEditForm({
                                title: selectedNews.title || "",
                                content: selectedNews.content || "",
                                category: selectedNews.category || "",
                                status: selectedNews.status || "draft",
                                image: null,
                            });

                            setIsEditing(true);
                            }}
                        >
                        Edit
                        </button>
                    </>
                    ) : (
                    <>
                        <button
                        className="btn btn-success"
                        onClick={handleUpdate}
                        >
                        Save
                        </button>

                        <button
                        className="btn btn-secondary"
                        onClick={() => {
                            setIsEditing(false);

                            setEditForm({
                                title: selectedNews.title || "",
                                content: selectedNews.content || "",
                                category: selectedNews.category || "",
                                status: selectedNews.status || "draft",
                                image: null,
                            });
                            }}
                        >
                        Cancel
                        </button>
                    </>
                    )}

                    <button
                    className="btn btn-dark"
                    onClick={() => {
                        setModalOpen(false);
                        setSelectedNews(null);
                        setMode("create");
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