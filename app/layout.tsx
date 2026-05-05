import type { Metadata } from 'next'
import './globals.css'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'FXCOMMUNITY - Platform Edukasi Trading & Komunitas Digital',
  description: 'FXCOMMUNITY adalah platform edukasi trading terpercaya untuk trader Indonesia. Dapatkan materi pembelajaran, analisis forex terkini, dan bergabung dengan komunitas trader profesional.',
  keywords: ['trading', 'forex', 'edukasi trading', 'komunitas trader', 'analisis forex', 'pembelajaran trading', 'belajar forex', 'sinyal trading', 'strategi forex', 'forex indonesia', 'trading online', 'investasi forex'],
  authors: [{ name: 'FXCOMMUNITY' }],
  creator: 'FXCOMMUNITY',
  publisher: 'FXCOMMUNITY',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'bMcrbVkDLHds5_WoAtgFh8qu0pbqZoNqRAm1czvSgrA',
  },
  openGraph: {
    title: 'FXCOMMUNITY - Platform Edukasi Trading Terbaik',
    description: 'Belajar trading dari komunitas trader profesional. Akses materi edukatif, webinar, dan tools trading terlengkap.',
    url: 'https://fxcomunity.vercel.app',
    siteName: 'FXCOMMUNITY',
    type: 'website',
    locale: 'id_ID',
    images: [
      {
        url: 'https://fxcomunity.vercel.app/og-image.png', // ✅ URL absolut
        width: 1200,
        height: 630,
        alt: 'FXCOMMUNITY - Platform Edukasi Trading',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FXCOMMUNITY - Platform Edukasi Trading Terbaik',
    description: 'Belajar trading dari komunitas trader profesional. Akses materi edukatif, webinar, dan tools trading terlengkap.',
    images: ['https://fxcomunity.vercel.app/og-image.png'], // ✅ URL absolut
  },
  alternates: {
    canonical: 'https://fxcomunity.vercel.app',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  category: 'education',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, background: 'var(--bg)', color: 'var(--text)' }}>
        {children}
        <Footer />
      </body>
    </html>
  )
}
