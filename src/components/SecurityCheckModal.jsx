import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Clock, Smartphone, CheckCircle2, XCircle, AlertTriangle, RefreshCw, UserCheck } from 'lucide-react';

export default function SecurityCheckModal({
  isOpen,
  onSuccessComplete,
  onClose,
  onRetry,
  sessionData,
  student,
  validationError = null // e.g. "Location out of range" or "Code expired"
}) {
  // Steps: 0 = not started, 1 = checking location, 2 = checking token, 3 = authenticating device, 4 = complete!
  const [currentStep, setCurrentStep] = useState(1);
  const [failedStep, setFailedStep] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setFailedStep(null);
      setErrorMessage('');
      return;
    }

    // If validationError is already passed in from backend failure
    if (validationError) {
      const errLower = validationError.toLowerCase();
      if (errLower.includes('location') || errLower.includes('distance') || errLower.includes('radius') || errLower.includes('geofence')) {
        setFailedStep(1);
        setErrorMessage(validationError || 'You appear to be outside the classroom radius.');
      } else if (errLower.includes('expired') || errLower.includes('token') || errLower.includes('code') || errLower.includes('time')) {
        setFailedStep(2);
        setErrorMessage(validationError || 'The 90-second dynamic code has expired. Please scan or enter the latest refreshed code.');
      } else {
        setFailedStep(3);
        setErrorMessage(validationError || 'Device binding check or student authentication failed.');
      }
      return;
    }

    // Rapid automated 3-layer check sequence (~400ms per step)
    let t1, t2, t3, t4;

    t1 = setTimeout(() => {
      setCurrentStep(2); // Step 1 passed!
    }, 450);

    t2 = setTimeout(() => {
      setCurrentStep(3); // Step 2 passed!
    }, 900);

    t3 = setTimeout(() => {
      setCurrentStep(4); // Step 3 passed!
    }, 1350);

    t4 = setTimeout(() => {
      if (onSuccessComplete) onSuccessComplete();
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen, validationError]);

  if (!isOpen) return null;

  const stepsConfig = [
    {
      id: 1,
      title: 'Geofencing & Classroom Range',
      desc: 'Validating GPS distance within lecture room perimeter',
      icon: MapPin,
    },
    {
      id: 2,
      title: '90s Dynamic Token & Time-Sync',
      desc: 'Validating cryptographic code freshness and timestamp',
      icon: Clock,
    },
    {
      id: 3,
      title: 'Device Binding & Anti-Proxy',
      desc: 'Authenticating registered student device and identity',
      icon: Smartphone,
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 100000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 24,
        padding: '32px 28px',
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
        textAlign: 'center',
        position: 'relative',
        animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>

        {/* Top Header Badge */}
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          background: failedStep ? '#fee2e2' : 'linear-gradient(135deg, #1E5A87, #2A6B9E)',
          color: failedStep ? '#ef4444' : 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: failedStep ? '0 8px 20px rgba(239,68,68,0.2)' : '0 8px 20px rgba(30,90,135,0.25)',
          transition: 'all 0.3s ease'
        }}>
          {failedStep ? <XCircle size={28} /> : <ShieldCheck size={28} />}
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
          {failedStep ? 'Security Verification Paused' : (currentStep >= 4 ? 'All Security Checks Passed!' : 'Verifying Security Layers...')}
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px', lineHeight: 1.4 }}>
          {failedStep
            ? 'One of the security checks could not be verified automatically.'
            : 'Enforcing multi-tier anti-proxy and classroom proximity protocols.'}
        </p>

        {/* 3 Steps List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, textAlign: 'left' }}>
          {stepsConfig.map((s) => {
            const Icon = s.icon;
            const isFailed = failedStep === s.id;
            const isPassed = !failedStep && currentStep > s.id;
            const isCurrent = !failedStep && currentStep === s.id;

            return (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 16px',
                  borderRadius: 14,
                  background: isFailed ? '#fef2f2' : (isPassed ? '#f0fdf4' : (isCurrent ? '#eff6ff' : '#f8fafc')),
                  border: `1.5px solid ${isFailed ? '#fecaca' : (isPassed ? '#bbf7d0' : (isCurrent ? '#bfdbfe' : '#e2e8f0'))}`,
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: isFailed ? '#fee2e2' : (isPassed ? '#dcfce7' : (isCurrent ? '#dbeafe' : '#f1f5f9')),
                  color: isFailed ? '#ef4444' : (isPassed ? '#16a34a' : (isCurrent ? '#2563eb' : '#94a3b8')),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={18} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isFailed ? '#991b1b' : (isPassed ? '#166534' : (isCurrent ? '#1e40af' : '#64748b'))
                  }}>
                    Layer {s.id}: {s.title}
                  </div>
                  <div style={{ fontSize: 11, color: isFailed ? '#b91c1c' : '#64748b', marginTop: 2 }}>
                    {s.desc}
                  </div>
                </div>

                {/* Status Indicator */}
                <div style={{ flexShrink: 0 }}>
                  {isFailed && <XCircle size={20} color="#ef4444" />}
                  {isPassed && <CheckCircle2 size={20} color="#16a34a" />}
                  {isCurrent && (
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: '2.5px solid #bfdbfe',
                      borderTopColor: '#2563eb',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                  )}
                  {!isFailed && !isPassed && !isCurrent && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1', margin: 6 }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Failed Action Card */}
        {failedStep && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 14,
            padding: '14px 16px',
            marginBottom: 20,
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>
                  Action Required
                </div>
                <div style={{ fontSize: 12, color: '#b45309', marginTop: 4, lineHeight: 1.4 }}>
                  {failedStep === 1 && (
                    <span>You appear to be outside the classroom perimeter. Please <strong>move inside the lecture hall</strong> and click Try Again, or approach the lecturer to be marked manually.</span>
                  )}
                  {failedStep === 2 && (
                    <span>The 90-second dynamic code has refreshed. Please <strong>check the projector screen</strong> for the latest 6-digit code and try again.</span>
                  )}
                  {failedStep === 3 && (
                    <span>Device check failed. Please ensure you are logged in from your own registered student device, or speak with your Course Rep.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {failedStep ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                if (onRetry) onRetry();
                else {
                  setFailedStep(null);
                  setCurrentStep(1);
                }
              }}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #1E5A87, #2A6B9E)',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <RefreshCw size={15} /> Try Again
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 12,
                background: '#f8fafc',
                color: '#475569',
                border: '1px solid #cbd5e1',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
            {currentStep >= 4 ? '✅ Generating your Attendance Card...' : 'Verifying attendance credentials...'}
          </div>
        )}
      </div>
    </div>
  );
}
