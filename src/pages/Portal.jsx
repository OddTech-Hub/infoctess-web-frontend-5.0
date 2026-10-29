import { useState, useEffect } from 'react';
import {
  LogIn, Eye, EyeOff, UserCheck, GraduationCap,
  ArrowLeft, AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';

// Logo from public folder
const infotessLogo = "/infotess logo.jpg";

// API URLs
const LECTURER_LOGIN_URL = `${API_BASE_URL}/api/auth/lecturer/login/`;
const REP_LOGIN_URL      = `${API_BASE_URL}/api/auth/rep/login/`;

function saveWebUser(user, token) {
  sessionStorage.setItem('web_user', JSON.stringify(user));
  sessionStorage.setItem('role', user.role || '');
  if (token) {
    const accessToken = typeof token === 'string' ? token : (token.access || token.token || '');
    const refreshToken = typeof token === 'string' ? '' : (token.refresh || '');
    sessionStorage.setItem('access_token', accessToken);
    sessionStorage.setItem('refresh_token', refreshToken);
  }
}

export default function Portal() {
  const navigate = useNavigate();

  const [panel, setPanel] = useState('lecturer');
  const [showLectPass, setShowLectPass] = useState(false);
  const [showRepPass, setShowRepPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 880);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lecturer state
  const [lectEmail, setLectEmail] = useState('');
  const [lectPassword, setLectPassword] = useState('');
  const [lectError, setLectError] = useState('');
  const [lectSuccess, setLectSuccess] = useState('');

  // Rep state
  const [repEmail, setRepEmail] = useState('');
  const [repPassword, setRepPassword] = useState('');
  const [repError, setRepError] = useState('');
  const [repSuccess, setRepSuccess] = useState('');

  const isRight = panel === 'rep';

  const switchPanel = (targetPanel) => {
    setPanel(targetPanel);
    setLectError('');
    setLectSuccess('');
    setRepError('');
    setRepSuccess('');
  };

  // Lecturer submit
  async function handleLecturerSubmit(e) {
    e.preventDefault();
    setLectError('');
    setLectSuccess('');

    if (!lectEmail.trim()) { setLectError('Email is required.'); return; }
    if (!lectPassword) { setLectError('Password is required.'); return; }

    setLoading(true);
    try {
      const res = await fetch(LECTURER_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: lectEmail.trim().toLowerCase(),
          password: lectPassword,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setLectError(json.message || 'Login failed. Please try again.');
        return;
      }

      const userRole = (json.data.user?.role || '').toLowerCase();
      if (userRole !== 'lecturer' && !json.data.user?.is_staff && !json.data.user?.is_superuser) {
        setLectError(`Access Denied: Your account is registered as a ${userRole === 'rep' ? 'Course Representative' : 'Student'}. You cannot log into the Lecturer Portal. Please use the appropriate portal.`);
        return;
      }

      saveWebUser(json.data.user, json.data.token);
      setLectSuccess(`Welcome back, ${json.data.user.first_name}!`);
      setTimeout(() => navigate('/lec'), 800);

    } catch (err) {
      console.error('Lecturer login error:', err);
      setLectError('Could not reach the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  // Course Rep submit
  async function handleRepSubmit(e) {
    e.preventDefault();
    setRepError('');
    setRepSuccess('');

    if (!repEmail.trim()) { setRepError('Email or Index Number is required.'); return; }
    if (!repPassword) { setRepError('Password is required.'); return; }

    setLoading(true);
    try {
      const res = await fetch(REP_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: repEmail.trim().toLowerCase(),
          password: repPassword,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setRepError(json.message || 'Login failed. Please try again.');
        return;
      }

      const userRole = (json.data.user?.role || '').toLowerCase();
      if (userRole !== 'rep') {
        setRepError(`Access Denied: Your account is registered as a ${userRole === 'lecturer' ? 'Lecturer' : 'Student'}. You cannot log into the Course Representative Portal. Please use the appropriate portal.`);
        return;
      }

      saveWebUser(json.data.user, json.data.token);
      setRepSuccess(`Welcome, ${json.data.user.first_name}!`);
      setTimeout(() => navigate('/rep'), 800);

    } catch (err) {
      console.error('Rep login error:', err);
      setRepError('Could not reach the server. Check your connection.');
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

      {/* MOBILE VIEW (< 880px): Clean Segmented Tabs, Zero Glitchy Sliding */}
      {isMobile ? (
        <div style={S.mobileCard}>
          <div style={S.logo}>
            <img src={infotessLogo} alt="INFOTESS Logo" style={S.logoImg} />
          </div>

          <h1 style={S.heading}>Staff Portal</h1>
          <p style={S.subheading}>Select your role to access your academic dashboard</p>

          {/* Segmented Pill Tabs */}
          <div style={S.tabBar}>
            <button
              type="button"
              onClick={() => switchPanel('lecturer')}
              style={{
                ...S.tabBtn,
                background: panel === 'lecturer' ? '#ffffff' : 'transparent',
                color: panel === 'lecturer' ? PRIMARY : '#64748b',
                boxShadow: panel === 'lecturer' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                fontWeight: panel === 'lecturer' ? 700 : 500,
              }}
            >
              <GraduationCap size={15} /> Lecturer
            </button>
            <button
              type="button"
              onClick={() => switchPanel('rep')}
              style={{
                ...S.tabBtn,
                background: panel === 'rep' ? '#ffffff' : 'transparent',
                color: panel === 'rep' ? PRIMARY : '#64748b',
                boxShadow: panel === 'rep' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                fontWeight: panel === 'rep' ? 700 : 500,
              }}
            >
              <UserCheck size={15} /> Course Rep
            </button>
          </div>

          {/* Lecturer Form on Mobile */}
          {panel === 'lecturer' ? (
            <form onSubmit={handleLecturerSubmit} style={S.mobileForm}>
              <div style={S.badge}><GraduationCap size={13} /> Faculty Member</div>

              {lectError && <Alert type="error" msg={lectError} />}
              {lectSuccess && <Alert type="success" msg={lectSuccess} />}

              <input
                style={S.input}
                type="email"
                placeholder="Faculty Email address"
                value={lectEmail}
                onChange={e => { setLectEmail(e.target.value); setLectError(''); }}
                required
                autoComplete="email"
              />

              <div style={S.passWrap}>
                <input
                  style={S.input}
                  type={showLectPass ? 'text' : 'password'}
                  placeholder="Password"
                  value={lectPassword}
                  onChange={e => { setLectPassword(e.target.value); setLectError(''); }}
                  required
                />
                <button type="button" style={S.eyeBtn} onClick={() => setShowLectPass(v => !v)}>
                  {showLectPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button type="submit" style={S.submitBtn} disabled={loading}>
                {loading
                  ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  : <LogIn size={16} />
                }
                {loading ? 'Signing in...' : 'Sign In as Lecturer'}
              </button>
            </form>
          ) : (
            /* Course Rep Form on Mobile */
            <form onSubmit={handleRepSubmit} style={S.mobileForm}>
              <div style={S.badge}><UserCheck size={13} /> Course Representative</div>

              {repError && <Alert type="error" msg={repError} />}
              {repSuccess && <Alert type="success" msg={repSuccess} />}

              <input
                style={S.input}
                type="text"
                placeholder="Email or Index Number"
                value={repEmail}
                onChange={e => { setRepEmail(e.target.value); setRepError(''); }}
                required
              />

              <div style={S.passWrap}>
                <input
                  style={S.input}
                  type={showRepPass ? 'text' : 'password'}
                  placeholder="Password"
                  value={repPassword}
                  onChange={e => { setRepPassword(e.target.value); setRepError(''); }}
                  required
                />
                <button type="button" style={S.eyeBtn} onClick={() => setShowRepPass(v => !v)}>
                  {showRepPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button type="submit" style={S.submitBtn} disabled={loading}>
                {loading
                  ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  : <LogIn size={16} />
                }
                {loading ? 'Signing in...' : 'Sign In as Course Rep'}
              </button>
            </form>
          )}

          <div style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
            <span>Are you a student? </span>
            <a
              href="/login"
              onClick={(e) => { e.preventDefault(); navigate('/login'); }}
              style={{ color: PRIMARY, fontWeight: 600, textDecoration: 'none' }}
            >
              Student Portal &rarr;
            </a>
          </div>
        </div>
      ) : (
        /* DESKTOP VIEW (>= 880px): Premium Sliding Animation with Side Overlay */
        <div style={S.card}>
          {/* Lecturer form (left) */}
          <div style={{ ...S.formPane, ...(isRight ? S.formPaneHidden : S.formPaneVisible) }}>
            <form onSubmit={handleLecturerSubmit} style={S.form}>
              <div style={S.logo}>
                <img src={infotessLogo} alt="INFOTESS Logo" style={S.logoImg} />
              </div>
              <h1 style={S.heading}>Lecturer Portal</h1>
              <div style={S.badge}><GraduationCap size={14} /> Faculty Access</div>

              {lectError && <Alert type="error" msg={lectError} />}
              {lectSuccess && <Alert type="success" msg={lectSuccess} />}

              <input
                style={S.input}
                type="email"
                placeholder="Email address"
                value={lectEmail}
                onChange={e => { setLectEmail(e.target.value); setLectError(''); }}
                required
                autoComplete="email"
              />

              <div style={S.passWrap}>
                <input
                  style={S.input}
                  type={showLectPass ? 'text' : 'password'}
                  placeholder="Password"
                  value={lectPassword}
                  onChange={e => { setLectPassword(e.target.value); setLectError(''); }}
                  required
                />
                <button type="button" style={S.eyeBtn} onClick={() => setShowLectPass(v => !v)}>
                  {showLectPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button type="submit" style={S.submitBtn} disabled={loading}>
                {loading
                  ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  : <LogIn size={16} />
                }
                {loading ? 'Signing in...' : 'Sign In as Lecturer'}
              </button>

              <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                <span>Are you a student? </span>
                <a
                  href="/login"
                  onClick={(e) => { e.preventDefault(); navigate('/login'); }}
                  style={{ color: PRIMARY, fontWeight: 600, textDecoration: 'none' }}
                >
                  Student Portal
                </a>
              </div>
            </form>
          </div>

          {/* Course Rep form (right) */}
          <div style={{ ...S.formPane, left: '50%', ...(isRight ? S.formPaneVisible : S.formPaneHidden) }}>
            <form onSubmit={handleRepSubmit} style={S.form}>
              <div style={S.logo}>
                <img src={infotessLogo} alt="INFOTESS Logo" style={S.logoImg} />
              </div>
              <h1 style={S.heading}>Course Rep Portal</h1>
              <div style={S.badge}><UserCheck size={14} /> Representative Access</div>

              {repError && <Alert type="error" msg={repError} />}
              {repSuccess && <Alert type="success" msg={repSuccess} />}

              <input
                style={S.input}
                type="text"
                placeholder="Email or Index Number"
                value={repEmail}
                onChange={e => { setRepEmail(e.target.value); setRepError(''); }}
                required
              />

              <div style={S.passWrap}>
                <input
                  style={S.input}
                  type={showRepPass ? 'text' : 'password'}
                  placeholder="Password"
                  value={repPassword}
                  onChange={e => { setRepPassword(e.target.value); setRepError(''); }}
                  required
                />
                <button type="button" style={S.eyeBtn} onClick={() => setShowRepPass(v => !v)}>
                  {showRepPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button type="submit" style={S.submitBtn} disabled={loading}>
                {loading
                  ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  : <LogIn size={16} />
                }
                {loading ? 'Signing in...' : 'Sign In as Course Rep'}
              </button>

              <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                <span>Are you a student? </span>
                <a
                  href="/login"
                  onClick={(e) => { e.preventDefault(); navigate('/login'); }}
                  style={{ color: PRIMARY, fontWeight: 600, textDecoration: 'none' }}
                >
                  Student Portal
                </a>
              </div>
            </form>
          </div>

          {/* Desktop Overlay Slider */}
          <div style={{ ...S.overlay, ...(isRight ? S.overlayLeft : S.overlayRight) }}>
            <div style={S.overlayInner}>
              {isRight ? (
                <>
                  <div style={S.overlayIcon}><GraduationCap size={36} color="white" /></div>
                  <h2 style={S.overlayHeading}>Lecturer Dashboard</h2>
                  <p style={S.overlayText}>Sign in with your faculty email and password to manage courses and view real-time attendance reports.</p>
                  <FeaturePills items={['Live Tracking', 'Auto Reports', 'Analytics']} />
                  <button style={S.switchBtn} onClick={() => switchPanel('lecturer')}>Switch to Lecturer</button>
                </>
              ) : (
                <>
                  <div style={S.overlayIcon}><UserCheck size={36} color="white" /></div>
                  <h2 style={S.overlayHeading}>Course Rep Dashboard</h2>
                  <p style={S.overlayText}>Manage attendance sessions, generate QR codes, and track student participation for your class group.</p>
                  <FeaturePills items={['QR Generation', 'Check-in Mgmt', 'Reports']} />
                  <button style={S.switchBtn} onClick={() => switchPanel('rep')}>Switch to Course Rep</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #9ca3af; }
        input:focus { outline: none; box-shadow: 0 0 0 2px rgba(42,107,158,0.35); background: #fff; }
        button:active { transform: scale(0.98); }
      `}</style>
    </div>
  );
}

function Alert({ type, msg }) {
  const isErr = type === 'error';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 14px', borderRadius: 10, marginBottom: 12,
      width: '100%', fontSize: 13, boxSizing: 'border-box',
      background: isErr ? '#fef2f2' : '#f0fdf4',
      color: isErr ? '#dc2626' : '#16a34a',
      border: `1px solid ${isErr ? '#fecaca' : '#bbf7d0'}`,
    }}>
      {isErr ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
      {msg}
    </div>
  );
}

function FeaturePills({ items }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', margin: '16px 0 24px' }}>
      {items.map(item => (
        <span key={item} style={{
          background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 40, padding: '5px 14px',
          fontSize: 12, color: 'white', fontWeight: 500,
        }}>✓ {item}</span>
      ))}
    </div>
  );
}

const OVERLAY_GRAD = `linear-gradient(135deg, #2A6B9E 0%, #0E4B63 100%)`;
const BUTTON_GRAD = `linear-gradient(135deg, #1E5A87 0%, #0a3a4fff 100%)`;
const PRIMARY = '#2A6B9E';
const TRANS = 'all 0.55s cubic-bezier(0.65, 0, 0.35, 1)';

const S = {
  page: { minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative', overflow: 'hidden', fontFamily: "'DM Sans','Segoe UI',sans-serif" },
  blob1: { position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(42,107,158,0.05)', filter: 'blur(80px)', pointerEvents: 'none' },
  blob2: { position: 'absolute', bottom: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(14,75,99,0.05)', filter: 'blur(80px)', pointerEvents: 'none' },
  blob3: { position: 'absolute', top: '40%', left: '40%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(42,107,158,0.03)', filter: 'blur(60px)', pointerEvents: 'none' },
  backBtn: { position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.04)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.08)', padding: '8px 16px', borderRadius: 12, color: '#334155', cursor: 'pointer', fontSize: 13, fontWeight: 500, zIndex: 300 },
  
  // Mobile Single-Card Layout
  mobileCard: { width: '100%', maxWidth: 440, background: '#ffffff', borderRadius: 28, boxShadow: '0 20px 48px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box', zIndex: 10 },
  subheading: { fontSize: 13, color: '#64748b', margin: '0 0 18px', textAlign: 'center' },
  tabBar: { display: 'flex', width: '100%', background: '#f1f5f9', borderRadius: 14, padding: 4, marginBottom: 20, boxSizing: 'border-box' },
  tabBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: 'none', borderRadius: 10, padding: '10px 12px', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s ease' },
  mobileForm: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' },

  // Desktop Slider Card Layout
  card: { background: '#ffffff', borderRadius: 40, boxShadow: '0 32px 64px rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden', width: 960, maxWidth: '100%', minHeight: 580, border: '1px solid rgba(0,0,0,0.04)' },
  formPane: { position: 'absolute', top: 0, height: '100%', width: '50%', transition: TRANS, zIndex: 2 },
  formPaneVisible: { opacity: 1, pointerEvents: 'all', transform: 'translateX(0)' },
  formPaneHidden: { opacity: 0, pointerEvents: 'none', transform: 'translateX(-8px)' },
  form: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 48px', background: '#fff' },
  
  logo: { width: 54, height: 54, borderRadius: 16, background: OVERLAY_GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 8px 20px rgba(42,107,158,0.2)', overflow: 'hidden' },
  logoImg: { width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 },
  heading: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', textAlign: 'center' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(42,107,158,0.08)', border: '1px solid rgba(42,107,158,0.2)', padding: '5px 14px', borderRadius: 40, fontSize: 12, fontWeight: 600, color: PRIMARY, marginBottom: 16 },
  input: { width: '100%', padding: '13px 16px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 14, color: '#0f172a', marginBottom: 12, transition: 'all 0.2s', boxSizing: 'border-box' },
  passWrap: { position: 'relative', width: '100%' },
  eyeBtn: { position: 'absolute', right: 12, top: '45%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 6, lineHeight: 0 },
  submitBtn: { width: '100%', padding: '13px 0', background: BUTTON_GRAD, color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', letterSpacing: 0.3, boxShadow: '0 6px 18px rgba(30,90,135,0.3)', transition: TRANS, marginTop: 4 },
  
  // Overlay for Desktop
  overlay: { position: 'absolute', top: 0, height: '100%', width: '50%', background: OVERLAY_GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: TRANS, zIndex: 100, borderRadius: 40 },
  overlayRight: { left: '50%' },
  overlayLeft: { left: '0%' },
  overlayInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 36px', textAlign: 'center' },
  overlayIcon: { width: 70, height: 70, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  overlayHeading: { fontSize: 26, fontWeight: 700, color: 'white', margin: '0 0 10px' },
  overlayText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: '0 0 12px' },
  switchBtn: { marginTop: 4, padding: '12px 32px', borderRadius: 40, background: 'transparent', border: '2px solid rgba(255,255,255,0.8)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.5, textTransform: 'uppercase', transition: TRANS },
};
