import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ShieldCheck, LogIn, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If redirected from admin gate
  const defaultIsAdmin = location.state?.fromAdmin || location.pathname.startsWith('/admin');

  const [isAdminMode, setIsAdminMode] = useState(defaultIsAdmin);
  const [nisn, setNisn] = useState(defaultIsAdmin ? 'admin' : '');
  const [password, setPassword] = useState(defaultIsAdmin ? 'admin123' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.message || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nisn.trim() || !password) {
      setError('Mohon lengkapi NISN/Username dan Password');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const user = await login(nisn, password);

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kembali NISN dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (admin) => {
    setIsAdminMode(admin);
    setError('');
    if (admin) {
      setNisn('admin');
      setPassword('admin123');
    } else {
      setNisn('');
      setPassword('');
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 4.25rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Toggle Mode */}
        <div
          style={{
            display: 'flex',
            background: '#e2e8f0',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => switchMode(false)}
            style={{
              flex: 1,
              padding: '0.625rem',
              borderRadius: '8px',
              border: 'none',
              background: !isAdminMode ? '#ffffff' : 'transparent',
              color: !isAdminMode ? '#2563eb' : '#64748b',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: !isAdminMode ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <UserCheck size={16} /> Masuk Siswa
          </button>
          <button
            type="button"
            onClick={() => switchMode(true)}
            style={{
              flex: 1,
              padding: '0.625rem',
              borderRadius: '8px',
              border: 'none',
              background: isAdminMode ? '#ffffff' : 'transparent',
              color: isAdminMode ? '#2563eb' : '#64748b',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: isAdminMode ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <ShieldCheck size={16} /> Masuk Admin (/admin)
          </button>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '3.25rem',
                height: '3.25rem',
                margin: '0 auto 1rem',
                background: isAdminMode ? 'linear-gradient(135deg, #1e293b, #334155)' : 'linear-gradient(135deg, #2563eb, #4f46e5)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
              }}
            >
              {isAdminMode ? <ShieldCheck size={28} /> : <GraduationCap size={28} />}
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              {isAdminMode ? 'Login Administrator' : 'Login Siswa'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {isAdminMode
                ? 'Portal admin verifikasi & pemantauan ekonomi siswa'
                : 'Masuk untuk mengisi kondisi ekonomi & alamat rumah Anda'}
            </p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          {isAdminMode && (
            <div className="alert alert-info" style={{ fontSize: '0.8125rem' }}>
              <strong>Kredensial Default Admin:</strong><br />
              Username: <code>admin</code><br />
              Password: <code>admin123</code>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                {isAdminMode ? 'Username / ID Admin' : 'NISN Siswa'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={isAdminMode ? 'Masukkan username admin' : 'Contoh: 0071234567'}
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            >
              {loading ? (
                'Memproses...'
              ) : (
                <>
                  <LogIn size={18} /> Masuk Sekarang
                </>
              )}
            </button>
          </form>

          {!isAdminMode && (
            <div
              style={{
                marginTop: '1.75rem',
                textAlign: 'center',
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              Belum punya akun siswa?{' '}
              <Link
                to="/register"
                style={{ color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                Daftar di sini <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
