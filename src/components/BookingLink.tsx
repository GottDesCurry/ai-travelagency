import { httpsBookingLink } from '@/lib/flight-offers'

export default function BookingLink({ url, label }: { url?: string; label: string }) {
  const link = httpsBookingLink(url)
  if (!link) return <p className="text-sm text-gray-500">Der Anbieter hat keinen gültigen Buchungslink geliefert.</p>
  return <div className="space-y-1">
    <a href={link} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">{label}</a>
    <p className="text-xs text-gray-500">Buchung beim Anbieter. Preis und Verfügbarkeit dort prüfen.</p>
  </div>
}
