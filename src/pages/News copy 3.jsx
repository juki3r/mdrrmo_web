import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedNews, setSelectedNews] = useState(null);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | view | edit
  const [isEditing, setIsEditing] = useState(false); // ✅ FIX

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

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
  const fetchNews = async (pageNum = 1, searchTerm = "") => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/news?page=${pageNum}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      setNews(data.data || []);
      setPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch {
      toast.error("Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(1, "");
  }, []);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0] || null;

    console.log("SELECTED FILE:", file);

    setForm((prev) => ({
      ...prev,
      image: file,
    }));
  };
  // ================= CREATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("category", form.category || "");
      formData.append("status", form.status || "draft");

      if (form.image instanceof File) {
        formData.append("image", form.image);
      }

      console.log("IMAGE:", form.image);
      console.log("IS FILE:", form.image instanceof File);

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

      setModalOpen(false); // ✅ FIX
      setMode("create");

      setForm({
        title: "",
        content: "",
        category: "",
        status: "published",
        image: null,
      });

      

      fetchNews();
    } catch {
      toast.error("Server error");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!confirm("Delete this news?")) return;

    try {
      const res = await fetch(`https://ajcpisonet.com/api/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

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

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      const formData = new FormData();

      formData.append("_method", "PUT");
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
          method: "POST",
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
    } catch {
      toast.error("Server error");
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `https://ajcpisonet.com/${path}`;
  };

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

  // ================= UI =================
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
              const value = e.target.value;
              setSearch(value);
              setPage(1);
              fetchNews(1, value);
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

                          {/* VIEW */}
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setSelectedNews(n);

                              setEditForm({
                                title: n.title || "",
                                content: n.content || "",
                                category: n.category || "",
                                status: n.status || "draft",
                                image: null,
                              });

                              setIsEditing(false);
                              setMode("view");
                              setModalOpen(true);
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
                      <td colSpan="5" className="text-center py-5">
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
                              No news found
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
              onClick={() => fetchNews(page - 1, search)}
            >
              ← Prev
            </button>

            {/* NUMBERS */}
            {getPages().map((p, idx) =>
              p === "..." ? (
                <span key={idx} className="px-2 text-muted">...</span>
              ) : (
                <button
                  key={idx}
                  className={`btn rounded-pill ${
                    p === page ? "btn-primary shadow-sm" : "btn-light border"
                  }`}
                  style={{ minWidth: "42px", height: "42px" }}
                  onClick={() => fetchNews(p, search)}
                >
                  {p}
                </button>
              )
            )}

            {/* NEXT */}
            <button
              className="btn btn-light border rounded-pill px-3"
              disabled={page === lastPage}
              onClick={() => fetchNews(page + 1, search)}
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
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
            <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg border-0 overflow-hidden">

                {/* HEADER */}
                <div className="modal-header border-0 bg-light px-4 py-3">
                <div>
                    <h5 className="mb-0 fw-bold">Create News / Announcement</h5>
                    <small className="text-muted">
                    Share updates, alerts, or emergency information to the public
                    </small>
                </div>

                <button
                    className="btn-close"
                    onClick={() => setModalOpen(false)}
                />
                </div>

                <form onSubmit={handleSubmit}>
                <div className="modal-body px-4 py-3">

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

                    <small className="text-muted">
                        Make it short and clear so people understand immediately
                    </small>
                    </div>

                    {/* CATEGORY */}
                    <div className="mb-3">
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

                    {/* CONTENT */}
                    <div className="mb-3">
                    <label className="form-label fw-semibold">
                        Content <span className="text-danger">*</span>
                    </label>

                    <textarea
                        name="content"
                        className="form-control"
                        rows="6"
                        placeholder="Write full details of the announcement..."
                        value={form.content}
                        onChange={handleChange}
                        required
                    />

                    <small className="text-muted">
                        Provide complete information so users don’t get confused
                    </small>
                    </div>

                    {/* IMAGE */}
                    <div className="mb-2">
                    <label className="form-label fw-semibold">
                        Image (optional)
                    </label>

                    <input
                        type="file"
                        className="form-control"
                        onChange={(e) => {
                          console.log("FILE INPUT TRIGGERED");
                          handleFile(e);
                        }}
                        accept="image/*"
                      />

                    <small className="text-muted">
                        Recommended: landscape image (for better display)
                    </small>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="modal-footer border-0 px-4 py-3 d-flex justify-content-between">

                    <small className="text-muted">
                    Fields marked * are required
                    </small>

                    <div className="d-flex gap-2">

                    <button
                        type="button"
                        className="btn btn-light px-3"
                        onClick={() => setModalOpen(false)}
                    >
                        Cancel
                    </button>

                    <button type="submit" className="btn btn-primary px-4">
                        Publish News
                    </button>

                    </div>

                </div>
                </form>

            </div>
            </div>
        </div>
        )}

     {/* ================= VIEW / EDIT ================= */}
        {modalOpen && selectedNews && (mode === "view" || mode === "edit") && (
        <div
            className="modal d-block"
            style={{
            background: "rgba(0,0,0,0.6)",
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

                {/* HEADER STRIP */}
                <div className="px-4 py-3 bg-light border-bottom d-flex justify-content-between align-items-center">

                <div>
                    <h5 className="mb-0 fw-bold">
                    {isEditing ? "Edit News" : "View News"}
                    </h5>
                    <small className="text-muted">
                    {isEditing
                        ? "Update the information below"
                        : "Read full announcement details"}
                    </small>
                </div>

                <button
                    className="btn-close"
                    onClick={() => {
                    setModalOpen(false);
                    setSelectedNews(null);
                    setMode("create");
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

                {/* TITLE + CONTENT (VIEW MODE) */}
                {!isEditing ? (
                    <>
                      {/* IMAGE */}
                      {selectedNews.image && (
                        <div className="mb-4">
                          <img
                            src={getImageUrl(selectedNews.image)}
                            alt={selectedNews.title}
                            className="w-100 rounded-4 shadow-sm"
                            style={{
                              maxHeight: "350px",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      )}

                      {/* CATEGORY + STATUS */}
                      <div className="d-flex gap-2 align-items-center mb-3 flex-wrap">

                        <span className="badge bg-primary px-3 py-2 rounded-pill">
                          {selectedNews.category}
                        </span>

                        <span
                          className={`badge px-3 py-2 rounded-pill ${
                            selectedNews.status === "published"
                              ? "bg-success"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {selectedNews.status}
                        </span>

                      </div>

                      {/* TITLE */}
                      <h2
                        className="fw-bold mb-3"
                        style={{
                          lineHeight: "1.3",
                        }}
                      >
                        {selectedNews.title}
                      </h2>

                      {/* CONTENT */}
                      <div
                        className="text-secondary"
                        style={{
                          whiteSpace: "pre-line",
                          fontSize: "16px",
                          lineHeight: "1.9",
                        }}
                      >
                        {selectedNews.content}
                      </div>

                      {/* META */}
                      <div className="border-top mt-4 pt-3 text-muted small d-flex justify-content-between flex-wrap">

                        

                        {selectedNews.created_at && (
                          <span>
                            <i className="bi bi-calendar-event me-1"></i>
                            {new Date(selectedNews.created_at).toLocaleString()}
                          </span>
                        )}

                      </div>
                    </>
                ) : (
                    <>
                      {/* TITLE */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Title <span className="text-danger">*</span>
                        </label>

                        <input
                          className="form-control form-control-lg"
                          placeholder="News title..."
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                        />
                      </div>

                      {/* CATEGORY */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Category <span className="text-danger">*</span>
                        </label>

                        <select
                          className="form-select"
                          value={editForm.category}
                          onChange={(e) =>
                            setEditForm({ ...editForm, category: e.target.value })
                          }
                        >
                          <option value="">Select category</option>
                          <option value="Announcement">📢 Announcement</option>
                          <option value="Alert">⚠️ Alert</option>
                          <option value="Emergency">🚨 Emergency</option>
                          <option value="Event">📅 Event</option>
                        </select>
                      </div>

                      {/* STATUS */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Status
                        </label>

                        <select
                          className="form-select"
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm({ ...editForm, status: e.target.value })
                          }
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>

                      {/* CONTENT */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Content <span className="text-danger">*</span>
                        </label>

                        <textarea
                          className="form-control"
                          rows="6"
                          placeholder="Write full details..."
                          value={editForm.content}
                          onChange={(e) =>
                            setEditForm({ ...editForm, content: e.target.value })
                          }
                        />
                      </div>

                      {/* IMAGE */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Replace Image
                        </label>

                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              image: e.target.files[0],
                            })
                          }
                        />
                      </div>

                      {/* CURRENT IMAGE */}
                      {selectedNews.image && (
                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            Current Image
                          </label>

                          <img
                            src={getImageUrl(selectedNews.image)}
                            alt="news"
                            className="img-fluid rounded shadow-sm"
                          />
                        </div>
                      )}
                    </>
                )}

                </div>

                {/* FOOTER */}
                <div className="modal-footer border-0 px-4 py-3 d-flex justify-content-end">

                <div className="d-flex gap-2">

                    {/* VIEW MODE BUTTONS */}
                    {!isEditing ? (
                    <>
                        <button
                        className="btn btn-primary px-3"
                        onClick={() => setIsEditing(true)}
                        >
                        Edit
                        </button>
                    </>
                    ) : (
                    <>
                        {/* EDIT MODE BUTTONS */}
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
                            title: selectedNews.title,
                            content: selectedNews.content,
                            category: selectedNews.category,
                            status: selectedNews.status,
                            image: null,
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