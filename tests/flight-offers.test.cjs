const test = require('node:test')
const assert = require('node:assert/strict')
const ts = require('typescript')
const fs = require('node:fs')
const Module = require('node:module')
const source = ts.transpileModule(fs.readFileSync('src/lib/flight-offers.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const compiled = new Module('flight-offers'); compiled._compile(source, 'flight-offers.cjs')
const { normalizeFlightOffers, selectFlightIds, httpsBookingLink } = compiled.exports
const raw = (id, price) => ({ id, price: { total: price, currency: 'CHF' }, bookingLink: `https://example.com/${id}`, itineraries: [{ duration: 'PT2H', segments: [{ carrierCode: 'LX', departure: { iataCode: 'ZRH', at: '2026-12-01T10:00:00' }, arrival: { iataCode: 'BER', at: '2026-12-01T12:00:00' } }] }] })
test('normalization preserves price, airline and provider link', () => {
 const [f] = normalizeFlightOffers({ data: [raw('1', '123.45')] })
 assert.equal(f.price, 123.45); assert.equal(f.airlineCode, 'LX'); assert.equal(f.bookingLink, 'https://example.com/1')
})
test('AI-selected IDs return original offer objects', () => {
 const offers = normalizeFlightOffers({ data: [raw('1', 100), raw('2', 200)] })
 const result = selectFlightIds(offers, ['2', '1']); assert.equal(result[0], offers[1]); assert.equal(result[1], offers[0])
})
test('invented, duplicate and malformed selections fall back without losing offers', () => {
 const offers = normalizeFlightOffers({ data: [raw('2', 200), raw('1', 100)] })
 for (const ids of [['fake', '1'], ['1', '1'], {}, []]) assert.deepEqual(selectFlightIds(offers, ids).map(f => f.id), ['1', '2'])
})
test('bad provider envelope and unusable offers are errors; empty data is valid', () => {
 assert.throws(() => normalizeFlightOffers({ error: 'unauthorized' })); assert.throws(() => normalizeFlightOffers({ data: [raw('1', 'bad')] })); assert.deepEqual(normalizeFlightOffers({ data: [] }), [])
})
test('unsafe links are removed', () => {
 for (const url of ['javascript:alert(1)', 'http://example.com', 'https://user:pass@example.com']) assert.equal(httpsBookingLink(url), undefined)
})
const handlerSource = ts.transpileModule(fs.readFileSync('pages/api/ai.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText
const handlerModule = new Module('ai-handler')
handlerModule.require = name => name.includes('flight-offers') ? compiled.exports : name === 'openai' ? class { constructor() { throw new Error('No live AI calls in tests') } } : require(name)
handlerModule._compile(handlerSource, 'ai-handler.cjs')
async function invoke(method, body) {
 let status, payload
 const res = { setHeader() {}, status(value) { status = value; return this }, json(value) { payload = value; return this } }
 await handlerModule.exports.default({ method, body }, res)
 return { status, payload }
}
test('AI route accepts the search array and survives AI failure', async () => {
 const offers = normalizeFlightOffers({ data: [raw('2', 200), raw('1', 100)] })
 const result = await invoke('POST', offers)
 assert.equal(result.status, 200); assert.equal(result.payload[0], offers[1]); assert.equal(result.payload[1], offers[0])
})
test('AI route rejects the former incompatible envelope and wrong method', async () => {
 assert.equal((await invoke('POST', { data: [] })).status, 400)
 assert.equal((await invoke('GET', [])).status, 405)
})
test('empty search skips AI and returns a valid empty array', async () => {
 assert.deepEqual(await invoke('POST', []), { status: 200, payload: [] })
})
test('round trips preserve both directions and connecting segments without changing total price', () => {
 const value=raw('rt','450')
 value.itineraries.push({duration:'PT4H',segments:[{carrierCode:'LX',departure:{iataCode:'BER',at:'2026-12-05T10:00:00'},arrival:{iataCode:'FRA',at:'2026-12-05T11:00:00'}},{carrierCode:'LH',departure:{iataCode:'FRA',at:'2026-12-05T12:00:00'},arrival:{iataCode:'ZRH',at:'2026-12-05T14:00:00'}}]})
 const [offer]=normalizeFlightOffers({data:[value]},true)
 assert.equal(offer.price,450);assert.equal(offer.returnLeg.departure.iataCode,'BER');assert.equal(offer.returnLeg.arrival.iataCode,'ZRH');assert.equal(offer.returnLeg.stops,1);assert.equal(offer.returnLeg.segments.length,2)
 assert.equal(selectFlightIds([offer],['rt'])[0].returnLeg,offer.returnLeg)
})
test('a requested return trip never silently becomes a one-way offer',()=>{
 assert.throws(()=>normalizeFlightOffers({data:[raw('oneway',100)]},true))
 const invalid=raw('bad',100);invalid.itineraries.push({duration:'PT1H',segments:[]})
 assert.throws(()=>normalizeFlightOffers({data:[invalid]},true))
})
