import { useState, useRef, useEffect } from "react";
import { queryConsoleAPI } from "../../services/api";

function Spinner() {
  return (
    <div style={{ width: 20, height: 20, border: "2.5px solid #FF7A00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
  );
}

function Toast({ msg, ok }) {
  return (
    <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: ok ? "#22c55e" : "#ef4444", color: "#fff", borderRadius: 10, padding: "12px 20px", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
      {msg}
    </div>
  );
}

const QUICK_QUERIES = [
  { label: "All users", sql: "SELECT id, username, email, fullName, role, status, createdAt FROM users ORDER BY createdAt DESC LIMIT 50;" },
  { label: "All events", sql: "SELECT id, title, status, date, category, organizerId, createdAt FROM events ORDER BY createdAt DESC LIMIT 50;" },
  { label: "Pending events", sql: "SELECT id, title, date, category, organizerId FROM events WHERE status = 'pending' ORDER BY createdAt DESC;" },
  { label: "Registrations", sql: "SELECT r.id, u.username, e.title, r.createdAt FROM registrations r JOIN users u ON r.userId=u.id JOIN events e ON r.eventId=e.id ORDER BY r.createdAt DESC LIMIT 50;" },
  { label: "Query logs", sql: "SELECT ql.id, u.username, ql.query_text, ql.affected, ql.status, ql.executedAt FROM query_logs ql JOIN users u ON ql.adminId=u.id ORDER BY ql.executedAt DESC LIMIT 50;" },
  { label: "User count by role", sql: "SELECT role, COUNT(*) as total FROM users GROUP BY role;" },
  { label: "Backups", sql: "SELECT id, filename, type, status, sizeBytes, trigger_type, createdAt FROM backups ORDER BY createdAt DESC LIMIT 20;" },
];

export default function AdminQueryConsole() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [activeTab, setActiveTab] = useState("console"); // console | history
  const [queryLogs, setQueryLogs] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const textareaRef = useRef(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRun = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await queryConsoleAPI.execute(query.trim());
      setResult({ ...res.data, query: query.trim(), ranAt: new Date() });
      setHistory((prev) => [query.trim(), ...prev.filter((q) => q !== query.trim())].slice(0, 30));
      setHistoryIdx(-1);
    } catch (e) {
      const msg = e.response?.data?.message || "Query failed";
      setResult({ status: "error", error: msg, query: query.trim(), ranAt: new Date() });
      showToast(msg, false);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter / Cmd+Enter runs the query
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun();
      return;
    }
    // Up/Down arrow navigates query history
    if (e.key === "ArrowUp" && e.altKey) {
      e.preventDefault();
      const next = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(next);
      setQuery(history[next] || "");
    }
    if (e.key === "ArrowDown" && e.altKey) {
      e.preventDefault();
      const next = Math.max(historyIdx - 1, -1);
      setHistoryIdx(next);
      setQuery(next === -1 ? "" : history[next]);
    }
  };

  const loadQueryLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await queryConsoleAPI.getLogs({ limit: 100 });
      setQueryLogs(res.data);
    } catch {
      showToast("Failed to load query logs", false);
    }
    setLogsLoading(false);
  };

  useEffect(() => {
    if (activeTab === "history") loadQueryLogs();
  }, [activeTab]);

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";

  return (
    <div style={{ padding: "0 0 40px" }}>
      {toast && <Toast {...toast} />}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a1a1a" }}>SQL Query Console</h2>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#8A7A72" }}>
          Execute raw SQL queries directly on the database. Results are logged for audit purposes.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "2px solid #F0F0F0", paddingBottom: 0 }}>
        {[["console", "Query Console"], ["history", "Execution History"]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              padding: "10px 20px", border: "none", background: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 14, fontFamily: "inherit",
              color: activeTab === id ? "#FF7A00" : "#8A7A72",
              borderBottom: activeTab === id ? "2px solid #FF7A00" : "2px solid transparent",
              marginBottom: -2, transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "console" && (
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20, alignItems: "start" }}>
          {/* Quick Queries Sidebar */}
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8A7A72", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              Quick Queries
            </div>
            {QUICK_QUERIES.map((q) => (
              <button
                key={q.label}
                onClick={() => { setQuery(q.sql); textareaRef.current?.focus(); }}
                style={{
                  display: "block", width: "100%", textAlign: "left", padding: "8px 10px",
                  border: "none", background: query === q.sql ? "rgba(255,122,0,0.1)" : "transparent",
                  borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500,
                  color: query === q.sql ? "#FF7A00" : "#444", fontFamily: "inherit",
                  marginBottom: 2, transition: "all 0.12s",
                }}
              >
                {q.label}
              </button>
            ))}

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #F0F0F0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8A7A72", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Session History
              </div>
              {history.length === 0 && (
                <div style={{ fontSize: 12, color: "#bbb", fontStyle: "italic" }}>No queries yet</div>
              )}
              {history.slice(0, 8).map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(q); textareaRef.current?.focus(); }}
                  title={q}
                  style={{
                    display: "block", width: "100%", textAlign: "left", padding: "6px 10px",
                    border: "none", background: "transparent", borderRadius: 6,
                    cursor: "pointer", fontSize: 11, color: "#666", fontFamily: "monospace",
                    marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}
                >
                  {q.length > 28 ? q.slice(0, 28) + "…" : q}
                </button>
              ))}
            </div>
          </div>

          {/* Main Editor Panel */}
          <div>
            {/* Query Editor */}
            <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #F4F4F4", background: "#FAFAFA" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
                  <span style={{ fontSize: 12, color: "#8A7A72", marginLeft: 8, fontFamily: "monospace" }}>SQL Editor</span>
                </div>
                <span style={{ fontSize: 11, color: "#bbb" }}>Ctrl+Enter to run · Alt+↑↓ for history</span>
              </div>
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="SELECT * FROM users LIMIT 10;"
                rows={8}
                style={{
                  width: "100%", border: "none", outline: "none", padding: "16px",
                  fontSize: 14, fontFamily: "'Courier New', Courier, monospace",
                  lineHeight: 1.6, resize: "vertical", boxSizing: "border-box",
                  background: "#1e1e2e", color: "#cdd6f4", minHeight: 160,
                }}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: "1px solid #F4F4F4", background: "#FAFAFA" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setQuery("")}
                    style={{ padding: "7px 14px", border: "1.5px solid #E0E0E0", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#666" }}
                  >
                    Clear
                  </button>
                </div>
                <button
                  onClick={handleRun}
                  disabled={loading || !query.trim()}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "9px 24px",
                    background: loading || !query.trim() ? "#ccc" : "#FF7A00",
                    color: "#fff", border: "none", borderRadius: 8,
                    fontWeight: 700, fontSize: 14, cursor: loading || !query.trim() ? "not-allowed" : "pointer",
                    fontFamily: "inherit", transition: "background 0.15s",
                  }}
                >
                  {loading ? <Spinner /> : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 3l9 5-9 5V3z" fill="currentColor" />
                    </svg>
                  )}
                  {loading ? "Running…" : "Run Query"}
                </button>
              </div>
            </div>

            {/* Results Panel */}
            {result && (
              <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                {/* Result Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #F4F4F4" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: result.status === "error" ? "#ef4444" : "#22c55e"
                    }} />
                    <span style={{ fontWeight: 700, fontSize: 14, color: result.status === "error" ? "#ef4444" : "#22c55e" }}>
                      {result.status === "error" ? "Error" : "Success"}
                    </span>
                    {result.status !== "error" && (
                      <span style={{ fontSize: 13, color: "#8A7A72" }}>
                        {result.rows?.length > 0
                          ? `${result.rows.length} row${result.rows.length !== 1 ? "s" : ""} returned`
                          : `${result.affected ?? 0} row${result.affected !== 1 ? "s" : ""} affected`}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: "#bbb" }}>{fmtDate(result.ranAt)}</span>
                </div>

                {/* Error Message */}
                {result.status === "error" && (
                  <div style={{ padding: 20, fontFamily: "monospace", fontSize: 13, color: "#ef4444", background: "rgba(239,68,68,0.05)", whiteSpace: "pre-wrap" }}>
                    {result.error}
                  </div>
                )}

                {/* Table Results */}
                {result.status !== "error" && result.rows?.length > 0 && (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "#F8F8F8", borderBottom: "2px solid #F0F0F0" }}>
                          {result.fields.map((col) => (
                            <th key={col} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#333", whiteSpace: "nowrap", fontFamily: "monospace", fontSize: 12 }}>
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((row, ri) => (
                          <tr key={ri} style={{ borderBottom: "1px solid #F4F4F4", background: ri % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                            {result.fields.map((col) => (
                              <td key={col} style={{ padding: "9px 14px", color: "#444", fontFamily: "monospace", fontSize: 12, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                title={String(row[col] ?? "NULL")}
                              >
                                {row[col] === null
                                  ? <span style={{ color: "#bbb", fontStyle: "italic" }}>NULL</span>
                                  : String(row[col])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* No rows */}
                {result.status !== "error" && result.rows?.length === 0 && (
                  <div style={{ padding: "24px 20px", textAlign: "center", color: "#8A7A72", fontSize: 14 }}>
                    {result.affected != null && result.affected > 0
                      ? `✓ Query executed — ${result.affected} row${result.affected !== 1 ? "s" : ""} affected`
                      : "✓ Query executed successfully (no rows returned)"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Execution History Tab */}
      {activeTab === "history" && (
        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #F0F0F0" }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Query Execution Log</span>
            <button onClick={loadQueryLogs} style={{ padding: "7px 14px", border: "1.5px solid #E0E0E0", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Refresh
            </button>
          </div>

          {logsLoading && (
            <div style={{ padding: 40, textAlign: "center" }}><Spinner /></div>
          )}

          {!logsLoading && queryLogs && queryLogs.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "#8A7A72" }}>No queries have been executed yet.</div>
          )}

          {!logsLoading && queryLogs && queryLogs.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F8F8F8", borderBottom: "2px solid #F0F0F0" }}>
                    {["#", "Executed By", "Query", "Rows", "Status", "Time"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#333", whiteSpace: "nowrap", fontSize: 12 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryLogs.map((log, i) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid #F4F4F4", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                      <td style={{ padding: "9px 14px", color: "#bbb", fontFamily: "monospace", fontSize: 11 }}>{log.id}</td>
                      <td style={{ padding: "9px 14px", color: "#444", fontWeight: 600 }}>
                        {log.fullName || log.username}
                        <div style={{ fontSize: 11, color: "#8A7A72" }}>@{log.username}</div>
                      </td>
                      <td style={{ padding: "9px 14px", maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <code style={{ fontSize: 12, color: "#444", background: "#F4F4F4", padding: "2px 6px", borderRadius: 4 }}
                          title={log.query_text}>
                          {log.query_text?.length > 80 ? log.query_text.slice(0, 80) + "…" : log.query_text}
                        </code>
                      </td>
                      <td style={{ padding: "9px 14px", color: "#444", textAlign: "center" }}>{log.affected ?? "—"}</td>
                      <td style={{ padding: "9px 14px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: log.status === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                          color: log.status === "success" ? "#22c55e" : "#ef4444",
                        }}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: "9px 14px", color: "#8A7A72", fontSize: 12, whiteSpace: "nowrap" }}>{fmtDate(log.executedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
