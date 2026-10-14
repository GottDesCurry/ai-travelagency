// Cleaned AI Reiseplaner Layout (visually refined, type-safe)
import type { Metadata } from 'next'
import Link from 'next/link'
import FlightExperience from '@/components/FlightExperience'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://book-repeat.ch'),
  title: 'Book Repeat – AI Reiseplaner',
  description: 'Book Repeat – Dein smarter KI-gestützter Reiseplaner für Flüge & Hotels',
  keywords: ['Reise', 'Flugsuche', 'Hotelsuche', 'KI', 'AI', 'Travelplanner'],
  openGraph: {
    title: 'Book Repeat – AI Reiseplaner',
    description: 'Nutze künstliche Intelligenz für optimale Flug- und Hotelangebote.',
    url: 'https://book-repeat.ch',
    siteName: 'Book Repeat',
    locale: 'de_CH'
  } satisfies Partial<Metadata['openGraph']>
} satisfies Metadata

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <FlightExperience>
        <a href="#main-content" className="skip-link">Zum Inhalt</a>
        <header className="site-header">
          <Link href="/" className="wordmark" aria-label="Book Repeat Startseite"><span className="brand-icon" aria-hidden="true">b.</span>book repeat<span className="brand-dot" aria-hidden="true">.</span></Link>
          <nav aria-label="Hauptnavigation">
            <Link href="/#reise-suche">Reise planen</Link>
            <Link href="/#entdecken">Entdecken</Link>
            <Link href="/hilfe" className="help-nav">Hilfe</Link>
            <span className="beta-label">BETA</span>
          </nav>
        </header>
        <main id="main-content">{children}</main>
        <footer className="site-footer">
          <div><Link href="/" className="wordmark">book repeat.</Link><p>Weniger organisieren. Mehr erleben.</p><p>Flüge und Hotels entdecken. Beim Anbieter buchen.</p></div>
          <nav aria-label="Informationen und Rechtliches">
            <Link href="/hilfe">Hilfe & Support</Link>
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
            <Link href="/datenschutz#settings">Datenschutz-Einstellungen</Link>
            <Link href="/agb#terms">AGB</Link>
            <Link href="/kontakt">Kontakt</Link>
          </nav>
          <p className="footer-note">© {new Date().getFullYear()} Book Repeat – Spechtenstrasse 28, 6036 Dierikon</p>
        </footer>
        </FlightExperience>
      </body>
    </html>
  )
}
