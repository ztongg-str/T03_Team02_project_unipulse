import { useState, useEffect, useCallback } from "react";
import { adminUsersAPI, adminRolesAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const ROLE_COLORS = {
  superadmin:  "#FF7A00",
  developer:   "#6366f1",
  coordinator: "#2EC4B6",
  organizer:   "#2EC4B6",
  student:     "#8A7A72",
};

const ROLE_LABELS = {
  superadmin:  "Super Admin",
  developer:   "Developer",
  coordinator: "Co-Ordinator",
  organizer:   "Organizer",
  student:     "Student",
};
const STATUS_COLORS = { active: "#22c55e", suspended: "#ef4444" };

function Badge({ label, color, bg }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: bg, color, textTransform: "capitalize", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 440, maxWidth: "calc(100vw - 32px)", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#333" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#8A7A72", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 }}>{label}</label>
      <input {...props} style={{ width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", ...props.style }} />
    </div>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 }}>{label}</label>
      <select {...props} style={{ width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff", boxSizing: "border-box" }}>
        {children}
      </select>
    </div>
  );
}

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [toast, setToast] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [assignTarget, setAssignTarget] = useState(null);
  const [adminRoles, setAdminRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [userCustomRoles, setUserCustomRoles] = useState({});
  const LIMIT = 15;

  useEffect(() => {
    adminRolesAPI.getAll().then((res) => setAdminRoles(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchAllRoles = async () => {
      const map = {};
      for (const u of users) {
        try {
          const res = await adminRolesAPI.getUserRoles(u.id);
          map[u.id] = (res.data || []).map((r) => r.name);
        } catch { map[u.id] = []; }
      }
      setUserCustomRoles(map);
    };
    if (users.length > 0) {
      fetchAllRoles();
    }
  }, [users.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(() => {
    setLoading(true);
    adminUsersAPI.getAll({ page, limit: LIMIT, search: search || undefined, role: roleFilter || undefined, status: statusFilter || undefined })
      .then((res) => { setUsers(res.data.users); setTotal(res.data.total); })
      .catch((e) => setError(e.response?.data?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const setLoading1 = (id, v) => setActionLoading((p) => ({ ...p, [id]: v }));

  const handleRoleChange = async (user, role) => {
    setLoading1(user.id + "_role", true);
    try {
      const res = await adminUsersAPI.updateRole(user.id, role);
      setUsers((p) => p.map((u) => u.id === user.id ? { ...u, role: res.data.role } : u));
      showToast(`${user.fullName}'s role updated to ${role}`);
    } catch (e) { showToast(e.response?.data?.message || "Failed", false); }
    setLoading1(user.id + "_role", false);
  };

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    setLoading1(user.id + "_status", true);
    try {
      const res = await adminUsersAPI.updateStatus(user.id, newStatus);
      setUsers((p) => p.map((u) => u.id === user.id ? { ...u, status: res.data.status } : u));
      showToast(`${user.fullName} ${newStatus === "active" ? "activated" : "suspended"}`);
    } catch (e) { showToast(e.response?.data?.message || "Failed", false); }
    setLoading1(user.id + "_status", false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading1(deleteTarget.id + "_del", true);
    try {
      await adminUsersAPI.delete(deleteTarget.id);
      setUsers((p) => p.filter((u) => u.id !== deleteTarget.id));
      setTotal((t) => t - 1);
      showToast(`${deleteTarget.fullName} deleted`);
      setDeleteTarget(null);
    } catch (e) { showToast(e.response?.data?.message || "Failed", false); }
    setLoading1(deleteTarget.id + "_del", false);
  };

  const handleAssignRole = async (user) => {
    setAssignTarget(user);
    try {
      const res = await adminRolesAPI.getUserRoles(user.id);
      setUserRoles(res.data || []);
    } catch {
      setUserRoles([]);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 200, background: toast.ok ? "#22c55e" : "#ef4444", color: "#fff", borderRadius: 10, padding: "12px 20px", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", animation: "fadeIn 0.2s" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: "#8A7A72", marginBottom: 4 }}>
            <span style={{ color: "#FF7A00", fontWeight: 600 }}>Admin Portal</span> › Users
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#333" }}>User Management</h2>
        </div>
        <button onClick={() => setCreateModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#FF7A00", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" /></svg>
          Create Account
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8A7A72" }}>
            <circle cx="7" cy="7" r="4.5" stroke="#8A7A72" strokeWidth="1.5" /><path d="M11 11l3 3" stroke="#8A7A72" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, username, or email…" style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, border: "1.5px solid #E0E0E0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#fff" }} />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} style={{ padding: "10px 16px", border: "1.5px solid #E0E0E0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff", cursor: "pointer" }}>
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="organizer">Organizer</option>
          <option value="superadmin">Super Admin</option>
          <option value="developer">Developer</option>
          <option value="coordinator">Co-Ordinator</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ padding: "10px 16px", border: "1.5px solid #E0E0E0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff", cursor: "pointer" }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
            <div style={{ width: 32, height: 32, border: "3px solid #FF7A00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
        ) : error ? (
          <div style={{ padding: 40, color: "#ef4444", textAlign: "center" }}>{error}</div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F5F5F5" }}>
                    {["User", "Email", "Role", "Status", "Custom Roles", "Joined", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8A7A72", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#8A7A72" }}>No users found</td></tr>
                  ) : users.map((u) => (
                    <tr key={u.id} style={{ borderTop: "1px solid #F0F0F0", transition: "background 0.1s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#FAFAFA"} onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: (ROLE_COLORS[u.role] || "#8A7A72") + "22", color: ROLE_COLORS[u.role] || "#8A7A72", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                            {u.avatar ? <img src={u.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : u.fullName?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "#333" }}>{u.fullName}</div>
                            <div style={{ fontSize: 12, color: "#8A7A72" }}>@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#5A5A5A" }}>{u.email}</td>
                      <td style={{ padding: "14px 16px" }}>
                        {u.id === me?.id ? (
                          <Badge label={ROLE_LABELS[u.role] || u.role} color={ROLE_COLORS[u.role] || "#8A7A72"} bg={(ROLE_COLORS[u.role] || "#8A7A72") + "22"} />
                        ) : (
                          <select value={u.role} onChange={(e) => handleRoleChange(u, e.target.value)} disabled={actionLoading[u.id + "_role"]} style={{ border: "none", background: (ROLE_COLORS[u.role] || "#8A7A72") + "22", color: ROLE_COLORS[u.role] || "#8A7A72", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>
                            <option value="student">Student</option>
                            <option value="organizer">Organizer</option>
                            <option value="superadmin">Super Admin</option>
                            <option value="developer">Developer</option>
                            <option value="coordinator">Co-Ordinator</option>
                          </select>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <Badge label={u.status} color={STATUS_COLORS[u.status]} bg={STATUS_COLORS[u.status] + "22"} />
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: "#8A7A72", maxWidth: 200 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {(userCustomRoles[u.id] || []).length > 0 ? userCustomRoles[u.id].map((r) => (
                            <span key={r} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: "#FF7A0018", color: "#FF7A00" }}>{r}</span>
                          )) : <span style={{ color: "#C0C0C0", fontSize: 11 }}>None</span>}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#8A7A72", whiteSpace: "nowrap" }}>{fmtDate(u.createdAt)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        {u.id !== me?.id && (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => handleAssignRole(u)} title="Assign Roles" style={{ padding: "6px 10px", border: "1.5px solid #FF7A00", color: "#FF7A00", borderRadius: 8, background: "none", cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 600 }}>
                              Roles
                            </button>
                            <button onClick={() => handleStatusToggle(u)} disabled={actionLoading[u.id + "_status"]} title={u.status === "active" ? "Suspend" : "Activate"} style={{ padding: "6px 12px", border: "1.5px solid", borderColor: u.status === "active" ? "#ef4444" : "#22c55e", color: u.status === "active" ? "#ef4444" : "#22c55e", borderRadius: 8, background: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
                              {u.status === "active" ? "Suspend" : "Activate"}
                            </button>
                            <button onClick={() => setDeleteTarget(u)} title="Delete" style={{ padding: "6px 10px", border: "1.5px solid #E0E0E0", color: "#8A7A72", borderRadius: 8, background: "none", cursor: "pointer", fontSize: 12 }}>
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3h10M5 3V2h4v1M6 6v4M8 6v4M3 3l.7 8.3A1 1 0 004.7 12h4.6a1 1 0 001-.7L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            </button>
                          </div>
                        )}
                        {u.id === me?.id && <span style={{ fontSize: 11, color: "#C0C0C0" }}>You</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #F0F0F0", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#8A7A72" }}>Showing {users.length} of {total} users</span>
              <div style={{ display: "flex", gap: 6 }}>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} style={{ width: 32, height: 32, borderRadius: 8, border: p === page ? "none" : "1.5px solid #E0E0E0", background: p === page ? "#FF7A00" : "none", color: p === page ? "#fff" : "#333", fontWeight: p === page ? 700 : 400, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Assign Roles Modal */}
      {assignTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setAssignTarget(null)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 480, maxWidth: "calc(100vw - 32px)", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#333" }}>Assign Roles — {assignTarget.fullName}</h3>
              <button onClick={() => setAssignTarget(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#8A7A72", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {adminRoles.length === 0 ? (
                <p style={{ color: "#8A7A72", fontSize: 14 }}>No roles available. Go to Admin Roles to create one.</p>
              ) : adminRoles.map((role) => {
                const assigned = userRoles.some((r) => r.id === role.id);
                return (
                  <label key={role.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, border: "1.5px solid", borderColor: assigned ? "#FF7A00" : "#E0E0E0", background: assigned ? "#FFF5EB" : "#fff", cursor: "pointer", transition: "all 0.15s" }}>
                    <input
                      type="checkbox"
                      checked={assigned}
                      onChange={async () => {
                        try {
                          if (assigned) {
                            await adminRolesAPI.unassign(assignTarget.id, role.id);
                            setUserRoles((prev) => prev.filter((r) => r.id !== role.id));
                            setUserCustomRoles((prev) => ({ ...prev, [assignTarget.id]: (prev[assignTarget.id] || []).filter((n) => n !== role.name) }));
                          } else {
                            await adminRolesAPI.assign(assignTarget.id, role.id);
                            setUserRoles((prev) => [...prev, role]);
                            setUserCustomRoles((prev) => ({ ...prev, [assignTarget.id]: [...(prev[assignTarget.id] || []), role.name] }));
                          }
                          showToast(assigned ? "Role unassigned" : "Role assigned");
                        } catch (e) {
                          showToast(e.response?.data?.message || "Failed", false);
                        }
                      }}
                      style={{ width: 18, height: 18, accentColor: "#FF7A00", cursor: "pointer", flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#333" }}>{role.name}</div>
                      <div style={{ fontSize: 12, color: "#8A7A72" }}>{role.description || "No description"}</div>
                    </div>
                    {role.is_system && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: "#6366f122", color: "#6366f1" }}>System</span>}
                  </label>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setAssignTarget(null)} style={{ padding: "10px 20px", border: "1.5px solid #E0E0E0", borderRadius: 10, background: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createModal && <CreateUserModal adminRoles={adminRoles} onClose={() => setCreateModal(false)} onCreated={(u) => { setUsers((p) => [u, ...p]); setTotal((t) => t + 1); showToast(`${u.fullName} created`); }} />}

      {/* Delete Confirm */}
      {deleteTarget && (
        <Modal title="Delete User?" onClose={() => setDeleteTarget(null)}>
          <p style={{ color: "#5A5A5A", fontSize: 14, marginBottom: 24 }}>
            This will permanently delete <strong>{deleteTarget.fullName}</strong> (@{deleteTarget.username}) and all their data. This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={() => setDeleteTarget(null)} style={{ padding: "10px 20px", border: "1.5px solid #E0E0E0", borderRadius: 10, background: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            <button onClick={handleDelete} disabled={actionLoading[deleteTarget.id + "_del"]} style={{ padding: "10px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {actionLoading[deleteTarget.id + "_del"] ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Modal>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}

function CreateUserModal({ adminRoles = [], onClose, onCreated }) {
  const [form, setForm] = useState({ username: "", email: "", password: "", fullName: "", role: "student" });
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      const res = await adminUsersAPI.create({ ...form, adminRoleIds: selectedRoles });
      onCreated(res.data);
      onClose();
    } catch (e) { setError(e.response?.data?.message || "Failed to create user"); }
    setLoading(false);
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const toggleRole = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  return (
    <Modal title="Create Account" onClose={onClose}>
      {error && <div style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>}
      <InputField label="Full Name" value={form.fullName} onChange={set("fullName")} placeholder="e.g. John Doe" />
      <InputField label="Username" value={form.username} onChange={set("username")} placeholder="e.g. johndoe" />
      <InputField label="Email" type="email" value={form.email} onChange={set("email")} placeholder="e.g. john@unipulse.edu" />
      <InputField label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Minimum 6 characters" />
      <SelectField label="Role" value={form.role} onChange={set("role")}>
        <option value="student">Student</option>
        <option value="organizer">Organizer</option>
        <option value="superadmin">Super Admin</option>
        <option value="developer">Developer</option>
        <option value="coordinator">Co-Ordinator</option>
      </SelectField>
      {adminRoles.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 8 }}>Admin Roles (optional)</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, border: "1.5px solid #E0E0E0", borderRadius: 10, padding: 12 }}>
            {adminRoles.map((role) => (
              <label key={role.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                  style={{ width: 16, height: 16, accentColor: "#FF7A00", cursor: "pointer" }}
                />
                <span style={{ fontWeight: 600, color: "#333" }}>{role.name}</span>
                {role.description && <span style={{ color: "#8A7A72", fontSize: 12 }}>— {role.description}</span>}
              </label>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid #E0E0E0", borderRadius: 10, background: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
        <button onClick={handleSubmit} disabled={loading} style={{ padding: "10px 24px", background: "#FF7A00", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Creating…" : "Create Account"}
        </button>
      </div>
    </Modal>
  );
}
