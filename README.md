# DOF Project — Document Flow System

> Sistem Pengelolaan Surat Dinas Berbasis Web
> Stack: React 19 · Node.js · Express 5 · PostgreSQL · Prisma ORM · Tailwind CSS v4

---

## Daftar Isi

1. [Gambaran Umum](#1-gambaran-umum)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Teknologi yang Digunakan](#3-teknologi-yang-digunakan)
4. [Struktur Proyek](#4-struktur-proyek)
5. [Kebutuhan Sistem](#5-kebutuhan-sistem)
6. [Instalasi dan Setup](#6-instalasi-dan-setup)
7. [Konfigurasi Environment](#7-konfigurasi-environment)
8. [Setup Database](#8-setup-database)
9. [Menjalankan Aplikasi](#9-menjalankan-aplikasi)
10. [Role dan Hak Akses](#10-role-dan-hak-akses)
11. [Referensi API](#11-referensi-api)
12. [Fitur Cetak dan Ekspor PDF](#12-fitur-cetak-dan-ekspor-pdf)
13. [Riwayat Aktivitas dan Audit Log](#13-riwayat-aktivitas-dan-audit-log)
14. [Deployment Produksi](#14-deployment-produksi)
15. [Pertimbangan Keamanan](#15-pertimbangan-keamanan)

---

## 1. Gambaran Umum

**DOF (Document Flow)** adalah sistem pengelolaan surat dinas berbasis web yang dirancang untuk menggantikan proses dokumen berbasis kertas dalam lingkungan organisasi. Sistem ini mendukung pembuatan, persetujuan bertingkat, distribusi, dan pemantauan surat dinas secara terpusat dan terstruktur.

### Jenis Surat yang Didukung

- **Nota Dinas** — Surat komunikasi resmi antar unit atau divisi dalam organisasi.
- **SPPD (Surat Perintah Perjalanan Dinas)** — Surat yang mengatur kegiatan perjalanan dinas pegawai.
- **Surat Perjanjian Kerja Sama (PKS)** — Dokumen kerja sama formal antara dua pihak.

### Fitur Utama

- **Editor Dokumen Dinamis** — Form input yang menyesuaikan secara otomatis berdasarkan jenis surat yang dipilih (Nota Dinas, SPPD, atau Perjanjian).
- **Penomoran Surat Otomatis** — Nomor surat dibuat secara sekuensial dan global oleh sistem. Format: `PREFIX-urutan/klasifikasi/unit/BulanRomawi/Tahun`. Contoh: `ND-12/PR.04.01/E/IV/2026`.
- **Alur Persetujuan Bertingkat (Multi-Level Approval)** — Surat yang dikirim melalui jalur Disposisi melewati proses review secara berurutan. Setiap Reviewer dapat menyetujui (ACC) atau mengembalikan surat disertai catatan.
- **Pembatasan Pengiriman Berdasarkan Jabatan** — Staf dan Kepala Bidang hanya dapat mengirim surat ke divisi mereka sendiri. Kepala Divisi dan Administrator dapat mengirim ke seluruh divisi dalam organisasi.
- **Distribusi Surat (Admin)** — Administrator mendistribusikan surat yang telah disetujui kepada penerima tertentu: seluruh pegawai, divisi tertentu, atau satu orang spesifik.
- **Tanda Tangan dan Paraf Digital** — Mendukung penandatanganan interaktif menggunakan canvas (gambar tangan) maupun unggah gambar (PNG/JPG).
- **Penguncian Dokumen Final** — Surat yang berstatus Disetujui terkunci sepenuhnya. Tidak ada pihak manapun yang dapat mengubah isinya, termasuk Administrator.
- **Pemantauan Keterbacaan** — Administrator dapat memantau siapa saja yang sudah dan belum membaca surat yang didistribusikan, lengkap dengan persentase keterbacaan.
- **Riwayat Versi Dokumen** — Setiap perubahan konten menyimpan versi baru. Pembuat surat dapat mengembalikan dokumen ke versi sebelumnya kapan saja.
- **Work Log (Pencatatan Waktu Pengerjaan)** — Sistem mencatat secara otomatis durasi waktu yang dihabiskan setiap pengguna dalam mengerjakan suatu dokumen.
- **Pemberitahuan Otomatis (Notifikasi)** — Sistem mengirim notifikasi ke pihak yang relevan pada setiap kejadian penting: pengajuan, persetujuan, penolakan, distribusi, dan penerimaan surat.
- **Filter dan Pencarian Dokumen** — Pengguna dapat memfilter dokumen berdasarkan judul, jenis surat, status, dan rentang tanggal.
- **Dashboard per Role** — Tampilan dashboard yang berbeda untuk setiap role: User Dashboard, Reviewer Dashboard, dan Admin Dashboard dengan statistik dan akses cepat yang relevan.
- **Arsip Seluruh Dokumen (Admin)** — Administrator memiliki akses ke database terpusat yang menampilkan seluruh dokumen dari semua pengguna.

---

## 2. Arsitektur Sistem

```text
┌─────────────────────────────────────────────────────────────┐
│                    Browser (React SPA)                      │
│  React 19 + Vite  │  React Router v7  │  Tailwind CSS v4   │
│  Context API (Auth)  │  react-signature-canvas              │
└─────────────────────────┬───────────────────────────────────┘
                          │  HTTP/HTTPS (REST API)
                          │  Authorization: Bearer <JWT>
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Nginx Reverse Proxy (Produksi)                 │
│  Terminasi HTTPS  │  Static file serving  │  API proxying  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                Node.js + Express Backend                    │
│  Port: 5000                                                 │
│  ├── Middleware: Helmet, CORS, Rate Limit                   │
│  ├── Auth Middleware: JWT verification + role & jabatan     │
│  ├── Services: Document, Approval, Distribution, WorkLog   │
│  └── Controllers: auth, documents, folders, groups, users  │
└─────────────────────────┬───────────────────────────────────┘
                          │  Prisma ORM
                          ▼
┌─────────────────────────────────────────────────────────────┐
│             PostgreSQL Database (port 5432)                 │
│  Tables: users, groups, documents, document_versions,       │
│  document_approvals, document_logs, document_work_logs,     │
│  document_distributions, folders, notifications            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Teknologi yang Digunakan

| Layer | Teknologi | Versi | Fungsi |
|---|---|---|---|
| Frontend | React | 19.x | Framework UI berbasis komponen |
| Frontend Build | Vite | 7.x | Bundler dan dev server |
| Frontend Routing | React Router DOM | 7.x | Manajemen routing sisi klien |
| Styling | Tailwind CSS | 4.x | Framework CSS utility-first |
| Icons | lucide-react | 0.575+ | Ikon SVG minimalis |
| HTTP Client | Axios | 1.13+ | Komunikasi REST API |
| Tanda Tangan | react-signature-canvas | 1.x | Kanvas tanda tangan digital interaktif |
| Backend Runtime | Node.js | 20+ | JavaScript runtime sisi server |
| Backend Framework | Express | 5.x | Framework routing web |
| ORM | Prisma | 6.x | Interaksi database berbasis skema |
| Database | PostgreSQL | 14+ | Database relasional |
| Autentikasi | jsonwebtoken & bcryptjs | 9.x / 3.x | JWT auth dan enkripsi password |
| Validasi | Zod | 4.x | Validasi skema tipe-aman |
| Keamanan | Helmet & express-rate-limit | 8.x | Proteksi header HTTP dan rate limiting |

---

## 4. Struktur Proyek

```text
dof-project-main-v2-react/
├── README.md
├── backend/
│   ├── prisma/
│   │   └── schema.prisma         # Definisi model database
│   ├── src/
│   │   ├── config/               # Konfigurasi database dan koneksi
│   │   ├── controllers/          # Handler HTTP per domain
│   │   │   ├── auth.controller.js
│   │   │   ├── document.controller.js
│   │   │   ├── documentApproval.controller.js
│   │   │   ├── documentDistribution.controller.js
│   │   │   ├── documentWorkLog.controller.js
│   │   │   ├── folder.controller.js
│   │   │   ├── group.controller.js
│   │   │   ├── notification.controller.js
│   │   │   └── user.controller.js
│   │   ├── middlewares/          # Auth, validasi, error handler
│   │   ├── repositories/         # Query database per entitas
│   │   ├── routes/               # Definisi endpoint dan middleware
│   │   ├── services/             # Logika bisnis utama
│   │   │   ├── document.service.js
│   │   │   ├── documentApproval.service.js
│   │   │   ├── documentDistribution.service.js
│   │   │   ├── documentWorkLog.service.js
│   │   │   └── notification.service.js
│   │   └── utils/
│   │       ├── roleUtils.js      # Aturan pembatasan jabatan (Kadiv/Kabid/Staf)
│   │       └── validators.js     # Skema validasi Zod
│   ├── server.js
│   └── .env
│
└── frontend/
    └── src/
        ├── components/
        │   ├── admin/            # Komponen khusus Admin Dashboard
        │   │   ├── UsersTab.jsx
        │   │   ├── GroupsTab.jsx
        │   │   ├── DistributionsTab.jsx
        │   │   └── AllDocumentsTab.jsx
        │   └── editor/           # Editor per jenis surat
        │       ├── NotaEditor.jsx
        │       ├── SppdEditor.jsx
        │       ├── PerjanjianEditor.jsx
        │       ├── QuillEditor.jsx
        │       └── SignatureModal.jsx
        ├── context/
        │   └── AuthContext.jsx   # State login dan data user global
        ├── pages/
        │   ├── dashboard/
        │   │   ├── AdminDashboard.jsx
        │   │   ├── ReviewerDashboard.jsx
        │   │   ├── UserDashboard.jsx
        │   │   └── shared/       # Komponen bersama antar dashboard
        │   ├── DocumentEditor.jsx
        │   ├── DocumentViewer.jsx
        │   ├── Documents.jsx
        │   ├── Folders.jsx
        │   ├── Login.jsx
        │   └── Profile.jsx
        └── utils/
            └── api.js            # Axios instance dengan interceptor JWT
```

---

## 5. Kebutuhan Sistem

| Kebutuhan | Versi Minimum | Catatan |
|---|---|---|
| Node.js | v20.x LTS | Dibutuhkan untuk fitur ES Module modern |
| npm | 10.x | Package manager |
| PostgreSQL | 14.x | Database relasional utama |
| Git | 2.x | Version control |

---

## 6. Instalasi dan Setup

### Langkah 1 — Clone Repository
```bash
git clone <repository_url>
cd dof-project-main-v2-react
```

### Langkah 2 — Install Dependensi Backend
```bash
cd backend
npm install
```

### Langkah 3 — Install Dependensi Frontend
```bash
cd ../frontend
npm install
```

---

## 7. Konfigurasi Environment

### Konfigurasi Backend

Buat file `.env` di dalam folder `backend/`:

```env
# Koneksi database PostgreSQL via Prisma
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/dof_db?schema=public"

# Konfigurasi autentikasi JWT
JWT_SECRET="isi-dengan-secret-key-yang-aman"
JWT_EXPIRES_IN="1d"

# Port server backend
PORT=5000

# Origin frontend untuk aturan CORS
CLIENT_URL="http://localhost:5173"
```

---

## 8. Setup Database

### Membuat Database PostgreSQL
```sql
CREATE DATABASE dof_db;
```

### Menjalankan Migrasi dan Seeding
```bash
cd backend

# Terapkan struktur tabel sesuai schema.prisma
npm run prisma:migrate

# Isi data awal (admin, user, grup contoh)
npm run seed
```

### Ringkasan Skema Database

| Tabel | Fungsi |
|---|---|
| `users` | Data pengguna, role, dan jabatan (position) |
| `groups` | Data divisi atau grup dalam organisasi |
| `documents` | Dokumen surat beserta status dan metadata |
| `document_versions` | Riwayat versi dokumen (snapshot per perubahan) |
| `document_approvals` | Rantai persetujuan bertingkat per dokumen |
| `document_logs` | Log aktivitas dan perubahan status dokumen |
| `document_work_logs` | Pencatatan durasi pengerjaan dokumen per pengguna |
| `document_distributions` | Catatan distribusi surat ke penerima |
| `folders` | Folder untuk mengelompokkan dokumen |
| `notifications` | Pemberitahuan otomatis antar pengguna |

---

## 9. Menjalankan Aplikasi

### Mode Development

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server berjalan di http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Aplikasi berjalan di http://localhost:5173
```

### Build Produksi
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

---

## 10. Role dan Hak Akses

Sistem menggunakan kombinasi **role** (level akses sistem) dan **jabatan / position** (level hierarki organisasi) untuk mengontrol hak akses setiap pengguna.

### Role yang Tersedia

| Role | Deskripsi |
|---|---|
| `user` | Pengguna umum — pegawai yang membuat dan mengirim surat |
| `reviewer` | Pengulas — bertugas memeriksa dan menyetujui surat via Disposisi |
| `admin` | Administrator — mengelola sistem, mendistribusikan surat final |

### Jabatan dalam Role `user`

Jabatan diambil dari field `position` pada data pengguna dan menentukan cakupan pengiriman surat:

| Jabatan | Prefix di `position` | Hak Kirim |
|---|---|---|
| Staf | selain `kadiv` atau `kabid` | Hanya ke divisi sendiri |
| Kepala Bidang | dimulai dengan `kabid` | Hanya ke divisi sendiri |
| Kepala Divisi | dimulai dengan `kadiv` | Ke semua divisi dalam organisasi |

### Aturan Pengiriman Surat

- **Ke Disposisi** (`targetRole: dispo`) — Semua pengguna boleh mengirim. Surat masuk antrian persetujuan Reviewer.
- **Ke Grup/Divisi** (`targetRole: group`) — Dibatasi oleh jabatan. Staf dan Kepala Bidang hanya boleh mengirim ke divisi mereka sendiri.
- **Ke Pengguna Tertentu** (`targetRole: user`) — Semua pengguna boleh mengirim langsung tanpa perlu persetujuan.

### Aturan Status Dokumen

- Surat berstatus `approved` **terkunci sepenuhnya** — tidak dapat diubah oleh siapapun termasuk Administrator.
- Hanya pembuat surat yang dapat menghapus dokumennya, dan hanya jika masih berstatus `draft`.
- Distribusi surat hanya dapat dilakukan oleh **Administrator**.

---

## 11. Referensi API

Semua endpoint membutuhkan header `Authorization: Bearer <TOKEN>` kecuali disebutkan lain.

### Autentikasi
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/auth/login` | Login dan mendapatkan JWT token |
| POST | `/api/auth/logout` | Logout (hapus sesi klien) |

### Dokumen
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/documents` | Ambil semua dokumen sesuai hak akses pengguna |
| POST | `/api/documents` | Buat dokumen baru |
| GET | `/api/documents/generate-number` | Generate nomor surat otomatis |
| GET | `/api/documents/:id` | Ambil detail satu dokumen |
| PUT | `/api/documents/:id` | Update dokumen (konten, status, target) |
| DELETE | `/api/documents/:id` | Hapus dokumen (draft saja, oleh pembuat atau admin) |
| GET | `/api/documents/:id/logs` | Riwayat aktivitas dan perubahan status |
| GET | `/api/documents/:id/versions` | Daftar semua versi dokumen |
| POST | `/api/documents/:id/versions/:versionId/restore` | Kembalikan dokumen ke versi sebelumnya |
| GET | `/api/documents/:id/work-logs` | Log waktu pengerjaan dokumen |
| POST | `/api/documents/:id/work-logs` | Catat sesi pengerjaan dokumen |

### Persetujuan Dokumen
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/documents/:id/approvals` | Semua | Lihat rantai persetujuan |
| POST | `/api/documents/:id/approvals/:approvalId/approve` | Reviewer, Admin | Setujui (ACC) satu tahap approval |
| POST | `/api/documents/:id/approvals/:approvalId/reject` | Reviewer, Admin | Tolak dan kembalikan untuk perbaikan |
| PUT | `/api/documents/:id/approvals/sequence` | Pembuat | Atur ulang urutan approval |

### Distribusi Dokumen
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/distributions/monitoring` | Semua | Data monitoring keterbacaan surat |
| GET | `/api/distributions/:id` | Semua | Detail distribusi satu dokumen |
| POST | `/api/distributions/:id` | Admin | Distribusikan surat ke penerima |

### Pengguna
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/users` | Semua | Daftar semua pengguna |
| GET | `/api/users/:id` | Semua | Detail satu pengguna |
| GET | `/api/users/me/available-groups` | Semua | Daftar divisi yang boleh dikirim |
| PUT | `/api/users/profile/update` | Semua | Update profil sendiri (password) |
| POST | `/api/users` | Admin | Buat pengguna baru |
| PUT | `/api/users/:id` | Admin | Update data pengguna |
| DELETE | `/api/users/:id` | Admin | Hapus pengguna |

### Grup dan Folder
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/groups` | Semua | Daftar semua grup/divisi |
| POST | `/api/groups` | Admin | Buat grup baru |
| PUT | `/api/groups/:id` | Admin | Update data grup |
| DELETE | `/api/groups/:id` | Admin | Hapus grup |
| GET | `/api/folders` | Semua | Daftar folder milik pengguna |
| POST | `/api/folders` | Semua | Buat folder baru |

---

## 12. Fitur Cetak dan Ekspor PDF

Sistem memanfaatkan kemampuan cetak bawaan browser untuk menghasilkan output PDF berkualitas tinggi langsung dari tampilan dokumen.

- **Mekanisme:** Fungsi `window.print()` dipanggil dengan stylesheet cetak khusus yang menyembunyikan elemen UI (sidebar, toolbar) dan hanya menampilkan isi surat dalam format kertas A4.
- **Tanda Tangan:** Tanda tangan canvas dan gambar yang diunggah ikut tercetak sebagai bagian dari dokumen.
- **Format:** Output mengikuti format surat dinas resmi yang telah ditentukan, termasuk kop surat, nomor surat, dan kolom paraf.

---

## 13. Riwayat Aktivitas dan Audit Log

Sistem mencatat secara komprehensif seluruh aktivitas yang terjadi pada setiap dokumen.

### Tabel `document_logs`
Mencatat setiap perubahan status dan konten dokumen, termasuk:
- Siapa yang melakukan aksi dan kapan
- Status sebelum dan sesudah perubahan
- Ringkasan perubahan field secara spesifik (contoh: `Perihal: "A" → "B"`)

### Tabel `document_versions`
Menyimpan snapshot konten dokumen di setiap tahap perubahan. Versi dapat dikembalikan kapan saja oleh pembuat dokumen.

- **Minor version** (contoh: 1.0 → 1.1): Terjadi saat konten diedit atau surat dikirim ulang setelah revisi.
- **Major version** (contoh: 1.1 → 2.0): Terjadi saat surat diteruskan setelah berstatus terkirim.

### Tabel `document_work_logs`
Mencatat sesi pengerjaan dokumen per pengguna secara otomatis, mulai dari waktu membuka hingga menutup editor. Durasi minimum yang dicatat adalah 1 menit.

---

## 14. Deployment Produksi

### Rekomendasi Stack: PM2 + Nginx

**1. Build Frontend:**
```bash
cd frontend
npm run build
# File siap deploy ada di frontend/dist/
```

**2. Jalankan Backend dengan PM2:**
```bash
npm install -g pm2
cd backend
pm2 start server.js --name "dof-backend" --env production
pm2 save
pm2 startup
```

**3. Konfigurasi Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Serve React SPA
    root /path/to/frontend/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API ke backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 15. Pertimbangan Keamanan

- **Enkripsi Password** — Semua password disimpan menggunakan `bcryptjs` dengan salt rounds 10. Hash format PHP Laravel (`$2y$`) dikonversi otomatis ke format Node.js (`$2a$`) untuk kompatibilitas.
- **JWT Authentication** — Setiap request ke endpoint terproteksi diverifikasi menggunakan JWT. Token kadaluarsa akan mengembalikan error 401.
- **HTTP Security Headers** — Seluruh response dilindungi oleh `helmet` yang mengatur header seperti `Content-Security-Policy`, `X-Frame-Options`, dan lainnya.
- **Rate Limiting** — `express-rate-limit` membatasi jumlah request ke endpoint `/auth` untuk mencegah serangan brute-force.
- **SQL Injection Prevention** — Seluruh query database menggunakan Prisma ORM dengan parameterisasi otomatis, menghilangkan risiko SQL injection.
- **Validasi Input** — Semua input dari klien divalidasi menggunakan skema Zod sebelum diproses oleh service layer.
- **Immutable Document Lock** — Dokumen yang berstatus `approved` dikunci secara permanen di level service. Sistem melempar `BadRequestError` jika ada upaya mengubah konten dokumen yang sudah final.
- **Pembatasan Akses Berbasis Jabatan** — Fungsi `canSendDocument()` memvalidasi hak kirim antar divisi berdasarkan jabatan pengguna di setiap operasi pengiriman surat.
