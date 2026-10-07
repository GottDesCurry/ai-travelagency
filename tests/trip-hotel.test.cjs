const test = require('node:test'), assert = require('node:assert/strict'), ts = require('typescript'), fs = require('node:fs'), Module = require('node:module')
function load(path, dependencies = {}) {
 const m = new Module(path); m.require = name => dependencies[name] || require(name)
 m._compile(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, path)
 return m.exports
}
const flights = load('src/lib/flight-offers.ts')
const trip = load('src/lib/trip-search.ts')
const hotels = load('src/lib/hotel-offers.ts', { './flight-offers': flights })
test('all selected travel parameters are forwarded and encoded', () => {
 const f = new URLSearchParams(trip.flightQuery('ZRH','BER','2099-01-01','2099-01-05',4))
 assert.equal(f.get('adults'),'4'); assert.equal(f.get('returnDate'),'2099-01-05')
 const h = new URLSearchParams(trip.hotelQuery('A & B','2099-01-01','2099-01-05',4))
 assert.equal(h.get('city'),'A & B'); assert.equal(h.get('checkout'),'2099-01-05'); assert.equal(h.get('adults'),'4')
})
test('invalid calendar dates, past dates and stays without checkout are rejected', () => {
 for (const d of ['2026-02-30','2025-07-01','bad']) assert.ok(trip.validateTravelDates(d,''))
 assert.ok(trip.validateTravelDates('2099-01-01','',true)); assert.ok(trip.validateTravelDates('2099-01-01','2099-01-01',true))
 assert.equal(trip.validateTravelDates('2099-01-01','2099-01-05',true),null)
})
test('hotel adapter emits the format used by HotelCard with actual currency and safe links', () => {
 const [h] = hotels.normalizeHotelOffers({result:[{hotel_id:1,property:{name:'Test',address:'Berlin',review_score_word:'Gut',url:'https://example.com/hotel'},composite_price_breakdown:{gross_amount:{value:'250',currency:'EUR'}}}]})
 assert.equal(h.name,'Test'); assert.equal(h.price,250); assert.equal(h.currency,'EUR'); assert.ok(hotels.isHotelOffer(h))
 assert.throws(()=>hotels.normalizeHotelOffers({error:'fail'}))
})
test('hotel handler forwards dates and adults to the provider', async () => {
 const previous = process.env.RAPIDAPI_KEY; process.env.RAPIDAPI_KEY = 'test'
 const calls=[]
 const handler=load('pages/api/hotels.ts',{'../../src/lib/hotel-offers':hotels,'../../src/lib/trip-search':trip,axios:{get:async(url,options)=>{calls.push({url,options});return {data:calls.length===1?[{id:'city-id'}]:{result:[]}}}}}).default
 let status,payload; const res={setHeader(){},status(s){status=s;return this},json(p){payload=p;return this}}
 try { await handler({method:'GET',query:{city:'Berlin',checkin:'2099-01-01',checkout:'2099-01-05',adults:'4'}},res)
 assert.equal(status,200);assert.deepEqual(payload.results,[]);assert.equal(calls[1].options.params.adults_number,'4');assert.equal(calls[1].options.params.checkin_date,'2099-01-01');assert.equal(calls[1].options.params.checkout_date,'2099-01-05')
 }finally{if(previous===undefined)delete process.env.RAPIDAPI_KEY;else process.env.RAPIDAPI_KEY=previous}
})
