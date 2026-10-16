import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { IconSettings, IconCheck } from '../components/Icons';

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

const Settings = () => {
  const { user, login } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || 'Al-Beruni Hall');
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (user) {
      const updatedUser = { ...user, name, phone, location };
      login(updatedUser, localStorage.getItem('token') || '');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div className="bento-card" style={{ padding: '3.5rem 2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Sign In to Manage Settings</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Configure your campus hall and notification preferences.
          </p>
          <Link to="/login" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: '780px', margin: '0 auto', width: '100%' }}>
      
      <div style={{ marginBottom: '2.25rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.45rem' }}>
          <IconSettings size={14} color="var(--accent-primary)" />
          <span>Campus Preferences</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.3rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>Account & Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.45rem' }}>
          Manage your residential hall location and exchange contact settings.
        </p>
      </div>

      {saved && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          color: 'var(--accent-emerald-text)', backgroundColor: 'var(--accent-emerald-subtle)', 
          border: '1px solid var(--accent-emerald)', padding: '1rem', 
          borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.92rem' 
        }}>
          <IconCheck size={18} color="var(--accent-emerald)" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.65rem' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Full Name
          </label>
          <input 
            className="form-input" 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Campus Email (Verified)
            </label>
            <input 
              className="form-input" 
              type="email" 
              value={user.email} 
              disabled 
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Phone / WhatsApp
            </label>
            <input 
              className="form-input" 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Primary Campus Hall / Meetup Location
          </label>
          <select 
            className="form-select"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            {campusLocations.map(loc => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Notification toggle */}
        <div style={{ 
          padding: '1.15rem', 
          borderRadius: '12px', 
          background: 'var(--bg-surface-subtle)', 
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.94rem' }}>
              WhatsApp Handover Alerts
            </strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.2rem' }}>
              Receive instant updates when a peer accepts your borrow or buy request.
            </p>
          </div>
          <input 
            type="checkbox" 
            checked={notifyWhatsApp} 
            onChange={(e) => setNotifyWhatsApp(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
          />
        </div>

        <button type="submit" className="btn-primary" style={{ padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem' }}>
          Save Preferences
        </button>

      </form>

    </div>
  );
};

export default Settings;
