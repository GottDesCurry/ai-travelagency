// Manual live check after a key change. Sends at most 3 RapidAPI requests (location, hotels,
// flights) and, only with --openai, 1 tiny OpenAI request. Prints status codes, the response
// shape (field names, no values) and how many offers our normalizers accept. Never prints keys.
// Usage: RAPIDAPI_KEY=... [OPENAI_API_KEY=...] npm run live-check [-- --openai]
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module'), ts = require('typescript')
const root = path.join(__dirname, '..')
function load(file, deps = {}) {
  const full = path.join(root, file), m = new Module(full)
  m.require = name => deps[name] || require(name)
  m._compile(ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, full)
  return m.exports
}
const flights = load('src/lib/flight-offers.ts'), hotels = load('src/lib/hotel-offers.ts', { './flight-offers': flights })
const HOST = 'booking-com18.p.rapidapi.com'
const secrets = [process.env.RAPIDAPI_KEY, process.env.OPENAI_API_KEY].filter(Boolean)
const redact = text => secrets.reduce((out, secret) => out.split(secret).join('[redacted]'), String(text))

function shape(value, depth = 0) {
  if (Array.isArray(value)) return value.length ? [`Array(${value.length})`, shape(value[0], depth + 1)] : 'Array(0)'
  if (value && typeof value === 'object') {
    if (depth >= 3) return `{${Object.keys(value).slice(0, 12).join(', ')}}`
    return Object.fromEntries(Object.keys(value).slice(0, 20).map(key => [key, shape(value[key], depth + 1)]))
  }
  return typeof value
}
function normalized(fn) {
  try { return ` · ${fn().length} Angebote nach Normalisierung` } catch (error) { return ` · SCHEMA PASST NICHT: ${error instanceof Error ? error.message : 'unbekannt'} (Adapter anpassen)` }
}
function isoDate(daysAhead) { const d = new Date(Date.now() + daysAhead * 86400000); return d.toISOString().slice(0, 10) }

async function rapid(endpoint, params) {
  const url = `https://${HOST}${endpoint}?${new URLSearchParams(params)}`
  const response = await fetch(url, { headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 'X-RapidAPI-Host': HOST }, signal: AbortSignal.timeout(20000) })
  let body = null; try { body = await response.json() } catch { /* not JSON */ }
  return { status: response.status, body }
}
function report(title, result, extra = '') {
  console.log(`\n## ${title}: HTTP ${result.status}${extra}`)
  if (result.status !== 200) console.log(redact(JSON.stringify(result.body)).slice(0, 300))
  else console.log(JSON.stringify(shape(result.body), null, 1).slice(0, 2500))
}

async function main() {
  if (!process.env.RAPIDAPI_KEY) { console.error('RAPIDAPI_KEY fehlt. Abbruch, es wurde nichts gesendet.'); process.exitCode = 1; return }
  const checkin = isoDate(30), checkout = isoDate(33)
  const location = await rapid('/stays/auto-complete', { query: 'Berlin' })
  report('Hotel-Ort (Berlin)', location)
  const locationId = location.status === 200 && Array.isArray(location.body) ? location.body[0]?.id : undefined
  if (locationId) {
    const stays = await rapid('/stays/search', { location_id: locationId, checkin_date: checkin, checkout_date: checkout, adults_number: '2', room_number: '1', locale: 'de', currency: 'CHF', order_by: 'popularity' })
    report('Hotels Berlin', stays, stays.status === 200 ? normalized(() => hotels.normalizeHotelOffers(stays.body)) : '')
  } else console.log('\nHotelsuche übersprungen: kein Ort gefunden.')
  const flight = await rapid('/flights/search', { fromId: 'ZRH', toId: 'BER', departDate: checkin, returnDate: checkout, adults: '1', cabinClass: 'ECONOMY', currency: 'CHF' })
  report('Flüge ZRH ⇄ BER', flight, flight.status === 200 ? normalized(() => flights.normalizeFlightOffers(flight.body, true)) : '')
  if (process.argv.includes('--openai')) {
    if (!process.env.OPENAI_API_KEY) console.log('\nOPENAI_API_KEY fehlt, OpenAI-Test übersprungen.')
    else {
      const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', signal: AbortSignal.timeout(20000), headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-4o', max_tokens: 1, messages: [{ role: 'user', content: 'ok' }] }) })
      let body = null; try { body = await response.json() } catch { /* not JSON */ }
      console.log(`\n## OpenAI: HTTP ${response.status}${response.status === 200 ? '' : ' ' + redact(JSON.stringify(body?.error?.code ?? body)).slice(0, 200)}`)
    }
  }
}
main().catch(error => { console.error(redact(error instanceof Error ? error.message : error)); process.exitCode = 1 })
