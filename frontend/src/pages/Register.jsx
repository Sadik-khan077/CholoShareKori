import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  IconSparkles, 
  IconCheck, 
  IconAlertCircle 
} from '../components/Icons';

const campusLocations = [
  "Al-Beruni Hall", 
  "Mir Mosharraf Hossain Hall", 
  "Shaheed Salahuddin Hall",
  "Maulana Bhasani Hall", 
  "Bangabandhu Sheikh Mujibur Rahman Hall", 
  "Syed Nazrul Islam Hall",
  "Shaheed Rafiq-Jabbar Hall", 
  "A. F. M. Kamaluddin Hall", 
  "Bishwabidyalay Hall",
  "Jahanara Imam Hall", 
  "Pritilata Hall", 
  "Noorjahan Hall", 
  "Sufia Kamal Hall",
  "Fatema Mernissi Hall", 
  "Bangamata Sheikh Fazilatunnesa Mujib Hall", 
  "Central Cafeteria",
  "TSC (Teacher-Student Centre)", 
  "Central Library", 
  "Science Faculty", 
  "Arts Faculty",
  "Social Science Faculty", 
  "Main Gate Area", 
  "Medical Centre", 
  "Other"
];

const Register = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', location: '', registration_no: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.success) {
        setShowSuccess(true);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please verify your details.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 160px)',
      padding: '2.5rem 1.5rem' 
    }}>
      <div className="bento-card" style={{ width: '100%', maxWidth: '560px', padding: '2.75rem 2.25rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.15rem',
            boxShadow: '0 8px 20px rgba(217, 83, 47, 0.3)'
          }}>
            <IconSparkles size={24} color="#ffffff" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Join the Campus Network
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginTop: '0.45rem' }}>
            Register with your university credentials to start sharing resources today.
          </p>
        </div>

        {errorMsg && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.65rem',
            color: 'var(--accent-rose-text)', 
            backgroundColor: 'var(--accent-rose-subtle)', 
            border: '1px solid var(--accent-rose)', 
            padding: '0.9rem 1rem', 
            borderRadius: '10px', 
            marginBottom: '1.5rem',
            fontSize: '0.88rem' 
          }}>
            <IconAlertCircle size={16} color="var(--accent-rose)" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.86rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Full Name *
              </label>
              <input 
                className="form-input"
                type="text" 
                placeholder="e.g. Tanjim Ahmed" 
                required
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.86rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                JU Registration No. *
              </label>
              <input 
                className="form-input"
                type="text" 
                placeholder="e.g. 2021123456" 
                required
                onChange={e => setFormData({ ...formData, registration_no: e.target.value })} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.86rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Campus Email Address *
              </label>
              <input 
                className="form-input" 
                type="email" 
                placeholder="student@juniv.edu" 
                required
                onChange={e => setFormData({ ...formData, email: e.target.value })} 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.86rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Phone Number (WhatsApp) *
              </label>
              <input 
                className="form-input" 
                type="tel" 
                placeholder="017XXXXXXXX" 
                required
                onChange={e => setFormData({ ...formData, phone: e.target.value })} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.86rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Residence Hall / Primary Campus Spot *
            </label>
            <select
              className="form-select"
              required
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              defaultValue=""
            >
              <option value="" disabled>
                Select your Hall or Area
              </option>
              {campusLocations.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.86rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Password (Min. 6 characters) *
            </label>
            <input 
              className="form-input" 
              type="password" 
              placeholder="••••••••" 
              required 
              minLength="6"
              onChange={e => setFormData({ ...formData, password: e.target.value })} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary" 
            style={{ 
              padding: '0.95rem', 
              fontSize: '1rem', 
              marginTop: '0.75rem',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Creating Account...' : 'Create Verified Student Account'}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem', 
          paddingTop: '1.25rem', 
          borderTop: '1px solid var(--border-subtle)', 
          fontSize: '0.9rem' 
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Already registered? </span>
          <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '700' }}>
            Sign In →
          </Link>
        </div>
      </div>

      {/* CELEBRATION SUCCESS MODAL */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center', padding: '2.5rem 2rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--accent-emerald-subtle)',
              border: '2px solid var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.35rem'
            }}>
              <IconCheck size={32} color="var(--accent-emerald)" />
            </div>
            
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Welcome to the Network!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Your student account has been successfully created. You can now log in to exchange, borrow, and share resources.
            </p>
            
            <button 
              onClick={() => navigate('/login')}
              className="btn-primary"
              style={{ width: '100%', padding: '0.9rem' }}
            >
              Continue to Sign In →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;