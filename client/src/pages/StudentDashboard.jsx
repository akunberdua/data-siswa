import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ImageUploader from '../components/ImageUploader';
import {
  User,
  Camera,
  Users,
  DollarSign,
  Save,
  CheckCircle,
  AlertCircle,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, updateUserProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('pribadi');

  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    nisn: user?.nisn || '',
    jenisKelamin: '',
    kelas: '',
    jurusan: '',
    noHp: '',
    alamat: {
      jalan: '',
      rtRw: '',
      kelurahan: '',
      kecamatan: '',
      kabupatenKota: '',
      provinsi: '',
      kodePos: '',
      googleMapsUrl: '',
    },
    fotoRumah: '',
    kondisiKeluarga: {
      statusOrangTua: 'Lengkap',
      namaAyah: '',
      pekerjaanAyah: '',
      namaIbu: '',
      pekerjaanIbu: '',
      jumlahTanggungan: 0,
      statusAnak: 'Anak Kandung',
    },
    kondisiEkonomi: {
      penghasilanOrtu: '',
      statusKepemilikanRumah: '',
      kondisiDinding: '',
      kondisiLantai: '',
      kondisiAtap: '',
      dayaListrik: '',
      sumberAir: '',
      penerimaBantuan: [],
      catatanTambahan: '',
      kategoriEkonomi: 'Belum Ditentukan',
    },
    statusVerifikasi: 'Belum Diverifikasi',
    catatanAdmin: '',
  });

  useEffect(() => {
    async function loadStudentData() {
      try {
        setLoading(true);
        const res = await api.student.getProfile();
        if (res.studentData) {
          const sd = res.studentData;
          setFormData({
            nama: sd.nama || user?.nama || '',
            nisn: sd.nisn || user?.nisn || '',
            jenisKelamin: sd.jenisKelamin || '',
            kelas: sd.kelas || '',
            jurusan: sd.jurusan || '',
            noHp: sd.noHp || '',
            alamat: {
              jalan: sd.alamat?.jalan || '',
              rtRw: sd.alamat?.rtRw || '',
              kelurahan: sd.alamat?.kelurahan || '',
              kecamatan: sd.alamat?.kecamatan || '',
              kabupatenKota: sd.alamat?.kabupatenKota || '',
              provinsi: sd.alamat?.provinsi || '',
              kodePos: sd.alamat?.kodePos || '',
              googleMapsUrl: sd.alamat?.googleMapsUrl || '',
            },
            fotoRumah: sd.fotoRumah || '',
            kondisiKeluarga: {
              statusOrangTua: sd.kondisiKeluarga?.statusOrangTua || 'Lengkap',
              namaAyah: sd.kondisiKeluarga?.namaAyah || '',
              pekerjaanAyah: sd.kondisiKeluarga?.pekerjaanAyah || '',
              namaIbu: sd.kondisiKeluarga?.namaIbu || '',
              pekerjaanIbu: sd.kondisiKeluarga?.pekerjaanIbu || '',
              jumlahTanggungan: sd.kondisiKeluarga?.jumlahTanggungan ?? 0,
              statusAnak: sd.kondisiKeluarga?.statusAnak || 'Anak Kandung',
            },
            kondisiEkonomi: {
              penghasilanOrtu: sd.kondisiEkonomi?.penghasilanOrtu || '',
              statusKepemilikanRumah: sd.kondisiEkonomi?.statusKepemilikanRumah || '',
              kondisiDinding: sd.kondisiEkonomi?.kondisiDinding || '',
              kondisiLantai: sd.kondisiEkonomi?.kondisiLantai || '',
              kondisiAtap: sd.kondisiEkonomi?.kondisiAtap || '',
              dayaListrik: sd.kondisiEkonomi?.dayaListrik || '',
              sumberAir: sd.kondisiEkonomi?.sumberAir || '',
              penerimaBantuan: sd.kondisiEkonomi?.penerimaBantuan || [],
              catatanTambahan: sd.kondisiEkonomi?.catatanTambahan || '',
              kategoriEkonomi: sd.kondisiEkonomi?.kategoriEkonomi || 'Belum Ditentukan',
            },
            statusVerifikasi: sd.statusVerifikasi || 'Belum Diverifikasi',
            catatanAdmin: sd.catatanAdmin || '',
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setErrorMsg('Gagal mengambil data siswa. Silakan muat ulang halaman.');
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, [user]);

  // Hitung persentase kelengkapan data
  const calculateCompleteness = () => {
    let filled = 0;
    const total = 10;
    if (formData.nama) filled++;
    if (formData.kelas) filled++;
    if (formData.noHp) filled++;
    if (formData.alamat.jalan && formData.alamat.kabupatenKota) filled++;
    if (formData.fotoRumah) filled++;
    if (formData.kondisiKeluarga.namaAyah || formData.kondisiKeluarga.namaIbu) filled++;
    if (formData.kondisiKeluarga.pekerjaanAyah || formData.kondisiKeluarga.pekerjaanIbu) filled++;
    if (formData.kondisiEkonomi.penghasilanOrtu) filled++;
    if (formData.kondisiEkonomi.statusKepemilikanRumah) filled++;
    if (formData.kondisiEkonomi.dayaListrik) filled++;
    return Math.round((filled / total) * 100);
  };

  const completeness = calculateCompleteness();

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung deteksi lokasi otomatis.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const gmapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setFormData((prev) => ({
          ...prev,
          alamat: {
            ...prev.alamat,
            googleMapsUrl: gmapsLink,
          },
        }));
        setSuccessMsg('Titik koordinat berhasil didapatkan dari GPS Anda!');
        setTimeout(() => setSuccessMsg(''), 4000);
      },
      (err) => {
        alert('Gagal mengambil lokasi: ' + err.message);
      }
    );
  };

  const handleBantuanToggle = (item) => {
    setFormData((prev) => {
      const current = prev.kondisiEkonomi.penerimaBantuan || [];
      const updated = current.includes(item)
        ? current.filter((b) => b !== item)
        : [...current, item];
      return {
        ...prev,
        kondisiEkonomi: {
          ...prev.kondisiEkonomi,
          penerimaBantuan: updated,
        },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await api.student.updateProfile(formData);
      if (res.studentData) {
        updateUserProfile({ nama: formData.nama });
        setFormData((prev) => ({
          ...prev,
          kondisiEkonomi: {
            ...prev.kondisiEkonomi,
            kategoriEkonomi: res.studentData.kondisiEkonomi?.kategoriEkonomi || prev.kondisiEkonomi.kategoriEkonomi,
          },
        }));
      }

      setSuccessMsg('Data kondisi ekonomi dan tempat tinggal Anda berhasil disimpan!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan data.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--primary)' }}>
          Memuat data siswa Anda...
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          color: 'white',
          marginBottom: '1.75rem',
          border: 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-primary" style={{ background: 'rgba(37, 99, 235, 0.25)', color: '#93c5fd', border: 'none' }}>
                <User size={13} /> NISN: {formData.nisn}
              </span>
              {formData.statusVerifikasi === 'Terverifikasi' && (
                <span className="badge badge-success">
                  <CheckCircle size={13} /> Terverifikasi Admin
                </span>
              )}
              {formData.statusVerifikasi === 'Belum Diverifikasi' && (
                <span className="badge badge-warning">
                  <Clock size={13} /> Menunggu Verifikasi
                </span>
              )}
              {formData.statusVerifikasi === 'Perlu Perbaikan' && (
                <span className="badge badge-danger">
                  <ShieldAlert size={13} /> Perlu Perbaikan
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              Halo, {formData.nama || 'Siswa'}!
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: '600px', marginTop: '0.25rem' }}>
              Silakan lengkapi formulir di bawah ini dengan data kondisi keluarga, ekonomi orang tua, alamat tempat tinggal saat ini, dan unggah foto tampak depan rumah terbaru.
            </p>
          </div>

          <div style={{ textAlign: 'right', minWidth: '180px' }}>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>
              Kelengkapan Berkas
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: completeness === 100 ? '#34d399' : '#60a5fa' }}>
              {completeness}%
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '999px',
                overflow: 'hidden',
                marginTop: '4px',
              }}
            >
              <div
                style={{
                  width: `${completeness}%`,
                  height: '100%',
                  background: completeness === 100 ? '#10b981' : '#3b82f6',
                  borderRadius: '999px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alert Status Verifikasi Khusus */}
      {formData.statusVerifikasi === 'Perlu Perbaikan' && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <ShieldAlert size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Catatan dari Administrator:</strong>
            <p style={{ marginTop: '0.25rem' }}>{formData.catatanAdmin || 'Mohon periksa dan lengkapi kembali data kondisi ekonomi dan foto rumah Anda.'}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle size={20} style={{ flexShrink: 0 }} />
          <div>{successMsg}</div>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'pribadi' ? 'active' : ''}`}
          onClick={() => setActiveTab('pribadi')}
        >
          <User size={16} /> Identitas Diri
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'alamat' ? 'active' : ''}`}
          onClick={() => setActiveTab('alamat')}
        >
          <MapPin size={16} /> Alamat Saat Ini
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'foto' ? 'active' : ''}`}
          onClick={() => setActiveTab('foto')}
        >
          <Camera size={16} /> Foto Rumah Terbaru
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'keluarga' ? 'active' : ''}`}
          onClick={() => setActiveTab('keluarga')}
        >
          <Users size={16} /> Kondisi Orang Tua
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'ekonomi' ? 'active' : ''}`}
          onClick={() => setActiveTab('ekonomi')}
        >
          <DollarSign size={16} /> Kondisi Ekonomi
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* TAB 1: IDENTITAS DIRI */}
        {activeTab === 'pribadi' && (
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">
                  <User size={20} color="var(--primary)" /> Data Identitas Siswa
                </h2>
                <p className="card-description">
                  Informasi data pribadi dan kelas siswa di sekolah
                </p>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">NISN (Nomor Induk Siswa Nasional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nisn}
                  disabled
                />
                <div className="form-help">NISN terdaftar otomatis dari akun Anda.</div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Nama Lengkap Siswa <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Masukkan nama lengkap siswa"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jenis Kelamin</label>
                <select
                  className="form-select"
                  value={formData.jenisKelamin}
                  onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                >
                  <option value="">-- Pilih Jenis Kelamin --</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Kelas</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.kelas}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                  placeholder="Contoh: XII TKJ 1 / XI MIPA 2"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jurusan / Program Keahlian</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.jurusan}
                  onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                  placeholder="Contoh: Rekayasa Perangkat Lunak / Akuntansi / IPA"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nomor WhatsApp / HP Aktif</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.noHp}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  placeholder="Contoh: 081234567890"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALAMAT SAAT INI */}
        {activeTab === 'alamat' && (
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">
                  <MapPin size={20} color="var(--primary)" /> Alamat Tempat Tinggal Saat Ini
                </h2>
                <p className="card-description">
                  Masukkan alamat domisili atau tempat tinggal siswa saat ini
                </p>
              </div>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="btn btn-sm btn-outline-primary"
              >
                <MapPin size={14} /> Ambil Titik GPS Saya
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">
                Alamat Jalan / Dusun / Gang / Nomor Rumah <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                className="form-textarea"
                value={formData.alamat.jalan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    alamat: { ...formData.alamat, jalan: e.target.value },
                  })
                }
                placeholder="Contoh: Jl. Merdeka No. 45 RT 02 RW 04 Dusun Karanganyar"
                rows={2}
                required
              />
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">RT / RW</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.alamat.rtRw}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alamat: { ...formData.alamat, rtRw: e.target.value },
                    })
                  }
                  placeholder="Contoh: 03/05"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kelurahan / Desa</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.alamat.kelurahan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alamat: { ...formData.alamat, kelurahan: e.target.value },
                    })
                  }
                  placeholder="Contoh: Sukamaju"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kecamatan</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.alamat.kecamatan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alamat: { ...formData.alamat, kecamatan: e.target.value },
                    })
                  }
                  placeholder="Contoh: Karanganyar"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Kabupaten / Kota <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.alamat.kabupatenKota}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alamat: { ...formData.alamat, kabupatenKota: e.target.value },
                    })
                  }
                  placeholder="Contoh: Kabupaten Magelang / Kota Jakarta"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Provinsi</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.alamat.provinsi}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alamat: { ...formData.alamat, provinsi: e.target.value },
                    })
                  }
                  placeholder="Contoh: Jawa Tengah"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kode Pos</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.alamat.kodePos}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alamat: { ...formData.alamat, kodePos: e.target.value },
                    })
                  }
                  placeholder="Contoh: 56192"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label">Link Google Maps / Titik Koordinat Rumah</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  value={formData.alamat.googleMapsUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alamat: { ...formData.alamat, googleMapsUrl: e.target.value },
                    })
                  }
                  placeholder="Contoh: https://maps.google.com/?q=-7.12345,110.12345 atau klik tombol 'Ambil Titik GPS Saya'"
                />
                {formData.alamat.googleMapsUrl && (
                  <a
                    href={formData.alamat.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0 }}
                  >
                    <ExternalLink size={15} /> Buka Peta
                  </a>
                )}
              </div>
              <div className="form-help">
                Memudahkan pihak sekolah untuk survei atau verifikasi tempat tinggal.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FOTO RUMAH TERBARU */}
        {activeTab === 'foto' && (
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">
                  <Camera size={20} color="var(--primary)" /> Foto Rumah Terbaru
                </h2>
                <p className="card-description">
                  Unggah foto tampak depan rumah terbaru yang memperlihatkan kondisi fisik tempat tinggal
                </p>
              </div>
            </div>

            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <ImageUploader
                value={formData.fotoRumah}
                onChange={(b64) => setFormData({ ...formData, fotoRumah: b64 })}
                label="Unggah Foto Tampak Depan Rumah"
              />

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginTop: '1.25rem',
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                }}
              >
                <strong>Panduan Foto Rumah yang Baik:</strong>
                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>Ambil foto dari arah depan rumah pada siang hari agar terlihat jelas.</li>
                  <li>Pastikan bagian atap, dinding utama, dan pintu/jendela terlihat.</li>
                  <li>Foto akan otomatis dioptimalkan agar ringan dan tidak memakan kuota Anda.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: KONDISI ORANG TUA & KELUARGA */}
        {activeTab === 'keluarga' && (
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">
                  <Users size={20} color="var(--primary)" /> Data Orang Tua & Kondisi Keluarga
                </h2>
                <p className="card-description">
                  Informasi keberadaan dan pekerjaan orang tua atau wali siswa
                </p>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Status Orang Tua <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.kondisiKeluarga.statusOrangTua}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kondisiKeluarga: {
                        ...formData.kondisiKeluarga,
                        statusOrangTua: e.target.value,
                      },
                    })
                  }
                  required
                >
                  <option value="Lengkap">Lengkap (Ayah & Ibu masih ada)</option>
                  <option value="Yatim">Yatim (Ayah sudah meninggal / tiada)</option>
                  <option value="Piatu">Piatu (Ibu sudah meninggal / tiada)</option>
                  <option value="Yatim Piatu">Yatim Piatu (Kedua orang tua sudah tiada)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status Siswa dalam Keluarga</label>
                <select
                  className="form-select"
                  value={formData.kondisiKeluarga.statusAnak}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kondisiKeluarga: {
                        ...formData.kondisiKeluarga,
                        statusAnak: e.target.value,
                      },
                    })
                  }
                >
                  <option value="Anak Kandung">Anak Kandung</option>
                  <option value="Anak Tiri">Anak Tiri</option>
                  <option value="Anak Angkat / Asuh">Anak Angkat / Asuh</option>
                  <option value="Menumpang Kerabat">Menumpang Kerabat / Wali</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nama Ayah / Wali</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.kondisiKeluarga.namaAyah}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kondisiKeluarga: {
                        ...formData.kondisiKeluarga,
                        namaAyah: e.target.value,
                      },
                    })
                  }
                  placeholder="Masukkan nama ayah / wali"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pekerjaan Ayah / Wali</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.kondisiKeluarga.pekerjaanAyah}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kondisiKeluarga: {
                        ...formData.kondisiKeluarga,
                        pekerjaanAyah: e.target.value,
                      },
                    })
                  }
                  placeholder="Contoh: Buruh Harian / Petani / Pedagang / Wiraswasta"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nama Ibu</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.kondisiKeluarga.namaIbu}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kondisiKeluarga: {
                        ...formData.kondisiKeluarga,
                        namaIbu: e.target.value,
                      },
                    })
                  }
                  placeholder="Masukkan nama ibu"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pekerjaan Ibu</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.kondisiKeluarga.pekerjaanIbu}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kondisiKeluarga: {
                        ...formData.kondisiKeluarga,
                        pekerjaanIbu: e.target.value,
                      },
                    })
                  }
                  placeholder="Contoh: Ibu Rumah Tangga / Buruh Cuci / Pedagang"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jumlah Tanggungan Keluarga (Anak / Saudara)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  className="form-input"
                  value={formData.kondisiKeluarga.jumlahTanggungan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kondisiKeluarga: {
                        ...formData.kondisiKeluarga,
                        jumlahTanggungan: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                />
                <div className="form-help">Jumlah anak atau saudara yang masih ditanggung orang tua.</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: KONDISI EKONOMI & FASILITAS */}
        {activeTab === 'ekonomi' && (
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">
                  <DollarSign size={20} color="var(--primary)" /> Kondisi Ekonomi & Fasilitas Rumah
                </h2>
                <p className="card-description">
                  Data penghasilan orang tua, kondisi fisik rumah, dan bantuan sosial
                </p>
              </div>
              {formData.kondisiEkonomi.kategoriEkonomi && formData.kondisiEkonomi.kategoriEkonomi !== 'Belum Ditentukan' && (
                <span className={`badge ${
                  formData.kondisiEkonomi.kategoriEkonomi === 'Kurang Mampu' ? 'badge-danger' :
                  formData.kondisiEkonomi.kategoriEkonomi === 'Menengah Bawah' ? 'badge-warning' :
                  formData.kondisiEkonomi.kategoriEkonomi === 'Menengah' ? 'badge-primary' : 'badge-success'
                }`}>
                  <Sparkles size={13} /> Status: {formData.kondisiEkonomi.kategoriEkonomi}
                </span>
              )}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Total Penghasilan Orang Tua per Bulan <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.kondisiEkonomi.penghasilanOrtu}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kondisiEkonomi: {
                        ...formData.kondisiEkonomi,
                        penghasilanOrtu: e.target.value,
                      },
                    })
                  }
                  required
                >
                  <option value="">-- Pilih Range Penghasilan --</option>
                  <option value="< Rp 1.000.000">Kurang dari Rp 1.000.000</option>
                  <option value="Rp 1.000.000 - Rp 2.500.000">Rp 1.000.000 - Rp 2.500.000</option>
                  <option value="Rp 2.500.000 - Rp 5.000.000">Rp 2.500.000 - Rp 5.000.000</option>
                  <option value="> Rp 5.000.000">Di atas Rp 5.000.000</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status Kepemilikan Rumah</label>
                <select
                  className="form-select"
                  value={formData.kondisiEkonomi.statusKepemilikanRumah}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kondisiEkonomi: {
                        ...formData.kondisiEkonomi,
                        statusKepemilikanRumah: e.target.value,
                      },
                    })
                  }
                >
                  <option value="">-- Pilih Status Rumah --</option>
                  <option value="Milik Sendiri">Milik Sendiri</option>
                  <option value="Sewa / Kontrak">Sewa / Kontrak</option>
                  <option value="Menumpang / Keluarga">Menumpang / Milik Keluarga / Kerabat</option>
                  <option value="Rumah Dinas">Rumah Dinas</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Kondisi Dinding Rumah</label>
                <select
                  className="form-select"
                  value={formData.kondisiEkonomi.kondisiDinding}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kondisiEkonomi: {
                        ...formData.kondisiEkonomi,
                        kondisiDinding: e.target.value,
                      },
                    })
                  }
                >
                  <option value="">-- Pilih Kondisi Dinding --</option>
                  <option value="Tembok Permanen (Bata/Plester)">Tembok Permanen (Bata/Plester)</option>
                  <option value="Semi Permanen">Semi Permanen (Setengah Tembok / Papan)</option>
                  <option value="Kayu / Papan">Kayu / Papan</option>
                  <option value="Anyaman Bambu / Gedek">Anyaman Bambu / Gedek</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Kondisi Lantai Rumah</label>
                <select
                  className="form-select"
                  value={formData.kondisiEkonomi.kondisiLantai}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kondisiEkonomi: {
                        ...formData.kondisiEkonomi,
                        kondisiLantai: e.target.value,
                      },
                    })
                  }
                >
                  <option value="">-- Pilih Kondisi Lantai --</option>
                  <option value="Keramik / Granit">Keramik / Granit</option>
                  <option value="Ubin / Semen Biasa">Ubin / Plester Semen Biasa</option>
                  <option value="Kayu / Papan">Kayu / Papan</option>
                  <option value="Tanah">Tanah</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Kondisi Atap Rumah</label>
                <select
                  className="form-select"
                  value={formData.kondisiEkonomi.kondisiAtap}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kondisiEkonomi: {
                        ...formData.kondisiEkonomi,
                        kondisiAtap: e.target.value,
                      },
                    })
                  }
                >
                  <option value="">-- Pilih Kondisi Atap --</option>
                  <option value="Genteng Baik">Genteng dalam kondisi baik</option>
                  <option value="Seng / Asbes">Seng / Asbes</option>
                  <option value="Genteng Rusak / Rawan Bocor">Genteng Rusak / Rawan Bocor</option>
                  <option value="Rumbia / Daun / Lainnya">Rumbia / Ijuk / Lainnya</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Daya Listrik Rumah</label>
                <select
                  className="form-select"
                  value={formData.kondisiEkonomi.dayaListrik}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kondisiEkonomi: {
                        ...formData.kondisiEkonomi,
                        dayaListrik: e.target.value,
                      },
                    })
                  }
                >
                  <option value="">-- Pilih Daya Listrik --</option>
                  <option value="450 VA">450 VA (Subsidi)</option>
                  <option value="900 VA">900 VA</option>
                  <option value="1300 VA">1300 VA</option>
                  <option value="> 1300 VA">Di atas 1300 VA</option>
                  <option value="Menumpang Listrik Tetangga">Menumpang Tetangga</option>
                  <option value="Tanpa Listrik">Tidak Ada Listrik</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Sumber Air Bersih</label>
                <select
                  className="form-select"
                  value={formData.kondisiEkonomi.sumberAir}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kondisiEkonomi: {
                        ...formData.kondisiEkonomi,
                        sumberAir: e.target.value,
                      },
                    })
                  }
                >
                  <option value="">-- Pilih Sumber Air --</option>
                  <option value="PDAM">PDAM</option>
                  <option value="Sumur Bor Pribadi">Sumur Bor / Pompa Pribadi</option>
                  <option value="Sumur Bersama">Sumur Gali / Bersama</option>
                  <option value="Mata Air / Sungai">Mata Air Alami / Sungai</option>
                  <option value="Beli Air Eceran">Membeli Air Bersih / Tangki</option>
                </select>
              </div>
            </div>

            {/* Checkbox Bantuan Sosial */}
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Program Bantuan Sosial Pemerintah yang Diterima:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                {[
                  { id: 'KIP', label: 'KIP (Kartu Indonesia Pintar / PIP)' },
                  { id: 'PKH', label: 'PKH (Program Keluarga Harapan)' },
                  { id: 'KKS', label: 'KKS / BPNT (Kartu Sembako)' },
                  { id: 'SKTM', label: 'Surat Keterangan Tidak Mampu' },
                  { id: 'Bantuan Daerah', label: 'Bantuan Beasiswa Daerah / Baznas' },
                ].map((item) => {
                  const checked = (formData.kondisiEkonomi.penerimaBantuan || []).includes(item.id);
                  return (
                    <label
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '0.625rem 0.875rem',
                        background: checked ? 'var(--primary-light)' : '#f8fafc',
                        border: `1px solid ${checked ? 'var(--primary-border)' : 'var(--border-color)'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        fontWeight: checked ? 600 : 500,
                        color: checked ? 'var(--primary)' : 'inherit',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleBantuanToggle(item.id)}
                      />
                      {item.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">Catatan Tambahan Mengenai Kondisi Keluarga / Rumah</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={formData.kondisiEkonomi.catatanTambahan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kondisiEkonomi: {
                      ...formData.kondisiEkonomi,
                      catatanTambahan: e.target.value,
                    },
                  })
                }
                placeholder="Tuliskan keterangan lain jika ada (misal: orang tua sedang sakit, tinggal bersama kakek/nenek, rumah sewa bulanan, dll.)"
              />
            </div>
          </div>
        )}

        {/* Action Button Bar */}
        <div
          style={{
            marginTop: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'white',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Pastikan data yang diisikan jujur dan sesuai dengan kondisi tempat tinggal saat ini.
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-lg"
          >
            {saving ? (
              'Menyimpan Data...'
            ) : (
              <>
                <Save size={18} /> Simpan & Perbarui Data
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

