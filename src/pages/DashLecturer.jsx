import { useState, useEffect, useRef, useCallback } from "react";
import {
  BookOpen, Users, AlertTriangle, BarChart2, QrCode,
  TrendingUp, Settings, LogOut, LayoutDashboard,
  FileText, GraduationCap, ChevronDown, RefreshCw,
  Download, Eye, PanelLeftClose, PanelLeftOpen, Clock,
  XCircle, Loader, Layers, Check, ChevronRight,
  Smartphone, AlertOctagon, Shield, Wifi, X, Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { request } from "../api/client";

// ─── ALL LEVELS DATA ──────────────────────────────────────────────────────────

const ALL_LEVELS = [
  {
    id: "L100", label: "Level 100", year: "1st Year",
    color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe",
    courses: [
      { code: "ICTE125", name: "Multimedia Authoring in Education" },
      { code: "ICTW123", name: "Fundamentals of Computer Programming" },
    ],
    groups: ["Group 1", "Group 2"],
    students: [
      { id: 1,  name: "Alberta Klokpa",   index: "5261000018", attended: 8, total: 8, pct: 100, device: "iPhone 13",      deviceId: "dev-001", flagged: false, group: "Group 1" },
      { id: 2,  name: "Daniel Amoh",      index: "5261000667", attended: 0, total: 8, pct: 0,   device: "Samsung S21",    deviceId: "dev-002", flagged: false, group: "Group 1" },
      { id: 3,  name: "Emmanuel Oduro",   index: "5261000215", attended: 7, total: 8, pct: 88,  device: "Pixel 7",        deviceId: "dev-003", flagged: false, group: "Group 2" },
      { id: 4,  name: "Emmanuel Twumasi", index: "5261000267", attended: 2, total: 8, pct: 25,  device: "Multiple (2)",   deviceId: null,      flagged: true,  alertType: "multi_device",  flagReason: "Logged in from 2 devices: iPhone 12 & Samsung A52", group: "Group 2" },
      { id: 5,  name: "Heis Boateng",     index: "523232323",  attended: 5, total: 8, pct: 63,  device: "iPhone 12",      deviceId: "dev-005", flagged: false, group: "Group 1" },
      { id: 6,  name: "Nimako Joe",       index: "5261000334", attended: 6, total: 8, pct: 75,  device: "Changed device", deviceId: null,      flagged: true,  alertType: "device_change", flagReason: "Device changed: Tecno Spark → Infinix Hot 20", group: "Group 2" },
      { id: 7,  name: "Osie Eugen Bonu",  index: "5261000660", attended: 3, total: 8, pct: 38,  device: "Tecno Spark",    deviceId: "dev-007", flagged: false, group: "Group 1" },
      { id: 8,  name: "Sandra Mensah",    index: "5261000712", attended: 8, total: 8, pct: 100, device: "iPhone SE",      deviceId: "dev-008", flagged: false, group: "Group 2" },
    ],
    sessions: [
      { id: "ATT-4869", course: "ICTE125", date: "6/2/2026",  checkins: 2, status: "closed" },
      { id: "ATT-6162", course: "ICTW123", date: "6/1/2026",  checkins: 1, status: "closed" },
      { id: "ATT-4225", course: "ICTW123", date: "5/31/2026", checkins: 1, status: "closed" },
      { id: "ATT-6656", course: "ICTW123", date: "5/30/2026", checkins: 2, status: "closed" },
    ],
    progress: [
      { label: "Overall Attendance", value: 78, color: "#3b82f6" },
      { label: "This Week",          value: 91, color: "#10b981" },
      { label: "Below 75%",          value: 22, color: "#ef4444", raw: "5 students" },
      { label: "Perfect Attendance", value: 43, color: "#f59e0b" },
    ],
    stats: { courses: 2, groups: 2, lowAttendance: 5, flagged: 2 },
  },
  {
    id: "L200", label: "Level 200", year: "2nd Year",
    color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe",
    courses: [
      { code: "ICTS201", name: "Systems Analysis and Design" },
      { code: "ICTD310", name: "Database Management Systems" },
      { code: "ICTN220", name: "Computer Networks" },
    ],
    groups: ["Group 1", "Group 2", "Group 3"],
    students: [
      { id: 9,  name: "Ama Boateng",  index: "5251000011", attended: 6, total: 8, pct: 75,  device: "Samsung A53",  deviceId: "dev-009", flagged: false, group: "Group 1" },
      { id: 10, name: "Kofi Mensah",  index: "5251000022", attended: 8, total: 8, pct: 100, device: "iPhone 14",    deviceId: "dev-010", flagged: false, group: "Group 1" },
      { id: 11, name: "Abena Osei",   index: "5251000033", attended: 3, total: 8, pct: 38,  device: "Multiple (3)", deviceId: null,      flagged: true,  alertType: "multi_device",  flagReason: "Signed in from 3 different devices this semester", group: "Group 2" },
      { id: 12, name: "Kweku Asante", index: "5251000044", attended: 7, total: 8, pct: 88,  device: "Pixel 6",      deviceId: "dev-012", flagged: false, group: "Group 2" },
      { id: 13, name: "Adwoa Darko",  index: "5251000055", attended: 1, total: 8, pct: 13,  device: "Tecno Spark",  deviceId: "dev-013", flagged: false, group: "Group 3" },
    ],
    sessions: [
      { id: "ATT-3312", course: "ICTS201", date: "6/2/2026",  checkins: 4, status: "closed" },
      { id: "ATT-2211", course: "ICTD310", date: "5/30/2026", checkins: 3, status: "closed" },
    ],
    progress: [
      { label: "Overall Attendance", value: 63, color: "#3b82f6" },
      { label: "This Week",          value: 82, color: "#10b981" },
      { label: "Below 75%",          value: 40, color: "#ef4444", raw: "3 students" },
      { label: "Perfect Attendance", value: 20, color: "#f59e0b" },
    ],
    stats: { courses: 3, groups: 3, lowAttendance: 3, flagged: 1 },
  },
  {
    id: "L300", label: "Level 300", year: "3rd Year",
    color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0",
    courses: [
      { code: "ICTP150", name: "Programming Paradigms" },
      { code: "ICTA301", name: "Artificial Intelligence" },
    ],
    groups: ["Group 1", "Group 2"],
    students: [
      { id: 14, name: "Yaw Frempong", index: "5241000001", attended: 8, total: 8, pct: 100, device: "iPhone 13 Pro",  deviceId: "dev-014", flagged: false, group: "Group 1" },
      { id: 15, name: "Akosua Ampah", index: "5241000002", attended: 5, total: 8, pct: 63,  device: "Changed device", deviceId: null,      flagged: true,  alertType: "device_change", flagReason: "Phone changed mid-semester: Huawei P30 → Samsung S22", group: "Group 1" },
      { id: 16, name: "Kwame Ofori",  index: "5241000003", attended: 8, total: 8, pct: 100, device: "Pixel 7 Pro",    deviceId: "dev-016", flagged: false, group: "Group 2" },
      { id: 17, name: "Efua Asiedu",  index: "5241000004", attended: 2, total: 8, pct: 25,  device: "Multiple (2)",   deviceId: null,      flagged: true,  alertType: "multi_device",  flagReason: "Two devices detected in same session: iPhone 11 & Oppo A57", group: "Group 2" },
    ],
    sessions: [
      { id: "ATT-7711", course: "ICTP150", date: "6/1/2026",  checkins: 3, status: "closed" },
      { id: "ATT-5522", course: "ICTA301", date: "5/28/2026", checkins: 4, status: "closed" },
    ],
    progress: [
      { label: "Overall Attendance", value: 72, color: "#3b82f6" },
      { label: "This Week",          value: 88, color: "#10b981" },
      { label: "Below 75%",          value: 50, color: "#ef4444", raw: "2 students" },
      { label: "Perfect Attendance", value: 50, color: "#f59e0b" },
    ],
    stats: { courses: 2, groups: 2, lowAttendance: 2, flagged: 2 },
  },
  {
    id: "L400", label: "Level 400", year: "4th Year",
    color: "#f59e0b", bg: "#fffbeb", border: "#fde68a",
    courses: [
      { code: "ICPR401", name: "Project Work" },
      { code: "ICTE410", name: "E-Commerce Systems" },
    ],
    groups: ["Group 1"],
    students: [
      { id: 18, name: "Nana Ama Sarpong", index: "5231000010", attended: 7, total: 8, pct: 88,  device: "Samsung S23",   deviceId: "dev-018", flagged: false, group: "Group 1" },
      { id: 19, name: "Fiifi Entsie",     index: "5231000011", attended: 8, total: 8, pct: 100, device: "iPhone 15 Pro", deviceId: "dev-019", flagged: false, group: "Group 1" },
      { id: 20, name: "Maame Serwaa",     index: "5231000012", attended: 4, total: 8, pct: 50,  device: "Multiple (2)",  deviceId: null,      flagged: true,  alertType: "multi_device",  flagReason: "Checked in using 2 phones: own device + borrowed device detected", group: "Group 1" },
    ],
    sessions: [
      { id: "ATT-9901", course: "ICPR401", date: "6/3/2026", checkins: 2, status: "closed" },
    ],
    progress: [
      { label: "Overall Attendance", value: 85, color: "#3b82f6" },
      { label: "This Week",          value: 95, color: "#10b981" },
      { label: "Below 75%",          value: 33, color: "#ef4444", raw: "1 student" },
      { label: "Perfect Attendance", value: 67, color: "#f59e0b" },
    ],
    stats: { courses: 2, groups: 1, lowAttendance: 1, flagged: 1 },
  },
];

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

// ─── SVG PIE CHART ────────────────────────────────────────────────────────────

function PieChart({ data, size = 200 }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  if (!total) return null;
  let cumulative = 0;
  const slices = data.map(d => {
    const start = (cumulative / total) * 360;
    cumulative += d.value;
    const end = (cumulative / total) * 360;
    const r = size / 2 - 10;
    const cx = size / 2, cy = size / 2;
    const toRad = deg => (deg - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(end));
    const y2 = cy + r * Math.sin(toRad(end));
    const largeArc = end - start > 180 ? 1 : 0;
    const midRad = toRad((start + end) / 2);
    const lx = cx + (r * 0.65) * Math.cos(midRad);
    const ly = cy + (r * 0.65) * Math.sin(midRad);
    const pct = Math.round((d.value / total) * 100);
    return { ...d, path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`, lx, ly, pct };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <g key={i}>
          <path d={s.path} fill={s.color} stroke="white" strokeWidth="2" />
          {s.pct >= 8 && (
            <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle"
              fill="white" fontSize="11" fontWeight="700">{s.pct}%</text>
          )}
        </g>
      ))}
      <circle cx={size / 2} cy={size / 2} r={size / 5} fill="white" />
    </svg>
  );
}

// ─── PROGRESS RING ────────────────────────────────────────────────────────────

function ProgressRing({ value, color, size = 90, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
}

// ─── REAL QR CODE COMPONENT ──────────────────────────────────────────────────

function QRPlaceholder({ code, size = 200 }) {
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

// ─── ALERT DETAIL MODAL ──────────────────────────────────────────────────────

function AlertDetailModal({ student, onClose, onConfirm, onDelete }) {
  if (!student) return null;

  const isMultiDevice  = student.alertType === "multi_device";
  const isDeviceChange = student.alertType === "device_change";

  // Parse device names from flagReason
  const multiDevices = isMultiDevice
    ? (student.flagReason.match(/:\s*(.+)$/)?.[1]?.split(/[,&]/).map(d => d.trim()) || [])
    : [];
  const [oldDevice, newDevice] = isDeviceChange
    ? (student.flagReason.match(/:\s*(.+?)\s*→\s*(.+)$/) || []).slice(1)
    : [null, null];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(4px)", zIndex: 9000,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, animation: "fadeIn 0.2s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "white", borderRadius: 20, maxWidth: 480, width: "100%",
        boxShadow: "0 25px 50px rgba(0,0,0,0.25)", animation: "slideUp 0.25s ease", overflow: "hidden"
      }}>
        {/* Modal Header */}
        <div style={{
          background: isMultiDevice
            ? "linear-gradient(135deg,#7f1d1d,#991b1b)"
            : "linear-gradient(135deg,#78350f,#92400e)",
          padding: "20px 24px", display: "flex", alignItems: "center", gap: 14
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            {isMultiDevice
              ? <Smartphone size={24} color="white" />
              : <RefreshCw size={24} color="white" />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>{student.name}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{student.index}</div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8,
            width: 32, height: 32, cursor: "pointer", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "22px 24px" }}>

          {/* Alert type badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: isMultiDevice ? "#fef2f2" : "#fffbeb",
            border: `1px solid ${isMultiDevice ? "#fecaca" : "#fde68a"}`,
            color: isMultiDevice ? "#991b1b" : "#92400e",
            padding: "6px 14px", borderRadius: 24, fontSize: 12, fontWeight: 700, marginBottom: 16
          }}>
            <AlertOctagon size={13} />
            {isMultiDevice ? "Multiple Device Login Detected" : "Device Change Detected"}
          </div>

          {/* Explanation block */}
          <div style={{
            background: "#f8fafc", borderRadius: 12, padding: "14px 16px",
            marginBottom: 16, border: "1px solid #e2e8f0"
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 8 }}>
              {isMultiDevice ? "What happened:" : "What changed:"}
            </div>

            {isMultiDevice && (
              <>
                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 12 }}>
                  This student's attendance was recorded from <strong>{multiDevices.length || 2} different
                  devices</strong> during this semester. This may indicate that another person checked in
                  on their behalf (proxy attendance), which is a violation of attendance policy.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {multiDevices.map((d, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      background: "white", border: "1px solid #e2e8f0",
                      borderRadius: 8, padding: "8px 12px"
                    }}>
                      <Smartphone size={14} color={i === 0 ? "#3b82f6" : "#ef4444"} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", flex: 1 }}>{d}</span>
                      <span style={{
                        fontSize: 10, padding: "1px 8px", borderRadius: 10, fontWeight: 700,
                        background: i === 0 ? "#dbeafe" : "#fef2f2",
                        color: i === 0 ? "#1e40af" : "#991b1b"
                      }}>
                        {i === 0 ? "PRIMARY" : "SECONDARY"}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {isDeviceChange && (
              <>
                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 12 }}>
                  The device used to mark attendance has <strong>changed mid-semester</strong>. This could
                  indicate a legitimate phone replacement, or that a different person is using this
                  student's account to mark attendance.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    flex: 1, background: "white", border: "1px solid #e2e8f0",
                    borderRadius: 10, padding: "10px 14px"
                  }}>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>ORIGINAL DEVICE</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Smartphone size={13} color="#64748b" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{oldDevice}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#94a3b8" />
                  <div style={{
                    flex: 1, background: "#fffbeb", border: "1px solid #fde68a",
                    borderRadius: 10, padding: "10px 14px"
                  }}>
                    <div style={{ fontSize: 10, color: "#b45309", marginBottom: 4, fontWeight: 600 }}>NEW DEVICE</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Smartphone size={13} color="#b45309" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>{newDevice}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Attendance summary */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, background: "#f8fafc", borderRadius: 10, padding: "10px 14px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3, fontWeight: 600 }}>SESSIONS ATTENDED</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>
                {student.attended}<span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>/{student.total}</span>
              </div>
            </div>
            <div style={{
              flex: 1, borderRadius: 10, padding: "10px 14px",
              background: student.pct < 75 ? "#fef2f2" : "#f0fdf4",
              border: `1px solid ${student.pct < 75 ? "#fecaca" : "#bbf7d0"}`
            }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3, fontWeight: 600 }}>ATTENDANCE RATE</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: student.pct < 75 ? "#ef4444" : "#16a34a" }}>
                {student.pct}%
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { onConfirm(student); onClose(); }} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "linear-gradient(135deg,#16a34a,#15803d)", color: "white",
              border: "none", borderRadius: 10, padding: "10px 0",
              fontSize: 13, fontWeight: 700, cursor: "pointer"
            }}>
              <Check size={14} /> Confirm
            </button>
            <button onClick={() => { onDelete(student); onClose(); }} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "#fef2f2", color: "#ef4444",
              border: "1px solid #fecaca", borderRadius: 10, padding: "10px 0",
              fontSize: 13, fontWeight: 700, cursor: "pointer"
            }}>
              <XCircle size={14} /> Delete Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const [showLevelModal, setShowLevelModal] = useState(true);
  const [selectedLevel, setSelectedLevel]   = useState(null);
  const [loadingLevel, setLoadingLevel]     = useState(false);

  const [navItem, setNavItem]         = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tab, setTab]                 = useState("reports");
  const [course, setCourse]           = useState("");
  const [group, setGroup]             = useState("");
  const [reportType, setReportType]   = useState("Cumulative Student Attendance");

  // Lecturer details
  const [lecturerName, setLecturerName] = useState("Lecturer");

  // Database levels
  const [levels, setLevels]           = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(true);

  // Loaded level states
  const [students, setStudents]       = useState([]);
  const [courses, setCourses]         = useState([]);
  const [sessions, setSessions]       = useState([]);
  const [groups, setGroups]           = useState([]);
  const [stats, setStats]             = useState({ courses: 0, groups: 0, lowAttendance: 0, flagged: 0 });

  // QR session
  const [qrCourse, setQrCourse]           = useState("");
  const [timeWindow, setTimeWindow]       = useState("10");
  const [sessionCode, setSessionCode]     = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [countdown, setCountdown]         = useState(0);
  const timerRef = useRef(null);

  // Students tab
  const [studentTab, setStudentTab]             = useState("all");
  const [alertModalStudent, setAlertModalStudent] = useState(null);
  const [flaggedList, setFlaggedList]           = useState([]);

  // Manage courses state
  const [showCoursesModal, setShowCoursesModal] = useState(false);
  const [newCourseCode, setNewCourseCode]       = useState("");
  const [newCourseName, setNewCourseName]       = useState("");
  const [coursesLoading, setCoursesLoading]     = useState(false);

  // Course Rep Management state
  const [courseReps, setCourseReps]   = useState([]);
  const [repFirstName, setRepFirstName] = useState("");
  const [repLastName, setRepLastName]   = useState("");
  const [repEmail, setRepEmail]         = useState("");
  const [repIndex, setRepIndex]         = useState("");
  const [repCourse, setRepCourse]       = useState("");
  const [repGroup, setRepGroup]         = useState("");
  const [repPassword, setRepPassword]   = useState("");
  const [repLoading, setRepLoading]     = useState(false);

  // Groups tab state
  const [selectedGroup, setSelectedGroup]           = useState("");
  const [groupStudentFilter, setGroupStudentFilter] = useState("all");

  const LEVEL_THEMES = {
    L100: { color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
    L200: { color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" },
    L300: { color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
    L400: { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  };

  const loadLevels = useCallback(async () => {
    setLoadingLevels(true);
    try {
      const res = await request("/api/levels/");
      const json = await res.json();
      if (json.success) {
        const enriched = json.data.map(lvl => {
          const theme = LEVEL_THEMES[lvl.id] || { color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" };
          return {
            id: lvl.id,
            code: lvl.code,
            label: lvl.label,
            year: lvl.year,
            ...theme,
            courses: [],
            students: [],
            sessions: [],
            groups: [],
            stats: {
              courses: lvl.courses_count || 0,
              groups: lvl.groups_count || 1,
              lowAttendance: lvl.low_attendance_count || 0,
              flagged: lvl.flagged_count || 0
            }
          };
        });
        setLevels(enriched);
        if (enriched.length > 0 && !selectedLevel) {
          selectLevel(enriched[0]);
        }
      } else {
        setLevels(ALL_LEVELS);
        if (ALL_LEVELS.length > 0 && !selectedLevel) {
          selectLevel(ALL_LEVELS[0]);
        }
      }
    } catch (err) {
      console.error("Error loading academic levels:", err);
      setLevels(ALL_LEVELS);
      if (ALL_LEVELS.length > 0 && !selectedLevel) {
        selectLevel(ALL_LEVELS[0]);
      }
    } finally {
      setLoadingLevels(false);
    }
  }, []);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseName.trim()) return;
    
    setCoursesLoading(true);
    try {
      const res = await request("/api/courses/", {
        method: "POST",
        body: JSON.stringify({
          code: newCourseCode.trim().toUpperCase(),
          name: newCourseName.trim(),
          level_id: selectedLevel ? selectedLevel.id : 'L100'
        })
      });
      if (!res.ok) {
        let errText = `Server error (${res.status})`;
        try {
          const errJson = await res.json();
          errText = errJson.message || errText;
        } catch (e) {}
        throw new Error(errText);
      }
      const json = await res.json();
      
      if (!json.success) throw new Error(json.message || "Failed to create course");
      
      if (selectedLevel) {
        await selectLevel(selectedLevel);
      }
      loadLevels();
      setNewCourseCode("");
      setNewCourseName("");
      alert(`✓ Course ${newCourseCode.trim().toUpperCase()} added successfully to your dashboard!`);
    } catch (err) {
      alert("Failed to add course: " + err.message);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleDeleteCourse = async (courseCode) => {
    if (!confirm(`Are you sure you want to delete course ${courseCode}?`)) return;
    
    setCoursesLoading(true);
    try {
      const res = await request(`/api/courses/${courseCode}/`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to delete course");

      if (selectedLevel) {
        await selectLevel(selectedLevel);
      }
      loadLevels();
    } catch (err) {
      alert("Failed to delete course: " + err.message);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleGroupChange = async (e) => {
    const val = e.target.value;
    if (val === "ADD_NEW") {
      const newGroupName = prompt("Enter new group name (e.g. Group 5):");
      if (newGroupName && newGroupName.trim()) {
        const trimmed = newGroupName.trim();
        if (!groups.includes(trimmed)) {
          try {
            const res = await request("/api/groups/", {
              method: "POST",
              body: JSON.stringify({
                name: trimmed,
                level_id: selectedLevel ? selectedLevel.id : 'L100'
              })
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            
            const updatedGroups = [...groups, trimmed].sort();
            setGroups(updatedGroups);
            setGroup(trimmed);
            setStats(prev => ({ ...prev, groups: updatedGroups.length }));
          } catch (err) {
            console.error("Error inserting group:", err);
            alert("Failed to add group: " + err.message);
          }
        } else {
          setGroup(trimmed);
        }
      }
    } else {
      setGroup(val);
    }
  };

  const level = selectedLevel;

  const getInitials = (name) => {
    return name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "ST";
  };

  const loadCourseReps = useCallback(async () => {
    try {
      const res = await request("/api/course-reps/");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setCourseReps(json.data);
      }
    } catch (e) {
      console.warn("Course reps fetch error:", e);
    }
  }, []);

  const handleAppointRep = async (e) => {
    e.preventDefault();
    if (!repEmail.trim() || !repFirstName.trim()) return;
    setRepLoading(true);
    try {
      const res = await request("/api/course-reps/", {
        method: "POST",
        body: JSON.stringify({
          first_name: repFirstName.trim(),
          last_name: repLastName.trim(),
          email: repEmail.trim().toLowerCase(),
          index_number: repIndex.trim(),
          course_code: repCourse || (courses[0] ? courses[0].code : ""),
          group_id: repGroup || (groups[0] || "Group 1"),
          password: repPassword.trim() || "password123"
        })
      });
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      alert(`✓ ${json.message}\nLogin Password: ${repPassword.trim() || 'password123'}`);
      setRepFirstName("");
      setRepLastName("");
      setRepEmail("");
      setRepIndex("");
      setRepPassword("");
      loadCourseReps();
    } catch (err) {
      alert("Failed to appoint Course Rep: " + err.message);
    } finally {
      setRepLoading(false);
    }
  };

  // Load levels and course reps on component mount
  useEffect(() => {
    const userStr = sessionStorage.getItem("web_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setLecturerName(u.first_name || "Lecturer");
      } catch (e) {}
    }

    loadLevels();
    loadCourseReps();
  }, [loadLevels, loadCourseReps]);

  const selectLevel = async (lvl) => {
    setLoadingLevel(true);
    try {
      const levelCode = lvl.code || lvl.id;
      // 1. Fetch summary stats & group details
      const resSum = await request(`/api/reports/summary/${levelCode}/`);
      if (!resSum.ok) throw new Error(`Server returned status ${resSum.status}`);
      const jsonSum = await resSum.json();

      // 2. Fetch all student attendance data for this level
      const resBreak = await request(`/api/reports/breakdown/?level_code=${levelCode}`);
      if (!resBreak.ok) throw new Error(`Server returned status ${resBreak.status}`);
      const jsonBreak = await resBreak.json();

      // 3. Fetch flagged alert list
      let jsonAlert = { data: [] };
      try {
        const resAlert = await request(`/api/alerts/?level_id=${lvl.id}`);
        if (resAlert.ok) jsonAlert = await resAlert.json();
      } catch (e) {
        console.warn("Alerts fetch optional warning:", e);
      }

      if (jsonSum.success && jsonBreak.success) {
        const enrichedStudents = jsonBreak.data.map(s => ({
          id: s.id,
          name: s.name,
          index: s.index,
          attended: s.attended,
          total: s.total,
          pct: s.pct,
          device: s.device || "N/A",
          deviceId: s.device_id,
          flagged: s.flagged,
          alertType: s.alert_type,
          flagReason: s.flag_reason,
          group: s.group || "Unassigned"
        }));

        const formattedSessions = (jsonSum.data.sessions || []).map(s => ({
          id: s.id,
          course: s.course.code,
          courseName: s.course.name,
          date: new Date(s.opened_at).toLocaleDateString(),
          timeWindow: s.time_window,
          checkins: s.checkin_count,
          status: s.status
        }));

        const coursesList = jsonSum.data.courses || [];
        const rawGroupNames = jsonSum.data.groups || [];
        const studentGroupNames = Array.from(new Set(enrichedStudents.map(s => s.group))).filter(Boolean);
        const groupNames = rawGroupNames.length > 0 ? rawGroupNames : (studentGroupNames.length > 0 ? studentGroupNames : ["Group 1", "Group 2"]);

        setStudents(enrichedStudents);
        setCourses(coursesList);
        setSessions(formattedSessions);
        setGroups(groupNames);
        setStats(jsonSum.data.stats);

        const updatedLevel = {
          ...lvl,
          students: enrichedStudents,
          courses: coursesList,
          sessions: formattedSessions,
          groups: groupNames,
          progress: jsonSum.data.progress,
          stats: jsonSum.data.stats
        };

        setSelectedLevel(updatedLevel);
        setCourse(coursesList[0]?.code || "");
        setQrCourse(coursesList[0]?.code || "");
        setGroup(groupNames[0] || "Group 1");
        setSelectedGroup(groupNames[0] || "Group 1");
        
        if (jsonAlert.success) {
          setFlaggedList(jsonAlert.data.filter(a => a.status === 'open'));
        } else {
          setFlaggedList(enrichedStudents.filter(s => s.flagged));
        }
        setShowLevelModal(false);
      }
    } catch (err) {
      alert("Error loading level details: " + err.message);
    } finally {
      setLoadingLevel(false);
    }
  };

  // ── REAL-TIME SILENT SYNC WITH MOBILE APP CHECKINS (Every 2.5s) ──
  const silentRefreshLevel = useCallback(async (lvl) => {
    if (!lvl) return;
    try {
      const levelCode = lvl.code || lvl.id;
      const resSum = await request(`/api/reports/summary/${levelCode}/`);
      if (!resSum.ok) return;
      const jsonSum = await resSum.json();

      const resBreak = await request(`/api/reports/breakdown/?level_code=${levelCode}`);
      if (!resBreak.ok) return;
      const jsonBreak = await resBreak.json();

      let jsonAlert = { data: [] };
      try {
        const resAlert = await request(`/api/alerts/?level_id=${lvl.id}`);
        if (resAlert.ok) jsonAlert = await resAlert.json();
      } catch (e) {}

      if (jsonSum.success && jsonBreak.success) {
        const enrichedStudents = jsonBreak.data.map(s => ({
          id: s.id,
          name: s.name,
          index: s.index,
          attended: s.attended,
          total: s.total,
          pct: s.pct,
          status: s.status,
          method: s.method,
          time: s.time,
          group: s.group,
          flagged: s.flagged,
          flagReason: s.flagReason,
          alertType: s.alertType,
          alertId: s.alertId
        }));

        setSelectedLevel(prev => prev ? {
          ...prev,
          students: enrichedStudents,
          progress: jsonSum.data.progress,
          stats: jsonSum.data.stats
        } : prev);

        setStats(jsonSum.data.stats);

        if (jsonAlert.success) {
          setFlaggedList(jsonAlert.data.filter(a => a.status === 'open'));
        }
      }
    } catch (e) {
      console.warn("Silent sync error:", e);
    }
  }, []);

  useEffect(() => {
    if (!selectedLevel) return;
    const syncInterval = setInterval(() => {
      silentRefreshLevel(selectedLevel);
    }, 2500);

    return () => clearInterval(syncInterval);
  }, [selectedLevel, silentRefreshLevel]);

  // Alert actions
  const handleConfirmAlert = async (student) => {
    try {
      const res = await request(`/api/alerts/${student.id}/`, {
        method: "POST",
        body: JSON.stringify({ action: "confirm" })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, flagged: false, flagReason: null } : s));
      setFlaggedList(prev => prev.filter(s => s.id !== student.id));
      setStats(prev => ({ ...prev, flagged: Math.max(0, prev.flagged - 1) }));
      
      setSelectedLevel(prev => {
        if (!prev) return null;
        return {
          ...prev,
          stats: {
            ...prev.stats,
            flagged: Math.max(0, prev.stats.flagged - 1)
          }
        };
      });
    } catch (err) {
      alert("Failed to confirm alert: " + err.message);
    }
  };

  const handleDeleteRecord = async (student) => {
    try {
      const res = await request(`/api/alerts/${student.id}/`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      await selectLevel(selectedLevel);
    } catch (err) {
      alert("Failed to delete record: " + err.message);
    }
  };

  const handleExportCSV = async () => {
    try {
      const levelCode = selectedLevel ? selectedLevel.code || selectedLevel.id : 'L100';
      const token = sessionStorage.getItem('access_token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/api/reports/export/?level_code=${levelCode}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Attendance_Report_${levelCode}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export report: " + err.message);
    }
  };

  // QR timer
  const openSession = async () => {
    const targetCourse = qrCourse || (level && level.courses && level.courses[0] ? level.courses[0].code : "");
    if (!targetCourse) {
      alert("Please select or add a course before opening a session.");
      return;
    }

    try {
      const res = await request("/api/sessions/create/", {
        method: "POST",
        body: JSON.stringify({
          course_id: targetCourse,
          time_window: timeWindow
        })
      });
      const json = await res.json();
      
      if (json.success) {
        setSessionCode(json.data.id);
        setSessionActive(true);
        setCountdown(parseInt(timeWindow) * 60);
        if (selectedLevel) {
          await selectLevel(selectedLevel);
        }
      } else {
        alert(json.message || "Failed to open session");
      }
    } catch (err) {
      alert("Failed to open session: " + err.message);
    }
  };

  const closeSession = async () => {
    if (!sessionCode) return;
    try {
      const res = await request(`/api/sessions/${sessionCode}/close/`, {
        method: "POST"
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setSessionActive(false);
      setSessionCode(null);
      clearInterval(timerRef.current);
      await selectLevel(level);
    } catch (err) {
      alert("Failed to close session: " + err.message);
    }
  };

  useEffect(() => {
    if (sessionActive && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) { clearInterval(timerRef.current); setSessionActive(false); return 0; }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionActive]);

  const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const pctBadge = (pct) => {
    const bg   = pct === 100 ? "#dbeafe" : pct >= 75 ? "#d1fae5" : "#fee2e2";
    const text = pct === 100 ? "#1e40af" : pct >= 75 ? "#065f46" : "#991b1b";
    return <span style={{ background: bg, color: text, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{pct}%</span>;
  };

  const navLinks = [
    { key: "dashboard", label: "Dashboard",   icon: LayoutDashboard },
    { key: "reports",   label: "Reports",     icon: FileText },
    { key: "students",  label: "Students",    icon: Users },
    { key: "groups",    label: "Groups",      icon: Layers },
    { key: "profile",   label: "My Profile & Reps", icon: Settings },
  ];

  const STATS = level ? [
    { label: "Total Courses",  value: String(stats.courses),       icon: BookOpen,      color: "#3b82f6", bg: "#eff6ff" },
    { label: "Student Groups", value: String(stats.groups),        icon: Users,         color: "#10b981", bg: "#ecfdf5" },
    { label: "Low Attendance", value: String(stats.lowAttendance), icon: AlertTriangle, color: "#ef4444", bg: "#fef2f2", sub: "Students below 75%" },
    { label: "Device Alerts",  value: String(flaggedList.length),        icon: Smartphone,    color: "#f59e0b", bg: "#fffbeb", sub: "Flagged logins" },
  ] : [];

  // Group pie chart data
  const getGroupPieData = () => {
    if (!level) return [];
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];
    return groups.map((g, i) => {
      const gs  = students.filter(s => s.group === g);
      const avg = gs.length ? Math.round(gs.reduce((a, s) => a + s.pct, 0) / gs.length) : 0;
      return { label: g, value: gs.length, avg, color: colors[i % colors.length] };
    });
  };
  const groupPieData = level ? getGroupPieData() : [];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#f1f5f9", color: "#1e293b" }}>

      {/* ══ LEVEL SELECT MODAL ══ */}
      {showLevelModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f2044 100%)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24
        }}>
          <div style={{ width: "100%", maxWidth: 700, animation: "slideUp 0.4s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <GraduationCap size={26} color="white" />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: "white", fontWeight: 800, fontSize: 22 }}>INFOCTESS</div>
                  <div style={{ color: "#64748b", fontSize: 12 }}>Class Register · Lecturer Portal</div>
                </div>
              </div>
              <h2 style={{ color: "white", fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>Select Your Level</h2>
              <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Choose the student level to load attendance data for</p>
            </div>

            {loadingLevels ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", border: "3px solid #1e293b", borderTopColor: "#3b82f6", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
                <div style={{ color: "#94a3b8", fontSize: 14 }}>Loading academic levels…</div>
              </div>
            ) : loadingLevel ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", border: "3px solid #1e293b", borderTopColor: "#3b82f6", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
                <div style={{ color: "#94a3b8", fontSize: 14 }}>Loading level data…</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {levels.map(lvl => (
                  <button key={lvl.id} onClick={() => selectLevel(lvl)} style={{
                    background: "#1e293b", border: "2px solid #334155", borderRadius: 16,
                    padding: "22px 24px", cursor: "pointer", textAlign: "left",
                    transition: "all 0.25s ease", display: "flex", alignItems: "center", gap: 16
                  }}
                    onMouseEnter={e => { e.currentTarget.style.border = `2px solid ${lvl.color}`; e.currentTarget.style.background = "#243044"; }}
                    onMouseLeave={e => { e.currentTarget.style.border = "2px solid #334155"; e.currentTarget.style.background = "#1e293b"; }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: lvl.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${lvl.border}` }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: lvl.color }}>{lvl.id}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "white", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{lvl.label}</div>
                      <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>{lvl.year}</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, background: "#0f172a", color: "#94a3b8", padding: "2px 8px", borderRadius: 20 }}>{lvl.stats.courses} courses</span>
                        <span style={{ fontSize: 11, background: "#0f172a", color: "#94a3b8", padding: "2px 8px", borderRadius: 20 }}>{lvl.studentsCount} students</span>
                        {lvl.flaggedCount > 0 && (
                          <span style={{ fontSize: 11, background: "#7f1d1d", color: "#fca5a5", padding: "2px 8px", borderRadius: 20 }}>⚠ {lvl.flaggedCount} alerts</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={18} color="#475569" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ MANAGE COURSES MODAL ══ */}
      {showCoursesModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24
        }}>
          <div style={{ width: "100%", maxWidth: 500, background: "white", borderRadius: 20, padding: 28, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", animation: "slideUp 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Manage Courses</h2>
              <button onClick={() => setShowCoursesModal(false)} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer", fontWeight: 700 }}>×</button>
            </div>

            {/* Add Course Form */}
            <form onSubmit={handleAddCourse} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <input 
                type="text" 
                placeholder="Course Code (e.g. INF411)" 
                value={newCourseCode} 
                onChange={e => setNewCourseCode(e.target.value)} 
                required 
                style={{ flex: 0.8, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }} 
              />
              <input 
                type="text" 
                placeholder="Course Name" 
                value={newCourseName} 
                onChange={e => setNewCourseName(e.target.value)} 
                required 
                style={{ flex: 1.2, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }} 
              />
              <button type="submit" disabled={coursesLoading} style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {coursesLoading ? "..." : "Add"}
              </button>
            </form>

            {/* Courses List */}
            <div style={{ maxHeight: 250, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 10 }}>
              {courses.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No courses registered.</div>
              ) : (
                courses.map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
                    <div>
                      <span style={{ fontWeight: 700, color: "#1e293b", fontSize: 13, marginRight: 8 }}>{c.code}</span>
                      <span style={{ color: "#64748b", fontSize: 13 }}>{c.name}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteCourse(c.code)} 
                      style={{ background: "none", border: "none", color: "#ef4444", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sidebarOpen ? 210 : 64, minHeight: "100vh",
        background: "#0f172a", color: "#94a3b8",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s ease", overflow: "hidden", flexShrink: 0, zIndex: 10
      }}>
        <div style={{ padding: sidebarOpen ? "24px 20px 16px" : "24px 12px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #1e293b" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GraduationCap size={20} color="white" />
          </div>
          {sidebarOpen && <div><div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15 }}>INFOCTESS</div><div style={{ fontSize: 10, color: "#64748b" }}>Class Register</div></div>}
        </div>

        {sidebarOpen && level && (
          <div style={{ margin: "12px 12px 0", padding: "10px 12px", background: "#1e293b", borderRadius: 10, border: `1px solid ${level.color}33` }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 3 }}>CURRENT LEVEL</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: level.bg, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${level.border}` }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: level.color }}>{level.id}</span>
              </div>
              <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>{level.label}</span>
            </div>
          </div>
        )}

        <nav style={{ padding: "16px 8px", flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1px", color: "#475569", padding: sidebarOpen ? "0 12px 8px" : "0 0 8px", textAlign: sidebarOpen ? "left" : "center" }}>
            {sidebarOpen ? "NAVIGATION" : "·"}
          </div>
          {navLinks.map(({ key, label, icon: Icon }) => {
            const hasBadge = key === "students" && flaggedList.length > 0;
            return (
              <div key={key} onClick={() => setNavItem(key)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: sidebarOpen ? "10px 12px" : "10px 0",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                borderRadius: 10, marginBottom: 4, cursor: "pointer",
                background: navItem === key ? "#1e3a5f" : "transparent",
                color: navItem === key ? "#60a5fa" : "#94a3b8",
                transition: "all 0.2s", position: "relative"
              }}>
                <Icon size={18} style={{ flexShrink: 0 }} />
                {sidebarOpen && <span style={{ fontSize: 14, fontWeight: navItem === key ? 600 : 400, flex: 1 }}>{label}</span>}
                {hasBadge && sidebarOpen && <span style={{ background: "#ef4444", color: "white", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20 }}>{flaggedList.length}</span>}
                {hasBadge && !sidebarOpen && <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />}
              </div>
            );
          })}
        </nav>

        <div style={{ borderTop: "1px solid #1e293b", padding: sidebarOpen ? "16px 20px" : "16px 8px" }}>
          {sidebarOpen && <div style={{ marginBottom: 12 }}><div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>{lecturerName}</div><div style={{ color: "#64748b", fontSize: 12 }}>Lecturer</div></div>}
          <div onClick={() => { sessionStorage.clear(); navigate("/login"); }} style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b", cursor: "pointer", fontSize: 13, justifyContent: sidebarOpen ? "flex-start" : "center" }}>
            <LogOut size={16} />{sidebarOpen && "Sign Out"}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Topbar */}
        <header style={{ height: 56, background: "white", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 4 }}>
              {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            {level && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: level.bg, border: `1px solid ${level.border}`, padding: "4px 12px", borderRadius: 40 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: level.color }}>{level.id}</span>
                <span style={{ fontSize: 12, color: level.color, fontWeight: 500 }}>{level.year}</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setShowLevelModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#0f172a", color: "#60a5fa", border: "1px solid #1e3a5f", borderRadius: 9, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Layers size={15} /> Switch Level
            </button>
            <button onClick={() => setShowCoursesModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "#475569", cursor: "pointer" }}>
              <Settings size={15} /> Manage Courses
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{lecturerName}</span>
          </div>
        </header>

        {!level && !showLevelModal && (
          <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", color: "#94a3b8" }}>
              <Layers size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
              <div style={{ fontWeight: 600, fontSize: 16 }}>No level selected</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Click "Switch Level" to load data</div>
            </div>
          </main>
        )}

        {/* ══ DASHBOARD PAGE ══ */}
        {level && navItem === "dashboard" && (
          <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Lecturer Dashboard</h1>
                <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>{level.label} · {level.year} — Manage students, view reports and attendance analytics</p>
              </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
              {STATS.map(({ label, value, icon: Icon, color, bg, sub }) => (
                <div key={label} style={{ background: "white", borderRadius: 14, padding: "20px 22px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginBottom: 6 }}>{label}</div>
                      <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                      {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={20} color={color} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, background: "white", borderRadius: 12, padding: 4, marginBottom: 24, border: "1px solid #e2e8f0", width: "fit-content", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              {[
                { key: "reports", label: "Reports",    icon: BarChart2  },
                { key: "qr",      label: "QR Session", icon: QrCode     },
                { key: "charts",  label: "Charts",     icon: TrendingUp },
              ].map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setTab(key)} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "9px 22px",
                  border: "none", cursor: "pointer", borderRadius: 9,
                  background: tab === key ? "#1e3a5f" : "transparent",
                  color: tab === key ? "#60a5fa" : "#64748b",
                  fontWeight: tab === key ? 600 : 400, fontSize: 13, transition: "all 0.2s"
                }}>
                  <Icon size={15} />{label}
                </button>
              ))}
            </div>

            {/* ── DASHBOARD > REPORTS TAB (simple table view) ── */}
            {tab === "reports" && (
              <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                <div style={{ padding: "22px 24px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <BarChart2 size={18} color="#3b82f6" />
                    <span style={{ fontWeight: 700, fontSize: 16 }}>Attendance Report</span>
                    <span style={{ fontSize: 12, background: level.bg, color: level.color, padding: "2px 10px", borderRadius: 20, fontWeight: 600, border: `1px solid ${level.border}` }}>{level.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div style={{ flex: "2 1 220px" }}>
                      <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>Course</label>
                      <div style={{ position: "relative" }}>
                        <select value={course} onChange={e => setCourse(e.target.value)} style={{ width: "100%", appearance: "none", padding: "9px 36px 9px 12px", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, background: "white", color: "#1e293b", cursor: "pointer" }}>
                          {level.courses.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                        </select>
                        <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }} />
                      </div>
                    </div>
                    <div style={{ flex: "1 1 140px" }}>
                      <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>Group</label>
                      <div style={{ position: "relative" }}>
                        <select value={group} onChange={handleGroupChange} style={{ width: "100%", appearance: "none", padding: "9px 36px 9px 12px", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, background: "white", color: "#1e293b", cursor: "pointer" }}>
                          {groups.map(g => <option key={g} value={g}>{g}</option>)}
                          <option value="ADD_NEW">+ Add New Group...</option>
                        </select>
                        <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }} />
                      </div>
                    </div>
                    <div style={{ flex: "2 1 200px" }}>
                      <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>Report Type</label>
                      <div style={{ position: "relative" }}>
                        <select value={reportType} onChange={e => setReportType(e.target.value)} style={{ width: "100%", appearance: "none", padding: "9px 36px 9px 12px", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, background: "white", color: "#1e293b", cursor: "pointer" }}>
                          <option>Cumulative Student Attendance</option>
                          <option>Per-Session Attendance</option>
                          <option>Weekly Summary</option>
                        </select>
                        <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }} />
                      </div>
                    </div>
                    <button style={{ display: "flex", alignItems: "center", gap: 8, background: "#1e3a5f", color: "#60a5fa", border: "none", borderRadius: 9, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
                      <Download size={15} /> Export PDF
                    </button>
                  </div>
                </div>
                {/* Progress Rings */}
                <div style={{ display: "flex", gap: 0, padding: "20px 24px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap" }}>
                  {level.progress.map(item => (
                    <div key={item.label} style={{ flex: "1 1 160px", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 16px", borderRight: "1px solid #f1f5f9", gap: 10 }}>
                      <div style={{ position: "relative" }}>
                        <ProgressRing value={item.value} color={item.color} size={88} stroke={8} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.raw ? item.raw.split(" ")[0] : `${item.value}%`}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: "#64748b", textAlign: "center", fontWeight: 500 }}>{item.label}</span>
                    </div>
                  ))}
                </div>
                {/* Table */}
                <div style={{ padding: "0 24px 24px" }}>
                  <div style={{ padding: "16px 0 10px", fontSize: 13, fontWeight: 600, color: "#475569" }}>Class Attendance Metrics · {level.label}</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {["#", "Student Name", "Index Number", "Attended", "Total", "Percentage"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: 12, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {level.students.filter(s => !group || s.group === group).map((row, i) => (
                        <tr key={row.id} style={{ background: row.pct < 75 ? "#fff7f7" : "white", borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px 14px", color: "#94a3b8" }}>{i + 1}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontWeight: 600 }}>{row.name}</span>
                              {row.flagged && (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fef3c7", color: "#b45309", padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
                                  <AlertOctagon size={10} /> ALERT
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", color: "#64748b" }}>{row.index}</td>
                          <td style={{ padding: "12px 14px" }}>{row.attended}</td>
                          <td style={{ padding: "12px 14px" }}>{row.total}</td>
                          <td style={{ padding: "12px 14px" }}>{pctBadge(row.pct)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── DASHBOARD > QR TAB ── */}
            {tab === "qr" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                    <QrCode size={18} color="#3b82f6" />
                    <span style={{ fontWeight: 700, fontSize: 16 }}>Create QR Session</span>
                    <span style={{ fontSize: 12, background: level.bg, color: level.color, padding: "2px 10px", borderRadius: 20, fontWeight: 600, border: `1px solid ${level.border}` }}>{level.label}</span>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>Course</label>
                    <div style={{ position: "relative" }}>
                      <select value={qrCourse} onChange={e => setQrCourse(e.target.value)} disabled={sessionActive} style={{ width: "100%", appearance: "none", padding: "10px 36px 10px 12px", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, background: sessionActive ? "#f8fafc" : "white", color: "#1e293b", cursor: "pointer" }}>
                        {level.courses.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>Time Window</label>
                    <div style={{ position: "relative" }}>
                      <select value={timeWindow} onChange={e => setTimeWindow(e.target.value)} disabled={sessionActive} style={{ width: "100%", appearance: "none", padding: "10px 36px 10px 12px", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, background: sessionActive ? "#f8fafc" : "white", color: "#1e293b", cursor: "pointer" }}>
                        {["5", "10", "15", "20", "30"].map(t => <option key={t} value={t}>{t} minutes</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }} />
                    </div>
                  </div>
                  {!sessionActive ? (
                    <button onClick={openSession} style={{ width: "100%", padding: "12px", border: "none", borderRadius: 10, background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <QrCode size={16} /> Open Session
                    </button>
                  ) : (
                    <button onClick={closeSession} style={{ width: "100%", padding: "12px", border: "none", borderRadius: 10, background: "#ef4444", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <XCircle size={16} /> Close Session
                    </button>
                  )}
                </div>

                <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  {sessionActive && sessionCode ? (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, color: "#10b981", fontWeight: 700, fontSize: 14 }}>
                        <Loader size={16} style={{ animation: "spin 2s linear infinite" }} /> Session Active
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 3, color: "#1e293b", marginBottom: 16 }}>{sessionCode}</div>
                      <div style={{ padding: 12, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 16 }}>
                        <QRPlaceholder code={sessionCode} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, background: countdown < 60 ? "#fef2f2" : "#eff6ff", color: countdown < 60 ? "#ef4444" : "#3b82f6", padding: "8px 20px", borderRadius: 40, fontWeight: 700, fontSize: 16 }}>
                        <Clock size={16} /> {fmtTime(countdown)}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 10, textAlign: "center" }}>Show this QR code to students to check in</div>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", color: "#cbd5e1" }}>
                      <QrCode size={64} style={{ marginBottom: 16 }} />
                      <div style={{ fontWeight: 600, color: "#94a3b8", fontSize: 14 }}>No active session</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>Open a session to generate a QR code</div>
                    </div>
                  )}
                </div>

                <div style={{ gridColumn: "1 / -1", background: "white", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                  <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                    <RefreshCw size={16} color="#64748b" /> Recent Sessions · {level.label}
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {["Course", "Session Code", "Date", "Check-ins", "Status", "Actions"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "10px 20px", color: "#64748b", fontWeight: 600, fontSize: 12, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {level.sessions.map(s => (
                        <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px 20px", fontWeight: 600 }}>{s.course}</td>
                          <td style={{ padding: "12px 20px", color: "#3b82f6", fontWeight: 600 }}>{s.id}</td>
                          <td style={{ padding: "12px 20px", color: "#64748b" }}>{s.date}</td>
                          <td style={{ padding: "12px 20px" }}>{s.checkins}</td>
                          <td style={{ padding: "12px 20px" }}><span style={{ background: "#f1f5f9", color: "#64748b", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Closed</span></td>
                          <td style={{ padding: "12px 20px" }}>
                            <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#475569", cursor: "pointer", fontWeight: 500 }}>
                              <Eye size={13} /> View List
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── DASHBOARD > CHARTS TAB ── */}
            {tab === "charts" && (
              <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", padding: 32, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                  <TrendingUp size={18} color="#3b82f6" />
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Attendance Charts</span>
                  <span style={{ fontSize: 12, background: level.bg, color: level.color, padding: "2px 10px", borderRadius: 20, fontWeight: 600, border: `1px solid ${level.border}` }}>{level.label}</span>
                </div>
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 16 }}>Attendance % by Course</div>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 160 }}>
                    {level.courses.map((c, i) => {
                      const avg = Math.round(level.students.reduce((a, s) => a + s.pct, 0) / level.students.length);
                      const val = [avg, Math.min(avg + 15, 100)][i % 2];
                      const col = val >= 75 ? "#3b82f6" : "#ef4444";
                      return (
                        <div key={c.code} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: col }}>{val}%</span>
                          <div style={{ width: "100%", height: `${val}%`, background: `linear-gradient(180deg,${col}cc,${col}44)`, borderRadius: "6px 6px 0 0", transition: "height 0.6s ease" }} />
                          <span style={{ fontSize: 10, color: "#94a3b8", textAlign: "center" }}>{c.code}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 16 }}>Overall Metrics</div>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {level.progress.map(item => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 14, background: "#f8fafc", borderRadius: 12, padding: "14px 20px", border: "1px solid #e2e8f0", flex: "1 1 200px" }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <ProgressRing value={item.value} color={item.color} size={72} stroke={7} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: item.color }}>{item.raw ? item.raw.split(" ")[0] : `${item.value}%`}</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{item.label}</div>
                        {item.raw && <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.raw}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        )}

        {/* ══ REPORTS PAGE (nav-driven, separate from dashboard) ══ */}
        {level && navItem === "reports" && (
          <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Attendance Reports</h1>
              <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>{level.label} · {level.year} — Group statistics and attendance breakdown</p>
            </div>

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Enrolled Students", value: level.students.length, color: "#3b82f6", bg: "#eff6ff", icon: Users },
                { label: "Avg. Attendance",   value: `${Math.round(level.students.reduce((a, s) => a + s.pct, 0) / level.students.length)}%`, color: "#10b981", bg: "#ecfdf5", icon: TrendingUp },
                { label: "Groups Tracked",    value: level.groups.length,   color: "#8b5cf6", bg: "#f5f3ff", icon: Layers },
              ].map(({ label, value, color, bg, icon: Icon }) => (
                <div key={label} style={{ background: "white", borderRadius: 14, padding: "20px 22px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginBottom: 6 }}>{label}</div>
                      <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={20} color={color} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pie chart + bar chart side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              {/* Pie chart */}
              <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: 28 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Group Attendance Distribution</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>Student count per group — {level.label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                  <PieChart data={groupPieData} size={200} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {groupPieData.map(g => (
                      <div key={g.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: g.color, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{g.label}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{g.value} students · avg {g.avg}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bar chart per group */}
              <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: 28 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Average Attendance by Group</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>Percentage-based comparison</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {groupPieData.map(g => (
                    <div key={g.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{g.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: g.avg >= 75 ? "#10b981" : "#ef4444" }}>{g.avg}%</span>
                      </div>
                      <div style={{ height: 10, background: "#f1f5f9", borderRadius: 10, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${g.avg}%`,
                          background: g.avg >= 75 ? `linear-gradient(90deg,${g.color},${g.color}cc)` : "linear-gradient(90deg,#ef4444,#fca5a5)",
                          borderRadius: 10, transition: "width 0.8s ease"
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, padding: "12px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>THRESHOLD</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>Groups below <strong>75%</strong> are highlighted in red and require intervention.</div>
                </div>
              </div>
            </div>

            {/* Detailed student table */}
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Detailed Student Attendance</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>All students · {level.label}</div>
                </div>
                <button onClick={handleExportCSV} style={{ display: "flex", alignItems: "center", gap: 8, background: "#1e3a5f", color: "#60a5fa", border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  <Download size={14} /> Export CSV
                </button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["#", "Student", "Index", "Group", "Attended", "Total", "Rate", "Status"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 16px", color: "#64748b", fontWeight: 600, fontSize: 12, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...level.students].sort((a, b) => b.pct - a.pct).map((row, i) => (
                    <tr key={row.id} style={{ background: row.pct < 75 ? "#fff7f7" : "white", borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "11px 16px", color: "#94a3b8" }}>{i + 1}</td>
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: row.pct >= 75 ? "#dbeafe" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: row.pct >= 75 ? "#1e40af" : "#991b1b", flexShrink: 0 }}>
                            {row.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{row.name}</div>
                            {row.flagged && <div style={{ fontSize: 10, color: "#b45309", fontWeight: 600 }}>⚠ Device alert</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "11px 16px", color: "#64748b", fontSize: 12 }}>{row.index}</td>
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{ fontSize: 11, background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{row.group}</span>
                      </td>
                      <td style={{ padding: "11px 16px", fontWeight: 600 }}>{row.attended}</td>
                      <td style={{ padding: "11px 16px", color: "#64748b" }}>{row.total}</td>
                      <td style={{ padding: "11px 16px" }}>{pctBadge(row.pct)}</td>
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                          background: row.pct === 100 ? "#dbeafe" : row.pct >= 75 ? "#d1fae5" : row.pct >= 50 ? "#fef3c7" : "#fee2e2",
                          color: row.pct === 100 ? "#1e40af" : row.pct >= 75 ? "#065f46" : row.pct >= 50 ? "#b45309" : "#991b1b"
                        }}>
                          {row.pct === 100 ? "Perfect" : row.pct >= 75 ? "Good" : row.pct >= 50 ? "At Risk" : "Critical"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        )}

        {/* ══ STUDENTS PAGE ══ */}
        {level && navItem === "students" && (
          <div style={{
            position: "fixed", inset: "56px 0 0 210px",
            background: "#f1f5f9", overflowY: "auto", zIndex: 5,
            padding: "28px 32px",
            left: sidebarOpen ? 210 : 64, transition: "left 0.3s ease"
          }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Students</h1>
              <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>{level.label} · {level.year} — {level.students.length} enrolled students</p>
            </div>

            {flaggedList.length > 0 && (
              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12 }}>
                <AlertOctagon size={20} color="#f97316" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontWeight: 700, color: "#c2410c", fontSize: 14, marginBottom: 2 }}>
                    Device Security Alert — {flaggedList.length} student{flaggedList.length > 1 ? "s" : ""} flagged
                  </div>
                  <div style={{ fontSize: 13, color: "#92400e" }}>
                    Some students have logged in from multiple devices or changed their device mid-semester. Review the <strong>Device Alerts</strong> tab below for details.
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tabs */}
            <div style={{ display: "flex", gap: 0, background: "white", borderRadius: 12, padding: 4, marginBottom: 20, border: "1px solid #e2e8f0", width: "fit-content", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              {[
                { key: "all",     label: "All Students", icon: Users },
                { key: "flagged", label: "Device Alerts", icon: Smartphone, badge: flaggedList.length },
              ].map(({ key, label, icon: Icon, badge }) => (
                <button key={key} onClick={() => setStudentTab(key)} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "9px 20px",
                  border: "none", cursor: "pointer", borderRadius: 9,
                  background: studentTab === key ? (key === "flagged" ? "#7f1d1d" : "#1e3a5f") : "transparent",
                  color: studentTab === key ? (key === "flagged" ? "#fca5a5" : "#60a5fa") : "#64748b",
                  fontWeight: studentTab === key ? 600 : 400, fontSize: 13, transition: "all 0.2s"
                }}>
                  <Icon size={14} />{label}
                  {badge > 0 && (
                    <span style={{ background: studentTab === key ? "rgba(255,255,255,0.25)" : "#ef4444", color: "white", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20 }}>{badge}</span>
                  )}
                </button>
              ))}
            </div>

            {/* All students table */}
            {studentTab === "all" && (
              <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["#", "Student Name", "Index Number", "Device", "Attended", "Total", "Attendance"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 16px", color: "#64748b", fontWeight: 600, fontSize: 12, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {level.students.map((row, i) => (
                      <tr key={row.id} style={{ background: row.flagged ? "#fffbeb" : row.pct < 75 ? "#fff7f7" : "white", borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px", color: "#94a3b8" }}>{i + 1}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 600 }}>{row.name}</span>
                            {row.flagged && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#fef3c7", color: "#b45309", padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: "pointer" }}
                                onClick={() => setAlertModalStudent(row)}>
                                <AlertOctagon size={9} /> ALERT
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#64748b" }}>{row.index}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: row.flagged ? "#fef3c7" : "#f1f5f9", color: row.flagged ? "#b45309" : "#64748b", padding: "3px 9px", borderRadius: 20, fontSize: 12 }}>
                            {row.flagged && <AlertOctagon size={10} />}
                            <Smartphone size={10} />
                            {row.device}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>{row.attended}</td>
                        <td style={{ padding: "12px 16px" }}>{row.total}</td>
                        <td style={{ padding: "12px 16px" }}>{pctBadge(row.pct)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Device alerts tab */}
            {studentTab === "flagged" && (
              <div>
                {flaggedList.length === 0 ? (
                  <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", padding: 48, textAlign: "center", color: "#94a3b8" }}>
                    <Shield size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                    <div style={{ fontWeight: 600 }}>No device alerts for {level.label}</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>All flagged alerts have been resolved</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {flaggedList.map(s => (
                      <div key={s.id} style={{ background: "white", borderRadius: 14, border: "1px solid #fed7aa", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: "18px 22px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.alertType === "multi_device" ? "#fef2f2" : "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${s.alertType === "multi_device" ? "#fecaca" : "#fde68a"}`, flexShrink: 0 }}>
                                {s.alertType === "multi_device" ? <Smartphone size={18} color="#ef4444" /> : <RefreshCw size={18} color="#b45309" />}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                                <div style={{ fontSize: 12, color: "#94a3b8" }}>{s.index}</div>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, marginLeft: 4, background: s.alertType === "multi_device" ? "#fef2f2" : "#fffbeb", color: s.alertType === "multi_device" ? "#991b1b" : "#b45309", border: `1px solid ${s.alertType === "multi_device" ? "#fecaca" : "#fde68a"}` }}>
                                {s.alertType === "multi_device" ? "Multiple Devices" : "Device Changed"}
                              </span>
                            </div>
                            <div style={{ background: "#fffbeb", borderRadius: 10, border: "1px solid #fde68a", padding: "10px 14px", fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
                              <strong>⚠ Alert:</strong> {s.flagReason}
                            </div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ marginBottom: 6 }}>{pctBadge(s.pct)}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{s.attended}/{s.total} sessions</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                          <button onClick={() => setAlertModalStudent(s)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#1e3a5f", color: "#60a5fa", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            <Eye size={13} /> View Details
                          </button>
                          <button onClick={() => handleDeleteRecord(s)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            <XCircle size={13} /> Delete Record
                          </button>
                          <button onClick={() => handleConfirmAlert(s)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            <Check size={13} /> Confirm
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ GROUPS PAGE ══ */}
        {level && navItem === "groups" && (
          <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>Groups Roster & Performance</h2>
                    <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
                      {level.label} · {level.year} — Student attendance distribution across groups. Truant students (&lt;40%) highlighted.
                    </p>
                  </div>
                  <button onClick={handleExportCSV} style={{ display: "flex", alignItems: "center", gap: 8, background: "#1e3a5f", color: "#60a5fa", border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    <Download size={14} /> Export CSV
                  </button>
                </div>

                {/* Group Selector Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
                  {groups.map((gName, idx) => {
                    const matchGroup = (sG, tG) => {
                      if (!sG || !tG) return false;
                      const sStr = String(sG).trim().toLowerCase().replace(/\s+/g, '');
                      const tStr = String(tG).trim().toLowerCase().replace(/\s+/g, '');
                      return sStr === tStr;
                    };

                    const groupStudentsList = students.filter(s => matchGroup(s.group, gName));
                    const totalInGroup = groupStudentsList.length;
                    const avgPct = totalInGroup > 0 ? Math.round(groupStudentsList.reduce((acc, s) => acc + s.pct, 0) / totalInGroup) : 0;
                    const truantCount = groupStudentsList.filter(s => s.pct < 40).length;
                    const isSelected = matchGroup(selectedGroup || groups[0], gName);

                    return (
                      <div
                        key={gName}
                        onClick={() => setSelectedGroup(gName)}
                        style={{
                          background: "white",
                          borderRadius: 16,
                          padding: "18px 20px",
                          border: isSelected ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                          boxShadow: isSelected ? "0 4px 14px rgba(59,130,246,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: isSelected ? "#eff6ff" : "#f8fafc", color: isSelected ? "#2563eb" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, border: isSelected ? "1px solid #bfdbfe" : "1px solid #e2e8f0" }}>
                              G{idx + 1}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{gName}</div>
                              <div style={{ fontSize: 11, color: "#64748b" }}>{totalInGroup} Enrolled</div>
                            </div>
                          </div>
                          {truantCount > 0 && (
                            <span style={{ fontSize: 10, background: "#fef2f2", color: "#dc2626", padding: "2px 8px", borderRadius: 20, fontWeight: 700, border: "1px solid #fecaca" }}>
                              ⚠ {truantCount} Truant
                            </span>
                          )}
                        </div>

                        <div style={{ marginTop: 6 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                            <span style={{ color: "#64748b" }}>Avg Rate</span>
                            <span style={{ fontWeight: 700, color: avgPct >= 75 ? "#16a34a" : avgPct >= 40 ? "#d97706" : "#dc2626" }}>{avgPct}%</span>
                          </div>
                          <div style={{ height: 6, background: "#f1f5f9", borderRadius: 10, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${avgPct}%`, background: avgPct >= 75 ? "#16a34a" : avgPct >= 40 ? "#f59e0b" : "#ef4444", borderRadius: 10, transition: "width 0.5s ease" }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Group Detailed Roster Container */}
                {(() => {
                  const matchGroup = (sG, tG) => {
                    if (!sG || !tG) return false;
                    const sStr = String(sG).trim().toLowerCase().replace(/\s+/g, '');
                    const tStr = String(tG).trim().toLowerCase().replace(/\s+/g, '');
                    return sStr === tStr;
                  };

                  const activeGroupName = selectedGroup || groups[0] || "Group 1";
                  const groupStudentsList = students.filter(s => matchGroup(s.group, activeGroupName));
                  const truantStudentsList = groupStudentsList.filter(s => s.pct < 40);
                  const punctualStudentsList = groupStudentsList.filter(s => s.pct >= 40);

                  let displayedGroupStudents = groupStudentsList;
                  if (groupStudentFilter === "punctual") {
                    displayedGroupStudents = punctualStudentsList;
                  } else if (groupStudentFilter === "truant") {
                    displayedGroupStudents = truantStudentsList;
                  }

                  // Sort: High attendance rate first, low attendance rate at the bottom
                  const sortedGroupStudents = [...displayedGroupStudents].sort((a, b) => b.pct - a.pct);

                  return (
                    <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                      <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 }}>{activeGroupName} — Student Roster</h3>
                            <span style={{ fontSize: 12, background: "#f1f5f9", color: "#475569", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
                              {groupStudentsList.length} Students
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
                            Students sorted by attendance. Low attendance rate (&lt;40%) placed at the bottom.
                          </p>
                        </div>

                        {/* Category Filter Tabs */}
                        <div style={{ display: "flex", gap: 4, background: "#f8fafc", padding: 4, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                          <button
                            onClick={() => setGroupStudentFilter("all")}
                            style={{
                              padding: "7px 14px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
                              background: groupStudentFilter === "all" ? "#1e3a5f" : "transparent",
                              color: groupStudentFilter === "all" ? "#60a5fa" : "#64748b"
                            }}
                          >
                            All ({groupStudentsList.length})
                          </button>
                          <button
                            onClick={() => setGroupStudentFilter("punctual")}
                            style={{
                              padding: "7px 14px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
                              background: groupStudentFilter === "punctual" ? "#16a34a" : "transparent",
                              color: groupStudentFilter === "punctual" ? "white" : "#64748b"
                            }}
                          >
                            Punctual (≥40%) ({punctualStudentsList.length})
                          </button>
                          <button
                            onClick={() => setGroupStudentFilter("truant")}
                            style={{
                              padding: "7px 14px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
                              background: groupStudentFilter === "truant" ? "#ef4444" : "transparent",
                              color: groupStudentFilter === "truant" ? "white" : "#64748b"
                            }}
                          >
                            Truant (&lt;40%) ({truantStudentsList.length})
                          </button>
                        </div>
                      </div>

                      {sortedGroupStudents.length === 0 ? (
                        <div style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>
                          <Users size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
                          <div style={{ fontWeight: 600 }}>No students in this category for {activeGroupName}</div>
                        </div>
                      ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                          <thead>
                            <tr style={{ background: "#f8fafc" }}>
                              {["#", "Student Name", "Index Number", "Attended / Total", "Attendance Rate", "Status"].map(h => (
                                <th key={h} style={{ textAlign: "left", padding: "12px 18px", color: "#64748b", fontWeight: 600, fontSize: 12, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sortedGroupStudents.map((row, i) => {
                              const isTruant = row.pct < 40;
                              return (
                                <tr key={row.id} style={{ background: isTruant ? "#fef2f2" : "white", borderBottom: "1px solid #f1f5f9" }}>
                                  <td style={{ padding: "12px 18px", color: "#94a3b8", fontWeight: 500 }}>{i + 1}</td>
                                  <td style={{ padding: "12px 18px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                      <div style={{
                                        width: 32, height: 32, borderRadius: 8,
                                        background: isTruant ? "#fee2e2" : row.pct >= 75 ? "#dbeafe" : "#fef3c7",
                                        color: isTruant ? "#dc2626" : row.pct >= 75 ? "#1e40af" : "#d97706",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 12, fontWeight: 700, flexShrink: 0
                                      }}>
                                        {row.name.charAt(0)}
                                      </div>
                                      <div>
                                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{row.name}</div>
                                        {row.flagged && <div style={{ fontSize: 10, color: "#dc2626", fontWeight: 600 }}>⚠ Device Flagged</div>}
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ padding: "12px 18px", color: "#64748b", fontSize: 13, fontWeight: 500 }}>{row.index}</td>
                                  <td style={{ padding: "12px 18px", fontWeight: 600, color: "#1e293b" }}>
                                    {row.attended} / {row.total} sessions
                                  </td>
                                  <td style={{ padding: "12px 18px" }}>{pctBadge(row.pct)}</td>
                                  <td style={{ padding: "12px 18px" }}>
                                    {isTruant ? (
                                      <span style={{ fontSize: 11, background: "#fee2e2", color: "#dc2626", padding: "3px 10px", borderRadius: 20, fontWeight: 700, border: "1px solid #fecaca" }}>
                                        ⚠ Truant (&lt;40%)
                                      </span>
                                    ) : row.pct >= 75 ? (
                                      <span style={{ fontSize: 11, background: "#d1fae5", color: "#065f46", padding: "3px 10px", borderRadius: 20, fontWeight: 700, border: "1px solid #a7f3d0" }}>
                                        ✓ Punctual
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: 11, background: "#fffbeb", color: "#b45309", padding: "3px 10px", borderRadius: 20, fontWeight: 700, border: "1px solid #fde68a" }}>
                                        Moderate (≥40%)
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  );
                })()}
          </main>
        )}

        {/* ══ PROFILE & COURSE REPS PAGE ══ */}
        {navItem === "profile" && (
          <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
            {/* Lecturer Profile Header */}
            <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg, #1e3a5f, #0f172a)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>
                  {lecturerName ? lecturerName.charAt(0) : "L"}
                </div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>{lecturerName}</h2>
                  <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 700, marginTop: 4 }}>LECTURER · DEPT OF ICT EDUCATION (INFOCTESS)</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>University of Education, Winneba (UEW)</div>
                </div>
              </div>
            </div>

            {/* Appoint & Manage Course Reps Form */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Left Column: Appoint Form */}
              <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 6 }}>👑 Appoint Course Rep for My Class</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Assign a student as Course Rep and set their login password</div>

                <form onSubmit={handleAppointRep} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>FIRST NAME *</label>
                      <input
                        type="text"
                        placeholder="e.g. Alberta"
                        value={repFirstName}
                        onChange={e => setRepFirstName(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>LAST NAME *</label>
                      <input
                        type="text"
                        placeholder="e.g. Klokpa"
                        value={repLastName}
                        onChange={e => setRepLastName(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>EMAIL ADDRESS *</label>
                      <input
                        type="email"
                        placeholder="rep@st.uew.edu.gh"
                        value={repEmail}
                        onChange={e => setRepEmail(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>INDEX NUMBER</label>
                      <input
                        type="text"
                        placeholder="e.g. 5261000018"
                        value={repIndex}
                        onChange={e => setRepIndex(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>ASSIGN COURSE</label>
                      <select
                        value={repCourse}
                        onChange={e => setRepCourse(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, background: "white" }}
                      >
                        {courses.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>ASSIGN GROUP</label>
                      <select
                        value={repGroup}
                        onChange={e => setRepGroup(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, background: "white" }}
                      >
                        {groups.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>REP LOGIN PASSWORD</label>
                    <input
                      type="text"
                      placeholder="e.g. rep123 (Default: password123)"
                      value={repPassword}
                      onChange={e => setRepPassword(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, fontWeight: 600, color: "#2563eb" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={repLoading}
                    style={{
                      marginTop: 8, background: "#15803d", color: "white", padding: "12px",
                      borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                    }}
                  >
                    {repLoading ? <Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> : "👑 Appoint Course Rep & Issue Credentials"}
                  </button>
                </form>
              </div>

              {/* Right Column: Appointed Reps Roster */}
              <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 4 }}>📋 My Appointed Course Reps ({courseReps.length})</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Reps authorized to open sessions for your courses</div>

                {courseReps.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", background: "#f8fafc", borderRadius: 12 }}>
                    <Users size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                    <div style={{ fontWeight: 600 }}>No Course Reps appointed yet</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Fill out the form on the left to appoint a Rep for your course.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto" }}>
                    {courseReps.map(r => (
                      <div key={r.id} style={{ background: "#f8fafc", borderRadius: 12, padding: 14, border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{r.name}</div>
                            <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>{r.email}</div>
                          </div>
                          <span style={{ fontSize: 10, background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>
                            {r.course_code} · {r.group_name}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 8, display: "flex", justifyContent: "space-between" }}>
                          <span>Index: <strong>{r.index_number}</strong></span>
                          <span>Appointed By: <strong>{r.created_by}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        )}
      </div>

      {/* ══ MANAGE COURSES MODAL ══ */}
      {showCoursesModal && (
        <div onClick={() => setShowCoursesModal(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)", zIndex: 9000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, animation: "fadeIn 0.2s ease"
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "white", borderRadius: 20, maxWidth: 540, width: "100%",
            boxShadow: "0 25px 50px rgba(0,0,0,0.25)", animation: "slideUp 0.25s ease", overflow: "hidden"
          }}>
            {/* Modal Header */}
            <div style={{
              background: "linear-gradient(135deg, #1e3a5f, #0f172a)",
              padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BookOpen size={20} color="#60a5fa" />
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>Manage Courses</div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Level {level ? level.id : "100"} · Add & delete your assigned courses</div>
                </div>
              </div>
              <button onClick={() => setShowCoursesModal(false)} style={{
                background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8,
                width: 32, height: 32, cursor: "pointer", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              {/* Form to Add New Course */}
              <form onSubmit={handleAddCourse} style={{ background: "#f8fafc", padding: 18, borderRadius: 14, border: "1px solid #e2e8f0", marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 12 }}>➕ Add New Course to My Dashboard</div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>COURSE CODE</label>
                    <input
                      type="text"
                      placeholder="e.g. ICTE125"
                      value={newCourseCode}
                      onChange={e => setNewCourseCode(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, textTransform: "uppercase", fontWeight: 600 }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>COURSE TITLE</label>
                    <input
                      type="text"
                      placeholder="e.g. Multimedia Authoring"
                      value={newCourseName}
                      onChange={e => setNewCourseName(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={coursesLoading}
                  style={{
                    width: "100%", background: "#2563eb", color: "white", padding: "11px",
                    borderRadius: 10, border: "none", fontWeight: 700, fontSize: 13,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                  }}
                >
                  {coursesLoading ? <Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> : "Save Course to My Dashboard"}
                </button>
              </form>

              {/* Current Courses List */}
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 10 }}>📚 Your Assigned Courses ({courses.length})</div>
              {courses.length === 0 ? (
                <div style={{ textAlign: "center", padding: 20, color: "#94a3b8", fontSize: 13, background: "#f8fafc", borderRadius: 10 }}>
                  No courses added yet for this level. Add one above!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                  {courses.map(c => (
                    <div key={c.code} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: "#ffffff", padding: "12px 14px", borderRadius: 10,
                      border: "1px solid #e2e8f0"
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#2563eb" }}>{c.code}</div>
                        <div style={{ fontSize: 12, color: "#475569" }}>{c.name}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteCourse(c.code)}
                        style={{
                          background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca",
                          borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 600,
                          cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                        }}
                      >
                        <XCircle size={14} /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ALERT DETAIL MODAL ── */}
      <AlertDetailModal
        student={alertModalStudent}
        onClose={() => setAlertModalStudent(null)}
        onConfirm={handleConfirmAlert}
        onDelete={handleDeleteRecord}
      />

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        select:focus { outline: 2px solid #3b82f6; outline-offset: 1px; }
        ::-webkit-scrollbar { width: 4px }
        ::-webkit-scrollbar-track { background: #f1f5f9 }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px }
      `}</style>
    </div>
  );
}