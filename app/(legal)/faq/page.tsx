'use client'
import { useState } from 'react'
import Link from 'next/link'
import '../legal-pages.css'

const faqs = [
  { id: 1, question: 'Bagaimana cara mendaftar di platform ini?', answer: 'Klik tombol "Daftar" di halaman utama, isi form dengan email dan password yang valid, lalu konfirmasi email Anda. Setelah itu Anda langsung bisa mengakses semua materi pembelajaran.' },
  { id: 2, question: 'Apakah ada biaya untuk menggunakan platform?', answer: 'Platform kami menyediakan banyak materi gratis untuk semua pengguna. Beberapa materi premium mungkin tersedia di masa depan, namun kami akan memberikan informasi yang jelas sebelumnya.' },
  { id: 3, question: 'Berapa lama saya bisa mengakses materi pembelajaran?', answer: 'Setelah mendaftar, Anda memiliki akses seumur hidup ke semua materi yang tersedia. Belajar kapan saja dan di mana saja sesuai kecepatan Anda.' },
  { id: 4, question: 'Apakah ada jaminan kesuksesan trading?', answer: 'Tidak ada jaminan kesuksesan dalam trading. Platform kami memberikan pengetahuan dan alat bantu belajar, tetapi hasil akhir bergantung pada keputusan dan disiplin Anda. Trading memiliki risiko kehilangan modal.' },
  { id: 5, question: 'Bagaimana cara menghubungi tim support?', answer: 'Hubungi tim support kami melalui WhatsApp (+62 895 404 147 521) atau email. Kami biasanya merespons dalam waktu 24 jam pada hari kerja.' },
  { id: 6, question: 'Apakah saya bisa berhenti berlangganan kapan saja?', answer: 'Ya, jika ada paket berlangganan premium di masa depan, Anda dapat membatalkannya kapan saja tanpa pertanyaan tambahan.' },
  { id: 7, question: 'Apakah ada komunitas untuk berdiskusi?', answer: 'Ya! Kami memiliki komunitas aktif di WhatsApp tempat Anda berbagi pengalaman, bertanya, dan belajar bersama member lain.' },
  { id: 8, question: 'Bagaimana keamanan data saya dijamin?', answer: 'Kami menggunakan enkripsi SSL/TLS, password hashing dengan bcrypt, dan mengikuti standar keamanan internasional. Data Anda tidak akan pernah dijual atau dibagikan kepada pihak ketiga.' },
  { id: 9, question: 'Bisakah saya mengunduh materi untuk offline?', answer: 'Ya, materi PDF dapat diunduh untuk belajar offline. Tombol "Unduh" tersedia di halaman Library untuk setiap materi yang tersedia.' },
  { id: 10, question: 'Apakah ada sertifikat setelah menyelesaikan materi?', answer: 'Saat ini kami belum menyediakan sertifikat resmi. Namun tersedia progress tracking dan quiz untuk mengukur pemahaman Anda.' },
]

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const toggle = (id: number) => setExpandedId(expandedId === id ? null : id)

  return (
    <div className="legal-container">
      {/* Header */}
      <div className="legal-header">
        <div className="legal-header-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          FAQ
        </div>
        <h1>Pertanyaan yang Sering Diajukan</h1>
        <p>Temukan jawaban atas pertanyaan umum seputar platform kami</p>
        <div className="legal-header-meta">
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Diperbarui Maret 2025
          </span>
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            {faqs.length} Pertanyaan
          </span>
        </div>
      </div>

      <div className="legal-content">
        {/* FAQ Accordion */}
        <div className="legal-section" style={{ padding: '20px 24px' }}>
          <h2 style={{ marginBottom: '20px' }}>
            <span className="legal-section-number">?</span>
            FAQ — Pertanyaan Umum
          </h2>
          {faqs.map(faq => {
            const isOpen = expandedId === faq.id
            return (
              <div key={faq.id} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  className={`faq-question ${isOpen ? 'active' : ''}`}
                  onClick={() => toggle(faq.id)}
                >
                  <span className="faq-number">{faq.id}</span>
                  <span style={{ flex: 1 }}>{faq.question}</span>
                  <svg
                    className={`faq-chevron ${isOpen ? 'rotated' : ''}`}
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                  {faq.answer}
                </div>
              </div>
            )
          })}
        </div>

        {/* Contact */}
        <div className="legal-section">
          <h2>
            <span className="legal-section-number">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            Butuh Bantuan Lebih Lanjut?
          </h2>
          <p>Tidak menemukan jawaban yang dicari? Hubungi tim support kami langsung.</p>
          <div className="legal-contact-box">
            <a href="https://wa.me/62895404147521" target="_blank" rel="noreferrer" className="legal-contact-item">
              <span className="legal-contact-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </span>
              WhatsApp: +62 895 404 147 521
            </a>
            <a href="mailto:r0895404147521@gmail.com" className="legal-contact-item">
              <span className="legal-contact-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              Email kami
            </a>
            <span className="legal-contact-item" style={{ cursor: 'default' }}>
              <span className="legal-contact-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
              Senin – Jumat, 09.00 – 17.00 WIB
            </span>
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
