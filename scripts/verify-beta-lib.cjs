const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')

// Use the same contracts as the UI, without copying their validation rules.
function loadContract(name, dependencies = {}) {
  const filename = path.join(__dirname, '../src/lib', name + '.ts')
  const mod = new Module(filename)
  mod.require = name => dependencies[name] || require(name)
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename)
  return mod.exports
}
const flights = loadContract('flight-offers')
const hotels = loadContract('hotel-offers', { './flight-offers': flights })
const trip = loadContract('trip-search')

async function run(args, request = fetch) {
  const options = {}
  let live = false
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--live') live = true
    else if (['--url', '--date', '--return-date', '--origin', '--destination', '--city'].includes(args[i]) && args[i + 1] && !args[i + 1].startsWith('--')) options[args[i].slice(2)] = args[++i]
    else throw Error('Invalid argument')
  }
  const base = new URL(options.url)
  if (base.username || base.password || base.search || base.hash || !['http:', 'https:'].includes(base.protocol)) throw Error('Invalid URL')
  if (base.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)) throw Error('HTTPS required')
  if (live && (!options.date || !options['return-date'] || !/^[A-Z]{3}$/.test(options.origin || '') || !/^[A-Z]{3}$/.test(options.destination || '') || !options.city)) throw Error('Missing trip')
  if (live && (options.origin === options.destination || trip.validateTravelDates(options.date, options['return-date'], true))) throw Error('Invalid trip')
  const checks = []
  async function check(name, route, verify) {
    try {
      const response = await request(new URL(route, base), { redirect: 'manual', signal: AbortSignal.timeout(25000), headers: { accept: route.startsWith('/api/') ? 'application/json' : 'text/html' } })
      if (response.status !== 200) { checks.push({ name, passed: false, status: response.status }); return false }
      const passed = await verify(response)
      checks.push({ name, passed, status: response.status })
      return passed
    } catch { checks.push({ name, passed: false, reason: 'Zeitlimit, Netzwerk oder ungültige Antwort' }); return false }
  }
  // Protection redirects/login HTML are blockers, not a successful website check.
  const accessible = await check('Webseitenzugang', '/', async r => r.headers.get('content-type')?.includes('text/html') && (await r.text()).includes('Buchung und Zahlung erfolgen beim Anbieter.'))
  if (accessible) for (const route of ['/hilfe', '/kontakt', '/impressum', '/datenschutz', '/agb']) await check(route, route, async r => r.headers.get('content-type')?.includes('text/html'))
  if (live && accessible) {
    let providerBlocked = false
    for (const [adults, roundtrip] of [[1, false], [1, true], [2, true]]) {
      if (providerBlocked) break
      const query = new URLSearchParams({ origin: options.origin, destination: options.destination, date: options.date, adults: String(adults), ...(roundtrip ? { returnDate: options['return-date'] } : {}) })
      await check(`Flüge: ${roundtrip ? 'Hin/Rück' : 'Hinflug'}, ${adults} Erwachsene`, '/api/flights?' + query, async r => {
        const offers = await r.json()
        return Array.isArray(offers) && offers.length > 0 && offers.every(f => flights.isFlightOffer(f) && f.price > 0 && !!flights.httpsBookingLink(f.bookingLink) && f.departure.iataCode === options.origin && f.arrival.iataCode === options.destination && f.departure.at.slice(0, 10) === options.date && (!roundtrip || (f.returnLeg?.departure.iataCode === options.destination && f.returnLeg?.arrival.iataCode === options.origin && f.returnLeg?.departure.at.slice(0, 10) === options['return-date'])))
      })
      providerBlocked = [401, 403, 429, 503].includes(checks.at(-1).status)
    }
    const query = new URLSearchParams({ city: options.city, checkin: options.date, checkout: options['return-date'], adults: '2' })
    await check('Hotels: Aufenthalt, 2 Erwachsene', '/api/hotels?' + query, async r => {
      const payload = await r.json()
      return payload.city === options.city && Array.isArray(payload.results) && payload.results.length > 0 && payload.results.every(h => hotels.isHotelOffer(h) && h.price > 0 && !!flights.httpsBookingLink(h.bookingLink))
    })
  }
  return { mode: live ? 'Live-Suche' : 'Nur Webseitenzugang', passed: checks.every(c => c.passed), checks, liveSearchPerformed: live && accessible, remainingManualChecks: ['Preis für alle Reisenden / Nächte, Gebühren und Gepäck bestätigen', 'Hotel-Ort und Zimmerbelegung bestätigen', 'Anbieterlinks mit denselben Reisedaten öffnen', 'Mobile Bedienung und Testerberechtigung prüfen', 'Geschäftsangaben, Nutzungsrechte und Kostenlimits bestätigen'] }
}
module.exports = { run }
