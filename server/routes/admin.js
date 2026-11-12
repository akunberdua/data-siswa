const express = require('express');
const mongoose = require('mongoose');
const StudentData = require('../models/StudentData');
const User = require('../models/User');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Middleware: all routes in this router require valid token and admin role
router.use(verifyToken, requireAdmin);

// Helper function to escape special characters in regular expressions
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// Get All Students with Filters & Statistics
router.get('/students', async (req, res) => {
  try {
    const {
      search = '',
      kategoriEkonomi = '',
      statusOrangTua = '',
      statusVerifikasi = '',
      statusBantuan = '',
      sortBy = 'updatedAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = {};

    // Filter Search dengan regex yang aman
    if (search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      const searchRegex = new RegExp(safeSearch, 'i');
      filter.$or = [
        { nama: searchRegex },
        { nisn: searchRegex },
        { kelas: searchRegex },
        { 'alamat.jalan': searchRegex },
        { 'alamat.kelurahan': searchRegex },
        { 'alamat.kecamatan': searchRegex },
        { 'alamat.kabupatenKota': searchRegex },
      ];
    }

    // Filter Kategori Ekonomi
    if (kategoriEkonomi && kategoriEkonomi !== 'Semua') {
      filter['kondisiEkonomi.kategoriEkonomi'] = kategoriEkonomi;
    }

    // Filter Status Orang Tua
    if (statusOrangTua && statusOrangTua !== 'Semua') {
      filter['kondisiKeluarga.statusOrangTua'] = statusOrangTua;
    }

    // Filter Status Verifikasi
    if (statusVerifikasi && statusVerifikasi !== 'Semua') {
      filter.statusVerifikasi = statusVerifikasi;
    }

    // Filter Status Bantuan
    if (statusBantuan === 'Penerima Bantuan') {
      filter['kondisiEkonomi.penerimaBantuan.0'] = { $exists: true };
    } else if (statusBantuan === 'Bukan Penerima') {
      filter['kondisiEkonomi.penerimaBantuan'] = { $size: 0 };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const students = await StudentData.find(filter).sort(sortOptions);

    // Hitung Statistik Keseluruhan
    const allStudents = await StudentData.find({});
    const stats = {
      total: allStudents.length,
      kurangMampu: allStudents.filter(
        (s) =>
          s.kondisiEkonomi &&
          (s.kondisiEkonomi.kategoriEkonomi === 'Kurang Mampu' ||
            s.kondisiEkonomi.kategoriEkonomi === 'Menengah Bawah')
      ).length,
      menengah: allStudents.filter(
        (s) =>
          s.kondisiEkonomi && s.kondisiEkonomi.kategoriEkonomi === 'Menengah'
      ).length,
      mampu: allStudents.filter(
        (s) => s.kondisiEkonomi && s.kondisiEkonomi.kategoriEkonomi === 'Mampu'
      ).length,
      terverifikasi: allStudents.filter(
        (s) => s.statusVerifikasi === 'Terverifikasi'
      ).length,
      belumVerifikasi: allStudents.filter(
        (s) => s.statusVerifikasi === 'Belum Diverifikasi'
      ).length,
      perluPerbaikan: allStudents.filter(
        (s) => s.statusVerifikasi === 'Perlu Perbaikan'
      ).length,
      penerimaBantuan: allStudents.filter(
        (s) =>
          s.kondisiEkonomi &&
          s.kondisiEkonomi.penerimaBantuan &&
          s.kondisiEkonomi.penerimaBantuan.length > 0
      ).length,
      yatimPiatu: allStudents.filter(
        (s) =>
          s.kondisiKeluarga &&
          (s.kondisiKeluarga.statusOrangTua === 'Yatim Piatu' ||
            s.kondisiKeluarga.statusOrangTua === 'Yatim' ||
            s.kondisiKeluarga.statusOrangTua === 'Piatu')
      ).length,
    };

    return res.json({ students, stats });
  } catch (error) {
    console.error('Admin get students error:', error);
    return res
      .status(500)
      .json({ message: 'Gagal memuat data siswa', error: error.message });
  }
});

// Get Single Student Detail
router.get('/students/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID siswa tidak valid' });
    }

    const student = await StudentData.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Data siswa tidak ditemukan' });
    }
    return res.json({ student });
  } catch (error) {
    console.error('Admin get student detail error:', error);
    return res
      .status(500)
      .json({ message: 'Gagal memuat detail siswa', error: error.message });
  }
});

// Update Verification Status & Economic Category
router.put('/students/:id/status', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID siswa tidak valid' });
    }

    const { statusVerifikasi, catatanAdmin, kategoriEkonomi } = req.body;

    const student = await StudentData.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Data siswa tidak ditemukan' });
    }

    if (statusVerifikasi) {
      student.statusVerifikasi = statusVerifikasi;
    }
    if (catatanAdmin !== undefined) {
      student.catatanAdmin = catatanAdmin.trim();
    }
    if (kategoriEkonomi) {
      student.kondisiEkonomi.kategoriEkonomi = kategoriEkonomi;
    }

    await student.save();

    return res.json({
      message: 'Status data siswa berhasil diperbarui',
      student,
    });
  } catch (error) {
    console.error('Admin update status error:', error);
    return res
      .status(500)
      .json({ message: 'Gagal memperbarui status data siswa', error: error.message });
  }
});

// Delete Student
router.delete('/students/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID siswa tidak valid' });
    }

    const student = await StudentData.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Data siswa tidak ditemukan' });
    }

    // Hapus juga akun User terkait
    if (student.userId) {
      await User.findByIdAndDelete(student.userId);
    }

    await StudentData.findByIdAndDelete(req.params.id);

    return res.json({ message: 'Data siswa berhasil dihapus' });
  } catch (error) {
    console.error('Admin delete student error:', error);
    return res
      .status(500)
      .json({ message: 'Gagal menghapus data siswa', error: error.message });
  }
});

module.exports = router;
