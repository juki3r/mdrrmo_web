import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Ordinance() {
  const [ordinances, setOrdinances] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const token = localStorage.getItem("token");

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | view | edit

  const [selectedOrdinance, setSelectedOrdinance] = useState(null);
  const [ordinanceCount, setOrdinanceCount] = useState(0);
  const [errors, setErrors] = useState({});

  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // optional

  const [form, setForm] = useState({
    ordinance_number: "",
    title: "",
    description: "",
    category: "",
    status: "active",
    effectivity_date: "",
    approved_date: "",
    penalties: "",
  });

  // ================= FETCH =================
  // const fetchOrdinances = async (pageNum = 1, searchTerm = "") => {
  //   setLoading(true);

  //   try {
  //     const res = await fetch(
  //       `https://ajcpisonet.com/api/ordinances?page=${pageNum}&search=${searchTerm}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           Accept: "application/json",
  //         },
  //       }
  //     );

  //     const data = await res.json();

  //     setOrdinances(data.data || []);
  //     setOrdinanceCount(data.data.length);
  //     setPage(data.current_page || 1);
  //     setLastPage(data.last_page || 1);
  //   } catch {
  //     toast.error("Failed to load ordinances");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchOrdinances = async (pageNum = 1, searchTerm = "", category = "", status = "") => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/ordinances?page=${pageNum}&search=${searchTerm}&category=${category}&status=${status}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      setOrdinances(data.data || []);
      setOrdinanceCount(data.total || data.data.length);
      setPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch {
      toast.error("Failed to load ordinances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdinances(1, search, filterCategory, filterStatus);
  }, [filterCategory, filterStatus]);

  // ================= FORM =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      ordinance_number: "",
      title: "",
      description: "",
      category: "",
      status: "active",
      effectivity_date: "",
      approved_date: "",
      penalties: "",
    });
  };

   // ================= CREATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("https://ajcpisonet.com/api/ordinances", {
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
      toast.error(result.message || "Failed to create ordinance");
      return;
    }

    toast.success("Ordinance created");

    setModalOpen(false);
    setMode("create");
    resetForm();
    fetchOrdinances(page, search);
  };

  // ================= UPDATE =================
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!selectedOrdinance) return;

    const res = await fetch(
      `https://ajcpisonet.com/api/ordinances/${selectedOrdinance.id}`,
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
      toast.error(data.message || "Update failed");
      return;
    }

    toast.success("Ordinance updated");

    setModalOpen(false);
    setMode("create");
    setSelectedOrdinance(null);
    resetForm();

    fetchOrdinances(page, search);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!confirm("Delete this ordinance?")) return;

    const res = await fetch(
      `https://ajcpisonet.com/api/ordinances/${id}`,
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

    toast.success("Deleted");
    fetchOrdinances(page, search);
  };

  const handleEdit = (item) => {
    setMode("edit");
    setSelectedOrdinance(item);

    setForm({
      ordinance_number: item.ordinance_number || "",
      title: item.title || "",
      description: item.description || "",
      category: item.category || "",
      status: item.status || "active",
      effectivity_date: item.effectivity_date || "",
      approved_date: item.approved_date || "",
      penalties: item.penalties || "",
    });

    setModalOpen(true);
  };

  // ================= PAGINATION =================
  const getPages = () => {
    const delta = 2;
    const range = [];
    const result = [];
    let l;

    for (let i = 1; i <= lastPage; i++) {
      if (i === 1 || i === lastPage || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) result.push(l + 1);
        else if (i - l !== 1) result.push("...");
      }
      result.push(i);
      l = i;
    });

    return result;
  };

  const filteredOrdinances = ordinances
    .filter((item) => {
      const matchCategory =
        filterCategory === "" || item.category === filterCategory;

      const matchStatus =
        filterStatus === "" || item.status === filterStatus;

      return matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.approved_date || 0) - new Date(a.approved_date || 0);
      }
      if (sortOrder === "oldest") {
        return new Date(a.approved_date || 0) - new Date(b.approved_date || 0);
      }
      return 0;
    });

  // ================= UI =================
  return (
    <div className="mt-4 mt-md-0">

      <div className="container mb-4">
        <div className="row">
          <div className="col col-md-6">
            <h3 className="m-0 p-0">
                Barangay Ordinances
            </h3>
            <span className="text-muted">{ordinanceCount}  on record</span>
          </div>

          <div className="col-12 col-md-6 text-end">
            <button
              className="btn btn-sm btn-success"
              onClick={() => {
                setMode("create");
                resetForm();
                setSelectedOrdinance(null);
                setModalOpen(true);
              }}
            >
              + Add Ordinance
            </button>
          </div>
        </div>
      </div>


      {/* HEADER */}
      <div className="container mb-3">
        <div className="d-flex flex-wrap gap-2 align-items-center p-2 bg-white shadow-sm rounded">

          {/* SEARCH INPUT */}
          <div className="position-relative flex-grow-1" style={{ minWidth: "220px" }}>
            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"></i>

            <input
              type="text"
              className="form-control ps-4 pe-4"
              placeholder="Search ordinance..."
              value={search}
              onChange={(e) => {
                  const value = e.target.value;
                  setSearch(value);
                  fetchOrdinances(1, value, filterCategory, filterStatus);
                }}
            />

            {/* CLEAR BUTTON */}
            {search && (
              <i
                className="bi bi-x-circle-fill position-absolute top-50 end-0 translate-middle-y me-2 text-muted"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setSearch("");
                  fetchOrdinances(1, "");
                }}
              />
            )}
          </div>

          {/* CATEGORY */}
          <select
            className={`form-select w-auto ${filterCategory ? "bg-warning text-dark" : ""}`}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Category</option>
            <option value="Health">Health</option>
            <option value="Safety">Safety</option>
            <option value="Traffic">Traffic</option>
            <option value="Environment">Environment</option>
            <option value="Peace_order">Peace & Order</option>
            <option value="Others">Others</option>
          </select>

          {/* STATUS */}
          <select
            className={`form-select w-auto ${filterStatus ? "bg-warning text-dark" : ""}`}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Status</option>
            <option value="active">Active</option>
            <option value="amended">Amended</option>
            <option value="repealed">Repealed</option>
          </select>

          {/* SORT */}
          <select
            className={`form-select w-auto ${sortOrder !== "newest" ? "bg-warning text-dark" : ""}`}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>

        </div>
      </div>

      {/* LOADING */}
      {loading && <p className="text-gray-500">Loading...</p>}


     {/* CARDS */}
      <div className="container mt-3">
        <div className="row">
          {filteredOrdinances.map((item) => (
            <div key={item.id} className="col-12 mb-3">


              <div className="card shadow-sm border-0">
                
                {/* HEADER */}
                <div className="card-header d-flex justify-content-between align-items-start bg-white">
                  <div style={{fontSize:14}} className="d-flex flex-column">
                    <span className="mb-0 text-secondary" >
                      Ordinance No. {item.ordinance_number}
                    </span>
                    <span
                        className="badge text-capitalize"
                        style={{
                          fontSize: 11,
                          backgroundColor:
                            item.status === "active"
                              ? "green"
                              : item.status === "amended"
                              ? "orange"
                              : "red",
                          color: "white",
                        }}
                      >
                        {item.status?.toLowerCase()}
                      </span>
                  </div>

                  <div className="d-flex">

                    <button
                        className="btn btn-sm text-end btn-light rounded-circle"
                        onClick={() => handleEdit(item)}
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

                {/* BODY */}
                <div className="card-body">
                  <h6 className="card-title fw-bold" style={{fontSize:16}}>
                    An Ordinace {item.title}
                  </h6>

                  <p className="card-text text-muted" style={{fontSize:14}}>
                    {item.description}
                  </p>

                  <div className="d-flex flex-column mb-3">
                    <span style={{fontSize:14}}>PENALTIES</span>
                    <span className="  text-danger" style={{fontSize:13}}>
                      {item.penalties}
                    </span>
                  </div>
                    <div className="d-flex gap-3">
                      <div className="d-flex gap-1 align-items-center" style={{fontSize:12}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" class="bi bi-calendar3" viewBox="0 0 16 16">
                          <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857z"/>
                          <path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                        </svg>
                        <span>
                          Enacted: 
                        </span>
                        <span>
                            {item.approved_date
                              ? new Date(item.approved_date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "No date"}
                          </span>
                      </div>

                      <div className="d-flex gap-1 align-items-center" style={{fontSize:13}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-up" viewBox="0 0 16 16">
                          <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.354-5.854 1.5 1.5a.5.5 0 0 1-.708.708L13 11.707V14.5a.5.5 0 0 1-1 0v-2.793l-.646.647a.5.5 0 0 1-.708-.708l1.5-1.5a.5.5 0 0 1 .708 0M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                          <path d="M8.256 14a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z"/>
                        </svg>
                        <span>
                            {item.council
                              ? item.council
                              : "Kagawad: Juan Dela Cruz"}
                          </span>
                      </div>
                  </div>
                 
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EMPTY STATE */}
      {!loading && ordinances.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No ordinances found
        </p>
      )}

      {modalOpen && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">

              {/* HEADER */}
              <div className="modal-header">
                <h5 className="modal-title">
                  {mode === "create" ? "Add Ordinance" : "Edit Ordinance"}
                </h5>

                <button
                  className="btn-close"
                  onClick={() => setModalOpen(false)}
                />
              </div>
              {/* FORM START */}
              <form onSubmit={mode === "create" ? handleSubmit : handleUpdate}>

              {/* BODY */}
              <div className="modal-body">

                <div className="row">

                  <div className="col-md-6 mb-2">
                    <label>Ordinance Number</label>
                    <input
                      className="form-control"
                      name="ordinance_number"
                      value={form.ordinance_number}
                      onChange={handleChange}
                      disabled
                      placeholder="Auto generated"
                    />
                  </div>

                  <div className="col-md-6 mb-2">
                    <label>Title *</label>
                    <input
                      className="form-control"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-12 mb-2">
                    <label className="mb-2">Description *</label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows="3"
                      value={form.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                      <label className="mb-2">Category *</label>
                      <select
                        className="form-control form-select"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select category</option>
                        <option value="health">Health</option>
                        <option value="safety">Safety</option>
                        <option value="traffic">Traffic</option>
                        <option value="environment">Environment</option>
                        <option value="peace_order">Peace & Order</option>
                        <option value="others">Others</option>
                      </select>

                      {errors.category && (
                        <small className="text-danger">{errors.category}</small>
                      )}
                    </div>

                  <div className="col-md-6 mb-3">
                    <label className="mb-2">Status</label>
                    <select
                      className="form-control form-select"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="amended">Amended</option>
                      <option value="repealed">Repealed</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="mb-2">Effectivity Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="effectivity_date"
                      value={form.effectivity_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="mb-2">Approved Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="approved_date"
                      value={form.approved_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-12 mb-3">
                    <label className="mb-2">Penalties</label>
                    <textarea
                      className="form-control"
                      name="penalties"
                      value={form.penalties}
                      onChange={handleChange}
                      required
                    />
                  </div>

                </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer">

                <button
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="btn btn-primary">
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