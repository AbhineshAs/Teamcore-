import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { crmService } from '../../services/crmService';
import { 
  Phone, PhoneCall, PhoneOff, Play, Pause, Volume2, VolumeX, 
  Search, FileText, CheckCircle2, AlertTriangle, TrendingUp, 
  Clock, ArrowDownLeft, ArrowUpRight, Plus, X, Users, RefreshCw
} from 'lucide-react';

export default function IvrCenter() {
  const { currentUser } = useAuth();
  const [calls, setCalls] = useState([]);
  const [leads, setLeads] = useState([]);
  const [filterDirection, setFilterDirection] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSim, setFilterSim] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Audio Player State
  const [activeCall, setActiveCall] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // Call Simulator State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState('setup'); // 'setup', 'calling', 'notes'
  const [simCustomer, setSimCustomer] = useState('');
  const [simPhone, setSimPhone] = useState('');
  const [simDirection, setSimDirection] = useState('OUTBOUND');
  const [simStatus, setSimStatus] = useState('ANSWERED');
  const [simDuration, setSimDuration] = useState(60); // seconds
  const [simTranscript, setSimTranscript] = useState('');
  const [simTimer, setSimTimer] = useState(0);
  const [simUsed, setSimUsed] = useState('Mobile Imported SIM');
  const timerIntervalRef = useRef(null);

  // Fetch Calls & Leads
  const loadData = () => {
    setCalls(crmService.getCallLogs());
    setLeads(crmService.getLeads());
  };

  useEffect(() => {
    loadData();
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Sync Audio Metadata
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

  // Format Time
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  // Simulator Handlers
  const handleLeadSelect = (e) => {
    const leadId = e.target.value;
    if (leadId) {
      const selected = leads.find(l => l.id === parseInt(leadId));
      if (selected) {
        setSimCustomer(selected.customerName);
        setSimPhone(selected.phone || selected.phoneNumber || '+966 50 000 0000');
      }
    } else {
      setSimCustomer('');
      setSimPhone('');
    }
  };

  const startSimulation = () => {
    if (!simCustomer || !simPhone) {
      alert("Please enter customer name and phone details.");
      return;
    }
    setSimStep('calling');
    setSimTimer(0);
    timerIntervalRef.current = setInterval(() => {
      setSimTimer(prev => prev + 1);
    }, 1000);
  };

  const endCallSimulation = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setSimDuration(simTimer);
    
    // Auto-populate transcript templates if none entered
    if (simStatus === 'ANSWERED') {
      setSimTranscript(`Outbound call to ${simCustomer}. Discussed proposal details for ${simTimer} seconds. Customer was receptive.`);
    } else {
      setSimTranscript(`Inbound call from ${simCustomer} was missed.`);
    }
    setSimStep('notes');
  };

  const saveSimulation = async () => {
    const mockRecordings = [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    ];
    
    const randomRec = simStatus === 'ANSWERED' ? mockRecordings[Math.floor(Math.random() * mockRecordings.length)] : '';
    
    await crmService.addCallLog({
      customerName: simCustomer,
      customerPhone: simPhone,
      direction: simDirection,
      status: simStatus,
      durationSeconds: simStatus === 'ANSWERED' ? simDuration : 0,
      recordingUrl: randomRec,
      transcription: simTranscript || 'No call summary provided.',
      agentId: currentUser.id,
      simUsed: simUsed
    });

    // Reset simulator
    setIsSimulating(false);
    setSimStep('setup');
    setSimCustomer('');
    setSimPhone('');
    setSimTimer(0);
    setSimTranscript('');
    setSimUsed('Mobile Imported SIM');
    
    // Reload state
    loadData();
  };

  // Metrics Calculations
  const totalCalls = calls.length;
  const totalDurationSeconds = calls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
  const totalTalkHours = (totalDurationSeconds / 3600).toFixed(1);
  const answeredCalls = calls.filter(c => c.status === 'ANSWERED').length;
  const missedCalls = calls.filter(c => c.status === 'MISSED' || c.status === 'BUSY').length;
  const avgDuration = totalCalls > 0 ? formatTime(totalDurationSeconds / totalCalls) : '0:00';

  // Filter Call Logs
  const filteredCalls = calls.filter(c => {
    // Privacy filter: Executive can only see their own calls
    if (currentUser && currentUser.role === 'EXECUTIVE') {
      const isOwnCall = c.agentId === currentUser.id || 
                        (c.agentName && c.agentName.toLowerCase() === currentUser.name.toLowerCase());
      if (!isOwnCall) return false;
    }

    const matchesDirection = filterDirection === 'ALL' || c.direction === filterDirection;
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSim = filterSim === 'ALL' || c.simUsed === filterSim;
    const matchesSearch = c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.customerPhone.includes(searchQuery) ||
                          (c.agentName && c.agentName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDirection && matchesStatus && matchesSim && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>IVR Communications & Recordings</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0' }}>Track all phone contacts, talk durations, and call transcription audio archives.</p>
        </div>
        <button 
          onClick={() => setIsSimulating(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', fontWeight: 700 }}
        >
          <PhoneCall size={18} /> Simulate Phone Call
        </button>
      </div>

      {/* METRICS SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '24px' }}>
        
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
            <Phone size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Logs</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalCalls}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Talk Hours</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalTalkHours} hrs</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Answered / Missed</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>{answeredCalls} Ans / {missedCalls} Miss</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Avg Call Time</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{avgDuration}</div>
          </div>
        </div>

      </div>

      {/* SIMULATOR MODAL OVERLAY */}
      {isSimulating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel animate-scale-up" style={{
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            position: 'relative',
            borderTop: '5px solid var(--primary)'
          }}>
            <button 
              onClick={() => {
                setIsSimulating(false);
                setSimStep('setup');
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
              }}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            {simStep === 'setup' && (
              <div>
                <h3 style={{ marginBottom: '8px', fontSize: '1.3rem' }}>Simulate IVR Call</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>Simulate inbound/outbound customer telephone contacts to generate database records.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label>Select Associated Client/Lead</label>
                    <select onChange={handleLeadSelect}>
                      <option value="">-- Manual Entry --</option>
                      {leads.map(l => (
                        <option key={l.id} value={l.id}>{l.customerName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Customer Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Saudi Aramco" 
                      value={simCustomer} 
                      onChange={e => setSimCustomer(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Customer Phone Number</label>
                    <input 
                      type="text" 
                      placeholder="+966 50 123 4567" 
                      value={simPhone} 
                      onChange={e => setSimPhone(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Calling SIM / Line Used</label>
                    <select value={simUsed} onChange={e => setSimUsed(e.target.value)}>
                      <option value="Mobile Imported SIM">Mobile Imported SIM</option>
                      <option value="Corporate VoIP">Corporate VoIP Trunk</option>
                    </select>
                  </div>

                  <div className="grid-2-responsive">
                    <div className="form-group">
                      <label>Call Direction</label>
                      <select value={simDirection} onChange={e => setSimDirection(e.target.value)}>
                        <option value="OUTBOUND">Outbound Call</option>
                        <option value="INBOUND">Inbound Call</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Connect Status</label>
                      <select value={simStatus} onChange={e => setSimStatus(e.target.value)}>
                        <option value="ANSWERED">Answered</option>
                        <option value="MISSED">Missed</option>
                        <option value="BUSY">Busy</option>
                        <option value="VOICEMAIL">Voicemail</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={startSimulation}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px', marginTop: '12px', fontWeight: 700 }}
                  >
                    Initiate Call Simulation
                  </button>
                </div>
              </div>
            )}

            {simStep === 'calling' && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div className="pulse-circle" style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  animation: 'pulse 1.5s infinite'
                }}>
                  <Phone size={40} />
                </div>
                <h3 style={{ margin: '0 0 8px' }}>{simCustomer}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 24px', fontFamily: 'monospace', fontSize: '1rem' }}>{simPhone}</p>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '32px', color: '#10B981' }}>
                  {formatTime(simTimer)}
                </div>
                <button 
                  onClick={endCallSimulation}
                  className="btn btn-danger"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', padding: '12px 32px', fontWeight: 700 }}
                >
                  <PhoneOff size={18} /> Hang Up Call
                </button>
              </div>
            )}

            {simStep === 'notes' && (
              <div>
                <h3 style={{ marginBottom: '8px' }}>Call Details & Summary</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>Enter transcription remarks or call highlights before committing to database.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="grid-2-responsive" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Call Duration</span>
                      <strong style={{ fontSize: '1rem' }}>{simDuration} seconds</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Status</span>
                      <strong style={{ fontSize: '1rem', color: '#10B981' }}>{simStatus}</strong>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Inquiry Remarks / Transcript Note</label>
                    <textarea 
                      rows="4" 
                      value={simTranscript} 
                      onChange={e => setSimTranscript(e.target.value)}
                      placeholder="Write notes here..."
                      required
                    ></textarea>
                  </div>

                  <button 
                    onClick={saveSimulation}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px', fontWeight: 700 }}
                  >
                    Commit & Save Call Log
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FILTER & REGISTRY GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '32px' }}>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          
          {/* SEARCH & FILTERS BAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div className="search-box" style={{ width: '100%', maxWidth: '300px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search contact, agent, phone..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '40px', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Direction</span>
                <select value={filterDirection} onChange={e => setFilterDirection(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <option value="ALL">All Directions</option>
                  <option value="INBOUND">Inbound</option>
                  <option value="OUTBOUND">Outbound</option>
                </select>
              </div>

              <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status</span>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <option value="ALL">All Statuses</option>
                  <option value="ANSWERED">Answered</option>
                  <option value="MISSED">Missed</option>
                  <option value="BUSY">Busy</option>
                  <option value="VOICEMAIL">Voicemail</option>
                </select>
              </div>

              <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>SIM / Line</span>
                <select value={filterSim} onChange={e => setFilterSim(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <option value="ALL">All SIMs/Lines</option>
                  <option value="Mobile Imported SIM">Mobile Imported SIM</option>
                  <option value="Corporate VoIP">Corporate VoIP</option>
                </select>
              </div>
              
              <button 
                onClick={loadData}
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border)', width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Refresh Logs"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* TABLE LOGS */}
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Direction</th>
                  <th>Customer Entity</th>
                  <th>SIM / Line</th>
                  <th>Agent Owner</th>
                  <th>Timing</th>
                  <th>Status</th>
                  <th>Call Duration</th>
                  <th>Playback Recording</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalls.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No IVR call logs matched your filter parameters.</td>
                  </tr>
                ) : (
                  filteredCalls.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {c.direction === 'INBOUND' ? (
                            <span style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '6px', borderRadius: '8px', display: 'flex' }} title="Inbound">
                              <ArrowDownLeft size={16} />
                            </span>
                          ) : (
                            <span style={{ color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)', padding: '6px', borderRadius: '8px', display: 'flex' }} title="Outbound">
                              <ArrowUpRight size={16} />
                            </span>
                          )}
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>{c.direction}</span>
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
                      <td>
                        <span style={{ fontWeight: 600 }}>{c.agentName || 'System'}</span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {c.startTime ? new Date(c.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '---'}
                      </td>
                      <td>
                        <span className={`status-badge ${(c.status || 'ANSWERED').toLowerCase().replace(/ /g, '')}`}>
                          {c.status || 'ANSWERED'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {c.status === 'ANSWERED' ? formatTime(c.durationSeconds) : '---'}
                      </td>
                      <td>
                        {c.recordingUrl ? (
                          <button 
                            onClick={() => selectCallToPlay(c)}
                            className="btn"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              background: activeCall?.id === c.id && isPlaying ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                              color: activeCall?.id === c.id && isPlaying ? '#EF4444' : '#3B82F6',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              margin: '0 auto'
                            }}
                          >
                            {activeCall?.id === c.id && isPlaying ? <Pause size={14} /> : <Play size={14} />}
                            {activeCall?.id === c.id && isPlaying ? 'Playing' : 'Listen'}
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No recording</span>
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

      {/* AUDIO PLAYER BAR */}
      {activeCall && (
        <div className="glass-panel animate-slide-up" style={{
          position: 'sticky',
          bottom: '16px',
          zIndex: 99,
          padding: '20px 32px',
          borderTop: '2px solid var(--primary)',
          background: 'rgba(11, 15, 25, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          
          <audio 
            ref={audioRef}
            src={activeCall.recordingUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleAudioEnded}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={togglePlay}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
              </button>
              
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Call Recording #{activeCall.id}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {activeCall.customerName} &bull; Handled by {activeCall.agentName}
                </div>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexGrow: 1, maxWidth: '500px' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{formatTime(currentTime)}</span>
              <input 
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                style={{
                  flexGrow: 1,
                  height: '6px',
                  borderRadius: '3px',
                  background: 'rgba(255,255,255,0.1)',
                  outline: 'none',
                  cursor: 'pointer',
                  accentColor: 'var(--primary)'
                }}
              />
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{formatTime(duration)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Mute Toggle */}
              <button 
                onClick={toggleMute}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              <button 
                onClick={() => {
                  setActiveCall(null);
                  setIsPlaying(false);
                }}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
              >
                Close Player
              </button>
            </div>

          </div>

          {/* TRANSCRIPTION VIEW */}
          <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <FileText size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Call Transcript</span>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic', fontWeight: 500 }}>
                "{activeCall.transcription || 'No call transcript notes available.'}"
              </p>
            </div>
          </div>

        </div>
      )}

      {/* CSS Pulse Animation styles for Simulator */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .pulse-circle {
          animation: pulse 2s infinite;
        }
      `}</style>

    </div>
  );
}
