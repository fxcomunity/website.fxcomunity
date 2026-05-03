'use client'

import { useState, useEffect, useRef } from 'react'

export const OTP_DIGITS = 6

export function useOTPTimer(initialSeconds = 300) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (seconds <= 0) {
      setExpired(true)
      return
    }
    const timer = setInterval(() => {
      setSeconds(s => s - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [seconds])

  const display = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`

  const reset = () => {
    setSeconds(initialSeconds)
    setExpired(false)
  }

  return { display, expired, reset }
}

export function OTPInput({ value, onChange, hasError }: { value: string[], onChange: (v: string[]) => void, hasError?: boolean }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (val: string, index: number) => {
    const newVal = [...value]
    newVal[index] = val.slice(-1)
    onChange(newVal)

    if (val && index < OTP_DIGITS - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el }}
          type="text"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(e.target.value, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          className="w-10 h-12 text-center rounded-lg outline-none transition-all text-lg font-bold"
          style={{
            background: '#13132a',
            border: `1px solid ${hasError ? '#e04040' : digit ? 'rgba(0,229,255,0.45)' : 'rgba(0,229,255,0.12)'}`,
            color: '#e0e0ff',
          }}
        />
      ))}
    </div>
  )
}
