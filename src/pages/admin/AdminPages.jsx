import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { crmService } from '../../services/crmService';
import { useAuth } from '../../context/AuthContext';
import {
  Users, UserCheck, ShieldAlert, FileOutput, FileSpreadsheet,
  ClipboardList, TrendingUp, Clock, DollarSign, User, Plus,
  Trash2, Download, Search, CheckCircle2, AlertTriangle, ArrowUpRight,
  Phone, PhoneCall, Play, Pause, Volume2, VolumeX, FileText, X, ArrowDownLeft,
  Edit2, RotateCcw
} from 'lucide-react';

/* ==========================================
   1. ADMIN DASHBOARD OVERVIEW
   ========================================== */
export function AdminDashboard() {
  const [data, setData] = useState({
    users: [],
    leads: [],
    tasks: [],
    leaves: [],
    transactions: [],
    finances: { plReport: { TotalIncome: 0, NetProfit: 0, TotalExpense: 0 }, vatReport: { VatPayable: 0 }, zakatReport: { ZakatDue: 0 } },
    attendance: [],
    calls: []
  });

  // Filters & Searches State
  const [rosterSearch, setRosterSearch] = useState('');
  const [activeRoleFilter, setActiveRoleFilter] = useState('ALL');

  const [leadSearch, setLeadSearch] = useState('');
  const [activeLeadFilter, setActiveLeadFilter] = useState('ALL');

  const [taskSearch, setTaskSearch] = useState('');
  const [activeTaskFilter, setActiveTaskFilter] = useState('ALL');

  const [activeLeaveFilter, setActiveLeaveFilter] = useState('ALL');

  // IVR Filter & Audio State
  const [callSearchQuery, setCallSearchQuery] = useState('');
  const [callFilterDirection, setCallFilterDirection] = useState('ALL');
  const [callFilterStatus, setCallFilterStatus] = useState('ALL');
  const [callFilterSim, setCallFilterSim] = useState('ALL');

  const [activeCall, setActiveCall] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const loadData = () => {
    const users = crmService.getUsers() || [];
    const leads = crmService.getLeads() || [];
    const tasks = crmService.getTasks() || [];
    const leaves = crmService.getLeaves() || [];
    const transactions = crmService.getTransactions() || [];
    const finances = crmService.getFinancialReports() || { plReport: { TotalIncome: 0, NetProfit: 0, TotalExpense: 0 }, vatReport: { VatPayable: 0 }, zakatReport: { ZakatDue: 0 } };
    const attendance = crmService.getAttendance() || [];
    const calls = crmService.getCallLogs() || [];

    setData({
      users,
      leads,
      tasks,
      leaves,
      transactions,
      finances,
      attendance,
      calls
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Audio Playback Sync Effect
  useEffect(() => {
    if (activeCall && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio playback error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeCall]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const selectCallToPlay = (call) => {
    if (!call.recordingUrl) {
      alert("No recording available for this call.");
      return;
    }
    if (activeCall && activeCall.id === call.id) {
      togglePlay();
    } else {
      setActiveCall(call);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleDeleteCall = async (id) => {
    if (window.confirm("Delete call record permanently?")) {
      await crmService.deleteCallLog(id);
      loadData();
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this user account?")) {
      await crmService.deleteUser(id);
      loadData();
    }
  };

  const { users, leads, tasks, leaves, transactions, finances, attendance, calls } = data;

  const managers = users.filter(u => u.role === 'MANAGER');
  const hrs = users.filter(u => u.role === 'HR');
  const executives = users.filter(u => u.role === 'EXECUTIVE');

  const totalLeadsValue = leads.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
  const closedWonLeads = leads.filter(l => l.status === 'Closed Won' || l.status === 'Close');
  const revenueClosed = closedWonLeads.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);

  const statusCounts = {
    'New': leads.filter(l => l.status === 'New').length,
    'Contacted': leads.filter(l => l.status === 'Contacted').length,
    'Interested': leads.filter(l => l.status === 'Interested to Buy' || l.status === 'Interested').length,
    'Follow Up': leads.filter(l => l.status === 'Follow Up').length,
    'Proposal Sent': leads.filter(l => l.status === 'Proposal Sent').length,
    'Negotiation': leads.filter(l => l.status === 'Negotiation').length,
    'Closed Won': leads.filter(l => l.status === 'Closed Won' || l.status === 'Close').length,
    'Closed Lost': leads.filter(l => l.status === 'Closed Lost').length,
  };

  const getPercentage = (count) => {
    if (leads.length === 0) return 0;
    return Math.round((count / leads.length) * 100);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const checkedInToday = attendance.filter(log => log.date === todayStr && !log.checkOut);

  const pendingTasksCount = tasks.filter(t => t.status === 'Pending' || t.status === 'PENDING').length;
  const completedTasksCount = tasks.filter(t => t.status === 'Completed' || t.status === 'COMPLETED').length;

  const getUserAttendanceToday = (userId) => {
    const todayLog = attendance.find(log => log.userId === userId && log.date === todayStr);
    if (!todayLog) return { status: 'Offline', time: '', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' };
    if (todayLog.checkOut) return { status: 'Checked-Out', time: `${todayLog.checkOut}`, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' };
    return { status: 'Online', time: `${todayLog.checkIn}`, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' };
  };

  const getManagerName = (mid) => {
    const found = users.find(u => u.id === mid);
    return found ? found.name : 'Unassigned';
  };

  // Role style rules for clear, easy visual identification
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return { background: 'rgba(139, 92, 246, 0.12)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.25)', fontWeight: '800', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.75rem', letterSpacing: '0.05em' };
      case 'MANAGER':
        return { background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.25)', fontWeight: '800', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.75rem', letterSpacing: '0.05em' };
      case 'HR':
        return { background: 'rgba(236, 72, 153, 0.12)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.25)', fontWeight: '800', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.75rem', letterSpacing: '0.05em' };
      case 'EXECUTIVE':
        return { background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.25)', fontWeight: '800', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.75rem', letterSpacing: '0.05em' };
      default:
        return { background: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.25)', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.75rem', letterSpacing: '0.05em' };
    }
  };

  const getAttendanceBadgeStyle = (status) => {
    switch (status) {
      case 'Online':
        return { background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '6px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '0.8rem' };
      case 'Checked-Out':
        return { background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '6px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '0.8rem' };
      default: // Offline
        return { background: 'rgba(239, 68, 68, 0.08)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.8rem' };
    }
  };

  const getTaskBadgeStyle = (status) => {
    const comp = status.toUpperCase() === 'COMPLETED';
    return {
      background: comp ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
      color: comp ? '#10b981' : '#f59e0b',
      border: comp ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '700'
    };
  };

  const getLeaveBadgeStyle = (status) => {
    const s = status.toUpperCase();
    if (s === 'APPROVED') {
      return { background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' };
    } else if (s === 'REJECTED') {
      return { background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' };
    }
    return { background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' };
  };

  // FILTERED LISTS
  const filteredUsers = users.filter(u => {
    const matchesRole = activeRoleFilter === 'ALL' || u.role === activeRoleFilter;
    const matchesSearch = u.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      (u.position && u.position.toLowerCase().includes(rosterSearch.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const filteredLeadsList = leads.filter(l => {
    const matchesStatus = activeLeadFilter === 'ALL' ||
      l.status === activeLeadFilter ||
      (activeLeadFilter === 'Closed Won' && l.status === 'Close') ||
      (activeLeadFilter === 'Interested' && l.status === 'Interested to Buy');
    const matchesSearch = l.customerName.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.source.toLowerCase().includes(leadSearch.toLowerCase()) ||
      (users.find(u => u.id === l.userId)?.name || '').toLowerCase().includes(leadSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredTasksList = tasks.filter(t => {
    const matchesStatus = activeTaskFilter === 'ALL' || t.status.toUpperCase() === activeTaskFilter;
    const matchesSearch = t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (users.find(u => u.id === t.assignedTo)?.name || '').toLowerCase().includes(taskSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredLeavesList = leaves.filter(l => {
    return activeLeaveFilter === 'ALL' || l.status.toUpperCase() === activeLeaveFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      <div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Admin Command Center</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome to the master control panel. Monitor unified operations, leads pipeline, compliance finances, task status, and staff attendance.</p>
      </div>

      {/* Top Summary Row (KPIs) */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}>
        <div className="glass-panel kpi-card primary">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-title">Corporate Roster</span>
            <Users size={20} color="var(--primary)" />
          </div>
          <span className="kpi-value">{users.length} Employees</span>
          <span className="kpi-meta">{managers.length} Managers | {hrs.length} HR | {executives.length} Execs</span>
        </div>
        <div className="glass-panel kpi-card warning">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-title">Pipeline Capture</span>
            <TrendingUp size={20} color="var(--warning)" />
          </div>
          <span className="kpi-value">₹ {totalLeadsValue.toLocaleString()}</span>
          <span className="kpi-meta">{leads.length} Active leads in system</span>
        </div>
        <div className="glass-panel kpi-card success">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-title">Closed Success</span>
            <CheckCircle2 size={20} color="var(--success)" />
          </div>
          <span className="kpi-value">₹ {revenueClosed.toLocaleString()}</span>
          <span className="kpi-meta">{closedWonLeads.length} Closed Won deals</span>
        </div>
        <div className="glass-panel kpi-card info">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-title">Task Directives</span>
            <ClipboardList size={20} color="var(--info)" />
          </div>
          <span className="kpi-value">{pendingTasksCount} Pending</span>
          <span className="kpi-meta">{completedTasksCount} Completed directives</span>
        </div>
        <div className="glass-panel kpi-card success" style={{ borderLeftColor: 'var(--secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-title">Attendance Today</span>
            <Clock size={20} color="var(--secondary)" />
          </div>
          <span className="kpi-value">{checkedInToday.length} Present</span>
          <span className="kpi-meta">Active office sessions</span>
        </div>
        <div className="glass-panel kpi-card primary" style={{ borderLeftColor: '#3B82F6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-title">IVR Center Logs</span>
            <PhoneCall size={20} color="#3B82F6" />
          </div>
          <span className="kpi-value">{calls.length} Phone Calls</span>
          <span className="kpi-meta">{(calls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0) / 3600).toFixed(1)} hrs total talk time</span>
        </div>
      </div>

      {/* Row 1: Pipeline & Finances */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: '32px' }}>

        {/* Sales Pipeline & Lead Funnel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <TrendingUp size={20} color="var(--warning)" /> Client Pipeline & Funnel
            </h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Link
                to="/admin/all-leads"
                className="btn"
                style={{
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(var(--primary-rgb), 0.08)',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                View Detailed List <ArrowUpRight size={12} />
              </Link>
              <div style={{ position: 'relative', width: '160px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={leadSearch}
                  onChange={e => setLeadSearch(e.target.value)}
                  style={{ padding: '6px 10px 6px 28px', fontSize: '0.8rem', height: '32px', borderRadius: '8px', boxSizing: 'border-box' }}
                />
              </div>
              <select
                value={activeLeadFilter}
                onChange={e => setActiveLeadFilter(e.target.value)}
                style={{ padding: '4px 10px', fontSize: '0.8rem', height: '32px', borderRadius: '8px', width: '120px' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Interested">Interested</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Closed Won">Closed Won</option>
                <option value="Closed Lost">Closed Lost</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {/* Status Progress Bars */}
            {[
              { label: 'New Inbound', key: 'New', color: 'var(--info)' },
              { label: 'Contacted', key: 'Contacted', color: 'var(--warning)' },
              { label: 'Interested', key: 'Interested', color: 'var(--secondary)' },
              { label: 'Follow Up', key: 'Follow Up', color: 'var(--primary)' },
              { label: 'Proposal Sent', key: 'Proposal Sent', color: 'var(--info)' },
              { label: 'Negotiation', key: 'Negotiation', color: 'var(--warning)' },
              { label: 'Closed Won', key: 'Closed Won', color: 'var(--success)' },
              { label: 'Closed Lost', key: 'Closed Lost', color: 'var(--danger)' }
            ].map(status => {
              const val = statusCounts[status.key] || 0;
              const pct = getPercentage(val);
              return (
                <div key={status.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{status.label}</span>
                    <span style={{ fontWeight: 800, color: status.color }}>{val} Leads ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: status.color, borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeadsList.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>No matching leads found.</td>
                  </tr>
                ) : (
                  filteredLeadsList.slice(0, 5).map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 700 }}>
                        <div>{l.customerName}</div>
                        {l.lastUpdatedBy && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '4px' }}>
                            Updated: {l.lastUpdatedBy} ({l.lastUpdatedAt})
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 800 }}>₹ {parseFloat(l.value || 0).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${(l.status || 'New').toLowerCase().replace(/ /g, '')}`}>
                          {l.status || 'New'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{users.find(u => u.id === l.userId)?.name || 'System'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Ledger & Compliance */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={20} color="var(--success)" /> Corporate Ledger & Tax Compliance
          </h3>

          {/* Mini Financial Cards Grid */}
          <div className="grid-2-responsive" style={{ marginBottom: '24px' }}>
            <div style={{ background: 'rgba(var(--success-rgb), 0.05)', border: '1px solid rgba(var(--success-rgb), 0.15)', padding: '16px', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Operating Income</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--success)', marginTop: '4px' }}>
                ₹ {parseFloat(finances.plReport.TotalIncome || 0).toLocaleString()}
              </div>
            </div>
            <div style={{ background: 'rgba(var(--danger-rgb), 0.05)', border: '1px solid rgba(var(--danger-rgb), 0.15)', padding: '16px', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Operating Expenses</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--danger)', marginTop: '4px' }}>
                ₹ {parseFloat(finances.plReport.TotalExpense || 0).toLocaleString()}
              </div>
            </div>
            <div style={{ background: 'rgba(var(--primary-rgb), 0.05)', border: '1px solid rgba(var(--primary-rgb), 0.15)', padding: '16px', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>VAT Liability (15%)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)', marginTop: '4px' }}>
                ₹ {parseFloat(finances.vatReport.VatPayable || 0).toLocaleString()}
              </div>
            </div>
            <div style={{ background: 'rgba(var(--warning-rgb), 0.05)', border: '1px solid rgba(var(--warning-rgb), 0.15)', padding: '16px', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Zakat Due (2.5%)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--warning)', marginTop: '4px' }}>
                ₹ {parseFloat(finances.zakatReport.ZakatDue || 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 4).map(t => (
                  <tr key={t.id}>
                    <td>{t.transactionDate}</td>
                    <td style={{ fontWeight: 600 }}>{t.description}</td>
                    <td>{t.category}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: t.type === 'INCOME' ? 'var(--success)' : 'var(--danger)' }}>
                      {t.type === 'INCOME' ? '+' : '-'} ₹ {parseFloat(t.totalAmount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Row 2: Unified Corporate Roster & Checked-in Status */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="var(--primary)" /> Unified Corporate Roster & Checked-In Status
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search name, email, role..."
                value={rosterSearch}
                onChange={e => setRosterSearch(e.target.value)}
                style={{ padding: '8px 12px 8px 36px', fontSize: '0.85rem', height: '38px', borderRadius: '10px', boxSizing: 'border-box' }}
              />
            </div>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              {['ALL', 'MANAGER', 'HR', 'EXECUTIVE'].map(role => (
                <button
                  key={role}
                  onClick={() => setActiveRoleFilter(role)}
                  style={{
                    background: activeRoleFilter === role ? 'var(--primary)' : 'transparent',
                    color: activeRoleFilter === role ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {role === 'ALL' ? 'All Staff' : role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Corporate Email</th>
                <th>Role</th>
                <th>Position</th>
                <th>Salary</th>
                <th>Est. Lead Value</th>
                <th>Date of Joining</th>
                <th>Reporting Manager</th>
                <th>Attendance Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No staff members match the filters.</td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const att = getUserAttendanceToday(u.id);
                  const userLeads = leads.filter(l => l.userId === u.id);
                  const estValue = userLeads.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span style={getRoleBadgeStyle(u.role)}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{u.position || 'Administrator'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {u.salary ? `₹ ${parseFloat(u.salary).toLocaleString()}` : 'N/A'}
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--success)' }}>
                        ₹ {estValue.toLocaleString()}
                      </td>
                      <td>{u.dateJoined || 'N/A'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        {u.role === 'ADMIN' ? '-' : u.role === 'MANAGER' ? 'CEO' : getManagerName(u.managerId)}
                      </td>
                      <td>
                        <div style={getAttendanceBadgeStyle(att.status)}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: att.color,
                            boxShadow: att.status === 'Online' ? '0 0 8px #10b981' : 'none'
                          }}></span>
                          <span>
                            {att.status} {att.time ? `(${att.time})` : ''}
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleDeleteUser(u.id)} className="btn-action btn-delete" style={{ padding: '6px', minHeight: 'unset', marginLeft: 'auto' }} title="Delete Employee">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Directives Checklist & Leaves Center */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: '32px' }}>

        {/* Operations Tasks Checklist */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ClipboardList size={20} color="var(--info)" /> Operational Directives Checklist
            </h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '160px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={taskSearch}
                  onChange={e => setTaskSearch(e.target.value)}
                  style={{ padding: '6px 10px 6px 28px', fontSize: '0.8rem', height: '32px', borderRadius: '8px', boxSizing: 'border-box' }}
                />
              </div>
              <select
                value={activeTaskFilter}
                onChange={e => setActiveTaskFilter(e.target.value)}
                style={{ padding: '4px 10px', fontSize: '0.8rem', height: '32px', borderRadius: '8px', width: '110px' }}
              >
                <option value="ALL">All Tasks</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="data-table-wrapper" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Directive details</th>
                  <th>Assignee</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasksList.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>No directives found.</td>
                  </tr>
                ) : (
                  filteredTasksList.map(t => (
                    <tr key={t.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{t.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{t.description}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{users.find(u => u.id === t.assignedTo)?.name || 'Unassigned'}</td>
                      <td>{t.dueDate}</td>
                      <td>
                        <span style={getTaskBadgeStyle(t.status)}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leaves & Absence Center */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={18} color="var(--warning)" /> Staff Absence & Leave Requests
            </h3>
            <select
              value={activeLeaveFilter}
              onChange={e => setActiveLeaveFilter(e.target.value)}
              style={{ padding: '4px 10px', fontSize: '0.8rem', height: '32px', borderRadius: '8px', width: '120px' }}
            >
              <option value="ALL">All Leaves</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="data-table-wrapper" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Requester</th>
                  <th>Timeframe</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeavesList.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>No absence requests found.</td>
                  </tr>
                ) : (
                  filteredLeavesList.map(l => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{l.requesterName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.role}</div>
                      </td>
                      <td>{l.startDate} to {l.endDate}</td>
                      <td>{l.reason}</td>
                      <td>
                        <span style={getLeaveBadgeStyle(l.status)}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Row 4: IVR Logs Overview */}
      <div className="glass-panel" style={{ padding: '24px', marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <PhoneCall size={20} color="var(--primary)" /> Corporate IVR & Phone Center Registry
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search customer, agent, phone..."
                value={callSearchQuery}
                onChange={e => setCallSearchQuery(e.target.value)}
                style={{ padding: '8px 12px 8px 36px', fontSize: '0.85rem', height: '38px', borderRadius: '10px', boxSizing: 'border-box' }}
              />
            </div>
            <select
              value={callFilterDirection}
              onChange={e => setCallFilterDirection(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', height: '38px' }}
            >
              <option value="ALL">All Directions</option>
              <option value="INBOUND">Inbound</option>
              <option value="OUTBOUND">Outbound</option>
            </select>
            <select
              value={callFilterStatus}
              onChange={e => setCallFilterStatus(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', height: '38px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ANSWERED">Answered</option>
              <option value="MISSED">Missed</option>
              <option value="BUSY">Busy</option>
              <option value="VOICEMAIL">Voicemail</option>
            </select>
            <select
              value={callFilterSim}
              onChange={e => setCallFilterSim(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', height: '38px' }}
            >
              <option value="ALL">All SIMs/Lines</option>
              <option value="Mobile Imported SIM">Mobile Imported SIM</option>
              <option value="Corporate VoIP">Corporate VoIP</option>
            </select>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Direction</th>
                <th>Customer Contact</th>
                <th>SIM / Line</th>
                <th>Agent Name</th>
                <th>Timing</th>
                <th>Status</th>
                <th>Duration</th>
                <th style={{ textAlign: 'right' }}>Playback & Actions</th>
              </tr>
            </thead>
            <tbody>
              {calls.filter(c => {
                const matchesDirection = callFilterDirection === 'ALL' || c.direction === callFilterDirection;
                const matchesStatus = callFilterStatus === 'ALL' || c.status === callFilterStatus;
                const matchesSim = callFilterSim === 'ALL' || c.simUsed === callFilterSim;
                const matchesSearch = c.customerName.toLowerCase().includes(callSearchQuery.toLowerCase()) ||
                  c.customerPhone.includes(callSearchQuery) ||
                  (c.agentName && c.agentName.toLowerCase().includes(callSearchQuery.toLowerCase()));
                return matchesDirection && matchesStatus && matchesSim && matchesSearch;
              }).length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No IVR call logs matched your filter parameters.</td>
                </tr>
              ) : (
                calls.filter(c => {
                  const matchesDirection = callFilterDirection === 'ALL' || c.direction === callFilterDirection;
                  const matchesStatus = callFilterStatus === 'ALL' || c.status === callFilterStatus;
                  const matchesSim = callFilterSim === 'ALL' || c.simUsed === callFilterSim;
                  const matchesSearch = c.customerName.toLowerCase().includes(callSearchQuery.toLowerCase()) ||
                    c.customerPhone.includes(callSearchQuery) ||
                    (c.agentName && c.agentName.toLowerCase().includes(callSearchQuery.toLowerCase()));
                  return matchesDirection && matchesStatus && matchesSim && matchesSearch;
                }).map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {c.direction === 'INBOUND' ? (
                          <span style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                            <ArrowDownLeft size={14} />
                          </span>
                        ) : (
                          <span style={{ color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                            <ArrowUpRight size={14} />
                          </span>
                        )}
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{c.direction}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700 }}>{c.customerName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.customerPhone}</span>
                      </div>
                    </td>
                    <td>
                      {c.simUsed === 'Mobile Imported SIM' ? (
                        <span className="status-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                          Mobile SIM
                        </span>
                      ) : (
                        <span className="status-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                          Corporate VoIP
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.agentName || 'System'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {c.startTime ? new Date(c.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '---'}
                    </td>
                    <td>
                      <span className={`status-badge ${(c.status || 'ANSWERED').toLowerCase().replace(/ /g, '')}`}>
                        {c.status || 'ANSWERED'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      {c.status === 'ANSWERED' ? formatTime(c.durationSeconds) : '---'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {c.recordingUrl ? (
                          <button
                            onClick={() => selectCallToPlay(c)}
                            className="btn"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: activeCall?.id === c.id && isPlaying ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                              color: activeCall?.id === c.id && isPlaying ? '#EF4444' : '#3B82F6',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {activeCall?.id === c.id && isPlaying ? <Pause size={12} /> : <Play size={12} />}
                            {activeCall?.id === c.id && isPlaying ? 'Playing' : 'Listen'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No recording</span>
                        )}
                        <button onClick={() => handleDeleteCall(c.id)} className="btn-action btn-delete" style={{ padding: '6px', minHeight: 'unset' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AUDIO PLAYER BAR (FLOATING IN THE MASTERSHIP PANEL) */}
      {activeCall && (
        <div className="glass-panel animate-slide-up" style={{
          position: 'fixed',
          bottom: '16px',
          left: '5%',
          right: '5%',
          zIndex: 1100,
          padding: '16px 32px',
          borderTop: '2px solid var(--primary)',
          background: 'rgba(11, 15, 25, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          borderRadius: '16px'
        }}>
          <audio
            ref={audioRef}
            src={activeCall.recordingUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleAudioEnded}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={togglePlay}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--primary)', color: '#fff', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '1px' }} />}
              </button>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Listening Call Log #{activeCall.id}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {activeCall.customerName} &bull; Mapped to {activeCall.agentName || 'Agent'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexGrow: 1, maxWidth: '400px' }}>
              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                style={{
                  flexGrow: 1, height: '4px', borderRadius: '2px',
                  background: 'rgba(255,255,255,0.1)', outline: 'none', cursor: 'pointer', accentColor: 'var(--primary)'
                }}
              />
              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{formatTime(duration)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={toggleMute}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button
                onClick={() => {
                  setActiveCall(null);
                  setIsPlaying(false);
                }}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
              >
                Close
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <FileText size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
              "{activeCall.transcription || 'No transcript notes recorded.'}"
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ==========================================
   2. MANAGE MANAGERS
   ========================================== */
export function ManageManagers() {
  const [managers, setManagers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MANAGER');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [dateJoined, setDateJoined] = useState('');
  const [managerId, setManagerId] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [editUser, setEditUser] = useState(null);

  const fetchManagers = () => {
    const users = crmService.getUsers();
    const mgrs = users.filter(u => u.role === 'MANAGER');
    mgrs.forEach(m => {
      m.subordinateCount = users.filter(u => u.managerId === m.id).length;
    });
    setManagers(mgrs);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this manager account?")) {
      await crmService.deleteUser(id);
      fetchManagers();
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await crmService.addUser({
        name,
        email,
        role,
        department: role === 'HR' ? 'Human Resources' : role === 'MANAGER' ? 'Sales Management' : 'Sales Execution',
        password,
        position,
        salary: parseFloat(salary) || 0,
        dateJoined,
        managerId: (role !== 'MANAGER' && managerId) ? parseInt(managerId) : null,
        phone: '+966 50 000 0000', // default placeholder contact
        targetAmount: parseFloat(targetAmount) || 0
      });
      setName('');
      setEmail('');
      setPassword('');
      setPosition('');
      setSalary('');
      setDateJoined('');
      setManagerId('');
      setTargetAmount('');
      fetchManagers();
    } catch (err) {
      alert(err.message || "Failed to add user");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await crmService.updateUserProfile(editUser.id, {
        name: editUser.name,
        email: editUser.email,
        password: editUser.password,
        position: editUser.position,
        salary: parseFloat(editUser.salary) || 0,
        dateJoined: editUser.dateJoined,
        targetAmount: parseFloat(editUser.targetAmount) || 0
      });
      setEditUser(null);
      fetchManagers();
    } catch (err) {
      alert(err.message || "Failed to update manager details");
    }
  };

  const positionsForRole = {
    MANAGER: ['Sales Director', 'Sales Manager', 'Regional Manager', 'Operations Manager'],
    HR: ['HR Lead', 'HR Specialist', 'HR Officer', 'Recruiter'],
    EXECUTIVE: ['Account Manager', 'Sales Representative', 'Sales Executive', 'Marketing Associate']
  };

  const currentPositions = positionsForRole[role] || [];
  const editPositions = editUser ? (positionsForRole[editUser.role] || []) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Manage Managers</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Add new managers and oversee operations teams.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Register New User</h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px', alignItems: 'end' }}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Corporate Email</label>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={e => { setRole(e.target.value); setPosition(''); }} required>
              <option value="MANAGER">MANAGER</option>
              <option value="HR">HR</option>
              <option value="EXECUTIVE">EXECUTIVE</option>
            </select>
          </div>
          <div className="form-group">
            <label>Position</label>
            <select value={position} onChange={e => setPosition(e.target.value)} required>
              <option value="">Select Position...</option>
              {currentPositions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Salary (INR)</label>
            <input type="number" placeholder="Salary" value={salary} onChange={e => setSalary(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Sales Target (INR)</label>
            <input type="number" placeholder="Target Amount" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Date of Joining</label>
            <input type="date" value={dateJoined} onChange={e => setDateJoined(e.target.value)} required />
          </div>
          {role !== 'MANAGER' && (
            <div className="form-group">
              <label>Reporting Manager</label>
              <select value={managerId} onChange={e => setManagerId(e.target.value)} required>
                <option value="">Select Supervisor...</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ height: '48px', marginBottom: '20px' }}>
            <Plus size={18} /> Register User
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Managers Directory</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Identity Name</th>
                <th>Email ID</th>
                <th>Position</th>
                <th>Salary</th>
                <th>Sales Target</th>
                <th>Joining Date</th>
                <th>Subordinates</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 700 }}>{m.name}</td>
                  <td>{m.email}</td>
                  <td style={{ fontWeight: 600 }}>{m.position || 'Manager'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {m.salary ? `₹ ${parseFloat(m.salary).toLocaleString()}` : 'N/A'}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                    {m.targetAmount ? `₹ ${parseFloat(m.targetAmount).toLocaleString()}` : '₹ 0'}
                  </td>
                  <td>{m.dateJoined || 'N/A'}</td>
                  <td>
                    <span style={{ background: 'rgba(var(--primary-rgb), 0.08)', color: 'var(--primary)', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                      {m.subordinateCount} Team Members
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditUser(m)} className="btn-action" style={{ padding: '6px', minHeight: 'unset' }} title="Edit Manager">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDeleteUser(m.id)} className="btn-action btn-delete" style={{ padding: '6px', minHeight: 'unset' }} title="Delete Manager">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Manager Modal */}
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '32px', width: '90%', maxWidth: '480px', background: 'var(--input-bg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '24px' }}>Edit Manager Details</h3>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={editUser.name || ''} onChange={e => setEditUser({ ...editUser, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Corporate Email</label>
                <input type="email" value={editUser.email || ''} onChange={e => setEditUser({ ...editUser, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Leave blank to keep same" value={editUser.password || ''} onChange={e => setEditUser({ ...editUser, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Position</label>
                <select value={editUser.position || ''} onChange={e => setEditUser({ ...editUser, position: e.target.value })} required>
                  <option value="">Select Position...</option>
                  {editPositions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Salary (INR)</label>
                <input type="number" value={editUser.salary || ''} onChange={e => setEditUser({ ...editUser, salary: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Sales Target (INR)</label>
                <input type="number" value={editUser.targetAmount || ''} onChange={e => setEditUser({ ...editUser, targetAmount: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Date of Joining</label>
                <input type="date" value={editUser.dateJoined || ''} onChange={e => setEditUser({ ...editUser, dateJoined: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" onClick={() => setEditUser(null)} className="btn btn-secondary" style={{ flex: 1 }}>Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   3. MANAGE HR
   ========================================== */
export function ManageHR() {
  const [hrs, setHrs] = useState([]);
  const [managers, setManagers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('HR');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [dateJoined, setDateJoined] = useState('');
  const [managerId, setManagerId] = useState('');
  const [editUser, setEditUser] = useState(null);

  const fetchHRs = () => {
    const users = crmService.getUsers();
    setHrs(users.filter(u => u.role === 'HR'));
    setManagers(users.filter(u => u.role === 'MANAGER'));
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this HR representative account?")) {
      await crmService.deleteUser(id);
      fetchHRs();
    }
  };

  useEffect(() => {
    fetchHRs();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await crmService.addUser({
        name,
        email,
        role,
        department: role === 'HR' ? 'Human Resources' : role === 'MANAGER' ? 'Sales Management' : 'Sales Execution',
        password,
        position,
        salary: parseFloat(salary) || 0,
        dateJoined,
        managerId: (role !== 'MANAGER' && managerId) ? parseInt(managerId) : null,
        phone: '+966 50 000 0000',
        targetAmount: 0
      });
      setName('');
      setEmail('');
      setPassword('');
      setPosition('');
      setSalary('');
      setDateJoined('');
      setManagerId('');
      fetchHRs();
    } catch (err) {
      alert(err.message || "Failed to add user");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await crmService.updateUserProfile(editUser.id, {
        name: editUser.name,
        email: editUser.email,
        password: editUser.password,
        position: editUser.position,
        salary: parseFloat(editUser.salary) || 0,
        dateJoined: editUser.dateJoined,
        managerId: editUser.managerId ? parseInt(editUser.managerId) : null,
        targetAmount: 0
      });
      setEditUser(null);
      fetchHRs();
    } catch (err) {
      alert(err.message || "Failed to update HR details");
    }
  };

  const positionsForRole = {
    MANAGER: ['Sales Director', 'Sales Manager', 'Regional Manager', 'Operations Manager'],
    HR: ['HR Lead', 'HR Specialist', 'HR Officer', 'Recruiter'],
    EXECUTIVE: ['Account Manager', 'Sales Representative', 'Sales Executive', 'Marketing Associate']
  };

  const currentPositions = positionsForRole[role] || [];
  const editPositions = editUser ? (positionsForRole[editUser.role] || []) : [];

  const getManagerName = (mid) => {
    const found = managers.find(m => m.id === mid);
    return found ? found.name : 'Unassigned';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Manage HR Representatives</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Provision corporate HR access and record details.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Register New User</h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px', alignItems: 'end' }}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Corporate Email</label>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={e => { setRole(e.target.value); setPosition(''); }} required>
              <option value="HR">HR</option>
              <option value="MANAGER">MANAGER</option>
              <option value="EXECUTIVE">EXECUTIVE</option>
            </select>
          </div>
          <div className="form-group">
            <label>Position</label>
            <select value={position} onChange={e => setPosition(e.target.value)} required>
              <option value="">Select Position...</option>
              {currentPositions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Salary (INR)</label>
            <input type="number" placeholder="Salary" value={salary} onChange={e => setSalary(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Date of Joining</label>
            <input type="date" value={dateJoined} onChange={e => setDateJoined(e.target.value)} required />
          </div>
          {role !== 'MANAGER' && (
            <div className="form-group">
              <label>Reporting Manager</label>
              <select value={managerId} onChange={e => setManagerId(e.target.value)} required>
                <option value="">Select Supervisor...</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ height: '48px', marginBottom: '20px' }}>
            <Plus size={18} /> Register User
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>HR Directory</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Identity Name</th>
                <th>Email ID</th>
                <th>Position</th>
                <th>Salary</th>
                <th>Joining Date</th>
                <th>Supervising Manager</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hrs.map(h => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 700 }}>{h.name}</td>
                  <td>{h.email}</td>
                  <td style={{ fontWeight: 600 }}>{h.position || 'HR Representative'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {h.salary ? `₹ ${parseFloat(h.salary).toLocaleString()}` : 'N/A'}
                  </td>
                  <td>{h.dateJoined || 'N/A'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{getManagerName(h.managerId)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditUser(h)} className="btn-action" style={{ padding: '6px', minHeight: 'unset' }} title="Edit HR Details">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDeleteUser(h.id)} className="btn-action btn-delete" style={{ padding: '6px', minHeight: 'unset' }} title="Delete HR Representative">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit HR Modal */}
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '32px', width: '90%', maxWidth: '480px', background: 'var(--input-bg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '24px' }}>Edit HR Details</h3>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={editUser.name || ''} onChange={e => setEditUser({ ...editUser, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Corporate Email</label>
                <input type="email" value={editUser.email || ''} onChange={e => setEditUser({ ...editUser, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Leave blank to keep same" value={editUser.password || ''} onChange={e => setEditUser({ ...editUser, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Position</label>
                <select value={editUser.position || ''} onChange={e => setEditUser({ ...editUser, position: e.target.value })} required>
                  <option value="">Select Position...</option>
                  {editPositions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Salary (INR)</label>
                <input type="number" value={editUser.salary || ''} onChange={e => setEditUser({ ...editUser, salary: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Date of Joining</label>
                <input type="date" value={editUser.dateJoined || ''} onChange={e => setEditUser({ ...editUser, dateJoined: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Reporting Manager</label>
                <select value={editUser.managerId || ''} onChange={e => setEditUser({ ...editUser, managerId: e.target.value })} required>
                  <option value="">Select Supervisor...</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" onClick={() => setEditUser(null)} className="btn btn-secondary" style={{ flex: 1 }}>Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   4. MANAGE EXECUTIVES
   ========================================== */
export function ManageExecutives() {
  const [executives, setExecutives] = useState([]);
  const [managers, setManagers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('EXECUTIVE');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [dateJoined, setDateJoined] = useState('');
  const [managerId, setManagerId] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [editUser, setEditUser] = useState(null);

  const fetchData = () => {
    const users = crmService.getUsers();
    setExecutives(users.filter(u => u.role === 'EXECUTIVE'));
    setManagers(users.filter(u => u.role === 'MANAGER'));
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
        role,
        department: role === 'HR' ? 'Human Resources' : role === 'MANAGER' ? 'Sales Management' : 'Sales Execution',
        password,
        position,
        salary: parseFloat(salary) || 0,
        dateJoined,
        managerId: (role !== 'MANAGER' && managerId) ? parseInt(managerId) : null,
        phone: '+966 50 000 0000',
        targetAmount: parseFloat(targetAmount) || 0
      });
      setName('');
      setEmail('');
      setPassword('');
      setPosition('');
      setSalary('');
      setDateJoined('');
      setManagerId('');
      setTargetAmount('');
      fetchData();
    } catch (err) {
      alert(err.message || "Failed to add user");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await crmService.updateUserProfile(editUser.id, {
        name: editUser.name,
        email: editUser.email,
        password: editUser.password,
        position: editUser.position,
        salary: parseFloat(editUser.salary) || 0,
        dateJoined: editUser.dateJoined,
        managerId: editUser.managerId ? parseInt(editUser.managerId) : null,
        targetAmount: parseFloat(editUser.targetAmount) || 0
      });
      setEditUser(null);
      fetchData();
    } catch (err) {
      alert(err.message || "Failed to update executive details");
    }
  };

  const positionsForRole = {
    MANAGER: ['Sales Director', 'Sales Manager', 'Regional Manager', 'Operations Manager'],
    HR: ['HR Lead', 'HR Specialist', 'HR Officer', 'Recruiter'],
    EXECUTIVE: ['Account Manager', 'Sales Representative', 'Sales Executive', 'Marketing Associate']
  };

  const currentPositions = positionsForRole[role] || [];
  const editPositions = editUser ? (positionsForRole[editUser.role] || []) : [];

  const getManagerName = (mid) => {
    const found = managers.find(m => m.id === mid);
    return found ? found.name : 'Unassigned';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Manage Executives</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Onboard sales executives and allocate manager supervisors.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Register New User</h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '16px', alignItems: 'end' }}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Corporate Email</label>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={e => { setRole(e.target.value); setPosition(''); }} required>
              <option value="EXECUTIVE">EXECUTIVE</option>
              <option value="MANAGER">MANAGER</option>
              <option value="HR">HR</option>
            </select>
          </div>
          <div className="form-group">
            <label>Position</label>
            <select value={position} onChange={e => setPosition(e.target.value)} required>
              <option value="">Select Position...</option>
              {currentPositions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Salary (INR)</label>
            <input type="number" placeholder="Salary" value={salary} onChange={e => setSalary(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Sales Target (INR)</label>
            <input type="number" placeholder="Target Amount" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Date of Joining</label>
            <input type="date" value={dateJoined} onChange={e => setDateJoined(e.target.value)} required />
          </div>
          {role !== 'MANAGER' && (
            <div className="form-group">
              <label>Reporting Manager</label>
              <select value={managerId} onChange={e => setManagerId(e.target.value)} required>
                <option value="">Select Supervisor...</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ height: '48px', marginBottom: '20px' }}>
            <Plus size={18} /> Register User
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Executives Registry</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Identity Name</th>
                <th>Email ID</th>
                <th>Position</th>
                <th>Salary</th>
                <th>Sales Target</th>
                <th>Joining Date</th>
                <th>Supervising Manager</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {executives.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 700 }}>{e.name}</td>
                  <td>{e.email}</td>
                  <td style={{ fontWeight: 600 }}>{e.position || 'Sales Executive'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {e.salary ? `₹ ${parseFloat(e.salary).toLocaleString()}` : 'N/A'}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                    {e.targetAmount ? `₹ ${parseFloat(e.targetAmount).toLocaleString()}` : '₹ 0'}
                  </td>
                  <td>{e.dateJoined || 'N/A'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{getManagerName(e.managerId)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditUser(e)} className="btn-action" style={{ padding: '6px', minHeight: 'unset' }} title="Edit Executive">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDeleteUser(e.id)} className="btn-action btn-delete" style={{ padding: '6px', minHeight: 'unset' }} title="Delete Sales Executive">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Executive Modal */}
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '32px', width: '90%', maxWidth: '480px', background: 'var(--input-bg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '24px' }}>Edit Executive Details</h3>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={editUser.name || ''} onChange={e => setEditUser({ ...editUser, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Corporate Email</label>
                <input type="email" value={editUser.email || ''} onChange={e => setEditUser({ ...editUser, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Leave blank to keep same" value={editUser.password || ''} onChange={e => setEditUser({ ...editUser, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Position</label>
                <select value={editUser.position || ''} onChange={e => setEditUser({ ...editUser, position: e.target.value })} required>
                  <option value="">Select Position...</option>
                  {editPositions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Salary (INR)</label>
                <input type="number" value={editUser.salary || ''} onChange={e => setEditUser({ ...editUser, salary: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Sales Target (INR)</label>
                <input type="number" value={editUser.targetAmount || ''} onChange={e => setEditUser({ ...editUser, targetAmount: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Date of Joining</label>
                <input type="date" value={editUser.dateJoined || ''} onChange={e => setEditUser({ ...editUser, dateJoined: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Reporting Manager</label>
                <select value={editUser.managerId || ''} onChange={e => setEditUser({ ...editUser, managerId: e.target.value })} required>
                  <option value="">Select Supervisor...</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" onClick={() => setEditUser(null)} className="btn btn-secondary" style={{ flex: 1 }}>Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   5. MANAGER LEADS (View Leads assigned to Managers)
   ========================================== */
export function ManagerLeads() {
  const [leads, setLeads] = useState([]);
  const [owners, setOwners] = useState({});

  useEffect(() => {
    const allLeads = crmService.getLeads();
    const users = crmService.getUsers();

    // Create mapping of userId to Name
    const mapping = {};
    users.forEach(u => {
      mapping[u.id] = u;
    });
    setOwners(mapping);

    // Filter leads owned by MANAGERs or those who have managers
    const managerIds = users.filter(u => u.role === 'MANAGER').map(u => u.id);
    const filtered = allLeads.filter(l => managerIds.includes(l.userId) || mapping[l.userId]?.role === 'MANAGER');
    setLeads(filtered);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Manager-Owned Leads</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View client registries handled by business managers.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Manager Registry</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Entity</th>
                <th>Lead Owner</th>
                <th>Source</th>
                <th>Pipeline Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textCenter: 'center', color: 'var(--text-muted)' }}>No leads registered directly to managers.</td>
                </tr>
              ) : (
                leads.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 700 }}>{l.customerName}</td>
                    <td>{owners[l.userId]?.name || 'Unassigned'}</td>
                    <td>{l.source}</td>
                    <td>
                      <span className={`status-badge ${(l.status || 'New').toLowerCase().replace(/ /g, '')}`}>
                        {l.status || 'New'}
                      </span>
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
   6. LEADS REPORT (Export Leads)
   ========================================== */
export function LeadsReport() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    setLeads(crmService.getLeads());
    setUsers(crmService.getUsers());
  }, []);

  const filteredLeads = leads.filter(l => {
    const matchesOwner = selectedOwner ? l.userId === parseInt(selectedOwner) : true;
    const matchesStatus = selectedStatus ? l.status === selectedStatus : true;
    return matchesOwner && matchesStatus;
  });

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Customer Name,Email,Phone,Source,Status,Estimated Value,Date Added"].join(",") + "\n"
      + filteredLeads.map(l => `"${l.customerName}","${l.email}","${l.phone || ''}","${l.source}","${l.status}",${l.value || 0},"${l.dateAdded}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Leads_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Leads Export Registry</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Filter records and export sales dataset worksheets.</p>
        </div>
        <button onClick={handleExport} className="btn btn-success">
          <Download size={18} /> Export Dataset (.CSV)
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Filter Criteria</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label>Filter by Owner</label>
            <select value={selectedOwner} onChange={e => setSelectedOwner(e.target.value)}>
              <option value="">All Owners...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Pipeline Status</label>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
              <option value="">All Statuses...</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested to Buy">Interested to Buy</option>
              <option value="Follow Up">Follow Up</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Matching Results</h3>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(var(--primary-rgb), 0.1)', padding: '4px 12px', borderRadius: '20px' }}>
            {filteredLeads.length} Records Found
          </span>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Employee Name</th>
                <th>Source</th>
                <th>Status</th>
                <th>Est. Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 700 }}>{l.customerName}</td>
                  <td style={{ fontWeight: 600 }}>{users.find(u => u.id === l.userId)?.name || `User #${l.userId}`}</td>
                  <td>{l.source}</td>
                  <td>
                    <span className={`status-badge ${(l.status || 'New').toLowerCase().replace(/ /g, '')}`}>
                      {l.status || 'New'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800 }}>₹ {l.value?.toLocaleString()}</td>
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
   7. ADMIN ASSIGN TASKS
   ========================================== */
export function AdminAssignTask() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const { currentUser } = useAuth();

  const fetchTasks = () => {
    setTasks(crmService.getTasks());
    const all = crmService.getUsers();
    setAllUsers(all);
    setUsers(all.filter(u => u.id !== currentUser.id));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    await crmService.addTask({
      title,
      description,
      dueDate,
      assignedTo: parseInt(assignedTo),
      assignedBy: currentUser.id
    });
    setTitle('');
    setDescription('');
    setDueDate('');
    setAssignedTo('');
    fetchTasks();
  };

  const handleDeallocate = async (tid) => {
    if (window.confirm('Deallocate this task duty?')) {
      await crmService.deleteTask(tid);
      fetchTasks();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Allocate Operational Tasks</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Assign target schedules and administrative tasks to operational departments.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Create Task Directive</h3>
        <form onSubmit={handleAssign} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px', alignItems: 'end' }}>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Task Title / Duty</label>
            <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Responsible Staff</label>
            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required>
              <option value="">Choose User...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Target Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 3' }}>
            <label>Requirement Details</label>
            <textarea placeholder="Directives notes..." rows="2" value={description} onChange={e => setDescription(e.target.value)} required></textarea>
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '48px', gridColumn: 'span 1' }}>
            <Plus size={18} /> Assign Duty
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Delegated Duty Registry</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Duty Description</th>
                <th>Responsible staff</th>
                <th>Due Date</th>
                <th>Status</th>
                <th style={{ textCenter: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{t.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.description}</div>
                  </td>
                  <td>{allUsers.find(u => u.id === t.assignedTo)?.name || `User #${t.assignedTo}`}</td>
                  <td>{t.dueDate}</td>
                  <td>
                    <span className={`status-badge ${t.status === 'Completed' ? 'won' : 'pending'}`}>{t.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleDeallocate(t.id)} className="btn-action btn-delete">
                      <Trash2 size={16} />
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
   8. MANAGER PERFORMANCE ANALYTICS
   ========================================== */
export function ManagerAnalytics() {
  const [performance, setPerformance] = useState([]);

  useEffect(() => {
    const users = crmService.getUsers();
    const leads = crmService.getLeads();
    const tasks = crmService.getTasks();

    const managers = users.filter(u => u.role === 'MANAGER');
    const stats = managers.map(m => {
      const team = users.filter(u => u.managerId === m.id);
      const teamIds = team.map(u => u.id);

      const teamLeads = leads.filter(l => teamIds.includes(l.userId) || l.userId === m.id);
      const wonLeads = teamLeads.filter(l => l.status === 'Closed Won');
      const val = wonLeads.reduce((sum, curr) => sum + (curr.value || 0), 0);

      return {
        name: m.name,
        teamCount: team.length,
        leadCount: teamLeads.length,
        closedWonVal: val
      };
    });
    setPerformance(stats);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Manager Analytics Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Real-time team revenue, metrics velocity, and conversions.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '24px' }}>Conversions Analytics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px' }}>
          {performance.map((p, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '24px', borderLeft: '5px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{p.name}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(var(--primary-rgb), 0.1)', padding: '2px 8px', borderRadius: '6px' }}>{p.teamCount} staff</span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Won Pipeline Revenue</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)' }}>₹ {p.closedWonVal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Funnel Leads: {p.leadCount}</span>
                <span>Conversion rate: {p.leadCount > 0 ? ((p.closedWonVal / (p.leadCount * 500000)) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   9. ATTENDANCE LOGS
   ========================================== */
export function AttendanceLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    setLogs(crmService.getAttendance());
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>System Attendance Logs</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review worker clock-in status, daily sessions, and active hours logs.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Log Registry</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee Identity</th>
                <th>Role</th>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Daily Hours</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 700 }}>{l.name}</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'var(--bg-main)' }}>{l.role}</span>
                  </td>
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
   10. CLOSED SALES ARCHIVE
   ========================================== */
export function ClosedSales() {
  const [sales, setSales] = useState([]);
  const [editSale, setEditSale] = useState(null);
  const [reopenLeadId, setReopenLeadId] = useState(null);

  const fetchSales = () => {
    const leads = crmService.getLeads();
    setSales(leads.filter(l => l.status === 'Closed Won' || l.status === 'Close'));
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleReopen = (id) => {
    setReopenLeadId(id);
  };

  const confirmReopen = async () => {
    if (reopenLeadId) {
      await crmService.updateLead(reopenLeadId, {
        status: 'Negotiation',
        closedDate: null
      });
      setReopenLeadId(null);
      fetchSales();
    }
  };

  const handleUpdateSale = async (e) => {
    e.preventDefault();
    await crmService.updateLead(editSale.id, editSale);
    setEditSale(null);
    fetchSales();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Closed Sales Archive</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review all won deals, close accounts, and customer receipts.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Sales Archive</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Account</th>
                <th>Acquisition Date</th>
                <th>Lead Source</th>
                <th>Acquired Deal Value</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No closed sales recorded in this archive.</td>
                </tr>
              ) : (
                sales.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700 }}>{s.customerName}</td>
                    <td>{s.closedDate || s.dateAdded}</td>
                    <td>{s.source}</td>
                    <td style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1rem' }}>
                      ₹ {s.value?.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditSale(s)} className="btn-action" style={{ padding: '6px', minHeight: 'unset' }} title="Edit Closed Sale">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleReopen(s.id)} className="btn-action" style={{ padding: '6px', minHeight: 'unset' }} title="Reopen Lead / Undo Close">
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reopen Confirmation Modal */}
      {reopenLeadId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '32px', width: '90%', maxWidth: '440px', background: 'var(--input-bg)' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle color="var(--warning)" size={20} /> Reopen Closed Sale
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '24px' }}>
              Are you sure you want to reopen this closed sale? It will be placed back into the active pipeline as 'Negotiation'.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={confirmReopen} className="btn btn-primary" style={{ flex: 1 }}>Yes, Reopen</button>
              <button onClick={() => setReopenLeadId(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Closed Sale Modal */}
      {editSale && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '32px', width: '90%', maxWidth: '480px', background: 'var(--input-bg)' }}>
            <h3 style={{ marginBottom: '24px' }}>Edit Closed Sale</h3>
            <form onSubmit={handleUpdateSale} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Customer Name</label>
                <input type="text" value={editSale.customerName} onChange={e => setEditSale({ ...editSale, customerName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Final Deal Value (INR)</label>
                <input type="number" value={editSale.value || ''} onChange={e => setEditSale({ ...editSale, value: parseFloat(e.target.value) || 0 })} required />
              </div>
              <div className="form-group">
                <label>Closing Comments / Remarks</label>
                <textarea rows="3" value={editSale.notes || ''} onChange={e => setEditSale({ ...editSale, notes: e.target.value })} required></textarea>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" onClick={() => setEditSale(null)} className="btn btn-secondary" style={{ flex: 1 }}>Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   11. FINANCE CENTER
   ========================================== */
export function FinanceCenter() {
  const [transactions, setTransactions] = useState([]);
  const [reports, setReports] = useState({
    plReport: { TotalIncome: 0, NetProfit: 0, TotalExpense: 0 },
    vatReport: { VatPayable: 0 },
    zakatReport: { ZakatBase: 0, ZakatDue: 0 }
  });

  const [description, setDescription] = useState('');
  const [type, setType] = useState('INCOME');
  const [category, setCategory] = useState('Sales');
  const [currency, setCurrency] = useState('INR');
  const [baseAmount, setBaseAmount] = useState('');
  const [vatRate, setVatRate] = useState('15');

  const fetchFinanceData = () => {
    setTransactions(crmService.getTransactions());
    setReports(crmService.getFinancialReports());
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    await crmService.addTransaction({
      description,
      type,
      category,
      currency,
      baseAmount: parseFloat(baseAmount),
      vatRate: parseFloat(vatRate)
    });
    setDescription('');
    setBaseAmount('');
    fetchFinanceData();
  };

  const handleDelete = async (tid) => {
    if (window.confirm('Remove this transaction entry?')) {
      await crmService.deleteTransaction(tid);
      fetchFinanceData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Financial Command Center</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Real-time P&L, VAT, and Zakat ledger records.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-success">Download P&L</button>
          <button className="btn btn-primary">Export VAT Return</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="glass-panel kpi-card info">
          <span className="kpi-title">Total Revenue</span>
          <span className="kpi-value">₹ {reports.plReport.TotalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="glass-panel kpi-card danger">
          <span className="kpi-title">VAT Payable</span>
          <span className="kpi-value">₹ {reports.vatReport.VatPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="glass-panel kpi-card success">
          <span className="kpi-title">Net Profit</span>
          <span className="kpi-value">₹ {reports.plReport.NetProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="glass-panel kpi-card warning">
          <span className="kpi-title">Est. Zakat Due</span>
          <span className="kpi-value">₹ {reports.zakatReport.ZakatDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="kpi-meta">Base: ₹ {reports.zakatReport.ZakatBase.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '32px', alignItems: 'start' }}>

        {/* Post Entry Form */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Post New Entry</h3>
          <form onSubmit={handlePost}>
            <div className="form-group">
              <label>Description</label>
              <input type="text" placeholder="e.g. Server hosting fee" value={description} onChange={e => setDescription(e.target.value)} required />
            </div>

            <div className="grid-2-responsive">
              <div className="form-group">
                <label>Entry Type</label>
                <select value={type} onChange={e => setType(e.target.value)}>
                  <option value="INCOME">Income (Revenue)</option>
                  <option value="EXPENSE">Expense (Cost)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Financial Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Sales">Product Sales</option>
                  <option value="Consultancy">Consultancy Fees</option>
                  <option value="Rent">Office Rent</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Salaries">Staff Salaries</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Supplies">Office Supplies</option>
                </select>
              </div>
            </div>

            <div className="grid-2-responsive">
              <div className="form-group">
                <label>Currency</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)}>
                  <option value="INR">₹ - Indian Rupee</option>
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="BHD">BHD - Bahraini Dinar</option>
                  <option value="OMR">OMR - Omani Rial</option>
                  <option value="KWD">KWD - Kuwaiti Dinar</option>
                  <option value="QAR">QAR - Qatari Riyal</option>
                </select>
              </div>

              <div className="form-group">
                <label>Base Amount</label>
                <input type="number" step="0.01" value={baseAmount} onChange={e => setBaseAmount(e.target.value)} required />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label>VAT Rate (%)</label>
              <select value={vatRate} onChange={e => setVatRate(e.target.value)}>
                <option value="15">15% (KSA Standard)</option>
                <option value="5">5% (UAE Standard)</option>
                <option value="0">0% (Exempt)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Post to Ledger
            </button>
          </form>
        </div>

        {/* General Ledger */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>General Ledger</h3>
          <div className="data-table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Entry</th>
                  <th>Total (INR)</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td>{tx.transactionDate}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{tx.description}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {tx.category} • {tx.baseAmount} {tx.currency} (+{tx.vatRate}%)
                      </div>
                    </td>
                    <td style={{ fontWeight: 800, color: tx.type === 'INCOME' ? 'var(--success)' : 'var(--danger)' }}>
                      ₹ {tx.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDelete(tx.id)} className="btn-action btn-delete">
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
    </div>
  );
}

/* ==========================================
   12. ADMIN PROFILE SETTINGS
   ========================================== */
export function AdminProfile() {
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
      setDepartment(currentUser.department || 'Executive Office');
      setPassword(currentUser.password);
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    await updateProfile({ name, email, phone, department, password });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '600px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Account Profile Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Update your corporate security configuration details.</p>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ marginBottom: '24px' }}>Profile Details</h3>

        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(var(--success-rgb), 0.1)',
            border: '1px solid rgba(var(--success-rgb), 0.2)',
            color: 'var(--success)',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            marginBottom: '24px'
          }}>
            <CheckCircle2 size={18} />
            <span>Profile settings saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label>Legal Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Corporate Email</label>
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

          <button type="submit" className="btn btn-primary" style={{ padding: '14px', fontWeight: 700, marginTop: '8px' }}>
            Save Registry Profile
          </button>
        </form>
      </div>
    </div>
  );
}

/* ==========================================
   13. ALL LEADS PAGE (Detailed List)
   ========================================== */
export function AdminAllLeads() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editLead, setEditLead] = useState(null);

  const fetchLeads = () => {
    setLeads(crmService.getLeads());
    setUsers(crmService.getUsers());
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const getOwnerName = (userId) => {
    const found = users.find(u => u.id === userId);
    return found ? found.name : 'System';
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();
    try {
      await crmService.updateLead(editLead.id, {
        customerName: editLead.customerName,
        email: editLead.email,
        phone: editLead.phone,
        college: editLead.college,
        passoutYear: editLead.passoutYear ? parseInt(editLead.passoutYear) : null,
        department: editLead.department,
        source: editLead.source,
        status: editLead.status,
        value: parseFloat(editLead.value) || 0,
        userId: parseInt(editLead.userId)
      });
      setEditLead(null);
      fetchLeads();
    } catch (err) {
      alert(err.message || "Failed to update lead");
    }
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this lead from the pipeline?")) {
      await crmService.deleteLead(id);
      fetchLeads();
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchesSearch = (l.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.phone && l.phone.includes(search)) ||
      (l.college && l.college.toLowerCase().includes(search.toLowerCase())) ||
      (l.department && l.department.toLowerCase().includes(search.toLowerCase())) ||
      getOwnerName(l.userId).toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>All Pipeline Leads</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View, search, and filter the complete database of client opportunities.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Detailed Lead List</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search name, email, college, owner..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: '8px 12px 8px 36px', fontSize: '0.85rem', height: '38px', borderRadius: '10px', boxSizing: 'border-box' }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', height: '38px', width: '160px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested to Buy">Interested to Buy</option>
              <option value="Follow Up">Follow Up</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact details</th>
                <th>Academic details</th>
                <th>Source</th>
                <th>Pipeline Status</th>
                <th>Est. Value</th>
                <th>Lead Owner</th>
                <th>Last Action</th>
                <th>Date Added</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No leads match the filters.</td>
                </tr>
              ) : (
                filteredLeads.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 700 }}>{l.customerName}</td>
                    <td>
                      <div>{l.email}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{l.college || 'N/A'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {l.department || 'N/A'} {l.passoutYear ? `(${l.passoutYear})` : ''}
                      </div>
                    </td>
                    <td>{l.source}</td>
                    <td>
                      <span className={`status-badge ${(l.status || 'New').toLowerCase().replace(/ /g, '')}`}>{l.status || 'New'}</span>
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--success)' }}>₹ {parseFloat(l.value || 0).toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>{getOwnerName(l.userId)}</td>
                    <td>
                      {l.lastUpdatedBy ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{l.lastUpdatedBy}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{l.lastUpdatedAt}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No edits logged</span>
                      )}
                    </td>
                    <td>{l.dateAdded}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditLead(l)} className="btn-action" style={{ padding: '6px', minHeight: 'unset' }} title="Edit Lead">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteLead(l.id)} className="btn-action btn-delete" style={{ padding: '6px', minHeight: 'unset' }} title="Delete Lead">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Lead Modal */}
      {editLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '32px', width: '90%', maxWidth: '480px', background: 'var(--input-bg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '24px' }}>Edit Lead Details</h3>
            <form onSubmit={handleUpdateLead} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Customer Name</label>
                <input type="text" value={editLead.customerName || ''} onChange={e => setEditLead({ ...editLead, customerName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={editLead.email || ''} onChange={e => setEditLead({ ...editLead, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" value={editLead.phone || ''} onChange={e => setEditLead({ ...editLead, phone: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>College</label>
                <input type="text" value={editLead.college || ''} onChange={e => setEditLead({ ...editLead, college: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Passout Year</label>
                <input type="number" value={editLead.passoutYear || ''} onChange={e => setEditLead({ ...editLead, passoutYear: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Department / Stream</label>
                <input type="text" value={editLead.department || ''} onChange={e => setEditLead({ ...editLead, department: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Lead Source</label>
                <select value={editLead.source || ''} onChange={e => setEditLead({ ...editLead, source: e.target.value })} required>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Pipeline Status</label>
                <select value={editLead.status || ''} onChange={e => setEditLead({ ...editLead, status: e.target.value })} required>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Interested to Buy">Interested to Buy</option>
                  <option value="Follow Up">Follow Up</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
              </div>
              <div className="form-group">
                <label>Est. Value (INR)</label>
                <input type="number" value={editLead.value || ''} onChange={e => setEditLead({ ...editLead, value: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Lead Owner</label>
                <select value={editLead.userId || ''} onChange={e => setEditLead({ ...editLead, userId: e.target.value })} required>
                  <option value="">Select Owner...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" onClick={() => setEditLead(null)} className="btn btn-secondary" style={{ flex: 1 }}>Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
