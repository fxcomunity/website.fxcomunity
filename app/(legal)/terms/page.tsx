'use client'
import Link from 'next/link'
import '../legal-pages.css'

export default function TermsPage() {
  return (
    <div className="legal-container">
      <div className="legal-header">
        <h1>⚖️ Syarat dan Ketentuan</h1>
        <p>Perjanjian penggunaan Platform kami</p>
      </div>

      <div className="legal-content">
        {/* Pendahuluan */}
        <div className="legal-section">
          <h2><span>📋</span> Pendahuluan</h2>
          <p>
            Selamat datang ke Platform kami. Syarat dan Ketentuan ini merupakan perjanjian yang mengikat antara Anda dan kami. Dengan mengakses, mendaftar, atau menggunakan Platform kami, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini.
          </p>
          <p>
            Terakhir diperbarui: Maret 2025
          </p>
        </div>

        {/* Definisi */}
        <div className="legal-section">
          <h2><span>📖</span> Definisi dan Ketentuan Umum</h2>
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
          <h2><span>✅</span> Hak dan Tanggung Jawab Pengguna</h2>
          
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
          <h2><span>⚠️</span> Pembatasan Tanggung Jawab</h2>
          
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
          <h2><span>🎨</span> Hak Kekayaan Intelektual</h2>
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
          <h2><span>🔧</span> Ketersediaan dan Pembatasan Layanan</h2>
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
          <h2><span>📄</span> Pemberian Lisensi Konten Pengguna</h2>
          <p>
            Jika Anda mengunggah, mengirimkan, atau memposting Konten apa pun di Platform (termasuk komentar, ulasan, atau pertanyaan), Anda memberikan kami lisensi perpetual, royalty-free, worldwide untuk menggunakan, mereproduksi, dan mendistribusikan Konten tersebut.
          </p>
        </div>

        {/* Akun Pengguna */}
        <div className="legal-section">
          <h2><span>👤</span> Akun Pengguna</h2>
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
          <h2><span>🚫</span> Penghentian Akun</h2>
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
          <h2><span>🔗</span> Tautan Pihak Ketiga</h2>
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
          <h2><span>⚖️</span> Hukum yang Berlaku dan Yurisdiksi</h2>
          <p>
            Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum Republik Indonesia. Anda setuju bahwa segala sengketa akan diselesaikan melalui pengadilan di Indonesia.
          </p>
        </div>

        {/* Perubahan Syarat */}
        <div className="legal-section">
          <h2><span>📝</span> Perubahan pada Syarat dan Ketentuan</h2>
          <p>
            Kami dapat memperbarui Syarat dan Ketentuan ini kapan saja. Jika ada perubahan material, kami akan memberitahu Anda melalui email atau pemberitahuan yang menonjol di Platform. Penggunaan Platform yang berkelanjutan setelah perubahan berarti Anda menerima Syarat dan Ketentuan yang diperbarui.
          </p>
        </div>

        {/* Hubungi Kami */}
        <div className="legal-section">
          <h2><span>💬</span> Hubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami:
          </p>
          <ul>
            <li>📧 Email: legal@tradingplatform.com</li>
            <li>💬 WhatsApp: +62 895 404 147 521</li>
            <li>📍 Alamat: Indonesia</li>
          </ul>
        </div>
      </div>

      <div className="legal-back">
        <Link href="/">
          ← Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
