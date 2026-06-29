import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import OrganizerLayout from "./OrganizerLayout";

export default function AppLayout() {
  const { user } = useAuth();

  const ADMIN_ROLES = ["superadmin", "developer", "coordinator"];
  if (user && ADMIN_ROLES.includes(user.role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user?.role === "organizer") {
    return <OrganizerLayout />;
  }

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
