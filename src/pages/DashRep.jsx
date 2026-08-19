import { useState, useEffect, useRef, useCallback } from "react";
import {
  QrCode, Users, Trash2, Plus, Eye, Clock, CheckCircle,
  LayoutDashboard, LogOut, PanelLeftClose, PanelLeftOpen,
  GraduationCap, ChevronDown, X, Smartphone, Hash,
  UserCheck, AlertCircle, Wifi, Shield, Download, FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { request } from "../api/client";

// ─── STATIC DATA FALLBACK ───────────────────────────────────────────────────

const MY_COURSES = [
  { code: "ICTE125", name: "Multimedia Authoring in Education" },
  { code: "ICTW123", name: "Fundamentals of Computer Programming" },
  { code: "ICTS201", name: "Systems Analysis and Design" },
  { code: "ICTD310", name: "Database Management Systems" },
];

const INITIAL_SESSIONS = [
  {
    id: "ATT-4869", course: "ICTE125", courseName: "Multimedia Authoring in Education",
    date: "6/2/2026", checkins: 2, status: "closed", timeWindow: 10,
    students: [
      { name: "Alberta Klokpa",   index: "5261000018", method: "QR Code",      time: "2:48:13 PM", avatar: "AK" },
      { name: "Emmanuel Oduro",   index: "5261000215", method: "Session Code",  time: "2:49:01 PM", avatar: "EO" },
    ]
  },
];

// Simulated students who can "walk in" during a live session
const WALK_IN_POOL = [
  { name: "Alberta Klokpa",    index: "5261000018", method: "QR Code",     avatar: "AK" },
  { name: "Daniel Amoh",       index: "5261000667", method: "Session Code", avatar: "DA" },
  { name: "Emmanuel Oduro",    index: "5261000215", method: "QR Code",     avatar: "EO" },
  { name: "Emmanuel Twumasi",  index: "5261000267", method: "Session Code", avatar: "ET" },
  { name: "Heis Boateng",      index: "5261000323",  method: "QR Code",     avatar: "HB" },
  { name: "Nimako Joe",        index: "5261000334", method: "Session Code", avatar: "NJ" },
  { name: "Osie Eugen Bonu",   index: "5261000660", method: "QR Code",     avatar: "OB" },
  { name: "Sandra Mensah",     index: "5261000712", method: "Session Code", avatar: "SM" },
];

// ─── QR VISUAL ───────────────────────────────────────────────────────────────

function QRVisual({ code, size = 200 }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const payload = `infoctess://session/${code || 'ATT-0000'}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${encodeURIComponent(payload)}&margin=10`;

  if (imgError) {
    const matrixSize = 21;
    const cellSize = size / matrixSize;
    
    const hash = (r, c) => {
      let val = 0;
      const str = `${code}-${r}-${c}`;
      for (let i = 0; i < str.length; i++) {
        val = (val << 5) - val + str.charCodeAt(i);
        val |= 0;
      }
      return Math.abs(val) % 2 === 0;
    };

    const isFinder = (r, c) => {
      if (r < 7 && c < 7) return true;
      if (r < 7 && c >= 14) return true;
      if (r >= 14 && c < 7) return true;
      return false;
    };

    const isTiming = (r, c) => {
      if (r === 6 && c >= 7 && c < 14) return true;
      if (c === 6 && r >= 7 && r < 14) return true;
      return false;
    };

    const isAlignment = (r, c) => {
      return r >= 14 && r <= 18 && c >= 14 && c <= 18;
    };

    const cells = [];
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (!isFinder(r, c) && !isTiming(r, c) && !isAlignment(r, c)) {
          if (hash(r, c)) cells.push([r, c]);
        }
      }
    }

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", borderRadius: 8, background: "#ffffff" }}>
        <rect width={size} height={size} fill="white" />
        <rect x={0} y={0} width={7 * cellSize} height={7 * cellSize} fill="#0f172a" rx={cellSize} />
        <rect x={cellSize} y={cellSize} width={5 * cellSize} height={5 * cellSize} fill="white" rx={cellSize * 0.5} />
        <rect x={2 * cellSize} y={2 * cellSize} width={3 * cellSize} height={3 * cellSize} fill="#0f172a" rx={cellSize * 0.5} />

        <rect x={14 * cellSize} y={0} width={7 * cellSize} height={7 * cellSize} fill="#0f172a" rx={cellSize} />
        <rect x={15 * cellSize} y={cellSize} width={5 * cellSize} height={5 * cellSize} fill="white" rx={cellSize * 0.5} />
        <rect x={16 * cellSize} y={2 * cellSize} width={3 * cellSize} height={3 * cellSize} fill="#0f172a" rx={cellSize * 0.5} />

        <rect x={0} y={14 * cellSize} width={7 * cellSize} height={7 * cellSize} fill="#0f172a" rx={cellSize} />
        <rect x={cellSize} y={15 * cellSize} width={5 * cellSize} height={5 * cellSize} fill="white" rx={cellSize * 0.5} />
        <rect x={2 * cellSize} y={16 * cellSize} width={3 * cellSize} height={3 * cellSize} fill="#0f172a" rx={cellSize * 0.5} />

        <rect x={14 * cellSize} y={14 * cellSize} width={5 * cellSize} height={5 * cellSize} fill="#0f172a" rx={cellSize * 0.5} />
        <rect x={15 * cellSize} y={15 * cellSize} width={3 * cellSize} height={3 * cellSize} fill="white" rx={cellSize * 0.3} />
        <rect x={16 * cellSize} y={16 * cellSize} width={1 * cellSize} height={1 * cellSize} fill="#0f172a" rx={cellSize * 0.2} />

        {[7, 9, 11, 13].map(i => (
          <rect key={`th-${i}`} x={i * cellSize} y={6 * cellSize} width={cellSize} height={cellSize} fill="#0f172a" />
        ))}
        {[7, 9, 11, 13].map(i => (
          <rect key={`tv-${i}`} x={6 * cellSize} y={i * cellSize} width={cellSize} height={cellSize} fill="#0f172a" />
        ))}

        {cells.map(([r, c], i) => (
          <rect key={`cell-${i}`} x={c * cellSize + 0.5} y={r * cellSize + 0.5} width={cellSize - 0.8} height={cellSize - 0.8} fill="#0f172a" rx={1} />
        ))}
      </svg>
    );
  }

  return (
    <div style={{ width: size, height: size, position: "relative", borderRadius: 12, overflow: "hidden", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {!imgLoaded && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2.5px solid #3b82f6", borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
        </div>
      )}
      <img
        src={qrApiUrl}
        alt={`QR Code ${code}`}
        onLoad={() => setImgLoaded(true)}
        onError={() => setImgError(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          opacity: imgLoaded ? 1 : 0,
          transition: "opacity 0.2s ease"
        }}
      />
    </div>
  );
}

// ─── AVATAR ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  ["#1e3a5f","#60a5fa"], ["#14532d","#4ade80"],
  ["#7c2d12","#fb923c"], ["#4a044e","#e879f9"],
  ["#1e1b4b","#818cf8"], ["#064e3b","#34d399"],
];

function Avatar({ initials, idx = 0, size = 36 }) {
  const [bg, fg] = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color: fg, display: "flex",
      alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 800, flexShrink: 0,
      border: `2px solid ${fg}33`
    }}>{initials}</div>
  );
}

// ─── PDF EXPORT HELPER ────────────────────────────────────────────────────────

function downloadSessionPDF(session) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to download the attendance PDF report.");
    return;
  }

  const studentsList = session.students || [];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>INFOCTESS Attendance Report - ${session.id || session.session_code}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
        .title { font-size: 26px; font-weight: 800; color: #1e3a5f; margin: 0; }
        .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; font-weight: 600; }
        .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; background: #f8fafc; padding: 18px; border-radius: 10px; margin-bottom: 28px; border: 1px solid #e2e8f0; }
        .meta-item { font-size: 12px; }
        .meta-label { color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 11px; margin-bottom: 4px; }
        .meta-val { font-size: 15px; font-weight: 800; color: #0f172a; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #1e3a5f; color: white; text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; }
        tr:nth-child(even) { background: #f8fafc; }
        .badge-present { background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 11px; display: inline-block; }
        .footer { margin-top: 50px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title">🎓 INFOCTESS UEW</div>
          <div class="subtitle">Department of ICT Education — Official Attendance Sheet</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 20px; font-weight: 900; color: #2563eb;">${session.id || session.session_code}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Date: ${session.date || new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <div class="meta-label">Course Code</div>
          <div class="meta-val">${session.courseCode || session.course || 'ICTE'}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Course Name</div>
          <div class="meta-val">${session.courseName || 'Multimedia Authoring'}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Session Status</div>
          <div class="meta-val" style="color: #16a34a;">${(session.status || 'ACTIVE').toUpperCase()}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Total Verified Present</div>
          <div class="meta-val" style="color: #2563eb;">${studentsList.length} Students</div>
        </div>
      </div>

      <h3 style="font-size: 16px; color: #0f172a; margin-bottom: 8px;">Checked-In Students Roster</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Student Name</th>
            <th>Index Number</th>
            <th>Check-in Time</th>
            <th>Check-in Method</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${studentsList.length > 0 ? studentsList.map((st, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td style="font-weight: 700; color: #0f172a;">${st.name}</td>
              <td>${st.index}</td>
              <td>${st.time || 'N/A'}</td>
              <td>${st.method || 'Session Code'}</td>
              <td><span class="badge-present">PRESENT</span></td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">No student check-ins recorded for this session.</td>
            </tr>
          `}
        </tbody>
      </table>

      <div class="footer">
        Generated on ${new Date().toLocaleString()} · INFOCTESS Smart Attendance Management System · UEW
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function CourseRepDashboard() {
  const navigate = useNavigate();
  const [tab, setTab]             = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions]   = useState(INITIAL_SESSIONS);
  const [courses, setCourses]     = useState(MY_COURSES);
  const [selectedCourse, setSelectedCourse] = useState(MY_COURSES[0].code);
  const [timeWindow, setTimeWindow] = useState("10");
  const [loading, setLoading]     = useState(true);

  // Rep user details
  const [repName, setRepName]     = useState("Course Representative");
  const [repEmail, setRepEmail]   = useState("");

  // Active session state
  const [activeSession, setActiveSession] = useState(null);
  const [showModal, setShowModal]  = useState(false);
  const [newCheckin, setNewCheckin] = useState(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Students tab
  const [studentSearch, setStudentSearch] = useState("");
  const [checkedInStudents, setCheckedInStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const timerRef = useRef(null);

  const getInitials = (name) => {
    return name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "CR";
  };

  const fetchSessions = useCallback(async () => {
    try {
      const res = await request("/api/sessions/");
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        const formattedSessions = json.data.map(s => ({
          id: s.id || s.session_code,
          course: s.courseCode || (s.course && typeof s.course === "object" ? s.course.code : "ICTE"),
          courseName: s.courseName || (s.course && typeof s.course === "object" ? s.course.name : "Attendance Session"),
          date: s.date || new Date().toLocaleDateString(),
          timeWindow: s.timeWindow || s.time_window || 10,
          status: s.status || "active",
          checkins: typeof s.checkins === "number" ? s.checkins : (s.students ? s.students.length : 0),
          students: s.students || []
        }));

        setSessions(formattedSessions);

        const active = json.data.find(s => s.status === "active");
        if (active) {
          const activeId = active.id || active.session_code;
          const resDet = await request(`/api/sessions/${activeId}/`);
          const jsonDet = await resDet.json();
          let studentsList = [];

          if (jsonDet.success && jsonDet.data) {
            const dataObj = jsonDet.data;
            if (Array.isArray(dataObj.students)) {
              studentsList = dataObj.students;
            } else if (Array.isArray(dataObj.records)) {
              studentsList = dataObj.records.map(c => ({
                name: c.student ? `${c.student.first_name} ${c.student.last_name}` : (c.name || "Student"),
                index: c.student ? c.student.index_number : (c.index || ""),
                method: c.method === "qr_code" ? "QR Code" : "Session Code",
                time: c.checked_in_at ? new Date(c.checked_in_at).toLocaleTimeString() : (c.time || "Just now"),
                avatar: getInitials(c.student ? `${c.student.first_name} ${c.student.last_name}` : (c.name || "ST"))
              }));
            }
          }

          setActiveSession({
            id: activeId,
            course: active.courseCode || (active.course && typeof active.course === "object" ? active.course.code : "ICTE"),
            courseName: active.courseName || (active.course && typeof active.course === "object" ? active.course.name : "Attendance Session"),
            date: active.date || new Date().toLocaleDateString(),
            checkins: studentsList.length,
            status: active.status,
            timeWindow: active.timeWindow || active.time_window || 10,
            students: studentsList,
            countdown: (active.timeWindow || 10) * 60
          });
          setShowModal(true);
        } else {
          setActiveSession(null);
        }
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  }, []);

  const fetchCheckedInStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const res = await request("/api/reports/breakdown/");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map(s => ({
          name: s.name,
          index: s.index,
          method: "QR Code",
          sessions: s.attended,
          time: `Latest: ${s.pct}% rate`,
          avatar: getInitials(s.name)
        }));
        setCheckedInStudents(mapped);
      }
    } catch (err) {
      console.error("Error fetching student breakdown:", err);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const refreshSessions = useCallback(() => {
    fetchSessions();
    if (tab === "students") {
      fetchCheckedInStudents();
    }
  }, [tab, fetchSessions, fetchCheckedInStudents]);

  useEffect(() => {
    const raw = sessionStorage.getItem("web_user");
    if (!raw) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const u = JSON.parse(raw);
      setRepName(`${u.first_name || "Course"} ${u.last_name || "Rep"}`);
      setRepEmail(u.email || "");
    } catch (e) {
      console.error(e);
    }

    async function init() {
      setLoading(true);
      try {
        const res = await request("/api/courses/");
        if (res.status === 401) {
          sessionStorage.clear();
          navigate("/login", { replace: true });
          return;
        }
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCourses(json.data);
          setSelectedCourse(json.data[0].code);
        }
        await fetchSessions();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [fetchSessions, navigate]);

  useEffect(() => {
    if (tab === "students") {
      fetchCheckedInStudents();
    }
  }, [tab, fetchCheckedInStudents]);

  // ── REAL-TIME BACKGROUND SYNC WITH MOBILE APP CHECKINS (Every 2.5s) ──
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchSessions();
      if (tab === "students") {
        fetchCheckedInStudents();
      }
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [fetchSessions, fetchCheckedInStudents, tab]);

  const closeSession = async () => {
    if (activeSession) {
      try {
        await request(`/api/sessions/${activeSession.id}/close/`, { method: "POST" });
      } catch (e) {
        console.error(e);
      }
    }
    setActiveSession(null);
    setShowModal(false);
    fetchSessions();
  };

  const openSession = async () => {
    if (!selectedCourse) return;
    try {
      const res = await request("/api/sessions/create/", {
        method: "POST",
        body: JSON.stringify({
          course_id: selectedCourse,
          time_window: timeWindow
        })
      });
      const json = await res.json();
      if (json.success) {
        setActiveSession({
          id: json.data.id,
          course: selectedCourse,
          courseName: courses.find(c => c.code === selectedCourse)?.name || selectedCourse,
          date: new Date().toLocaleDateString(),
          checkins: 0,
          status: "active",
          timeWindow: parseInt(timeWindow),
          students: [],
          countdown: parseInt(timeWindow) * 60
        });
        setShowModal(true);
        fetchSessions();
      } else {
        alert(json.message || "Failed to create session");
      }
    } catch (e) {
      alert("Failed to create session: " + e.message);
    }
  };

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const totalCheckins = sessions.reduce((acc, s) => acc + (s.checkins || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter','Segoe UI',sans-serif", display: "flex" }}>
      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sidebarOpen ? 260 : 72, background: "#0f172a", color: "white",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)", flexShrink: 0,
        display: "flex", flexDirection: "column", zIndex: 50
      }}>
        <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1e293b" }}>
          {sidebarOpen && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#2563eb,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <QrCode size={18} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: 0.5 }}>INFOTESS</div>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>REP PORTAL</div>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(v => !v)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4 }}>
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>

        <nav style={{ padding: "16px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "sessions", label: "Sessions", icon: QrCode },
            { id: "students", label: "Students Roster", icon: Users },
          ].map(item => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button key={item.id} onClick={() => setTab(item.id)} style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%",
                padding: "10px 14px", borderRadius: 8, border: "none",
                background: active ? "linear-gradient(135deg,#1d4ed8,#2563eb)" : "transparent",
                color: active ? "white" : "#94a3b8", fontWeight: active ? 600 : 500, fontSize: 13,
                cursor: "pointer", textAlign: "left"
              }}>
                <Icon size={18} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: 16, borderTop: "1px solid #1e293b" }}>
          {sidebarOpen ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar initials={getInitials(repName)} size={36} />
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{repName}</div>
                <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{repEmail}</div>
              </div>
              <button onClick={() => { sessionStorage.clear(); navigate("/login"); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 4 }}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => { sessionStorage.clear(); navigate("/login"); }} style={{ width: "100%", background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", justifyContent: "center" }}>
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, overflowY: "auto", padding: 32 }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Course Representative Portal</h1>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Create and manage live attendance check-in sessions for your group.</p>
          </div>
          <button onClick={openSession} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
            borderRadius: 10, background: "linear-gradient(135deg,#1d4ed8,#2563eb)",
            color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer",
            boxShadow: "0 4px 12px rgba(37,99,235,0.25)"
          }}>
            <Plus size={16} /> Open QR Session
          </button>
        </header>

        {/* SUMMARY CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Sessions", val: sessions.length, icon: QrCode, color: "#3b82f6", bg: "#eff6ff" },
            { label: "Total Check-ins", val: totalCheckins, icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" },
            { label: "Active Courses", val: courses.length, icon: GraduationCap, color: "#8b5cf6", bg: "#f5f3ff" },
          ].map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} style={{ background: "white", padding: 20, borderRadius: 14, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: card.bg, color: card.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{card.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{card.val}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* TAB CONTENT */}
        {tab === "dashboard" && (
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: "#0f172a" }}>Recent Attendance Sessions</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                  {["Session ID", "Course", "Date", "Check-ins", "Status"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#1e293b" }}>{s.id}</td>
                    <td style={{ padding: "12px 16px" }}>{s.course} — {s.courseName}</td>
                    <td style={{ padding: "12px 16px", color: "#64748b" }}>{s.date}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700 }}>{s.checkins}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: s.status === "active" ? "#dcfce7" : "#f1f5f9",
                        color: s.status === "active" ? "#15803d" : "#64748b"
                      }}>
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "students" && (
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: "#0f172a" }}>Student Attendance Roster</h3>
            {loadingStudents ? (
              <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Loading student records...</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                    {["Student Name", "Index Number", "Attended Sessions", "Attendance Status"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {checkedInStudents.map((st, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar initials={st.avatar} idx={i} size={30} />
                        {st.name}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#64748b" }}>{st.index}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 700 }}>{st.sessions}</td>
                      <td style={{ padding: "12px 16px", color: "#10b981", fontWeight: 600 }}>{st.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* ACTIVE QR MODAL WITH REAL-TIME CHECKIN FEED & PDF EXPORT */}
      {showModal && activeSession && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20
        }}>
          <div style={{
            background: "white", borderRadius: 24, padding: 32, width: 840, maxWidth: "95%",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 32
          }}>
            {/* LEFT COLUMN: QR CODE & CONTROLS */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlignment: "center", borderRight: "1px solid #f1f5f9", paddingRight: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#16a34a", fontWeight: 700, fontSize: 13, background: "#dcfce7", padding: "4px 12px", borderRadius: 20 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a", animation: "pulse 1.5s infinite" }} />
                  REAL-TIME LIVE
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={14} /> {activeSession.countdown ? fmtTime(activeSession.countdown) : "Active"}
                </div>
              </div>

              <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 2, color: "#0f172a", marginBottom: 2 }}>{activeSession.id}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16, fontWeight: 600, textAlign: "center" }}>{activeSession.courseName}</div>

              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, padding: 12, background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0" }}>
                <QRVisual code={activeSession.id} size={200} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                <button onClick={() => downloadSessionPDF(activeSession)} style={{
                  width: "100%", padding: "11px 16px", borderRadius: 12, background: "linear-gradient(135deg,#059669,#10b981)",
                  color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 12px rgba(16,185,129,0.25)"
                }}>
                  <Download size={16} /> Download PDF Attendance Sheet
                </button>

                <button onClick={closeSession} style={{
                  width: "100%", padding: "11px 16px", borderRadius: 12, background: "#ef4444",
                  color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 8
                }}>
                  <X size={16} /> End & Close Session
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: REAL-TIME CHECKIN ROSTER FEED */}
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <Users size={18} color="#2563eb" /> Live Check-in Stream
                  </h3>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>Updates automatically as students check in</p>
                </div>
                <span style={{ background: "#eff6ff", color: "#2563eb", fontWeight: 800, fontSize: 13, padding: "4px 12px", borderRadius: 20, border: "1px solid #bfdbfe" }}>
                  {activeSession.students ? activeSession.students.length : 0} Present
                </span>
              </div>

              {/* LIVE STREAM FEED */}
              <div style={{ flex: 1, overflowY: "auto", maxHeight: 320, paddingRight: 6 }}>
                {!activeSession.students || activeSession.students.length === 0 ? (
                  <div style={{ padding: "60px 20px", textAlign: "center", color: "#94a3b8" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <Smartphone size={24} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>Waiting for check-ins...</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Ask students to scan QR or enter code <b>{activeSession.id}</b></div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {activeSession.students.map((st, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 14px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <Avatar initials={st.avatar || getInitials(st.name)} idx={i} size={34} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{st.name}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{st.index}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "2px 8px", borderRadius: 12, display: "inline-block" }}>
                            {st.time || "Just now"}
                          </div>
                          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{st.method || "Session Code"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
