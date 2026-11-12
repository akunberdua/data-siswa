const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seedAdmin() {
  try {
    const adminExists = await User.findOne({
      $or: [{ role: 'admin' }, { nisn: 'admin' }],
    });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await User.create({
        nisn: 'admin',
        nama: 'Administrator Sekolah',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('✅ Default admin account created: admin / admin123');
    }
  } catch (error) {
    console.error('Seed admin error:', error.message);
  }
}

module.exports = seedAdmin;

