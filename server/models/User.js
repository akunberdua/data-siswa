const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    nisn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    nama: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['siswa', 'admin'],
      default: 'siswa',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
