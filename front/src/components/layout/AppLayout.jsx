import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import OrganizerLayout from "./OrganizerLayout";

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (user && location.pathname.startsWith("/organizer/")) {
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
