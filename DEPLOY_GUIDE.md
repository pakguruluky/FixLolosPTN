# Panduan Deploy ke Vercel & Firebase Hosting

Aplikasi ini dibangun menggunakan **React 19 + Vite + Tailwind CSS**. Seluruh aset statis akan dikompilasi ke dalam folder `dist`.

---

## 1. Panduan Deploy ke Vercel

Vercel akan otomatis mengenali project Vite dengan file `vercel.json` yang telah disediakan.

### Cara 1: Menggunakan Git / GitHub (Direkomendasikan)
1. Push / unggah repositori proyek ini ke **GitHub**, **GitLab**, atau **Bitbucket**.
2. Buka dashboard [Vercel](https://vercel.com/) lalu klik **"Add New Project"** -> **"Project"**.
3. Pilih repositori GitHub Anda dan klik **"Import"**.
4. Di bagian **Build and Output Settings**, Vercel akan otomatis mendeteksi:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik tombol **"Deploy"**. Selesai!

### Cara 2: Menggunakan Vercel CLI di Terminal
1. Buka terminal di folder project:
   ```bash
   npm i -g vercel
   vercel
   ```
2. Ikuti instruksi login dan pilih default settings.
3. Untuk deployment production:
   ```bash
   vercel --prod
   ```

---

## 2. Panduan Deploy ke Firebase Hosting

Konfigurasi `firebase.json` dan `.firebaserc` telah disiapkan.

### Langkah-langkah:
1. Pastikan Firebase CLI telah terpasang:
   ```bash
   npm install -g firebase-tools
   ```
2. Login ke akun Google Firebase Anda:
   ```bash
   firebase login
   ```
3. Kaitkan ke project Firebase Anda:
   ```bash
   firebase use fixlolosptn
   ```
   *(File `.firebaserc` telah diset default ke project `fixlolosptn`)*
4. Jalankan build aplikasi:
   ```bash
   npm run build
   ```
5. Deploy ke Firebase (Rules Database & Hosting):
   ```bash
   firebase deploy
   ```
   *(Atau `firebase deploy --only firestore,hosting`)*
6. Selesai! Aplikasi Anda akan aktif di `https://fixlolosptn.web.app` atau `https://fixlolosptn.firebaseapp.com`
