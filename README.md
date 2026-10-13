# Aplikasi Penjualan

Aplikasi dashboard penjualan sederhana dengan hosting gratis di Cloudflare Pages.

## Fitur

- Login dengan Basic Auth + form login
- Dashboard dengan tabel penjualan per market
- Mode admin (kode: 123) untuk edit data
- Perhitungan otomatis: Total, Rata-rata, 3 Hari Terakhir, Hari Kerja, Kekuatan Pasar
- Responsive (mobile & desktop)
- Penyimpanan di Cloudflare KV

## Kredensial Default

- Basic Auth: admin / rahasia123
- Login Form: admin / admin123
- Kode Admin: 123

## Cara Deploy

1. Upload ke GitHub
2. Connect to Git di Cloudflare Pages
3. Build command: `exit 0`
4. Build output directory: `public`
5. Tambahkan KV binding `SALES_KV`
6. Retry deployment
