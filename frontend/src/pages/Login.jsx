import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', formData);
      
      if (response.data.success) {
        // Update global state and local storage
        login(response.data.data.user, response.data.data.token);
        // Send user to the dashboard or home
        navigate('/');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Check your credentials.';
      alert(errorMsg);
      console.error('Login Error:', error.response?.data || error.message);
    }
  };

  const inputStyle = {
    padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', width: '100%', outline: 'none'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '4rem 0' }}>
      <div className="bento-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Login to access your campus resources.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input style={inputStyle} type="email" placeholder="Email Address" required
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            
          <input style={inputStyle} type="password" placeholder="Password" required
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          
          <button type="submit" style={{
            backgroundColor: 'var(--accent-red)', color: '#fff', padding: '0.75rem',
            borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', marginTop: '1rem'
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