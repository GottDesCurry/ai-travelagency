// Cleaned AI Reiseplaner Layout (visually refined)
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ba & Be Partners – AI Reiseplaner',
  description: 'Baskaran & Beck Partners KLG – Ihr smarter KI-gestützter Reiseplaner für Flüge & Hotels',
  keywords: ['Reise', 'Flugsuche', 'Hotelsuche', 'KI', 'AI', 'Travelplanner'],
  openGraph: {
    title: 'Ba & Be Partners – AI Reiseplaner',
    description: 'Nutzen Sie künstliche Intelligenz für optimale Flug- und Hotelangebote.',
    url: 'https://ba-be-partners.ch',
    siteName: 'Ba & Be Partners',
    images: [
      { url: '/og-image.png', width: 1200, height: 630, alt: 'Ba & Be Partners AI Reiseplaner' }
    ],
    locale: 'de_CH',
    type: 'website'
  }
}

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
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{metadata.title ?? 'AI TravelAgency'}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords?.join(', ')} />
        {/* OpenGraph */}
        <meta property="og:title" content={metadata.openGraph?.title} />
        <meta property="og:description" content={metadata.openGraph?.description} />
        <meta property="og:url" content={metadata.openGraph?.url} />
        <meta property="og:site_name" content={metadata.openGraph?.siteName} />
        <meta property="og:type" content={metadata.openGraph?.type} />
        <meta property="og:locale" content={metadata.openGraph?.locale} />
        {metadata.openGraph?.images?.map((img, i) => (
          <meta key={i} property="og:image" content={img.url} />
        ))}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-gray-800 bg-gradient-to-b from-[#bcd2f7] to-[#d8c7f3] min-h-screen flex flex-col`}>
        {/* Hero Header */}
        <div className="relative flex flex-col items-center justify-center text-center pt-14 pb-6">
          <div className="absolute top-4 left-6 text-xl font-semibold text-gray-900">Ba & Be Partners</div>
          <div className="absolute top-4 right-6 bg-indigo-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow">BETA</div>
          <div className="mt-10 flex items-center gap-3">
            <Image
              src="/earth-icon.svg"
              alt="Globus"
              width={40}
              height={40}
              priority
            />
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">AI Reiseplaner</h1>
          </div>
        </div>

        {/* Main Content from pages */}
        <main className="flex-grow flex flex-col items-center justify-center px-4 w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-5xl mx-auto px-6 pt-8 pb-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-gray-700 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Unternehmen</h4>
              <ul className="space-y-1">{navLinks}</ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Reisen</h4>
              <ul className="space-y-1">
                <li><Link href="/">Flüge</Link></li>
                <li><Link href="/">Hotels</Link></li>
                <li><Link href="/">Mietwagen</Link></li>
                <li><Link href="/">Explore</Link></li>
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
                <li><Link href="/partner">Partner werden</Link></li>
                <li><Link href="/firmeninfo">Firmeninfo</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <div className="max-w-5xl mx-auto px-6 py-4 text-center text-xs text-gray-500">
              © {new Date().getFullYear()} Ba & Be Partners KLG – Inwilerriedstrasse 65, 6340 Baar
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
