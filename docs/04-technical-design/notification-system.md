# Desain Sistem Peringatan & Notifikasi (Notification & Alert System)

Dokumen ini merinci arsitektur sistem peringatan terpadu yang mencakup **Realtime In-App Banner**, **Web Audio Siren**, **Web Notification API**, dan **Notification History Center**.

---

## 1. Matriks Tingkat Keparahan Peringatan (Alert Severity Matrix)

Untuk memberikan respons visual dan auditori yang proporsional sesuai data resmi BMKG:

| Klasifikasi Kejadian | Kondisi Kriteria | Efek Visual In-App | Efek Audio (Jika Suara Aktif) | Notifikasi Browser |
| :--- | :--- | :--- | :--- | :--- |
| **Gempa Signifikan / Megathrust** | Magnitudo $\ge 6.5$ ATAU Berpotensi Tsunami | Banner Merah Berkedip, Modal Darurat Mengunci Layar | Sirine Bahaya Nada Tinggi Berulang (Dual-tone Siren) | Prioritas Tinggi (Persistent Notification) |
| **Gempa Sedang (M 5.0+)** | $5.0 \le \text{Magnitudo} < 6.5$, Tanpa Potensi Tsunami | Banner Oranye Menyala di Bagian Atas Halaman | Chime Peringatan Ganda (Two-beep Alert) | Notifikasi Standar |
| **Gempa Ringan / Dirasakan** | Magnitudo $< 5.0$, Tercatat Dirasakan MMI | Toast Notifikasi Biru/Abu di Pojok Kanan Atas | Nada Notifikasi Tunggal Halus (Soft Ping) | Notifikasi Ringan |
| **Skenario Simulasi** | Data berasal dari tabel `simulation_events` | Banner Merah Tua dengan Label **"⚠️ PERINGATAN SIMULASI"** | Sirine Uji Coba Audio | Notifikasi Berlabel [SIMULASI] |

---

## 2. Arsitektur Audio Alert (Web Audio API)

Sistem menggunakan sintesis audio murni berbasis **Web Audio API (`AudioContext`)** alih-alih hanya mengandalkan file `.mp3` eksternal.

### Keuntungan Web Audio API:
- **Zero Network Delay**: Tidak ada jeda download file MP3 saat gempa terjadi.
- **Reliable Fallback**: Beroperasi penuh bahkan saat koneksi lambat.
- **Dukungan Frekuensi Adaptif**: Frekuensi osilator dapat disesuaikan secara dinamis berdasarkan magnitudo gempa.

### Logika Osilator Sintesis Suara:
```ts
// lib/audio/sound-engine.ts
export class AlertSoundEngine {
  private ctx: AudioContext | null = null;

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playEmergencySiren(durationSec = 4) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Modulasi nada naik-turun menyerupai sirine darurat (800Hz ke 1200Hz)
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.5);
    osc.frequency.linearRampToValueAtTime(800, now + 1.0);
    osc.frequency.linearRampToValueAtTime(1200, now + 1.5);
    osc.frequency.linearRampToValueAtTime(800, now + 2.0);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + durationSec);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec);
  }
}
```

---

## 3. Web Notification API (Browser Native Notification)

Untuk memberi tahu pengguna saat jendela browser sedang berada di tab lain atau di-minimize:
1. **Permintaan Izin Eksplisit**:
   Pengguna mengklik tombol "Aktifkan Notifikasi Desktop".
2. **Pengecekan Dukungan Browser**:
   ```ts
   if ('Notification' in window) {
     const perm = await Notification.requestPermission();
     if (perm === 'granted') {
       // Catat state granted di localStorage
     }
   }
   ```
3. **Trigger Notifikasi Latar Belakang**:
   ```ts
   new Notification(`GEMPA BUMI M ${event.magnitude} - BMKG`, {
     body: `${event.region}\nKedalaman: ${event.depth_km} km. ${event.potential}`,
     icon: '/icons/bmkg-alert.png',
     badge: '/icons/badge.png',
     tag: event.event_hash, // Mencegah notifikasi ganda untuk kejadian yang sama
     requireInteraction: event.magnitude >= 6.0
   });
   ```

---

## 4. Riwayat Notifikasi Lokal (Notification Center Drawer)
- Setiap event peringatan yang diterima selama sesi aktif disimpan ke dalam state React dan `localStorage`.
- Pengguna dapat membuka panel *drawer* di sisi kanan layar untuk membaca riwayat peringatan yang masuk lengkap dengan timestamp relatif (misal: "3 menit lalu").
