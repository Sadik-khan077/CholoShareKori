import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { IconSparkles, IconAlertCircle } from '../components/Icons';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      if (response.data.success) {
        login(response.data.data.user, response.data.data.token);
        navigate('/');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your email and password.';
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
      <div className="bento-card" style={{ width: '100%', maxWidth: '440px', padding: '2.75rem 2.25rem' }}>
        
        {/* Brand Icon & Welcome */}
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
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginTop: '0.45rem' }}>
            Sign in with your campus credentials to trade, borrow, or lend items.
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
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.86rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Campus Email Address
            </label>
            <input 
              className="form-input" 
              type="email" 
              placeholder="e.g. student@juniv.edu" 
              required
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
          </div>
            
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.86rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input 
              className="form-input" 
              type="password" 
              placeholder="••••••••" 
              required
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary" 
            style={{ 
              padding: '0.9rem', 
              fontSize: '1rem', 
              marginTop: '0.5rem',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Campus'}
          </button>
        </form>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem', 
          paddingTop: '1.25rem', 
          borderTop: '1px solid var(--border-subtle)', 
          fontSize: '0.9rem' 
        }}>
          <span style={{ color: 'var(--text-muted)' }}>New to the community? </span>
          <Link to="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '700' }}>
            Register Account →
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;