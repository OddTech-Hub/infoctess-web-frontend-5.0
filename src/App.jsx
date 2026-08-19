import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GetStarted from './pages/GetStarted';
import Login from './pages/Login';
import LecturerDashboard from './pages/DashLecturer';
import CourseRepDashboard from './pages/DashRep';
import StudentDashboard from './pages/DashStudent';
import { API_BASE_URL } from './api/config';

function AdminRedirect() {
  useEffect(() => {
    window.location.replace(`${API_BASE_URL}/admin/`);
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GetStarted/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/Login" element={<Navigate to="/login" replace />} />
        <Route path="/lec" element={<LecturerDashboard />} />
        <Route path="/rep" element={<CourseRepDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/admin" element={<AdminRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

