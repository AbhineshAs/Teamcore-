import { useState } from 'react';
import { crmService } from '../../services/crmService';
import { Send, CheckCircle2 } from 'lucide-react';

export default function PublicLeadCapture() {
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('Website');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await crmService.addLead({
        customerName,
        email,
        phone,
        source,
        notes,
        status: 'New',
        value: 0,
        userId: 4 // Assign to John Doe by default
      });
      setSubmitted(true);
    } catch (err) {
      setError('Failed to capture lead details. Please try again.');
    }
  };

  if (submitted) {
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
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Thank You!</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
            Your details have been recorded. A representative will contact you shortly.
          </p>
          <button onClick={() => setSubmitted(false)} className="btn btn-primary" style={{ width: '100%' }}>
            Submit Another Request
          </button>
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
        padding: '40px',
        width: '100%',
        maxWidth: '500px',
        borderTop: '5px solid var(--primary)'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', fontWeight: 800, textAlign: 'center', letterSpacing: '-0.5px' }}>
          Connect with Teamcore
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '32px', textAlign: 'center', fontWeight: 500 }}>
          Submit your requirements to register your inquiry.
        </p>

        {error && (
          <div style={{ background: 'rgba(var(--danger-rgb), 0.1)', border: '1px solid rgba(var(--danger-rgb), 0.2)', color: 'var(--danger)', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. John Smith" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="text" 
              placeholder="+966 50 000 0000" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>Lead Source</label>
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="Website">Website Form</option>
              <option value="WhatsApp">WhatsApp Inquiry</option>
              <option value="Meta Ads">Social Media Ad</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label>Inquiry Details</label>
            <textarea 
              rows="3" 
              placeholder="Tell us what you are looking for..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontWeight: 700, fontSize: '1rem' }}>
            <Send size={16} /> Submit Inquiry
          </button>
        </form>
      </div>
    </div>
  );
}
