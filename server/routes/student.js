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
      // Buat data default jika belum ada
      const user = await User.findById(req.user.id);
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
      studentData = new StudentData({
        userId: req.user.id,
        nisn: req.user.nisn,
        nama: req.user.nama,
      });
    }

    // Update basic info
    if (nama) {
      studentData.nama = nama.trim();
      // Update juga di model User
      await User.findByIdAndUpdate(req.user.id, { nama: nama.trim() });
    }
    if (jenisKelamin !== undefined) studentData.jenisKelamin = jenisKelamin;
    if (kelas !== undefined) studentData.kelas = kelas.trim();
    if (jurusan !== undefined) studentData.jurusan = jurusan.trim();
    if (noHp !== undefined) studentData.noHp = noHp.trim();

    // Update Alamat
    if (alamat) {
      studentData.alamat = {
        jalan: alamat.jalan || '',
        rtRw: alamat.rtRw || '',
        kelurahan: alamat.kelurahan || '',
        kecamatan: alamat.kecamatan || '',
        kabupatenKota: alamat.kabupatenKota || '',
        provinsi: alamat.provinsi || '',
        kodePos: alamat.kodePos || '',
        googleMapsUrl: alamat.googleMapsUrl || '',
      };
    }

    // Update Foto Rumah jika ada perubahan
    if (fotoRumah !== undefined) {
      studentData.fotoRumah = fotoRumah;
    }

    // Update Kondisi Keluarga
    if (kondisiKeluarga) {
      studentData.kondisiKeluarga = {
        statusOrangTua: kondisiKeluarga.statusOrangTua || 'Lengkap',
        namaAyah: kondisiKeluarga.namaAyah || '',
        pekerjaanAyah: kondisiKeluarga.pekerjaanAyah || '',
        namaIbu: kondisiKeluarga.namaIbu || '',
        pekerjaanIbu: kondisiKeluarga.pekerjaanIbu || '',
        jumlahTanggungan: Number(kondisiKeluarga.jumlahTanggungan) || 0,
        statusAnak: kondisiKeluarga.statusAnak || 'Anak Kandung',
      };
    }

    // Update Kondisi Ekonomi
    if (kondisiEkonomi) {
      studentData.kondisiEkonomi = {
        ...studentData.kondisiEkonomi,
        penghasilanOrtu: kondisiEkonomi.penghasilanOrtu || '',
        statusKepemilikanRumah: kondisiEkonomi.statusKepemilikanRumah || '',
        kondisiDinding: kondisiEkonomi.kondisiDinding || '',
        kondisiLantai: kondisiEkonomi.kondisiLantai || '',
        kondisiAtap: kondisiEkonomi.kondisiAtap || '',
        dayaListrik: kondisiEkonomi.dayaListrik || '',
        sumberAir: kondisiEkonomi.sumberAir || '',
        penerimaBantuan: Array.isArray(kondisiEkonomi.penerimaBantuan)
          ? kondisiEkonomi.penerimaBantuan
          : [],
        catatanTambahan: kondisiEkonomi.catatanTambahan || '',
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
