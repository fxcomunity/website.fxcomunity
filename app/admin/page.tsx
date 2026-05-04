'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Chart, registerables } from "chart.js"
import './admin.css'

Chart.register(...registerables)

interface StatCardProps {
  label: string;
  value: number;
  color: "blue" | "green" | "purple" | "orange" | "teal";
  icon: React.ReactNode;
}

const IconPDF = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21a8 8 0 10-16 0" />
  </svg>
)
const IconDownload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)
const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const colorMap = {
  blue: { accent: "#3b82f6", light: "#60a5fa", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.18)", glow: "rgba(59,130,246,0.2)" },
  green: { accent: "#10b981", light: "#34d399", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.18)", glow: "rgba(16,185,129,0.2)" },
  purple: { accent: "#8b5cf6", light: "#a78bfa", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.18)", glow: "rgba(139,92,246,0.2)" },
  orange: { accent: "#f97316", light: "#fb923c", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.18)", glow: "rgba(249,115,22,0.2)" },
  teal: { accent: "#06b6d4", light: "#22d3ee", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.18)", glow: "rgba(6,182,212,0.2)" },
}

function StatCard({ label, value, color, icon }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div style={{
      background: "#0d1526",
      border: `1px solid ${c.border}`,
      borderRadius: 16,
      padding: "20px 20px 16px",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s, border-color 0.2s",
      cursor: "default",
    }}
      onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${c.accent}, ${c.light})`,
        borderRadius: "16px 16px 0 0",
      }} />
      <div style={{
        position: "absolute", bottom: -20, right: -10,
        width: 90, height: 90, borderRadius: "50%",
        background: c.accent, filter: "blur(30px)", opacity: 0.12,
        pointerEvents: "none",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <p style={{
            fontSize: 10, letterSpacing: "1.4px", textTransform: "uppercase",
            color: "#475569", fontWeight: 500, marginBottom: 8,
          }}>{label}</p>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 32, fontWeight: 500, color: c.light, lineHeight: 1,
          }}>{value}</p>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 11,
          background: c.bg, color: c.light,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </div>
      </div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 10, fontWeight: 600,
        padding: "3px 10px", borderRadius: 20,
        background: c.bg, color: c.light,
        border: `1px solid ${c.border}`,
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: "50%",
          background: c.light,
          boxShadow: `0 0 6px ${c.light}`,
          display: "inline-block",
        }} />
        Live
      </div>
    </div>
  )
}

interface DonutProps {
  id: string;
  data: number[];
  labels: string[];
  colors: string[];
  total: number;
  totalLabel: string;
}

function DonutChart({ id, data, labels, colors, total, totalLabel }: DonutProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const chart = new Chart(ref.current, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: "#0d1526",
          borderWidth: 3,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        animation: { animateRotate: true, duration: 900 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#111c30",
            borderColor: "rgba(99,179,237,0.15)",
            borderWidth: 1,
            titleColor: "#e2e8f0",
            bodyColor: "#94a3b8",
            padding: 12,
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw} (${total > 0 ? Math.round((ctx.raw as number / total) * 100) : 0}%)`,
            },
          },
        },
      },
    })
    return () => chart.destroy()
  }, [data, labels, colors, total])

  return (
    <div style={{ position: "relative", width: 160, height: 160, flexShrink: 0 }}>
      <canvas ref={ref} id={id} aria-label={`Donut chart for ${totalLabel}`} />
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 500, color: "#f0f6ff" }}>{total}</span>
        <span style={{ fontSize: 9, color: "#334155", letterSpacing: "1px", textTransform: "uppercase", marginTop: 3 }}>{totalLabel}</span>
      </div>
    </div>
  )
}

function DashboardLineChart({ monthlyData }: { monthlyData: any[] }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = ref.current.getContext("2d")!

    const gradBlue = ctx.createLinearGradient(0, 0, 0, 220)
    gradBlue.addColorStop(0, "rgba(59,130,246,0.25)")
    gradBlue.addColorStop(1, "rgba(59,130,246,0)")

    const gradPink = ctx.createLinearGradient(0, 0, 0, 220)
    gradPink.addColorStop(0, "rgba(236,72,153,0.15)")
    gradPink.addColorStop(1, "rgba(236,72,153,0)")

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: monthlyData.map(d => d.month),
        datasets: [
          {
            label: "PDF",
            data: monthlyData.map(d => d.pdfs),
            borderColor: "#60a5fa",
            backgroundColor: gradBlue,
            borderWidth: 2.5,
            pointBackgroundColor: "#60a5fa",
            pointBorderColor: "#0d1526",
            pointBorderWidth: 2.5,
            pointRadius: 5,
            pointHoverRadius: 8,
            tension: 0.45,
            fill: true,
          },
          {
            label: "Users",
            data: monthlyData.map(d => d.users),
            borderColor: "#ec4899",
            backgroundColor: gradPink,
            borderWidth: 2,
            borderDash: [6, 4],
            pointBackgroundColor: "#ec4899",
            pointBorderColor: "#0d1526",
            pointBorderWidth: 2.5,
            pointRadius: 5,
            pointHoverRadius: 8,
            tension: 0.45,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1000 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#111c30",
            borderColor: "rgba(99,179,237,0.15)",
            borderWidth: 1,
            titleColor: "#e2e8f0",
            bodyColor: "#94a3b8",
            padding: 12,
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(255,255,255,0.04)" },
            ticks: { color: "#475569", font: { family: "'Outfit', sans-serif", size: 12 } },
            border: { display: false },
          },
          y: {
            grid: { color: "rgba(255,255,255,0.04)" },
            ticks: { color: "#475569", font: { family: "'JetBrains Mono', monospace", size: 11 }, stepSize: 10 },
            border: { display: false },
            min: 0,
          },
        },
        interaction: { mode: "index", intersect: false },
      },
    })
    return () => chart.destroy()
  }, [monthlyData])

  return <canvas ref={ref} aria-label="Grafik pertumbuhan PDF dan User per bulan" />
}

function LegendRow({ color, name, count, pct }: { color: string; name: string; count: number; pct: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: "#64748b", flex: 1 }}>{name}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>
        {count}
        <span style={{ fontSize: 10, color: "#334155", marginLeft: 4 }}>{pct}</span>
      </span>
    </div>
  )
}

function Panel({ title, dotColor, children }: { title: string; dotColor: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#0d1526",
      border: "1px solid rgba(99,179,237,0.08)",
      borderRadius: 18,
      padding: "22px 24px",
      transition: "border-color 0.2s",
      height: "100%",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, boxShadow: `0 0 8px ${dotColor}` }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", letterSpacing: 0.2 }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

interface User { id: number; username?: string; first_name?: string; last_name?: string; email: string; role: string; status: string; created_at: string }
interface PDF { id: number; name: string; url: string; category: string; thumbnail: string; views: number; downloads: number; is_active: boolean }
interface Stats { totalPdf: number; activePdf: number; totalUser: number; totalDownload: number; totalViews: number }
interface AdminRequest {
  id: number
  requester_id: number | null
  requester_username: string | null
  username: string
  email: string
  requested_role: string
  status: 'Pending' | 'Approved' | 'Rejected'
  owner_note: string | null
  owner_username: string | null
  created_at: string
  updated_at: string
}
interface Music {
  id: number
  title: string
  artist: string
  album: string
  file_url: string
  cover_url: string
  genres: { id: number; name: string }[]
}


const CATS = ['fx-basic', 'fx-advanced', 'fx-technical', 'fx-psychology']
const THUMBS = ['📊', '📈', '📉', '📈', '📚', '💰', '⚖️', '🔧', '🌍', '⚠️', '🎯', '💧', '✅', '🔨', '⚡', '📦', '🌊', '🏗️', '🎁', '📍', '🔐', '🕯️', '🎨', '💼', '📖', '🚀', '💎', '📄']

const COLORS = ['#4488ff', '#C720E6', '#28c864', '#FF6B35', '#7aadff', '#e070ff']

// SVG icon helpers
const Ico = ({ d, size = 17 }: { d: string | string[]; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d) ? d : [d]).map((path, i) => <path key={i} d={path} />)}
  </svg>
)
const IcoCircle = ({ cx, cy, r }: { cx: number; cy: number; r: number }) => (
  <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="1.8" />
)

// Menu items
const MENU_ITEMS = [
  {
    key: 'dashboard', label: 'Dashboard',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  },
  {
    key: 'pdfs', label: 'Kelola PDF',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" /></svg>
  },
  {
    key: 'users', label: 'Kelola User',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  },
  {
    key: 'music', label: 'Kelola Musik',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
  },
  {
    key: 'music-sql', label: 'Music SQL Runner',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7v10M9 7v10M14 7v10M19 7v10M5 12h14" /><path d="M12 19l-2 2-2-2M12 5l-2-2-2 2" /></svg>
  },
  {
    key: 'notifications', label: 'Notifikasi',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
  },
  {
    key: 'reports', label: 'Laporan User',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
  },
  {
    key: 'access-codes', label: 'Kode Akses & Decoder',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3L15.5 7.5z" /></svg>
  },
  {
    key: 'settings', label: 'Pengaturan',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
  },
  {
    key: 'deploy', label: 'Deploy Website',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
  },
]

export default function AdminPage() {
  const router = useRouter()
  const [me, setMe] = useState<any>(null)
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pdfs, setPdfs] = useState<PDF[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<null | 'add' | 'edit'>(null)
  const [editTarget, setEditTarget] = useState<PDF | null>(null)
  const [form, setForm] = useState({ name: '', url: '', category: 'fx-basic', thumbnail: '📄' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [maintenance, setMaintenance] = useState(false)
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([])
  const [adminForm, setAdminForm] = useState({ username: '', email: '', password: '' })
  const [creatingAdmin, setCreatingAdmin] = useState(false)
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null)
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'info', user_id: 'all' })
  const [sendingNotif, setSendingNotif] = useState(false)
  const [reports, setReports] = useState<any[]>([])
  const [reportFilter, setReportFilter] = useState<{ type: string; status: string }>({ type: 'all', status: 'all' })
  const [musicList, setMusicList] = useState<Music[]>([])
  const [genres, setGenres] = useState<{ id: number; name: string; slug: string }[]>([])
  const [musicForm, setMusicForm] = useState({ id: 0, title: '', artist: '', album: '', file_url: '', cover_url: '', genre_ids: [] as number[] })
  const [musicModal, setMusicModal] = useState<null | 'add' | 'edit'>(null)
  const [editingMusic, setEditingMusic] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [accessCodes, setAccessCodes] = useState<any[]>([])
  const [accessForm, setAccessForm] = useState({ target_tool: 'crypto_decoder', duration_hours: '1' })
  const [generatingCode, setGeneratingCode] = useState(false)
  const [bannedIps, setBannedIps] = useState<any[]>([])
  const [maintenanceModal, setMaintenanceModal] = useState(false)
  const [decoderInput, setDecoderInput] = useState('')
  const [decoderOutput, setDecoderOutput] = useState('')
  const [decoderMethod, setDecoderMethod] = useState('base64')
  const [decodingLoading, setDecodingLoading] = useState(false)
  const [decoderError, setDecoderError] = useState('')
  const [maintenanceCode, setMaintenanceCode] = useState('')
  const [maintenanceCodeEdit, setMaintenanceCodeEdit] = useState('')
  const [loadingMaintenanceCode, setLoadingMaintenanceCode] = useState(false)
  const [savingMaintenanceCode, setSavingMaintenanceCode] = useState(false)
  // Git / Deploy states
  const [gitLoading, setGitLoading] = useState(false)
  const [gitOutput, setGitOutput] = useState('')
  const [gitCommitMsg, setGitCommitMsg] = useState('')
  const [gitHistory, setGitHistory] = useState<{ cmd: string; output: string; time: string; ok: boolean }[]>([])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.data || !['Owner', 'Admin'].includes(d.data.role)) router.push('/library')
      else { setMe(d.data); loadAll() }
    })
  }, [])

  // Re-load data when switching tabs to ensure freshness
  useEffect(() => {
    if (me) loadAll()
  }, [activeMenu])

  async function loadAll() {
    setLoading(true)
    const [pRes, uRes, sRes, reqRes, repRes, mRes, gRes, accRes, banRes] = await Promise.all([
      fetch('/api/pdfs', { next: { revalidate: 0 } }).then(r => r.json()),
      fetch('/api/users', { next: { revalidate: 0 } }).then(r => r.json()),
      fetch('/api/admin/settings', { next: { revalidate: 0 } }).then(r => r.json()),
      fetch('/api/admin/admin-requests', { next: { revalidate: 0 } }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
      fetch('/api/report', { next: { revalidate: 0 } }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
      fetch('/api/music', { next: { revalidate: 0 } }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
      fetch('/api/music/genres', { next: { revalidate: 0 } }).then(r => r.json()).catch(() => ({ success: false, data: [] })),
      me?.role === 'Owner' ? fetch('/api/admin/access-codes', { next: { revalidate: 0 } }).then(r => r.json()).catch(() => ({ success: false, data: [] })) : Promise.resolve({ success: false, data: [] }),
      me?.role && ['Owner', 'Admin'].includes(me.role) ? fetch('/api/admin/banned-ips', { next: { revalidate: 0 } }).then(r => r.json()).catch(() => ({ success: false, data: [] })) : Promise.resolve({ success: false, data: [] })
    ])
    if (pRes.success) setPdfs(pRes.data)
    if (uRes.success) setUsers(uRes.data)
    if (sRes.success && sRes.data) setMaintenance(sRes.data.maintenance_mode === 'true')
    if (reqRes.success) setAdminRequests(reqRes.data || [])
    if (repRes.success) setReports(repRes.data || [])
    if (mRes.success) setMusicList(mRes.data || [])
    if (gRes.success) setGenres(gRes.data || [])
    if (accRes.success) setAccessCodes(accRes.data || [])
    if (banRes.success) setBannedIps(banRes.data || [])
    setLoading(false)
  }

  async function updateReportStatus(id: number, status: string) {
    await fetch('/api/report', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    showToast('✅ Status laporan diperbarui')
  }

  async function deleteReport(id: number) {
    try {
      const res = await fetch('/api/report', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (data.success) {
        setReports(prev => prev.filter(r => Number(r.id) !== Number(id)))
        showToast('🗑️ Laporan dihapus')
      } else {
        showToast('⚠️ ' + (data.message || 'Gagal hapus laporan'))
      }
    } catch {
      showToast('⚠️ Error koneksi saat hapus')
    }
  }

  async function generateAccessCode() {
    setGeneratingCode(true)
    try {
      const res = await fetch('/api/admin/access-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accessForm)
      })
      const data = await res.json()
      if (data.success) {
        showToast('✅ Kode akses berhasil dibuat!')
        setAccessCodes([data.data, ...accessCodes])
      } else {
        showToast('⚠️ ' + data.error)
      }
    } catch {
      showToast('⚠️ Gagal membuat kode akses')
    }
    setGeneratingCode(false)
  }

  async function unbanIp(ip: string) {
    if (!confirm(`Cabut blokir untuk IP ${ip}?`)) return
    try {
      const res = await fetch('/api/admin/banned-ips', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      })
      const data = await res.json()
      if (data.success) {
        showToast('✅ Blokir IP berhasil dicabut')
        setBannedIps(prev => prev.filter(b => b.ip_address !== ip))
      } else {
        showToast('⚠️ ' + data.error)
      }
    } catch {
      showToast('⚠️ Error koneksi saat cabut blokir IP')
    }
  }

  async function decodeText() {
    if (!decoderInput.trim()) {
      setDecoderError('Masukkan teks yang ingin didecode')
      return
    }
    setDecodingLoading(true)
    setDecoderError('')
    try {
      const res = await fetch('/api/crypto/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: decoderInput.trim(), method: decoderMethod })
      })
      const data = await res.json()
      if (data.success) {
        setDecoderOutput(data.result)
      } else {
        setDecoderError(data.error || 'Gagal melakukan decode')
      }
    } catch (e: any) {
      setDecoderError('Error koneksi: ' + e.message)
    }
    setDecodingLoading(false)
  }

  async function saveMusic() {
    const isEdit = musicModal === 'edit'
    setEditingMusic(true)

    try {
      let res: Response
      if (isEdit) {
        // --- EDIT MODE ---
        if (!musicForm.title.trim() || !musicForm.file_url.trim()) {
          showToast('⚠️ Judul dan URL audio wajib diisi')
          setEditingMusic(false)
          return
        }
        res = await fetch(`/api/music/${musicForm.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(musicForm)
        })
      } else {
        // --- ADD MODE (FILE UPLOAD) ---
        if (!uploadFile) {
          showToast('⚠️ Silakan pilih file audio untuk diunggah')
          setEditingMusic(false)
          return
        }
        const formData = new FormData()
        formData.append('audioFile', uploadFile)
        musicForm.genre_ids.forEach(id => formData.append('genre_ids[]', String(id)))

        res = await fetch('/api/music', {
          method: 'POST',
          body: formData,
        })
      }

      const data = await res.json()
      if (data.success) {
        if (isEdit) {
          setMusicList(p => p.map(m => m.id === musicForm.id ? data.data : m))
          showToast('✅ Lagu berhasil diperbarui!')
        } else {
          setMusicList(p => [data.data, ...p])
          showToast('✅ Lagu berhasil diunggah & diproses!')
        }
        setMusicModal(null)
        // Refresh loadAll after success to ensure everything is synced
        loadAll()
      } else {
        showToast(`⚠️ ${data.error || 'Terjadi kesalahan'}`)
      }
    } catch (err) {
      showToast('⚠️ Error saat menyimpan lagu')
    } finally {
      setEditingMusic(false)
    }
  }

  async function deleteMusic(id: number, title: string) {
    if (!confirm(`Hapus musik "${title}"?`)) return
    const res = await fetch(`/api/music/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) { setMusicList(p => p.filter(m => m.id !== id)); showToast('🗑️ Musik dihapus') }
    else showToast('⚠️ Gagal hapus musik')
  }

  function openMusicAdd() {
    setMusicForm({ id: 0, title: '', artist: '', album: '', file_url: '', cover_url: '', genre_ids: [] })
    setUploadFile(null)
    setMusicModal('add')
  }

  function openMusicEdit(song: Music) {
    setMusicForm({
      id: song.id,
      title: song.title,
      artist: song.artist || '',
      album: song.album || '',
      file_url: song.file_url,
      cover_url: song.cover_url || '',
      genre_ids: song.genres?.map(g => g.id) || []
    })
    setMusicModal('edit')
  }

  function handleGenreChange(genreId: number) {
    setMusicForm(f => {
      const newGenreIds = f.genre_ids.includes(genreId)
        ? f.genre_ids.filter(id => id !== genreId)
        : [...f.genre_ids, genreId];
      return { ...f, genre_ids: newGenreIds };
    });
  }


  async function toggleMaintenance() {
    setMaintenanceModal(!maintenanceModal)
    if (!maintenanceModal) {
      // Opening modal - load the maintenance code
      loadMaintenanceCode()
    }
  }

  async function confirmToggleMaintenance() {
    const newVal = !maintenance
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'maintenance_mode', value: String(newVal) })
      })
      const data = await res.json()
      if (data.success) {
        setMaintenance(newVal)
        setMaintenanceModal(false)
        showToast(newVal ? '🚧 Mode Maintenance AKTIF' : '✅ Mode Maintenance MATI')
      } else showToast('⚠️ Gagal ubah maintenance')
    } catch { showToast('⚠️ Error ubah maintenance') }
  }

  async function loadMaintenanceCode() {
    setLoadingMaintenanceCode(true)
    try {
      const res = await fetch('/app/maintenance/page.tsx')
      const code = await res.text()
      setMaintenanceCode(code)
      setMaintenanceCodeEdit(code)
    } catch (e) {
      // If file can't be fetched directly, show placeholder
      setMaintenanceCode('// Halaman Maintenance\n// File: app/maintenance/page.tsx\n\n// Konten halaman maintenance dapat diedit di file tersebut.')
      setMaintenanceCodeEdit('// Halaman Maintenance\n// File: app/maintenance/page.tsx\n\n// Konten halaman maintenance dapat diedit di file tersebut.')
    }
    setLoadingMaintenanceCode(false)
  }

  async function saveMaintenanceCode() {
    if (maintenanceCodeEdit === maintenanceCode) {
      showToast('⚠️ Tidak ada perubahan untuk disimpan')
      return
    }
    setSavingMaintenanceCode(true)
    try {
      // Save to settings as a fallback approach
      const res = await fetch('/api/admin/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'maintenance_code', value: maintenanceCodeEdit })
      })
      const data = await res.json()
      if (data.success) {
        setMaintenanceCode(maintenanceCodeEdit)
        showToast('✅ Kode Maintenance berhasil disimpan!')
      } else {
        showToast('⚠️ Gagal simpan kode')
      }
    } catch (e) {
      showToast('⚠️ Error saat menyimpan kode')
    }
    setSavingMaintenanceCode(false)
  }


  async function runGit(command: string) {
    if (me?.role !== 'Owner') { showToast('⚠️ Hanya Owner yang bisa menjalankan perintah Git'); return }
    setGitLoading(true)
    setGitOutput('')
    try {
      const body: any = { command }
      if (command === 'commit') {
        if (!gitCommitMsg.trim()) { showToast('⚠️ Pesan commit wajib diisi'); setGitLoading(false); return }
        body.message = gitCommitMsg
      }
      const res = await fetch('/api/admin/git', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      const output = data.output || data.error || '(tidak ada output)'
      setGitOutput(output)
      const time = new Date().toLocaleTimeString('id-ID')
      setGitHistory(prev => [{ cmd: `git ${command}`, output, time, ok: data.success }, ...prev].slice(0, 20))
      if (data.success) showToast(`✅ Berhasil: git ${command}`)
      else showToast(`⚠️ Error: ${output.substring(0, 80)}`)
    } catch (e: any) {
      showToast('⚠️ Gagal koneksi ke server')
    }
    setGitLoading(false)
  }

  function openAdd() { setForm({ name: '', url: '', category: 'fx-basic', thumbnail: '📄' }); setEditTarget(null); setModal('add') }
  function openEdit(p: PDF) { setForm({ name: p.name, url: p.url, category: p.category, thumbnail: p.thumbnail }); setEditTarget(p); setModal('edit') }

  async function savePDF() {
    if (!form.name || !form.url) { showToast('⚠️ Nama dan URL wajib diisi'); return }
    setSaving(true)
    try {
      const res = await fetch(editTarget ? `/api/pdfs/${editTarget.id}` : '/api/pdfs', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) { setModal(null); loadAll(); showToast(editTarget ? '✅ PDF diperbarui' : '✅ PDF ditambahkan') }
      else showToast('⚠️ ' + data.error)
    } finally { setSaving(false) }
  }

  async function toggleActive(p: PDF) {
    await fetch(`/api/pdfs/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !p.is_active }) })
    loadAll(); showToast(`${!p.is_active ? '✅ Diaktifkan' : '🚫 Dinonaktifkan'}`)
  }

  async function deletePDF(p: PDF) {
    if (!confirm(`Hapus "${p.name}"?`)) return
    await fetch(`/api/pdfs/${p.id}`, { method: 'DELETE' })
    loadAll(); showToast('🗑️ PDF dihapus')
  }

  async function toggleUserStatus(u: User) {
    // Admin tidak bisa mengubah status user lain
    if (me?.role === 'Admin') {
      showToast('⚠️ Admin tidak memiliki akses untuk mengubah status user')
      return
    }

    const newStatus = u.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif'
    await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, status: newStatus }) })
    loadAll(); showToast(`User ${newStatus === 'Aktif' ? '✅ diaktifkan' : '🚫 dinonaktifkan'}`)
  }

  async function changeUserRole(u: User, newRole: string) {
    // Validasi: hanya Owner bisa ubah role
    if (me?.role !== 'Owner') {
      showToast('⚠️ Hanya Owner yang bisa mengubah role user')
      return
    }

    // Validasi: Owner tidak bisa diturunkan
    if (u.role === 'Owner') {
      showToast('⚠️ Owner tidak bisa diturunkan jabatannya')
      return
    }

    // Validasi: tidak mengubah ke role yang sama
    if (u.role === newRole) {
      showToast('ℹ️ Role sudah sama dengan sebelumnya')
      return
    }

    try {
      const res = await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, role: newRole }) })
      const data = await res.json()
      if (data.success) {
        loadAll()
        showToast(`✅ Role user berubah menjadi ${newRole}`)
      } else showToast('⚠️ ' + (data.error || 'Gagal ubah role'))
    } catch { showToast('⚠️ Gagal ubah role user') }
  }

  async function deleteUser(u: User) {
    if (!confirm(`Hapus user "${u.username}"? Aksi ini tidak bisa dibatalkan.`)) return
    try {
      const res = await fetch('/api/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id }) })
      const data = await res.json()
      if (data.success) { loadAll(); showToast('🗑️ User dihapus') }
      else showToast('⚠️ ' + data.error)
    } catch { showToast('⚠️ Gagal hapus user') }
  }

  async function createAdminCandidate() {
    if (!adminForm.username || !adminForm.email || !adminForm.password) {
      showToast('⚠️ Username, email, dan password wajib diisi')
      return
    }
    if (adminForm.password.length < 6) {
      showToast('⚠️ Password minimal 6 karakter')
      return
    }
    setCreatingAdmin(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...adminForm, role: 'Admin' })
      })
      const data = await res.json()
      if (!data.success) {
        showToast('⚠️ ' + (data.error || 'Gagal tambah admin'))
        return
      }
      setAdminForm({ username: '', email: '', password: '' })
      if (data.mode === 'request') showToast('📝 Permintaan admin dikirim ke Owner')
      else showToast('✅ Admin baru berhasil dibuat')
      loadAll()
    } catch {
      showToast('⚠️ Gagal tambah admin')
    } finally {
      setCreatingAdmin(false)
    }
  }

  async function processAdminRequest(id: number, action: 'approve' | 'reject') {
    const owner_note = action === 'reject' ? (prompt('Alasan penolakan (opsional):') || '') : ''
    setProcessingRequestId(id)
    try {
      const res = await fetch('/api/admin/admin-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, owner_note })
      })
      const data = await res.json()
      if (!data.success) {
        showToast('⚠️ ' + (data.error || 'Gagal memproses request'))
        return
      }
      showToast(action === 'approve' ? '✅ Request disetujui' : '🚫 Request ditolak')
      loadAll()
    } catch {
      showToast('⚠️ Gagal memproses request')
    } finally {
      setProcessingRequestId(null)
    }
  }

  async function sendNotification() {
    if (!notifForm.title || !notifForm.message) {
      showToast('⚠️ Judul dan pesan wajib diisi')
      return
    }
    setSendingNotif(true)
    try {
      // FIX: Convert user_id 'all' -> null, string ID -> number
      const payload = {
        title: notifForm.title,
        message: notifForm.message,
        type: notifForm.type,
        user_id: notifForm.user_id === 'all' ? null : parseInt(notifForm.user_id as string)
      }

      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      console.log('API Response:', data) // Debug
      if (data.success) {
        showToast('✅ Notifikasi berhasil dikirim!')
        setNotifForm({ title: '', message: '', type: 'info', user_id: 'all' })
      } else {
        showToast(`⚠️ Gagal: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Send notification error:', error)
      showToast('⚠️ Network/DB error - Cek console')
    } finally {
      setSendingNotif(false)
    }
  }

  const filteredPdfs = pdfs.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  const filteredUsers = users.filter(u => (u.first_name || u.username || u.email || '').toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  const filteredAdminRequests = adminRequests.filter(r =>
    r.username.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase()) ||
    (r.requester_username || '').toLowerCase().includes(search.toLowerCase())
  )

  // Stats calculation
  const stats: Stats = {
    totalPdf: pdfs.length,
    activePdf: pdfs.filter(p => p.is_active).length,
    totalUser: users.length,
    totalDownload: pdfs.reduce((a, p) => a + p.downloads, 0),
    totalViews: pdfs.reduce((a, p) => a + p.views, 0)
  }

  // Chart data
  const categoryData = CATS.map(cat => ({
    name: cat.replace('fx-', '').toUpperCase(),
    value: pdfs.filter(p => p.category === cat).length
  })).filter(d => d.value > 0)

  const userRoleData = [
    { name: 'Owner', value: users.filter(u => u.role === 'Owner').length },
    { name: 'Admin', value: users.filter(u => u.role === 'Admin').length },
    { name: 'User', value: users.filter(u => u.role === 'User').length },
  ].filter(d => d.value > 0)

  const monthlyData = [
    { month: 'Jan', users: Math.floor(users.length * 0.1), pdfs: Math.floor(pdfs.length * 0.15) },
    { month: 'Feb', users: Math.floor(users.length * 0.15), pdfs: Math.floor(pdfs.length * 0.2) },
    { month: 'Mar', users: Math.floor(users.length * 0.2), pdfs: Math.floor(pdfs.length * 0.25) },
    { month: 'Apr', users: Math.floor(users.length * 0.25), pdfs: Math.floor(pdfs.length * 0.3) },
    { month: 'May', users: Math.floor(users.length * 0.35), pdfs: Math.floor(pdfs.length * 0.4) },
    { month: 'Jun', users: users.length, pdfs: pdfs.length },
  ]

  if (!me) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader"></div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {toast && <div className="toast success">{toast}</div>}

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="admin-mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''} ${mobileOpen ? 'mobile-open' : ''}`} style={{
        width: sidebarOpen ? '256px' : '72px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.28s ease',
        position: 'fixed',
        height: '100vh',
        zIndex: 200,
        overflowX: 'hidden',
      }}>
        {/* Logo */}
        <div className="admin-sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '64px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,229,255,0.25)', color: '#000' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 900, fontSize: '15px', letterSpacing: '-0.3px' }} className="grad-text">FX ADMIN</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.5px' }}>PANEL MANAGEMENT</div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="admin-avatar" style={{ width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0 }}>
              {(me.first_name || me.username || me.email || '?')[0].toUpperCase()}
            </div>
            {sidebarOpen && (
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{me.first_name || me.username || me.email}</p>
                <span className={`badge ${me.role === 'Owner' ? 'badge-orange' : 'badge-purple'}`} style={{ fontSize: '9px', padding: '2px 7px' }}>{me.role}</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
          {MENU_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => {
                if (item.key === 'music-sql') router.push('/admin/music-sql')
                else setActiveMenu(item.key)
                setMobileOpen(false)
              }}
              className={`admin-nav-item ${activeMenu === item.key ? 'active' : ''}`}
              style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '11px 14px' : '11px 0' }}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {sidebarOpen && <span style={{ fontSize: '13.5px' }}>{item.label}</span>}
            </button>
          ))}

          {/* Utility Section */}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button
              onClick={toggleMaintenance}
              className="admin-nav-item"
              style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '11px 14px' : '11px 0', color: maintenance ? '#F87171' : '#4ADE80' }}
            >
              <span className="admin-nav-icon" style={{ background: maintenance ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)' }}>
                {maintenance
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>}
              </span>
              {sidebarOpen && <span style={{ fontSize: '13px' }}>Maintenance {maintenance ? 'ON' : 'OFF'}</span>}
            </button>
            <Link href="/admin/banners-manage" style={{ textDecoration: 'none' }}>
              <div className="admin-nav-item" style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '11px 14px' : '11px 0' }}>
                <span className="admin-nav-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                </span>
                {sidebarOpen && <span style={{ fontSize: '13px' }}>Banner Manager</span>}
              </div>
            </Link>
          </div>
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href="/library" style={{ textDecoration: 'none' }}>
            <div className="admin-nav-item" style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '10px 14px' : '10px 0' }}>
              <span className="admin-nav-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              </span>
              {sidebarOpen && <span style={{ fontSize: '13px' }}>Ke Library</span>}
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="admin-nav-item"
            style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '10px 14px' : '10px 0', marginTop: '2px' }}
          >
            <span className="admin-nav-icon">
              {sidebarOpen
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>}
            </span>
            {sidebarOpen && <span style={{ fontSize: '13px' }}>Collapse</span>}
          </button>
        </div>
      </aside>


      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '256px' : '72px',
        transition: 'margin-left 0.28s ease',
        minHeight: '100vh',
        background: 'var(--bg)',
      }}>
        {/* Topbar */}
        <header className="admin-topbar">
          {/* Hamburger — mobile only */}
          <button
            className="admin-hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle Menu"
          >
            <span /><span /><span />
          </button>
          <div className="admin-topbar-title">
            <div className="admin-topbar-icon">
              {MENU_ITEMS.find(m => m.key === activeMenu)?.icon ?? '⚙️'}
            </div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }} className="grad-text">
                {MENU_ITEMS.find(m => m.key === activeMenu)?.label ?? 'Admin'}
              </h1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Selamat datang</div>
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: 700 }}>{me.first_name || me.username || me.email}</div>
            </div>
            <div className="admin-avatar" style={{ width: '34px', height: '34px', borderRadius: '9px', fontSize: '13px' }}>
              {(me.first_name || me.username || me.email || '?')[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div style={{ padding: '22px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }} className="spin">⚙️</div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Memuat data...</p>
            </div>
          ) : activeMenu === 'dashboard' ? (
            /* DASHBOARD VIEW */
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* ── STAT CARDS ── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                <StatCard label="Total PDF" value={stats.totalPdf} color="blue" icon={<IconPDF />} />
                <StatCard label="PDF Aktif" value={stats.activePdf} color="green" icon={<IconCheck />} />
                <StatCard label="Total User" value={stats.totalUser} color="purple" icon={<IconUser />} />
                <StatCard label="Total Download" value={stats.totalDownload} color="orange" icon={<IconDownload />} />
                <StatCard label="Total View" value={stats.totalViews} color="teal" icon={<IconEye />} />
              </div>

              {/* ── PIE CHARTS ROW ── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
                {/* PDF per Kategori */}
                <Panel title="Distribusi PDF per Kategori" dotColor="#a78bfa">
                  <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
                    <DonutChart
                      id="donutPDF"
                      data={categoryData.map(d => d.value)}
                      labels={categoryData.map(d => d.name)}
                      colors={["#a855f7", "#3b82f6", "#10b981", "#f97316", "#ef4444", "#eab308", "#06b6d4"]}
                      total={stats.totalPdf}
                      totalLabel="Total PDF"
                    />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 13, minWidth: '150px' }}>
                      {categoryData.map((d, i) => (
                        <LegendRow
                          key={d.name}
                          color={["#a855f7", "#3b82f6", "#10b981", "#f97316", "#ef4444", "#eab308", "#06b6d4"][i % 7]}
                          name={d.name}
                          count={d.value}
                          pct={stats.totalPdf ? Math.round((d.value / stats.totalPdf) * 100) + "%" : "0%"}
                        />
                      ))}
                    </div>
                  </div>
                </Panel>

                {/* User per Role */}
                <Panel title="Distribusi User per Role" dotColor="#60a5fa">
                  <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
                    <DonutChart
                      id="donutUser"
                      data={userRoleData.map(d => d.value)}
                      labels={userRoleData.map(d => d.name)}
                      colors={["#3b82f6", "#f97316", "#10b981", "#8b5cf6"]}
                      total={stats.totalUser}
                      totalLabel="Total User"
                    />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 13, minWidth: '150px' }}>
                      {userRoleData.map((d, i) => (
                        <LegendRow
                          key={d.name}
                          color={["#3b82f6", "#f97316", "#10b981", "#8b5cf6"][i % 4]}
                          name={d.name}
                          count={d.value}
                          pct={stats.totalUser ? Math.round((d.value / stats.totalUser) * 100) + "%" : "0%"}
                        />
                      ))}
                      <div style={{
                        marginTop: 10, padding: "12px 14px",
                        background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 10,
                      }}>
                        <p style={{ fontSize: 10, letterSpacing: "1px", textTransform: "uppercase", color: "#334155", marginBottom: 6 }}>Info</p>
                        <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                          {users.filter(u => u.role === 'Owner').length} user aktif dengan role <strong style={{ color: "#60a5fa" }}>Owner</strong> terdaftar di sistem.
                        </p>
                      </div>
                    </div>
                  </div>
                </Panel>
              </div>

              {/* ── LINE CHART ── */}
              <Panel title="Pertumbuhan Users & PDF" dotColor="#60a5fa">
                {/* Legend */}
                <div style={{ display: "flex", gap: 20, marginBottom: 16, marginTop: -6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "#64748b" }}>
                    <div style={{ width: 20, height: 3, borderRadius: 2, background: "#60a5fa" }} />
                    PDF
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "#64748b" }}>
                    <div style={{
                      width: 20, height: 3,
                      background: "repeating-linear-gradient(90deg, #ec4899 0,#ec4899 5px,transparent 5px,transparent 9px)",
                    }} />
                    Users
                  </div>
                </div>

                <div style={{ position: "relative", height: 260 }}>
                  <DashboardLineChart monthlyData={monthlyData} />
                </div>
              </Panel>
            </div>
          ) : activeMenu === 'pdfs' ? (
            /* PDF MANAGEMENT */
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <input className="input" placeholder="🔍 Cari PDF..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '300px' }} />
                <button className="btn btn-primary" onClick={openAdd}>➕ Tambah PDF</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredPdfs.map(pdf => (
                  <div key={pdf.id} className="admin-card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '40px' }}>{pdf.thumbnail}</span>
                      <div style={{ flex: 1 }}>
                        <a href={pdf.url} target="_blank" rel="noreferrer" style={{ fontWeight: 600, fontSize: '14px', color: '#7aadff', textDecoration: 'none' }}>{pdf.name}</a>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <span className="badge badge-blue">{pdf.category}</span>
                          <span className={`badge ${pdf.is_active ? 'badge-green' : 'badge-red'}`}>{pdf.is_active ? 'Aktif' : 'Nonaktif'}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>👁{pdf.views} 📥{pdf.downloads}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(pdf)}>{pdf.is_active ? '🚫' : '✅'}</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(pdf)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deletePDF(pdf)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : activeMenu === 'users' ? (
            /* USER MANAGEMENT */
            <>
              <div className="admin-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    {me?.role === 'Owner' ? '👑' : '📝'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#fff' }}>
                      {me?.role === 'Owner' ? 'Tambah Admin Baru' : 'Ajukan Admin Baru'}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
                      {me?.role === 'Owner' ? 'Tambahkan admin langsung ke sistem.' : 'Kirim pengajuan admin untuk diverifikasi Owner.'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '14px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Username</label>
                    <input className="input" placeholder="contoh: admin123" value={adminForm.username} onChange={e => setAdminForm(f => ({ ...f, username: e.target.value }))} style={{ background: 'rgba(0,0,0,0.2)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</label>
                    <input className="input" type="email" placeholder="admin@example.com" value={adminForm.email} onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))} style={{ background: 'rgba(0,0,0,0.2)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
                    <input className="input" type="password" placeholder="Minimal 6 karakter" value={adminForm.password} onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))} style={{ background: 'rgba(0,0,0,0.2)' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button className="btn btn-primary" onClick={createAdminCandidate} disabled={creatingAdmin} style={{ padding: '10px 24px', borderRadius: '10px' }}>
                    {creatingAdmin ? <><span className="spin" style={{ display: 'inline-block', marginRight: '8px' }}>⚙️</span> Memproses...</> : me?.role === 'Owner' ? '➕ Tambah Admin' : '📨 Ajukan ke Owner'}
                  </button>
                </div>
              </div>

              {me?.role === 'Admin' && (
                <div style={{ background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>ℹ️</span>
                  <span style={{ color: '#ff9970', fontSize: '13px' }}>Sebagai Admin, Anda tidak dapat ubah status user. Untuk admin baru, kirim request ke Owner.</span>
                </div>
              )}

              <div className="admin-card" style={{ padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
                  {me?.role === 'Owner' ? '✅ Verifikasi Permintaan Admin' : '📨 Status Permintaan Admin Saya'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredAdminRequests.length ? filteredAdminRequests.map(r => (
                    <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', background: 'var(--bg4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '13px' }}>{r.username} · {r.email}</p>
                          <p style={{ color: 'var(--text3)', fontSize: '12px' }}>
                            Requester: {r.requester_username || '-'} · {new Date(r.created_at).toLocaleString('id-ID')}
                          </p>
                          {r.owner_note && <p style={{ color: '#ffb26a', fontSize: '12px', marginTop: '4px' }}>Catatan Owner: {r.owner_note}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className={`badge ${r.status === 'Approved' ? 'badge-green' : r.status === 'Rejected' ? 'badge-red' : 'badge-blue'}`}>{r.status}</span>
                          {me?.role === 'Owner' && r.status === 'Pending' && (
                            <>
                              <button className="btn btn-sm" disabled={processingRequestId === r.id} onClick={() => processAdminRequest(r.id, 'approve')} style={{ background: 'rgba(40,200,100,0.2)', color: '#60d090' }}>
                                Setujui
                              </button>
                              <button className="btn btn-sm" disabled={processingRequestId === r.id} onClick={() => processAdminRequest(r.id, 'reject')} style={{ background: 'rgba(220,50,50,0.2)', color: '#ff8080' }}>
                                Tolak
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div style={{ color: 'var(--text3)', fontSize: '13px' }}>Belum ada request admin.</div>
                  )}
                </div>
              </div>

              <div className="admin-card" style={{ overflow: 'hidden' }}>
                {/* Table Header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
                    Menampilkan <span style={{ color: '#00E5FF' }}>{filteredUsers.length}</span> user
                  </span>
                  <div className="admin-search-wrap" style={{ width: '240px' }}>
                    <span className="admin-search-icon">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </span>
                    <input type="text" placeholder="Cari nama atau email..." className="admin-search" style={{ height: '38px', borderRadius: '10px', fontSize: '12px' }}
                      value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                </div>

                {/* User rows */}
                <div style={{ overflowX: 'auto' }}>
                  {filteredUsers.map(u => (
                    <div key={u.id} className="user-row-item">
                      {/* Avatar */}
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #00B8D4, #00E5FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', boxShadow: '0 4px 12px rgba(0,229,255,0.2)', color: '#000' }}>
                        {(u.username || u.first_name || u.email || '?')[0].toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{u.username || u.first_name || 'Tanpa Nama'}</span>
                        <p className="user-email" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', display: 'none', margin: 0 }}>{u.email}</p>
                      </div>

                      {/* Email (Desktop) */}
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.email}
                      </div>

                      {/* Badges & Role Selector */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                        {me?.role === 'Owner' && u.role !== 'Owner' ? (
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            {['Owner', 'Admin', 'User'].map(role => (
                              <button
                                key={role}
                                onClick={() => changeUserRole(u, role)}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  background: u.role === role ? (role === 'Owner' ? 'rgba(245,158,11,0.3)' : role === 'Admin' ? 'rgba(168,85,247,0.3)' : 'rgba(59,130,246,0.3)') : 'rgba(255,255,255,0.05)',
                                  color: u.role === role ? (role === 'Owner' ? '#F59E0B' : role === 'Admin' ? '#C084FC' : '#60A5FA') : 'rgba(255,255,255,0.4)',
                                  border: u.role === role ? `1px solid ${role === 'Owner' ? 'rgba(245,158,11,0.5)' : role === 'Admin' ? 'rgba(168,85,247,0.5)' : 'rgba(59,130,246,0.5)'}` : '1px solid rgba(255,255,255,0.1)',
                                  transition: 'all 0.2s'
                                }}
                              >
                                {role}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className={`badge ${u.role === 'Owner' ? 'badge-orange' : u.role === 'Admin' ? 'badge-purple' : 'badge-blue'}`}>
                            {u.role}
                          </span>
                        )}
                        <span className={`badge ${u.status === 'Aktif' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>{u.status}</span>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {me?.role === 'Owner' ? (
                          <>
                            <button
                              onClick={() => toggleUserStatus(u)}
                              className="admin-btn-icon"
                              title={u.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                              style={{ color: u.status === 'Aktif' ? '#ff8080' : '#60d090' }}
                            >
                              {u.status === 'Aktif' ? '🚫' : '✅'}
                            </button>
                            {u.role !== 'Owner' && (
                              <button className="admin-btn-icon danger" onClick={() => deleteUser(u)} title="Hapus User">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                              </button>
                            )}
                          </>
                        ) : me?.role === 'Admin' ? (
                          <span style={{ color: 'var(--text3)', fontSize: '11px' }}>No access</span>
                        ) : null}
                      </div>
                    </div>
                  ))}

                  {filteredUsers.length === 0 && (
                    <div className="admin-empty" style={{ padding: '40px 20px', border: 'none', background: 'transparent' }}>
                      <div style={{ fontSize: '30px', marginBottom: '10px' }}>👥</div>
                      <p>Tidak ada user ditemukan.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : activeMenu === 'notifications' ? (
            /* NOTIFICATION MANAGEMENT */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="admin-card" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(168,85,247,0.15)', filter: 'blur(40px)', borderRadius: '50%' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(168,85,247,0.25)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C084FC" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#fff' }}>Kirim Notifikasi Push</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>Sebarkan pengumuman atau peringatan ke user secara real-time.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Judul Notifikasi</label>
                    <input className="input" placeholder="Contoh: Update Chapter Baru!" value={notifForm.title} onChange={e => setNotifForm({ ...notifForm, title: e.target.value })} style={{ height: '44px', background: 'rgba(255,255,255,0.03)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Pesan / Isi</label>
                    <textarea className="input" rows={4} placeholder="Tuliskan isi pesan notifikasi di sini..." value={notifForm.message} onChange={e => setNotifForm({ ...notifForm, message: e.target.value })} style={{ resize: 'vertical', background: 'rgba(255,255,255,0.03)', padding: '14px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Tipe Notifikasi</label>
                      <select className="input" value={notifForm.type} onChange={e => setNotifForm({ ...notifForm, type: e.target.value })} style={{ height: '44px', background: 'rgba(255,255,255,0.03)' }}>
                        <option value="info">Info (Biru)</option>
                        <option value="success">Success (Hijau)</option>
                        <option value="warning">Warning (Kuning)</option>
                        <option value="error">Error (Merah)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Target Penerima</label>
                      <select className="input" value={notifForm.user_id} onChange={e => setNotifForm({ ...notifForm, user_id: e.target.value })} style={{ height: '44px', background: 'rgba(255,255,255,0.03)' }}>
                        <option value="all">Semua User (Global)</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button className="btn btn-primary" onClick={sendNotification} disabled={sendingNotif} style={{ padding: '12px 28px', borderRadius: '12px', background: 'linear-gradient(135deg, #9333ea, #c084fc)', boxShadow: '0 8px 20px rgba(168,85,247,0.3)' }}>
                    {sendingNotif ? <><span className="spin" style={{ marginRight: '8px' }}>⚙️</span> Mengirim...</> : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight: '8px' }}><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg> Kirim Sekarang</>}
                  </button>
                </div>
              </div>
            </div>
          ) : activeMenu === 'music' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header */}
              <div className="admin-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h2 style={{ fontSize: '22px', letterSpacing: '-0.5px' }}>🎵 Kelola Musik</h2>
                  <p>Upload dan kelola koleksi lagu di SoundVault.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={loadAll} style={{ padding: '11px 18px', borderRadius: '12px', gap: '8px', display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
                    Refresh
                  </button>
                  <button className="btn btn-primary" onClick={openMusicAdd} style={{ padding: '11px 22px', borderRadius: '12px', gap: '8px', display: 'flex', alignItems: 'center', boxShadow: '0 6px 20px rgba(0,229,255,0.22)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Upload Lagu
                  </button>
                </div>
              </div>

              {/* Stats ribbon */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Total Lagu', val: musicList.length, icon: '🎵', c: '#00E5FF', bg: 'rgba(0,229,255,0.06)' },
                  { label: 'Total Plays', val: musicList.reduce((a: number, m: any) => a + (m.play_count || 0), 0), icon: '▶️', c: '#A855F7', bg: 'rgba(168,85,247,0.06)' },
                  { label: 'Genre', val: genres.length, icon: '🏷️', c: '#10B981', bg: 'rgba(16,185,129,0.06)' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.c}18`, borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '26px' }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: s.c, lineHeight: 1 }}>{s.val.toLocaleString()}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '3px', fontWeight: 600, letterSpacing: '0.5px' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Song list */}
              {musicList.length === 0 ? (
                <div className="admin-empty" style={{ padding: '80px 20px' }}>
                  <div className="admin-empty-icon" style={{ width: '80px', height: '80px', borderRadius: '24px' }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                  </div>
                  <h3>Belum Ada Lagu</h3>
                  <p>Klik tombol Upload Lagu untuk mulai mengisi library SoundVault Anda.</p>
                  <button className="btn btn-primary" onClick={openMusicAdd} style={{ marginTop: '16px', gap: '8px', display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Upload Sekarang
                  </button>
                </div>
              ) : (
                <div className="admin-card" style={{ overflow: 'hidden' }}>
                  {/* Table Header */}
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
                      Menampilkan <span style={{ color: '#00E5FF' }}>{musicList.filter((m: any) => !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.artist?.toLowerCase().includes(search.toLowerCase())).length}</span> lagu
                    </span>
                    <div className="admin-search-wrap" style={{ width: '240px' }}>
                      <span className="admin-search-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                      </span>
                      <input type="text" placeholder="Cari judul atau artis..." className="admin-search" style={{ height: '38px', borderRadius: '10px', fontSize: '12px' }}
                        value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                  </div>

                  {/* Song rows */}
                  <div style={{ overflowX: 'auto' }}>
                    {musicList
                      .filter((m: any) => !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.artist?.toLowerCase().includes(search.toLowerCase()))
                      .map((m: any, i: number) => {
                        const genreNames: string[] = (m.genres || []).map((g: any) => g.name)
                        const dur = m.duration_sec || 0
                        const durStr = dur > 0 ? `${Math.floor(dur / 60)}:${String(dur % 60).padStart(2, '0')}` : '--:--'
                        return (
                          <div key={m.id} className="music-row-item">
                            {/* Number */}
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.15)', fontWeight: 800, minWidth: '28px', textAlign: 'center' }}>
                              {String(i + 1).padStart(2, '0')}
                            </span>

                            {/* Cover */}
                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', flexShrink: 0, overflow: 'hidden', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                              {m.cover_url
                                ? <img src={m.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1a2744,#0d1424)' }}>
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth="1.5"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                                </div>}
                            </div>

                            {/* Title + Artist */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff' }}>{m.title}</div>
                              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                                {m.artist || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Unknown Artist</span>}
                              </div>
                            </div>

                            {/* Genres */}
                            <div className="music-genre-pills" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', maxWidth: '160px' }}>
                              {(m.genres && m.genres.length > 0) ? m.genres.map((g: any) => (
                                <span key={g.id || g.name} style={{ fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px', background: 'rgba(168,85,247,0.1)', color: '#C084FC', border: '1px solid rgba(168,85,247,0.18)', letterSpacing: '0.5px' }}>{g.name}</span>
                              )) : <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>—</span>}
                            </div>

                            {/* Duration */}
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, minWidth: '42px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{durStr}</span>

                            {/* Play count */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.28)', fontSize: '12px', minWidth: '50px' }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                              {(m.play_count || 0).toLocaleString()}
                            </div>

                            {/* Audio mini player */}
                            <div className="music-mini-audio">
                              <audio controls src={m.file_url} style={{ height: '30px', width: '100%', opacity: 0.65 }} />
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexShrink: 0 }}>
                              <button onClick={() => openMusicEdit(m)} className="admin-btn-icon" title="Edit" style={{ width: '34px', height: '34px', borderRadius: '10px' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                              </button>
                              <button onClick={() => deleteMusic(m.id, m.title)} className="admin-btn-icon danger" title="Hapus" style={{ width: '34px', height: '34px', borderRadius: '10px' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>
          ) : activeMenu === 'reports' ? (
            /* REPORTS MANAGEMENT */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header & Filters */}
              <div className="admin-card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>Laporan User</h2>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Kelola feedback, bug, dan saran dari komunitas.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <select className="input" value={reportFilter.type} onChange={e => setReportFilter(f => ({ ...f, type: e.target.value }))} style={{ width: 'auto', background: 'transparent', border: 'none', height: '32px', padding: '0 30px 0 12px', fontSize: '12px', color: '#fff' }}>
                      <option value="all">Semua Kategori</option>
                      <option value="bug">Bug & Error</option>
                      <option value="saran">Ide & Saran</option>
                      <option value="pertanyaan">Pertanyaan</option>
                      <option value="konten">Masalah Konten</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <select className="input" value={reportFilter.status} onChange={e => setReportFilter(f => ({ ...f, status: e.target.value }))} style={{ width: 'auto', background: 'transparent', border: 'none', height: '32px', padding: '0 30px 0 12px', fontSize: '12px', color: '#fff' }}>
                      <option value="all">Semua Status</option>
                      <option value="open">🔴 Open</option>
                      <option value="resolved">🟡 Resolved</option>
                      <option value="closed">⚫ Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Report List */}
              {reports
                .filter(r =>
                  (reportFilter.type === 'all' || r.type === reportFilter.type) &&
                  (reportFilter.status === 'all' || r.status === reportFilter.status)
                )
                .length === 0 ? (
                <div className="admin-empty" style={{ padding: '60px 20px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  </div>
                  <h3 style={{ margin: '0 0 6px', color: '#fff' }}>Bersih!</h3>
                  <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '13px' }}>Tidak ada laporan yang sesuai dengan filter saat ini.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
                  {reports
                    .filter(r =>
                      (reportFilter.type === 'all' || r.type === reportFilter.type) &&
                      (reportFilter.status === 'all' || r.status === reportFilter.status)
                    )
                    .map(r => {
                      const getTypeStyle = () => {
                        switch (r.type) {
                          case 'bug': return { c: '#EF4444', i: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg> }
                          case 'saran': return { c: '#F59E0B', i: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg> }
                          case 'pertanyaan': return { c: '#3B82F6', i: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg> }
                          case 'konten': return { c: '#8B5CF6', i: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> }
                          default: return { c: '#64748B', i: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg> }
                        }
                      }
                      const styleInfo = getTypeStyle()
                      const statusColor = r.status === 'open' ? '#EF4444' : r.status === 'resolved' ? '#10B981' : '#64748B'

                      return (
                        <div key={r.id} className="admin-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', background: statusColor }} />

                          {/* Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${styleInfo.c}20`, color: styleInfo.c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {styleInfo.i}
                              </div>
                              <span style={{ fontWeight: 800, fontSize: '12px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{r.type}</span>
                            </div>
                            <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '20px', background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30`, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {r.status}
                            </span>
                          </div>

                          {/* Body */}
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 8px', fontSize: '15px', color: '#fff', fontWeight: 700 }}>{r.title}</h4>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>{r.description}</p>
                          </div>

                          {/* Footer Info */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                {r.username || r.email || 'Anonim'}
                              </span>
                              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                {new Date(r.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {r.status === 'open' && (
                                <button className="admin-btn-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }} onClick={() => updateReportStatus(r.id, 'resolved')} title="Tandai Selesai">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </button>
                              )}
                              {r.status !== 'closed' && (
                                <button className="admin-btn-icon" style={{ background: 'rgba(100,116,139,0.1)', color: '#94A3B8', border: '1px solid rgba(100,116,139,0.2)' }} onClick={() => updateReportStatus(r.id, 'closed')} title="Tutup Laporan">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                </button>
                              )}
                              <button className="admin-btn-icon danger" onClick={() => deleteReport(r.id)} title="Hapus Laporan permanently">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              )}
            </div>
          ) : activeMenu === 'access-codes' ? (
            /* ACCESS CODES & DECODER */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="admin-page-header" style={{ marginBottom: '4px' }}>
                <h2 style={{ fontSize: '20px', letterSpacing: '-0.5px' }}>🔑 Kode Akses & Crypto Decoder</h2>
                <p>Generate kode akses untuk Admin, decode teks terenkripsi, dan kelola security tokens.</p>
              </div>

              {/* Crypto Decoder Tool (Owner/Admin) */}
              {me?.role && ['Owner', 'Admin'].includes(me.role) && (
                <div className="admin-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(0,229,255,0.15)', filter: 'blur(50px)', borderRadius: '50%' }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', position: 'relative', zIndex: 1, marginBottom: '24px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,229,255,0.25)', flexShrink: 0, boxShadow: '0 8px 24px rgba(0,229,255,0.2)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 900, marginBottom: '4px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        🔐 Crypto Decoder
                        {me?.role === 'Owner' && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>OWNER</span>}
                      </h3>
                      <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Dekripsi token keamanan, JWT, payload hex, dan teks terenkripsi lainnya.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '6px', textTransform: 'uppercase' }}>Metode Decode</label>
                      <select
                        className="input"
                        value={decoderMethod}
                        onChange={e => setDecoderMethod(e.target.value)}
                        style={{ height: '36px', background: 'rgba(0,0,0,0.2)' }}
                      >
                        <option value="base64">Base64 Decode</option>
                        <option value="hex">Hex Decode</option>
                        <option value="jwt">JWT Decode</option>
                        <option value="url">URL Decode</option>
                        <option value="html">HTML Entity Decode</option>
                      </select>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={decodeText}
                      disabled={decodingLoading || !decoderInput.trim()}
                      style={{ height: '36px', padding: '0 20px', alignSelf: 'flex-end', background: 'linear-gradient(135deg, #00B8D4, #00E5FF)', color: '#000', fontSize: '12px' }}
                    >
                      {decodingLoading ? '⚙️ Decoding...' : 'DECODE'}
                    </button>
                  </div>

                  <textarea
                    className="input"
                    value={decoderInput}
                    onChange={e => setDecoderInput(e.target.value)}
                    placeholder="Paste teks sandi, token JWT, atau hex code di sini..."
                    rows={3}
                    style={{ fontFamily: '"Fira Code", monospace', fontSize: '12px', background: 'rgba(0,0,0,0.3)', marginBottom: '12px' }}
                  />

                  {decoderError && (
                    <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#F87171', fontSize: '12px', marginBottom: '12px' }}>
                      ⚠️ {decoderError}
                    </div>
                  )}

                  {decoderOutput && (
                    <div style={{ padding: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', color: '#10B981', fontSize: '12px', fontFamily: '"Fira Code", monospace', maxHeight: '200px', overflowY: 'auto' }}>
                      <div style={{ fontWeight: 700, marginBottom: '8px' }}>✅ Hasil Decode:</div>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{decoderOutput}</pre>
                    </div>
                  )}
                </div>
              )}

              {/* Security Access Codes (OWNER ONLY) */}
              {me?.role === 'Owner' && (
                <div className="admin-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '100%', background: '#A855F7' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7', border: '1px solid rgba(168,85,247,0.3)', boxShadow: '0 8px 20px rgba(168,85,247,0.15)' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          Generate Kode Akses
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>OWNER ONLY</span>
                        </h4>
                        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Buat kode akses sementara untuk Admin agar bisa mengakses fitur-fitur terbatas.</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '24px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase' }}>Durasi Akses</label>
                      <select
                        className="input"
                        value={accessForm.duration_hours}
                        onChange={e => setAccessForm({ ...accessForm, duration_hours: e.target.value })}
                        style={{ height: '40px' }}
                      >
                        <option value="1">1 Jam</option>
                        <option value="12">12 Jam</option>
                        <option value="24">24 Jam (1 Hari)</option>
                      </select>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={generateAccessCode}
                      disabled={generatingCode}
                      style={{ height: '40px', padding: '0 24px', background: 'linear-gradient(135deg, #A855F7, #C084FC)' }}
                    >
                      {generatingCode ? <span className="spin">⏳</span> : '+ Buat Kode'}
                    </button>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>📋 Riwayat Kode Akses</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {accessCodes.length === 0 ? (
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', padding: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>Belum ada kode akses yang dibuat.</div>
                      ) : (
                        accessCodes.map(code => {
                          const isExpired = new Date(code.expires_at) < new Date()
                          return (
                            <div key={code.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div>
                                <div style={{ fontSize: '14px', fontFamily: '"Fira Code", monospace', fontWeight: 800, color: isExpired ? 'rgba(255,255,255,0.3)' : '#00E5FF', marginBottom: '4px' }}>
                                  {code.code}
                                </div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                                  Expires: {new Date(code.expires_at).toLocaleString('id-ID')}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {code.used_by_name && (
                                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                                    By: {code.used_by_name}
                                  </span>
                                )}
                                {isExpired && (
                                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                                    EXPIRED
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeMenu === 'settings' ? (
            /* SETTINGS */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="admin-page-header" style={{ marginBottom: '4px' }}>
                <h2 style={{ fontSize: '20px', letterSpacing: '-0.5px' }}>⚙️ Pengaturan Sistem</h2>
                <p>Kontrol konfigurasi platform, maintenance mode, statistik, dan info sistem.</p>
              </div>

              {/* Maintenance Toggle */}
              <div className="admin-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '100%', background: maintenance ? '#EF4444' : '#10B981' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: maintenance ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: maintenance ? '#EF4444' : '#10B981', border: `1px solid ${maintenance ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, boxShadow: `0 8px 20px ${maintenance ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)'}` }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Mode Maintenance
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: maintenance ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: maintenance ? '#EF4444' : '#10B981', border: `1px solid ${maintenance ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>{maintenance ? 'AKTIF' : 'NONAKTIF'}</span>
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Jika diaktifkan, semua user biasa tidak dapat mengakses website sama sekali.</p>
                    </div>
                  </div>
                  <button onClick={toggleMaintenance} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: maintenance ? '#EF4444' : 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: maintenance ? '0 4px 14px rgba(239,68,68,0.4)' : 'none' }}>
                    {maintenance ? 'Matikan Maintenance' : 'Aktifkan Mode Ini'}
                  </button>
                </div>
              </div>

              {/* Security Access Codes (OWNER ONLY) */}
              {me?.role === 'Owner' && (
                <div className="admin-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '100%', background: '#A855F7' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7', border: '1px solid rgba(168,85,247,0.3)', boxShadow: '0 8px 20px rgba(168,85,247,0.15)' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          Security Access Pass (Khusus Owner)
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>PRIVILEGE</span>
                        </h4>
                        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Buat kode akses sementara untuk Admin agar bisa masuk ke tool rahasia.</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '24px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase' }}>Pilih Target Tool</label>
                      <select
                        className="input"
                        value={accessForm.target_tool}
                        onChange={e => setAccessForm({ ...accessForm, target_tool: e.target.value })}
                        style={{ height: '40px' }}
                      >
                        <option value="crypto_decoder">Crypto Decoder (Enkripsi & JWT)</option>
                      </select>
                    </div>
                    <div style={{ width: '150px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase' }}>Durasi Akses</label>
                      <select
                        className="input"
                        value={accessForm.duration_hours}
                        onChange={e => setAccessForm({ ...accessForm, duration_hours: e.target.value })}
                        style={{ height: '40px' }}
                      >
                        <option value="1">1 Jam</option>
                        <option value="12">12 Jam</option>
                        <option value="24">24 Jam (1 Hari)</option>
                      </select>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={generateAccessCode}
                      disabled={generatingCode}
                      style={{ height: '40px', padding: '0 24px', background: 'linear-gradient(135deg, #A855F7, #C084FC)' }}
                    >
                      {generatingCode ? <span className="spin">⏳</span> : '+ Buat Kode'}
                    </button>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Riwayat Kode Akses</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {accessCodes.length === 0 ? (
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', padding: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>Belum ada kode akses yang dibuat.</div>
                      ) : (
                        accessCodes.map(code => {
                          const isExpired = new Date(code.expires_at) < new Date()
                          return (
                            <div key={code.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div>
                                <div style={{ fontSize: '14px', fontFamily: '"Fira Code", monospace', fontWeight: 800, color: isExpired ? 'rgba(255,255,255,0.3)' : '#00E5FF', marginBottom: '4px' }}>
                                  {code.code}
                                </div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '12px' }}>
                                  <span>Tujuan: <strong>{code.target_tool}</strong></span>
                                  <span>Expired: <strong>{new Date(code.expires_at).toLocaleString('id-ID')}</strong></span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {code.used_by_name && (
                                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                                    Dipakai oleh: {code.used_by_name}
                                  </span>
                                )}
                                {isExpired && (
                                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                                    EXPIRED
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Banned IPs (OWNER & ADMIN) */}
              {me?.role && ['Owner', 'Admin'].includes(me.role) && (
                <div className="admin-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '100%', background: '#EF4444' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 8px 20px rgba(239,68,68,0.15)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🚫 IP Blokir
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>KEAMANAN</span>
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Daftar IP yang diblokir oleh sistem anti-spam. {me?.role === 'Owner' ? 'Owner bisa mencabut blokir' : 'Admin bisa melihat dan mengelola'} di sini.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {bannedIps.length === 0 ? (
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.05)' }}>✨ Tidak ada IP yang terblokir saat ini. Bersih!</div>
                    ) : (
                      bannedIps.map(ban => (
                        <div key={ban.ip_address} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontFamily: '"Fira Code", monospace', fontWeight: 800, color: '#EF4444', marginBottom: '4px' }}>
                              {ban.ip_address}
                            </div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '12px' }}>
                              <span>Percobaan Gagal: <strong>{ban.failed_attempts}x</strong></span>
                              <span>Terblokir Sejak: <strong>{new Date(ban.updated_at).toLocaleString('id-ID')}</strong></span>
                            </div>
                          </div>
                          {me?.role === 'Owner' && (
                            <button
                              className="btn btn-primary"
                              onClick={() => unbanIp(ban.ip_address)}
                              style={{ height: '32px', padding: '0 16px', background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}
                            >
                              ✓ Unban IP
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="admin-card" style={{ padding: '24px' }}>
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 15h18v-2a4 4 0 0 0-4-4H3v6z" /><path d="M3 15v4a2 2 0 0 0 2 2h14v-4" /></svg>
                  Sekilas Database
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  {[
                    { label: 'File PDF', val: pdfs.length, sub: `${pdfs.filter(p => p.is_active).length} aktif`, icon: '📄', c: '#4488ff' },
                    { label: 'Total User', val: users.length, sub: `${users.filter(u => u.role === 'Admin' || u.role === 'Owner').length} admin/owner`, icon: '👥', c: '#A855F7' },
                    { label: 'Koleksi Musik', val: musicList.length, sub: `${musicList.reduce((a: number, m: any) => a + (m.play_count || 0), 0)} kali diputar`, icon: '🎵', c: '#00E5FF' },
                    { label: 'File Downloaded', val: pdfs.reduce((a, p) => a + p.downloads, 0), sub: 'keseluruhan', icon: '📥', c: '#F59E0B' },
                  ].map(s => (
                    <div key={s.label} style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.c}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                        {s.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: s.c, margin: '2px 0' }}>{s.val.toLocaleString()}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>{s.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation & Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="admin-card" style={{ padding: '24px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 16 16 12 12 8" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                    Pintasan Navigasi
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[{ href: '/dashboard', label: 'Ke Dashboard Utama' }, { href: '/library', label: 'Buka Library PDF' }, { href: '/music', label: 'Buka Music Player' }, { href: '/admin/banners-manage', label: 'Edit Banner Promo' }].map(l => (
                      <Link key={l.href} href={l.href} style={{ textDecoration: 'none' }}>
                        <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s' }} className="hover-highlight">
                          {l.label}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="admin-card" style={{ padding: '24px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                    Informasi Server
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[{ k: 'Platform App', v: 'FX Community Admin' }, { k: 'Framework', v: 'Next.js 14 (App Router)' }, { k: 'Database System', v: 'Neon PostgreSQL Serverless' }, { k: 'Music Storage', v: 'SoundVault v1.2' }, { k: 'Hak Akses Saat Ini', v: <span style={{ color: '#F59E0B' }}>{me?.role || '-'}</span> }, { k: 'ID Sesi', v: <span style={{ fontFamily: 'monospace' }}>USR-{me?.id.toString().padStart(4, '0') || '0000'}</span> }].map(r => (
                      <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', fontSize: '12px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{r.k}</span>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{modal === 'edit' ? '✏️ Edit PDF' : '➕ Tambah PDF'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>NAMA PDF</label>
                <input className="input" placeholder="Nama PDF" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>URL (Google Drive)</label>
                <input className="input" placeholder="https://drive.google.com/..." value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>KATEGORI</label>
                <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text2)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>THUMBNAIL EMOJI</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {THUMBS.map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, thumbnail: t }))}
                      style={{ fontSize: '20px', padding: '6px', borderRadius: '8px', border: `2px solid ${form.thumbnail === t ? 'var(--accent)' : 'transparent'}`, background: form.thumbnail === t ? 'rgba(199,32,230,0.2)' : 'var(--bg4)', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button className="btn btn-ghost" onClick={() => setModal(null)} style={{ flex: 1 }}>Batal</button>
                <button className="btn btn-primary" onClick={savePDF} disabled={saving} style={{ flex: 2 }}>
                  {saving ? <><span className="spin">⚙️</span> Menyimpan...</> : `💾 ${modal === 'edit' ? 'Simpan Perubahan' : 'Tambahkan PDF'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Music Modal */}
      {musicModal && (
        <div className="modal-overlay" onClick={() => setMusicModal(null)} style={{ backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.65)' }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: '0', maxWidth: '560px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 30px 60px -10px rgba(0,0,0,0.7)', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg,rgba(0,229,255,0.04),transparent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 900, letterSpacing: '-0.3px', margin: 0 }}>{musicModal === 'edit' ? 'Edit Lagu' : 'Upload Lagu Baru'}</h3>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>{musicModal === 'edit' ? 'Perbarui informasi lagu' : 'Tambah ke koleksi SoundVault'}</p>
                </div>
              </div>
              <button className="admin-btn-icon" onClick={() => setMusicModal(null)} style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '75vh', overflowY: 'auto' }}>

              {/* Quick Save Button at Top (for Edit mode) */}
              {musicModal === 'edit' && (
                <div style={{ padding: '12px', background: 'rgba(0,229,255,0.05)', borderRadius: '14px', border: '1px solid rgba(0,229,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Cepat simpan perubahan:</span>
                  <button className="btn btn-primary" onClick={saveMusic} disabled={editingMusic} style={{ padding: '6px 16px', fontSize: '12px', height: 'auto', borderRadius: '8px' }}>
                    {editingMusic ? '...' : '💾 Simpan Sekarang'}
                  </button>
                </div>
              )}

              {/* File upload zone (add mode) */}
              {musicModal === 'add' && (
                <div>
                  <label className="admin-field-label" style={{ marginBottom: '10px', display: 'block' }}>File Audio <span style={{ color: '#F87171' }}>*</span></label>
                  <label
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: '12px', padding: '28px 20px', borderRadius: '16px', cursor: 'pointer',
                      border: uploadFile ? '2px solid rgba(0,229,255,0.4)' : '2px dashed rgba(255,255,255,0.1)',
                      background: uploadFile ? 'rgba(0,229,255,0.04)' : 'rgba(255,255,255,0.02)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {uploadFile ? (
                      <>
                        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: '#fff', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadFile.name}</div>
                          <div style={{ fontSize: '11px', color: '#00E5FF', marginTop: '4px', fontWeight: 600 }}>{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB · {uploadFile.type.split('/')[1]?.toUpperCase()}</div>
                        </div>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px' }}>Klik untuk ganti file</span>
                      </>
                    ) : (
                      <>
                        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Klik untuk pilih file audio</div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>MP3, WAV, FLAC · Maks 50MB</div>
                        </div>
                      </>
                    )}
                    <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              )}

              {/* Edit mode: metadata fields */}
              {musicModal === 'edit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="admin-field-label">Judul Lagu <span style={{ color: '#F87171' }}>*</span></label>
                    <input className="input" placeholder="Judul lagu" value={musicForm.title} onChange={e => setMusicForm(f => ({ ...f, title: e.target.value }))} style={{ height: '42px', marginTop: '6px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="admin-field-label">Artis</label>
                      <input className="input" placeholder="Nama artis" value={musicForm.artist} onChange={e => setMusicForm(f => ({ ...f, artist: e.target.value }))} style={{ height: '42px', marginTop: '6px' }} />
                    </div>
                    <div>
                      <label className="admin-field-label">Album</label>
                      <input className="input" placeholder="Nama album" value={musicForm.album} onChange={e => setMusicForm(f => ({ ...f, album: e.target.value }))} style={{ height: '42px', marginTop: '6px' }} />
                    </div>
                  </div>
                  <div>
                    <label className="admin-field-label">URL Cover</label>
                    <input className="input" placeholder="https://..." value={musicForm.cover_url} onChange={e => setMusicForm(f => ({ ...f, cover_url: e.target.value }))} style={{ height: '42px', marginTop: '6px' }} />
                  </div>
                </div>
              )}

              {/* Genres */}
              <div>
                <label className="admin-field-label" style={{ marginBottom: '10px', display: 'block' }}>Genre</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {genres.map(g => {
                    const isSelected = musicForm.genre_ids.includes(g.id)
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleGenreChange(g.id)}
                        style={{
                          padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', border: 'none',
                          background: isSelected ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)',
                          color: isSelected ? '#C084FC' : 'rgba(255,255,255,0.4)',
                          boxShadow: isSelected ? '0 0 0 1px rgba(168,85,247,0.4)' : '0 0 0 1px rgba(255,255,255,0.07)',
                        }}
                      >
                        {isSelected && '✓ '}{g.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 28px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setMusicModal(null)} style={{ flex: 1, height: '44px', borderRadius: '12px' }}>Batal</button>
              <button
                className="btn btn-primary"
                onClick={saveMusic}
                disabled={editingMusic || (musicModal === 'add' && !uploadFile)}
                style={{ flex: 2, height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {editingMusic
                  ? <><span className="loader-sm"></span> Memproses...</>
                  : musicModal === 'edit'
                    ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg> Simpan Perubahan</>
                    : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg> Upload Sekarang</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {maintenanceModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setMaintenanceModal(false)}>
          <div
            className="admin-card"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '900px', width: '100%', padding: '28px',
              animation: 'slideUp 0.3s ease-out',
              maxHeight: '90vh', overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: '20px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: maintenance ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: maintenance ? '#EF4444' : '#10B981', fontSize: '20px' }}>
                  {maintenance ? '⚠️' : '✅'}
                </div>
                <div>
                  <h2 style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: 900, color: '#fff' }}>Mode Maintenance</h2>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Saat ini: <strong>{maintenance ? '🔴 AKTIF' : '🟢 NONAKTIF'}</strong></p>
                </div>
              </div>
              <button
                onClick={() => setMaintenanceModal(false)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Info */}
            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
              <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.5, color: 'rgba(255,255,255,0.6)' }}>
                <strong>Info:</strong> Mode Maintenance memblokir akses user biasa. Hanya Admin/Owner yang bisa mengakses. Preview & edit halaman maintenance di bawah ini.
              </p>
            </div>

            {/* Code Preview/Editor Section */}
            {loadingMaintenanceCode ? (
              <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>Memuat kode maintenance...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Code Editor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round"><path d="M16 18l2-2m-2 2l-2-2M8 6l-2 2m2-2l2 2" /></svg>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kode Halaman Maintenance</label>
                  </div>
                  <textarea
                    value={maintenanceCodeEdit}
                    onChange={e => setMaintenanceCodeEdit(e.target.value)}
                    style={{
                      width: '100%',
                      height: '300px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                      fontSize: '11px',
                      padding: '12px',
                      lineHeight: 1.6,
                      resize: 'vertical',
                      scrollBehavior: 'smooth'
                    }}
                  />
                  {maintenanceCodeEdit !== maintenanceCode && (
                    <div style={{ fontSize: '10px', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>●</span> Ada perubahan yang belum disimpan
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>✅ Mode: NORMAL</div>
                <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Semua user akses</p>
              </div>
              <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🚧 Mode: MAINTENANCE</div>
                <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Hanya admin/owner</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setMaintenanceModal(false)}
                style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', minWidth: '120px' }}
              >
                ✕ Tutup
              </button>
              {maintenanceCodeEdit !== maintenanceCode && (
                <button
                  onClick={saveMaintenanceCode}
                  disabled={savingMaintenanceCode}
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #A855F7, #C084FC)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: savingMaintenanceCode ? 'wait' : 'pointer', transition: 'all 0.2s', minWidth: '140px' }}
                >
                  {savingMaintenanceCode ? <span>⏳ Menyimpan...</span> : <span>💾 Simpan Kode</span>}
                </button>
              )}
              <button
                onClick={confirmToggleMaintenance}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: maintenance ? 'linear-gradient(135deg, #10B981, #34D399)' : 'linear-gradient(135deg, #EF4444, #F87171)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: maintenance ? '0 4px 14px rgba(16,185,129,0.3)' : '0 4px 14px rgba(239,68,68,0.3)',
                  minWidth: '140px',
                  transition: 'all 0.2s'
                }}
              >
                {maintenance ? '✅ Matikan Maintenance' : '🚧 Aktifkan Maintenance'}
              </button>
            </div>

            {/* File Info */}
            <div style={{ padding: '10px 12px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                💡 File: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '3px', fontFamily: '"Fira Code", monospace', fontSize: '9px' }}>app/maintenance/page.tsx</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DEPLOY WEBSITE */}
      {activeMenu === 'deploy' && (
        <div style={{ padding: '28px 20px 40px', maxWidth: 920, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0', margin: 0 }}>Deploy &amp; Git Control</h2>
                <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>Eksekusi perintah Git dari server &middot; <span style={{ color: '#f59e0b' }}>Owner only</span></p>
              </div>
            </div>
            {gitLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 20, background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 8px #00E5FF' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#00E5FF', letterSpacing: '0.5px' }}>RUNNING...</span>
              </div>
            )}
          </div>

          {me?.role !== 'Owner' ? (
            <div style={{ padding: '60px 40px', textAlign: 'center', background: 'linear-gradient(145deg,#0d1526,#080e1c)', borderRadius: 20, border: '1px solid rgba(239,68,68,0.12)' }}>
              <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <p style={{ color: '#ef4444', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Akses Terbatas</p>
              <p style={{ color: '#475569', fontSize: 13 }}>Fitur ini hanya tersedia untuk Owner.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>

              {/* Quick Actions 4-col */}
              <div style={{ background: 'linear-gradient(145deg,#0d1526,#080e1c)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18, padding: '18px 20px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#334155', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 14, margin: '0 0 14px' }}>Quick Actions</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { key: 'status', label: 'Status',   sub: 'Cek status',    color: '#3b82f6' },
                    { key: 'pull',   label: 'Pull',     sub: 'Ambil update',  color: '#10b981' },
                    { key: 'add',    label: 'Add -A',   sub: 'Stage semua',   color: '#f59e0b' },
                    { key: 'push',   label: 'Push',     sub: 'Upload repo',   color: '#8b5cf6' },
                    { key: 'log',    label: 'Log',      sub: '10 commit',     color: '#06b6d4' },
                    { key: 'diff',   label: 'Diff',     sub: 'Lihat diff',    color: '#ec4899' },
                    { key: 'stash',  label: 'Stash',    sub: 'Simpan temp',   color: '#f97316' },
                    { key: 'stash_pop', label: 'Pop',   sub: 'Keluarkan',     color: '#84cc16' },
                  ].map(btn => (
                    <button key={btn.key} onClick={() => runGit(btn.key)} disabled={gitLoading}
                      style={{ padding: '13px 6px', borderRadius: 12, border: `1px solid ${btn.color}20`, background: `${btn.color}0a`, color: btn.color, cursor: gitLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, opacity: gitLoading ? 0.45 : 1, fontFamily: 'inherit' }}
                      onMouseEnter={e => { if (!gitLoading) { (e.currentTarget as HTMLElement).style.background = `${btn.color}18`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px ${btn.color}20` } }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${btn.color}0a`; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', opacity: 0.5 }}>git</span>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{btn.label}</span>
                      <span style={{ fontSize: 9, opacity: 0.5, fontWeight: 500 }}>{btn.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Commit Panel */}
              <div style={{ background: 'linear-gradient(145deg,#0d1526,#080e1c)', border: '1px solid rgba(168,85,247,0.1)', borderRadius: 18, padding: '18px 20px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#334155', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 14px' }}>Commit &amp; Deploy</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, pointerEvents: 'none' }}><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    <input
                      value={gitCommitMsg}
                      onChange={e => setGitCommitMsg(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && runGit('commit')}
                      placeholder='Pesan commit...'
                      style={{ width: '100%', padding: '11px 14px 11px 34px', borderRadius: 10, border: `1px solid ${gitCommitMsg ? 'rgba(168,85,247,0.35)' : 'rgba(255,255,255,0.07)'}`, background: 'rgba(168,85,247,0.05)', color: '#e2e8f0', fontFamily: 'inherit', fontSize: 13, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 8 }}>
                  <button onClick={() => runGit('commit')} disabled={gitLoading || !gitCommitMsg.trim()}
                    style={{ padding: '10px', borderRadius: 10, border: '1px solid rgba(168,85,247,0.2)', background: 'rgba(168,85,247,0.07)', color: '#c084fc', fontWeight: 700, fontSize: 12, cursor: gitLoading || !gitCommitMsg.trim() ? 'not-allowed' : 'pointer', opacity: gitCommitMsg.trim() ? 1 : 0.4, transition: 'all 0.2s', fontFamily: 'inherit' }}>
                    Commit
                  </button>
                  <button onClick={() => { runGit('add'); setTimeout(() => runGit('commit'), 1200) }} disabled={gitLoading || !gitCommitMsg.trim()}
                    style={{ padding: '10px', borderRadius: 10, border: '1px solid rgba(168,85,247,0.2)', background: 'rgba(168,85,247,0.07)', color: '#a855f7', fontWeight: 700, fontSize: 12, cursor: gitLoading || !gitCommitMsg.trim() ? 'not-allowed' : 'pointer', opacity: gitCommitMsg.trim() ? 1 : 0.4, transition: 'all 0.2s', fontFamily: 'inherit' }}>
                    Add + Commit
                  </button>
                  <button onClick={async () => { await runGit('add'); setTimeout(async () => { await runGit('commit'); setTimeout(() => runGit('push'), 1400) }, 1200) }} disabled={gitLoading || !gitCommitMsg.trim()}
                    style={{ padding: '10px', borderRadius: 10, border: 'none', background: gitCommitMsg.trim() && !gitLoading ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'rgba(255,255,255,0.04)', color: gitCommitMsg.trim() ? '#fff' : '#334155', fontWeight: 800, fontSize: 11, cursor: gitLoading || !gitCommitMsg.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', boxShadow: gitCommitMsg.trim() ? '0 4px 14px rgba(139,92,246,0.3)' : 'none' }}>
                    {'\uD83D\uDE80'} Add + Commit + Push
                  </button>
                </div>
              </div>

              {/* Terminal + Danger side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 210px', gap: 14 }}>

                {/* Terminal */}
                <div style={{ background: '#040b15', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18, overflow: 'hidden' }}>
                  <div style={{ background: '#0a1222', padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {['#ef4444','#f59e0b','#10b981'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                    </div>
                    <span style={{ fontSize: 10, color: '#1e293b', marginLeft: 4, fontFamily: 'monospace', userSelect: 'none' as const }}>bash — git output</span>
                    {gitLoading && <span style={{ marginLeft: 'auto', fontSize: 9, color: '#00E5FF', fontWeight: 700, letterSpacing: '1px' }}>● LIVE</span>}
                  </div>
                  <pre style={{ padding: '14px 18px', margin: 0, fontSize: 11.5, color: gitOutput ? '#4ade80' : '#1e293b', fontFamily: '"JetBrains Mono","Fira Code",monospace', minHeight: 170, maxHeight: 260, whiteSpace: 'pre-wrap' as const, wordBreak: 'break-all' as const, overflowY: 'auto' as const, lineHeight: 1.8 }}>
                    {gitLoading
                      ? '$ running...'
                      : gitOutput
                      ? '$ output\n' + gitOutput
                      : '$ awaiting command...\n\n  Klik tombol di atas\n  untuk menjalankan perintah Git'}
                  </pre>
                </div>

                {/* Danger Zone */}
                <div style={{ background: 'linear-gradient(145deg,#0d1526,#080e1c)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 18, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>Danger Zone</p>
                  <button
                    onClick={() => { if (confirm('RESET HARD akan menghapus semua perubahan yang belum di-commit!\n\nYakin lanjutkan?')) runGit('reset_hard') }}
                    disabled={gitLoading}
                    style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontWeight: 700, fontSize: 12, cursor: gitLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' }}
                    onMouseEnter={e => { if (!gitLoading) { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.35)' } }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.2)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Reset Hard
                  </button>
                  <p style={{ fontSize: 10, color: '#334155', lineHeight: 1.6, margin: 0 }}>Membatalkan semua perubahan lokal. Tidak bisa dibatalkan!</p>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />
                  <div style={{ fontSize: 10, color: '#334155', lineHeight: 1.7 }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Info:</span><br />
                    Setelah push, Vercel auto-deploy dalam ~2 mnt.
                  </div>
                </div>
              </div>

              {/* History */}
              {gitHistory.length > 0 && (
                <div style={{ background: 'linear-gradient(145deg,#0d1526,#080e1c)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 18, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#334155', letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>Riwayat</p>
                    <span style={{ fontSize: 10, color: '#1e293b' }}>{gitHistory.length} perintah</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {gitHistory.slice(0, 8).map((h, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 9, background: h.ok ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)', border: `1px solid ${h.ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'}` }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: h.ok ? '#10b981' : '#ef4444', flexShrink: 0 }} />
                        <code style={{ flex: 1, fontSize: 11, color: h.ok ? '#6ee7b7' : '#fca5a5', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{h.cmd}</code>
                        <span style={{ fontSize: 9, color: '#1e293b', flexShrink: 0 }}>{h.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  )
}
