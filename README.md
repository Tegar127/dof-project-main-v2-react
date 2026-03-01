# Document Management System (DOF Project)

Sebuah sistem manajemen dokumen cerdas berbasis web untuk pembuatan, persetujuan, dan distribusi dokumen resmi seperti Nota Dinas, SPPD (Surat Perintah Perjalanan Dinas), dan Surat Perjanjian.

## Stack Teknologi

Sistem ini telah dimigrasikan dari arsitektur monolit (Laravel) menjadi arsitektur modern berbasis API:
- **Frontend**: React.js, Vite, Tailwind CSS v4, Lucide React
- **Backend**: Node.js, Express.js (REST API)
- **Database**: PostgreSQL dengan Prisma ORM
- **Fitur Tambahan**: 
  - `react-signature-canvas` untuk tanda tangan digital interaktif
  - `html2pdf.js` & `window.print()` untuk export/cetak dokumen

## Core Features (Fitur Utama)

1. **Pembuatan Dokumen Beragam**
   - Mendukung 3 jenis dokumen bawaan: Nota Dinas, SPPD, dan Perjanjian.
   - Editor Dokumen Dinamis: Input field menyesuaikan dengan jenis dokumen yang dipilih.

2. **Alur Persetujuan (Approval Workflow)**
   - Dokumen yang berstatus Draft / Menunggu Review akan masuk ke daftar persetujuan Reviewer (berdasarkan disposisi atau alur berjenjang).
   - Mendukung penolakan dokumen (dikembalikan dengan catatan revisi) atau persetujuan dokumen.

3. **Distribusi Dokumen (Document Disposition)**
   - Admin dapat mendistribusikan dokumen yang sudah berstatus "Disetujui" (Final) ke spesifik Grup, Jabatan, atau User secara langsung maupun global ("Semua Pengguna").
   - Penerima akan mendapatkan dokumen di Dashboard mereka dengan status "Final (Terdistribusi)".

4. **Tanda Tangan Elektronik & Paraf**
   - Dukungan Tanda Tangan Digital interaktif langsung di browser menggunakan sistem kanvas, atau bisa mengunggah file gambar (PNG/JPG).
   - Terintegrasi langsung dalam modal pengisian dokumen.

5. **Akses Berbasis Peran & Logika Read-Only**
   - **User Biasa**: Hanya bisa mengedit dokumen buatannya sendiri (selama berstatus draft/butuh revisi) ATAU dokumen yang dikirimkan rekan divisi kepadanya untuk diteruskan.
   - **Reviewer**: Bisa menyetujui, menolak, atau mengembalikan dokumen.
   - **Admin**: Bypass akses edit untuk semua draft.
   - **Read-Only Mutlak**: Dokumen yang sudah "Disetujui" atau didistribusikan secara final oleh admin (Status: Final/Terdistribusi) akan terkunci secara mutlak (100% Read-Only) untuk **semua** pengguna termasuk Admin, guna menjaga keutuhan dokumen arsip.

6. **Log Riwayat Pembaruan & Pengerjaan Lengkap**
   - Riwayat Log Status: Merekam setiap perpindahan dokumen (misal Draft → Menunggu Review → Disetujui).
   - Log Detail Perubahan File: Mencari perbedaan field yang dimodifikasi oleh pengguna dan membuat ringkasan log spesifik (contoh: "Field 'Perihal' berubah dari X ke Y").

## Struktur Direktori

```bash
dof-project-main/
├── backend/                  # REST API Service (Node.js/Express/Prisma)
│   ├── prisma/               # Skema ORM & Migrations
│   ├── src/
│   │   ├── controllers/      # Logika Bisnis
│   │   ├── routes/           # Definisi Endpoint API
│   │   └── services/         # Layanan Database/Aplikasi
│   └── .env                  # Environment Backend
│
└── frontend/                 # Client UI (React/Vite)
    ├── src/
    │   ├── components/       # Reusable UI (Editor, Modal, Tabel, dll)
    │   ├── context/          # State Management (AuthContext)
    │   ├── pages/            # Halaman Dashboard, Viewer, Auth
    │   └── utils/            # Helper fungsi UI/Format/API 
    └── index.css             # Konfigurasi Tailwind & Basic Styles
```

## Setup Instruksi (Development)

### Backend Setup
1. Masuk ke folder backend: `cd backend`
2. Install dependensi: `npm install`
3. Konfigurasi Database: Buat file `.env` dan setting `DATABASE_URL` ke PostgreSQL Anda.
4. Jalankan Migrasi & Seed: `npx prisma migrate dev` lalu `npm run seed`
5. Jalankan server: `npm run dev`

### Frontend Setup
1. Masuk ke folder frontend: `cd frontend`
2. Install dependensi: `npm install`
3. Sesuaikan URL API backend jika perlu (default ke `http://localhost:5000/api`).
4. Jalankan aplikasi: `npm run dev`


