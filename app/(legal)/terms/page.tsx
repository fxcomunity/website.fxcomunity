'use client'
import Link from 'next/link'
import '../legal-pages.css'

export default function TermsPage() {
  return (
    <div className="legal-container">
      <div className="legal-header">
        <div className="legal-header-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Syarat &amp; Ketentuan
        </div>
        <h1>Syarat dan Ketentuan Penggunaan</h1>
        <p>Perjanjian penggunaan platform FXCOMUNITY</p>
        <div className="legal-header-meta">
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Diperbarui Maret 2025
          </span>
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Berlaku di Indonesia
          </span>
        </div>
      </div>

      <div className="legal-content">
        {/* Pendahuluan */}
        <div className="legal-section">
          <h2><span className="legal-section-number">1</span> Pendahuluan</h2>
          <p>
            Selamat datang ke Platform kami. Syarat dan Ketentuan ini merupakan perjanjian yang mengikat antara Anda dan kami. Dengan mengakses, mendaftar, atau menggunakan Platform kami, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini.
          </p>
          <p>
            Terakhir diperbarui: Maret 2025
          </p>
        </div>

        {/* Definisi */}
        <div className="legal-section">
          <h2><span className="legal-section-number">2</span> Definisi dan Ketentuan Umum</h2>
          <ul>
            <li><span className="highlight">"Platform"</span> merujuk pada website, aplikasi mobile, dan layanan online kami</li>
            <li><span className="highlight">"Anda" atau "Pengguna"</span> merujuk pada individu yang menggunakan Platform</li>
            <li><span className="highlight">"Kami" atau "Perusahaan"</span> merujuk pada operator Platform</li>
            <li><span className="highlight">"Konten"</span> merujuk pada semua materi di Platform termasuk teks, video, gambar, dan data</li>
            <li><span className="highlight">"Layanan"</span> merujuk pada akses, penggunaan, dan manfaat dari Platform</li>
          </ul>
        </div>

        {/* Hak Penggunaan */}
        <div className="legal-section">
          <h2><span className="legal-section-number">3</span> Hak dan Tanggung Jawab Pengguna</h2>
          
          <h3>Anda Berhak Untuk:</h3>
          <ul>
            <li>Mengakses dan menggunakan Konten untuk tujuan pribadi dan pendidikan</li>
            <li>Membuat akun dan mempertahankan keamanannya</li>
            <li>Memberikan umpan balik dan saran untuk peningkatan Platform</li>
            <li>Menghubungi kami dengan pertanyaan atau kekhawatiran</li>
          </ul>

          <h3>Anda Setuju Untuk Tidak:</h3>
          <ul>
            <li>Menggunakan Platform untuk kegiatan ilegal atau berbahaya</li>
            <li>Menghina, melecehkan, atau mengancam pengguna atau staf lain</li>
            <li>Mengunggah malware, virus, atau kode berbahaya lainnya</li>
            <li>Melakukan akses tidak sah atau hacking ke sistem kami</li>
            <li>Menjual ulang, mengalihkan, atau menyalahgunakan akses ke Layanan</li>
            <li>Melanggar hak kekayaan intelektual kami atau pihak ketiga</li>
            <li>Mengumpulkan atau menggores data secara sistematis dari Platform</li>
            <li>Menggunakan bot otomatis atau script untuk mengakses Platform</li>
          </ul>
        </div>

        {/* Pembatasan Tanggung Jawab */}
        <div className="legal-section">
          <h2><span className="legal-section-number">4</span> Pembatasan Tanggung Jawab</h2>
          
          <h3>Disclaimer Investasi</h3>
          <p>
            <span className="highlight" style={{ fontSize: '1.1rem' }}>PENTING:</span> Semua Konten dan Layanan yang kami sediakan adalah untuk tujuan edukatif saja dan BUKAN merupakan saran investasi atau rekomendasi untuk membeli/menjual instrumen finansial apapun.
          </p>
          <ul>
            <li>Trading dan investasi melibatkan risiko substansial kehilangan uang</li>
            <li>Kinerja masa lalu bukan jaminan hasil masa depan</li>
            <li>Setiap keputusan investasi adalah tanggung jawab pribadi Anda</li>
            <li>Konsultasikan dengan profesional keuangan berlisensi sebelum berinvestasi</li>
          </ul>

          <h3>Konten "Sebagaimana Adanya"</h3>
          <p>
            Platform dan semua Konten disediakan "sebagaimana adanya" tanpa jaminan apa pun, baik tersurat maupun tersirat, termasuk jaminan untuk keadaan yang layak untuk diperdagangkan atau kesesuaian untuk tujuan tertentu.
          </p>

          <h3>Batasan Liabilitas</h3>
          <p>
            Dalam keadaan apa pun, kami tidak akan bertanggung jawab kepada Anda untuk:
          </p>
          <ul>
            <li>Kerugian finansial atau ekonomi langsung atau tidak langsung</li>
            <li>Hilangnya data, pendapatan, keuntungan, atau peluang bisnis</li>
            <li>Kerusakan atau kehilangan yang timbul dari penggunaan Platform</li>
            <li>Akses tidak sah ke data pribadi Anda</li>
          </ul>
        </div>

        {/* Hak Kekayaan Intelektual */}
        <div className="legal-section">
          <h2><span className="legal-section-number">5</span> Hak Kekayaan Intelektual</h2>
          <p>
            Semua Konten, desain, dan fungsionalitas Platform termasuk tetapi tidak terbatas pada teks, grafis, logo, gambar, video, dan kode adalah milik kami atau pemberi lisensi kami dan dilindungi oleh hukum hak cipta internasional.
          </p>
          <p>
            Anda tidak diberikan lisensi atau hak apa pun untuk:
          </p>
          <ul>
            <li>Mereproduksi, mendistribusikan, atau menampilkan Konten</li>
            <li>Memodifikasi atau membuat karya turunan dari Konten</li>
            <li>Menyalin atau menggunakan Konten untuk kepentingan komersial</li>
            <li>Menghapus atau mengaburkan pemberitahuan hak cipta atau pemilik</li>
          </ul>
        </div>

        {/* Pembatasan Layanan */}
        <div className="legal-section">
          <h2><span className="legal-section-number">6</span> Ketersediaan dan Pembatasan Layanan</h2>
          <p>
            Kami berusaha untuk menjaga Platform tersedia 24/7, tetapi kami tidak menjamin ketersediaan tanpa gangguan. Kami dapat:
          </p>
          <ul>
            <li>Melakukan pemeliharaan terencana atau tidak terencana</li>
            <li>Menangguhkan atau menghentikan Layanan dengan pemberitahuan atau tanpa pemberitahuan</li>
            <li>Menghapus Konten yang melanggar Syarat dan Ketentuan</li>
            <li>Membatasi akses ke pengguna yang melanggar kebijakan kami</li>
          </ul>
        </div>

        {/* Pemberian Lisensi Pengguna */}
        <div className="legal-section">
          <h2><span className="legal-section-number">7</span> Pemberian Lisensi Konten Pengguna</h2>
          <p>
            Jika Anda mengunggah, mengirimkan, atau memposting Konten apa pun di Platform (termasuk komentar, ulasan, atau pertanyaan), Anda memberikan kami lisensi perpetual, royalty-free, worldwide untuk menggunakan, mereproduksi, dan mendistribusikan Konten tersebut.
          </p>
        </div>

        {/* Akun Pengguna */}
        <div className="legal-section">
          <h2><span className="legal-section-number">8</span> Akun Pengguna</h2>
          <p>
            Anda bertanggung jawab untuk menjaga kerahasiaan password Anda dan semua aktivitas yang terjadi di akun Anda. Kami tidak bertanggung jawab atas penggunaan tidak sah dari password Anda. Anda setuju untuk:
          </p>
          <ul>
            <li>Memberikan informasi yang akurat dan lengkap saat mendaftar</li>
            <li>Memperbarui informasi Anda jika ada perubahan</li>
            <li>Segera memberi tahu kami tentang akses tidak sah</li>
            <li>Menghormati hak-hak pengguna lain</li>
          </ul>
        </div>

        {/* Penghentian Akun */}
        <div className="legal-section">
          <h2><span className="legal-section-number">9</span> Penghentian Akun</h2>
          <p>
            Kami berhak untuk menangguhkan atau menghentikan akun Anda jika:
          </p>
          <ul>
            <li>Anda melanggar Syarat dan Ketentuan ini</li>
            <li>Anda terlibat dalam kegiatan ilegal atau tidak etis</li>
            <li>Anda menghina atau mengancam pengguna atau staf lain</li>
            <li>Anda mengunggah atau menyebarkan materi yang berbahaya</li>
            <li>Kami memiliki alasan lain yang masuk akal untuk melakukannya</li>
          </ul>
          <p>
            Anda juga dapat menghapus akun Anda kapan saja dengan menghubungi tim support kami.
          </p>
        </div>

        {/* Tautan Pihak Ketiga */}
        <div className="legal-section">
          <h2><span className="legal-section-number">10</span> Tautan Pihak Ketiga</h2>
          <p>
            Platform kami mungkin berisi tautan ke website atau layanan pihak ketiga yang bukan di bawah kontrol kami. Kami tidak bertanggung jawab atas:
          </p>
          <ul>
            <li>Konten atau kebijakan pada website pihak ketiga</li>
            <li>Praktik privasi atau keamanan mereka</li>
            <li>Kerugian atau kerusakan yang timbul dari penggunaan website pihak ketiga</li>
          </ul>
          <p>
            Penggunaan website pihak ketiga sepenuhnya adalah tanggung jawab Anda.
          </p>
        </div>

        {/* Hukum yang Berlaku */}
        <div className="legal-section">
          <h2><span className="legal-section-number">11</span> Hukum yang Berlaku dan Yurisdiksi</h2>
          <p>
            Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum Republik Indonesia. Anda setuju bahwa segala sengketa akan diselesaikan melalui pengadilan di Indonesia.
          </p>
        </div>

        {/* Perubahan Syarat */}
        <div className="legal-section">
          <h2><span className="legal-section-number">12</span> Perubahan pada Syarat dan Ketentuan</h2>
          <p>
            Kami dapat memperbarui Syarat dan Ketentuan ini kapan saja. Jika ada perubahan material, kami akan memberitahu Anda melalui email atau pemberitahuan yang menonjol di Platform. Penggunaan Platform yang berkelanjutan setelah perubahan berarti Anda menerima Syarat dan Ketentuan yang diperbarui.
          </p>
        </div>

        {/* Hubungi Kami */}
        <div className="legal-section">
          <h2><span className="legal-section-number">13</span> Hubungi Kami</h2>
          <p>Ada pertanyaan tentang Syarat dan Ketentuan ini?</p>
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
