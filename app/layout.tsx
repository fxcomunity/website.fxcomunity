import type { Metadata } from 'next'
import './globals.css'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'FXCOMMUNITY - Platform Edukasi Trading & Komunitas Digital',
  description: 'FXCOMMUNITY adalah platform edukasi trading terpercaya untuk trader Indonesia. Dapatkan materi pembelajaran, analisis forex terkini, dan bergabung dengan komunitas trader profesional.',
  keywords: ['trading', 'forex', 'edukasi trading', 'komunitas trader', 'analisis forex', 'pembelajaran trading'],
  authors: [{ name: 'FXCOMMUNITY' }],
  openGraph: {
    title: 'FXCOMMUNITY - Platform Edukasi Trading Terbaik',
    description: 'Belajar trading dari komunitas trader profesional. Akses materi edukatif, webinar, dan tools trading terlengkap.',
    url: 'https://fxcommunity.com',
    siteName: 'FXCOMMUNITY',
    type: 'website',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: 'var(--bg)', color: 'var(--text)' }}>
        {children}
        <Footer />
      </body>
    </html>
  )
}
