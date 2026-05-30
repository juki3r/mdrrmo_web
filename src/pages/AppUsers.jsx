import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AppUsers() {
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ================= FETCH =================
  const fetchUsers = async (pageNum = 1, searchTerm = "") => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/appusers?page=${pageNum}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      setUsers(data.data || []);
      setPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, "");
  }, []);


  const verifyUser = async (id) => {
    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/appusers/${id}/verify`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Phone verified");

      fetchUsers(page, search);
    } catch {
      toast.error("Failed to verify user");
    }
  };

  const grantUser = async (id) => {
    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/appusers/${id}/grant`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error();

      toast.success("User granted access");

      fetchUsers(page, search);
    } catch {
      toast.error("Failed to grant user");
    }
  };

  const denyUser = async (id) => {
    try {
      const res = await fetch(
        `https://ajcpisonet.com/api/appusers/${id}/deny`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Access revoked");

      fetchUsers(page, search);
    } catch {
      toast.error("Failed to revoke access");
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
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push("...");
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

        <h5 className="fw-bold mb-0">Mobile App Users</h5>

        <div style={{ width: "350px" }}>
          <input
            className="form-control"
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              fetchUsers(1, value);
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body">

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle small">

                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Phone</th>
                    <th>Verified</th>
                    <th>Role</th>
                    <th>Token</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>

                <tbody>

                  {users.length > 0 ? (
                    users.map((u, i) => (
                      <tr
                        key={u.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSelectedUser(u);
                          setShowModal(true);
                        }}
                      >

                        <td>{(page - 1) * 10 + i + 1}</td>

                        <td className="">
                          {u.full_name
                            ?.toLowerCase()
                            .replace(/\b\w/g, (char) => char.toUpperCase())}
                        </td>

                        <td>
                          {u.barangay
                            ?.toLowerCase()
                            .replace(/\b\w/g, (char) => char.toUpperCase())}, {u.municipality
                            ?.toLowerCase()
                            .replace(/\b\w/g, (char) => char.toUpperCase())}
                        </td>

                        <td>{u.phone}</td>

                        <td>
                          <span className={`badge ${u.phone_verified ? "bg-success" : "bg-secondary"}`}>
                            {u.phone_verified ? "Verified" : "Unverified"}
                          </span>
                        </td>

                        <td>
                          <span className="badge bg-primary text-capitalize">
                            {u.role}
                          </span>
                        </td>

                        <td>
                          <span className={`badge ${u.fcm_token ? "bg-success" : "bg-secondary"}`}>
                            {u.phone_verified ? "Yes" : "No"}
                          </span>
                        </td>

                       <td className="text-end d-flex gap-1 justify-content-end">

                        {!u.phone_verified && (
                          <button
                            className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              verifyUser(u.id);
                            }}
                          >
                            <i className="bi bi-check-circle"></i>
                            Verify
                          </button>
                        )}

                        {u.phone_verified && !u.granted && (
                          <button
                            className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              grantUser(u.id);
                            }}
                          >
                            <i className="bi bi-shield-check"></i>
                            Grant
                          </button>
                        )}

                        {u.granted && (
                          <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              denyUser(u.id);
                            }}
                          >
                            <i className="bi bi-x-circle"></i>
                            Deny
                          </button>
                        )}

                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(u);
                            setShowModal(true);
                          }}
                        >
                          <i className="bi bi-eye"></i>
                          View
                        </button>

                      </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No users found
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>
            </div>
          )}

          {/* PAGINATION */}
          {lastPage > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap">

              <button
                className="btn btn-light border"
                disabled={page === 1}
                onClick={() => fetchUsers(page - 1, search)}
              >
                Prev
              </button>

              {getPages().map((p, i) =>
                p === "..." ? (
                  <span key={i} className="px-2">...</span>
                ) : (
                  <button
                    key={i}
                    className={`btn ${p === page ? "btn-primary" : "btn-light border"}`}
                    onClick={() => fetchUsers(p, search)}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className="btn btn-light border"
                disabled={page === lastPage}
                onClick={() => fetchUsers(page + 1, search)}
              >
                Next
              </button>

            </div>
          )}

        </div>
      </div>

      {/* ================= VIEW MODAL ================= */}
      {showModal && selectedUser && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.6)" }}>

          <div className="modal-dialog modal-md modal-dialog-centered">

            <div className="modal-content rounded-4">

              <div className="modal-header">
                <h5 className="mb-0">User Details</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>

              <div className="modal-body">

                <div className="mb-2">
                  <strong>Name:</strong> {selectedUser.full_name}
                </div>

                <div className="mb-2">
                  <strong>Province:</strong> {selectedUser.province}
                </div>

                <div className="mb-2">
                  <strong>Municipality:</strong> {selectedUser.municipality}
                </div>

                <div className="mb-2">
                  <strong>Barangay:</strong> {selectedUser.barangay}
                </div>

                <div className="mb-2">
                  <strong>Purok:</strong> {selectedUser.purok || "-"}
                </div>

                <div className="mb-2">
                  <strong>Email:</strong> {selectedUser.email || "-"}
                </div>

                <div className="mb-2">
                  <strong>Phone:</strong> {selectedUser.phone}
                </div>

                <div className="mb-2">
                  <strong>Role:</strong> {selectedUser.role}
                </div>

              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-light"
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