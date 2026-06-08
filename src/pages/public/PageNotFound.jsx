import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      backgroundImage: 'var(--bg-gradient)',
      padding: '24px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        padding: '48px',
        width: '100%',
        maxWidth: '460px',
        textAlign: 'center',
        borderTop: '5px solid var(--danger)'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          background: 'rgba(var(--danger-rgb), 0.1)',
          color: 'var(--danger)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <ShieldAlert size={40} />
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>404 - Page Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '32px', marginTop: '8px' }}>
          The requested page could not be located on the platform.
        </p>

        <Link to="/" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontWeight: 700 }}>
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
