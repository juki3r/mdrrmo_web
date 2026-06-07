import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const token = localStorage.getItem("token");

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create");

  const [selectedNews, setSelectedNews] = useState(null);
  const [newsCount, setNewsCount] = useState("")

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
    status: "published",
    priority: "",
    image: null,
  });

  // ================= FETCH =================
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
      setNewsCount(data.total || data.data.length);
      setPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch {
      toast.error("Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // ================= FORM =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  const resetForm = () => {
    setForm({
      title: "",
      content: "",
      category: "",
      status: "published",
      priority: "",
      image: null,
    });
  };

  // ================= CREATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("category", form.category);
    formData.append("status", form.status);
    formData.append("priority", form.priority);

    if (form.image) formData.append("image", form.image);

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

    toast.success("News created");

    setModalOpen(false);
    setMode("create");
    resetForm();

    fetchNews(page, search);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!confirm("Delete this news?")) return;

    const res = await fetch(`https://ajcpisonet.com/api/news/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      toast.error("Delete failed");
      return;
    }

    toast.success("Deleted");
    fetchNews(page, search);
  };

  const handleUpdate = async (e) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("category", form.category);
      formData.append("status", form.status);
      formData.append("priority", form.priority);

      if (form.image instanceof File) {
        formData.append("image", form.image);
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

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Update failed");
        return;
      }

      toast.success("News updated");

      setModalOpen(false);
      setSelectedNews(null);
      setMode("create");
      resetForm();

      fetchNews(page, search);
    };

  // ================= UI =================
  return (
    <div className="mt-4 mt-md-0">

      {/* HEADER */}
      <div className="container mb-4">
        <div className="row">
          <div className="col-md-6">
            <h3 className="m-0 p-0">News & Announcements</h3>
            <span className="text-muted">Barangay-wide communications and notices</span>
          </div>

          <div className="col-md-6 text-end">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                  resetForm();
                  setSelectedNews(null);
                  setMode("create");
                  setModalOpen(true);
                }}
            >
              + Add News
            </button>
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* CARDS */}
      <div className="container">
        <div className="row">
          {news.map((item) => (
            <div key={item.id} className="col-12 mb-3">

              <div className="card shadow-sm border-0">

                {/* BODY */}
                <div className="card-body">
                  <div className="bg-white d-flex justify-content-between">

                  <div>
                    <div className="d-flex gap-2 align-items-center flex-wrap mb-2 text-capitalize fw-light">

                      <span className={`badge ${
                        item.priority === "urgent"
                          ? "bg-danger"
                          : item.priority === "important"
                          ? "bg-warning text-dark"
                          : "bg-primary"
                      }`}>
                        {item.priority}
                      </span>

                      <span className="badge bg-light text-dark border">
                        {item.category}
                      </span>
                      <span
                          className={`badge ${
                            item.barangay ? "bg-primary" : "bg-success"
                          }`}
                        >
                          {item.barangay || "Municipality-wide"}
                        </span>

                      <small className="text-muted">
                        {new Date(item.created_at).toLocaleString([], {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>

                    </div>
                    <h6 className="mb-1 fw-bold">{item.title}</h6>
                  </div>

                  <div className="d-flex">

                    <button
                      className="btn btn-sm btn-light rounded-circle"
                      onClick={() => {
                        setSelectedNews(item);
                        setMode("edit");
                        setForm({
                          title: item.title || "",
                          content: item.content || "",
                          category: item.category || "",
                          status: item.status || "published",
                          image: null,
                        });
                        setModalOpen(true);
                      }}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-light text-danger rounded-circle"
                      onClick={() => handleDelete(item.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>

                  </div>

                </div>

                  <p className="text-muted mb-2 mt-2" style={{ fontSize: 14 }}>
                    {item.content}
                  </p>

                </div>

              </div>

            </div>
          ))}
        </div>
      </div>

      {/* EMPTY */}
      {!loading && news.length === 0 && (
        <p className="text-center text-muted mt-5">
          No news found
        </p>
      )}

      {/* ================= MODAL ================= */}
      {modalOpen && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content">

              <div className="modal-header">
                <h5>{mode === "create" ? "Add News" : "Edit News"}</h5>
                <button className="btn-close" onClick={() => setModalOpen(false)} />
              </div>

              <form onSubmit={mode === "create" ? handleSubmit : handleUpdate}>
                <div className="modal-body">
             
                    <div className="mb-4">
                      <input
                          className="form-control mb-2"
                          name="title"
                          placeholder="Title of News or Announcement"
                          value={form.title}
                          onChange={handleChange}
                          required
                        />
                    </div>
       
                   <div className="d-flex gap-3 mb-4">
                       <select
                          className="form-select"
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="General">General</option>
                          <option value="Health">Health</option>
                          <option value="Disaster Prep">Disaster Prep</option>
                          <option value="Meeting">Meeting</option>
                          <option value="Event">Event</option>
                          
                        </select>


                        <select
                          className="form-select"
                          name="priority"
                          value={form.priority}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Priority</option>
                          <option value="normal">Normal</option>
                          <option value="important">Important</option>
                          <option value="urgent">Urgent</option>
                        </select>

                    </div>


                    <div className="">
                      <textarea
                          className="form-control mb-2"
                          name="content"
                          placeholder="Content"
                          value={form.content}
                          onChange={handleChange}
                          rows={10}
                          required
                        />
                    </div>


                  <select
                    className="form-select mb-2 d-none"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>


                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>

                  <button className="btn btn-primary" type="submit">
                    {mode === "create" ? "Save" : "Update"}
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