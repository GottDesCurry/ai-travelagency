const { test, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const travel = require('../.test-build/travel.js')
const provider = require('../.test-build/search-provider.js')
const originalFetch = global.fetch
process.env.RAPIDAPI_KEY = 'test-only'
const itinerary = (from, to) => ({ duration: 'PT1H', segments: [{ departure: { iataCode: from, at: '2030-01-01T10:00:00' }, arrival: { iataCode: to, at: '2030-01-01T11:00:00' }, carrierCode: 'LX' }] })
const offer = { id: '1', itineraries: [itinerary('ZRH', 'BER'), itinerary('BER', 'ZRH')], price: { total: '250.40', currency: 'CHF' } }
beforeEach(() => { global.fetch = originalFetch })
test('dates reject impossible and past dates, and zero-night hotel stays', () => {
 assert.equal(travel.validDate('2030-02-30'), false)
 assert.throws(() => travel.validateDates('2025-01-01'))
 assert.throws(() => travel.validateDates('2030-01-01', '2030-01-01', true))
 assert.throws(() => travel.validateDates('2030-01-01', '2029-12-31'))
 assert.doesNotThrow(() => travel.validateDates('2030-01-01', '2030-01-02', true))
 for (const value of ['', 0, 1.5, 10, ['2']]) assert.throws(() => travel.validateAdults(value))
})
test('flight request forwards adults and return date and preserves both legs', async () => {
 let url
 global.fetch = async request => { url = new URL(request); return Response.json({ data: [offer] }) }
 const result = await provider.searchFlights({ origin: 'ZRH', destination: 'BER', date: '2030-01-01', returnDate: '2030-01-04', adults: '3' })
 assert.equal(url.searchParams.get('adults'), '3')
 assert.equal(url.searchParams.get('returnDate'), '2030-01-04')
 assert.equal(url.searchParams.get('departDate'), '2030-01-01')
 assert.equal(result[0].price, 250.4)
 assert.equal(result[0].returnLeg.departure.iataCode, 'BER')
 assert.equal(result[0].bookingLink, null)
})
test('round trip cannot silently show a one-way flight', async () => {
 global.fetch = async () => Response.json({ data: [{ ...offer, itineraries: [offer.itineraries[0]] }] })
 await assert.rejects(provider.searchFlights({ origin: 'ZRH', destination: 'BER', date: '2030-01-01', returnDate: '2030-01-04' }), /Hin- und Rückflug/)
})
test('hotel request forwards stay dates and guests and normalizes card fields', async () => {
 const calls = []
 global.fetch = async url => {
  calls.push(new URL(url))
  return calls.length === 1 ? Response.json([{ id: 'berlin' }]) : Response.json({ result: [{ property: { id: 7, name: 'Hotel', url: 'https://example.com/hotel' }, composite_price_breakdown: { gross_amount: { value: 300, currency: 'CHF' } } }] })
 }
 const result = await provider.searchHotels({ city: 'Berlin', checkin: '2030-01-01', checkout: '2030-01-04', adults: '3' })
 assert.equal(calls[1].searchParams.get('checkin_date'), '2030-01-01')
 assert.equal(calls[1].searchParams.get('checkout_date'), '2030-01-04')
 assert.equal(calls[1].searchParams.get('adults_number'), '3')
 assert.equal(result.results[0].name, 'Hotel')
 assert.equal(result.results[0].price, 300)
})
test('invalid requests never contact the provider', async () => {
 global.fetch = async () => { throw new Error('must not call') }
 await assert.rejects(provider.searchHotels({ city: 'Berlin', checkin: '2030-01-01', adults: '2' }), /Check-out/)
 await assert.rejects(provider.searchFlights({ origin: ['ZRH'], destination: 'BER', date: '2030-01-01' }), /Flughafen/)
})
test('provider errors, invalid JSON and unknown schemas remain errors, empty results remain empty', async () => {
 global.fetch = async () => new Response('', { status: 429 })
 await assert.rejects(provider.searchFlights({ origin: 'ZRH', destination: 'BER', date: '2030-01-01' }), error => error.status === 429)
 global.fetch = async () => new Response('not json')
 await assert.rejects(provider.searchFlights({ origin: 'ZRH', destination: 'BER', date: '2030-01-01' }), /gültige Antwort/)
 assert.throws(() => travel.normalizeFlights({ surprise: [] }), /Antwortformat/)
 assert.throws(() => travel.normalizeHotels({ result: [{}] }), /konnten nicht gelesen/)
 assert.deepEqual(travel.normalizeFlights({ data: [] }), [])
 assert.equal(travel.safeUrl('javascript:alert(1)'), null)
})
