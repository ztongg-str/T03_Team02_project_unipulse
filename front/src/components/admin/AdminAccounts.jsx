import { useState, useEffect } from "react";
import { adminRolesAPI } from "../../services/api";

export default function AdminAccounts() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [showCreate, setShowCreate] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    try {
      const res = await adminRolesAPI.getAccounts();
      setGroups(res.data || []);
    } catch {
      showToast("Failed to load admin accounts", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (userId, fullName) => {
    if (!confirm(`Delete account for ${fullName}?`)) return;
    try {
      await adminRolesAPI.deleteAccount(userId);
      fetchAll();
      showToast(`Account deleted`);
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to delete", false);
    }
  };

  const filtered = roleFilter
    ? groups.filter((g) => g.roleId === Number(roleFilter))
    : groups;

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
            <span style={{ color: "#FF7A00", fontWeight: 600 }}>Admin Portal</span> › Role Accounts
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#333" }}>Admin Accounts</h2>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "#8A7A72", background: "#FFF5EB", borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#FF7A00" strokeWidth="1.5"/><path d="M8 5v3M8 11v-1" stroke="#FF7A00" strokeWidth="1.5" strokeLinecap="round"/></svg>
        Accounts with <strong style={{ color: "#FF7A00", fontWeight: 600 }}>—</strong> as password were created before this feature — their password isn't recoverable. Use <strong>Add Account</strong> below to create new ones.
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 260, position: "relative" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8A7A72" }}>
            <circle cx="7" cy="7" r="4.5" stroke="#8A7A72" strokeWidth="1.5" /><path d="M11 11l3 3" stroke="#8A7A72" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1.5px solid #E0E0E0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff", cursor: "pointer", appearance: "none" }}>
            <option value="">All Roles</option>
            {groups.map((g) => (
              <option key={g.roleId} value={g.roleId}>{g.roleName} ({g.accounts.length})</option>
            ))}
          </select>
        </div>
        <span style={{ fontSize: 13, color: "#8A7A72" }}>{filtered.reduce((s, g) => s + g.accounts.length, 0)} accounts</span>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
          <div style={{ width: 32, height: 32, border: "3px solid #FF7A00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, padding: 40, textAlign: "center", color: "#8A7A72", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          No admin accounts found
        </div>
      ) : (
        filtered.map((group) => (
          <div key={group.roleId} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #F0F0F0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#333" }}>{group.roleName}</div>
                {group.description && <div style={{ fontSize: 12, color: "#8A7A72", marginTop: 2 }}>{group.description}</div>}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#8A7A72" }}>{group.accounts.length} account{group.accounts.length !== 1 ? "s" : ""}</span>
            </div>

            {group.accounts.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#C0C0C0", fontSize: 13 }}>No accounts assigned</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#FAFAFA" }}>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8A7A72", textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Name</th>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8A7A72", textTransform: "uppercase", letterSpacing: "0.05em" }}>Username</th>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8A7A72", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8A7A72", textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</th>
                      <th style={{ padding: "10px 16px", textAlign: "right", fontSize: 11, fontWeight: 700, color: "#8A7A72", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.accounts.map((acc) => (
                      <tr key={acc.userId} style={{ borderTop: "1px solid #F0F0F0" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14, color: "#333" }}>{acc.fullName}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#5A5A5A" }}>@{acc.username}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#333" }}>{acc.email}</td>
                        <td style={{ padding: "12px 16px" }}>
                          {acc.password === "\u2014" ? (
                            <span style={{ fontSize: 13, color: "#C0C0C0", fontStyle: "italic" }}>—</span>
                          ) : (
                            <span style={{ fontFamily: "monospace", fontSize: 13, color: "#8A7A72", background: "#F5F5F5", padding: "3px 8px", borderRadius: 4, userSelect: "all" }}>
                              {acc.password}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <button onClick={() => handleDelete(acc.userId, acc.fullName)} style={{ padding: "6px 12px", border: "1.5px solid #ef4444", color: "#ef4444", borderRadius: 8, background: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ padding: "12px 20px", borderTop: "1px solid #F0F0F0", textAlign: "center" }}>
              <button
                onClick={() => setShowCreate(group.roleId)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "1.5px dashed #E0E0E0", borderRadius: 10, background: "none", cursor: "pointer", fontSize: 13, color: "#FF7A00", fontWeight: 600, fontFamily: "inherit" }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" /></svg>
                Add Account
              </button>
            </div>
          </div>
        ))
      )}

      {showCreate && (
        <CreateAccountModal
          roleId={showCreate}
          roleName={groups.find((g) => g.roleId === showCreate)?.roleName || ""}
          onClose={() => setShowCreate(null)}
          onCreated={() => { setShowCreate(null); fetchAll(); showToast("Account created"); }}
          showToast={showToast}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function CreateAccountModal({ roleId, roleName, onClose, onCreated, showToast }) {
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);

  const handleSubmit = async () => {
    if (!form.email || !form.password || !form.fullName) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await adminRolesAPI.createAccount({ ...form, roleId });
      setCreated(res.data);
      showToast("Account created");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create account");
    }
    setLoading(false);
  };

  if (created) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 480, maxWidth: "calc(100vw - 32px)", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 16 }}>Account Created</h3>
          <div style={{ background: "#F5F5F5", borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#8A7A72", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Role</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{roleName}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#8A7A72", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Full Name</div>
              <div style={{ fontSize: 14, color: "#333" }}>{created.fullName}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#8A7A72", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Email</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#333", fontFamily: "monospace" }}>{created.email}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#8A7A72", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Password</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#FF7A00", fontFamily: "monospace", userSelect: "all", padding: "4px 8px", background: "#FFF5EB", borderRadius: 4, display: "inline-block" }}>{created.password}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "10px 24px", background: "#FF7A00", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 440, maxWidth: "calc(100vw - 32px)", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 4 }}>Add Account</h3>
        <p style={{ color: "#8A7A72", fontSize: 13, marginBottom: 20 }}>
          for <strong>{roleName}</strong>
        </p>

        {error && <div style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 }}>Full Name</label>
          <input value={form.fullName} onChange={set("fullName")} placeholder="e.g. John Doe" style={{ width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 }}>Email</label>
          <input value={form.email} onChange={set("email")} type="email" placeholder="e.g. admin@unipulse.edu" style={{ width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 }}>Password</label>
          <input value={form.password} onChange={set("password")} type="password" placeholder="Minimum 6 characters" style={{ width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid #E0E0E0", borderRadius: 10, background: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ padding: "10px 24px", background: "#FF7A00", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Creating…" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
