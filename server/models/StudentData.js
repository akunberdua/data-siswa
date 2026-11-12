const mongoose = require('mongoose');

const studentDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    nisn: {
      type: String,
      required: true,
      trim: true,
    },
    nama: {
      type: String,
      required: true,
      trim: true,
    },
    jenisKelamin: {
      type: String,
      enum: ['Laki-laki', 'Perempuan', ''],
      default: '',
    },
    kelas: {
      type: String,
      default: '',
      trim: true,
    },
    jurusan: {
      type: String,
      default: '',
      trim: true,
    },
    noHp: {
      type: String,
      default: '',
      trim: true,
    },

    // Alamat Saat Ini
    alamat: {
      jalan: { type: String, default: '', trim: true },
      rtRw: { type: String, default: '', trim: true },
      kelurahan: { type: String, default: '', trim: true },
      kecamatan: { type: String, default: '', trim: true },
      kabupatenKota: { type: String, default: '', trim: true },
      provinsi: { type: String, default: '', trim: true },
      kodePos: { type: String, default: '', trim: true },
      googleMapsUrl: { type: String, default: '', trim: true },
    },

    // Foto Rumah Terbaru (Base64 data URI format)
    fotoRumah: {
      type: String,
      default: '',
    },

    // Kondisi Keluarga & Orang Tua
    kondisiKeluarga: {
      statusOrangTua: {
        type: String,
        enum: ['Lengkap', 'Yatim', 'Piatu', 'Yatim Piatu', ''],
        default: 'Lengkap',
      },
      namaAyah: { type: String, default: '', trim: true },
      pekerjaanAyah: { type: String, default: '', trim: true },
      namaIbu: { type: String, default: '', trim: true },
      pekerjaanIbu: { type: String, default: '', trim: true },
      jumlahTanggungan: { type: Number, default: 0 },
      statusAnak: { type: String, default: 'Anak Kandung', trim: true },
    },

    // Kondisi Ekonomi
    kondisiEkonomi: {
      penghasilanOrtu: {
        type: String,
        enum: [
          '< Rp 1.000.000',
          'Rp 1.000.000 - Rp 2.500.000',
          'Rp 2.500.000 - Rp 5.000.000',
          '> Rp 5.000.000',
          '',
        ],
        default: '',
      },
      statusKepemilikanRumah: {
        type: String,
        enum: [
          'Milik Sendiri',
          'Sewa / Kontrak',
          'Menumpang / Keluarga',
          'Rumah Dinas',
          'Lainnya',
          '',
        ],
        default: '',
      },
      kondisiDinding: { type: String, default: '' },
      kondisiLantai: { type: String, default: '' },
      kondisiAtap: { type: String, default: '' },
      dayaListrik: { type: String, default: '' },
      sumberAir: { type: String, default: '' },
      penerimaBantuan: [{ type: String }],
      kategoriEkonomi: {
        type: String,
        enum: ['Kurang Mampu', 'Menengah Bawah', 'Menengah', 'Mampu', 'Belum Ditentukan'],
        default: 'Belum Ditentukan',
      },
      catatanTambahan: { type: String, default: '', trim: true },
    },

    // Verifikasi Admin
    statusVerifikasi: {
      type: String,
      enum: ['Belum Diverifikasi', 'Terverifikasi', 'Perlu Perbaikan'],
      default: 'Belum Diverifikasi',
    },
    catatanAdmin: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helper function untuk klasifikasi kategori ekonomi otomatis
studentDataSchema.methods.calculateEconomicCategory = function () {
  let score = 0;

  // Penghasilan Ortu
  if (this.kondisiEkonomi.penghasilanOrtu === '< Rp 1.000.000') score += 1;
  else if (this.kondisiEkonomi.penghasilanOrtu === 'Rp 1.000.000 - Rp 2.500.000') score += 2;
  else if (this.kondisiEkonomi.penghasilanOrtu === 'Rp 2.500.000 - Rp 5.000.000') score += 3;
  else if (this.kondisiEkonomi.penghasilanOrtu === '> Rp 5.000.000') score += 4;
  else score += 2;

  // Status Kepemilikan Rumah
  if (
    this.kondisiEkonomi.statusKepemilikanRumah === 'Menumpang / Keluarga' ||
    this.kondisiEkonomi.statusKepemilikanRumah === 'Sewa / Kontrak'
  ) {
    score -= 0.5;
  }

  // Status Orang Tua
  if (this.kondisiKeluarga.statusOrangTua === 'Yatim Piatu') score -= 1.5;
  else if (
    this.kondisiKeluarga.statusOrangTua === 'Yatim' ||
    this.kondisiKeluarga.statusOrangTua === 'Piatu'
  ) {
    score -= 0.8;
  }

  // Bantuan KIP/PKH
  if (
    this.kondisiEkonomi.penerimaBantuan &&
    this.kondisiEkonomi.penerimaBantuan.length > 0
  ) {
    score -= 0.5;
  }

  // Tanggungan banyak
  if (this.kondisiKeluarga.jumlahTanggungan >= 4) {
    score -= 0.5;
  }

  if (score <= 1.5) return 'Kurang Mampu';
  if (score <= 2.5) return 'Menengah Bawah';
  if (score <= 3.5) return 'Menengah';
  return 'Mampu';
};

module.exports =
  mongoose.models.StudentData || mongoose.model('StudentData', studentDataSchema);

