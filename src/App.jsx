import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/shared/ProtectedRoute';

import MainLayout from './layouts/MainLayout';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Landing from './pages/public/Landing';
import About from './pages/public/About';
import Features from './pages/public/Features';
import HowItWorks from './pages/public/HowItWorks';
import Contact from './pages/public/Contact';
import NotFound from './pages/public/NotFound';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import FacultyDashboard from './pages/faculty/FacultyDashboard';
import SmartAllocation from './pages/faculty/SmartAllocation';
import ExploreClassrooms from './pages/faculty/ExploreClassrooms';
import MyBookings from './pages/faculty/MyBookings';
import Timetable from './pages/faculty/Timetable';

import StudentDashboard from './pages/student/StudentDashboard';
import MyTimetable from './pages/student/MyTimetable';
import Venue from './pages/student/Venue';
import MyVenues from './pages/student/MyVenues';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageClassrooms from './pages/admin/ManageClassrooms';
import ManageBookings from './pages/admin/ManageBookings';
import ManageUsers from './pages/admin/ManageUsers';
import Maintenance from './pages/admin/Maintenance';
import Analytics from './pages/admin/Analytics';
import AdminTimetable from './pages/admin/AdminTimetable';

import Notifications from './pages/shared/Notifications';
import Settings from './pages/shared/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <MainLayout>
              <Routes>
                {/* Public */}
                {/* Landing is a standalone cover page — it renders its own navbar
                    and intentionally has no footer, so it's kept outside PublicLayout.
                    It still gets the global classroom background + theme from MainLayout. */}
                <Route path="/" element={<Landing />} />

                <Route element={<PublicLayout />}>
                  <Route path="/about" element={<About />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/contact" element={<Contact />} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Faculty */}
                <Route path="/faculty" element={<ProtectedRoute role="faculty"><DashboardLayout /></ProtectedRoute>}>
                  <Route path="dashboard" element={<FacultyDashboard />} />
                  <Route path="allocation" element={<SmartAllocation />} />
                  <Route path="explore" element={<ExploreClassrooms />} />
                  <Route path="bookings" element={<MyBookings />} />
                  <Route path="timetable" element={<Timetable />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Student */}
                <Route path="/student" element={<ProtectedRoute role="student"><DashboardLayout /></ProtectedRoute>}>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="timetable" element={<MyTimetable />} />
                  <Route path="venue" element={<Venue />} />
                  <Route path="my-venues" element={<MyVenues />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Admin */}
                <Route path="/admin" element={<ProtectedRoute role="admin"><DashboardLayout /></ProtectedRoute>}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="classrooms" element={<ManageClassrooms />} />
                  <Route path="bookings" element={<ManageBookings />} />
                  <Route path="timetable" element={<AdminTimetable />} />
                  <Route path="users" element={<ManageUsers />} />
                  <Route path="maintenance" element={<Maintenance />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              </MainLayout>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
