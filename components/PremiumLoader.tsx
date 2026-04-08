'use client'
import React from 'react'

export default function PremiumLoader() {
  return (
    <div className="premium-loader-overlay">
      <style jsx>{`
        .premium-loader-overlay {
          position: fixed;
          inset: 0;
          background: rgba(8, 11, 20, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          overflow: hidden;
        }

        .loader-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .spinner-outer {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .spinner-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #00E5FF;
          animation: spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        .spinner-ring:nth-child(2) {
          inset: 8px;
          border-top-color: #7C3AED;
          animation-duration: 2s;
          animation-direction: reverse;
        }

        .spinner-ring:nth-child(3) {
          inset: 16px;
          border-top-color: #A855F7;
          animation-duration: 2.5s;
        }

        .logo-center {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #fff;
          text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
          animation: pulse 2s ease-in-out infinite;
        }

        .loading-text {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 4px;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          animation: fadeText 2s ease-in-out infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes fadeText {
          0%, 100% { opacity: 0.4; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
      <div className="loader-container">
        <div className="spinner-outer">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="logo-center">✦</div>
        </div>
        <div className="loading-text">Securing Access</div>
      </div>
    </div>
  )
}
