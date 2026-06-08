import { useState } from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, UserCheck, ShieldAlert, FileOutput, 
  FileSpreadsheet, ClipboardList, TrendingUp, CalendarDays, 
  DollarSign, User, LogOut, Sun, Moon, Menu, ChevronLeft, 
  ChevronRight, RefreshCw, Send, CheckSquare, Clock, PhoneCall
} from 'lucide-react';

export default function DashboardLayout() {
  const { currentUser, logout, theme, toggleTheme } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Route protection
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Define Nav links by Role
  const roleNavLinks = {
    ADMIN: [
      { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
      { path: '/admin/ivr', label: 'IVR & Recordings', icon: PhoneCall },
      { path: '/admin/manage-managers', label: 'Manage Managers', icon: Users },
      { path: '/admin/manage-hr', label: 'Manage HR', icon: UserCheck },
      { path: '/admin/manage-executives', label: 'Manage Executives', icon: Users },
      { path: '/admin/manager-leads', label: 'Manager Leads', icon: FileSpreadsheet },
      { path: '/admin/all-leads', label: 'All Leads', icon: ClipboardList },
      { path: '/admin/leads/report', label: 'Leads Export', icon: FileOutput },
      { path: '/admin/tasks/assign', label: 'Assign Tasks', icon: ClipboardList },
      { path: '/admin/performance/managers', label: 'Manager Analytics', icon: TrendingUp },
      { path: '/admin/attendance/list', label: 'Attendance Logs', icon: Clock },
      { path: '/admin/sales', label: 'Closed Sales', icon: CheckSquare },
      { path: '/admin/finance/terminal', label: 'Finance Center', icon: DollarSign },
      { path: '/admin/profile', label: 'Profile', icon: User }
    ],
    MANAGER: [
      { path: '/manager/dashboard', label: 'Overview', icon: LayoutDashboard },
      { path: '/manager/ivr', label: 'IVR & Recordings', icon: PhoneCall },
      { path: '/manager/my-leads', label: 'My Leads', icon: FileSpreadsheet },
      { path: '/manager/tasks', label: 'Tasks', icon: CheckSquare },
      { path: '/manager/assign-hr-task', label: 'Assign HR Tasks', icon: ClipboardList },
      { path: '/manager/pipeline', label: 'Pipeline', icon: TrendingUp },
      { path: '/manager/lead-capture', label: 'Team Leads', icon: Users },
      { path: '/manager/executives', label: 'Manage Team', icon: Users },
      { path: '/manager/closed-sales', label: 'Team Sales', icon: CheckSquare },
      { path: '/manager/performance', label: 'Performance', icon: TrendingUp },
      { path: '/manager/leave/requests', label: 'Team Leaves', icon: CalendarDays },
      { path: '/manager/leave/apply', label: 'Apply My Leave', icon: CalendarDays },
      { path: '/manager/profile', label: 'Profile Settings', icon: User }
    ],
    HR: [
      { path: '/hr/dashboard', label: 'Overview', icon: LayoutDashboard },
      { path: '/hr/add-executive', label: 'Add Executive', icon: Users },
      { path: '/hr/leave/apply', label: 'Apply Leave', icon: CalendarDays },
      { path: '/hr/attendance/all', label: 'Attendance History', icon: Clock },
      { path: '/hr/attendance', label: 'Attendance Clock', icon: Clock },
      { path: '/hr/tasks', label: 'Tasks', icon: CheckSquare },
      { path: '/hr/profile', label: 'Profile Settings', icon: User }
    ],
    EXECUTIVE: [
      { path: '/executive/dashboard', label: 'Overview', icon: LayoutDashboard },
      { path: '/executive/ivr', label: 'IVR & Recordings', icon: PhoneCall },
      { path: '/executive/all-leads', label: 'All Leads', icon: ClipboardList },
      { path: '/executive/closed-sales', label: 'Closed Sales', icon: CheckSquare },
      { path: '/executive/follow-ups', label: 'Follow-ups', icon: ClipboardList },
      { path: '/executive/lead-capture', label: 'Lead Capture', icon: FileSpreadsheet },
      { path: '/executive/leave/apply', label: 'Apply Leave', icon: CalendarDays },
      { path: '/executive/tasks', label: 'Tasks', icon: CheckSquare },
      { path: '/executive/profile', label: 'Profile Settings', icon: User }
    ]
  };

  const navLinks = roleNavLinks[currentUser.role] || [];

  // Double check user starts on the correct path if they type the root
  const currentPath = location.pathname;
  const isCorrectPrefix = currentPath.startsWith(`/${currentUser.role.toLowerCase()}`);
  
  if (currentPath === '/' || !isCorrectPrefix) {
    return <Navigate to={`/${currentUser.role.toLowerCase()}/dashboard`} replace />;
  }

  return (
    <div className="dashboard-container">
      
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        
        {/* LOGO AREA */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          marginBottom: '32px',
          padding: '0 8px'
        }}>
          {!collapsed && (
            <span style={{
              fontWeight: 800,
              fontSize: '1.25rem',
              color: 'var(--primary)',
              letterSpacing: '-0.5px'
            }}>
              TEAMCORE <span style={{ fontSize: '0.65rem', background: 'rgba(var(--primary-rgb), 0.1)', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px', verticalAlign: 'middle' }}>{currentUser.role}</span>
            </span>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'rgba(var(--primary-rgb), 0.08)',
              border: 'none',
              color: 'var(--primary)',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* NAV GROUP */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          flexGrow: 1,
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent',
                  fontWeight: isActive ? '700' : '600',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 4px 12px rgba(var(--primary-rgb), 0.05)' : 'none',
                  transition: 'all 0.2s ease',
                  justifyContent: collapsed ? 'center' : 'flex-start'
                })}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{link.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* USER PROFILE INFO */}
        {!collapsed && (
          <div style={{
            background: 'rgba(var(--primary-rgb), 0.04)',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{currentUser.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{currentUser.email}</div>
          </div>
        )}

        {/* LOGOUT */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              color: 'var(--danger)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.9rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(var(--danger-rgb), 0.08)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Logout System</span>}
          </button>
        </div>

      </aside>

      {/* VIEWPORT HEADER & CONTENT */}
      <div className={`content-wrapper ${collapsed ? 'collapsed' : ''}`}>
        
        {/* HEADER */}
        <header className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              className="menu-toggle-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu size={18} />
            </button>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CRM Terminal
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              style={{
                background: 'rgba(var(--primary-rgb), 0.08)',
                border: 'none',
                color: 'var(--primary)',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Profile Avatar Widget */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}>
                {currentUser.name.charAt(0)}
              </div>
              <div className="header-user-text">
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{currentUser.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* CONTAINER CONTENT */}
        <main className="main-content">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  );
}
