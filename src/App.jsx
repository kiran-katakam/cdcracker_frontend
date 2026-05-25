import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTopBtn from './components/ScrollToTopBtn';

import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import AssessmentPage from './pages/AssessmentPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/courses" element={<HomePage />} />
              <Route path="/courses/:courseId" element={<CoursePage />} />
              <Route path="/courses/:courseId/assessments/:assessmentId" element={<AssessmentPage />} />

              {/* Legal */}
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
          <ScrollToTopBtn />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
