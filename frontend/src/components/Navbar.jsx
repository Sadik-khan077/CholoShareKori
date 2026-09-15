import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      
      {/* Logo */}
      <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '1.5rem', fontWeight: '700' }}>
        CholoShare<span style={{ color: 'var(--accent-red)' }}>Kori</span>
      </Link>

      {/* Center Tabs with NavLink */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <NavLink to="/sell" className="nav-item">Sell</NavLink>
        <NavLink to="/buy" className="nav-item">Buy</NavLink>
        <NavLink to="/lend" className="nav-item">Lend</NavLink>
        <NavLink to="/borrow" className="nav-item">Borrow</NavLink>
        <NavLink to="/free" className="nav-item">Free</NavLink>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <NavLink to="/profile" className="nav-item">My Profile</NavLink>
        <Link to="/login" style={{ backgroundColor: 'var(--accent-red)', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
          Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;