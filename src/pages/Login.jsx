import { useState } from 'react';
import {
  LogIn, Eye, EyeOff, GraduationCap,
  ArrowLeft, AlertCircle, CheckCircle2, Loader2, QrCode, Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';

const infotessLogo = "/infotess logo.jpg";
const STUDENT_LOGIN_URL = `${API_BASE_URL}/api/auth/rep/login/`;

function saveWebUser(user, token) {
  sessionStorage.setItem('web_user', JSON.stringify(user));
  sessionStorage.setItem('role', user.role || 'student');
  if (token) {
    const accessToken = typeof token === 'string' ? token : (token.access || token.token || '');
    const refreshToken = typeof token === 'string' ? '' : (token.refresh || '');
    sessionStorage.setItem('access_token', accessToken);
    sessionStorage.setItem('refresh_token', refreshToken);
  }
}

export default function Login() {
  const navigate = useNavigate();

  const [indexNum, setIndexNum] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleStudentSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!indexNum.trim()) { setError('Index number or student email is required.'); return; }
    if (!password) { setError('Password is required.'); return; }

    setLoading(true);

    try {
      const res = await fetch(STUDENT_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index_number: indexNum.trim(),
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Invalid index number or password.');
      }

      const userData = data.data?.user || data.user || {
        index_number: indexNum.trim(),
        role: 'student',
      };
      const token = data.data?.token || data.token || data.access_token || null;

      saveWebUser(userData, token);
      setSuccess('Login successful! Redirecting to Student Dashboard...');
      setTimeout(() => navigate('/student'), 800);

    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.page}>
      <div style={S.blob1} />
      <div style={S.blob2} />
      <div style={S.blob3} />

      <button style={S.backBtn} onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div style={S.container}>
        {/* Left Form: Student Login */}
        <div style={S.formPane}>
          <form style={S.form} onSubmit={handleStudentSubmit}>
            <div style={S.logo}>
              <img src={infotessLogo} alt="INFOTESS Logo" style={S.logoImg} />
            </div>

            <h1 style={S.heading}>Student Portal</h1>
            <div style={S.badge}>
              <GraduationCap size={14} color="#2A6B9E" />
              <span>Smart Attendance Sign In</span>
            </div>

            {error && (
              <div style={S.alertError}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div style={S.alertSuccess}>
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{success}</span>
              </div>
            )}

            <input
              type="text"
              placeholder="Index Number (e.g. 5261000018)"
              value={indexNum}
              onChange={(e) => setIndexNum(e.target.value)}
              style={S.input}
              autoComplete="username"
            />

            <div style={S.passWrap}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Student Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={S.input}
                autoComplete="current-password"
              />
              <button
                type="button"
                style={S.eyeBtn}
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              style={{ ...S.submitBtn, opacity: loading ? 0.75 : 1 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={16} /> Sign In as Student
                </>
              )}
            </button>

            <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#64748b' }}>
              <span>Are you a faculty lecturer or course rep? </span>
              <a
                href="/portal"
                onClick={(e) => { e.preventDefault(); navigate('/portal'); }}
                style={{ color: '#2A6B9E', fontWeight: 600, textDecoration: 'none' }}
              >
                Staff Portal
              </a>
            </div>
          </form>
        </div>

        {/* Right Info Overlay Slider */}
        <div style={S.overlay}>
          <div style={S.overlayInner}>
            <div style={S.overlayIcon}>
              <QrCode size={38} color="white" />
            </div>
            <h2 style={S.overlayHeading}>Fast Attendance Marking</h2>
            <p style={S.overlayText}>
              Scan the live projector QR code in class or enter the session code to verify your attendance instantly.
            </p>
            <div style={S.pillsContainer}>
              <span style={S.pill}><Smartphone size={12} /> Mobile Friendly</span>
              <span style={S.pill}><CheckCircle2 size={12} /> Instant Check-in</span>
              <span style={S.pill}><GraduationCap size={12} /> Standing Analytics</span>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}

const OVERLAY_GRAD = "linear-gradient(135deg, #2A6B9E 0%, #0E4B63 100%)";
const BUTTON_GRAD = "linear-gradient(135deg, #1E5A87 0%, #0a3a4fff 100%)";
const PRIMARY = '#2A6B9E';

const S = {
  page: { minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden', fontFamily: "'DM Sans','Segoe UI',sans-serif" },
  blob1: { position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(42,107,158,0.05)', filter: 'blur(80px)', pointerEvents: 'none' },
  blob2: { position: 'absolute', bottom: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(14,75,99,0.05)', filter: 'blur(80px)', pointerEvents: 'none' },
  blob3: { position: 'absolute', top: '40%', left: '40%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(42,107,158,0.03)', filter: 'blur(60px)', pointerEvents: 'none' },
  backBtn: { position: 'absolute', top: 28, left: 28, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.1)', padding: '10px 20px', borderRadius: 12, color: '#333', cursor: 'pointer', fontSize: 14, fontWeight: 500, zIndex: 300 },
  container: { position: 'relative', width: '100%', maxWidth: 960, height: 580, background: '#ffffff', borderRadius: 36, boxShadow: '0 25px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex' },
  formPane: { flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  form: { width: '100%', maxWidth: 380, padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  logo: { width: 56, height: 56, borderRadius: 16, background: OVERLAY_GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 8px 20px rgba(42,107,158,0.2)', overflow: 'hidden' },
  logoImg: { width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 },
  heading: { fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 6px' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(42,107,158,0.08)', border: '1px solid rgba(42,107,158,0.2)', padding: '6px 14px', borderRadius: 40, fontSize: 12, fontWeight: 600, color: PRIMARY, marginBottom: 16 },
  input: { width: '100%', padding: '13px 16px', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 14, color: '#111827', marginBottom: 12, transition: 'all 0.2s', boxSizing: 'border-box' },
  passWrap: { position: 'relative', width: '100%' },
  eyeBtn: { position: 'absolute', right: 12, top: '45%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 6 },
  submitBtn: { width: '100%', padding: '13px 0', background: BUTTON_GRAD, color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', letterSpacing: 0.3, boxShadow: '0 6px 18px rgba(30,90,135,0.4)', marginTop: 4 },
  alertError: { width: '100%', padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, boxSizing: 'border-box' },
  alertSuccess: { width: '100%', padding: '10px 14px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, boxSizing: 'border-box' },
  overlay: { flex: 1, background: OVERLAY_GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '36px 0 0 36px', padding: 40 },
  overlayInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 360 },
  overlayIcon: { width: 72, height: 72, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  overlayHeading: { fontSize: 26, fontWeight: 700, color: 'white', margin: '0 0 10px' },
  overlayText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: '0 0 20px' },
  pillsContainer: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  pill: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', color: 'white', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, backdropFilter: 'blur(6px)' },
};

