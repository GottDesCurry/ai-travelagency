'use client'
import { useEffect, useState } from 'react'
import { isServiceStatus, type ServiceStatus } from '@/lib/service-status'

/** Tells visitors before they search whether flight/hotel search and the AI are switched on. */
export default function ServiceNotice() {
  const [status, setStatus] = useState<ServiceStatus | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/status', { signal: controller.signal, cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then((data: unknown) => { if (isServiceStatus(data)) setStatus(data) })
      .catch(() => { /* Without status the search still reports its own errors. */ })
    return () => controller.abort()
  }, [])
  if (!status || (status.search && status.ai && !status.testMode)) return null
  return <div className="service-notice" role="status">
    {!status.search && <p><strong>Beta-Hinweis:</strong> Die Flug- und Hotelsuche ist in dieser Version noch nicht freigeschaltet. Du kannst die Seite ansehen und Suchen vorbereiten; Angebote erscheinen, sobald der Anbieterzugang aktiv ist.</p>}
    {status.testMode && <p><strong>Testumgebung:</strong> Angebote stammen aus den Sandboxes von Duffel bzw. Nuitée. Es sind Testdaten, sie sind nicht buchbar.</p>}
    {status.search && !status.ai && <p>Die KI-Erkennung des Reisewunschs ist gerade nicht verfügbar. Bitte fülle die Felder direkt aus – die Suche funktioniert trotzdem.</p>}
  </div>
}
