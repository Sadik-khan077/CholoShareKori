import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Register = () => {

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', location: '', registration_no: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send the POST request to our Express backend
      const response = await api.post('/auth/register', formData);

      if (response.data.success) {
        // Remove the alert() and navigate() lines, and replace them with this:
        setShowSuccess(true);
      }
    } catch (error) {
      // Handle errors (e.g., duplicate email, bad registration number)
      const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      alert(errorMsg); // You can replace this with a nicer custom toast notification later
      console.error('Registration Error:', error.response?.data || error.message);
    }
  };

  const inputStyle = {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)',
    color: 'var(--text-main)',
    width: '100%',
    outline: 'none',
    // Add this property to ensure the select box itself looks good
    appearance: 'none',
  };

  // Predefined locations matching the backend database seed exactly
  const campusLocations = [
    "Al-Beruni Hall", "Mir Mosharraf Hossain Hall", "Shaheed Salahuddin Hall",
    "Maulana Bhasani Hall", "Bangabandhu Sheikh Mujibur Rahman Hall", "Syed Nazrul Islam Hall",
    "Shaheed Rafiq-Jabbar Hall", "A. F. M. Kamaluddin Hall", "Bishwabidyalay Hall",
    "Jahanara Imam Hall", "Pritilata Hall", "Noorjahan Hall", "Sufia Kamal Hall",
    "Fatema Mernissi Hall", "Bangamata Sheikh Fazilatunnesa Mujib Hall", "Central Cafeteria",
    "TSC (Teacher-Student Centre)", "Central Library", "Science Faculty", "Arts Faculty",
    "Social Science Faculty", "Main Gate Area", "Medical Centre", "Other"
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '4rem 0' }}>
      <div className="bento-card" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Join the Community</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Create an account using your university credentials.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input style={inputStyle} type="text" placeholder="Full Name" required
              onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <input style={inputStyle} type="text" placeholder="JU Registration No." required
              onChange={e => setFormData({ ...formData, registration_no: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input style={inputStyle} type="email" placeholder="Email Address" required
              onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <input style={inputStyle} type="tel" placeholder="Phone (e.g., 017...)" required
              onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          </div>

          <select
            style={inputStyle}
            required
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            defaultValue=""
          >
            <option value="" disabled style={{ backgroundColor: '#111827', color: 'white' }}>
              Select your Hall / Area
            </option>
            {campusLocations.map(loc => (
              <option key={loc} value={loc} style={{ backgroundColor: '#111827', color: 'white' }}>
                {loc}
              </option>
            ))}
          </select>

          <input style={inputStyle} type="password" placeholder="Password (Min. 6 characters)" required minLength="6"
            onChange={e => setFormData({ ...formData, password: e.target.value })} />

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

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="bento-card" style={{
            backgroundColor: '#111827', // Dark background
            padding: '2.5rem 2rem',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Animated Checkmark Icon (SVG) */}
            <svg style={{ width: '4rem', height: '4rem', color: '#10B981', margin: '0 auto 1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            
            <h2 style={{ marginBottom: '0.5rem', color: 'white' }}>Welcome Aboard!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Your account has been successfully created. You can now log in to access the platform.
            </p>
            
            <button 
              onClick={() => navigate('/login')}
              style={{
                backgroundColor: 'var(--accent-red)', 
                color: '#fff', 
                padding: '0.75rem 2rem',
                borderRadius: '8px', 
                border: 'none', 
                fontWeight: '600', 
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;