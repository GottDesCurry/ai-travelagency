/* Run against a local production server with PLAYWRIGHT_MODULE pointing to Playwright. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const assert = require('node:assert/strict')
;(async () => {
 const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
 const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
 const page = await context.newPage()
 const errors = []
 page.on('pageerror', error => errors.push(error.message))
 const flight = { id: '1', airline: 'LX', airlineCode: 'LX', price: 240, currency: 'CHF', duration: 'PT1H', stops: 0, departure: { iataCode: 'ZRH', at: '2030-01-01T10:00:00' }, arrival: { iataCode: 'BER', at: '2030-01-01T11:00:00' }, bookingLink: null }
 const hotel = { id: '1', name: 'Testhotel', address: 'Berlin', rating: 'Gut', price: 300, currency: 'CHF', bookingLink: 'https://example.com/hotel', photo: null }
 await page.route('**/api/flights-aggregated?*', async route => {
  const params = new URL(route.request().url()).searchParams
  assert.equal(params.get('adults'), '2'); assert.equal(params.get('returnDate'), '2030-01-03')
  await route.fulfill({ json: [flight] })
 })
 await page.route('**/api/hotels?*', async route => {
  const params = new URL(route.request().url()).searchParams
  assert.equal(params.get('checkout'), '2030-01-03'); assert.equal(params.get('adults'), '2')
  await route.fulfill({ json: { results: [hotel] } })
 })
 await page.route('**/api/itinerary', async route => {
  const data = route.request().postDataJSON(); assert.equal(data.budget, '1000')
  await route.fulfill({ json: { summary: 'Ein Wochenende in Berlin.', days: [1,2,3].map(day => ({ day, title: `Berlin Tag ${day}`, morning: 'Spaziergang', afternoon: 'Museum', evening: 'Abendessen' })), tips: ['Öffnungszeiten prüfen.'] } })
 })
 const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3100'
 await page.goto(base)
 await page.getByRole('button', { name: 'Animation überspringen' }).click()
 await page.screenshot({ path: '/tmp/bookrepeat-desktop.png', fullPage: true })
 await page.getByText('Hinflug / Check-in', { exact: true }).locator('..').locator('input').fill('2030-01-01')
 await page.getByText('Rückflug / Check-out', { exact: true }).locator('..').locator('input').fill('2030-01-03')
 await page.getByLabel('Erwachsene', { exact: true }).fill('2')
 await page.getByLabel('Gesamtbudget CHF · optional').fill('1000')
 await page.getByRole('button', { name: 'Natur', exact: true }).click()
 await page.getByRole('button', { name: 'Passende Angebote finden' }).click()
 await page.getByRole('button', { name: 'Diesen Flug merken' }).click()
 await page.getByRole('button', { name: 'Diese Unterkunft merken' }).click()
 await page.getByRole('button', { name: 'KI-Tagesplan erstellen' }).click()
 await page.getByRole('heading', { name: 'Deine Tage. Dein Rhythmus.' }).waitFor()
 await page.getByRole('button', { name: 'Reise auf diesem Gerät speichern' }).click()
 await page.getByRole('link', { name: 'Meine gespeicherte Reise' }).click()
 await page.getByRole('heading', { name: 'Dein Flug', exact: true }).waitFor()
 await page.getByRole('heading', { name: 'Testhotel' }).waitFor()
 await page.reload()
 await page.getByRole('heading', { name: 'Dein Tagesplan', exact: true }).waitFor()
 await page.getByRole('button', { name: 'Gespeicherte Reise löschen' }).click()
 await page.getByText('Deine gespeicherte Reise wurde gelöscht.').waitFor()
 await page.goto(base)
 assert.equal(await page.locator('.flight-intro').count(), 0)
 await page.setViewportSize({ width: 390, height: 844 })
 await page.screenshot({ path: '/tmp/bookrepeat-mobile.png', fullPage: true })
 assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true)
 const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } })
 const reducedPage = await reduced.newPage(); await reducedPage.goto(base)
 assert.equal(await reducedPage.locator('.flight-intro').count(), 0)
 assert.deepEqual(errors, [])
 await browser.close()
 console.log('Browser smoke passed: animation, parameter forwarding, selection, itinerary, persistence, deletion, mobile overflow and reduced motion.')
})().catch(error => { console.error(error); process.exit(1) })
