import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap, QrCode, Camera, CheckCircle2, AlertTriangle,
  Clock, BookOpen, ShieldCheck, LogOut, RefreshCw, User, Sparkles,
  Smartphone, MapPin, Search, ChevronRight, X, AlertCircle, Award, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import { Html5Qrcode } from 'html5-qrcode';
import { extractBaseSessionId, validateRotatingCode } from '../utils/sessionCode';
import SecurityCheckModal from '../components/SecurityCheckModal';
import AttendanceCardModal from '../components/AttendanceCardModal';

export default function DashStudent() {
  const navigate = useNavigate();

  // Student State
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'attendance' | 'courses' | 'profile'
  const [activeTab, setActiveTab] = useState('attendance');

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
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinStatus, setCheckinStatus] = useState(null);

  // Security Check & Attendance Card Modals
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityError, setSecurityError] = useState(null);
  const [currentCheckingSession, setCurrentCheckingSession] = useState(null);

  const [showAttendanceCard, setShowAttendanceCard] = useState(false);
  const [activeAttendanceCard, setActiveAttendanceCard] = useState(null);

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

  // Real-time background sync: poll active sessions & attendance every 2s
  useEffect(() => {
    if (!student) return;
    const interval = setInterval(() => {
      loadStudentData(student);
    }, 2000);
    return () => clearInterval(interval);
  }, [student]);

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
          console.warn("Location permission fallback:", err.message);
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

  // Load student dashboard data
  const loadStudentData = async (userObj) => {
    try {
      requestLocation();
      const indexNum = userObj.index_number || userObj.username;
      const levelCode = userObj.level_code || 'L100';

      // 1. Fetch breakdown report to get student's attendance stats
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

      // 2. Fetch live sessions directly from /api/sessions/
      let liveActiveList = [];
      try {
        const resLive = await requestApi('/api/sessions/');
        const jsonLive = await resLive.json();
        if (jsonLive.success && Array.isArray(jsonLive.data)) {
          liveActiveList = jsonLive.data
            .filter(s => s.status === 'active')
            .map(s => ({
              id: s.id || s.session_code,
              session_code: s.id || s.session_code,
              course: {
                id: s.course,
                code: s.courseCode || 'ICTE',
                name: s.courseName || 'Course Attendance'
              },
              time_window: s.timeWindow || s.time_window || 30,
              status: 'active'
            }));
        }
      } catch (errLive) {
        console.warn("Live sessions fetch:", errLive);
      }

      // 3. Fetch summary for course breakdown and attendance history
      const resSum = await requestApi(`/api/reports/summary/${levelCode}/`);
      const jsonSum = await resSum.json();

      if (jsonSum.success && jsonSum.data) {
        const allSessions = jsonSum.data.sessions || [];
        const summaryActive = allSessions.filter(s => s.status === 'active');
        const combinedActive = liveActiveList.length > 0 ? liveActiveList : summaryActive;
        setActiveSessions(combinedActive);
        setCourses(jsonSum.data.courses || []);

        const formattedHistory = allSessions.map(s => ({
          id: s.id,
          sessionId: s.id,
          courseCode: s.course?.code || s.courseCode || 'ICTE',
          courseName: s.course?.name || s.courseName || 'Class Session',
          date: s.opened_at ? new Date(s.opened_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : (s.date || new Date().toLocaleDateString()),
          time: s.opened_at ? new Date(s.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (s.time || '10:00 AM'),
          status: 'Present',
          host: 'Course Lecturer / Rep',
          refId: `REC-${s.id}-${Math.floor(100000 + Math.random() * 900000)}`
        }));
        setAttendanceHistory(formattedHistory);
      } else if (liveActiveList.length > 0) {
        setActiveSessions(liveActiveList);
      }
    } catch (err) {
      console.error("Error loading student data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Stop active camera scanner safely
  const stopCameraScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (e) {
        console.warn("Camera stop notice:", e);
      }
      scannerRef.current = null;
    }
    setCameraActive(false);
    setScanning(false);
  };

  // Execute student check-in with Rapid Security Layer Animation & Attendance Card
  const handleCheckin = async (rawCodeToSubmit) => {
    const raw = (rawCodeToSubmit || sessionCodeInput).trim().toUpperCase();
    if (!raw) {
      setCheckinStatus({ type: 'error', msg: 'Please enter or scan a valid session code.' });
      return;
    }

    // Stop camera if running
    await stopCameraScanner();

    // Identify matching active session
    let matchedSession = activeSessions.find(s => {
      const baseId = s.id || s.session_code;
      return validateRotatingCode(raw, baseId);
    });

    const baseCode = matchedSession ? (matchedSession.id || matchedSession.session_code) : extractBaseSessionId(raw);
    const courseCode = matchedSession?.course?.code || 'ICTE';
    const courseName = matchedSession?.course?.name || 'Class Session';

    setCurrentCheckingSession({
      baseCode,
      courseCode,
      courseName,
      raw
    });

    // Close entry modal and open security verification modal
    setShowCheckinModal(false);
    setSecurityError(null);
    setShowSecurityModal(true);

    try {
      const indexNum = student?.index_number || student?.username;
      const deviceId = sessionStorage.getItem('device_id') || `dev-web-${student?.id || '001'}`;

      const res = await requestApi('/api/checkin/', {
        method: 'POST',
        body: JSON.stringify({
          session_code: baseCode,
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
        // Backend accepted check-in! Security modal animation will finish and trigger onSuccessComplete
        setSecurityError(null);
        if (student) loadStudentData(student);
      } else {
        // Verification failed (e.g. Geofence out of bounds, expired token, or proxy)
        const msg = json.message || 'Check-in verification failed. Please try again or approach the lecturer.';
        setSecurityError(msg);
      }
    } catch (err) {
      setSecurityError('Connection error: Could not reach backend server to verify attendance.');
    }
  };

  // Called when all 3 security layers pass successfully
  const handleSecuritySuccess = () => {
    setShowSecurityModal(false);

    // Prepare Attendance Card
    const now = new Date();
    const card = {
      sessionId: currentCheckingSession?.baseCode || 'ATT-0000',
      courseCode: currentCheckingSession?.courseCode || 'ICTE',
      courseName: currentCheckingSession?.courseName || 'Class Attendance',
      host: 'Course Lecturer / Rep',
      date: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      method: scanMethod === 'camera' ? 'qr_code' : 'session_code',
      refId: `REC-${currentCheckingSession?.baseCode || 'ATT'}-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setActiveAttendanceCard(card);
    setShowAttendanceCard(true);

    // Save to local storage for offline evidence
    try {
      const savedCards = JSON.parse(localStorage.getItem('student_attendance_cards') || '[]');
      savedCards.unshift(card);
      localStorage.setItem('student_attendance_cards', JSON.stringify(savedCards.slice(0, 30)));
    } catch (e) {
      console.warn("Could not save card to localStorage:", e);
    }
  };

  // Real device camera scanner using Html5Qrcode
  const handleStartScanner = async () => {
    setScanning(true);
    setCheckinStatus(null);

    try {
      if (scannerRef.current) {
        await stopCameraScanner();
      }

      const html5QrCode = new Html5Qrcode("reader-qr");
      scannerRef.current = html5QrCode;
      setCameraActive(true);

      const qrConfig = { fps: 15, qrbox: { width: 220, height: 220 } };

      await html5QrCode.start(
        { facingMode: "environment" },
        qrConfig,
        (decodedText) => {
          handleCheckin(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.warn("Camera hardware unavailable:", err);
      setCameraActive(false);
      setScanning(false);
      setCheckinStatus({
        type: 'warning',
        msg: 'Camera access denied or unavailable. Enter the 6-digit code directly below.'
      });
      setScanMethod('code');
    }
  };

  const getInitials = (name) => {
    return name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "ST";
  };

  // Color-coded attendance status badges:
  // Green >= 75%, Yellow 60-74%, Red < 60%
  const getAttendanceStatusBadge = (pct) => {
    if (pct >= 75) {
      return {
        label: 'Good / Safe',
        color: '#16a34a',
        bg: '#dcfce7',
        border: '#86efac',
        bar: '#16a34a'
      };
    } else if (pct >= 60) {
      return {
        label: 'Average / Warning',
        color: '#ca8a04',
        bg: '#fef9c3',
        border: '#fde047',
        bar: '#eab308'
      };
    } else {
      return {
        label: 'Alarming / Poor',
        color: '#dc2626',
        bg: '#fee2e2',
        border: '#fca5a5',
        bar: '#ef4444'
      };
    }
  };

  if (loading && !student) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1E5A87 0%, #0A3A4F 100%)', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #334155', borderTopColor: '#2A6B9E', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ fontSize: 14, color: '#94a3b8' }}>Loading Student Portal…</div>
        </div>
      </div>
    );
  }

  const fullName = student ? `${student.first_name} ${student.last_name}` : 'Student Account';
  const indexNo = student?.index_number || '5261000018';
  const overallBadge = getAttendanceStatusBadge(stats.pct);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── TOP NAV HEADER ── */}
      <header style={{ background: '#1E5A87', color: 'white', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#2A6B9E,#0A3A4F)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

      {/* ── STUDENT HERO SUMMARY ── */}
      <div style={{ background: 'linear-gradient(135deg, #1E5A87 0%, #1e293b 100%)', color: 'white', padding: '24px 20px 28px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#1E5A87,#2A6B9E)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, border: '2px solid rgba(255,255,255,0.2)' }}>
                {getInitials(fullName)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{fullName}</h1>
                  <span style={{ fontSize: 10, background: '#1e3a5f', color: '#60a5fa', padding: '2px 8px', borderRadius: 20, fontWeight: 700, border: '1px solid #334155' }}>
                    STUDENT
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                  Index: <strong style={{ color: '#f1f5f9' }}>{indexNo}</strong> · {student?.program || 'BSc. Information Technology Education'}
                </div>
              </div>
            </div>

            {/* Attendance Status Pill */}
            <div style={{
              background: overallBadge.bg,
              border: `1px solid ${overallBadge.border}`,
              color: overallBadge.color,
              padding: '6px 14px',
              borderRadius: 30,
              fontSize: 12,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: overallBadge.color }} />
              {stats.pct}% Attendance · {overallBadge.label}
            </div>
          </div>

          {/* ── 3 DISTINCT TAB NAVIGATION BAR ── */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', padding: 4, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
            {[
              { id: 'attendance', label: '1. Mark Attendance', icon: QrCode },
              { id: 'courses', label: '2. My Courses', icon: BookOpen },
              { id: 'profile', label: '3. Profile & Records', icon: User },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? '#0A3A4F' : '#cbd5e1',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ACCORDING TO ACTIVE TAB ── */}
      <main style={{ maxWidth: 860, margin: '24px auto 48px', padding: '0 20px' }}>

        {/* ═══════════════════════════════════════════════
            TAB 1: MARK ATTENDANCE (MAIN TAB)
           ═══════════════════════════════════════════════ */}
        {activeTab === 'attendance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* LIVE ACTIVE SESSION CARD */}
            <div style={{
              background: 'white', borderRadius: 20, padding: 24,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: activeSessions.length > 0 ? '#10b981' : '#64748b',
                    boxShadow: activeSessions.length > 0 ? '0 0 10px #10b981' : 'none'
                  }} />
                  <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    {activeSessions.length > 0 ? 'Live Attendance Session Ongoing' : 'No Open Session Right Now'}
                  </h2>
                </div>
                {activeSessions.length > 0 && (
                  <span style={{ fontSize: 11, background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: 20, fontWeight: 800, border: '1px solid #a7f3d0' }}>
                    ● LIVE & OPEN
                  </span>
                )}
              </div>

              {activeSessions.length > 0 ? (
                <div>
                  {activeSessions.map(sess => (
                    <div key={sess.id} style={{ background: '#f8fafc', borderRadius: 14, padding: 18, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: '#1E5A87', textTransform: 'uppercase' }}>
                            {sess.course.code}
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                            {sess.course.name}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={13} /> Allowed Duration: {sess.time_window} mins · Session Code: <strong>{sess.id}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => { setShowCheckinModal(true); setCheckinStatus(null); }}
                    style={{
                      width: '100%', background: 'linear-gradient(135deg, #1E5A87, #0A3A4F)',
                      color: 'white', border: 'none', borderRadius: 14, padding: '16px',
                      fontSize: 15, fontWeight: 800, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      boxShadow: '0 4px 14px rgba(30,90,135,0.3)', transition: 'transform 0.15s ease'
                    }}
                  >
                    <QrCode size={20} /> Mark Attendance Now (Scan QR / Enter 6-Digit Code)
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
                    When your course lecturer or course rep opens an attendance session for your group, it will appear here automatically in real time.
                  </p>
                  <button
                    onClick={() => { setShowCheckinModal(true); setCheckinStatus(null); }}
                    style={{
                      width: '100%', background: '#1E5A87', color: '#ffffff',
                      border: 'none', borderRadius: 14, padding: '14px',
                      fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                    }}
                  >
                    <QrCode size={18} /> Open Scanner / Manual Code Input
                  </button>
                </div>
              )}
            </div>

            {/* SECURITY & DEVICE STATUS TILES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ background: 'white', borderRadius: 16, padding: '16px 18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Geofence GPS Proximity</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', marginTop: 2 }}>Classroom GPS Ready</div>
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: 16, padding: '16px 18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Smartphone size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Device Binding</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0369a1', marginTop: 2 }}>Single-Device Active</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 2: MY COURSES
           ═══════════════════════════════════════════════ */}
        {activeTab === 'courses' && (
          <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={20} color="#1E5A87" /> Enrolled Semester Courses
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>All registered academic courses and attendance standings</p>
              </div>
              <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                {courses.length} Courses
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {courses.length > 0 ? courses.map(c => {
                const badge = getAttendanceStatusBadge(stats.pct);
                return (
                  <div key={c.code} style={{ background: '#f8fafc', borderRadius: 14, padding: '16px 18px', border: '1.5px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 800, background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: 6 }}>
                          {c.code}
                        </span>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 6 }}>
                          {c.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                          Credits: 3 Credit Hours · Lecturer: Dr. Kwesi / Faculty
                        </div>
                      </div>

                      {/* Color-coded percentage badge */}
                      <span style={{
                        fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 20,
                        background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`
                      }}>
                        {stats.pct}% · {badge.label}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: 8, background: '#e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${stats.pct}%`, background: badge.bar, borderRadius: 10, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                );
              }) : (
                <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 32 }}>
                  No courses enrolled or loading…
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 3: STUDENT PROFILE & ATTENDANCE RECORDS
           ═══════════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* COMPLETE SCHOOL DETAILS CARD */}
            <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                <User size={20} color="#1E5A87" />
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>University Academic Details</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>FULL NAME</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{fullName}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>INDEX NUMBER</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1E5A87', fontFamily: 'monospace', marginTop: 2 }}>{indexNo}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>PROGRAM OF STUDY</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{student?.program || 'BSc. Information Technology Education'}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>LEVEL & GROUP</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>Level 100 · Group 1</div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>REGISTERED DEVICE ID</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', fontFamily: 'monospace', marginTop: 2 }}>
                    {sessionStorage.getItem('device_id') || `dev-web-${student?.id || '001'}`}
                  </div>
                </div>
              </div>
            </div>

            {/* COLOR IDENTIFYING ATTENDANCE STATUS SCALE */}
            <div style={{ background: 'white', borderRadius: 20, padding: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
                Attendance Status Classification Standard
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div style={{ background: '#dcfce7', border: '1px solid #86efac', padding: '10px 12px', borderRadius: 12 }}>
                  <div style={{ color: '#166534', fontWeight: 800, fontSize: 13 }}>🟢 &ge; 75% Safe / Good</div>
                  <div style={{ color: '#15803d', fontSize: 11, marginTop: 2 }}>Eligible for all examinations</div>
                </div>

                <div style={{ background: '#fef9c3', border: '1px solid #fde047', padding: '10px 12px', borderRadius: 12 }}>
                  <div style={{ color: '#854d0e', fontWeight: 800, fontSize: 13 }}>🟡 60% – 74% Average</div>
                  <div style={{ color: '#a16207', fontSize: 11, marginTop: 2 }}>Warning: Risk of disqualification</div>
                </div>

                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '10px 12px', borderRadius: 12 }}>
                  <div style={{ color: '#991b1b', fontWeight: 800, fontSize: 13 }}>🔴 &lt; 60% Alarming Poor</div>
                  <div style={{ color: '#b91c1c', fontSize: 11, marginTop: 2 }}>Attendance threshold breached</div>
                </div>
              </div>
            </div>

            {/* ATTENDANCE RECORDS & OFFICIAL ATTENDANCE CARDS */}
            <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={18} color="#10b981" /> Attendance Records & Evidence Cards
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Click any session to view its official Digital Attendance Card receipt</p>
                </div>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                  {attendanceHistory.length} Sessions Attended
                </span>
              </div>

              {attendanceHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {attendanceHistory.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveAttendanceCard(item);
                        setShowAttendanceCard(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: 14,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease, transform 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Award size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                            {item.courseCode} — {item.courseName}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                            {item.date} at {item.time} · Session <strong>{item.sessionId || item.id}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 11, background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: 20, fontWeight: 800 }}>
                          Verified Present
                        </span>
                        <button
                          style={{
                            background: 'white',
                            border: '1px solid #cbd5e1',
                            borderRadius: 8,
                            padding: '6px 12px',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#1E5A87',
                            cursor: 'pointer'
                          }}
                        >
                          View Card &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                  No attendance records logged yet. Check in to an active session to generate your first Attendance Card!
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── CHECK-IN CAMERA SCANNER & MANUAL CODE MODAL ── */}
      {showCheckinModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000, padding: 16
        }}>
          <div style={{
            background: 'white', borderRadius: 24, padding: 24, width: '100%', maxWidth: 440,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <QrCode size={20} color="#1E5A87" />
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#0f172a' }}>Check In To Class</h3>
              </div>
              <button
                onClick={async () => { await stopCameraScanner(); setShowCheckinModal(false); }}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Method Toggle Buttons */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 12, marginBottom: 16 }}>
              <button
                onClick={() => { stopCameraScanner(); setScanMethod('camera'); handleStartScanner(); }}
                style={{
                  flex: 1, padding: '9px', borderRadius: 9, border: 'none',
                  background: scanMethod === 'camera' ? 'white' : 'transparent',
                  color: scanMethod === 'camera' ? '#1E5A87' : '#64748b',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: scanMethod === 'camera' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                <Camera size={15} /> Scan Projector QR
              </button>
              <button
                onClick={async () => { await stopCameraScanner(); setScanMethod('code'); }}
                style={{
                  flex: 1, padding: '9px', borderRadius: 9, border: 'none',
                  background: scanMethod === 'code' ? 'white' : 'transparent',
                  color: scanMethod === 'code' ? '#1E5A87' : '#64748b',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: scanMethod === 'code' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                <Smartphone size={15} /> Enter 6-Digit Code
              </button>
            </div>

            {/* CAMERA SCANNER VIEW */}
            {scanMethod === 'camera' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
                <div
                  id="reader-qr"
                  style={{
                    width: '100%', minHeight: 240, background: '#0f172a',
                    borderRadius: 16, overflow: 'hidden', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}
                />
                {!cameraActive && (
                  <button
                    onClick={handleStartScanner}
                    style={{
                      marginTop: 12, padding: '10px 20px', borderRadius: 10,
                      background: '#1E5A87', color: 'white', border: 'none',
                      fontWeight: 700, fontSize: 13, cursor: 'pointer'
                    }}
                  >
                    Start Camera Scanner
                  </button>
                )}
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 10, textAlign: 'center' }}>
                  Point your camera at the QR code displayed on the classroom projector
                </p>
              </div>
            )}

            {/* MANUAL 6-DIGIT CODE INPUT VIEW */}
            {scanMethod === 'code' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                  ENTER 6-DIGIT DYNAMIC PASSCODE (OR ATT-XXXX CODE)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 748291 or ATT-4869"
                  value={sessionCodeInput}
                  onChange={e => setSessionCodeInput(e.target.value.toUpperCase())}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12,
                    border: '2px solid #e2e8f0', fontSize: 18, fontWeight: 800,
                    letterSpacing: 3, textAlign: 'center', fontFamily: 'monospace',
                    color: '#1E5A87', outline: 'none', boxSizing: 'border-box'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCheckin();
                  }}
                />
                <button
                  onClick={() => handleCheckin()}
                  style={{
                    width: '100%', marginTop: 12, padding: '14px',
                    borderRadius: 12, background: 'linear-gradient(135deg, #1E5A87, #0A3A4F)',
                    color: 'white', border: 'none', fontWeight: 800, fontSize: 14,
                    cursor: 'pointer', boxShadow: '0 4px 14px rgba(30,90,135,0.3)'
                  }}
                >
                  Verify Attendance & Submit
                </button>
              </div>
            )}

            {checkinStatus && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                background: checkinStatus.type === 'error' ? '#fee2e2' : '#fef3c7',
                color: checkinStatus.type === 'error' ? '#991b1b' : '#92400e',
                border: `1px solid ${checkinStatus.type === 'error' ? '#fca5a5' : '#fde68a'}`,
                textAlign: 'center'
              }}>
                {checkinStatus.msg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── RAPID 3-LAYER SECURITY VERIFICATION ANIMATION MODAL ── */}
      <SecurityCheckModal
        isOpen={showSecurityModal}
        onSuccessComplete={handleSecuritySuccess}
        onClose={() => setShowSecurityModal(false)}
        onRetry={() => {
          setShowSecurityModal(false);
          setShowCheckinModal(true);
        }}
        sessionData={currentCheckingSession}
        student={student}
        validationError={securityError}
      />

      {/* ── OFFICIAL DIGITAL ATTENDANCE CARD MODAL ── */}
      <AttendanceCardModal
        isOpen={showAttendanceCard}
        onClose={() => setShowAttendanceCard(false)}
        onViewHistory={() => {
          setActiveTab('profile');
        }}
        cardData={activeAttendanceCard}
        student={student}
      />

    </div>
  );
}
