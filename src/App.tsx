import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { Login } from "./features/auth/Login";
import { Home } from "./features/home/Home";
import { Dashboard } from "./features/dashboard/Dashboard";
import { CalendarPage } from "./features/calendar/CalendarPage";
import { Consultations } from "./features/consultations/Consultations";
import { Clients } from "./features/clients/Clients";
import { Services } from "./features/services/Services";
import { Projects } from "./features/projects/Projects";
import { Reports } from "./features/reports/Reports";
import { AboutUs } from "./features/about/AboutUs";
import { ContactUs } from "./features/contact/ContactUs";
import { useAuth } from "./hooks/useAuth";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route
            path="dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="consultations" element={<Consultations />} />
          <Route
            path="clients"
            element={
              <RequireAuth>
                <Clients />
              </RequireAuth>
            }
          />
          <Route path="services" element={<Services />} />
          <Route
            path="projects"
            element={
              <RequireAuth>
                <Projects />
              </RequireAuth>
            }
          />
          <Route
            path="reports"
            element={
              <RequireAuth>
                <Reports />
              </RequireAuth>
            }
          />
          <Route path="about" element={<AboutUs />} />
          <Route path="contact" element={<ContactUs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
