import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { crmService } from '../../services/crmService';
import { useAuth } from '../../context/AuthContext';
import {
  Users, CheckSquare, Clock, Calendar, ChevronRight, DollarSign,
  TrendingUp, Plus, Trash2, Edit2, Search, CheckCircle2,
  AlertTriangle, FileOutput, HelpCircle, RotateCcw
} from 'lucide-react';

/* ==========================================
   1. EXECUTIVE DASHBOARD
   ========================================== */
export function ExecutiveDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ activeLeads: 0, overdueFollowups: 0, pendingTasks: 0, wonSalesTotal: 0 });
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const allLeads = crmService.getLeads();
    const allTasks = crmService.getTasks();

    const myLeads = allLeads.filter(l => l.userId === currentUser.id);
    const myTasks = allTasks.filter(t => t.assignedTo === currentUser.id && t.status === 'Pending');

    const today = new Date().toISOString().split('T')[0];
    const overdueLeads = myLeads.filter(l => l.followUpDate && l.followUpDate < today && l.status !== 'Closed Won');

    const wonSalesTotal = myLeads
      .filter(l => l.status === 'Closed Won' || l.status === 'Close')
      .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);

    setStats({
      activeLeads: myLeads.filter(l => l.status !== 'Closed Won' && l.status !== 'Closed Lost').length,
      overdueFollowups: overdueLeads.length,
      pendingTasks: myTasks.length,
      wonSalesTotal: wonSalesTotal
    });

    setLeads(myLeads.slice(0, 5));
    setTasks(myTasks.slice(0, 5));
  }, [currentUser]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Executive Command Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome to your command dashboard. Monitor follow-ups and complete duties.</p>
      </div>

      <div className="kpi-grid">
        <div className="glass-panel kpi-card primary">
          <span className="kpi-title">Active Leads</span>
          <span className="kpi-value">{stats.activeLeads} Accounts</span>
          <span className="kpi-meta">Opportunities in pipeline</span>
        </div>
        <div className="glass-panel kpi-card danger">
          <span className="kpi-title">Overdue Follow-ups</span>
          <span className="kpi-value">{stats.overdueFollowups} Alerts</span>
          <span className="kpi-meta">Schedules missed</span>
        </div>
        <div className="glass-panel kpi-card success">
          <span className="kpi-title">Pending Tasks</span>
          <span className="kpi-value">{stats.pendingTasks} Duties</span>
          <span className="kpi-meta">Assigned by supervisor</span>
        </div>
        <div className="glass-panel kpi-card warning" style={{ borderLeftColor: 'var(--secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="kpi-title">Personal Target</span>
          <span className="kpi-value" style={{ fontSize: '1.6rem' }}>₹ {stats.wonSalesTotal.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ ₹ {(currentUser.targetAmount || 0).toLocaleString()}</span></span>
          {currentUser.targetAmount > 0 ? (
            <div style={{ marginTop: '4px' }}>
              <div style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '4px'
              }}>
                <div style={{
                  width: `${Math.min(100, Math.round((stats.wonSalesTotal / currentUser.targetAmount) * 100))}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--secondary) 0%, var(--primary) 100%)',
                  borderRadius: '3px',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
              <span className="kpi-meta">{Math.round((stats.wonSalesTotal / currentUser.targetAmount) * 100)}% of quota achieved</span>
            </div>
          ) : (
            <span className="kpi-meta">No active target set</span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '32px' }}>

        {/* Registry Quick View */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Recent Opportunities</h3>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 700 }}>{l.customerName}</td>
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

        {/* Task Quick List */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Active Directives</h3>
          {tasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pending tasks assigned.</p>
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
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Due Date: {t.dueDate}</div>
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
   2. CLOSED SALES ARCHIVE
   ========================================== */
export function ExecutiveClosedSales() {
  const { currentUser } = useAuth();
  const [sales, setSales] = useState([]);
  const [editSale, setEditSale] = useState(null);
  const [reopenLeadId, setReopenLeadId] = useState(null);

  const fetchSales = () => {
    const leads = crmService.getLeads();
    setSales(leads.filter(l => l.userId === currentUser.id && (l.status === 'Closed Won' || l.status === 'Close')));
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
        <p style={{ color: 'var(--text-secondary)' }}>Review all won sales and closure details.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>My Sales Archive</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Entity</th>
                <th>Closure Date</th>
                <th>Lead Source</th>
                <th>Final Deal Value</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No closed sales recorded.</td>
                </tr>
              ) : (
                sales.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700 }}>{s.customerName}</td>
                    <td>{s.closedDate || s.dateAdded}</td>
                    <td>{s.source}</td>
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
              Are you sure you want to reopen this closed sale? It will be placed back into your active pipeline as 'Negotiation'.
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
   3. EXECUTIVE FOLLOW-UPS (Calendar Pipeline List)
   ========================================== */
export function ExecutiveFollowups() {
  const { currentUser } = useAuth();
  const [followups, setFollowups] = useState([]);

  useEffect(() => {
    const leads = crmService.getLeads();
    // Leads assigned to current user, having followUpDate, not closed
    const active = leads.filter(l => l.userId === currentUser.id && l.followUpDate && l.status !== 'Closed Won' && l.status !== 'Closed Lost');
    setFollowups(active.sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate)));
  }, [currentUser]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Follow-up Schedule</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage pipeline calendar schedules and communication due dates.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Schedule registry</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Source</th>
                <th>Follow-up Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {followups.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No follow-up schedules registered.</td>
                </tr>
              ) : (
                followups.map(f => {
                  const today = new Date().toISOString().split('T')[0];
                  const isOverdue = f.followUpDate < today;
                  return (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 700 }}>{f.customerName}</td>
                      <td>{f.source}</td>
                      <td style={{ color: isOverdue ? 'var(--danger)' : 'var(--primary)', fontWeight: 700 }}>
                        {f.followUpDate} {isOverdue && ' (Overdue)'}
                      </td>
                      <td>
                        <span className={`status-badge ${(f.status || 'New').toLowerCase().replace(/ /g, '')}`}>{f.status || 'New'}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   4. EXECUTIVE LEAD CAPTURE (Main Terminal)
   ========================================== */
export function ExecutiveLeadCapture() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [fetchError, setFetchError] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('Website');
  const [status, setStatus] = useState('New');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [college, setCollege] = useState('');
  const [passoutYear, setPassoutYear] = useState('');
  const [department, setDepartment] = useState('');
  const [captureMode, setCaptureMode] = useState('single');
  const [bulkText, setBulkText] = useState('');

  // Modals state
  const [editLead, setEditLead] = useState(null);
  const [closeLead, setCloseLead] = useState(null);
  const [closeAmount, setCloseAmount] = useState('');
  const [closeRemarks, setCloseRemarks] = useState('');

  const fetchLeads = () => {
    try {
      const all = crmService.getLeads();
      const myLeads = all.filter(l => l.userId === currentUser.id);
      setLeads(myLeads);

      const today = new Date().toISOString().split('T')[0];
      const active = myLeads.filter(l => l.status !== 'Closed Won' && l.status !== 'Closed Lost' && l.status !== 'Close');
      const overdue = active.filter(l => l.followUpDate && l.followUpDate < today);

      setActiveCount(active.length);
      setOverdueCount(overdue.length);
    } catch (err) {
      console.error("fetchLeads error:", err);
      setFetchError(err);
    }
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
      followUpDate,
      college,
      passoutYear: passoutYear ? parseInt(passoutYear) : null,
      department
    });
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setFollowUpDate('');
    setCollege('');
    setPassoutYear('');
    setDepartment('');
    fetchLeads();
  };

  const handleBulkRegister = async (e) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n');
    let addedCount = 0;

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const parts = trimmed.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        const customerName = parts[0];
        const email = parts[1];
        const phone = parts[2];
        const college = parts[3] || 'N/A';
        const passoutYear = parts[4] ? parseInt(parts[4]) : new Date().getFullYear();
        const department = parts[5] || 'N/A';
        const source = parts[6] || 'Website';
        const followUpDate = parts[7] || new Date().toISOString().split('T')[0];
        const notes = parts[8] || 'Bulk imported';

        await crmService.addLead({
          customerName,
          email,
          phone,
          college,
          passoutYear,
          department,
          source,
          status: 'New',
          userId: currentUser.id,
          value: 60000,
          followUpDate,
          notes
        });
        addedCount++;
      }
    }

    setBulkText('');
    alert(`Successfully registered ${addedCount} leads!`);
    fetchLeads();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await crmService.updateLead(editLead.id, editLead);
    setEditLead(null);
    fetchLeads();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove opportunity permanently?')) {
      await crmService.deleteLead(id);
      fetchLeads();
    }
  };

  const handlePrepClose = (l) => {
    setCloseLead(l);
    setCloseAmount('');
    setCloseRemarks('');
  };

  const handleCloseSubmit = async (e) => {
    e.preventDefault();
    await crmService.updateLead(closeLead.id, {
      status: 'Closed Won',
      value: parseFloat(closeAmount),
      notes: closeRemarks,
      closedDate: new Date().toISOString().split('T')[0]
    });
    const targetId = closeLead.id;
    setCloseLead(null);
    fetchLeads();
    navigate(`/sale-close/${targetId}`);
  };

  if (fetchError) {
    return (
      <div style={{ padding: '24px', background: 'rgba(255,0,0,0.1)', color: 'var(--danger)', borderRadius: '12px', border: '1px solid var(--danger)' }}>
        <h3>Fetch Error in ExecutiveLeadCapture:</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{fetchError.message}</pre>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', marginTop: '12px' }}>{fetchError.stack}</pre>
      </div>
    );
  }

  try {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Opportunity Capture Terminal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log inbound sales opportunities and execute client contracts.</p>
        </div>

        <div className="grid-2-responsive" style={{ gap: '20px', maxWidth: '600px' }}>
          <div className="glass-panel" style={{ padding: '16px 24px', flex: 1, borderLeft: '5px solid var(--primary)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>My Pipeline leads</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, display: 'block', marginTop: '6px' }}>{activeCount} Records</span>
          </div>
          <div className="glass-panel" style={{ padding: '16px 24px', flex: 1, borderLeft: '5px solid var(--danger)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Overdue Schedules</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, display: 'block', marginTop: '6px' }}>{overdueCount} Alerts</span>
          </div>
        </div>

        {/* Capture Form */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0 }}>Register Opportunity</h3>

            {/* Capture Mode Toggle */}
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setCaptureMode('single')}
                style={{
                  background: captureMode === 'single' ? 'var(--primary)' : 'transparent',
                  color: captureMode === 'single' ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Single Capture
              </button>
              <button
                type="button"
                onClick={() => setCaptureMode('bulk')}
                style={{
                  background: captureMode === 'bulk' ? 'var(--primary)' : 'transparent',
                  color: captureMode === 'bulk' ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Bulk Upload
              </button>
            </div>
          </div>

          {captureMode === 'single' ? (
            <form onSubmit={handleRegister} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px', alignItems: 'end' }}>
              <div className="form-group">
                <label>Customer Name</label>
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Phone Contact</label>
                <input type="text" placeholder="+966 ..." value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>College</label>
                <input type="text" placeholder="e.g. IIT Bombay" value={college} onChange={e => setCollege(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Passout Year</label>
                <input type="number" placeholder="e.g. 2026" value={passoutYear} onChange={e => setPassoutYear(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Department / Stream</label>
                <input type="text" placeholder="e.g. Computer Science" value={department} onChange={e => setDepartment(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Lead Source</label>
                <select value={source} onChange={e => setSource(e.target.value)}>
                  <option value="Website">Website</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Meta Ads">Meta Ads</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Call">Call</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
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
                <label>Requirement Notes</label>
                <input type="text" placeholder="Specific notes..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '48px', marginBottom: '20px' }}>
                Initialize Lead
              </button>
            </form>
          ) : (
            <form onSubmit={handleBulkRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Bulk Leads CSV Data</label>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Paste leads one per line in the format:<br />
                  <code>Name, Email, Phone, College, Passout Year, Department, Source, Follow-up Date (YYYY-MM-DD), Notes</code>
                </div>
                <textarea
                  rows="6"
                  placeholder="e.g.&#13;John Doe, john@example.com, +91 9988776655, IIT Delhi, 2026, CSE, Website, 2026-06-15, First contact&#13;Jane Smith, jane@example.com, +91 9988776644, KSU, 2025, ECE, WhatsApp, 2026-06-16, Follow up soon"
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '48px', fontWeight: '700' }}>
                Register Bulk Leads (₹ 60,000 Each)
              </button>
            </form>
          )}
        </div>

        {/* Registry Table */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Customer Registry</h3>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Contact details</th>
                  <th>Academic details</th>
                  <th>Source</th>
                  <th>Pipeline Status</th>
                  <th>Sale Action</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(l => {
                  const isClosed = l.status === 'Closed Won' || l.status === 'Close';
                  return (
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
                      <td>
                        {!isClosed ? (
                          <button onClick={() => handlePrepClose(l)} className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                            Close Sale
                          </button>
                        ) : (
                          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.8rem' }}>Closed</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => setEditLead(l)} className="btn-action">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(l.id)} className="btn-action btn-delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {editLead && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="glass-panel" style={{ padding: '32px', width: '90%', maxWidth: '480px', background: 'var(--input-bg)' }}>
              <h3 style={{ marginBottom: '24px' }}>Edit Opportunity Registry</h3>
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
                  <label>Phone Number</label>
                  <input type="text" value={editLead.phone} onChange={e => setEditLead({ ...editLead, phone: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>College</label>
                  <input type="text" value={editLead.college || ''} onChange={e => setEditLead({ ...editLead, college: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Passout Year</label>
                  <input type="number" value={editLead.passoutYear || ''} onChange={e => setEditLead({ ...editLead, passoutYear: e.target.value ? parseInt(e.target.value) : '' })} required />
                </div>
                <div className="form-group">
                  <label>Department / Stream</label>
                  <input type="text" value={editLead.department || ''} onChange={e => setEditLead({ ...editLead, department: e.target.value })} required />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                  <button type="button" onClick={() => setEditLead(null)} className="btn btn-secondary" style={{ flex: 1 }}>Discard</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Close Deal Modal */}
        {closeLead && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="glass-panel" style={{ padding: '32px', width: '90%', maxWidth: '480px', background: 'var(--input-bg)' }}>
              <h3 style={{ marginBottom: '24px' }}>Finalize Sale Contract</h3>
              <form onSubmit={handleCloseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>Customer Account</label>
                  <input type="text" value={closeLead.customerName} disabled />
                </div>
                <div className="form-group">
                  <label>Final Deal Value (INR)</label>
                  <input type="number" value={closeAmount} onChange={e => setCloseAmount(e.target.value)} required placeholder="Enter total contract value" />
                </div>
                <div className="form-group">
                  <label>Closing Comments / Remarks</label>
                  <textarea rows="3" value={closeRemarks} onChange={e => setCloseRemarks(e.target.value)} placeholder="Terms, contract codes, etc." required></textarea>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm & Record Sale</button>
                  <button type="button" onClick={() => setCloseLead(null)} className="btn btn-secondary" style={{ flex: 1 }}>Discard</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div style={{ padding: '24px', background: 'rgba(255,0,0,0.1)', color: 'var(--danger)', borderRadius: '12px', border: '1px solid var(--danger)' }}>
        <h3>Render Error in ExecutiveLeadCapture:</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{error.message}</pre>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', marginTop: '12px' }}>{error.stack}</pre>
      </div>
    );
  }
}

/* ==========================================
   5. EXECUTIVE APPLY LEAVE
   ========================================== */
export function ExecutiveApplyLeave() {
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
        <h1 style={{ fontSize: '2rem' }}>Apply My Leave</h1>
        <p style={{ color: 'var(--text-secondary)' }}>File vacation or sick leave applications to corporate HR.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '32px', alignItems: 'start' }}>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Apply Leave</h3>
          {success && (
            <div style={{ background: 'rgba(var(--success-rgb), 0.1)', color: 'var(--success)', border: '1px solid rgba(var(--success-rgb), 0.2)', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '20px' }}>
              Leave application submitted successfully.
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
              <textarea rows="3" placeholder="Absence details..." value={reason} onChange={e => setReason(e.target.value)} required></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Leave Request</button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
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
   6. EXECUTIVE TASKS (My Duties)
   ========================================== */
export function ExecutiveTasks() {
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
        <h1 style={{ fontSize: '2rem' }}>My Delegated Duties</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Complete tasks and log statuses delegated by supervising management.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Duty Directive List</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Directive Description</th>
                <th>Due Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No pending duties assigned.</td>
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
   7. EXECUTIVE PROFILE
   ========================================== */
export function ExecutiveProfile() {
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
      setDepartment(currentUser.department || 'Sales Execution');
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
        <p style={{ color: 'var(--text-secondary)' }}>Modify security details and phone contacts.</p>
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

/* ==========================================
   8. EXECUTIVE ALL LEADS (Active Leads List)
   ========================================== */
export function ExecutiveAllLeads() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [editLead, setEditLead] = useState(null);
  const [closeLead, setCloseLead] = useState(null);
  const [closeAmount, setCloseAmount] = useState('');
  const [closeRemarks, setCloseRemarks] = useState('');

  const fetchLeads = () => {
    try {
      const all = crmService.getLeads();
      if (!currentUser) return;
      // Loose equality to handle ID type mismatches
      const active = all.filter(l => l.userId == currentUser.id && l.status !== 'Closed Won' && l.status !== 'Close');
      setLeads(active);
    } catch (err) {
      console.error("fetchLeads in ExecutiveAllLeads error:", err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [currentUser]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    await crmService.updateLead(editLead.id, editLead);
    setEditLead(null);
    fetchLeads();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove opportunity permanently?')) {
      await crmService.deleteLead(id);
      fetchLeads();
    }
  };

  const handlePrepClose = (l) => {
    setCloseLead(l);
    setCloseAmount('');
    setCloseRemarks('');
  };

  const handleCloseSubmit = async (e) => {
    e.preventDefault();
    await crmService.updateLead(closeLead.id, {
      status: 'Closed Won',
      value: parseFloat(closeAmount),
      notes: closeRemarks,
      closedDate: new Date().toISOString().split('T')[0]
    });
    const targetId = closeLead.id;
    setCloseLead(null);
    fetchLeads();
    navigate(`/sale-close/${targetId}`);
  };

  const filteredLeads = leads.filter(l => {
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchesSearch = (l.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (l.email || '').toLowerCase().includes(search.toLowerCase()) ||
                          (l.phone && l.phone.includes(search)) ||
                          (l.college && l.college.toLowerCase().includes(search.toLowerCase())) ||
                          (l.department && l.department.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  try {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2rem' }}>All My Leads</h1>
            <p style={{ color: 'var(--text-secondary)' }}>View, search, and manage your active pipeline opportunities.</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Active Pipeline Registry</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search name, email, college..."
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
                <option value="ALL">All Active Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Interested to Buy">Interested to Buy</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Negotiation">Negotiation</option>
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
                  <th>Sale Action</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No active leads found.</td>
                  </tr>
                ) : (
                  filteredLeads.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 700 }}>{l.customerName || 'N/A'}</td>
                      <td>
                        <div>{l.email || 'N/A'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.phone || 'N/A'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{l.college || 'N/A'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {l.department || 'N/A'} {l.passoutYear ? `(${l.passoutYear})` : ''}
                        </div>
                      </td>
                      <td>{l.source || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${(l.status || 'New').toLowerCase().replace(/ /g, '')}`}>{l.status || 'New'}</span>
                      </td>
                      <td>
                        <button onClick={() => handlePrepClose(l)} className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                          Close Sale
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => setEditLead(l)} className="btn-action">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(l.id)} className="btn-action btn-delete">
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

        {/* Edit Modal */}
        {editLead && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="glass-panel" style={{ padding: '32px', width: '90%', maxWidth: '480px', background: 'var(--input-bg)' }}>
              <h3 style={{ marginBottom: '24px' }}>Edit Opportunity Registry</h3>
              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  <input type="number" value={editLead.passoutYear || ''} onChange={e => setEditLead({ ...editLead, passoutYear: e.target.value ? parseInt(e.target.value) : '' })} required />
                </div>
                <div className="form-group">
                  <label>Department / Stream</label>
                  <input type="text" value={editLead.department || ''} onChange={e => setEditLead({ ...editLead, department: e.target.value })} required />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                  <button type="button" onClick={() => setEditLead(null)} className="btn btn-secondary" style={{ flex: 1 }}>Discard</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Close Deal Modal */}
        {closeLead && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="glass-panel" style={{ padding: '32px', width: '90%', maxWidth: '480px', background: 'var(--input-bg)' }}>
              <h3 style={{ marginBottom: '24px' }}>Finalize Sale Contract</h3>
              <form onSubmit={handleCloseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>Customer Account</label>
                  <input type="text" value={closeLead.customerName || ''} disabled />
                </div>
                <div className="form-group">
                  <label>Final Deal Value (INR)</label>
                  <input type="number" value={closeAmount} onChange={e => setCloseAmount(e.target.value)} required placeholder="Enter total contract value" />
                </div>
                <div className="form-group">
                  <label>Closing Comments / Remarks</label>
                  <textarea rows="3" value={closeRemarks} onChange={e => setCloseRemarks(e.target.value)} placeholder="Terms, contract codes, etc." required></textarea>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm & Record Sale</button>
                  <button type="button" onClick={() => setCloseLead(null)} className="btn btn-secondary" style={{ flex: 1 }}>Discard</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div style={{ padding: '24px', background: 'rgba(255,0,0,0.1)', color: 'var(--danger)', borderRadius: '12px', border: '1px solid var(--danger)' }}>
        <h3>Render Error in ExecutiveAllLeads:</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{error.message}</pre>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', marginTop: '12px' }}>{error.stack}</pre>
      </div>
    );
  }
}
