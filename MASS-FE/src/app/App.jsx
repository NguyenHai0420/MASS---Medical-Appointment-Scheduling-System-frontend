import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "./providers/AuthProvider";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import VerifyOtp from "../features/auth/pages/VerifyOtp";
import ResetPassword from "../features/auth/pages/ResetPassword";
import Profile from "../features/profile/pages/Profile";
import Home from "../features/home/pages/Home";
import BookAppointment from "../features/appointment/pages/BookAppointment";
import DoctorList from "../features/doctor/pages/DoctorList";
import ReceptionistAppointmentList from "../features/appointment/pages/AppointmentList";
import MyAppointments from "../features/appointment/pages/MyAppointments";
import DoctorDetail from "../features/doctor/pages/DoctorDetail";
import Navbar from "../shared/components/Navbar";
import Footer from "../shared/components/Footer";
import PrivateRoute from "./routes/PrivateRoute";
import { AuthProvider } from "./providers/AuthProvider";
import AdminDashboard from "../features/admin/pages/AdminDashboard";
import ManageDoctors from "../features/admin/pages/ManageDoctors";
import ManageSpecialties from "../features/admin/pages/ManageSpecialties";
import ManageUsers from "../features/admin/pages/ManageUsers";
import ManageClinic from "../features/admin/pages/ManageClinic";
import ManageStatistics from "../features/admin/pages/ManageStatistics";
import DoctorDashboard from "../features/doctor/pages/DoctorDashboard";
import WorkSchedule from "../features/doctor/pages/WorkSchedule";
import AppointmentList from "../features/doctor/pages/AppointmentList";
import MedicalRecord from "../features/doctor/pages/MedicalRecord";
import "bootstrap/dist/css/bootstrap.min.css";

function DashboardRedirect() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) return;
    if (user.role === "ROLE_ADMIN") navigate("/admin/dashboard", { replace: true });
    else if (user.role === "ROLE_DOCTOR") navigate("/doctor/dashboard", { replace: true });
    else navigate("/profile", { replace: true });
  }, [user, navigate]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {}
              <Route path="/" element={<Home />} />
              <Route path="/doctors" element={<DoctorList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {}
              <Route element={<PrivateRoute allowedRoles={["ROLE_RECEPTIONIST"]} />}>
                <Route path="/appointments" element={<ReceptionistAppointmentList />} />
                <Route path="/receptionist/dashboard" element={<DashboardRedirect />} />
              </Route>

              {}
              <Route element={<PrivateRoute allowedRoles={["ROLE_PATIENT"]} />}>
                <Route path="/book-appointment" element={<BookAppointment />} />
                <Route path="/bookAppointment" element={<BookAppointment />} />
                <Route path="/doctors/:id" element={<DoctorDetail />} />
                <Route path="/my-appointments" element={<MyAppointments />} />
              </Route>

              {}
              <Route element={<PrivateRoute allowedRoles={["ROLE_PATIENT", "ROLE_DOCTOR", "ROLE_RECEPTIONIST", "ROLE_ADMIN"]} />}>
                <Route path="/dashboard" element={<DashboardRedirect />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {}
              <Route element={<PrivateRoute allowedRoles={["ROLE_ADMIN"]} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/doctors" element={<ManageDoctors />} />
                <Route path="/admin/specialties" element={<ManageSpecialties />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/clinic" element={<ManageClinic />} />
                <Route path="/admin/statistics" element={<ManageStatistics />} />
              </Route>

              {}
              <Route element={<PrivateRoute allowedRoles={["ROLE_DOCTOR"]} />}>
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="/doctor/schedule" element={<WorkSchedule />} />
                <Route path="/doctor/appointments" element={<AppointmentList />} />
                <Route path="/doctor/medical-record/:appointmentId" element={<MedicalRecord />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
