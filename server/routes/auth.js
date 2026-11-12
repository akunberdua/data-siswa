const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const StudentData = require('../models/StudentData');
const { verifyToken, generateToken } = require('../middleware/auth');

const router = express.Router();

// Register Siswa
router.post('/register', async (req, res) => {
  try {
    const { nisn, nama, password } = req.body;

    if (!nisn || !nama || !password) {
      return res.status(400).json({ message: 'NISN, Nama, dan Password wajib diisi' });
    }

    const cleanNisn = nisn.trim().toLowerCase();
    const cleanNama = nama.trim();

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    // Cek apakah NISN sudah terdaftar
    const existingUser = await User.findOne({ nisn: cleanNisn });
    if (existingUser) {
      return res.status(400).json({ message: 'NISN sudah terdaftar. Silakan login.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      nisn: cleanNisn,
      nama: cleanNama,
      password: hashedPassword,
      role: 'siswa',
    });

    // Inisialisasi data profil siswa
    await StudentData.create({
      userId: newUser._id,
      nisn: cleanNisn,
      nama: cleanNama,
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user: {
        id: newUser._id,
        nisn: newUser.nisn,
        nama: newUser.nama,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat registrasi', error: error.message });
  }
});

// Login Siswa / Admin
router.post('/login', async (req, res) => {
  try {
    const { nisn, password } = req.body;

    if (!nisn || !password) {
      return res.status(400).json({ message: 'NISN / Username dan Password wajib diisi' });
    }

    const cleanNisn = nisn.trim().toLowerCase();
    const user = await User.findOne({ nisn: cleanNisn });

    if (!user) {
      return res.status(400).json({ message: 'NISN atau Password tidak sesuai' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'NISN atau Password tidak sesuai' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user._id,
        nisn: user.nisn,
        nama: user.nama,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat login', error: error.message });
  }
});

// Get Current User Profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }
    return res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ message: 'Gagal mengambil data user', error: error.message });
  }
});

module.exports = router;
