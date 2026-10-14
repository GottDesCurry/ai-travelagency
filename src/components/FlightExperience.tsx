'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

const SESSION_KEY = 'bookrepeat-flight-intro-v3'
type Phase = 'checking' | 'loading' | 'playing' | 'exiting' | 'done'

export default function FlightExperience({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [phase, setPhase] = useState<Phase>('checking')
  const [mobile, setMobile] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
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
    setMobile(window.matchMedia('(max-width: 600px)').matches)
    setPhase('loading')
    const onMotionChange = () => { if (motion.matches) setPhase('done') }
    motion.addEventListener('change', onMotionChange)
    return () => motion.removeEventListener('change', onMotionChange)
  }, [pathname])

  useEffect(() => {
    if (phase !== 'loading') return
    skipButton.current?.focus({ preventScroll: true })
    let cancelled = false
    // Loading or autoplay failure reveals the site instead of trapping the user.
    const timeout = setTimeout(finish, 4000)
    const playback = video.current?.play()
    playback?.catch(() => { if (!cancelled) finish() })
    return () => { cancelled = true; clearTimeout(timeout) }
  }, [phase, finish])

  useEffect(() => {
    if (phase !== 'playing' && phase !== 'exiting') return
    // The normal transition follows the video's ended event; this bounds a stall.
    const timeout = setTimeout(() => { if (phase === 'playing') setPhase('exiting'); else finish() }, phase === 'playing' ? 8000 : 650)
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
      <video ref={video} className="intro-video" aria-hidden="true" muted playsInline autoPlay={phase === 'loading' || phase === 'playing'} preload={phase === 'checking' ? 'none' : 'auto'}
        src={phase === 'checking' ? undefined : `/visuals/flight-intro-${mobile ? 'mobile' : 'desktop'}.mp4`}
        poster="/visuals/cloudscape-blue.webp" onPlaying={() => setPhase('playing')} onEnded={() => setPhase('exiting')} onError={finish}/>
      <div className="intro-vignette" aria-hidden="true"/>
      <div className="intro-heading"><span className="intro-kicker">BOOK REPEAT · FLIGHT EXPERIENCE</span><p id="flight-intro-description">Deine nächste Reise beginnt.</p><span className="intro-line" aria-hidden="true"/></div>
      <button ref={skipButton} onClick={finish} className="intro-skip" type="button">Intro überspringen <span aria-hidden="true">↗</span></button>
    </div>}
  </>
}
