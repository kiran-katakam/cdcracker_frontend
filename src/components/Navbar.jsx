import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, LogIn, ShieldCheck, Home } from 'lucide-react';

export default function Navbar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <nav className="navbar" style={{ position: 'sticky' }}>
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <div className="logo-icon">📚</div>
          <span>CDCracker</span>
        </NavLink>

        {/* Desktop links */}
        <div className="navbar-links">
          <NavLink to="/" className={linkClass} end>
            <Home size={14} style={{ display: 'inline', marginRight: 4 }} />
            Home
          </NavLink>
          <NavLink to="/courses" className={linkClass}>
            <BookOpen size={14} style={{ display: 'inline', marginRight: 4 }} />
            Courses
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            Contact
          </NavLink>

          {admin ? (
            <>
              <span style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                fontSize: '0.78rem', color: 'var(--accent)',
                background: 'var(--accent-dim)',
                padding: '0.2rem 0.6rem', borderRadius: 6,
              }}>
                <ShieldCheck size={13} /> Admin
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <NavLink to="/admin/login" className="btn btn-ghost btn-sm">
              <LogIn size={14} /> Admin
            </NavLink>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span style={{ transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile dropdown */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <NavLink to="/" className={linkClass} end onClick={() => setMenuOpen(false)}>Home</NavLink>
        <NavLink to="/courses" className={linkClass} onClick={() => setMenuOpen(false)}>Courses</NavLink>
        <NavLink to="/contact" className={linkClass} onClick={() => setMenuOpen(false)}>Contact</NavLink>
        {admin ? (
          <button className="nav-link" style={{ border: 'none', textAlign: 'left', color: 'var(--danger)' }} onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <NavLink to="/admin/login" className={linkClass} onClick={() => setMenuOpen(false)}>Admin Login</NavLink>
        )}
      </div>
    </nav>
  );
}
