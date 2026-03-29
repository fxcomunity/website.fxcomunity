import type { Metadata } from 'next'
import './globals.css'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'FXCOMMUNITY',
  description: 'FXCOMMUNITY Platform',
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
