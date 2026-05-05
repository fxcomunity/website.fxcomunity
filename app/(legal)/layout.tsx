import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Informasi Legal - FXCOMMUNITY',
  description: 'Syarat & Ketentuan, Kebijakan Privasi, dan informasi legal FXCOMMUNITY',
}

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
    </div>
  )
}
