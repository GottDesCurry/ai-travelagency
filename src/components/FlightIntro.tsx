'use client'
import { useEffect, useState } from 'react'

export function Plane({ className = '' }: { className?: string }) {
  return <svg viewBox="0 0 220 100" fill="none" aria-hidden="true" className={className}><path d="M20 57 92 46 134 8 153 9 132 43 186 45C216 46 219 56 187 60L129 65 151 89 132 92 96 68 40 73 21 87 9 85 20 64 5 61Z" fill="currentColor" /><path d="m132 43 52 2" stroke="#7793a4" strokeWidth="3"/><path d="m94 47-5 18" stroke="#aabfc9" strokeWidth="2"/></svg>
}
export default function FlightIntro() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    try { if (sessionStorage.getItem('bookrepeat-intro')) return; sessionStorage.setItem('bookrepeat-intro', 'seen') } catch { /* Animation also works without browser storage. */ }
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 2800)
    return () => clearTimeout(timer)
  }, [])
  if (!visible) return null
  return <div className="flight-intro" aria-label="Flug durch die Wolken">
    <div className="intro-cloud intro-cloud-left"/><div className="intro-cloud intro-cloud-right"/>
    <Plane className="intro-plane"/><p className="intro-label">Deine nächste Geschichte beginnt.</p>
    <button onClick={() => setVisible(false)} className="intro-skip">Animation überspringen →</button>
  </div>
}
