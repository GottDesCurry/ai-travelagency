import type { Metadata } from 'next'
import Link from 'next/link'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
export const metadata: Metadata = {
  metadataBase: new URL('https://book-repeat.ch'),
  title: { default: 'Book Repeat – Deine Reise. Dein Rhythmus.', template: '%s | Book Repeat' },
  description: 'Plane deine Reise mit KI. Entdecke Flüge und Unterkünfte und stelle deinen persönlichen Reiseplan zusammen.',
  openGraph: { title: 'Book Repeat – Deine Reise. Dein Rhythmus.', description: 'Von der ersten Idee zu deinem Reiseplan.', url: 'https://book-repeat.ch', siteName: 'Book Repeat', locale: 'de_CH', type: 'website' },
}
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body className={`${geistSans.variable} ${geistMono.variable}`}>
    <a href="#main-content" className="skip-link">Zum Inhalt</a>
    <header className="site-header"><Link href="/" className="wordmark" aria-label="Book Repeat Startseite"><span className="brand-icon">b.</span>book repeat<span className="brand-dot">.</span></Link>
      <nav aria-label="Hauptnavigation"><Link href="/#reise-suche">Reise planen</Link><Link href="/#entdecken">Entdecken</Link><Link href="/meine-reise" className="nav-trip">Meine Reise ↗</Link></nav>
    </header>
    <main id="main-content">{children}</main>
    <footer className="site-footer"><div><Link href="/" className="wordmark">book repeat.</Link><p>Weniger organisieren. Mehr erleben.</p></div><nav aria-label="Rechtliches"><Link href="/impressum">Impressum</Link><Link href="/datenschutz">Datenschutz</Link><Link href="/datenschutz#settings">Datenschutz-Einstellungen</Link><Link href="/agb">AGB</Link><Link href="/kontakt">Kontakt</Link></nav><p>© {new Date().getFullYear()} Book Repeat · Dierikon, Schweiz</p></footer>
  </body></html>
}
