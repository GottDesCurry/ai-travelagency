// Cleaned AI Reiseplaner Layout (visually refined, type-safe)
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
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
  const navLinks = (
    <>
      <li><Link href="/">Home</Link></li>
      <li><Link href="/impressum">Impressum</Link></li>
      <li><Link href="/datenschutz">Datenschutz</Link></li>
      <li><Link href="/agb">AGB</Link></li>
      <li><Link href="/kontakt">Kontakt</Link></li>
    </>
  )

  return (
    <html lang="de">


      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-gray-800 bg-white min-h-screen flex flex-col`}>
        {/* Hero Header */}
        <div className="relative flex flex-col items-center justify-center text-center pt-10 pb-6 bg-gradient-to-b from-[#e0e7ff] to-[#c7d2fe] shadow-md">
          <div className="absolute top-4 left-6 text-xl font-semibold text-gray-900">Book Repeat</div>
          <div className="absolute top-4 right-6 bg-indigo-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow">BETA</div>
          <div className="mt-10 flex flex-col items-center gap-2">
            <Image
              src="/logo-b-icon.png"
              alt="Book Repeat Logo"
              width={44}
              height={44}
              priority
            />
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">AI Reiseplaner</h1>
            <p className="text-sm text-gray-600 mt-2 max-w-md">Finde jetzt günstige Flüge und Hotels mit künstlicher Intelligenz.</p>
          </div>
        </div>

        <a href="#main-content" className="sr-only focus:not-sr-only focus:p-3">Zum Inhalt</a>
        {/* Main Content from pages */}
        <main id="main-content" className="flex-grow flex flex-col items-center justify-center px-4 w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 border-t mt-12">
          <div className="max-w-6xl mx-auto px-6 pt-8 pb-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-gray-700 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Unternehmen</h4>
              <ul className="space-y-1">{navLinks}</ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Reisen</h4>
              <ul className="space-y-1">
                <li><Link href="/">Flüge</Link></li>
                <li><Link href="/">Hotels</Link></li>
                <li><Link href="/hilfe">So funktioniert die Beta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Hilfe</h4>
              <ul className="space-y-1">
                <li><Link href="/hilfe">Hilfe & Support</Link></li>
                <li><Link href="/datenschutz#settings">Datenschutz-Einstellungen</Link></li>
                <li><Link href="/agb#terms">Nutzungsbedingungen</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Partner</h4>
              <ul className="space-y-1">
                <li><Link href="/kontakt">Partneranfrage</Link></li>
                <li><Link href="/impressum">Firmeninfo</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <div className="max-w-6xl mx-auto px-6 py-4 text-center text-xs text-gray-500">
              © {new Date().getFullYear()} Book Repeat – Spechtenstrasse 28, 6036 Dierikon
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
