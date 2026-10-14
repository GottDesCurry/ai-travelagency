'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

const SESSION_KEY = 'bookrepeat-flight-intro-v2'
type Phase = 'checking' | 'loading' | 'playing' | 'exiting' | 'done'

export default function FlightExperience({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [phase, setPhase] = useState<Phase>('checking')
  const [planeReady, setPlaneReady] = useState(false)
  const [skyReady, setSkyReady] = useState(false)
  const skipButton = useRef<HTMLButtonElement>(null)
  const active = pathname === '/' && phase !== 'done'

  const finish = useCallback(() => {
    setPhase('done')
    requestAnimationFrame(() => document.getElementById('start-planning')?.focus({ preventScroll: true }))
  }, [])

  useEffect(() => {
    if (pathname !== '/') { setPhase('done'); return }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    let seen = false
    try { seen = sessionStorage.getItem(SESSION_KEY) === 'seen' } catch { /* Storage is optional. */ }
    if (motion.matches || connection?.saveData || seen) { setPhase('done'); return }
    try { sessionStorage.setItem(SESSION_KEY, 'seen') } catch { /* Playback still has a time limit. */ }
    setPhase('loading')
    const onMotionChange = () => { if (motion.matches) setPhase('done') }
    motion.addEventListener('change', onMotionChange)
    return () => motion.removeEventListener('change', onMotionChange)
  }, [pathname])

  useEffect(() => {
    if (phase !== 'loading') return
    skipButton.current?.focus({ preventScroll: true })
    if (planeReady && skyReady) { setPhase('playing'); return }
    // A missing asset must never keep the website locked behind an intro.
    const timeout = setTimeout(finish, 2500)
    return () => clearTimeout(timeout)
  }, [phase, planeReady, skyReady, finish])

  useEffect(() => {
    if (phase !== 'playing' && phase !== 'exiting') return
    const timeout = setTimeout(() => { if (phase === 'playing') setPhase('exiting'); else finish() }, phase === 'playing' ? 3400 : 650)
    return () => clearTimeout(timeout)
  }, [phase, finish])

  useEffect(() => {
    if (!active) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') finish() }
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key === 'Tab') { event.preventDefault(); skipButton.current?.focus() }
    }
    document.addEventListener('keydown', escape)
    document.addEventListener('keydown', trapFocus)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', escape)
      document.removeEventListener('keydown', trapFocus)
    }
  }, [active, finish])

  return <>
    <div className="site-content" inert={active} aria-hidden={active ? true : undefined}>{children}</div>
    {active && <div role="dialog" aria-modal="true" aria-label="Flugintro" aria-describedby="flight-intro-description" className={`flight-experience flight-experience-${phase}`}>
      <div className="intro-sky" aria-hidden="true"><Image src="/visuals/cloudscape-blue.webp" alt="" fill priority sizes="100vw" onLoad={() => setSkyReady(true)} onError={finish}/></div>
      <div className="intro-vignette" aria-hidden="true"/>
      <div className="intro-aircraft" aria-hidden="true"><Image src="/visuals/aircraft-blue.webp" alt="" width={1774} height={887} priority sizes="(max-width: 600px) 110vw, 75vw" onLoad={() => setPlaneReady(true)} onError={finish}/></div>
      <div className="intro-cloud-front intro-cloud-left" aria-hidden="true"/>
      <div className="intro-cloud-front intro-cloud-right" aria-hidden="true"/>
      <div className="intro-heading"><span className="intro-kicker">BOOK REPEAT · FLIGHT EXPERIENCE</span><p id="flight-intro-description">Deine nächste Reise beginnt.</p><span className="intro-line" aria-hidden="true"/></div>
      <button ref={skipButton} onClick={finish} className="intro-skip" type="button">Intro überspringen <span aria-hidden="true">↗</span></button>
    </div>}
  </>
}
