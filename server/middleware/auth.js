const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'data_siswa_jwt_secret_key_2026_secured';

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Akses ditolak: Token autentikasi tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak: Anda tidak memiliki hak akses Administrator' });
  }
  next();
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      nisn: user.nisn,
      nama: user.nama,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = {
  verifyToken,
  requireAdmin,
  generateToken,
};
