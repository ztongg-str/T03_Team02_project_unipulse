import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import Landing from "./components/pages/Landing";
import { authAPI } from "./services/api";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import Events from "./components/pages/Events";
import EventDetail from "./components/pages/EventDetail";
import MyRegistrations from "./components/pages/MyRegistrations";
import Profile from "./components/pages/Profile";
import Friends from "./components/pages/Friends";
import FriendProfile from "./components/pages/FriendProfile";
import Achievements from "./components/pages/Achievements";
import Streaks from "./components/pages/Streaks";
import ActivityLog from "./components/pages/ActivityLog";
import StudentHome from "./components/pages/StudentHome";
import About from "./components/pages/About";
import History from "./components/pages/History";
import OrganizerDashboard from "./components/pages/OrganizerDashboard";
import CreateEvent from "./components/pages/CreateEvent";
import EditEvent from "./components/pages/EditEvent";
import OrganizerLayout from "./components/layout/OrganizerLayout";
import MyEvents from "./components/pages/MyEvents";

// Admin
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminUsers from "./components/admin/AdminUsers";
import AdminEvents from "./components/admin/AdminEvents";
import AdminVerification from "./components/admin/AdminVerification";
import AdminSettings from "./components/admin/AdminSettings";
import AdminLayout from "./components/admin/AdminLayout";
import AdminQueryConsole from "./components/admin/AdminQueryConsole";

// All three admin sub-roles
const ADMIN_ROLES = ["superadmin", "developer", "coordinator"];

function HomeRedirect() {
  const { user, loading, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    if (ADMIN_ROLES.includes(user.role)) {
      navigate("/admin/dashboard", { replace: true });
    } else if (user.role === "organizer") {
      authAPI
        .switchRole()
        .then((res) => {
          localStorage.setItem("token", res.data.token);
          updateUser(res.data.user);
          navigate("/events", { replace: true });
        })
        .catch(() => navigate("/events", { replace: true }));
    }
    // student — show StudentHome below
  }, [user, loading, navigate, updateUser]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Landing />;
  if (user.role === "student") return <StudentHome />;
  return <div className="loading">Redirecting...</div>;
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!ADMIN_ROLES.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

// Guards a route to only roles in the allowedRoles list
function RoleRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/admin/dashboard" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Admin Portal ── */}
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Users & Events — superadmin + coordinator */}
            <Route
              path="/admin/users"
              element={
                <RoleRoute allowedRoles={["superadmin", "coordinator"]}>
                  <AdminUsers />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <RoleRoute allowedRoles={["superadmin", "coordinator"]}>
                  <AdminEvents />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/events/edit/:id"
              element={
                <RoleRoute allowedRoles={["superadmin", "coordinator"]}>
                  <EditEvent />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/verification"
              element={
                <RoleRoute allowedRoles={["superadmin", "coordinator"]}>
                  <AdminVerification />
                </RoleRoute>
              }
            />

            {/* Query Console — superadmin + developer */}
            <Route
              path="/admin/query-console"
              element={
                <RoleRoute allowedRoles={["superadmin", "developer"]}>
                  <AdminQueryConsole />
                </RoleRoute>
              }
            />

            {/* Settings — all admin roles (tabs inside are role-filtered) */}
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          {/* ── Organizer Portal ── */}
          <Route
            path="/organizer"
            element={<ProtectedRoute><OrganizerLayout /></ProtectedRoute>}
          >
            <Route path="dashboard" element={<OrganizerDashboard />} />
            <Route path="my-events" element={<MyEvents />} />
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="edit-event/:id" element={<EditEvent />} />
            <Route path="reports" element={<Events />} />
            <Route path="settings" element={<Profile />} />
          </Route>

          {/* ── Student / Public ── */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/my-registrations" element={<MyRegistrations />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
            <Route path="/friends/profile/:userId" element={<ProtectedRoute><FriendProfile /></ProtectedRoute>} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/streaks" element={<Streaks />} />
            <Route path="/activity" element={<ActivityLog />} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
