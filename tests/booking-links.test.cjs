const test = require('node:test'), assert = require('node:assert/strict'), ts = require('typescript'), fs = require('node:fs'), Module = require('node:module')
const {renderToStaticMarkup} = require('react-dom/server')
const React = require('react')
function load(path, dependencies = {}) {
 const m = new Module(path); m.require = name => dependencies[name] || require(name)
 m._compile(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText, path)
 return m.exports
}
const offers = load('src/lib/flight-offers.ts')
const BookingLink = load('src/components/BookingLink.tsx', {'@/lib/flight-offers':offers}).default
const FlightCard = load('src/components/FlightCard.tsx', {'./BookingLink':BookingLink,'next/image':()=>null}).default
const HotelCard = load('src/components/HotelCard.tsx', {'./BookingLink':BookingLink,'next/image':()=>null}).default
const flight={id:'1',price:120,currency:'CHF',duration:'PT2H',stops:0,departure:{iataCode:'ZRH',at:'2026-12-01T10:00:00'},arrival:{iataCode:'BER',at:'2026-12-01T12:00:00'},airline:'LX',airlineCode:'LX'}
test('both result cards preserve the provider target and secure new-tab attributes',()=>{
 const target='https://example.com/offer?id=123&adults=4'
 for(const [Card,data,key] of [[FlightCard,flight,'flight'],[HotelCard,{id:'h',name:'Hotel',address:'Berlin',rating:'Gut',price:500,currency:'EUR'},'hotel']]){
 const html=renderToStaticMarkup(React.createElement(Card,{[key]:{...data,bookingLink:target}}))
 assert.match(html,/href="https:\/\/example.com\/offer\?id=123&amp;adults=4"/)
 assert.match(html,/target="_blank"/);assert.match(html,/rel="noopener noreferrer"/)
 assert.match(html,/Buchung beim Anbieter/)
 }
})
test('missing and unsafe links produce no clickable booking action',()=>{
 for(const url of [undefined,'','javascript:alert(1)','http://example.com','https://user:pass@example.com']){
 const html=renderToStaticMarkup(React.createElement(BookingLink,{url,label:'Zum Angebot'}))
 assert.doesNotMatch(html,/<a\b/);assert.match(html,/keinen gültigen Buchungslink/)
 }
})
