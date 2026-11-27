'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

const SESSION_KEY = 'bookrepeat-flight-intro-v4'
type Phase = 'checking' | 'loading' | 'playing' | 'exiting' | 'done'
const PLAY_MS = 6400
const EXIT_MS = 700
const PLANE_SRC = '/visuals/aircraft-blue.webp'

// Story: a travel wish is typed at night, the route appears, and the jet flies it into the sunrise.
// The aircraft and its contrail share one SVG path, so they stay in sync at every screen size.
interface Scene { viewBox: string; route: string; from: { x: number; y: number }; to: { x: number; y: number }; planeWidth: number }
const LANDSCAPE: Scene = { viewBox: '0 0 1600 900', route: 'M 150 720 C 520 470, 900 190, 1320 270', from: { x: 150, y: 720 }, to: { x: 1320, y: 270 }, planeWidth: 520 }
const PORTRAIT: Scene = { viewBox: '0 0 900 1600', route: 'M 110 1180 C 240 900, 460 680, 640 600', from: { x: 110, y: 1180 }, to: { x: 640, y: 600 }, planeWidth: 560 }
// Flight starts at 1.9 s and reaches the destination at 6.2 s of the 6.4 s scene.
const FLIGHT = { begin: '1.9s', dur: '4.3s', spline: '.45 0 .25 1' }

export default function FlightExperience({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [phase, setPhase] = useState<Phase>('checking')
  const [planeReady, setPlaneReady] = useState(false)
  const [skyReady, setSkyReady] = useState(false)
  const [scene, setScene] = useState<Scene>(LANDSCAPE)
  const skipButton = useRef<HTMLButtonElement>(null)
  const stage = useRef<SVGSVGElement>(null)
  // Server-rendered content stays usable before JavaScript or preference checks.
  const active = pathname === '/' && phase !== 'checking' && phase !== 'done'
  const animating = phase === 'playing' || phase === 'exiting'

  const finish = useCallback(() => {
    setPhase('done')
    requestAnimationFrame(() => document.getElementById('start-planning')?.focus({ preventScroll: true }))
  }, [])

  useEffect(() => {
    if (pathname !== '/') { setPhase('done'); return }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    let seen = false
    try { seen = sessionStorage.getItem(SESSION_KEY) === 'seen' } catch { /* Storage is optional. */ }
    if (motion.matches || connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType || '') || seen) { setPhase('done'); return }
    try { sessionStorage.setItem(SESSION_KEY, 'seen') } catch { /* Playback still has a time limit. */ }
    setScene(window.matchMedia('(orientation: portrait)').matches ? PORTRAIT : LANDSCAPE)
    setPhase('loading')
    const onMotionChange = () => { if (motion.matches) finish() }
    motion.addEventListener('change', onMotionChange)
    return () => motion.removeEventListener('change', onMotionChange)
  }, [pathname, finish])

  // The aircraft is drawn inside the SVG, so it is preloaded separately.
  useEffect(() => {
    if (phase !== 'loading') return
    const image = new window.Image()
    image.onload = () => setPlaneReady(true)
    image.onerror = finish
    image.src = PLANE_SRC
    return () => { image.onload = null; image.onerror = null }
  }, [phase, finish])

  useEffect(() => {
    if (phase !== 'loading') return
    skipButton.current?.focus({ preventScroll: true })
    if (planeReady && skyReady) { setPhase('playing'); return }
    const timeout = setTimeout(finish, 2500)
    return () => clearTimeout(timeout)
  }, [phase, planeReady, skyReady, finish])

  useEffect(() => {
    if (phase === 'playing') stage.current?.setCurrentTime(0)
    if (phase !== 'playing' && phase !== 'exiting') return
    const timeout = setTimeout(() => { if (phase === 'playing') setPhase('exiting'); else finish() }, phase === 'playing' ? PLAY_MS : EXIT_MS)
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

  const planeHeight = scene.planeWidth / 2
  const timing = { begin: FLIGHT.begin, dur: FLIGHT.dur, fill: 'freeze' as const, calcMode: 'spline' as const, keyTimes: '0;1', keySplines: FLIGHT.spline }

  return <>
    <div className="site-content" inert={active} aria-hidden={active ? true : undefined}>{children}</div>
    {active && <div role="dialog" aria-modal="true" aria-label="Flugintro" aria-describedby="flight-intro-description" className={`flight-experience flight-experience-${phase}`}>
      <div className="intro-night" aria-hidden="true"><span className="intro-stars"/></div>
      <div className="intro-dawn" aria-hidden="true"/>
      <div className="intro-sun" aria-hidden="true"/>
      <div className="intro-clouds" aria-hidden="true"><Image src="/visuals/cloudscape-blue.webp" alt="" fill priority sizes="100vw" onLoad={() => setSkyReady(true)} onError={finish}/></div>

      <div className="intro-wish" aria-hidden="true">
        <span className="intro-wish-label">DEIN REISEWUNSCH</span>
        <span className="intro-wish-text">Zürich → Malaga · 10.–14. August · 4 Personen</span>
      </div>

      {animating && <svg ref={stage} className="intro-stage" viewBox={scene.viewBox} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="intro-trail" gradientUnits="userSpaceOnUse" x1={scene.from.x} y1={scene.from.y} x2={scene.to.x} y2={scene.to.y}>
            <stop offset="0" stopColor="#ffffff" stopOpacity="0"/>
            <stop offset=".55" stopColor="#e9f6ff" stopOpacity=".55"/>
            <stop offset="1" stopColor="#ffffff" stopOpacity=".95"/>
          </linearGradient>
          <filter id="intro-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
        </defs>
        {/* Planned route, shown before take-off */}
        <path className="intro-route" d={scene.route} pathLength={1}/>
        <g className="intro-city intro-city-from"><circle cx={scene.from.x} cy={scene.from.y} r="9"/><circle className="intro-ping" cx={scene.from.x} cy={scene.from.y} r="9"/><text x={scene.from.x + 22} y={scene.from.y + 38}>ZRH</text></g>
        <g className="intro-city intro-city-to"><circle cx={scene.to.x} cy={scene.to.y} r="9"/><text x={scene.to.x - 22} y={scene.to.y - 26} textAnchor="end">AGP</text></g>
        {/* Contrail grows exactly as far as the aircraft has flown */}
        <path d={scene.route} pathLength={1} fill="none" stroke="url(#intro-trail)" strokeWidth="18" strokeLinecap="round" filter="url(#intro-soft)" strokeDasharray="1 1" strokeDashoffset="1">
          <animate attributeName="stroke-dashoffset" from="1" to="0" {...timing}/>
        </path>
        <path d={scene.route} pathLength={1} fill="none" stroke="url(#intro-trail)" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset="1">
          <animate attributeName="stroke-dashoffset" from="1" to="0" {...timing}/>
        </path>
        <g className="intro-aircraft" opacity="0">
          <set attributeName="opacity" to="1" begin={FLIGHT.begin} fill="freeze"/>
          <animateMotion path={scene.route} keyPoints="0;1" {...timing}/>
          <g>
            <animateTransform attributeName="transform" type="scale" from=".28" to=".92" {...timing}/>
            <g className="intro-attitude">
              <image href={PLANE_SRC} x={-scene.planeWidth / 2} y={-planeHeight / 2} width={scene.planeWidth} height={planeHeight}/>
            </g>
          </g>
        </g>
      </svg>}

      <div className="intro-vignette" aria-hidden="true"/>
      <div className="intro-heading"><span className="intro-kicker">BOOK REPEAT · DEINE REISE, VON DER KI GEPLANT</span><p id="flight-intro-description">Deine nächste Reise beginnt.</p><span className="intro-line" aria-hidden="true"/></div>
      <button ref={skipButton} onClick={finish} className="intro-skip" type="button">Intro überspringen <span aria-hidden="true">↗</span></button>
    </div>}
  </>
}
