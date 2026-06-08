import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { crmService } from '../../services/crmService';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, CheckSquare, Calendar, ChevronRight, DollarSign, 
  TrendingUp, Plus, Trash2, Edit2, Search, CheckCircle2, 
  AlertTriangle, Filter, ArrowUpRight, ShieldAlert, Award,
  Clock, Phone, Play, Pause, Volume2, VolumeX, X, Briefcase, FileText,
  RotateCcw
} from 'lucide-react';

/* ==========================================
   1. MANAGER DASHBOARD
   ========================================== */
export function ManagerDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ teamSize: 0, totalLeads: 0, pendingLeaves: 0 });
  const [teamLeads, setTeamLeads] = useState([]);
  const [pendingLeavesList, setPendingLeavesList] = useState([]);
  const [teamData, setTeamData] = useState([]);

  // Drill-down Detail Modal State
  const [selectedExecutive, setSelectedExecutive] = useState(null);
  const [modalTab, setModalTab] = useState('tasks'); // 'tasks' | 'leads' | 'calls' | 'attendance'
  
  // Call playback player state (inside modal/dashboard)
  const [activeCall, setActiveCall] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const loadDashboardData = () => {
    const users = crmService.getUsers();
    const leads = crmService.getLeads();
    const leaves = crmService.getLeaves();
    const tasks = crmService.getTasks();
    const attendance = crmService.getAttendance();
    const calls = crmService.getCallLogs();

    const team = users.filter(u => u.managerId === currentUser.id);
    const teamIds = team.map(u => u.id);
    
    // Combined leads: team leads + manager owned leads
    const combinedLeads = leads.filter(l => teamIds.includes(l.userId) || l.userId === currentUser.id);
    
    // Pending leaves from team members
    const pendingLeaves = leaves.filter(l => teamIds.includes(l.requesterId) && l.status === 'Pending');

    setStats({
      teamSize: team.length,
      totalLeads: combinedLeads.length,
      pendingLeaves: pendingLeaves.length
    });

    setTeamLeads(combinedLeads.slice(0, 5));
    setPendingLeavesList(pendingLeaves);

    // Compute detailed performance data for team executives
    const computedTeam = team.map(exec => {
      // 1. Task progress
      const execTasks = tasks.filter(t => t.assignedTo === exec.id);
      const completedTasks = execTasks.filter(t => t.status === 'Completed').length;
      
      // 2. Sales Pipeline
      const execLeads = leads.filter(l => l.userId === exec.id);
      const activeLeads = execLeads.filter(l => l.status !== 'Closed Won' && l.status !== 'Closed Lost' && l.status !== 'Close');
      const wonLeads = execLeads.filter(l => l.status === 'Closed Won' || l.status === 'Close');
      const totalRevenue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);

      // 3. Attendance Clock status
      const todayStr = new Date().toISOString().split('T')[0];
      const todayRecord = attendance.find(att => att.userId === exec.id && att.date === todayStr);
      let status = 'Offline';
      let checkInTime = null;
      let checkOutTime = null;
      
      if (todayRecord) {
        checkInTime = todayRecord.checkIn;
        checkOutTime = todayRecord.checkOut;
        if (todayRecord.checkIn && !todayRecord.checkOut) {
          status = 'Online';
        } else if (todayRecord.checkIn && todayRecord.checkOut) {
          status = 'Checked Out';
        }
      }

      // 4. Calls
      const execCalls = calls.filter(c => c.agentId === exec.id || (c.agentName && c.agentName.toLowerCase() === exec.name.toLowerCase()));
      const totalCalls = execCalls.length;
      const totalDurationSec = execCalls.reduce((sum, c) => sum + (c.durationSeconds || 0), 0);
      const talkMinutes = Math.round(totalDurationSec / 60);

      // 5. Attendance History
      const execAttendance = attendance.filter(att => att.userId === exec.id);

      return {
        ...exec,
        tasks: execTasks,
        completedTasks,
        totalTasks: execTasks.length,
        leads: execLeads,
        activeLeadsCount: activeLeads.length,
        wonLeadsCount: wonLeads.length,
        totalRevenue,
        status,
        checkInTime,
        checkOutTime,
        calls: execCalls,
        totalCalls,
        talkMinutes,
        attendanceHistory: execAttendance
      };
    });

    setTeamData(computedTeam);

    // If selectedExecutive is open, refresh its data in the modal too
    if (selectedExecutive) {
      const refreshedSelected = computedTeam.find(u => u.id === selectedExecutive.id);
      if (refreshedSelected) {
        setSelectedExecutive(refreshedSelected);
      }
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

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

  const handleDeleteTask = async (id) => {
    if (window.confirm('Delete this task directive permanently?')) {
      await crmService.deleteTask(id);
      loadDashboardData();
    }
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm('Delete this lead opportunity permanently?')) {
      await crmService.deleteLead(id);
      loadDashboardData();
    }
  };

  const handleDeleteCall = async (id) => {
    if (window.confirm('Delete this call log record permanently?')) {
      await crmService.deleteCallLog(id);
      loadDashboardData();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Manager Control Console</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Supervise team accounts, monitor leads funnels, and process requests.</p>
      </div>

      <div className="kpi-grid">
        <div className="glass-panel kpi-card primary">
          <span className="kpi-title">Team Size</span>
          <span className="kpi-value">{stats.teamSize} Executives</span>
          <span className="kpi-meta">Active operational workers</span>
        </div>
        <div className="glass-panel kpi-card success">
          <span className="kpi-title">Team Funnel Leads</span>
          <span className="kpi-value">{stats.totalLeads} Opportunity Leads</span>
          <span className="kpi-meta">Overall pipeline velocity</span>
        </div>
        <div className="glass-panel kpi-card warning">
          <span className="kpi-title">Pending Leave approvals</span>
          <span className="kpi-value">{stats.pendingLeaves} Requests</span>
          <span className="kpi-meta">Awaiting your authorization</span>
        </div>
      </div>

      {/* Reporting Juniors operational matrix */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={22} color="var(--primary)" /> Reporting Team Operational Matrix
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              Real-time synchronization of junior clock statuses, task directives, calling records, and pipeline value.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 8px var(--success)', display: 'inline-block' }}></span> Online
            </span>
            <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)', boxShadow: '0 0 8px var(--warning)', display: 'inline-block' }}></span> Checked Out
            </span>
            <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', display: 'inline-block' }}></span> Offline
            </span>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Executive</th>
                <th>Today's Attendance</th>
                <th>Task Directives</th>
                <th>Revenue Generated</th>
                <th>Calling Volume (IVR)</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamData.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No junior executives reporting to you yet. Add or assign team members.
                  </td>
                </tr>
              ) : (
                teamData.map(exec => {
                  const taskPercent = exec.totalTasks > 0 ? Math.round((exec.completedTasks / exec.totalTasks) * 100) : 0;
                  return (
                    <tr key={exec.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{exec.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{exec.position}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Joined: {exec.dateJoined || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span 
                            style={{ 
                              backgroundColor: exec.status === 'Online' ? 'var(--success)' : exec.status === 'Checked Out' ? 'var(--warning)' : 'var(--text-muted)',
                              boxShadow: exec.status === 'Online' ? '0 0 8px var(--success)' : exec.status === 'Checked Out' ? '0 0 8px var(--warning)' : 'none',
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              display: 'inline-block'
                            }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{exec.status}</span>
                            {exec.checkInTime && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                In: {exec.checkInTime} {exec.checkOutTime ? `| Out: ${exec.checkOutTime}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                            <span>{exec.completedTasks}/{exec.totalTasks} Tasks</span>
                            <span>{taskPercent}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${taskPercent}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹ {exec.totalRevenue.toLocaleString()}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{exec.wonLeadsCount} Deals Won | {exec.activeLeadsCount} Active</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700 }}>{exec.totalCalls} Calls placed</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Talk: {exec.talkMinutes} mins</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => {
                            setSelectedExecutive(exec);
                            setModalTab('tasks');
                          }}
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          Deep View <ChevronRight size={14} />
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '32px' }}>
        
        {/* Recent Pipeline Activity */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Recent Pipeline Activity</h3>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {teamLeads.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 700 }}>{l.customerName}</td>
                    <td>{l.source}</td>
                    <td>
                      <span className={`status-badge ${(l.status || 'New').toLowerCase().replace(/ /g, '')}`}>
                        {l.status || 'New'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Leaves */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="var(--warning)" /> Team Leave Requests
          </h3>
          {pendingLeavesList.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pending leave applications from your team.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingLeavesList.map(l => (
                <div key={l.id} style={{
                  background: 'rgba(var(--warning-rgb), 0.05)',
                  border: '1px solid rgba(var(--warning-rgb), 0.15)',
                  padding: '16px',
                  borderRadius: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{l.requesterName} ({l.role})</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Reason: {l.reason}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{l.startDate} to {l.endDate}</div>
                  </div>
                  <span className="status-badge pending">Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* DEEP PERFORMANCE MATRIX DETAIL MODAL */}
      {selectedExecutive && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel animate-scale-up" style={{
            maxWidth: '1000px',
            width: '100%',
            maxHeight: '90vh',
            padding: '32px',
            position: 'relative',
            overflowY: 'auto',
            borderTop: '5px solid var(--primary)',
            background: 'var(--card-bg)'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setSelectedExecutive(null)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            {/* Profile Overview Card */}
            <div className="grid-1-2-responsive" style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.4rem' }}>{selectedExecutive.name}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 16px', fontSize: '0.9rem', fontWeight: 600 }}>{selectedExecutive.position}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div><strong>Email:</strong> {selectedExecutive.email}</div>
                  <div><strong>Phone:</strong> {selectedExecutive.phone}</div>
                  <div><strong>Department:</strong> {selectedExecutive.department || 'Sales Execution'}</div>
                  <div><strong>Joined Date:</strong> {selectedExecutive.dateJoined || 'N/A'}</div>
                  <div><strong>Base Salary:</strong> ₹ {(selectedExecutive.salary || 0).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>REVENUE SECURED</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--success)' }}>₹ {selectedExecutive.totalRevenue.toLocaleString()}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>{selectedExecutive.wonLeadsCount} Deals Closed</span>
                </div>
                <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>TASK RESOLUTION</span>
                  <strong style={{ fontSize: '1.25rem' }}>{selectedExecutive.completedTasks} / {selectedExecutive.totalTasks}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                    {selectedExecutive.totalTasks > 0 ? Math.round((selectedExecutive.completedTasks / selectedExecutive.totalTasks) * 100) : 0}% Completion
                  </span>
                </div>
                <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>CALL ANALYTICS</span>
                  <strong style={{ fontSize: '1.25rem' }}>{selectedExecutive.totalCalls} Calls</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>{selectedExecutive.talkMinutes} Minutes talk</span>
                </div>
                <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>TODAY'S STATUS</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px' }}>
                    <span style={{ 
                      width: '8px', height: '8px', borderRadius: '50%', 
                      backgroundColor: selectedExecutive.status === 'Online' ? 'var(--success)' : selectedExecutive.status === 'Checked Out' ? 'var(--warning)' : 'var(--text-muted)',
                      boxShadow: selectedExecutive.status === 'Online' ? '0 0 8px var(--success)' : selectedExecutive.status === 'Checked Out' ? '0 0 8px var(--warning)' : 'none'
                    }} />
                    <strong style={{ fontSize: '1rem' }}>{selectedExecutive.status}</strong>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                    {selectedExecutive.checkInTime ? `In: ${selectedExecutive.checkInTime}` : 'Not Checked-In'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '20px', overflowX: 'auto' }}>
              <button 
                onClick={() => setModalTab('tasks')}
                style={{
                  padding: '10px 20px', background: 'none', border: 'none', 
                  borderBottom: modalTab === 'tasks' ? '3px solid var(--primary)' : '3px solid transparent',
                  color: modalTab === 'tasks' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 700, cursor: 'pointer', outline: 'none', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <CheckSquare size={16} /> Task Directives
              </button>
              <button 
                onClick={() => setModalTab('leads')}
                style={{
                  padding: '10px 20px', background: 'none', border: 'none', 
                  borderBottom: modalTab === 'leads' ? '3px solid var(--primary)' : '3px solid transparent',
                  color: modalTab === 'leads' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 700, cursor: 'pointer', outline: 'none', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <TrendingUp size={16} /> Sales Pipeline
              </button>
              <button 
                onClick={() => setModalTab('calls')}
                style={{
                  padding: '10px 20px', background: 'none', border: 'none', 
                  borderBottom: modalTab === 'calls' ? '3px solid var(--primary)' : '3px solid transparent',
                  color: modalTab === 'calls' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 700, cursor: 'pointer', outline: 'none', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <Phone size={16} /> IVR Call Logs
              </button>
              <button 
                onClick={() => setModalTab('attendance')}
                style={{
                  padding: '10px 20px', background: 'none', border: 'none', 
                  borderBottom: modalTab === 'attendance' ? '3px solid var(--primary)' : '3px solid transparent',
                  color: modalTab === 'attendance' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 700, cursor: 'pointer', outline: 'none', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <Clock size={16} /> Attendance History
              </button>
            </div>

            {/* Tab Panels */}
            <div>
              {modalTab === 'tasks' && (
                <div>
                  <h4 style={{ marginBottom: '16px' }}>Task Directive Register</h4>
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Title & Description</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedExecutive.tasks.length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>No task directives assigned to this executive.</td>
                          </tr>
                        ) : (
                          selectedExecutive.tasks.map(t => (
                            <tr key={t.id}>
                              <td>
                                <div style={{ fontWeight: 700 }}>{t.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.description}</div>
                              </td>
                              <td style={{ fontSize: '0.85rem' }}>{t.dueDate}</td>
                              <td>
                                <span className={`status-badge ${t.status === 'Completed' ? 'won' : 'pending'}`}>{t.status}</span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button onClick={() => handleDeleteTask(t.id)} className="btn-action btn-delete" style={{ padding: '6px', minHeight: 'unset' }}>
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {modalTab === 'leads' && (
                <div>
                  <h4 style={{ marginBottom: '16px' }}>Pipeline Customer Opportunities</h4>
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Client / Organization</th>
                          <th>Source</th>
                          <th>Value (INR)</th>
                          <th>Stage</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedExecutive.leads.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>No leads registered in this executive's pipeline.</td>
                          </tr>
                        ) : (
                          selectedExecutive.leads.map(l => (
                            <tr key={l.id}>
                              <td>
                                <div style={{ fontWeight: 700 }}>{l.customerName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.email} | {l.phone}</div>
                              </td>
                              <td>{l.source}</td>
                              <td style={{ fontWeight: 600 }}>₹ {(l.value || 0).toLocaleString()}</td>
                              <td>
                                <span className={`status-badge ${(l.status || 'New').toLowerCase().replace(/ /g, '')}`}>{l.status || 'New'}</span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button onClick={() => handleDeleteLead(l.id)} className="btn-action btn-delete" style={{ padding: '6px', minHeight: 'unset' }}>
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {modalTab === 'calls' && (
                <div>
                  <h4 style={{ marginBottom: '16px' }}>Interactive Call Recordings & Transcripts</h4>
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Direction</th>
                          <th>Customer</th>
                          <th>SIM / Line</th>
                          <th>Timing</th>
                          <th>Status</th>
                          <th>Duration</th>
                          <th style={{ textAlign: 'right' }}>Playback & Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedExecutive.calls.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>No call records logged for this executive.</td>
                          </tr>
                        ) : (
                          selectedExecutive.calls.map(c => (
                            <tr key={c.id}>
                              <td>
                                <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{c.direction}</span>
                              </td>
                              <td>
                                <div style={{ fontWeight: 700 }}>{c.customerName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.customerPhone}</div>
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
                              <td style={{ fontSize: '0.8rem' }}>{c.startTime ? new Date(c.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '---'}</td>
                              <td>
                                <span className={`status-badge ${(c.status || 'ANSWERED').toLowerCase().replace(/ /g, '')}`}>{c.status || 'ANSWERED'}</span>
                              </td>
                              <td style={{ fontFamily: 'monospace' }}>{c.status === 'ANSWERED' ? formatTime(c.durationSeconds) : '---'}</td>
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
              )}

              {modalTab === 'attendance' && (
                <div>
                  <h4 style={{ marginBottom: '16px' }}>Attendance Log History</h4>
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Check In</th>
                          <th>Check Out</th>
                          <th>Duration Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedExecutive.attendanceHistory.length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>No clock logs recorded for this executive.</td>
                          </tr>
                        ) : (
                          selectedExecutive.attendanceHistory.map(att => (
                            <tr key={att.id}>
                              <td style={{ fontWeight: 600 }}>{att.date}</td>
                              <td>{att.checkIn || '---'}</td>
                              <td>{att.checkOut || '---'}</td>
                              <td style={{ fontWeight: 700 }}>{att.hours ? `${att.hours} hrs` : '---'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button 
                onClick={() => setSelectedExecutive(null)}
                className="btn btn-secondary"
                style={{ padding: '10px 24px', fontWeight: 700 }}
              >
                Close Deep View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIO PLAYER BAR (FLOATING IN THE CONTROL CONSOLE) */}
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
   2. MANAGER MY LEADS (Manage Own Leads)
   ========================================== */
export function ManagerMyLeads() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [closedLeads, setClosedLeads] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('Website');
  const [status, setStatus] = useState('New');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const [editLead, setEditLead] = useState(null);

  const fetchLeads = () => {
    const allLeads = crmService.getLeads();
    const myLeads = allLeads.filter(l => l.userId === currentUser.id);
    setLeads(myLeads.filter(l => l.status !== 'Close' && l.status !== 'Closed Won'));
    setClosedLeads(myLeads.filter(l => l.status === 'Close' || l.status === 'Closed Won'));
  };

  useEffect(() => {
    fetchLeads();
  }, [currentUser]);

  const handleRegister = async (e) => {
    e.preventDefault();
    await crmService.addLead({
      customerName: name,
      email,
      phone,
      source,
      status,
      notes,
      userId: currentUser.id,
      value: 60000,
      followUpDate
    });
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setFollowUpDate('');
    fetchLeads();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete lead permanently?')) {
      await crmService.deleteLead(id);
      fetchLeads();
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await crmService.updateLead(editLead.id, editLead);
    setEditLead(null);
    fetchLeads();
  };

  const handleCloseDeal = async (l) => {
    const remarks = window.prompt("Enter closing remarks:");
    if (remarks !== null) {
      await crmService.updateLead(l.id, {
        status: 'Closed Won',
        notes: remarks,
        closedDate: new Date().toISOString().split('T')[0]
      });
      fetchLeads();
      navigate(`/sale-close/${l.id}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>My Customer Registry</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your corporate accounts, pipeline registrations, and deals.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Register Opportunity</h3>
        <form onSubmit={handleRegister} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px', alignItems: 'end' }}>
          <div className="form-group">
            <label>Customer Name</label>
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" placeholder="+966 ..." value={phone} onChange={e => setPhone(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Lead Source</label>
            <select value={source} onChange={e => setSource(e.target.value)}>
              <option value="Website">Website</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Meta Ads">Meta Ads</option>
            </select>
          </div>
          <div className="form-group">
            <label>Pipeline Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
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
            <label>Follow-up Date</label>
            <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} required />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Notes</label>
            <input type="text" placeholder="Specific requirements..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '48px', marginBottom: '20px' }}>
            Initialize Lead
          </button>
        </form>
      </div>

      {/* Active Registry */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Active Opportunity Leads</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 700 }}>{l.customerName}</td>
                  <td>
                    <div>{l.email}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.phone}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${(l.status || 'New').toLowerCase().replace(/ /g, '')}`}>{l.status || 'New'}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleCloseDeal(l)} className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                        Close Deal
                      </button>
                      <button onClick={() => setEditLead(l)} className="btn-action">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(l.id)} className="btn-action btn-delete">
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

      {/* Edit Modal Dialog */}
      {editLead && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ padding: '32px', width: '90%', maxWidth: '500px', background: 'var(--input-bg)' }}>
            <h3 style={{ marginBottom: '24px' }}>Edit Lead Registry</h3>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Customer Name</label>
                <input type="text" value={editLead.customerName} onChange={e => setEditLead({ ...editLead, customerName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={editLead.email} onChange={e => setEditLead({ ...editLead, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone Contact</label>
                <input type="text" value={editLead.phone} onChange={e => setEditLead({ ...editLead, phone: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
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

/* ==========================================
   3. MANAGER TASKS (Assigned to Manager)
   ========================================== */
export function ManagerTasks() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Admin duties assigned to this manager (assignedTo === manager.id)
    const allTasks = crmService.getTasks();
    setTasks(allTasks.filter(t => t.assignedTo === currentUser.id));
  }, [currentUser]);

  const handleComplete = async (tid) => {
    await crmService.completeTask(tid);
    // Refresh tasks
    setTasks(crmService.getTasks().filter(t => t.assignedTo === currentUser.id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Administrative Duties</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Monitor and resolve corporate task directives delegated by executive officers.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Delegated Directives</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Directive Description</th>
                <th>Target Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No directives delegated from executive admin.</td>
                </tr>
              ) : (
                tasks.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{t.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.description}</div>
                    </td>
                    <td>{t.dueDate}</td>
                    <td>
                      <span className={`status-badge ${t.status === 'Completed' ? 'won' : 'pending'}`}>{t.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {t.status !== 'Completed' && (
                        <button onClick={() => handleComplete(t.id)} className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                          Resolve Duty
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
   4. MANAGER ASSIGN TASKS TO HR
   ========================================== */
export function ManagerAssignHR() {
  const { currentUser } = useAuth();
  const [hrs, setHrs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const fetchHRTasks = () => {
    const allUsers = crmService.getUsers();
    const hrUsers = allUsers.filter(u => u.role === 'HR');
    setHrs(hrUsers);

    const allTasks = crmService.getTasks();
    // Tasks assigned BY this manager (assignedBy === currentManager.id) to HRs
    const hrUserIds = hrUsers.map(u => u.id);
    setTasks(allTasks.filter(t => t.assignedBy === currentUser.id && hrUserIds.includes(t.assignedTo)));
  };

  useEffect(() => {
    fetchHRTasks();
  }, [currentUser]);

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
    fetchHRTasks();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Delegate HR Directives</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Assign administrative, operational, or recruitment tasks to supervising HR personnel.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Create HR Directive</h3>
        <form onSubmit={handleAssign} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px', alignItems: 'end' }}>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Directive Title</label>
            <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Responsible HR</label>
            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required>
              <option value="">Select Representative...</option>
              {hrs.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Deadline Target</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 3' }}>
            <label>Detailed Requirements</label>
            <textarea placeholder="Describe operational tasks..." rows="2" value={description} onChange={e => setDescription(e.target.value)} required></textarea>
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '48px', gridColumn: 'span 1' }}>
            <Plus size={18} /> Assign Duty
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>HR Directive Register</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Directive Description</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{t.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.description}</div>
                  </td>
                  <td>{t.dueDate}</td>
                  <td>
                    <span className={`status-badge ${t.status === 'Completed' ? 'won' : 'pending'}`}>{t.status}</span>
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
   5. MANAGER PIPELINE (Kanban Funnels)
   ========================================== */
export function ManagerPipeline() {
  const { currentUser } = useAuth();
  const [pipelineLeads, setPipelineLeads] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const users = crmService.getUsers();
    const leads = crmService.getLeads();
    const team = users.filter(u => u.managerId === currentUser.id);
    const teamIds = team.map(u => u.id);
    
    // Managers can see their team leads + their own leads
    const filtered = leads.filter(l => teamIds.includes(l.userId) || l.userId === currentUser.id);
    setPipelineLeads(filtered);
  }, [currentUser]);

  const stages = ['New', 'Contacted', 'Interested to Buy', 'Follow Up', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];
  
  const getFilteredStageLeads = (stage) => {
    return pipelineLeads.filter(l => {
      // Normalize closed status names
      const leadStatus = l.status === 'Close' ? 'Closed Won' : l.status;
      const matchesStage = leadStatus === stage;
      const matchesQuery = l.customerName.toLowerCase().includes(search.toLowerCase());
      return matchesStage && matchesQuery;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Team Sales Pipeline</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track sales stage progression, funnel health, and lead velocities.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by client identity..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '48px', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Kanban Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: '20px',
        overflowX: 'auto',
        paddingBottom: '10px'
      }}>
        {stages.map((stage, idx) => {
          const leadsInStage = getFilteredStageLeads(stage);
          return (
            <div key={idx} className="glass-panel" style={{
              padding: '16px',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              background: 'rgba(var(--primary-rgb), 0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{stage}</span>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)',
                  background: 'rgba(var(--primary-rgb), 0.1)', padding: '2px 8px', borderRadius: '12px'
                }}>
                  {leadsInStage.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '450px' }}>
                {leadsInStage.map(l => (
                  <div key={l.id} className="glass-panel" style={{
                    padding: '16px',
                    background: 'var(--card-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: 'pointer'
                  }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{l.customerName}</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Source: {l.source}</span>
                      <span style={{ fontWeight: 700 }}>₹ {l.value?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================
   6. TEAM LEADS CAPTURE VIEW
   ========================================== */
export function ManagerTeamLeads() {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const users = crmService.getUsers();
    const allLeads = crmService.getLeads();
    const team = users.filter(u => u.managerId === currentUser.id);
    const teamIds = team.map(u => u.id);
    
    // Team leads + manager leads
    const combined = allLeads.filter(l => teamIds.includes(l.userId) || l.userId === currentUser.id);
    setLeads(combined);
  }, [currentUser]);

  const filteredLeads = leads.filter(l => 
    l.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Team Customer Leads</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review registries collected across sales representatives.</p>
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Filter team lead list by client identity..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '48px', boxSizing: 'border-box' }}
        />
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Opportunities Directory</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Owner ID</th>
                <th>Source</th>
                <th>Pipeline Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 700 }}>{l.customerName}</td>
                  <td>User #{l.userId}</td>
                  <td>{l.source}</td>
                  <td>
                    <span className={`status-badge ${(l.status || 'New').toLowerCase().replace(/ /g, '')}`}>{l.status || 'New'}</span>
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
   7. MANAGE TEAM (Supervising Executives)
   ========================================== */
export function ManagerManageExecutives() {
  const { currentUser } = useAuth();
  const [executives, setExecutives] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [editUser, setEditUser] = useState(null);

  const fetchData = () => {
    const users = crmService.getUsers();
    const team = users.filter(u => u.managerId === currentUser.id);
    setExecutives(team);

    // Fetch tasks created by this manager for executives
    const allTasks = crmService.getTasks();
    setTasks(allTasks.filter(t => t.assignedBy === currentUser.id));
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this sales executive account?")) {
      await crmService.deleteUser(id);
      fetchData();
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
      fetchData();
    } catch (err) {
      alert(err.message || "Failed to update team member details");
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const positionsForRole = {
    MANAGER: ['Sales Director', 'Sales Manager', 'Regional Manager', 'Operations Manager'],
    HR: ['HR Lead', 'HR Specialist', 'HR Officer', 'Recruiter'],
    EXECUTIVE: ['Account Manager', 'Sales Representative', 'Sales Executive', 'Marketing Associate']
  };
  const editPositions = editUser ? (positionsForRole[editUser.role] || []) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Supervising Team Accounts</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review executive structures and check assignment logs.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Active Executives</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Contact</th>
                <th>Phone</th>
                <th>Position</th>
                <th>Salary</th>
                <th>Monthly Target</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {executives.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 700 }}>{e.name}</td>
                  <td>{e.email}</td>
                  <td>{e.phone}</td>
                  <td style={{ fontWeight: 600 }}>{e.position || 'Sales Executive'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {e.salary ? `₹ ${parseFloat(e.salary).toLocaleString()}` : 'N/A'}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                    {e.targetAmount ? `₹ ${parseFloat(e.targetAmount).toLocaleString()}` : '₹ 0'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditUser(e)} className="btn-action" style={{ padding: '6px', minHeight: 'unset' }} title="Edit Team Member">
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
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" onClick={() => setEditUser(null)} className="btn btn-secondary" style={{ flex: 1 }}>Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Delegated Duty List</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Duty Title</th>
                <th>Assigned To</th>
                <th>Target Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 700 }}>{t.title}</td>
                  <td>User #{t.assignedTo}</td>
                  <td>{t.dueDate}</td>
                  <td>
                    <span className={`status-badge ${t.status === 'Completed' ? 'won' : 'pending'}`}>{t.status}</span>
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
   8. TEAM CLOSED SALES
   ========================================== */
export function ManagerTeamSales() {
  const { currentUser } = useAuth();
  const [sales, setSales] = useState([]);
  const [editSale, setEditSale] = useState(null);
  const [reopenLeadId, setReopenLeadId] = useState(null);

  const fetchSales = () => {
    const users = crmService.getUsers();
    const leads = crmService.getLeads();
    const team = users.filter(u => u.managerId === currentUser.id);
    const teamIds = team.map(u => u.id);

    const closed = leads.filter(l => 
      (teamIds.includes(l.userId) || l.userId === currentUser.id) && 
      (l.status === 'Closed Won' || l.status === 'Close')
    );
    setSales(closed);
  };

  useEffect(() => {
    fetchSales();
  }, [currentUser]);

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
        <p style={{ color: 'var(--text-secondary)' }}>Review client finalized deals and sales values completed by your team.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Team Sales Directory</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Source</th>
                <th>Close Date</th>
                <th>Closed Deal Value</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No closed sales recorded for your team.</td>
                </tr>
              ) : (
                sales.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700 }}>{s.customerName}</td>
                    <td>{s.source}</td>
                    <td>{s.closedDate || s.dateAdded}</td>
                    <td style={{ fontWeight: 800, color: 'var(--success)' }}>₹ {s.value?.toLocaleString()}</td>
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
   9. EXECUTIVE PERFORMANCE METRICS
   ========================================== */
export function ManagerPerformance() {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    const users = crmService.getUsers();
    const leads = crmService.getLeads();
    const tasks = crmService.getTasks();

    const team = users.filter(u => u.managerId === currentUser.id);
    const teamStats = team.map(exec => {
      const execLeads = leads.filter(l => l.userId === exec.id);
      const wonLeads = execLeads.filter(l => l.status === 'Closed Won');
      const salesVal = wonLeads.reduce((sum, curr) => sum + (curr.value || 0), 0);

      const allTasks = tasks.filter(t => t.assignedTo === exec.id);
      const completed = allTasks.filter(t => t.status === 'Completed');

      return {
        name: exec.name,
        leadsCount: execLeads.length,
        salesVal,
        tasksCount: allTasks.length,
        completedTasks: completed.length
      };
    });
    setMetrics(teamStats);
  }, [currentUser]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Performance Metrics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Analyze sales revenue conversions and staff directive completion velocities.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Acquisition Analytics</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Executive Name</th>
                <th>Leads Handled</th>
                <th>Won Deal Revenue</th>
                <th>Administrative Duties Completed</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700 }}>{m.name}</td>
                  <td>{m.leadsCount} Opportunities</td>
                  <td style={{ fontWeight: 800, color: 'var(--success)' }}>₹ {m.salesVal.toLocaleString()}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {m.completedTasks} / {m.tasksCount} Resolved
                    </span>
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
   10. TEAM LEAVES MANAGEMENT
   ========================================== */
export function ManagerTeamLeaves() {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState([]);

  const fetchLeaves = () => {
    const users = crmService.getUsers();
    const teamIds = users.filter(u => u.managerId === currentUser.id).map(u => u.id);
    
    const allLeaves = crmService.getLeaves();
    setLeaves(allLeaves.filter(l => teamIds.includes(l.requesterId)));
  };

  useEffect(() => {
    fetchLeaves();
  }, [currentUser]);

  const handleAction = async (lid, status) => {
    await crmService.updateLeaveStatus(lid, status);
    fetchLeaves();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Team Leave Authorization</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review and authorize schedule absences requested by reporting staff.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Leave Requests</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Timeframe Range</th>
                <th>Absence Details</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Authorization Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No leave requests found for this team.</td>
                </tr>
              ) : (
                leaves.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 700 }}>{l.requesterName}</td>
                    <td>{l.startDate} to {l.endDate}</td>
                    <td>{l.reason}</td>
                    <td>
                      <span className={`status-badge ${(l.status || 'Pending').toLowerCase()}`}>{l.status || 'Pending'}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {l.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleAction(l.id, 'Approved')} className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                            Approve
                          </button>
                          <button onClick={() => handleAction(l.id, 'Rejected')} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Resolved</span>
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
   11. MANAGER APPLY LEAVE
   ========================================== */
export function ManagerApplyLeave() {
  const { currentUser } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState(false);
  const [myLeaves, setMyLeaves] = useState([]);

  const fetchMyLeaves = () => {
    const all = crmService.getLeaves();
    setMyLeaves(all.filter(l => l.requesterId === currentUser.id));
  };

  useEffect(() => {
    fetchMyLeaves();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
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
    fetchMyLeaves();
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Apply My Leave</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Submit vacation or sick leave applications to corporate administration.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '32px', alignItems: 'start' }}>
        
        {/* Application Form */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ marginBottom: '20px' }}>Absence Application</h3>
          {success && (
            <div style={{ background: 'rgba(var(--success-rgb), 0.1)', color: 'var(--success)', border: '1px solid rgba(var(--success-rgb), 0.2)', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '20px' }}>
              Absence request successfully filed.
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
              <textarea rows="3" placeholder="Describe absence reason..." value={reason} onChange={e => setReason(e.target.value)} required></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Absence Request</button>
          </form>
        </div>

        {/* History Panel */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ marginBottom: '20px' }}>Absence Registry History</h3>
          <div className="data-table-wrapper" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map(l => (
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
   12. MANAGER PROFILE SETTINGS
   ========================================== */
export function ManagerProfile() {
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
      setDepartment(currentUser.department || 'Sales Management');
      setPassword(currentUser.password);
    }
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(false);
    updateProfile({ name, email, phone, department, password });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '600px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Account Profile Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Modify your corporate security and registry profiles.</p>
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
