# Panduan Terhubung dengan GitHub, Vercel, Firebase, & Database Google Sheets

Aplikasi **FixLolosPTN** dibangun menggunakan kombinasi **arsitektur modern (React 19 + Vite + Tailwind CSS)** dengan **database gratis & tangguh (Firebase Cloud Firestore + Google Sheets)**.

---

## 1. Menghubungkan Repositori ke GitHub

Repositori Git lokal telah diinisialisasi pada branch `main`. Untuk menghubungkan ke GitHub Anda:

1. Buat repositori baru di [GitHub](https://github.com/new) (misalnya bernama `fixlolosptn`).
2. Jalankan perintah berikut di terminal:
   ```bash
   git remote add origin https://github.com/<USERNAME-ANDA>/<NAMA-REPO>.git
   git branch -M main
   git push -u origin main
   ```
3. Setiap kali ada perubahan baru atau pembaruan kode:
   ```bash
   git add .
   git commit -m "Update fitur terbaru"
   git push
   ```

---

## 2. Menghubungkan Otomatis ke Vercel (CI/CD Otomatis)

Dengan menghubungkan GitHub ke Vercel, setiap kali Anda melakukan `git push`, Vercel akan otomatis melakukan build dan deploy:

1. Buka dashboard [Vercel](https://vercel.com/) lalu pilih **"Add New"** > **"Project"**.
2. Pilih repositori GitHub Anda dan klik **"Import"**.
3. Vercel akan otomatis membaca file `vercel.json` dan preset Vite:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Klik tombol **"Deploy"**.
5. Domain produksi Vercel Anda (`https://nama-proyek.vercel.app`) akan langsung aktif dan otomatis ter-update setiap kali ada commit baru di GitHub!

---

## 3. Penyimpanan Data di Firebase Cloud Firestore (Backend)

Seluruh data siswa, nilai rapor, TKA, prestasi, try out SNBT, pilihan PTN, dan pengaturan telah tersimpan secara otomatis di **Firebase Cloud Firestore**:
- **Project ID**: `fixlolosptn`
- **Autentikasi & Database**: Cloud Firestore dengan konfigurasi long-polling otomatis untuk kestabilan di seluruh perangkat (Mobile & Desktop).
- **Offline / Local Backup**: Aplikasi juga menyinkronkan data secara reaktif ke LocalStorage sehingga aplikasi tetap cepat dan responsif tanpa lag jaringan.

Jika ingin deploy ke Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase use fixlolosptn
npm run build
firebase deploy
```

---

## 4. Integrasi Database Gratis Google Sheets

Bagi developer yang menyukai basis data spreadsheet fleksibel tanpa biaya server:
1. Masuk ke **Admin Dashboard** > Tab **"Google Sheets & Data"**.
2. **Ekspor Dataset**: Klik **"Salin JSON untuk Google Sheets"** untuk menyalin seluruh sheet relasional (`SISWA`, `NILAI_RAPOR`, `TKA_DATA`, `PRESTASI`, `TO_DATA`, `SETTINGS`).
3. Anda dapat menghubungkannya ke **Google Apps Script** (`doPost` / `doGet`) atau Google Drive untuk backup terjadwal.
4. **Impor dari Google Sheets**: Tempel payload JSON dari Google Sheets kapan saja untuk menyinkronkan data langsung ke tabel aplikasi dan Firestore secara instan.

