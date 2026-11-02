import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GetStarted from './pages/GetStarted';
import Login from './pages/Login';
import LecturerDashboard from './pages/DashLecturer';
import CourseRepDashboard from './pages/DashRep';
import AdminPanel from './pages/AdminPanel';

// ── Auth Guard Component ──────────────────────────────────────────
function ProtectedRoute({ children, allowedRole }) {
  const user = sessionStorage.getItem('web_user');
  const role = sessionStorage.getItem('role');

  if (!user || !role) {
    // If not logged in, redirect to login page immediately
    return <Navigate to="/Login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // If logged in with wrong role (e.g. rep trying to access lecturer portal), redirect to login
    return <Navigate to="/Login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GetStarted/>} />
        <Route path="/Login" element={<Login />} />
        
        {/* Protected Lecturer Route */}
        <Route 
          path="/lec" 
          element={
            <ProtectedRoute allowedRole="lecturer">
              <LecturerDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Course Rep Route */}
        <Route 
          path="/rep" 
          element={
            <ProtectedRoute allowedRole="course_rep">
              <CourseRepDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin Portal (Protected internally by Passcode Gate) */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}
