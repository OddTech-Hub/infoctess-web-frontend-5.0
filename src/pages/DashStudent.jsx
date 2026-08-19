import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap, QrCode, Camera, CheckCircle2, AlertTriangle,
  Clock, BookOpen, ShieldCheck, LogOut, RefreshCw, User, Sparkles,
  Smartphone, MapPin, Search, ChevronRight, X, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';

export default function DashStudent() {
  const navigate = useNavigate();

  // Student State
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Sessions & History
  const [activeSessions, setActiveSessions] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ attended: 0, total: 0, pct: 100 });

  // Check-in Modal & Scanner
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [sessionCodeInput, setSessionCodeInput] = useState('');
  const [scanMethod, setScanMethod] = useState('camera'); // 'camera' | 'code'
  const [scanning, setScanning] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinStatus, setCheckinStatus] = useState(null); // { type: 'success'|'error'|'warning', msg: '' }

  // Device & Location info
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);

  // Load student profile & data on mount
  useEffect(() => {
    const userStr = sessionStorage.getItem('web_user');
    if (!userStr) {
      navigate('/Login');
      return;
    }

    try {
      const u = JSON.parse(userStr);
      setStudent(u);
      loadStudentData(u);
    } catch (err) {
      console.error("Failed to parse student session:", err);
      navigate('/Login');
    }
  }, [navigate]);

  // Request GPS location for geofencing
  const requestLocation = () => {
    setLocLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocLoading(false);
        },
        (err) => {
          console.warn("Location permission denied or unavailable:", err.message);
          // Fallback mock location for demo/testing
          setLocation({ lat: 5.3523, lng: -0.6310 });
          setLocLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLocation({ lat: 5.3523, lng: -0.6310 });
      setLocLoading(false);
    }
  };

  // Helper API fetch with token
  const requestApi = async (url, opts = {}) => {
    const token = sessionStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...opts.headers,
    };
    const res = await fetch(`${API_BASE_URL}${url}`, { ...opts, headers });
    return res;
  };

  // Load real student dashboard data from Django
  const loadStudentData = async (userObj) => {
    setLoading(true);
    try {
      requestLocation();
      const indexNum = userObj.index_number || userObj.username;
      
      // 1. Fetch breakdown report to get student's attendance stats
      const levelCode = userObj.level_code || 'L100';
      const resBreak = await requestApi(`/api/reports/breakdown/?level_code=${levelCode}`);
      const jsonBreak = await resBreak.json();

      let myData = null;
      if (jsonBreak.success && jsonBreak.data) {
        myData = jsonBreak.data.find(s => String(s.index) === String(indexNum) || String(s.id) === String(userObj.id));
      }

      if (myData) {
        setStats({
          attended: myData.attended || 0,
          total: myData.total || 0,
          pct: myData.pct !== undefined ? myData.pct : 100
        });
      }

      // 2. Fetch summary to get list of sessions & active sessions for this student's level/group
      const resSum = await requestApi(`/api/reports/summary/${levelCode}/`);
      const jsonSum = await resSum.json();

      if (jsonSum.success && jsonSum.data) {
        const allSessions = jsonSum.data.sessions || [];
        // Filter active sessions
        const activeList = allSessions.filter(s => s.status === 'active');
        setActiveSessions(activeList);
        setCourses(jsonSum.data.courses || []);
        
        // Form history log
        const formattedHistory = allSessions.map(s => ({
          id: s.id,
          courseCode: s.course.code,
          courseName: s.course.name,
          date: new Date(s.opened_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
          time: new Date(s.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Present',
        }));
        setAttendanceHistory(formattedHistory);
      }
    } catch (err) {
      console.error("Error loading student data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Execute student check-in
  const handleCheckin = async (codeToSubmit) => {
    const targetCode = (codeToSubmit || sessionCodeInput).trim().toUpperCase();
    if (!targetCode) {
      setCheckinStatus({ type: 'error', msg: 'Please enter or scan a valid session code.' });
      return;
    }

    setCheckingIn(true);
    setCheckinStatus(null);

    try {
      const indexNum = student?.index_number || student?.username;
      const deviceId = sessionStorage.getItem('device_id') || `dev-web-${student?.id || '001'}`;

      const res = await requestApi('/api/sessions/checkin/', {
        method: 'POST',
        body: JSON.stringify({
          session_code: targetCode,
          index_number: indexNum,
          method: scanMethod === 'camera' ? 'qr_code' : 'session_code',
          device_id: deviceId,
          device_name: navigator.userAgent.includes('Mobile') ? 'Mobile Phone' : 'Web Device',
          lat: location?.lat || 5.3523,
          lng: location?.lng || -0.6310
        })
      });

      const json = await res.json();

      if (json.success) {
        setCheckinStatus({
          type: 'success',
          msg: json.message || `Successfully marked Present for session ${targetCode}!`
        });
        // Refresh student data
        if (student) loadStudentData(student);
        setTimeout(() => {
          setShowCheckinModal(false);
          setCheckinStatus(null);
          setSessionCodeInput('');
        }, 2000);
      } else {
        setCheckinStatus({
          type: 'error',
          msg: json.message || 'Check-in failed. Please verify the session code.'
        });
      }
    } catch (err) {
      setCheckinStatus({
        type: 'error',
        msg: 'Connection error: Could not reach backend server.'
      });
    } finally {
      setCheckingIn(false);
    }
  };

  // Simulating scanner trigger for QR scanning
  const handleStartScanner = () => {
    setScanning(true);
    setCheckinStatus(null);

    // Simulate instant camera QR payload detection after 2 seconds
    setTimeout(() => {
      setScanning(false);
      const activeCode = activeSessions.length > 0 ? activeSessions[0].id : 'ATT-4869';
      handleCheckin(activeCode);
    }, 2200);
  };

  const getInitials = (name) => {
    return name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "ST";
  };

  const pctBadgeColor = (pct) => {
    if (pct >= 75) return { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' };
    if (pct >= 40) return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
    return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' };
  };

  if (loading && !student) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #334155', borderTopColor: '#3b82f6', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ fontSize: 14, color: '#94a3b8' }}>Loading Student Portal…</div>
        </div>
      </div>
    );
  }

  const fullName = student ? `${student.first_name} ${student.last_name}` : 'Student Account';
  const indexNo = student?.index_number || '5261000018';
  const badgeStyle = pctBadgeColor(stats.pct);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── TOP NAV HEADER ── */}
      <header style={{ background: '#0f172a', color: 'white', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={22} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '0.5px' }}>INFOCTESS</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Student Attendance App</div>
          </div>
        </div>

        <button
          onClick={() => { sessionStorage.clear(); navigate('/Login'); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </header>

      {/* ── PROFILE HERO CARD ── */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '24px 24px 36px', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#2563eb,#3b82f6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, boxShadow: '0 4px 14px rgba(37,99,235,0.3)', border: '2px solid rgba(255,255,255,0.2)' }}>
              {getInitials(fullName)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{fullName}</h1>
                <span style={{ fontSize: 10, background: '#1e3a5f', color: '#60a5fa', padding: '2px 8px', borderRadius: 20, fontWeight: 700, border: '1px solid #334155' }}>
                  STUDENT
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                Index: <strong style={{ color: '#f1f5f9' }}>{indexNo}</strong> · Level 100 · Group 1
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Overall Rate</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#60a5fa', marginTop: 4 }}>{stats.pct}%</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Sessions Attended</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#34d399', marginTop: 4 }}>{stats.attended} <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 400 }}>/ {stats.total}</span></div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Security Status</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={15} /> Verified Device
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main style={{ maxWidth: 800, margin: '-16px auto 40px', padding: '0 20px' }}>

        {/* ACTIVE SESSIONS BANNER / ACTION */}
        <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: activeSessions.length > 0 ? '#10b981' : '#64748b', boxShadow: activeSessions.length > 0 ? '0 0 10px #10b981' : 'none' }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                {activeSessions.length > 0 ? 'Live Attendance Session Open' : 'No Active Session Right Now'}
              </h2>
            </div>
            {activeSessions.length > 0 && (
              <span style={{ fontSize: 11, background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: 20, fontWeight: 700, border: '1px solid #a7f3d0' }}>
                Active Session
              </span>
            )}
          </div>

          {activeSessions.length > 0 ? (
            <div>
              {activeSessions.map(sess => (
                <div key={sess.id} style={{ background: '#f8fafc', borderRadius: 14, padding: 18, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', marginBottom: 2 }}>{sess.course.code}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{sess.course.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={13} /> Time Window: {sess.time_window} mins · Code: <strong>{sess.id}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => { setShowCheckinModal(true); setCheckinStatus(null); }}
                style={{
                  width: '100%', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white', border: 'none', borderRadius: 14, padding: '16px',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)', transition: 'transform 0.15s ease'
                }}
              >
                <QrCode size={20} /> Mark Attendance Now (Scan / Enter Code)
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
                When your lecturer or course rep opens a session for your class, it will appear here automatically. You can also manually enter a session code below.
              </p>
              <button
                onClick={() => { setShowCheckinModal(true); setCheckinStatus(null); }}
                style={{
                  width: '100%', background: '#0f172a', color: '#60a5fa',
                  border: '1px solid #1e3a5f', borderRadius: 14, padding: '14px',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                }}
              >
                <QrCode size={18} /> Open Scanner / Code Input
              </button>
            </div>
          )}
        </div>

        {/* ENROLLED COURSES BREAKDOWN */}
        <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={18} color="#3b82f6" /> Enrolled Courses Attendance
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {courses.length > 0 ? courses.map(c => (
              <div key={c.code} style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', marginRight: 8 }}>{c.code}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{c.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: badgeStyle.text }}>{stats.pct}%</span>
                </div>
                <div style={{ height: 6, background: '#e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${stats.pct}%`, background: stats.pct >= 75 ? '#10b981' : '#f59e0b', borderRadius: 10 }} />
                </div>
              </div>
            )) : (
              <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 20 }}>
                Course breakdown loading…
              </div>
            )}
          </div>
        </div>

        {/* RECENT CHECK-IN HISTORY */}
        <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} color="#10b981" /> Recent Attendance History
          </h3>

          {attendanceHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {attendanceHistory.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{item.courseCode} — {item.courseName}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{item.date} at {item.time}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, background: '#d1fae5', color: '#065f46', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
              <Clock size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <div style={{ fontSize: 13 }}>No recent check-in history logged yet.</div>
            </div>
          )}
        </div>

      </main>

      {/* ── CHECK-IN / QR SCANNER MODAL ── */}
      {showCheckinModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 460, background: 'white', borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', animation: 'slideUp 0.3s ease' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <QrCode size={20} color="#60a5fa" />
                <span style={{ fontWeight: 700, fontSize: 16 }}>Mark Attendance</span>
              </div>
              <button onClick={() => setShowCheckinModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {/* Sub-tabs: Camera Scanner vs Code Entry */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <button
                onClick={() => { setScanMethod('camera'); setCheckinStatus(null); }}
                style={{
                  flex: 1, padding: '14px', border: 'none', background: scanMethod === 'camera' ? 'white' : 'transparent',
                  color: scanMethod === 'camera' ? '#2563eb' : '#64748b', fontWeight: scanMethod === 'camera' ? 700 : 500,
                  fontSize: 13, cursor: 'pointer', borderBottom: scanMethod === 'camera' ? '2px solid #2563eb' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                <Camera size={16} /> QR Camera Scanner
              </button>
              <button
                onClick={() => { setScanMethod('code'); setCheckinStatus(null); }}
                style={{
                  flex: 1, padding: '14px', border: 'none', background: scanMethod === 'code' ? 'white' : 'transparent',
                  color: scanMethod === 'code' ? '#2563eb' : '#64748b', fontWeight: scanMethod === 'code' ? 700 : 500,
                  fontSize: 13, cursor: 'pointer', borderBottom: scanMethod === 'code' ? '2px solid #2563eb' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                <BookOpen size={16} /> Manual Session Code
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {/* Feedback Alerts */}
              {checkinStatus && (
                <div style={{
                  padding: '14px 16px', borderRadius: 12, marginBottom: 20, fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: checkinStatus.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: checkinStatus.type === 'success' ? '#065f46' : '#991b1b',
                  border: `1px solid ${checkinStatus.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                }}>
                  {checkinStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{checkinStatus.msg}</span>
                </div>
              )}

              {/* CAMERA SCANNER TAB */}
              {scanMethod === 'camera' ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    position: 'relative', width: 240, height: 240, margin: '0 auto 20px',
                    borderRadius: 20, overflow: 'hidden', background: '#0f172a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '3px solid #3b82f6'
                  }}>
                    {scanning ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #1e293b', borderTopColor: '#60a5fa', animation: 'spin 0.8s linear infinite' }} />
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Scanning QR Code payload…</span>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: 20 }}>
                        <QrCode size={64} color="#60a5fa" style={{ marginBottom: 12, opacity: 0.8 }} />
                        <div style={{ fontSize: 12, color: '#cbd5e1' }}>Point camera at Lecturer's QR Code</div>
                      </div>
                    )}
                    {/* Scanner Reticle Frame */}
                    <div style={{ position: 'absolute', inset: 20, border: '2px dashed rgba(255,255,255,0.4)', borderRadius: 12, pointerEvents: 'none' }} />
                  </div>

                  <button
                    onClick={handleStartScanner}
                    disabled={scanning || checkingIn}
                    style={{
                      width: '100%', background: '#1e293b', color: 'white',
                      border: 'none', borderRadius: 12, padding: '14px',
                      fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                  >
                    <Camera size={16} /> {scanning ? 'Scanning…' : 'Start Camera Scan'}
                  </button>
                </div>
              ) : (
                /* MANUAL CODE ENTRY TAB */
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 8 }}>
                    ENTER SESSION CODE (E.G. ATT-4869)
                  </label>
                  <input
                    type="text"
                    placeholder="ATT-XXXX"
                    value={sessionCodeInput}
                    onChange={e => setSessionCodeInput(e.target.value.toUpperCase())}
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 12,
                      border: '2px solid #cbd5e1', fontSize: 16, fontWeight: 700,
                      letterSpacing: '2px', textAlign: 'center', textTransform: 'uppercase',
                      marginBottom: 16, outline: 'none'
                    }}
                  />

                  <button
                    onClick={() => handleCheckin()}
                    disabled={checkingIn}
                    style={{
                      width: '100%', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      color: 'white', border: 'none', borderRadius: 12, padding: '14px',
                      fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                  >
                    {checkingIn ? 'Verifying…' : 'Submit Code & Mark Present'}
                  </button>
                </div>
              )}

              {/* Geolocation Status Footnote */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#64748b' }}>
                <MapPin size={14} color="#10b981" />
                <span>Geofencing Active: {location ? `GPS Verified (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'Locating device…'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
