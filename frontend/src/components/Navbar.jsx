import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const dropdownItemStyle = {
  display: 'block', padding: '0.75rem 1.5rem', color: 'var(--text-main)', 
  textDecoration: 'none', cursor: 'pointer', fontSize: '0.9rem'
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const isPillarActive = (path, type) => {
    const searchParams = new URLSearchParams(location.search);
    const currentType = searchParams.get('type');
    return location.pathname === path || (location.pathname === '/create-resource' && currentType === type);
  };

  return (
    <nav className="navbar" style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      padding: '1rem 2rem', backgroundColor: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'sticky', top: 0, zIndex: 1000 
    }}>
      
      <div>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
          CholoShare<span style={{ color: 'var(--accent-red)' }}>Kori</span>
        </Link>
      </div>

      <div className="navbar-links" style={{ display: 'flex', gap: '2.5rem' }}>
        <Link to="/sell" className={`nav-item ${isPillarActive('/sell', 'sell') ? 'active' : ''}`}>Sell</Link>
        <Link to="/buy" className={`nav-item ${isPillarActive('/buy', 'buy') ? 'active' : ''}`}>Buy</Link>
        <Link to="/lend" className={`nav-item ${isPillarActive('/lend', 'lend') ? 'active' : ''}`}>Lend</Link>
        <Link to="/borrow" className={`nav-item ${isPillarActive('/borrow', 'borrow') ? 'active' : ''}`}>Borrow</Link>
        <Link to="/free" className={`nav-item ${isPillarActive('/free', 'free') ? 'active' : ''}`}>Free</Link>
      </div>
      
      <div style={{ position: 'relative' }}>
        {!user ? (
          <Link to="/login" style={{
            backgroundColor: 'var(--accent-red)', color: '#fff', padding: '0.5rem 1.5rem',
            borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold'
          }}>
            Login
          </Link>
        ) : (
          <div>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px'
              }}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', 
                backgroundColor: 'var(--accent-red)', color: 'white', 
                display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ color: 'white', fontWeight: '500' }}>{user.name}</span>
            </div>

            {isDropdownOpen && (
              <div style={{
                position: 'absolute', top: '120%', right: '0', width: '200px',
                backgroundColor: '#111827', borderRadius: '8px', padding: '0.5rem 0',
                border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
                zIndex: 50
              }}>
                <Link to={`/profile/${user.id}`} onClick={() => setIsDropdownOpen(false)} style={dropdownItemStyle}>
                  See Profile
                </Link>
                <Link to="/starred" onClick={() => setIsDropdownOpen(false)} style={dropdownItemStyle}>
                  Starred Persons
                </Link>
                <Link to="/settings" onClick={() => setIsDropdownOpen(false)} style={dropdownItemStyle}>
                  Settings
                </Link>
                <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
                <div onClick={handleLogout} style={{ ...dropdownItemStyle, color: 'var(--accent-red)' }}>
                  Log Out
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;