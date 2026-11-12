import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ShieldCheck, LogOut, User, LayoutDashboard, FileText } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <header className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="brand-logo">
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

        <nav className="nav-actions">
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <>
                  <span className="badge badge-primary">
                    <ShieldCheck size={14} /> Admin
                  </span>
                  <Link
                    to="/admin"
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
                    className={`btn btn-sm ${!isAdminRoute ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    <FileText size={15} /> Data Saya
                  </Link>
                  <Link
                    to="/admin"
                    className="btn btn-sm btn-secondary"
                    title="Akses halaman admin"
                  >
                    <ShieldCheck size={15} /> /admin
                  </Link>
                </>
              )}

              <button onClick={handleLogout} className="btn btn-sm btn-danger" title="Keluar">
                <LogOut size={15} /> Keluar
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm btn-secondary">
                Masuk
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                Daftar Siswa
              </Link>
              <Link to="/admin" className="btn btn-sm btn-outline-primary">
                <ShieldCheck size={14} /> Portal Admin (/admin)
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
