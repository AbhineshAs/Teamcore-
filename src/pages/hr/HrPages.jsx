import { useState, useEffect } from 'react';
import { crmService } from '../../services/crmService';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, Calendar, Clock, CheckSquare, Plus, Trash2, 
  Search, CheckCircle2, User, Play, Square, Award
} from 'lucide-react';

/* ==========================================
   1. HR DASHBOARD
   ========================================== */
export function HrDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ executives: 0, pendingTasks: 0 });
  const [tasks, setTasks] = useState([]);
  const [clockInStatus, setClockInStatus] = useState(false);

  useEffect(() => {
    const allUsers = crmService.getUsers();
    const allTasks = crmService.getTasks();
    const attendance = crmService.getAttendance();
    const execs = allUsers.filter(u => u.role === 'EXECUTIVE');
    const myTasks = allTasks.filter(t => t.assignedTo === currentUser.id && t.status !== 'Completed');

    // Check if clocked in today
    const todayStr = new Date().toISOString().split('T')[0];
    const logToday = attendance.find(r => r.userId === currentUser.id && r.date === todayStr);

    setStats({
      executives: execs.length,
      pendingTasks: myTasks.length
    });
    setTasks(myTasks.slice(0, 4));
    setClockInStatus(logToday && !logToday.checkOut);
  }, [currentUser]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>HR Workspace Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome. Coordinate operations, onboard recruits, and record schedules.</p>
      </div>

      <div className="kpi-grid">
        <div className="glass-panel kpi-card primary">
          <span className="kpi-title">Active Executives</span>
          <span className="kpi-value">{stats.executives} Recruits</span>
          <span className="kpi-meta">Sales team members</span>
        </div>
        <div className="glass-panel kpi-card success">
          <span className="kpi-title">My Pending Duties</span>
          <span className="kpi-value">{stats.pendingTasks} Directives</span>
          <span className="kpi-meta">Assigned by management</span>
        </div>
        <div className="glass-panel kpi-card info">
          <span className="kpi-title">Duty Status</span>
          <span className="kpi-value">{clockInStatus ? 'Checked-In' : 'Checked-Out'}</span>
          <span className="kpi-meta">Real-time attendance status</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '32px' }}>
        
        {/* Hr Checklist */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>HR Tasks Checklist</h3>
          {tasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pending tasks assigned to you.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tasks.map(t => (
                <div key={t.id} style={{
                  background: 'rgba(var(--primary-rgb), 0.04)',
                  padding: '16px',
                  borderRadius: '12px'
                }}>
                  <div style={{ fontWeight: 700 }}>{t.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{t.description}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Target Date: {t.dueDate}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ==========================================
   2. HR ADD EXECUTIVE (Onboard Recruits)
   ========================================== */
export function HrAddExecutive() {
  const { currentUser } = useAuth();
  const [executives, setExecutives] = useState([]);
  const [managers, setManagers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [managerId, setManagerId] = useState('');

  const fetchData = () => {
    const allUsers = crmService.getUsers();
    setExecutives(allUsers.filter(u => u.role === 'EXECUTIVE'));
    setManagers(allUsers.filter(u => u.role === 'MANAGER'));
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this sales executive account?")) {
      await crmService.deleteUser(id);
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await crmService.addUser({
        name,
        email,
        phone,
        role: 'EXECUTIVE',
        department: 'Sales Execution',
        password: 'password',
        managerId: managerId ? parseInt(managerId) : null
      });
      setName('');
      setEmail('');
      setPhone('');
      setManagerId('');
      fetchData();
    } catch (err) {
      alert(err.message || "Failed to add executive");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Onboard Sales Executive</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Add executive credentials and assign supervising manager supervisors.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Executive Onboarding Form</h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px', alignItems: 'end' }}>
          <div className="form-group">
            <label>Legal Name</label>
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Corporate Email</label>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Phone Contact</label>
            <input type="text" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Reporting Manager</label>
            <select value={managerId} onChange={e => setManagerId(e.target.value)} required>
              <option value="">Choose Supervisor...</option>
              {managers.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '48px', marginBottom: '20px' }}>
            <Plus size={18} /> Provision Recruits
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Active Executives Directory</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Identity</th>
                <th>Contact</th>
                <th>Reporting Manager</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {executives.map(ex => (
                <tr key={ex.id}>
                  <td style={{ fontWeight: 700 }}>{ex.name}</td>
                  <td>
                    <div>{ex.email}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ex.phone}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    {managers.find(m => m.id === ex.managerId)?.name || 'Unassigned'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleDeleteUser(ex.id)} className="btn-action btn-delete" style={{ padding: '6px', minHeight: 'unset', marginLeft: 'auto' }} title="Delete Sales Executive">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   3. HR APPLY LEAVE
   ========================================== */
export function HrApplyLeave() {
  const { currentUser } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState(false);
  const [leaves, setLeaves] = useState([]);

  const fetchLeaves = () => {
    const all = crmService.getLeaves();
    setLeaves(all.filter(l => l.requesterId === currentUser.id));
  };

  useEffect(() => {
    fetchLeaves();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await crmService.applyLeave({
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      role: currentUser.role,
      startDate,
      endDate,
      reason
    });
    setStartDate('');
    setEndDate('');
    setReason('');
    setSuccess(true);
    fetchLeaves();
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Apply HR Absence</h1>
        <p style={{ color: 'var(--text-secondary)' }}>File holiday, medical leave, or schedules absence applications.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '32px', alignItems: 'start' }}>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Apply Leave</h3>
          {success && (
            <div style={{ background: 'rgba(var(--success-rgb), 0.1)', color: 'var(--success)', border: '1px solid rgba(var(--success-rgb), 0.2)', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '20px' }}>
              Absence application recorded successfully.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid-2-responsive">
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label>Reason Details</label>
              <textarea rows="3" placeholder="State reason..." value={reason} onChange={e => setReason(e.target.value)} required></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Absence Request</button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Absence Registry History</h3>
          <div className="data-table-wrapper" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timeframe</th>
                  <th>Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id}>
                    <td>{l.startDate} to {l.endDate}</td>
                    <td>{l.reason}</td>
                    <td>
                      <span className={`status-badge ${(l.status || 'Pending').toLowerCase()}`}>{l.status || 'Pending'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ==========================================
   4. HR ATTENDANCE HISTORY
   ========================================== */
export function HrAttendanceHistory() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLogs(crmService.getAttendance());
  }, []);

  const filtered = logs.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Staff Attendance Logs</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review worker clock statuses and daily session details.</p>
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Filter logs by staff name..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '48px', boxSizing: 'border-box' }}
        />
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Active Logs History</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Worker Identity</th>
                <th>Role</th>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 700 }}>{l.name}</td>
                  <td>{l.role}</td>
                  <td>{l.date}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>{l.checkIn}</td>
                  <td style={{ color: l.checkOut ? 'var(--primary)' : 'var(--warning)', fontWeight: 600 }}>{l.checkOut || 'Active Session'}</td>
                  <td style={{ fontWeight: 800 }}>{l.hours ? `${l.hours} hrs` : '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   5. HR ATTENDANCE CLOCK
   ========================================== */
export function HrAttendance() {
  const { currentUser } = useAuth();
  const [clockInTime, setClockInTime] = useState(null);
  const [statusText, setStatusText] = useState('Checked-Out');
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  const fetchStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    const logs = crmService.getAttendance();
    const userLog = logs.find(l => l.userId === currentUser.id && l.date === today);
    if (userLog && !userLog.checkOut) {
      setClockInTime(userLog.checkIn);
      setStatusText('Checked-In');
    } else {
      setClockInTime(null);
      setStatusText('Checked-Out');
    }
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, [currentUser]);

  const handleAction = async (action) => {
    await crmService.recordAttendance(currentUser.id, action);
    fetchStatus();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem' }}>Attendance Time Clock</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Log in or log out to capture your corporate session logs.</p>
      </div>

      <div className="glass-panel" style={{
        padding: '48px',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
        borderTop: clockInTime ? '5px solid var(--success)' : '5px solid var(--danger)'
      }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px' }}>
          CURRENT SESSION TIME
        </div>
        <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '24px', letterSpacing: '-1px' }}>
          {time}
        </div>

        <div style={{
          background: 'rgba(var(--primary-rgb), 0.04)',
          padding: '16px',
          borderRadius: '16px',
          marginBottom: '32px'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Current Status</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: clockInTime ? 'var(--success)' : 'var(--danger)' }}>{statusText}</span>
          {clockInTime && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>Clocked In at: {clockInTime}</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          {!clockInTime ? (
            <button onClick={() => handleAction('checkin')} className="btn btn-success" style={{ flex: 1, padding: '14px' }}>
              <Play size={16} /> Check In
            </button>
          ) : (
            <button onClick={() => handleAction('checkout')} className="btn btn-danger" style={{ flex: 1, padding: '14px' }}>
              <Square size={16} /> Check Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   6. HR TASKS
   ========================================== */
export function HrTasks() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);

  const fetchTasks = () => {
    const all = crmService.getTasks();
    setTasks(all.filter(t => t.assignedTo === currentUser.id));
  };

  useEffect(() => {
    fetchTasks();
  }, [currentUser]);

  const handleResolve = async (tid) => {
    await crmService.completeTask(tid);
    fetchTasks();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>My Operational Duties</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review and check administrative task lists delegated to you.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>HR Tasks</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task Details</th>
                <th>Due Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No tasks assigned.</td>
                </tr>
              ) : (
                tasks.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{t.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{t.description}</div>
                    </td>
                    <td>{t.dueDate}</td>
                    <td>
                      <span className={`status-badge ${t.status === 'Completed' ? 'won' : 'pending'}`}>{t.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {t.status !== 'Completed' && (
                        <button onClick={() => handleResolve(t.id)} className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                          Resolve Task
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   7. HR PROFILE
   ========================================== */
export function HrProfile() {
  const { currentUser, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setPhone(currentUser.phone || '');
      setDepartment(currentUser.department || 'Human Resources');
      setPassword(currentUser.password);
    }
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({ name, email, phone, department, password });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '600px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Account Profile Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Update your employee security preferences.</p>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ marginBottom: '24px' }}>Profile Details</h3>
        {success && (
          <div style={{ background: 'rgba(var(--success-rgb), 0.1)', color: 'var(--success)', border: '1px solid rgba(var(--success-rgb), 0.2)', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '20px' }}>
            Profile settings updated successfully.
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label>Legal Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email ID</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="grid-2-responsive">
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input type="text" value={department} onChange={e => setDepartment(e.target.value)} disabled />
            </div>
          </div>
          <div className="form-group">
            <label>Security Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '14px', fontWeight: 700 }}>
            Save Registry Profile
          </button>
        </form>
      </div>
    </div>
  );
}
