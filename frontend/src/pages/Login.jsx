import { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
    // TODO: Connect to api.post('/auth/login', formData)
  };

  const formStyle = {
    display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem'
  };

  const inputStyle = {
    padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text-main)'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
      <div className="bento-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Login to access your dashboard</p>
        
        <form onSubmit={handleSubmit} style={formStyle}>
          <input 
            style={inputStyle} type="email" placeholder="Email Address" required
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          <input 
            style={inputStyle} type="password" placeholder="Password" required
            onChange={e => setFormData({...formData, password: e.target.value})} 
          />
          <button type="submit" style={{
            backgroundColor: 'var(--accent-red)', color: '#fff', padding: '0.75rem',
            borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem'
          }}>
            Login
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--accent-red)', textDecoration: 'none' }}>Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;