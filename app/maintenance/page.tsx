 'use client'
import { useEffect, useState } from "react";

export default function MaintenancePage() {
  const [dots, setDots] = useState(".");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 87) return 87;
        return p + Math.floor(Math.random() * 3) + 1;
      });
    }, 120);
    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060611",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'DM Sans', sans-serif",
      overflow: "hidden",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,800;1,9..40,300&family=DM+Mono:wght@300;400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes floatBlob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -40px) scale(1.05); }
          66%       { transform: translate(-20px, 20px) scale(0.97); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.03; }
          50%       { opacity: 0.07; }
        }

        .blob1 { animation: floatBlob 9s ease-in-out infinite; }
        .blob2 { animation: floatBlob 12s ease-in-out infinite reverse; }
        .blob3 { animation: floatBlob 7s ease-in-out infinite 2s; }

        .ring-spin { animation: rotateSlow 8s linear infinite; }
        .ring-spin-rev { animation: rotateSlow 12s linear infinite reverse; }

        .scanline-el {
          position: fixed; top: 0; left: 0;
          width: 100%; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(196,181,253,0.15), transparent);
          animation: scanline 6s linear infinite;
          pointer-events: none;
        }
        .grid-bg {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(196,181,253,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(196,181,253,0.05) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridPulse 4s ease-in-out infinite;
          pointer-events: none;
        }

        .status-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(196,181,253,0.08);
          border: 1px solid rgba(196,181,253,0.2);
          border-radius: 100px;
          padding: 6px 14px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          color: rgba(196,181,253,0.7);
          animation: fadeUp 0.4s ease-out both;
        }
        .status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #c4b5fd;
          box-shadow: 0 0 6px #c4b5fd;
          animation: blink 1.2s ease-in-out infinite;
        }

        .main-title {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(36px, 6vw, 64px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #f9a8d4 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: fadeUp 0.5s ease-out 0.15s both, shimmer 4s linear 1s infinite;
        }

        .sub-text {
          font-size: 15px;
          color: rgba(255,255,255,0.45);
          line-height: 1.7;
          font-weight: 300;
          max-width: 360px;
          animation: fadeUp 0.5s ease-out 0.3s both;
        }

        .progress-wrap {
          animation: fadeUp 0.5s ease-out 0.45s both;
        }
        .progress-bar-bg {
          width: 100%;
          height: 3px;
          background: rgba(255,255,255,0.07);
          border-radius: 99px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #c4b5fd, #f9a8d4);
          box-shadow: 0 0 12px rgba(196,181,253,0.5);
          transition: width 0.3s ease;
        }

        .admin-link {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          text-decoration: none;
          letter-spacing: 0.08em;
          transition: color 0.2s;
          animation: fadeUp 0.5s ease-out 0.6s both;
        }
        .admin-link:hover { color: rgba(255,255,255,0.5); }
      `}</style>

      {/* Background layers */}
      <div className="grid-bg" />
      <div className="scanline-el" />

      {/* Blobs */}
      <div className="blob1" style={{
        position: "fixed", top: "10%", left: "15%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
        filter: "blur(40px)", pointerEvents: "none",
      }} />
      <div className="blob2" style={{
        position: "fixed", bottom: "5%", right: "10%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(249,168,212,0.14) 0%, transparent 70%)",
        filter: "blur(40px)", pointerEvents: "none",
      }} />
      <div className="blob3" style={{
        position: "fixed", top: "50%", left: "60%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(196,181,253,0.1) 0%, transparent 70%)",
        filter: "blur(30px)", pointerEvents: "none",
      }} />

      {/* Card */}
      <div style={{
        position: "relative",
        maxWidth: 480,
        width: "100%",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
      }}>
        {/* Icon with rings */}
        <div style={{ position: "relative", width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeUp 0.4s ease-out both" }}>
          {/* Outer ring */}
          <svg className="ring-spin" style={{ position: "absolute", inset: 0 }} width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="50" fill="none" stroke="rgba(196,181,253,0.15)" strokeWidth="1" strokeDasharray="6 8" />
          </svg>
          {/* Inner ring */}
          <svg className="ring-spin-rev" style={{ position: "absolute", inset: 12 }} width="86" height="86" viewBox="0 0 86 86">
            <circle cx="43" cy="43" r="38" fill="none" stroke="rgba(249,168,212,0.2)" strokeWidth="1" strokeDasharray="3 12" />
          </svg>
          {/* Icon bg */}
          <div style={{
            width: 70, height: 70, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,181,253,0.15), rgba(196,181,253,0.04))",
            border: "1px solid rgba(196,181,253,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30,
            backdropFilter: "blur(8px)",
          }}>🚧</div>
        </div>

        {/* Badge */}
        <div className="status-badge">
          <span className="status-dot" />
          MAINTENANCE MODE
        </div>

        {/* Title */}
        <h1 className="main-title">
          Situs Sedang<br />Maintenance
        </h1>

        {/* Description */}
        <p className="sub-text">
          Kami sedang melakukan perbaikan dan pembaruan sistem untuk memberikan pengalaman belajar yang lebih baik. Silakan kembali beberapa saat lagi.&nbsp;🙏
        </p>

        {/* Progress */}
        <div className="progress-wrap" style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>
              MEMPERBARUI SISTEM{dots}
            </span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(196,181,253,0.5)", letterSpacing: "0.08em" }}>
              {progress}%
            </span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />

        {/* Admin link */}
        <a href="/login" className="admin-link">
          Admin Login →
        </a>
      </div>
    </div>
  );
}
