const express = require('express');
const StudentData = require('../models/StudentData');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get Student Profile & Data
router.get('/profile', verifyToken, async (req, res) => {
  try {
    let studentData = await StudentData.findOne({ userId: req.user.id });

    if (!studentData) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Data pengguna tidak ditemukan' });
      }
      studentData = await StudentData.create({
        userId: req.user.id,
        nisn: user.nisn,
        nama: user.nama,
      });
    }

    return res.json({ studentData });
  } catch (error) {
    console.error('Get student profile error:', error);
    return res.status(500).json({ message: 'Gagal memuat profil siswa', error: error.message });
  }
});

// Update Student Profile & Data
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const {
      nama,
      jenisKelamin,
      kelas,
      jurusan,
      noHp,
      alamat,
      fotoRumah,
      kondisiKeluarga,
      kondisiEkonomi,
    } = req.body;

    let studentData = await StudentData.findOne({ userId: req.user.id });

    if (!studentData) {
      const user = await User.findById(req.user.id);
      studentData = new StudentData({
        userId: req.user.id,
        nisn: user?.nisn || req.user.nisn,
        nama: user?.nama || req.user.nama,
      });
    }

    // Update basic info
    if (nama && nama.trim()) {
      studentData.nama = nama.trim();
      await User.findByIdAndUpdate(req.user.id, { nama: nama.trim() });
    }
    if (jenisKelamin !== undefined) studentData.jenisKelamin = jenisKelamin;
    if (kelas !== undefined) studentData.kelas = kelas.trim();
    if (jurusan !== undefined) studentData.jurusan = jurusan.trim();
    if (noHp !== undefined) studentData.noHp = noHp.trim();

    // Update Alamat
    if (alamat) {
      studentData.alamat = {
        jalan: alamat.jalan || studentData.alamat?.jalan || '',
        rtRw: alamat.rtRw || studentData.alamat?.rtRw || '',
        kelurahan: alamat.kelurahan || studentData.alamat?.kelurahan || '',
        kecamatan: alamat.kecamatan || studentData.alamat?.kecamatan || '',
        kabupatenKota: alamat.kabupatenKota || studentData.alamat?.kabupatenKota || '',
        provinsi: alamat.provinsi || studentData.alamat?.provinsi || '',
        kodePos: alamat.kodePos || studentData.alamat?.kodePos || '',
        googleMapsUrl: alamat.googleMapsUrl || studentData.alamat?.googleMapsUrl || '',
      };
    }

    // Update Foto Rumah jika dikirim
    if (fotoRumah !== undefined) {
      studentData.fotoRumah = fotoRumah;
    }

    // Update Kondisi Keluarga
    if (kondisiKeluarga) {
      studentData.kondisiKeluarga = {
        statusOrangTua: kondisiKeluarga.statusOrangTua || studentData.kondisiKeluarga?.statusOrangTua || 'Lengkap',
        namaAyah: kondisiKeluarga.namaAyah !== undefined ? kondisiKeluarga.namaAyah.trim() : (studentData.kondisiKeluarga?.namaAyah || ''),
        pekerjaanAyah: kondisiKeluarga.pekerjaanAyah !== undefined ? kondisiKeluarga.pekerjaanAyah.trim() : (studentData.kondisiKeluarga?.pekerjaanAyah || ''),
        namaIbu: kondisiKeluarga.namaIbu !== undefined ? kondisiKeluarga.namaIbu.trim() : (studentData.kondisiKeluarga?.namaIbu || ''),
        pekerjaanIbu: kondisiKeluarga.pekerjaanIbu !== undefined ? kondisiKeluarga.pekerjaanIbu.trim() : (studentData.kondisiKeluarga?.pekerjaanIbu || ''),
        jumlahTanggungan: Number(kondisiKeluarga.jumlahTanggungan) || 0,
        statusAnak: kondisiKeluarga.statusAnak || studentData.kondisiKeluarga?.statusAnak || 'Anak Kandung',
      };
    }

    // Update Kondisi Ekonomi
    if (kondisiEkonomi) {
      studentData.kondisiEkonomi = {
        ...studentData.kondisiEkonomi,
        penghasilanOrtu: kondisiEkonomi.penghasilanOrtu || studentData.kondisiEkonomi?.penghasilanOrtu || '',
        statusKepemilikanRumah: kondisiEkonomi.statusKepemilikanRumah || studentData.kondisiEkonomi?.statusKepemilikanRumah || '',
        kondisiDinding: kondisiEkonomi.kondisiDinding || studentData.kondisiEkonomi?.kondisiDinding || '',
        kondisiLantai: kondisiEkonomi.kondisiLantai || studentData.kondisiEkonomi?.kondisiLantai || '',
        kondisiAtap: kondisiEkonomi.kondisiAtap || studentData.kondisiEkonomi?.kondisiAtap || '',
        dayaListrik: kondisiEkonomi.dayaListrik || studentData.kondisiEkonomi?.dayaListrik || '',
        sumberAir: kondisiEkonomi.sumberAir || studentData.kondisiEkonomi?.sumberAir || '',
        penerimaBantuan: Array.isArray(kondisiEkonomi.penerimaBantuan)
          ? kondisiEkonomi.penerimaBantuan
          : (studentData.kondisiEkonomi?.penerimaBantuan || []),
        catatanTambahan: kondisiEkonomi.catatanTambahan !== undefined ? kondisiEkonomi.catatanTambahan.trim() : (studentData.kondisiEkonomi?.catatanTambahan || ''),
      };

      // Hitung kategori ekonomi otomatis
      const calculatedCategory = studentData.calculateEconomicCategory();
      studentData.kondisiEkonomi.kategoriEkonomi = calculatedCategory;
    }

    await studentData.save();

    return res.json({
      message: 'Data siswa berhasil diperbarui',
      studentData,
    });
  } catch (error) {
    console.error('Update student profile error:', error);
    return res.status(500).json({ message: 'Gagal menyimpan data siswa', error: error.message });
  }
});

module.exports = router;
