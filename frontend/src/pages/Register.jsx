import { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', location: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registration attempt:', formData);
    // TODO: Connect to api.post('/auth/register', formData)
  };

  const inputStyle = {
    padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', width: '100%'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '4rem 0' }}>
      <div className="bento-card" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Join the Community</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Create an account to offer or request resources.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input style={inputStyle} type="text" placeholder="Full Name" required
              onChange={e => setFormData({...formData, name: e.target.value})} />
            <input style={inputStyle} type="tel" placeholder="Phone Number" required
              onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          
          <input style={inputStyle} type="email" placeholder="Email Address" required
            onChange={e => setFormData({...formData, email: e.target.value})} />
          
          <input style={inputStyle} type="text" placeholder="Location (e.g., Dhanmondi)" required
            onChange={e => setFormData({...formData, location: e.target.value})} />
            
          <input style={inputStyle} type="password" placeholder="Password" required
            onChange={e => setFormData({...formData, password: e.target.value})} />
          
          <button type="submit" style={{
            backgroundColor: 'var(--accent-red)', color: '#fff', padding: '0.75rem',
            borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', marginTop: '1rem'
          }}>
            Create Account
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--accent-red)', textDecoration: 'none' }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;