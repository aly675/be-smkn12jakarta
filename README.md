# 🚀 Backend Portal SMKN 12 Jakarta

API Backend untuk sistem portal informasi dan manajemen konten SMKN 12 Jakarta. Dibangun menggunakan arsitektur modern dengan **NestJS**, **Prisma ORM (v7)**, dan **PostgreSQL**.

## 🛠️ Tech Stack
- **Framework:** [NestJS](https://nestjs.com/)
- **ORM:** [Prisma](https://www.prisma.io/) (dengan `@prisma/adapter-pg`)
- **Database:** PostgreSQL
- **Language:** TypeScript
- **Authentication:** JWT (JSON Web Token) & Passport
- **Package Manager:** Yarn

---

## 📋 Persyaratan Sistem (Prerequisites)
Pastikan sistem kamu sudah terinstall:
- **Node.js** (Rekomendasi versi 20.x atau 24.x terbaru)
- **Yarn** (`npm install --global yarn`)
- **PostgreSQL** (Bisa menggunakan lokal atau server)

---

## ⚙️ Cara Instalasi & Setup Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan project di komputer lokal kamu.

### 1. Clone Repository & Install Dependencies
```bash
git clone <url-repo-lu-di-sini>
cd portal-backend
yarn install

```

### 2. Konfigurasi Environment Variables

Buat file `.env` di *root directory* project dengan menyalin dari `.env.example` (jika ada), atau buat manual dengan format berikut:

env
# Konfigurasi Database
# PENTING: Jika password DB menggunakan karakter khusus (seperti =, +, $, dll), pastikan menggunakan format URL Encoded!
DATABASE_URL="postgresql://[USER]:[PASSWORD]@localhost:5432/[NAMA_DATABASE]?schema=portal"

# Nama Schema Database (default: portal)
DB_SCHEMA="portal"

# Secret Key untuk Authentication (Ganti dengan string acak yang aman)
JWT_SECRET="rahasia_super_aman_smkn12"

```

### 3. Setup Database & Migrasi

Karena project ini menggunakan skema khusus (`portal`) dan adapter `pg`, jalankan perintah berikut secara berurutan untuk menyiapkan database:

```bash
# 1. Terapkan struktur tabel ke database (Migrate)
npx prisma migrate dev --name init_lokal

# 2. Sinkronisasi Prisma Client dengan schema terbaru (Generate)
npx prisma generate

```

### 4. Seeding Data (Wajib!)

Jalankan seeder untuk mengisi data awal (*Site Settings*, Kategori, dll) dan membuat **Akun Super Admin**.

```bash
yarn db:seed

```

---

## 🔑 Akun Admin Default (Lokal)

Setelah berhasil menjalankan seeder (`yarn db:seed`), kamu bisa login menggunakan kredensial default berikut untuk mengakses fitur Admin:

* **Username:** `admin`
* **Password:** `rahasia123`
* **Role:** `ADMIN`

*(Catatan: Segera ganti password ini jika aplikasi di-deploy ke Production!)*

---

## 🚀 Cara Menjalankan Aplikasi

```bash
# Mode Development (Auto-reload)
yarn start:dev

# Mode Production
yarn build
yarn start:prod

```

Secara default, API akan berjalan di `http://localhost:3000`.

---

## 🗄️ Manajemen Database (Prisma Studio)

Untuk melihat, mengedit, atau menghapus isi database secara visual lewat browser, jalankan perintah ini:

```bash
npx prisma studio

```

Akses di browser melalui: `http://localhost:5555`

---

## 💡 Troubleshooting (Catatan Penting)

* **Error "Table public.users does not exist" saat Seeding:**
Pastikan kamu sudah mengatur `DB_SCHEMA="portal"` di file `.env`. Prisma 7 membutuhkan definisi schema eksplisit yang diatur via adapter di dalam file `src/prisma/prisma.service.ts` dan `prisma/seed.ts`.
* **Error "Invalid connection string" / Karakter Khusus di Password:**
Jika password PostgreSQL kamu mengandung simbol `=` atau `+`, wajib di-encode.
Contoh: `=` menjadi `%3D`, dan `+` menjadi `%2B`.