'use client'

import React from 'react'
import Link from 'next/link'

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#06060f] flex flex-col items-center justify-center p-4 font-sans text-white">
      {children}
    </div>
  )
}

export function BrandLogo() {
  return (
    <div className="mb-8 flex flex-col items-center">
      <img src="/logo.png" alt="Logo" className="w-16 h-16 mb-2" />
      <h1 className="text-xl font-black tracking-widest text-white">FX COMMUNITY</h1>
    </div>
  )
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[440px] bg-[#0a0a1a] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
      {children}
    </div>
  )
}

export function CardHeader({ icon, title, subtitle }: { icon: string, title: string, subtitle: string }) {
  return (
    <div className="px-8 pt-10 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#00e5ff] to-[#c720e6] bg-clip-text text-transparent">{title}</h2>
      <p className="text-xs text-[#5a5a8a] leading-relaxed">{subtitle}</p>
    </div>
  )
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-bold text-[#5a5a8a] uppercase tracking-wider mb-2 ml-1">
      {children}
    </label>
  )
}

export function TextInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 bg-[#13132a] border border-[#00e5ff1f] rounded-xl text-sm text-[#e0e0ff] outline-none transition-all focus:border-[#00e5ff73] focus:ring-4 focus:ring-[#00e5ff14]"
    />
  )
}

export function PrimaryButton({ children, loading, disabled, ...props }: any) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className="w-full py-4 bg-gradient-to-r from-[#00e5ff] to-[#00b8d4] text-[#06060f] font-black text-sm rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(0,229,255,0.2)]"
    >
      {loading ? 'Processing...' : children}
    </button>
  )
}

export function BackToLogin() {
  return (
    <Link href="/login" className="mt-8 text-xs font-bold text-[#5a5a8a] hover:text-[#00e5ff] transition-colors flex items-center gap-2">
      ← Kembali ke Login
    </Link>
  )
}
