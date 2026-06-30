import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import OrganizerLayout from "./OrganizerLayout";

export default function AppLayout() {
  const { user } = useAuth();

  // Admins always live inside AdminLayout — redirect if they somehow land here.
  if (user?.role === "admin") {
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
