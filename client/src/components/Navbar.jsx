import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ShieldCheck, LogOut, User, LayoutDashboard, FileText, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <header className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="brand-logo" onClick={closeMenu}>
          <div className="brand-icon">
            <GraduationCap size={22} />
          </div>
          <div>
            <span style={{ letterSpacing: '-0.5px' }}>SIPENDIK</span>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '500', lineHeight: 1 }}>
              Data Siswa & Kondisi Ekonomi
            </div>
          </div>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          className="nav-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Nav Links & Actions */}
        <nav className={`nav-actions ${mobileMenuOpen ? 'is-open' : ''}`}>
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <>
                  <span className="badge badge-primary">
                    <ShieldCheck size={14} /> Admin: {user?.nisn || 'Administrator'}
                  </span>
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className={`btn btn-sm ${isAdminRoute ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    <LayoutDashboard size={15} /> Dashboard Admin
                  </Link>
                </>
              ) : (
                <>
                  <span className="badge badge-success">
                    <User size={14} /> Siswa: {user?.nisn}
                  </span>
                  <Link
                    to="/"
                    onClick={closeMenu}
                    className={`btn btn-sm ${!isAdminRoute ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    <FileText size={15} /> Formulir Data Saya
                  </Link>
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="btn btn-sm btn-secondary"
                    title="Akses halaman admin"
                  >
                    <ShieldCheck size={15} /> Akses Admin (/admin)
                  </Link>
                </>
              )}

              <button onClick={handleLogout} className="btn btn-sm btn-danger" title="Keluar">
                <LogOut size={15} /> Keluar
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="btn btn-sm btn-secondary">
                Masuk
              </Link>
              <Link to="/register" onClick={closeMenu} className="btn btn-sm btn-primary">
                Daftar Siswa
              </Link>
              <Link to="/admin" onClick={closeMenu} className="btn btn-sm btn-outline-primary">
                <ShieldCheck size={14} /> Portal Admin (/admin)
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
