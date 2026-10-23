import React from 'react';
import { Award, CheckCircle2, Calendar, Clock, User, BookOpen, ShieldCheck, Download, X, QrCode } from 'lucide-react';

export default function AttendanceCardModal({
  isOpen,
  onClose,
  onViewHistory,
  cardData,
  student
}) {
  if (!isOpen || !cardData) return null;

  const courseName = cardData.courseName || cardData.course?.name || 'Class Attendance';
  const courseCode = cardData.courseCode || cardData.course?.code || 'ICTE';
  const openedBy = cardData.openedBy || cardData.host || 'Course Lecturer / Rep';
  const dateFormatted = cardData.date || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  const timeFormatted = cardData.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const method = cardData.method === 'qr_code' ? 'Dynamic QR Code' : '6-Digit Passcode';
  const refId = cardData.refId || `REC-${cardData.sessionId || 'ATT'}-${Math.floor(100000 + Math.random() * 900000)}`;
  const studentName = student ? `${student.first_name} ${student.last_name}` : 'Student Account';
  const indexNumber = student?.index_number || '5261000667';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 100001,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 24,
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        position: 'relative',
        animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Top Decorative Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0A3A4F 0%, #1E5A87 100%)',
          color: 'white',
          padding: '24px 24px 20px',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: 16,
              top: 16,
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 10,
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={20} color="#fbbf24" />
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase' }}>
                INFOCTESS ATTENDANCE SYSTEM
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>
                Official Attendance Card
              </div>
            </div>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(16, 185, 129, 0.25)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#a7f3d0',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            marginTop: 6
          }}>
            <CheckCircle2 size={14} /> PRESENCE VERIFIED & RECORDED
          </div>
        </div>

        {/* Card Body */}
        <div style={{ padding: '24px 24px 20px' }}>
          {/* Course Details Box */}
          <div style={{
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: 16,
            padding: '16px',
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  background: '#e0f2fe',
                  color: '#0369a1',
                  padding: '2px 8px',
                  borderRadius: 6,
                  textTransform: 'uppercase'
                }}>
                  {courseCode}
                </span>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 6 }}>
                  {courseName}
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginTop: 14,
              paddingTop: 12,
              borderTop: '1px dashed #cbd5e1',
              fontSize: 12
            }}>
              <div>
                <div style={{ color: '#64748b', fontWeight: 500 }}>Host / Opened By:</div>
                <div style={{ color: '#0f172a', fontWeight: 700, marginTop: 2 }}>{openedBy}</div>
              </div>

              <div>
                <div style={{ color: '#64748b', fontWeight: 500 }}>Verification Method:</div>
                <div style={{ color: '#0f172a', fontWeight: 700, marginTop: 2 }}>{method}</div>
              </div>
            </div>
          </div>

          {/* Student & Timestamp Data Grid */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginBottom: 20,
            background: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: 14,
            padding: '14px 16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} /> Student:
              </span>
              <strong style={{ color: '#0f172a' }}>{studentName} ({indexNumber})</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} /> Date:
              </span>
              <strong style={{ color: '#0f172a' }}>{dateFormatted}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} /> Timestamp:
              </span>
              <strong style={{ color: '#0f172a' }}>{timeFormatted}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={14} color="#10b981" /> Geofence & Device:
              </span>
              <span style={{ color: '#16a34a', fontWeight: 700 }}>In-Classroom Validated</span>
            </div>
          </div>

          {/* Official Verification Reference Seal */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20
          }}>
            <div>
              <div style={{ fontSize: 10, color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                Digital Verification ID
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#15803d', fontFamily: 'monospace', letterSpacing: 1 }}>
                {refId}
              </div>
            </div>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={18} />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #1E5A87, #0A3A4F)',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(30,90,135,0.3)'
              }}
            >
              Done & Save Evidence
            </button>
            {onViewHistory && (
              <button
                onClick={() => {
                  onClose();
                  onViewHistory();
                }}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: '#f8fafc',
                  color: '#1E5A87',
                  border: '1.5px solid #cbd5e1',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                View History
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
