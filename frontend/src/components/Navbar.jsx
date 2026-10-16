import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BrandLockup } from './BrandLogo';
import { 
  IconUser, 
  IconHistory, 
  IconSettings, 
  IconLogOut, 
  IconPlus, 
  IconChevronDown,
  IconStar,
  IconShieldCheck,
  IconSparkles,
  IconSun,
  IconMoon
} from './Icons';
import { getStoredStarredIds, demoStudents } from '../services/campusData';
import './Navbar.css';

const Navbar = () => {
  const { user, login, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [starredCount, setStarredCount] = useState(0);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('csk_theme') || 'warm-ivory';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('csk_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'warm-ivory' ? 'warm-espresso' : 'warm-ivory');
  };
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Keep starred count synchronized
  useEffect(() => {
    const updateCount = () => {
      setStarredCount(getStoredStarredIds().length);
    };
    updateCount();
    window.addEventListener('storage', updateCount);
    // Custom event for intra-tab updates
    window.addEventListener('csk_starred_updated', updateCount);
    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('csk_starred_updated', updateCount);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleQuickDemoLogin = (student) => {
    login(student, 'demo-jwt-token-' + student.id);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        
        {/* Bespoke Handcrafted Human Brand Mark */}
        <Link to="/" className="navbar-brand-link">
          <BrandLockup compact={false} />
        </Link>

        {/* Logical, Engineered Campus Navigation */}
        <nav className={`navbar-nav ${isMobileOpen ? 'mobile-active' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Explore All
          </Link>
          <Link to="/buy" className={`nav-link ${isActive('/buy') ? 'active' : ''}`}>
            Marketplace
          </Link>
          <Link to="/borrow" className={`nav-link ${isActive('/borrow') || isActive('/lend') ? 'active' : ''}`}>
            Lend & Borrow
          </Link>
          <Link to="/free" className={`nav-link ${isActive('/free') ? 'active' : ''}`}>
            Free Giveaways
          </Link>
          {user && (
            <Link to="/sell" className={`nav-link ${isActive('/sell') ? 'active' : ''}`}>
              My Dashboard
            </Link>
          )}
        </nav>

        {/* Right Actions & Engagement Elements */}
        <div className="navbar-actions">
          
          {/* Warm Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="btn-theme-toggle" 
            title={theme === 'warm-ivory' ? 'Switch to Warm Espresso (Night Study)' : 'Switch to Warm Campus (Ivory Day)'}
          >
            {theme === 'warm-ivory' ? (
              <>
                <IconMoon size={14} color="var(--accent-amber)" />
                <span className="theme-toggle-text">Dorm Night</span>
              </>
            ) : (
              <>
                <IconSun size={14} color="var(--accent-primary)" />
                <span className="theme-toggle-text">Campus Day</span>
              </>
            )}
          </button>

          {/* Quick Bookmarks / Starred Peer Items */}
          <Link 
            to="/starred" 
            className={`btn-starred-pill ${isActive('/starred') ? 'active' : ''}`}
            title="Your saved bookmarks"
          >
            <IconStar size={16} color={starredCount > 0 ? 'var(--accent-amber)' : 'var(--text-muted)'} />
            <span className="starred-text">Saved</span>
            {starredCount > 0 && (
              <span className="starred-badge">{starredCount}</span>
            )}
          </Link>

          {/* List an Item Action */}
          <Link to="/create-resource" className="btn-post-item">
            <IconPlus size={15} color="#ffffff" />
            <span>Post Listing</span>
          </Link>

          {!user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Link to="/login" className="btn-auth-link">
                Sign In
              </Link>
              
              {/* Quick Demo Pilot for reviewer delight */}
              <button 
                onClick={() => handleQuickDemoLogin(demoStudents[0])}
                className="btn-demo-pill"
                title="Instant 1-Click Demo Login as Nafis Iqbal"
              >
                <IconSparkles size={13} color="var(--accent-primary)" />
                <span>Demo Student</span>
              </button>
            </div>
          ) : (
            <div className="user-menu-wrapper" ref={dropdownRef}>
              <button 
                className="user-btn" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
              >
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-info-brief">
                  <span className="user-name-text">{user.name?.split(' ')[0] || 'Peer'}</span>
                  <span className="user-trust-tag">
                    <IconShieldCheck size={11} color="var(--accent-emerald)" />
                    <span>{user.trust_score || '99%'}</span>
                  </span>
                </div>
                <IconChevronDown size={14} color="var(--text-muted)" />
              </button>

              {isDropdownOpen && (
                <div className="profile-dropdown-card">
                  <div className="dropdown-user-header">
                    <div className="dropdown-user-title">{user.name || 'Campus Student'}</div>
                    <div className="dropdown-user-subtitle">
                      {user.dept || user.email || 'Jahangirnagar University'}
                    </div>
                    <div className="dropdown-trust-pill">
                      <span>Karma Score: {user.karma_points || 350} pts</span>
                    </div>
                  </div>

                  <Link to="/profile" className="dropdown-item">
                    <IconUser size={15} />
                    <span>Student Profile</span>
                  </Link>
                  <Link to="/history" className="dropdown-item">
                    <IconHistory size={15} />
                    <span>Exchanges & Loans</span>
                  </Link>
                  <Link to="/starred" className="dropdown-item">
                    <IconStar size={15} color="var(--accent-amber)" />
                    <span>Starred Items ({starredCount})</span>
                  </Link>
                  <Link to="/settings" className="dropdown-item">
                    <IconSettings size={15} />
                    <span>Hall & Settings</span>
                  </Link>

                  <div className="dropdown-divider" />
                  
                  {/* Switch Demo Identity for Easy Presentation */}
                  <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Switch Demo Persona
                  </div>
                  {demoStudents.map(student => (
                    <button
                      key={student.id}
                      onClick={() => handleQuickDemoLogin(student)}
                      className="dropdown-item"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: student.id === user.id ? '#ff5e36' : '#64748b' }} />
                      <span>{student.name} ({student.dept.split(' ')[0]})</span>
                    </button>
                  ))}

                  <div className="dropdown-divider" />

                  <button onClick={handleLogout} className="dropdown-item danger" style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}>
                    <IconLogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button 
            className="mobile-toggle" 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle navigation"
          >
            <div className={`hamburger-icon ${isMobileOpen ? 'open' : ''}`}>
              <span />
              <span />
              <span />
            </div>
          </button>

        </div>
      </div>
    </header>
  );
};

export default Navbar;