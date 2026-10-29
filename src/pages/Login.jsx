import React, { useState } from 'react';
import {
  GraduationCap, ArrowLeft, QrCode, Smartphone,
  CheckCircle2, AlertCircle, Eye, EyeOff, Loader2, LogIn, Lock, KeyRound, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STUDENT_LOGIN_URL, API_BASE_URL, saveWebUser } from '../api/config';
import { getDeviceInfo } from '../utils/deviceUtils';

export default function Login() {
  const navigate = useNavigate();
  const [indexNum, setIndexNum] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // First-Time Login Password Change State
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const [tempToken, setTempToken] = useState(null);
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [changePassError, setChangePassError] = useState('');

  async function handleStudentSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanInput = indexNum.trim();
    if (!cleanInput) { setError('Index number or Gmail address is required.'); return; }
    if (!password) { setError('Password is required.'); return; }

    setLoading(true);

    try {
      const { deviceId, deviceName } = getDeviceInfo();

      const res = await fetch(STUDENT_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanInput,
          index_number: cleanInput,
          password: password,
          device_id: deviceId,
          device_name: deviceName
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Invalid index number, Gmail, or password.');
      }

      const userData = data.data?.user || data.user || {
        index_number: cleanInput,
        role: 'student',
      };
      const token = data.data?.token || data.token || data.access_token || null;

      // STRICT ROLE ABSTRACTION: Ensure only Students can log into Student Portal
      const userRole = (userData.role || '').toLowerCase();
      if (userRole !== 'student') {
        const portalTarget = userRole === 'lecturer' ? 'Lecturer Portal' : 'Course Rep Portal';
        setError(`Access Denied: Your account is registered as a ${userRole === 'lecturer' ? 'Lecturer' : 'Course Representative'}. You cannot log into the Student Portal. Please use the ${portalTarget}.`);
        setLoading(false);
        return;
      }

      // Check if student must change password on first login
      if (userData.must_change_password) {
        setTempUser(userData);
        setTempToken(token);
        setShowChangePassModal(true);
        setLoading(false);
        return;
      }

      saveWebUser(userData, token);
      setSuccess('Login successful! Redirecting to Student Dashboard...');
      setTimeout(() => navigate('/student'), 800);

    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your details.');
    } finally {
      setLoading(false);
    }
  }

  // Handle first-time password change submit
  async function handleChangePasswordSubmit(e) {
    e.preventDefault();
    setChangePassError('');

    if (!newPassword || newPassword.length < 6) {
      setChangePassError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePassError('Passwords do not match. Please verify.');
      return;
    }

    setChangePassLoading(true);

    try {
      const accessToken = typeof tempToken === 'object' && tempToken ? tempToken.access : tempToken;
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Failed to update password.');
      }

      // Update local student user
      const updatedUser = {
        ...tempUser,
        must_change_password: false
      };
      saveWebUser(updatedUser, tempToken);

      setShowChangePassModal(false);
      setSuccess('Password set successfully! Taking you to your dashboard...');
      setTimeout(() => navigate('/student'), 1000);

    } catch (err) {
      setChangePassError(err.message || 'Could not update password. Please try again.');
    } finally {
      setChangePassLoading(false);
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
        <div style={S.formPane}>
          <form style={S.form} onSubmit={handleStudentSubmit}>
            <div style={S.logo}>
              <img src="/infotess.png" alt="INFOCTESS" style={S.logoImg} onError={(e) => { e.target.style.display = 'none'; }} />
            </div>

            <h1 style={S.heading}>Student Portal</h1>
            <div style={S.badge}>
              <GraduationCap size={14} />
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

            <div style={{ width: '100%', marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                INDEX NUMBER OR STUDENT GMAIL
              </label>
              <input
                type="text"
                placeholder="e.g. 5261000018 or student@gmail.com"
                value={indexNum}
                onChange={(e) => setIndexNum(e.target.value)}
                style={S.input}
                autoComplete="username"
              />
            </div>

            <div style={{ width: '100%', marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                PASSWORD
              </label>
              <div style={S.passWrap}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your student password"
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
      </div>

      {/* ── FIRST-TIME LOGIN FORCE PASSWORD CHANGE MODAL ── */}
      {showChangePassModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 16
        }}>
          <div style={{
            background: 'white', borderRadius: 28, padding: '32px 28px', width: '100%', maxWidth: 440,
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.4)', textAlign: 'center'
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #1E5A87, #2A6B9E)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              boxShadow: '0 8px 20px rgba(30,90,135,0.25)'
            }}>
              <KeyRound size={28} />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
              First-Time Sign In Setup
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
              Welcome to INFOCTESS! Please set your personal secret password. You will use this password for all future logins.
            </p>

            {changePassError && (
              <div style={{
                background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b',
                padding: '10px 14px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left'
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{changePassError}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  CREATE NEW PASSWORD (MIN 6 CHARACTERS)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ ...S.input, marginBottom: 0 }}
                    required
                  />
                  <button
                    type="button"
                    style={S.eyeBtn}
                    onClick={() => setShowNewPass(!showNewPass)}
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  CONFIRM NEW PASSWORD
                </label>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ ...S.input, marginBottom: 0 }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={changePassLoading}
                style={{
                  width: '100%', padding: '14px', marginTop: 10,
                  background: 'linear-gradient(135deg, #1E5A87, #0A3A4F)',
                  color: 'white', border: 'none', borderRadius: 12, fontWeight: 800,
                  fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(30,90,135,0.3)',
                  opacity: changePassLoading ? 0.75 : 1
                }}
              >
                {changePassLoading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Saving Password to Database...
                  </>
                ) : (
                  <>
                    <Lock size={16} /> Save Password & Continue
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const OVERLAY_GRAD = "linear-gradient(135deg, #2A6B9E 0%, #0E4B63 100%)";
const BUTTON_GRAD = "linear-gradient(135deg, #1E5A87 0%, #0a3a4fff 100%)";
const PRIMARY = '#2A6B9E';

const S = {
  page: { minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden', fontFamily: "'DM Sans','Segoe UI',sans-serif" },
  blob1: { position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(42,107,158,0.05)', filter: 'blur(80px)', pointerEvents: 'none' },
  blob2: { position: 'absolute', bottom: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(14,75,99,0.05)', filter: 'blur(80px)', pointerEvents: 'none' },
  blob3: { position: 'absolute', top: '40%', left: '40%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(42,107,158,0.03)', filter: 'blur(60px)', pointerEvents: 'none' },
  backBtn: { position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: 12, color: '#334155', cursor: 'pointer', fontSize: 13, fontWeight: 600, zIndex: 300, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' },
  container: { position: 'relative', width: '100%', maxWidth: 440, background: '#ffffff', borderRadius: 32, boxShadow: '0 25px 60px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', border: '1px solid #e2e8f0' },
  formPane: { flex: 1, padding: '40px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  form: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  logo: { width: 56, height: 56, borderRadius: 16, background: OVERLAY_GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 8px 20px rgba(42,107,158,0.2)', overflow: 'hidden' },
  logoImg: { width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 },
  heading: { fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(42,107,158,0.08)', border: '1px solid rgba(42,107,158,0.2)', padding: '6px 14px', borderRadius: 40, fontSize: 12, fontWeight: 700, color: PRIMARY, marginBottom: 20 },
  input: { width: '100%', padding: '13px 16px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 14, color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box', outline: 'none' },
  passWrap: { position: 'relative', width: '100%' },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 6 },
  submitBtn: { width: '100%', padding: '14px 0', background: BUTTON_GRAD, color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', letterSpacing: 0.3, boxShadow: '0 6px 18px rgba(30,90,135,0.3)', marginTop: 8 },
  alertError: { width: '100%', padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, boxSizing: 'border-box' },
  alertSuccess: { width: '100%', padding: '10px 14px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, boxSizing: 'border-box' },
};
