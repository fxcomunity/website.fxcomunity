"use client";
// @ts-ignore
import { useAuthClient } from "@neondatabase/neon-js/react";

export default function LoginButton() {
  const auth = useAuthClient();
  return (
    <button 
      onClick={() => auth.signInWithOAuth("google")}
      className="btn btn-primary"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 24px',
        borderRadius: '12px',
        fontWeight: 700,
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: 'var(--primary)',
        color: '#fff',
        border: 'none',
        boxShadow: '0 4px 14px rgba(0, 229, 255, 0.2)'
      }}
    >
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
      Login dengan Google
     </button>
  );
}
