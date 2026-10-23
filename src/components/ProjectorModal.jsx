import React, { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, Clock, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { getRotatingSessionState } from '../utils/sessionCode';

function QRVisual({ code, size = 320 }) {
  const [imgError, setImgError] = useState(false);
  const payload = `infoctess://session/${code || 'ATT-0000'}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${encodeURIComponent(payload)}&margin=10`;

  if (imgError) {
    const matrixSize = 25;
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
      if (r < 7 && c >= matrixSize - 7) return true;
      if (r >= matrixSize - 7 && c < 7) return true;
      return false;
    };
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 12, display: 'block' }}>
        <rect width={size} height={size} fill="white" />
        {Array.from({ length: matrixSize }, (_, r) =>
          Array.from({ length: matrixSize }, (_, c) => {
            const filled = isFinder(r, c) || hash(r, c);
            return filled ? (
              <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize} width={cellSize + 0.5} height={cellSize + 0.5} fill="#0f172a" />
            ) : null;
          })
        )}
      </svg>
    );
  }

  return (
    <img
      src={qrApiUrl}
      alt="Projector QR Code"
      onError={() => setImgError(true)}
      style={{ width: size, height: size, display: 'block', borderRadius: 12 }}
    />
  );
}

export default function ProjectorModal({
  isOpen,
  onClose,
  sessionId,
  courseCode,
  courseName,
  rotatingToken,
  rotatingSecs = 90,
  totalWindow = 90,
  sessionCountdown = 0,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log(err));
      }
    }
  };

  const fmtSessionTimer = (s) => {
    if (!s || s <= 0) return 'Session Active';
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ONLY ONE CODE: strictly ATT-xxxx format (changes every 90 seconds)
  const displayCode = rotatingToken ? `ATT-${rotatingToken}` : (sessionId || 'ATT-0000');
  const progressPct = Math.max(0, Math.min(100, (rotatingSecs / totalWindow) * 100));
  const isExpiringSoon = rotatingSecs <= 10;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(135deg, #071726 0%, #0d2744 50%, #03101d 100%)',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      color: '#f8fafc',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      userSelect: 'none',
      overflow: 'hidden'
    }}>
      {/* ── PROJECTOR TOP BAR ── */}
      <div style={{
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(3, 16, 29, 0.6)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
            color: 'white',
            padding: '6px 14px',
            borderRadius: 10,
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: 1
          }}>
            PROJECTOR MODE
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: 0.5 }}>
              {courseCode || 'COURSE'} — {courseName || 'Live Attendance Session'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Working Session Duration Countdown */}
          {sessionCountdown > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              padding: '8px 18px',
              borderRadius: 30,
              fontSize: 14,
              fontWeight: 700
            }}>
              <Clock size={16} />
              <span>Session Closes In: <strong>{fmtSessionTimer(sessionCountdown)}</strong></span>
            </div>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── MAIN PROJECTOR STAGE ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        textAlign: 'center'
      }}>
        {/* SINGLE UNIFIED ATT-XXXX CODE CALLOUT */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 13,
            textTransform: 'uppercase',
            letterSpacing: 3,
            color: '#94a3b8',
            fontWeight: 700,
            marginBottom: 8
          }}>
            Scan QR or Enter Session Code on Mobile
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '2px solid rgba(56, 189, 248, 0.5)',
            padding: '12px 36px',
            borderRadius: 24,
            boxShadow: '0 12px 35px rgba(0,0,0,0.6)'
          }}>
            <span style={{
              fontSize: 'clamp(36px, 6vw, 60px)',
              fontWeight: 900,
              letterSpacing: '5px',
              fontFamily: 'monospace',
              color: '#38bdf8',
              textShadow: '0 0 25px rgba(56, 189, 248, 0.6)'
            }}>
              {displayCode}
            </span>
            <span style={{
              fontSize: 11,
              background: 'rgba(37, 99, 235, 0.35)',
              color: '#93c5fd',
              padding: '5px 12px',
              borderRadius: 14,
              fontWeight: 800
            }}>
              Changes every 90s
            </span>
          </div>
        </div>

        {/* Crisp Giant High-Contrast QR Code */}
        <div style={{
          background: '#ffffff',
          padding: 24,
          borderRadius: 28,
          boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(56, 189, 248, 0.25)',
          border: '6px solid #38bdf8',
          display: 'inline-block',
          position: 'relative'
        }}>
          <QRVisual
            code={displayCode}
            size={310}
          />
        </div>

        {/* 90-Second Rotating Progress Countdown */}
        <div style={{ width: 'min(460px, 85vw)', marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} style={{ animation: 'spin 3s linear infinite' }} /> Rotating Session Code
            </span>
            <span style={{
              fontSize: 14,
              fontWeight: 800,
              color: isExpiringSoon ? '#ef4444' : '#38bdf8',
              fontFamily: 'monospace'
            }}>
              Code changes in {rotatingSecs}s
            </span>
          </div>

          <div style={{
            height: 10,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 6,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <div style={{
              width: `${progressPct}%`,
              height: '100%',
              background: isExpiringSoon
                ? 'linear-gradient(90deg, #ef4444, #f87171)'
                : 'linear-gradient(90deg, #0284c7, #38bdf8)',
              transition: 'width 0.4s linear, background 0.3s ease',
              boxShadow: isExpiringSoon ? '0 0 10px #ef4444' : '0 0 10px #38bdf8'
            }} />
          </div>
        </div>

        <div style={{
          marginTop: 18,
          fontSize: 13,
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <ShieldCheck size={16} color="#10b981" />
          <span>Active Geofenced Attendance Session · Single-Device Verification Enforced</span>
        </div>
      </div>
    </div>
  );
}
