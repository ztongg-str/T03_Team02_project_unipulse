import { useState, useEffect } from "react";
import { adminRolesAPI } from "../../services/api";

const MODULE_LABELS = {
  users: "Users",
  events: "Events",
  registrations: "Registrations",
  payments: "Payments",
  categories: "Categories",
  reports: "Reports",
  feedback: "Feedback",
};

const ACTION_LABELS = {
  view: "View",
  create: "Create",
  update: "Update",
  delete: "Delete",
  approve: "Approve",
  export: "Export",
  manage: "Manage",
};

const MODULE_ICONS = {
  users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  events: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  registrations: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  payments: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
  categories: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  reports: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  feedback: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
};

export default function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [schema, setSchema] = useState({ modules: [], actions: [] });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    try {
      const [rolesRes, schemaRes] = await Promise.all([
        adminRolesAPI.getAll(),
        adminRolesAPI.getSchema(),
      ]);
      setRoles(rolesRes.data || []);
      setSchema(schemaRes.data || { modules: [], actions: [] });
    } catch {
      showToast("Failed to load roles", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminRolesAPI.delete(deleteTarget.id);
      setRoles((p) => p.filter((r) => r.id !== deleteTarget.id));
      showToast(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to delete", false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 200, background: toast.ok ? "#22c55e" : "#ef4444", color: "#fff", borderRadius: 10, padding: "12px 20px", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: "#8A7A72", marginBottom: 4 }}>
            <span style={{ color: "#FF7A00", fontWeight: 600 }}>Admin Portal</span> › Roles
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#333" }}>Admin Roles</h2>
        </div>
        <button
          onClick={() => { setEditRole(null); setShowForm(true); }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#FF7A00", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" /></svg>
          Create Role
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
            <div style={{ width: 32, height: 32, border: "3px solid #FF7A00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
        ) : roles.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#8A7A72" }}>No roles created yet</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F5F5F5" }}>
                  {["Role", "Description", "Permissions", "Users", "Type", "Created", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8A7A72", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => {
                  const perms = role.permissions || {};
                  const permCount = Object.values(perms).reduce((s, a) => s + a.length, 0);
                  return (
                    <tr key={role.id} style={{ borderTop: "1px solid #F0F0F0" }} onMouseEnter={(e) => e.currentTarget.style.background = "#FAFAFA"} onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#333" }}>{role.name}</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#5A5A5A", maxWidth: 250 }}>{role.description || "—"}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#FF7A00" }}>{permCount}</span>
                        <span style={{ fontSize: 12, color: "#8A7A72" }}> permissions</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{role.assignedCount || 0}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#22c55e22", color: "#22c55e" }}>Custom</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#8A7A72", whiteSpace: "nowrap" }}>
                        {role.createdAt ? new Date(role.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => { setEditRole(role); setShowForm(true); }}
                            title="Edit"
                            style={{ padding: "6px 10px", border: "1.5px solid #E0E0E0", color: "#333", borderRadius: 8, background: "none", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 1l3 3-9 9H1v-3l9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(role)}
                            title="Delete"
                            style={{ padding: "6px 10px", border: "1.5px solid #E0E0E0", color: "#ef4444", borderRadius: 8, background: "none", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3h10M5 3V2h4v1M6 6v4M8 6v4M3 3l.7 8.3A1 1 0 004.7 12h4.6a1 1 0 001-.7L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                          </button>
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

      {showForm && (
        <RoleFormModal
          role={editRole}
          schema={schema}
          onClose={() => { setShowForm(false); setEditRole(null); }}
          onSaved={() => { fetchAll(); setShowForm(false); setEditRole(null); }}
          showToast={showToast}
        />
      )}

      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setDeleteTarget(null)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 440, maxWidth: "calc(100vw - 32px)", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 12 }}>Delete Role?</h3>
            <p style={{ color: "#5A5A5A", fontSize: 14, marginBottom: 24 }}>
              This will permanently delete <strong>{deleteTarget.name}</strong> and unassign it from all users.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: "10px 20px", border: "1.5px solid #E0E0E0", borderRadius: 10, background: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: "10px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const ROLE_PRESETS = {
  "Event Manager": {
    description: "Manages events, approvals, and registrations",
    permissions: { events: ["view", "create", "update", "delete", "approve"], registrations: ["view", "export"], reports: ["view"] },
  },
  "User Manager": {
    description: "Manages user accounts and roles",
    permissions: { users: ["view", "create", "update", "delete"], reports: ["view", "export"] },
  },
  "Moderator": {
    description: "Reviews content and handles reports",
    permissions: { events: ["view", "approve"], users: ["view"], reports: ["view", "update"], feedback: ["view", "update", "delete"] },
  },
  "Content Manager": {
    description: "Manages event content and categories",
    permissions: { events: ["view", "create", "update"], categories: ["view", "create", "update", "delete"] },
  },
  "Report Analyst": {
    description: "Views and exports system reports",
    permissions: { reports: ["view", "export"], registrations: ["view", "export"] },
  },
  "Support Agent": {
    description: "Handles feedback and user support",
    permissions: { users: ["view"], feedback: ["view", "update", "manage"], reports: ["view"] },
  },
  "Coordinator": {
    description: "Manages users, events, and event verification",
    permissions: { users: ["view", "create", "update", "delete"], events: ["view", "create", "update", "delete", "approve"], registrations: ["view", "export"], reports: ["view"] },
  },
  "Developer": {
    description: "System health, backup, restore, and query console",
    permissions: { reports: ["view", "export"] },
  },
};

function RoleFormModal({ role, schema, onClose, onSaved, showToast }) {
  const isEdit = !!role;
  const [form, setForm] = useState({
    name: role?.name || "",
    description: role?.description || "",
  });
  const [permissions, setPermissions] = useState(role?.permissions || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { modules, actions } = schema;

  const handleNameChange = (name) => {
    setForm((p) => ({ ...p, name }));
    const preset = ROLE_PRESETS[name];
    if (preset && !isEdit) {
      setForm((p) => ({ ...p, description: preset.description }));
      setPermissions({ ...preset.permissions });
    }
  };

  const toggleAction = (mod, action) => {
    setPermissions((prev) => {
      const current = prev[mod] || [];
      if (action === "manage") {
        return { ...prev, [mod]: current.includes("manage") ? [] : ["view", "create", "update", "delete", "approve", "export", "manage"] };
      }
      const next = current.includes(action) ? current.filter((a) => a !== action) : [...current, action];
      return { ...prev, [mod]: next };
    });
  };

  const handleSubmit = async () => {
    if (!form.name) {
      setError("Please select a role");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = { ...form, permissions };
      if (isEdit) {
        await adminRolesAPI.update(role.id, payload);
        showToast("Role updated");
      } else {
        await adminRolesAPI.create(payload);
        showToast("Role created");
      }
      onSaved();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save role");
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 40, overflowY: "auto" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 720, maxWidth: "calc(100vw - 32px)", marginBottom: 40, boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#333" }}>{isEdit ? "Edit Role" : "Create Role"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#8A7A72", lineHeight: 1 }}>×</button>
        </div>

        {error && <div style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 }}>Role</label>
          <select value={form.name} onChange={(e) => handleNameChange(e.target.value)} style={{ width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff", boxSizing: "border-box" }}>
            <option value="">-- Select a role --</option>
            {Object.keys(ROLE_PRESETS).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 }}>Description</label>
          <div style={{ padding: "10px 12px", fontSize: 14, color: form.description ? "#333" : "#C0C0C0", border: "1.5px solid #E0E0E0", borderRadius: 8, minHeight: 20, background: "#F9F9F9" }}>
            {form.description || "Auto-filled when you select a role"}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 12 }}>Permissions</label>
          <div style={{ border: "1.5px solid #E0E0E0", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F5F5F5" }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#5A5A5A" }}>Module</th>
                  {actions.map((a) => (
                    <th key={a} style={{ padding: "10px 6px", textAlign: "center", fontWeight: 600, color: "#5A5A5A", fontSize: 11, textTransform: "capitalize" }}>{ACTION_LABELS[a] || a}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map((mod) => (
                  <tr key={mod} style={{ borderTop: "1px solid #F0F0F0" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "#333" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF7A00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={MODULE_ICONS[mod] || MODULE_ICONS.users} /></svg>
                        {MODULE_LABELS[mod] || mod}
                      </div>
                    </td>
                    {actions.map((action) => {
                      const checked = permissions[mod]?.includes(action) || false;
                      return (
                        <td key={action} style={{ padding: "10px 6px", textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAction(mod, action)}
                            style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#FF7A00" }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid #E0E0E0", borderRadius: 10, background: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ padding: "10px 24px", background: "#FF7A00", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Saving…" : isEdit ? "Update Role" : "Create Role"}
          </button>
        </div>
      </div>
    </div>
  );
}
