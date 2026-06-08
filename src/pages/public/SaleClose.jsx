import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { crmService } from '../../services/crmService';
import { CheckCircle2, ChevronLeft } from 'lucide-react';

export default function SaleClose() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);

  useEffect(() => {
    const leads = crmService.getLeads();
    const found = leads.find(l => l.id === parseInt(id));
    setLead(found);
  }, [id]);

  if (!lead) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Lead Not Found</h2>
          <p>The requested opportunity could not be resolved or retrieved.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Return to Terminal</Link>
        </div>
      </div>
    );
  }

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
        borderTop: '5px solid var(--success)'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          background: 'rgba(var(--success-rgb), 0.1)',
          color: 'var(--success)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <CheckCircle2 size={40} />
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Sale Closed</h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '32px' }}>Deal successfully recorded</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Customer</span>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{lead.customerName}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Final Amount</span>
            <span style={{ fontWeight: 800, color: 'var(--success)' }}>₹ {(lead.value || 0).toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Source</span>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{lead.source}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Closing Date</span>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{lead.closedDate || lead.dateAdded}</span>
          </div>
        </div>

        <div style={{ textAlign: 'left', background: 'rgba(var(--primary-rgb), 0.04)', padding: '16px', borderRadius: '12px', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Closing Remarks:</span>
          <p style={{ fontStyle: 'italic', fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>
            {lead.notes || 'No closing remarks recorded.'}
          </p>
        </div>

        <Link to="/" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontWeight: 700 }}>
          <ChevronLeft size={16} /> Return to Terminal
        </Link>
      </div>
    </div>
  );
}
