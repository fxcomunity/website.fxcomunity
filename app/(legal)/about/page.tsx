'use client'
import Link from 'next/link'
import '../legal-pages.css'

export default function AboutPage() {
  return (
    <div className="legal-container">
      <div className="legal-header">
        <h1>📖 Tentang Kami</h1>
        <p>Mengenal lebih lanjut tentang misi dan visi kami</p>
      </div>

      <div className="legal-content">
        {/* Visi Misi */}
        <div className="legal-section">
          <h2><span>🎯</span> Visi & Misi Kami</h2>
          <p>
            Kami adalah platform edukasi terkemuka yang berkomitmen untuk memberdayakan individu melalui akses ke pengetahuan berkualitas tinggi tentang forex, saham, cryptocurrency, dan instrumen finansial lainnya.
          </p>
          <h3>Visi</h3>
          <p>
            Menjadi platform pembelajaran terpercaya yang menginspirasi jutaan trader dan investor untuk mencapai kebebasan finansial melalui pengetahuan yang tepat.
          </p>
          <h3>Misi</h3>
          <ul>
            <li>Menyediakan materi edukasi berkualitas tinggi yang mudah dipahami oleh semua level trader</li>
            <li>Membangun komunitas pembelajaran yang saling mendukung dan berbagi pengetahuan</li>
            <li>Menghadirkan inovasi dalam metode pembelajaran trading online</li>
            <li>Memberdayakan masyarakat Indonesia untuk meraih kesempatan finansial global</li>
          </ul>
        </div>

        {/* Sejarah */}
        <div className="legal-section">
          <h2><span>🏢</span> Sejarah Kami</h2>
          <p>
            Didirikan pada tahun 2022, kami memulai dengan visi sederhana: membuat pendidikan finansial dapat diakses oleh semua orang. Dimulai dari sekelompok kecil profesional trading, kami telah berkembang menjadi platform dengan ribuan member aktif.
          </p>
          <p>
            Setiap hari, kami terus berinovasi dan meningkatkan kualitas konten untuk memastikan member kami mendapatkan nilai terbaik dan informasi yang paling relevan.
          </p>
        </div>

        {/* Nilai Inti */}
        <div className="legal-section">
          <h2><span>💎</span> Nilai Inti Kami</h2>
          <h3>Transparansi</h3>
          <p>Kami percaya pada kejujuran penuh dalam semua komunikasi dan operasi kami.</p>
          
          <h3>Kualitas</h3>
          <p>Setiap konten dan layanan kami dirancang dengan standar kualitas tertinggi.</p>
          
          <h3>Inovasi</h3>
          <p>Kami terus berinovasi untuk memberikan pengalaman pembelajaran terbaik.</p>
          
          <h3>Integritas</h3>
          <p>Etika bisnis dan tanggung jawab sosial adalah komitmen kami yang tak tergoyahkan.</p>
        </div>

        {/* Tim */}
        <div className="legal-section">
          <h2><span>👥</span> Tim Kami</h2>
          <p>
            Tim kami terdiri dari para profesional berpengalaman dari berbagai bidang, termasuk trader bersertifikat, analis teknis, dan web developer berbakat. Bersama-sama, kami bekerja dengan dedikasi untuk memberikan yang terbaik bagi komunitas kami.
          </p>
          <p>
            Dengan pengalaman lebih dari 50 tahun secara kolektif di industri finansial, kami memahami kebutuhan trader dan investor modern.
          </p>
        </div>

        {/* Pencapaian */}
        <div className="legal-section">
          <h2><span>🏆</span> Pencapaian Kami</h2>
          <ul>
            <li>Melayani lebih dari 10,000+ member aktif</li>
            <li>150+ materi pembelajaran berkualitas tinggi</li>
            <li>95% tingkat kepuasan member</li>
            <li>Tersedia di platform web, mobile, dan desktop</li>
            <li>Komunitas online yang aktif dan suportif</li>
          </ul>
        </div>

        {/* Komitmen */}
        <div className="legal-section">
          <h2><span>🤝</span> Komitmen Kami</h2>
          <p>
            Kami berkomitmen untuk terus meningkatkan platform kami dengan:
          </p>
          <ul>
            <li>Menambah materi pembelajaran baru setiap bulan</li>
            <li>Memberikan support customer service yang responsif</li>
            <li>Menjaga keamanan data dan privasi member</li>
            <li>Mengikuti perkembangan pasar finansial global terkini</li>
            <li>Memberikan update dan improvement secara berkelanjutan</li>
          </ul>
        </div>

        {/* Hubungi Kami */}
        <div className="legal-section">
          <h2><span>📞</span> Hubungi Kami</h2>
          <p>
            Kami senang mendengar kabar dari Anda. Jika Anda memiliki pertanyaan atau saran, jangan ragu untuk menghubungi kami:
          </p>
          <ul>
            <li>📧 Email: info@tradingplatform.com</li>
            <li>💬 WhatsApp: +62 895 404 147 521</li>
            <li>📸 Instagram: @si.palingjack</li>
            <li>🎵 TikTok: @uciii0106</li>
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
