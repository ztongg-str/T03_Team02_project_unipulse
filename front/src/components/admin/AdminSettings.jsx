import { useState, useEffect, useCallback } from "react";
import { adminAPI, backupAPI, usersAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

// ─── shared ──────────────────────────────────────────────────────────────────

function Toast({ msg, ok }) {
  return (
    <div style={{ position: "fixed", top: 24, right: 24, zIndex: 300, background: ok ? "#22c55e" : "#ef4444", color: "#fff", borderRadius: 10, padding: "12px 20px", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", animation: "fadeIn 0.2s" }}>
      {msg}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
      {title && <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#333" }}>{title}</h3>}
      {children}
    </div>
  );
}

function Spinner() {
  return <div style={{ width: 24, height: 24, border: "2.5px solid #FF7A00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />;
}

// ─── Admin Profile Tab ────────────────────────────────────────────────────────

function AdminProfileTab() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ fullName: user?.fullName || "", bio: user?.bio || "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.updateProfile(form);
      updateUser(res.data);
      showToast("Profile updated");
    } catch (e) { showToast(e.response?.data?.message || "Failed", false); }
    setLoading(false);
  };

  return (
    <div>
      {toast && <Toast {...toast} />}
      <Section title="Admin Profile">
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,122,0,0.15)", color: "#FF7A00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800 }}>
            {user?.avatar
              ? <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : (user?.fullName?.charAt(0) || "A")}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#333" }}>{user?.fullName}</div>
            <div style={{ fontSize: 13, color: "#FF7A00", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Senior Admin</div>
            <div style={{ fontSize: 13, color: "#8A7A72" }}>@{user?.username} · {user?.email}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <Field label="Full Name" value={form.fullName} onChange={set("fullName")} />
          <Field label="Email" value={user?.email || ""} disabled />
        </div>
        <Field label="Bio" as="textarea" value={form.bio} onChange={set("bio")} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={handleSave} disabled={loading} style={{ padding: "10px 24px", background: "#FF7A00", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </Section>

      <Section title="Account Info">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Account ID", `#${user?.id}`], ["Role", user?.role], ["Status", user?.status], ["Username", `@${user?.username}`]].map(([k, v]) => (
            <div key={k} style={{ background: "#F9F9F9", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 12, color: "#8A7A72", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{k}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#333", textTransform: "capitalize" }}>{v}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Field({ label, as = "input", disabled, ...props }) {
  const base = { width: "100%", border: "1.5px solid #E0E0E0", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: disabled ? "#F9F9F9" : "#fff", color: disabled ? "#8A7A72" : "#333" };
  return (
    <div style={{ marginBottom: 4 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 }}>{label}</label>
      {as === "textarea"
        ? <textarea {...props} disabled={disabled} rows={3} style={{ ...base, resize: "vertical" }} />
        : <input {...props} disabled={disabled} style={base} />}
    </div>
  );
}

// ─── System Health Tab ────────────────────────────────────────────────────────

function HealthRow({ label, value, ok, extra }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #F0F0F0" }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: ok === null ? "#FFD54A" : ok ? "#22c55e" : "#ef4444", marginRight: 14, flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#333" }}>{label}</div>
      <div style={{ fontSize: 14, color: "#5A5A5A", fontWeight: 500 }}>{value}</div>
      {extra && <div style={{ fontSize: 12, color: "#8A7A72", marginLeft: 12 }}>{extra}</div>}
    </div>
  );
}

function SystemHealthTab() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    adminAPI.getSystemHealth()
      .then((res) => setHealth(res.data))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { load(); }, []);

  const fmtUptime = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  };
  const fmtDate = (d) => d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never";
  const fmtBytes = (b) => b == null ? "—" : b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : b > 1024 ? `${(b / 1024).toFixed(1)} KB` : `${b} B`;

  if (loading) return <div style={{ padding: 60, textAlign: "center" }}><Spinner /></div>;
  if (!health) return null;

  const { database, server, tableCounts, lastBackup } = health;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => load(true)} disabled={refreshing} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: "1.5px solid #E0E0E0", borderRadius: 10, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: refreshing ? "spin 0.7s linear infinite" : "none" }}>
            <path d="M12 7A5 5 0 112 7M12 7V4M12 7H9" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Refresh
        </button>
      </div>

      <Section title="Database">
        <HealthRow label="Status" value={database.status === "up" ? "Operational" : "Down"} ok={database.status === "up"} />
        <HealthRow label="Latency" value={database.latencyMs != null ? `${database.latencyMs}ms` : "—"} ok={database.latencyMs != null && database.latencyMs < 100} />
        <HealthRow label="Last Backup" value={fmtDate(lastBackup?.createdAt)} ok={lastBackup != null} extra={lastBackup ? `${lastBackup.type} · ${lastBackup.trigger}` : "No backups yet"} />
      </Section>

      <Section title="Server">
        <HealthRow label="Uptime" value={fmtUptime(server.uptimeSeconds)} ok={true} />
        <HealthRow label="Node.js" value={server.nodeVersion} ok={true} />
        <HealthRow label="Platform" value={server.platform} ok={null} />
        <HealthRow label="RAM (RSS)" value={`${server.memory.rssMb} MB`} ok={server.memory.rssMb < 400} />
        <HealthRow label="Heap Used" value={`${server.memory.heapUsedMb} MB`} ok={true} extra={`of ${server.memory.heapTotalMb} MB`} />
      </Section>

      <Section title="Table Row Counts">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
          {Object.entries(tableCounts).map(([table, count]) => (
            <div key={table} style={{ background: "#F9F9F9", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#5A5A5A", fontWeight: 500 }}>{table}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#333" }}>{count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Section>

      <div style={{ fontSize: 12, color: "#8A7A72", textAlign: "right" }}>
        Checked at {fmtDate(health.checkedAt)}
      </div>
    </div>
  );
}

// ─── Backup & Recovery Tab ────────────────────────────────────────────────────

const BACKUP_TYPES = [
  { key: "full", label: "Full Database", desc: "Back up all tables and their complete data — the safest and most complete option." },
  { key: "tables", label: "Selected Tables", desc: "Choose which tables to include — useful for backing up just users or events." },
  { key: "rows", label: "Specific Rows", desc: "Pick a table and enter row IDs — backs up just those records using REPLACE INTO." },
];

function BackupRecoveryTab() {
  const [mode, setMode] = useState("full");
  const [tables, setTables] = useState([]);
  const [allTables, setAllTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [rowTable, setRowTable] = useState("");
  const [rowIds, setRowIds] = useState("");
  const [rowPreview, setRowPreview] = useState(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [histTotal, setHistTotal] = useState(0);
  const [histPage, setHistPage] = useState(1);
  const [histLoading, setHistLoading] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const HIST_LIMIT = 10;

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 4000); };

  useEffect(() => {
    backupAPI.listTables().then((res) => {
      setAllTables(res.data);
      if (res.data.length > 0 && !rowTable) setRowTable(res.data[0].name);
    }).catch(() => {});
  }, []);

  const loadHistory = useCallback(() => {
    setHistLoading(true);
    backupAPI.getAll({ page: histPage, limit: HIST_LIMIT })
      .then((res) => { setHistory(res.data.backups); setHistTotal(res.data.total); })
      .catch(() => {})
      .finally(() => setHistLoading(false));
  }, [histPage]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const toggleTable = (name) =>
    setSelectedTables((p) => p.includes(name) ? p.filter((t) => t !== name) : [...p, name]);

  const handlePreviewRows = async () => {
    const ids = rowIds.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n > 0);
    if (!ids.length || !rowTable) return;
    try {
      const res = await backupAPI.previewRows(rowTable, ids);
      setRowPreview(res.data);
    } catch (e) { showToast("Preview failed: " + (e.response?.data?.message || e.message), false); }
  };

  const handleCreateBackup = async () => {
    setBackupLoading(true);
    try {
      if (mode === "full") {
        await backupAPI.createFull();
        showToast("Full backup created successfully");
      } else if (mode === "tables") {
        if (selectedTables.length === 0) { showToast("Select at least one table", false); setBackupLoading(false); return; }
        await backupAPI.createTables(selectedTables);
        showToast(`Tables backup created (${selectedTables.length} tables)`);
      } else {
        const ids = rowIds.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n > 0);
        if (!ids.length) { showToast("Enter at least one valid row ID", false); setBackupLoading(false); return; }
        if (!rowTable) { showToast("Select a table", false); setBackupLoading(false); return; }
        const res = await backupAPI.createRows(rowTable, ids);
        showToast(`Row backup created (${res.data.scope?.matchedCount} rows matched)`);
      }
      loadHistory();
    } catch (e) { showToast(e.response?.data?.message || "Backup failed", false); }
    setBackupLoading(false);
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    setRestoreLoading(true);
    try {
      await backupAPI.restore(restoreTarget.filename);
      showToast(`Restored from ${restoreTarget.filename}`);
      setRestoreTarget(null);
    } catch (e) { showToast(e.response?.data?.message || "Restore failed", false); }
    setRestoreLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await backupAPI.delete(deleteTarget.filename);
      setHistory((p) => p.filter((b) => b.filename !== deleteTarget.filename));
      setHistTotal((t) => t - 1);
      showToast("Backup deleted");
      setDeleteTarget(null);
    } catch (e) { showToast(e.response?.data?.message || "Delete failed", false); }
    setDeleteLoading(false);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
  const fmtBytes = (b) => b == null ? "—" : b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(2)} MB` : b > 1024 ? `${(b / 1024).toFixed(1)} KB` : `${b} B`;
  const STATUS_COLORS = { success: "#22c55e", failed: "#ef4444" };
  const TYPE_COLORS = { full: "#2EC4B6", tables: "#FF7A00", rows: "#8A7A72" };
  const histPages = Math.ceil(histTotal / HIST_LIMIT);

  return (
    <div>
      {toast && <Toast {...toast} />}

      {/* Scheduled backup banner */}
      <div style={{ background: "rgba(46,196,182,0.1)", border: "1px solid rgba(46,196,182,0.3)", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="#2EC4B6" strokeWidth="2" />
          <path d="M10 6v4l2.5 2.5" stroke="#2EC4B6" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#2EC4B6" }}>Automatic Full Backup: every 24 hours at midnight</div>
          <div style={{ fontSize: 13, color: "#5A5A5A" }}>Scheduled backups run automatically. Use manual backups below for on-demand snapshots.</div>
        </div>
      </div>

      <Section title="Create Backup">
        {/* Mode selector */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {BACKUP_TYPES.map((t) => (
            <button key={t.key} onClick={() => setMode(t.key)} style={{ flex: 1, minWidth: 160, padding: "16px 20px", border: `2px solid ${mode === t.key ? "#FF7A00" : "#E0E0E0"}`, borderRadius: 12, background: mode === t.key ? "rgba(255,122,0,0.06)" : "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: mode === t.key ? "#FF7A00" : "#333" }}>{t.label}</div>
              <div style={{ fontSize: 12, color: "#8A7A72", marginTop: 4, lineHeight: 1.4 }}>{t.desc}</div>
            </button>
          ))}
        </div>

        {/* Mode-specific config */}
        {mode === "full" && (
          <div style={{ background: "#F9F9F9", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#333", marginBottom: 8 }}>Included Tables</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["users", "events", "registrations", "friends", "achievements", "user_achievements", "activity_logs", "reports", "upcoming_events", "past_event_history", "saved_events"].map((t) => (
                <span key={t} style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 8, background: "rgba(46,196,182,0.12)", color: "#2EC4B6" }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {mode === "tables" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#333", marginBottom: 10 }}>Select Tables</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
              {allTables.map((t) => (
                <label key={t.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: `1.5px solid ${selectedTables.includes(t.name) ? "#FF7A00" : "#E0E0E0"}`, borderRadius: 10, cursor: "pointer", background: selectedTables.includes(t.name) ? "rgba(255,122,0,0.06)" : "#fff", transition: "all 0.1s" }}>
                  <input type="checkbox" checked={selectedTables.includes(t.name)} onChange={() => toggleTable(t.name)} style={{ accentColor: "#FF7A00" }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "#8A7A72" }}>{t.rowCount.toLocaleString()} rows</div>
                  </div>
                </label>
              ))}
            </div>
            {selectedTables.length > 0 && <div style={{ marginTop: 10, fontSize: 13, color: "#FF7A00", fontWeight: 600 }}>{selectedTables.length} table{selectedTables.length !== 1 ? "s" : ""} selected</div>}
          </div>
        )}

        {mode === "rows" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 }}>Table</label>
                <select value={rowTable} onChange={(e) => { setRowTable(e.target.value); setRowPreview(null); }} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E0E0E0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff" }}>
                  {allTables.map((t) => <option key={t.name} value={t.name}>{t.name} ({t.rowCount.toLocaleString()} rows)</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 }}>Row IDs (comma-separated)</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={rowIds} onChange={(e) => setRowIds(e.target.value)} placeholder="e.g. 1, 2, 5, 10" style={{ flex: 1, padding: "10px 12px", border: "1.5px solid #E0E0E0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                  <button onClick={handlePreviewRows} style={{ padding: "10px 16px", border: "1.5px solid #E0E0E0", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Preview</button>
                </div>
              </div>
            </div>
            {rowPreview && (
              <div style={{ background: "#F9F9F9", borderRadius: 10, padding: 16, maxHeight: 200, overflowY: "auto" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 8 }}>{rowPreview.length} row(s) found</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr>
                        {rowPreview.length > 0 && Object.keys(rowPreview[0]).filter((k) => !["password"].includes(k)).map((k) => (
                          <th key={k} style={{ padding: "6px 10px", textAlign: "left", color: "#8A7A72", fontWeight: 600, borderBottom: "1px solid #E0E0E0", whiteSpace: "nowrap" }}>{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rowPreview.map((row, i) => (
                        <tr key={i}>
                          {Object.entries(row).filter(([k]) => !["password"].includes(k)).map(([k, v]) => (
                            <td key={k} style={{ padding: "6px 10px", color: "#333", borderBottom: "1px solid #F0F0F0", whiteSpace: "nowrap", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {v == null ? <span style={{ color: "#C0C0C0" }}>null</span> : String(v)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleCreateBackup} disabled={backupLoading} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", background: "#FF7A00", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", opacity: backupLoading ? 0.7 : 1 }}>
            {backupLoading ? (
              <><div style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Creating Backup…</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> Create {mode === "full" ? "Full" : mode === "tables" ? "Tables" : "Rows"} Backup</>
            )}
          </button>
        </div>
      </Section>

      {/* Backup History */}
      <Section title="Backup History">
        <div style={{ fontSize: 13, color: "#8A7A72", marginBottom: 16 }}>
          {histTotal} backup{histTotal !== 1 ? "s" : ""} recorded
        </div>
        {histLoading ? (
          <div style={{ padding: 40, textAlign: "center" }}><Spinner /></div>
        ) : history.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#8A7A72" }}>No backups yet</div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F5F5F5" }}>
                    {["Filename", "Type", "Trigger", "Size", "Status", "Created By", "Date", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8A7A72", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((b) => (
                    <tr key={b.id} style={{ borderTop: "1px solid #F0F0F0" }} onMouseEnter={(e) => e.currentTarget.style.background = "#FAFAFA"} onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "#5A5A5A", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={b.filename}>{b.filename}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: `${TYPE_COLORS[b.type]}22`, color: TYPE_COLORS[b.type], textTransform: "capitalize" }}>{b.type}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: b.trigger_type === "scheduled" ? "rgba(46,196,182,0.12)" : "rgba(255,122,0,0.12)", color: b.trigger_type === "scheduled" ? "#2EC4B6" : "#FF7A00", textTransform: "capitalize" }}>{b.trigger_type}</span>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "#5A5A5A", whiteSpace: "nowrap" }}>{fmtBytes(b.sizeBytes)}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: `${STATUS_COLORS[b.status]}22`, color: STATUS_COLORS[b.status], textTransform: "capitalize" }}>{b.status}</span>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "#5A5A5A" }}>{b.createdByUsername || <span style={{ color: "#C0C0C0" }}>scheduler</span>}</td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "#8A7A72", whiteSpace: "nowrap" }}>{fmtDate(b.createdAt)}</td>
                      <td style={{ padding: "12px 14px" }}>
                        {b.status === "success" && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <a href={backupAPI.download(b.filename)} download style={{ padding: "5px 10px", background: "rgba(46,196,182,0.12)", color: "#2EC4B6", borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>↓ Download</a>
                            <button onClick={() => setRestoreTarget(b)} style={{ padding: "5px 10px", background: "rgba(255,122,0,0.12)", color: "#FF7A00", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>↺ Restore</button>
                            <button onClick={() => setDeleteTarget(b)} style={{ padding: "5px 8px", border: "1.5px solid #E0E0E0", color: "#8A7A72", borderRadius: 8, background: "none", cursor: "pointer" }}>
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 2h10M4 2V1h4v1M5 5v4M7 5v4M2 2l.6 7.2A1 1 0 003.6 10h4.8a1 1 0 001-.8L10 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                            </button>
                          </div>
                        )}
                        {b.status === "failed" && (
                          <span style={{ fontSize: 11, color: "#ef4444" }} title={b.errorMessage}>Failed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {histPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
                {Array.from({ length: Math.min(histPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setHistPage(p)} style={{ width: 32, height: 32, borderRadius: 8, border: p === histPage ? "none" : "1.5px solid #E0E0E0", background: p === histPage ? "#FF7A00" : "none", color: p === histPage ? "#fff" : "#333", fontWeight: p === histPage ? 700 : 400, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </Section>

      {/* Restore Confirm */}
      {restoreTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setRestoreTarget(null)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 480, maxWidth: "calc(100vw - 32px)", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 12px", color: "#333" }}>⚠️ Restore Database?</h3>
            <div style={{ background: "#FFF8F0", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#333" }}>{restoreTarget.filename}</div>
              <div style={{ fontSize: 12, color: "#8A7A72", marginTop: 2 }}>{restoreTarget.type} backup · {new Date(restoreTarget.createdAt).toLocaleString()}</div>
            </div>
            <div style={{ background: "rgba(239,68,68,0.08)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 13, color: "#ef4444", lineHeight: 1.5 }}>
                <strong>Warning:</strong> This will overwrite existing data for the tables included in this backup. Full backups drop and recreate tables; rows backups use REPLACE INTO (safer — only updates matching rows). Make sure you have a current backup before proceeding.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setRestoreTarget(null)} style={{ padding: "10px 20px", border: "1.5px solid #E0E0E0", borderRadius: 10, background: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleRestore} disabled={restoreLoading} style={{ padding: "10px 24px", background: "#FF7A00", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", opacity: restoreLoading ? 0.7 : 1 }}>
                {restoreLoading ? "Restoring…" : "Restore Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setDeleteTarget(null)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 440, maxWidth: "calc(100vw - 32px)", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 12px", color: "#333" }}>Delete Backup?</h3>
            <p style={{ color: "#5A5A5A", fontSize: 14, marginBottom: 24 }}>Delete <strong>{deleteTarget.filename}</strong>? The .sql file and its history record will be permanently removed.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: "10px 20px", border: "1.5px solid #E0E0E0", borderRadius: 10, background: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading} style={{ padding: "10px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}

// ─── Main AdminSettings component ────────────────────────────────────────────

const TABS = [
  { key: "profile", label: "Admin Profile" },
  { key: "health", label: "System Health" },
  { key: "backup", label: "Backup & Recovery" },
];

export default function AdminSettings() {
  const [tab, setTab] = useState("profile");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 13, color: "#8A7A72", marginBottom: 4 }}>
          <span style={{ color: "#FF7A00", fontWeight: 600 }}>Admin Portal</span> › Settings
        </div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#333" }}>Settings</h2>
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #E0E0E0" }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "12px 24px", border: "none", background: "none", fontFamily: "inherit", fontSize: 14, fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? "#FF7A00" : "#5A5A5A", cursor: "pointer", borderBottom: tab === t.key ? "2px solid #FF7A00" : "2px solid transparent", marginBottom: -2, transition: "all 0.15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && <AdminProfileTab />}
      {tab === "health" && <SystemHealthTab />}
      {tab === "backup" && <BackupRecoveryTab />}
    </div>
  );
}
