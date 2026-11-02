import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, FileSpreadsheet, KeyRound, 
  ArrowLeft, Search, Loader2, CheckCircle2, AlertCircle, ShieldCheck,
  RefreshCw, Trash2
} from 'lucide-react';
import { supabase } from '../backend/supabaseClient';

export default function AdminPanel() {
  const navigate = useNavigate();
  
  // Security
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'dataset'
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('lecturer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [levelId, setLevelId] = useState('L100');
  
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  // Batch upload state
  const [csvLogs, setCsvLogs] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Hardcoded admin passcode
  const ADMIN_PASSCODE = 'admin123'; 

  const handleVerifyPasscode = (e) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setAuthError('');
      loadUsers();
    } else {
      setAuthError('Incorrect Admin Passcode');
    }
  };

  async function loadUsers() {
    setLoading(true);
    try {
      const { data: lecturers } = await supabase.from('lecturers').select('*');
      const { data: reps } = await supabase.from('course_reps').select('*');
      
      const combined = [
        ...(lecturers || []).map(u => ({ ...u, role: 'lecturer', level_id: 'N/A' })),
        ...(reps || []).map(u => ({ ...u, role: 'course_rep' }))
      ].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

      setUsers(combined);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user? This will remove all their data permanently.")) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.rpc('delete_user_by_id', { target_user_id: userId });
      if (error) throw error;
      
      loadUsers(); // Refresh dataset
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormMsg({ type: '', text: '' });
    setLoading(true);

    try {
      // Initialize a secondary client instance that does NOT persist session
      const { createClient } = await import('@supabase/supabase-js');
      const tempClient = createClient(supabase.supabaseUrl, supabase.supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });

      const { data, error } = await tempClient.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          data: {
            role: role,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            level_id: role === 'course_rep' ? levelId : null
          }
        }
      });

      if (error) throw error;

      setFormMsg({ type: 'success', text: `Successfully registered ${role === 'lecturer' ? 'Lecturer' : 'Course Rep'}!` });
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      loadUsers();
    } catch (err) {
      setFormMsg({ type: 'error', text: err.message || 'Failed to create user' });
    } finally {
      setLoading(false);
    }
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setCsvLogs(['Parsing spreadsheet CSV file...']);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      
      if (lines.length <= 1) {
        setCsvLogs(prev => [...prev, 'Error: CSV file is empty or missing headers.']);
        setUploading(false);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const emailIdx = headers.indexOf('email');
      const passIdx = headers.indexOf('password');
      const roleIdx = headers.indexOf('role');
      const firstIdx = headers.indexOf('first_name');
      const lastIdx = headers.indexOf('last_name');
      const levelIdx = headers.indexOf('level_id');

      if (emailIdx === -1 || passIdx === -1 || roleIdx === -1) {
        setCsvLogs(prev => [...prev, 'Error: Required columns missing. Required: email, password, role']);
        setUploading(false);
        return;
      }

      const { createClient } = await import('@supabase/supabase-js');
      const tempClient = createClient(supabase.supabaseUrl, supabase.supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });

      let successCount = 0;
      let failCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const uEmail = cols[emailIdx];
        const uPass = cols[passIdx];
        const uRole = cols[roleIdx]?.toLowerCase();
        const uFirst = firstIdx !== -1 ? cols[firstIdx] : '';
        const uLast = lastIdx !== -1 ? cols[lastIdx] : '';
        const uLevel = levelIdx !== -1 ? cols[levelIdx] : 'L100';

        if (!uEmail || !uPass || !uRole) continue;

        try {
          const { error } = await tempClient.auth.signUp({
            email: uEmail.toLowerCase(),
            password: uPass,
            options: {
              data: {
                role: uRole,
                first_name: uFirst,
                last_name: uLast,
                level_id: uRole === 'course_rep' ? uLevel : null
              }
            }
          });

          if (error) throw error;
          successCount++;
          setCsvLogs(prev => [...prev, `[Success] Registered ${uEmail} (${uRole})`]);
        } catch (err) {
          failCount++;
          setCsvLogs(prev => [...prev, `[Failed] ${uEmail}: ${err.message}`]);
        }
      }

      setCsvLogs(prev => [...prev, `Batch completed: ${successCount} registered, ${failCount} failed.`]);
      setUploading(false);
      loadUsers();
    };

    reader.readAsText(file);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = `${u.first_name || ''} ${u.last_name || ''} ${u.email || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: 'white', borderRadius: 20, padding: 36, width: '100%', maxWidth: 420, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, background: '#eff6ff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#2563eb' }}>
              <ShieldCheck size={32} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>INFOCTESS Admin Gate</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Enter administrator passcode to manage system accounts</p>
          </div>

          <form onSubmit={handleVerifyPasscode}>
            {authError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} /> {authError}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Admin Passcode</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="password" 
                  value={passcode} 
                  onChange={e => setPasscode(e.target.value)}
                  placeholder="Enter passcode..."
                  required
                  style={{ width: '100%', padding: '11px 14px 11px 42px', border: '1.5px solid #cbd5e1', borderRadius: 10, fontSize: 14, outline: 'none' }}
                />
              </div>
            </div>

            <button type="submit" style={{ width: '100%', padding: 12, background: '#2563eb', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Verify Access
            </button>
          </form>

          <button onClick={() => navigate('/Login')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', background: 'none', border: 'none', color: '#64748b', fontSize: 13, marginTop: 20, cursor: 'pointer' }}>
            <ArrowLeft size={14} /> Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header style={{ background: '#0f172a', color: 'white', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldCheck size={26} color="#3b82f6" />
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>INFOCTESS Admin Dashboard</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Account Provisioning & System Management</div>
          </div>
        </div>
        <button onClick={() => navigate('/Login')} style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
          Exit Admin
        </button>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          <button 
            onClick={() => setActiveTab('create')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none',
              background: activeTab === 'create' ? '#2563eb' : 'white', color: activeTab === 'create' ? 'white' : '#64748b',
              fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <UserPlus size={16} /> User Registration
          </button>
          <button 
            onClick={() => { setActiveTab('dataset'); loadUsers(); }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none',
              background: activeTab === 'dataset' ? '#2563eb' : 'white', color: activeTab === 'dataset' ? 'white' : '#64748b',
              fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <Users size={16} /> User Database ({users.length})
          </button>
        </div>

        {/* Tab 1: Account Creation & CSV Batch Upload */}
        {activeTab === 'create' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            
            {/* Single Account Creation Form */}
            <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <UserPlus size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Register New User</h3>
              </div>

              {formMsg.text && (
                <div style={{ 
                  background: formMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${formMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                  color: formMsg.type === 'success' ? '#047857' : '#dc2626',
                  padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 18,
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  {formMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {formMsg.text}
                </div>
              )}

              <form onSubmit={handleCreateUser}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Account Role</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button 
                      type="button" 
                      onClick={() => setRole('lecturer')}
                      style={{
                        padding: 10, borderRadius: 8, border: `1.5px solid ${role === 'lecturer' ? '#2563eb' : '#cbd5e1'}`,
                        background: role === 'lecturer' ? '#eff6ff' : 'white', color: role === 'lecturer' ? '#2563eb' : '#64748b',
                        fontWeight: 600, fontSize: 13, cursor: 'pointer'
                      }}
                    >
                      Lecturer
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setRole('course_rep')}
                      style={{
                        padding: 10, borderRadius: 8, border: `1.5px solid ${role === 'course_rep' ? '#2563eb' : '#cbd5e1'}`,
                        background: role === 'course_rep' ? '#eff6ff' : 'white', color: role === 'course_rep' ? '#2563eb' : '#64748b',
                        fontWeight: 600, fontSize: 13, cursor: 'pointer'
                      }}
                    >
                      Course Rep
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>First Name</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g. John" required style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Last Name</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. Doe" required style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 13 }} />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@school.edu" required style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 13 }} />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters..." required style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 13 }} />
                </div>

                {role === 'course_rep' && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Assigned Level</label>
                    <select value={levelId} onChange={e => setLevelId(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 13 }}>
                      <option value="L100">Level 100</option>
                      <option value="L200">Level 200</option>
                      <option value="L300">Level 300</option>
                      <option value="L400">Level 400</option>
                    </select>
                  </div>
                )}

                <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 10 }}>
                  {loading ? 'Registering...' : 'Register Account'}
                </button>
              </form>
            </div>

            {/* Batch Spreadsheet Upload */}
            <div style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <FileSpreadsheet size={20} color="#059669" />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Batch CSV Uploader</h3>
              </div>
              
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 0, marginBottom: 16 }}>
                Upload a CSV file containing multiple user accounts to provision them all at once.
              </p>

              {/* Sample CSV Format Info */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, marginBottom: 18, fontSize: 12, color: '#475569' }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Required CSV Format:</div>
                <code>email, password, role, first_name, last_name, level_id</code>
              </div>

              <input 
                type="file" 
                accept=".csv" 
                onChange={handleCsvUpload}
                disabled={uploading}
                style={{ marginBottom: 16, fontSize: 13 }} 
              />

              {/* Upload Log Display */}
              <div style={{ flex: 1, minHeight: 180, background: '#0f172a', color: '#a7f3d0', borderRadius: 10, padding: 14, fontFamily: 'monospace', fontSize: 12, overflowY: 'auto' }}>
                {csvLogs.length === 0 ? (
                  <span style={{ color: '#64748b' }}>// Upload output logs will appear here...</span>
                ) : (
                  csvLogs.map((log, index) => (
                    <div key={index} style={{ marginBottom: 4 }}>{log}</div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: User Dataset */}
        {activeTab === 'dataset' && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div style={{ padding: 24 }}>
              
              {/* Filter Bar */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13 }}
                  />
                </div>

                <select 
                  value={roleFilter} 
                  onChange={e => setRoleFilter(e.target.value)} 
                  style={{ padding: '0 12px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13 }}
                >
                  <option value="all">All Roles</option>
                  <option value="lecturer">Lecturers</option>
                  <option value="course_rep">Course Representatives</option>
                </select>

                <button 
                  onClick={loadUsers} 
                  disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', color: '#64748b' }}
                  title="Refresh Users"
                >
                  <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                </button>
              </div>

              {/* Data Table */}
              <div style={{ overflowX: 'auto' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} color="#3b82f6" />
                    <span style={{ color: '#64748b', fontSize: 13 }}>Loading users dataset...</span>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 13 }}>
                    No users match the search criteria.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                        <th style={{ padding: 12 }}>Name</th>
                        <th style={{ padding: 12 }}>Email</th>
                        <th style={{ padding: 12 }}>Role</th>
                        <th style={{ padding: 12 }}>Assigned Level</th>
                        <th style={{ padding: 12 }}>Registered At</th>
                        <th style={{ padding: 12, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: 12, fontWeight: 600 }}>{u.first_name} {u.last_name}</td>
                          <td style={{ padding: 12 }}>{u.email}</td>
                          <td style={{ padding: 12 }}>
                            <span style={{ 
                              padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                              background: u.role === 'lecturer' ? '#eff6ff' : '#ecfdf5',
                              color: u.role === 'lecturer' ? '#2563eb' : '#059669',
                              border: `1px solid ${u.role === 'lecturer' ? '#bfdbfe' : '#a7f3d0'}`
                            }}>
                              {u.role === 'lecturer' ? 'Lecturer' : 'Course Rep'}
                            </span>
                          </td>
                          <td style={{ padding: 12, fontWeight: 500, color: '#475569' }}>{u.level_id}</td>
                          <td style={{ padding: 12, color: '#64748b' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: 12, textAlign: 'right' }}>
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
