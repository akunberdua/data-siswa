# SIPENDIK - Sistem Pendataan Data Siswa, Kondisi Ekonomi & Rumah

SIPENDIK adalah sistem berbasis web fullstack yang dirancang untuk mengumpulkan dan memverifikasi data siswa, kondisi ekonomi keluarga/orang tua, alamat domisili terkini, serta foto terbaru tampak depan tempat tinggal siswa.

Sistem ini memiliki 2 hak akses (role):
1. **Siswa**: Melakukan pendaftaran/login dengan NISN, mengisi data diri, kondisi keluarga & pekerjaan orang tua, penghasilan ekonomi, alamat domisili saat ini (dengan fitur koordinat GPS), dan mengunggah foto terbaru rumahnya (terkompresi otomatis).
2. **Administrator**: Memantau kondisi siswa melalui URL `/admin`, memfilter berdasarkan kategori kelayakan ekonomi (Kurang Mampu, Menengah, Mampu), memeriksa alamat tempat tinggal & foto rumah, memverifikasi data siswa, serta mengekspor rekapitulasi data ke CSV/Excel.

---

## 🌟 Fitur Utama

### 1. Autentikasi 2 Role (Siswa & Admin)
- **Registrasi Siswa**: Menggunakan NISN, Nama Lengkap, dan Password.
- **Login Siswa**: Menggunakan NISN dan Password.
- **Login Administrator**: Khusus pengelola sekolah / admin melalui tab login admin atau akses langsung ke URL `/admin`.
- **Akun Admin Default**:
  - **Username/NISN**: `admin`
  - **Password**: `admin123`
  - *(Dibuat otomatis ke database saat pertama kali aplikasi dijalankan)*

### 2. Dashboard Siswa
- **Identitas Diri**: NISN, Nama, Jenis Kelamin, Kelas, Jurusan, Nomor WhatsApp.
- **Alamat Tempat Tinggal Saat Ini**: Jalan/Dusun/No Rumah, RT/RW, Kelurahan, Kecamatan, Kabupaten/Kota, Kode Pos, serta tombol pintar **"Ambil Titik GPS Saya"** untuk mendapatkan koordinat Google Maps secara otomatis.
- **Unggah Foto Rumah Terbaru**: Mendukung pengambilan langsung via kamera HP atau unggah file gambar, dilengkapi kompresi cerdas di sisi browser agar hemat kuota dan proses upload cepat.
- **Kondisi Orang Tua & Keluarga**: Status keberadaan orang tua (Lengkap, Yatim, Piatu, Yatim Piatu), pekerjaan ayah & ibu, jumlah tanggungan anak.
- **Kondisi Ekonomi & Fasilitas**: Range penghasilan bulanan orang tua, status kepemilikan rumah (milik sendiri/sewa/kontrak/menumpang), kondisi fisik (dinding, lantai, atap, daya listrik, sumber air), dan kepemilikan kartu bantuan pemerintah (KIP, PKH, KKS, dll).
- **Indikator Progres**: Menampilkan persentase kelengkapan data & status verifikasi dari admin.

### 3. Dashboard Administrator (`/admin`)
- **Akses URL Khusus**: Hanya dapat diakses melalui URL `/admin` dengan kredensial administrator.
- **Statistik & Analisis**: Ringkasan jumlah siswa terdata, jumlah kategori Kurang Mampu / Prioritas, Menengah Bawah, Menengah, Mampu, serta penerima bantuan pemerintah.
- **Pencarian Cepat & Multi-Filter**: Pencarian berdasarkan Nama, NISN, Jalan, Kecamatan, Kabupaten, atau Kelas. Filter status ekonomi, status orang tua (anak yatim/piatu), dan status verifikasi berkas.
- **Tampilan Fleksibel**: Dapat beralih antara **Tampilan Kartu Foto** (visual rumah tampak depan) dan **Tampilan Tabel Data**.
- **Modal Detail Lengkap**: Melihat foto rumah resolusi tinggi, membuka rute lokasi rumah di Google Maps, dan meninjau seluruh data ekonomi siswa.
- **Tindakan Admin**:
  - Memperbarui status verifikasi (*Terverifikasi*, *Perlu Perbaikan*, *Belum Diverifikasi*).
  - Memberikan catatan verifikasi yang dapat dibaca oleh siswa.
  - Melakukan penyesuaian kategori ekonomi siswa.
  - Ekspor seluruh rekap data ke format **CSV / Excel**.
  - Cetak formulir rekapitulasi data siswa siap print.

---

## 🛠️ Arsitektur Teknologi

- **Frontend**: React 19, Vite, React Router DOM, Lucide Icons, Modern Responsive CSS.
- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose, JWT (JSON Web Token), BcryptJS.
- **Hosting Ready**: Dioptimalkan penuh untuk **Vercel** (Frontend SPA + Serverless API Functions via `/api/index.js`).

---

## 🚀 Panduan Menjalankan Secara Lokal

### Prasyarat:
- Node.js (v18+)
- Akun MongoDB Atlas

### 1. Clone Repository & Masuk ke Folder
```bash
git clone https://github.com/akunberdua/data-siswa.git
cd data-siswa
```

### 2. Atur Environment Variable
Buat file `.env` di dalam folder `server/` (atau salin dari `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.gdmjnoz.mongodb.net/data-siswa?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_data_siswa_2026
```

### 3. Jalankan Server Backend
```bash
cd server
npm install
npm run dev
# Server berjalan di http://localhost:5000
```

### 4. Jalankan Client Frontend (di terminal baru)
```bash
cd client
npm install
npm run dev
# Frontend berjalan di http://localhost:5173
```
Buka browser di `http://localhost:5173` untuk mengakses aplikasi.

---

## ☁️ Panduan Hosting di Vercel

Aplikasi ini sudah dilengkapi konfigurasi `vercel.json` dan arsitektur serverless function di `/api/index.js`, sehingga dapat di-deploy ke Vercel hanya dalam beberapa langkah:

1. **Buka Dashboard Vercel**: Masuk ke [vercel.com](https://vercel.com) dan klik **"Add New" > "Project"**.
2. **Pilih Repository**: Hubungkan dan pilih repository GitHub `data-siswa`.
3. **Konfigurasi Project**:
   - **Framework Preset**: Pilih `Vite` (atau `Other`).
   - **Root Directory**: Biarkan `./` (Root project).
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`
4. **Environment Variables**:
   Tambahkan variabel lingkungan berikut di Vercel Settings:
   - `MONGO_URI`: String koneksi MongoDB Atlas Anda (contoh: `mongodb+srv://hasrul0429_db_user:admin123@cluster0.gdmjnoz.mongodb.net/data-siswa?retryWrites=true&w=majority`)
   - `JWT_SECRET`: `super_secret_jwt_key_data_siswa_2026` (atau kunci rahasia pilihan Anda)
5. **Deploy**: Klik tombol **"Deploy"**.
6. Selesai! Aplikasi Anda langsung aktif dan dapat diakses publik.

---

## 👤 Akun Pengujian

- **Akun Siswa**: Daftarkan akun baru melalui tombol **"Daftar Siswa"** dengan memasukkan NISN, Nama, dan Password Anda.
- **Akun Administrator**:
  - Akses URL: `/admin` atau klik **"Portal Admin"** di menu navigasi.
  - Username: `admin`
  - Password: `admin123`

