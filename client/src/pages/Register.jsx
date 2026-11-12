import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nisn: '',
    nama: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nisn, nama, password, confirmPassword } = formData;

    if (!nisn.trim() || !nama.trim() || !password) {
      setError('Semua kolom wajib diisi');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(nisn, nama, password);
      // Sukses mendaftar langsung diarahkan ke Dashboard Siswa
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registrasi gagal. Pastikan NISN belum pernah terdaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 4.25rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '3.25rem',
                height: '3.25rem',
                margin: '0 auto 1rem',
                background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
              }}
            >
              <GraduationCap size={28} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              Pendaftaran Akun Siswa
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Daftarkan diri menggunakan NISN, Nama Lengkap, dan Password
            </p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                NISN (Nomor Induk Siswa Nasional) <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                name="nisn"
                className="form-input"
                placeholder="Contoh: 0071234567"
                value={formData.nisn}
                onChange={handleChange}
                required
                autoFocus
              />
              <div className="form-help">NISN akan digunakan sebagai ID unik saat login.</div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Nama Lengkap Siswa <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                name="nama"
                className="form-input"
                placeholder="Contoh: Muhammad Hasrul"
                value={formData.nama}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Password Siswa <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Konfirmasi Password <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Ulangi password di atas"
                value={formData.confirmPassword}
                onChange={handleChange}
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
                'Mendaftarkan...'
              ) : (
                <>
                  <UserPlus size={18} /> Daftar Sekarang
                </>
              )}
            </button>
          </form>

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
            Sudah memiliki akun siswa?{' '}
            <Link
              to="/login"
              style={{ color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              <ArrowLeft size={14} /> Masuk ke sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

