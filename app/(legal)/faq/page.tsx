'use client'
import { useState } from 'react'
import Link from 'next/link'
import '../legal-pages.css'

interface FAQItem {
  id: number
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    id: 1,
    question: 'Bagaimana cara mendaftar di platform ini?',
    answer: 'Anda dapat mendaftar dengan mengklik tombol "Daftar" di halaman utama, mengisi form dengan email dan password yang valid, kemudian mengkonfirmasi email Anda. Setelah itu, Anda dapat langsung mengakses semua materi pembelajaran.'
  },
  {
    id: 2,
    question: 'Apakah ada biaya untuk menggunakan platform?',
    answer: 'Platform kami menyediakan banyak materi gratis untuk semua pengguna. Beberapa materi premium mungkin tersedia di masa depan, namun kami akan memberikan informasi yang jelas sebelumnya.'
  },
  {
    id: 3,
    question: 'Berapa lama saya bisa mengakses materi pembelajaran?',
    answer: 'Setelah Anda mendaftar, Anda akan memiliki akses seumur hidup ke semua materi pembelajaran yang tersedia. Anda dapat belajar kapan saja dan dimana saja sesuai dengan kecepatan Anda sendiri.'
  },
  {
    id: 4,
    question: 'Apakah ada jaminan kesuksesan trading?',
    answer: 'Tidak ada jaminan kesuksesan dalam trading. Platform kami memberikan pengetahuan dan alat untuk membantu Anda belajar, tetapi hasil akhir tergantung pada keputusan dan disiplin Anda sendiri. Trading memiliki risiko kehilangan modal.'
  },
  {
    id: 5,
    question: 'Bagaimana cara menghubungi tim support?',
    answer: 'Anda dapat menghubungi tim support kami melalui WhatsApp, email, atau melalui form kontak di website. Kami biasanya merespons dalam waktu 24 jam.'
  },
  {
    id: 6,
    question: 'Apakah saya bisa dengan berhenti berlangganan kapan saja?',
    answer: 'Ya, jika ada paket berlangganan premium di masa depan, Anda dapat dengan mudah membatalkannya kapan saja tanpa pertanyaan lebih lanjut.'
  },
  {
    id: 7,
    question: 'Apakah ada komunitas atau forum untuk berdiskusi?',
    answer: 'Ya, kami memiliki komunitas online yang aktif dimana Anda dapat berbagi pengalaman, bertanya, dan saling belajar dengan member lain. Bergabunglah dengan kami di WhatsApp atau followers di media sosial.'
  },
  {
    id: 8,
    question: 'Bagaimana keamanan data saya dijamin?',
    answer: 'Kami menggunakan enkripsi tingkat enterprise dan mengikuti standar keamanan internasional untuk melindungi data Anda. Password Anda disimpan dengan aman dan tidak akan pernah dibagikan kepada pihak ketiga.'
  },
  {
    id: 9,
    question: 'Bisakah saya mengunduh materi untuk offline?',
    answer: 'Ya, beberapa materi dapat diunduh dalam format PDF untuk memudahkan Anda belajar offline. Pastikan Anda memiliki ruang penyimpanan yang cukup di perangkat Anda.'
  },
  {
    id: 10,
    question: 'Apakah ada sertifikat setelah menyelesaikan kursus?',
    answer: 'Saat ini, kami belum menyediakan sertifikat resmi. Namun, kami menyediakan progress tracking dan quiz untuk mengukur pemahaman Anda terhadap materi.'
  }
]

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const toggleFAQ = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="legal-container">
      <div className="legal-header">
        <h1>❓ Pertanyaan yang Sering Diajukan</h1>
        <p>Temukan jawaban atas pertanyaan umum tentang platform kami</p>
      </div>

      <div className="legal-content">
        <div className="legal-section">
          <h2><span>💬</span> FAQ</h2>
          <p style={{ marginBottom: '24px' }}>
            Berikut adalah pertanyaan yang sering diajukan oleh member kami. Jika Anda memiliki pertanyaan yang tidak ada di sini, silakan hubungi tim support kami.
          </p>

          {faqs.map((faq) => (
            <div key={faq.id} className="faq-item">
              <div
                className="faq-question"
                onClick={() => toggleFAQ(faq.id)}
              >
                <span style={{ fontSize: '18px' }}>
                  {expandedId === faq.id ? '▼' : '▶'}
                </span>
                {faq.question}
              </div>
              {expandedId === faq.id && (
                <div className="faq-answer">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Additional Help */}
        <div className="legal-section">
          <h2><span>🆘</span> Butuh Bantuan Lebih Lanjut?</h2>
          <p>
            Jika Anda tidak menemukan jawaban yang Anda cari, silakan hubungi tim support kami:
          </p>
          <ul>
            <li>📧 Email: support@tradingplatform.com</li>
            <li>💬 WhatsApp: +62 895 404 147 521</li>
            <li>🕐 Jam Kerja: Senin - Jumat, 09:00 - 17:00 WIB</li>
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
