import { createContext, useContext, useState, useEffect } from 'react';
import { crmService } from '../services/crmService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('crm_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('crm_theme') || 'dark';
  });

  // Apply theme to HTML
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('crm_theme', theme);
  }, [theme]);

  const [dbInitialized, setDbInitialized] = useState(false);

  // Init CRM database
  useEffect(() => {
    crmService.init().then(() => {
      setDbInitialized(true);
      // Synchronize current user session info with latest database mapping
      const saved = localStorage.getItem('crm_current_user');
      if (saved) {
        const users = crmService.getUsers();
        const parsed = JSON.parse(saved);
        const fresh = users.find(u => u.id === parsed.id);
        if (fresh) {
          setCurrentUser(fresh);
          localStorage.setItem('crm_current_user', JSON.stringify(fresh));
        }
      }
    });
  }, []);

  const login = async (email, password) => {
    const user = await crmService.login(email, password);
    setCurrentUser(user);
    localStorage.setItem('crm_current_user', JSON.stringify(user));
    return user;
  };

  const logout = async () => {
    await crmService.logout(currentUser);
    setCurrentUser(null);
    localStorage.removeItem('crm_current_user');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const updateProfile = async (updatedFields) => {
    if (!currentUser) return;
    const updated = await crmService.updateUserProfile(currentUser.id, updatedFields);
    if (updated) {
      setCurrentUser(updated);
      localStorage.setItem('crm_current_user', JSON.stringify(updated));
    }
    return updated;
  };

  if (!dbInitialized) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: '#0B0F19',
        color: '#F3F4F6',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderTop: '4px solid #3B82F6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Synchronizing database cache...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, theme, toggleTheme, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
