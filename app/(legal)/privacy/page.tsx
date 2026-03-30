'use client'
import Link from 'next/link'
import '../legal-pages.css'

export default function PrivacyPage() {
  return (
    <div className="legal-container">
      <div className="legal-header">
        <div className="legal-header-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Kebijakan Privasi
        </div>
        <h1>Privasi &amp; Keamanan Data</h1>
        <p>Kami menghormati dan melindungi privasi Anda sepenuhnya</p>
        <div className="legal-header-meta">
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Diperbarui Maret 2025
          </span>
        </div>
      </div>

      <div className="legal-content">
        {/* Pendahuluan */}
        <div className="legal-section">
          <h2><span className="legal-section-number">1</span> Pendahuluan</h2>
          <p>
            Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, melindungi, dan membagikan informasi personal Anda ketika Anda menggunakan platform kami (selanjutnya disebut "Platform" atau "Layanan").
          </p>
          <p>
            Terakhir diperbarui: Maret 2025
          </p>
        </div>

        {/* Informasi yang Kami Kumpulkan */}
        <div className="legal-section">
          <h2><span className="legal-section-number">2</span> Informasi yang Kami Kumpulkan</h2>
          <p>Kami mengumpulkan informasi personal berikut:</p>
          
          <h3>Informasi yang Anda Berikan Secara Langsung:</h3>
          <ul>
            <li>Nama lengkap</li>
            <li>Alamat email</li>
            <li>Password dan pertanyaan keamanan</li>
            <li>Nomor telepon (opsional)</li>
            <li>Profil pengguna dan preferensi pembelajaran</li>
          </ul>

          <h3>Informasi yang Dikumpulkan Secara Otomatis:</h3>
          <ul>
            <li>Alamat IP Anda</li>
            <li>Jenis browser dan perangkat yang Anda gunakan</li>
            <li>Halaman yang Anda kunjungi</li>
            <li>Waktu dan durasi kunjungan</li>
            <li>Cookies dan teknologi pelacakan serupa</li>
          </ul>
        </div>

        {/* Penggunaan Informasi */}
        <div className="legal-section">
          <h2><span className="legal-section-number">3</span> Bagaimana Kami Menggunakan Informasi Anda</h2>
          <p>Kami menggunakan informasi yang kami kumpulkan untuk:</p>
          <ul>
            <li>Menyediakan, memelihara, dan meningkatkan Layanan kami</li>
            <li>Mengelola akun Anda dan memberikan dukungan pelanggan</li>
            <li>Mengirimkan informasi penting dan update tentang akun Anda</li>
            <li>Merespons pertanyaan dan permintaan Anda</li>
            <li>Mengirimkan newsletter dan promosi (dengan persetujuan Anda)</li>
            <li>Melakukan analisis dan riset untuk meningkatkan Layanan</li>
            <li>Mencegah fraud dan kegiatan ilegal</li>
            <li>Mematuhi kewajiban hukum dan peraturan</li>
          </ul>
        </div>

        {/* Perlindungan Data */}
        <div className="legal-section">
          <h2><span className="legal-section-number">4</span> Perlindungan Data Anda</h2>
          <p>
            Kami menggunakan berbagai teknik keamanan untuk melindungi informasi personal Anda, termasuk:
          </p>
          <ul>
            <li>Enkripsi SSL/TLS untuk semua komunikasi</li>
            <li>Password hashing dengan algoritma bcryptjs</li>
            <li>Akses terbatas ke data personal</li>
            <li>Audit keamanan reguler</li>
            <li>Backup data secara berkala</li>
            <li>Compliance dengan standar keamanan internasional</li>
          </ul>
          <p>
            Meskipun kami melakukan upaya maksimal untuk melindungi data Anda, tidak ada sistem keamanan yang 100% aman. Kami tidak dapat menjamin keamanan mutlak.
          </p>
        </div>

        {/* Pembagian Data */}
        <div className="legal-section">
          <h2><span className="legal-section-number">5</span> Pembagian Informasi</h2>
          <p>
            Kami <span className="highlight">tidak akan pernah</span> menjual atau membagikan informasi personal Anda kepada pihak ketiga tanpa persetujuan Anda, kecuali:
          </p>
          <ul>
            <li>Diwajibkan oleh hukum atau proses hukum</li>
            <li>Untuk melayani penyedia layanan yang membantu kami beroperasi (misalnya: hosting, payment processor)</li>
            <li>Untuk melindungi hak, privasi, keamanan kami atau orang lain</li>
            <li>Dalam keadaan merger, akuisisi, atau penjualan aset</li>
          </ul>
        </div>

        {/* Cookies */}
        <div className="legal-section">
          <h2><span className="legal-section-number">6</span> Cookies dan Teknologi Pelacakan</h2>
          <p>
            Kami menggunakan cookies untuk meningkatkan pengalaman Anda di Platform kami. Cookies adalah file kecil yang disimpan di perangkat Anda dan membantu kami mengingat preferensi Anda.
          </p>
          <h3>Jenis Cookies yang Kami Gunakan:</h3>
          <ul>
            <li><span className="highlight">Essential Cookies</span>: Diperlukan untuk fungsi dasar Platform</li>
            <li><span className="highlight">Performance Cookies</span>: Membantu kami memahami bagaimana Anda menggunakan Platform</li>
            <li><span className="highlight">Preference Cookies</span>: Mengingat pilihan dan pengguna</li>
          </ul>
          <p>
            Anda dapat mengontrol dan menghapus cookies melalui pengaturan browser Anda. Namun, menghapus cookies mungkin mempengaruhi fungsionalitas Platform.
          </p>
        </div>

        {/* Hak Anda */}
        <div className="legal-section">
          <h2><span className="legal-section-number">7</span> Hak Anda</h2>
          <p>Anda memiliki hak untuk:</p>
          <ul>
            <li>Mengakses data personal Anda yang kami simpan</li>
            <li>Meminta koreksi data yang tidak akurat</li>
            <li>Meminta penghapusan data Anda (Right to be Forgotten)</li>
            <li>Menolak penggunaan data untuk tujuan pemasaran</li>
            <li>Menerima copy data Anda dalam format yang dapat dibawa (Data Portability)</li>
            <li>Mengajukan keluhan kepada otoritas perlindungan data</li>
          </ul>
          <p>
            Untuk menggunakan hak-hak ini, silakan hubungi kami melalui email: privacy@tradingplatform.com
          </p>
        </div>

        {/* Retensi Data */}
        <div className="legal-section">
          <h2><span className="legal-section-number">8</span> Retensi Data</h2>
          <p>
            Kami menyimpan informasi personal Anda selama akun Anda aktif atau sesuai dengan keperluan hukum. Anda dapat meminta penghapusan akun Anda kapan saja. Setelah penghapusan, kami akan menghapus data Anda dalam waktu 30 hari, kecuali kami diwajibkan untuk menyimpannya untuk alasan hukum.
          </p>
        </div>

        {/* Perubahan Kebijakan */}
        <div className="legal-section">
          <h2><span className="legal-section-number">9</span> Perubahan pada Kebijakan Privasi</h2>
          <p>
            Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Jika ada perubahan material, kami akan memberitahu Anda melalui email atau pemberitahuan yang menonjol di Platform. Penggunaan Layanan yang berkelanjutan berarti Anda menerima perubahan-perubahan ini.
          </p>
        </div>

        {/* Hubungi Kami */}
        <div className="legal-section">
          <h2><span className="legal-section-number">10</span> Hubungi Kami</h2>
          <p>Pertanyaan tentang kebijakan privasi? Hubungi kami:</p>
          <div className="legal-contact-box">
            <a href="https://wa.me/62895404147521" target="_blank" rel="noreferrer" className="legal-contact-item">
              <span className="legal-contact-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></span>
              +62 895 404 147 521
            </a>
            <a href="mailto:r0895404147521@gmail.com" className="legal-contact-item">
              <span className="legal-contact-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
              r0895404147521@gmail.com
            </a>
          </div>
        </div>
      </div>

      <div className="legal-back">
        <Link href="/">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
