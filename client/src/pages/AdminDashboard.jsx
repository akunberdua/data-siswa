import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ShieldCheck,
  Search,
  Users,
  Home,
  CheckCircle,
  AlertTriangle,
  Printer,
  Download,
  Eye,
  Trash2,
  ExternalLink,
  MapPin,
  DollarSign,
  Grid,
  List,
  Sparkles,
  RefreshCw,
  X,
} from 'lucide-react';

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [kategoriEkonomi, setKategoriEkonomi] = useState('Semua');
  const [statusOrangTua, setStatusOrangTua] = useState('Semua');
  const [statusVerifikasi, setStatusVerifikasi] = useState('Semua');
  const [statusBantuan, setStatusBantuan] = useState('Semua');

  // Detail Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [newVerificationStatus, setNewVerificationStatus] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [modalPhotoZoom, setModalPhotoZoom] = useState(false);

  // Cek otorisasi admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { fromAdmin: true, message: 'Silakan login sebagai Administrator untuk mengakses /admin' },
      });
    } else if (!isAdmin) {
      navigate('/login', {
        state: { fromAdmin: true, message: 'Akses ditolak. Akun Anda bukan Administrator. Silakan login dengan akun admin.' },
      });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStudents = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!isAdmin) return;

    setLoading(true);
    api.admin
      .getStudents({
        search,
        kategoriEkonomi,
        statusOrangTua,
        statusVerifikasi,
        statusBantuan,
      })
      .then((res) => {
        if (isMounted) {
          setStudents(res.students || []);
          setStats(res.stats || null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load students:', err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAdmin, search, kategoriEkonomi, statusOrangTua, statusVerifikasi, statusBantuan, refreshKey]);

  const handleOpenDetail = (student) => {
    setSelectedStudent(student);
    setNewVerificationStatus(student.statusVerifikasi || 'Belum Diverifikasi');
    setAdminNote(student.catatanAdmin || '');
    setNewCategory(student.kondisiEkonomi?.kategoriEkonomi || 'Belum Ditentukan');
  };

  const handleUpdateStatus = async () => {
    if (!selectedStudent) return;
    try {
      setUpdatingStatus(true);
      const res = await api.admin.updateStatus(selectedStudent._id, {
        statusVerifikasi: newVerificationStatus,
        catatanAdmin: adminNote,
        kategoriEkonomi: newCategory,
      });
      // Update state lokal
      setSelectedStudent(res.student);
      setStudents((prev) =>
        prev.map((s) => (s._id === res.student._id ? res.student : s))
      );
      fetchStudents();
      alert('Status verifikasi dan kategori siswa berhasil diperbarui!');
    } catch (err) {
      alert('Gagal memperbarui status: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (studentId, studentName) => {
    if (!window.confirm(`Yakin ingin menghapus seluruh data siswa ${studentName}? Akun user juga akan dihapus permanen.`)) {
      return;
    }
    try {
      await api.admin.deleteStudent(studentId);
      if (selectedStudent?._id === studentId) {
        setSelectedStudent(null);
      }
      fetchStudents();
    } catch (err) {
      alert('Gagal menghapus siswa: ' + err.message);
    }
  };

  const handleExportCSV = () => {
    if (!students || students.length === 0) {
      alert('Tidak ada data siswa untuk diekspor');
      return;
    }

    const headers = [
      'NISN',
      'Nama Siswa',
      'Kelas',
      'No HP',
      'Status Orang Tua',
      'Penghasilan Ortu',
      'Kategori Ekonomi',
      'Status Rumah',
      'Kondisi Dinding',
      'Kondisi Lantai',
      'Daya Listrik',
      'Bantuan Sosial',
      'Alamat Jalan',
      'Kecamatan',
      'Kabupaten/Kota',
      'Status Verifikasi',
    ];

    const rows = students.map((s) => [
      `"${s.nisn || ''}"`,
      `"${s.nama || ''}"`,
      `"${s.kelas || ''}"`,
      `"${s.noHp || ''}"`,
      `"${s.kondisiKeluarga?.statusOrangTua || ''}"`,
      `"${s.kondisiEkonomi?.penghasilanOrtu || ''}"`,
      `"${s.kondisiEkonomi?.kategoriEkonomi || ''}"`,
      `"${s.kondisiEkonomi?.statusKepemilikanRumah || ''}"`,
      `"${s.kondisiEkonomi?.kondisiDinding || ''}"`,
      `"${s.kondisiEkonomi?.kondisiLantai || ''}"`,
      `"${s.kondisiEkonomi?.dayaListrik || ''}"`,
      `"${(s.kondisiEkonomi?.penerimaBantuan || []).join(', ')}"`,
      `"${(s.alamat?.jalan || '').replace(/"/g, '""')}"`,
      `"${s.alamat?.kecamatan || ''}"`,
      `"${s.alamat?.kabupatenKota || ''}"`,
      `"${s.statusVerifikasi || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_data_siswa_ekonomi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Top Header Banner */}
      <div
        className="card no-print"
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          color: 'white',
          border: 'none',
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-primary" style={{ background: '#2563eb', color: 'white', border: 'none' }}>
                <ShieldCheck size={14} /> Panel Kontrol Administrator (/admin)
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              Monitoring Kondisi Ekonomi & Rumah Siswa
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              Verifikasi data tempat tinggal, foto kondisi rumah, dan kelayakan status ekonomi keluarga siswa.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            <button onClick={fetchStudents} className="btn btn-secondary btn-sm" title="Muat Ulang Data">
              <RefreshCw size={15} /> Refresh
            </button>
            <button onClick={handleExportCSV} className="btn btn-success btn-sm">
              <Download size={15} /> Unduh CSV / Excel
            </button>
            <button onClick={handlePrint} className="btn btn-secondary btn-sm">
              <Printer size={15} /> Cetak Rekap
            </button>
          </div>
        </div>
      </div>

      {/* Analytics & Stats Cards */}
      {stats && (
        <div className="stats-grid no-print">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Users size={22} />
            </div>
            <div>
              <div className="stat-val">{stats.total}</div>
              <div className="stat-lbl">Total Siswa Terdata</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div className="stat-val" style={{ color: 'var(--danger)' }}>{stats.kurangMampu}</div>
              <div className="stat-lbl">Kurang Mampu / Prioritas</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
              <DollarSign size={22} />
            </div>
            <div>
              <div className="stat-val" style={{ color: 'var(--warning)' }}>{stats.menengah}</div>
              <div className="stat-lbl">Kategori Menengah</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
              <CheckCircle size={22} />
            </div>
            <div>
              <div className="stat-val" style={{ color: 'var(--success)' }}>{stats.mampu}</div>
              <div className="stat-lbl">Kategori Mampu</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
              <Home size={22} />
            </div>
            <div>
              <div className="stat-val">{stats.penerimaBantuan}</div>
              <div className="stat-lbl">Penerima Bantuan (KIP/PKH)</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card no-print" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Baris 1: Search & View Switcher */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Cari berdasarkan Nama Siswa, NISN, Jalan, Kecamatan, Kabupaten, atau Kelas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '8px', padding: '3px' }}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 10px', border: 'none' }}
                title="Tampilan Kartu Foto"
              >
                <Grid size={16} /> Kartu
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 10px', border: 'none' }}
                title="Tampilan Tabel Data"
              >
                <List size={16} /> Tabel
              </button>
            </div>
          </div>

          {/* Baris 2: Dropdown Filters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Status Ekonomi:
              </label>
              <select
                className="form-select"
                style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
                value={kategoriEkonomi}
                onChange={(e) => setKategoriEkonomi(e.target.value)}
              >
                <option value="Semua">Semua Status Ekonomi</option>
                <option value="Kurang Mampu">Kurang Mampu</option>
                <option value="Menengah Bawah">Menengah Bawah</option>
                <option value="Menengah">Menengah</option>
                <option value="Mampu">Mampu</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Status Orang Tua:
              </label>
              <select
                className="form-select"
                style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
                value={statusOrangTua}
                onChange={(e) => setStatusOrangTua(e.target.value)}
              >
                <option value="Semua">Semua Status Ortu</option>
                <option value="Lengkap">Lengkap</option>
                <option value="Yatim">Yatim (Ayah Tiada)</option>
                <option value="Piatu">Piatu (Ibu Tiada)</option>
                <option value="Yatim Piatu">Yatim Piatu</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Status Verifikasi:
              </label>
              <select
                className="form-select"
                style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
                value={statusVerifikasi}
                onChange={(e) => setStatusVerifikasi(e.target.value)}
              >
                <option value="Semua">Semua Verifikasi</option>
                <option value="Belum Diverifikasi">Belum Diverifikasi</option>
                <option value="Terverifikasi">Terverifikasi</option>
                <option value="Perlu Perbaikan">Perlu Perbaikan</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Bantuan Pemerintah:
              </label>
              <select
                className="form-select"
                style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
                value={statusBantuan}
                onChange={(e) => setStatusBantuan(e.target.value)}
              >
                <option value="Semua">Semua Status Bantuan</option>
                <option value="Penerima Bantuan">Penerima Bantuan (KIP/PKH)</option>
                <option value="Bukan Penerima">Bukan Penerima</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Grid / Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Memuat data siswa...
        </div>
      ) : students.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Users size={40} style={{ color: 'var(--text-light)', margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Tidak ada data siswa ditemukan</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Coba ubah kata kunci pencarian atau reset filter.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARD VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {students.map((student) => {
            const kategori = student.kondisiEkonomi?.kategoriEkonomi || 'Belum Ditentukan';
            const statusOrtu = student.kondisiKeluarga?.statusOrangTua || 'Lengkap';
            const penghasilan = student.kondisiEkonomi?.penghasilanOrtu || '-';

            return (
              <div
                key={student._id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 0,
                  overflow: 'hidden',
                }}
              >
                {/* Foto Rumah Thumbnail */}
                <div
                  style={{
                    position: 'relative',
                    height: '180px',
                    background: '#0f172a',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleOpenDetail(student)}
                >
                  {student.fotoRumah ? (
                    <img
                      src={student.fotoRumah}
                      alt={`Rumah ${student.nama}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                      }}
                    >
                      <Home size={32} />
                      <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>Foto Rumah Belum Diunggah</span>
                    </div>
                  )}

                  {/* Badges on top of photo */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <span
                      className={`badge ${
                        kategori === 'Kurang Mampu'
                          ? 'badge-danger'
                          : kategori === 'Menengah Bawah'
                          ? 'badge-warning'
                          : kategori === 'Menengah'
                          ? 'badge-primary'
                          : 'badge-success'
                      }`}
                      style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                    >
                      <Sparkles size={11} /> {kategori}
                    </span>
                    {statusOrtu !== 'Lengkap' && (
                      <span className="badge badge-danger" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                        {statusOrtu}
                      </span>
                    )}
                  </div>

                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <span
                      className={`badge ${
                        student.statusVerifikasi === 'Terverifikasi'
                          ? 'badge-success'
                          : student.statusVerifikasi === 'Perlu Perbaikan'
                          ? 'badge-danger'
                          : 'badge-secondary'
                      }`}
                    >
                      {student.statusVerifikasi || 'Belum Verifikasi'}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      NISN: {student.nisn} {student.kelas && `• Kelas: ${student.kelas}`}
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1e293b', marginTop: '2px' }}>
                      {student.nama}
                    </h3>
                  </div>

                  {/* Summary Details */}
                  <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '6px', color: '#334155', marginBottom: '1rem', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <MapPin size={15} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {student.alamat?.jalan
                          ? `${student.alamat.jalan}, ${student.alamat.kecamatan || ''} ${student.alamat.kabupatenKota || ''}`
                          : 'Alamat belum dilengkapi'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <DollarSign size={15} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                      <span>Penghasilan Ortu: <strong>{penghasilan}</strong></span>
                    </div>

                    {student.kondisiKeluarga?.pekerjaanAyah && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <span>Pekerjaan: {student.kondisiKeluarga.pekerjaanAyah} {student.kondisiKeluarga.pekerjaanIbu && `& ${student.kondisiKeluarga.pekerjaanIbu}`}</span>
                      </div>
                    )}

                    {student.kondisiEkonomi?.penerimaBantuan?.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {student.kondisiEkonomi.penerimaBantuan.map((b) => (
                          <span key={b} className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      paddingTop: '0.875rem',
                      borderTop: '1px solid var(--border-color)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(student)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      <Eye size={14} /> Detail Lengkap
                    </button>
                    {student.alamat?.googleMapsUrl && (
                      <a
                        href={student.alamat.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        title="Buka Lokasi di Google Maps"
                      >
                        <MapPin size={14} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(student._id, student.nama)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)' }}
                      title="Hapus Siswa"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="table-responsive card" style={{ padding: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Foto</th>
                <th>Nama & NISN</th>
                <th>Kelas</th>
                <th>Alamat Domisili</th>
                <th>Status Ortu</th>
                <th>Penghasilan Ortu</th>
                <th>Status Ekonomi</th>
                <th>Bantuan</th>
                <th>Verifikasi</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const kategori = s.kondisiEkonomi?.kategoriEkonomi || 'Belum Ditentukan';
                return (
                  <tr key={s._id}>
                    <td>
                      <div
                        style={{
                          width: '48px',
                          height: '36px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          background: '#000',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleOpenDetail(s)}
                      >
                        {s.fotoRumah ? (
                          <img
                            src={s.fotoRumah}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <Home size={16} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{s.nama}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NISN: {s.nisn}</div>
                    </td>
                    <td>{s.kelas || '-'}</td>
                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontSize: '0.8125rem' }}>
                        {s.alamat?.jalan || '-'}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {s.alamat?.kecamatan && `${s.alamat.kecamatan}, `}{s.alamat?.kabupatenKota || ''}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${s.kondisiKeluarga?.statusOrangTua === 'Lengkap' ? 'badge-secondary' : 'badge-danger'}`}>
                        {s.kondisiKeluarga?.statusOrangTua || 'Lengkap'}
                      </span>
                    </td>
                    <td>{s.kondisiEkonomi?.penghasilanOrtu || '-'}</td>
                    <td>
                      <span
                        className={`badge ${
                          kategori === 'Kurang Mampu'
                            ? 'badge-danger'
                            : kategori === 'Menengah Bawah'
                            ? 'badge-warning'
                            : kategori === 'Menengah'
                            ? 'badge-primary'
                            : 'badge-success'
                        }`}
                      >
                        {kategori}
                      </span>
                    </td>
                    <td>
                      {s.kondisiEkonomi?.penerimaBantuan?.length > 0 ? (
                        s.kondisiEkonomi.penerimaBantuan.join(', ')
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>-</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          s.statusVerifikasi === 'Terverifikasi'
                            ? 'badge-success'
                            : s.statusVerifikasi === 'Perlu Perbaikan'
                            ? 'badge-danger'
                            : 'badge-secondary'
                        }`}
                      >
                        {s.statusVerifikasi || 'Belum Verifikasi'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(s)}
                          className="btn btn-sm btn-primary"
                          title="Lihat Detail Lengkap"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s._id, s.nama)}
                          className="btn btn-sm btn-danger"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DETAIL LENGKAP SISWA */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-primary">NISN: {selectedStudent.nisn}</span>
                  <span className={`badge ${
                    selectedStudent.statusVerifikasi === 'Terverifikasi' ? 'badge-success' :
                    selectedStudent.statusVerifikasi === 'Perlu Perbaikan' ? 'badge-danger' : 'badge-warning'
                  }`}>
                    {selectedStudent.statusVerifikasi || 'Belum Diverifikasi'}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>
                  {selectedStudent.nama} {selectedStudent.kelas && `(${selectedStudent.kelas})`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="btn btn-secondary btn-icon"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Foto Rumah Terbaru */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                  Foto Terbaru Rumah Siswa
                </h4>
                {selectedStudent.fotoRumah ? (
                  <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', maxHeight: '340px', background: '#000' }}>
                    <img
                      src={selectedStudent.fotoRumah}
                      alt="Foto Rumah Siswa"
                      style={{ width: '100%', maxHeight: '340px', objectFit: 'contain', display: 'block', cursor: 'zoom-in' }}
                      onClick={() => setModalPhotoZoom(true)}
                    />
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setModalPhotoZoom(true)}
                        className="btn btn-sm btn-secondary"
                        style={{ background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none' }}
                      >
                        <Eye size={14} /> Zoom Foto Penuh
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
                    Siswa belum mengunggah foto rumah.
                  </div>
                )}
              </div>

              {/* Data Alamat */}
              <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} color="var(--primary)" /> Alamat Tempat Tinggal Saat Ini
                  </h4>
                  {selectedStudent.alamat?.googleMapsUrl && (
                    <a
                      href={selectedStudent.alamat.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      <ExternalLink size={13} /> Buka di Google Maps
                    </a>
                  )}
                </div>
                <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                  <div><strong>Jalan / Rumah:</strong> {selectedStudent.alamat?.jalan || '-'}</div>
                  <div><strong>RT / RW:</strong> {selectedStudent.alamat?.rtRw || '-'} | <strong>Kelurahan/Desa:</strong> {selectedStudent.alamat?.kelurahan || '-'}</div>
                  <div><strong>Kecamatan:</strong> {selectedStudent.alamat?.kecamatan || '-'} | <strong>Kabupaten/Kota:</strong> {selectedStudent.alamat?.kabupatenKota || '-'}</div>
                  <div><strong>Provinsi:</strong> {selectedStudent.alamat?.provinsi || '-'} | <strong>Kode Pos:</strong> {selectedStudent.alamat?.kodePos || '-'}</div>
                </div>
              </div>

              {/* Data Keluarga & Kondisi Orang Tua */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                    <Users size={16} color="var(--primary)" /> Kondisi Orang Tua & Keluarga
                  </h4>
                  <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><strong>Status Ortu:</strong> {selectedStudent.kondisiKeluarga?.statusOrangTua || 'Lengkap'}</div>
                    <div><strong>Ayah / Wali:</strong> {selectedStudent.kondisiKeluarga?.namaAyah || '-'} ({selectedStudent.kondisiKeluarga?.pekerjaanAyah || 'Tidak bekerja'})</div>
                    <div><strong>Ibu:</strong> {selectedStudent.kondisiKeluarga?.namaIbu || '-'} ({selectedStudent.kondisiKeluarga?.pekerjaanIbu || 'Tidak bekerja'})</div>
                    <div><strong>Jumlah Tanggungan:</strong> {selectedStudent.kondisiKeluarga?.jumlahTanggungan ?? 0} orang</div>
                    <div><strong>Status Anak:</strong> {selectedStudent.kondisiKeluarga?.statusAnak || 'Anak Kandung'}</div>
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                    <DollarSign size={16} color="var(--warning)" /> Kondisi Ekonomi & Fasilitas
                  </h4>
                  <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><strong>Penghasilan Ortu:</strong> {selectedStudent.kondisiEkonomi?.penghasilanOrtu || '-'}</div>
                    <div><strong>Status Rumah:</strong> {selectedStudent.kondisiEkonomi?.statusKepemilikanRumah || '-'}</div>
                    <div><strong>Dinding / Lantai:</strong> {selectedStudent.kondisiEkonomi?.kondisiDinding || '-'} / {selectedStudent.kondisiEkonomi?.kondisiLantai || '-'}</div>
                    <div><strong>Atap:</strong> {selectedStudent.kondisiEkonomi?.kondisiAtap || '-'}</div>
                    <div><strong>Daya Listrik:</strong> {selectedStudent.kondisiEkonomi?.dayaListrik || '-'} | <strong>Air:</strong> {selectedStudent.kondisiEkonomi?.sumberAir || '-'}</div>
                    <div><strong>Bantuan:</strong> {(selectedStudent.kondisiEkonomi?.penerimaBantuan || []).join(', ') || 'Belum Menerima Bantuan'}</div>
                  </div>
                </div>
              </div>

              {selectedStudent.kondisiEkonomi?.catatanTambahan && (
                <div style={{ marginBottom: '1.5rem', background: '#fffbeb', border: '1px solid #fde68a', padding: '0.875rem 1rem', borderRadius: '8px', fontSize: '0.8125rem', color: '#92400e' }}>
                  <strong>Catatan Khusus dari Siswa:</strong>
                  <p style={{ marginTop: '2px' }}>{selectedStudent.kondisiEkonomi.catatanTambahan}</p>
                </div>
              )}

              {/* Panel Kontrol Verifikasi & Status Admin */}
              <div style={{ background: '#f1f5f9', padding: '1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={18} color="var(--primary)" /> Tinjauan & Verifikasi Administrator
                </h4>

                <div className="form-grid-2">
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8125rem' }}>Status Verifikasi:</label>
                    <select
                      className="form-select"
                      value={newVerificationStatus}
                      onChange={(e) => setNewVerificationStatus(e.target.value)}
                    >
                      <option value="Belum Diverifikasi">Belum Diverifikasi</option>
                      <option value="Terverifikasi">Terverifikasi (Data Valid & Disetujui)</option>
                      <option value="Perlu Perbaikan">Perlu Perbaikan (Minta Siswa Lengkapi/Revisi)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8125rem' }}>Klasifikasi Kategori Ekonomi:</label>
                    <select
                      className="form-select"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="Kurang Mampu">Kurang Mampu (Prioritas Bantuan)</option>
                      <option value="Menengah Bawah">Menengah Bawah</option>
                      <option value="Menengah">Menengah</option>
                      <option value="Mampu">Mampu</option>
                      <option value="Belum Ditentukan">Belum Ditentukan</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8125rem' }}>Catatan / Evaluasi Admin (Dapat dibaca oleh siswa):</label>
                  <input
                    type="text"
                    className="form-input"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Contoh: Foto rumah sudah sesuai, terverifikasi layak menerima program beasiswa."
                  />
                </div>

                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '0.25rem' }}
                >
                  {updatingStatus ? 'Menyimpan...' : 'Simpan Status Verifikasi'}
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-secondary btn-sm"
              >
                <Printer size={15} /> Cetak Formulir
              </button>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="btn btn-secondary btn-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Zoom Fullscreen Foto Rumah */}
      {modalPhotoZoom && selectedStudent?.fotoRumah && (
        <div className="modal-overlay" onClick={() => setModalPhotoZoom(false)} style={{ zIndex: 60 }}>
          <div
            className="modal-container"
            style={{ maxWidth: '900px', background: '#000', padding: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={selectedStudent.fotoRumah}
                alt="Foto Rumah Zoom"
                style={{ width: '100%', maxHeight: '85vh', objectFit: 'contain', display: 'block' }}
              />
              <button
                type="button"
                onClick={() => setModalPhotoZoom(false)}
                className="btn btn-danger btn-sm"
                style={{ position: 'absolute', top: '12px', right: '12px' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

