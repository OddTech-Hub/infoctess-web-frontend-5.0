import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { API_BASE_URL } from './api/config';

// Code-split pages so initial bundle is tiny and loads instantly
const GetStarted = React.lazy(() => import('./pages/GetStarted'));
const Login = React.lazy(() => import('./pages/Login'));
const Portal = React.lazy(() => import('./pages/Portal'));
const LecturerDashboard = React.lazy(() => import('./pages/DashLecturer'));
const CourseRepDashboard = React.lazy(() => import('./pages/DashRep'));
const StudentDashboard = React.lazy(() => import('./pages/DashStudent'));

function LoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0B2238',
      color: '#94a3b8',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#38bdf8',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc' }}>Smart Attendance</div>
      </div>
    </div>
  );
}

function AdminRedirect() {
  useEffect(() => {
    window.location.replace(`${API_BASE_URL}/admin/`);
  }, []);
  return <LoadingFallback />;
}

export default function App() {
  // Fire-and-forget backend pre-warm ping on app launch
  // Wakes up Heroku dyno in the background before the user even finishes typing credentials
  useEffect(() => {
    fetch(`${API_BASE_URL}/`, { mode: 'no-cors' }).catch(() => {});
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<GetStarted />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Login" element={<Navigate to="/login" replace />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/Portal" element={<Navigate to="/portal" replace />} />
            <Route path="/lec" element={<LecturerDashboard />} />
            <Route path="/rep" element={<CourseRepDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/admin" element={<AdminRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
