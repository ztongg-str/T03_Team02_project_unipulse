import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import Landing from "./components/pages/Landing";
import StudentHome from "./components/pages/StudentHome";
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
import About from "./components/pages/About";
import History from "./components/pages/History";
import OrganizerDashboard from "./components/pages/OrganizerDashboard";

// Admin
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminUsers from "./components/admin/AdminUsers";
import AdminEvents from "./components/admin/AdminEvents";
import AdminVerification from "./components/admin/AdminVerification";
import AdminSettings from "./components/admin/AdminSettings";
import AdminLayout from "./components/admin/AdminLayout";

function HomeRedirect() {
  const { user } = useAuth();
  if (user) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "organizer") return <Navigate to="/organizer/dashboard" replace />;
    return <StudentHome />;
  }
  return <Landing />;
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
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Admin Portal ── */}
          <Route
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/verification" element={<AdminVerification />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          {/* ── Student / Organizer ── */}
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

            {/* Organizer */}
            <Route path="/organizer/dashboard" element={<ProtectedRoute><OrganizerDashboard /></ProtectedRoute>} />
            <Route path="/organizer/my-events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/organizer/create-event" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/organizer/reports" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/organizer/settings" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
