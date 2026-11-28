const test=require('node:test'),assert=require('node:assert/strict'),ts=require('typescript'),fs=require('node:fs'),Module=require('node:module')
function load(p,deps={}){const m=new Module(p);m.require=name=>deps[name]||require(name);m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,p);return m.exports}
const offers=load('src/lib/flight-offers.ts'),hotels=load('src/lib/hotel-offers.ts',{'./flight-offers':offers})
const sandbox=load('src/lib/sandbox-providers.ts'),status=load('src/lib/service-status.ts',{'./sandbox-providers':sandbox})
const duffel=load('src/lib/duffel.ts',{'./flight-offers':offers,axios:{}}),lite=load('src/lib/liteapi.ts',{'./flight-offers':offers,axios:{}})

test('only test/sandbox keys are used; live keys are ignored',()=>{
 assert.equal(sandbox.duffelTestToken({DUFFEL_ACCESS_TOKEN:'duffel_test_abc'}),'duffel_test_abc')
 assert.equal(sandbox.duffelTestToken({DUFFEL_ACCESS_TOKEN:'duffel_live_abc'}),null)
 assert.equal(sandbox.liteApiSandboxKey({LITEAPI_KEY:' sand_123 '}),'sand_123')
 assert.equal(sandbox.liteApiSandboxKey({LITEAPI_KEY:'prod_123'}),null)
 assert.deepEqual(status.serviceStatus({DUFFEL_ACCESS_TOKEN:'duffel_test_x'}),{search:true,ai:false,testMode:true})
 assert.deepEqual(status.serviceStatus({DUFFEL_ACCESS_TOKEN:'duffel_live_x'}),{search:false,ai:false,testMode:false})
})

const seg=(o,d,dep,arr,c='ZZ')=>({origin:{iata_code:o},destination:{iata_code:d},departing_at:dep,arriving_at:arr,marketing_carrier:{iata_code:c,name:'Duffel Airways'}})
const offer=(id,amount,slices,extra={})=>({id,total_amount:amount,total_currency:'EUR',owner:{name:'Duffel Airways',iata_code:'ZZ'},slices,...extra})
const out={duration:'PT1H30M',segments:[seg('ZRH','BER','2099-01-01T10:00:00','2099-01-01T11:30:00')]}
const back={duration:'PT3H',segments:[seg('BER','FRA','2099-01-05T10:00:00','2099-01-05T11:00:00'),seg('FRA','ZRH','2099-01-05T12:00:00','2099-01-05T13:00:00')]}

test('duffel request asks for one adult passenger per traveller and a return slice',()=>{
 const body=duffel.duffelRequestBody({origin:'ZRH',destination:'BER',date:'2099-01-01',returnDate:'2099-01-05',adults:2})
 assert.deepEqual(body.data.slices,[{origin:'ZRH',destination:'BER',departure_date:'2099-01-01'},{origin:'BER',destination:'ZRH',departure_date:'2099-01-05'}])
 assert.deepEqual(body.data.passengers,[{type:'adult'},{type:'adult'}]);assert.equal(body.data.cabin_class,'economy')
 assert.equal(duffel.duffelRequestBody({origin:'ZRH',destination:'BER',date:'2099-01-01',adults:1}).data.slices.length,1)
})

test('duffel offers are normalized, sorted, marked as test data and invalid ones dropped',()=>{
 const payload={data:{offers:[offer('off_2',  '250.10',[out,back]),offer('off_1','199.00',[out,back]),offer('bad_price','abc',[out,back]),offer('one_way','90',[out]),offer('bad_seg','80',[{segments:[{origin:{iata_code:'ZRH'}}]},back])]}}
 const result=duffel.normalizeDuffelOffers(payload,true)
 assert.deepEqual(result.map(o=>o.id),['off_1','off_2'])
 const first=result[0]
 assert.ok(offers.isFlightOffer(first));assert.equal(first.price,199);assert.equal(first.currency,'EUR');assert.equal(first.testData,true)
 assert.equal(first.returnLeg.stops,1);assert.equal(first.returnLeg.arrival.iataCode,'ZRH');assert.equal(first.airline,'Duffel Airways');assert.equal(first.bookingLink,undefined)
 assert.deepEqual(duffel.normalizeDuffelOffers({data:{offers:[offer('o','10',[out])]}},false).map(o=>o.id),['o'])
 assert.throws(()=>duffel.normalizeDuffelOffers({data:{}},false),/Unexpected Duffel response/)
})

test('liteapi hotels take the cheapest rate, skip unnamed hotels and never invent a price',()=>{
 const payload={data:[
  {hotelId:'lp1',roomTypes:[{offerRetailRate:{amount:420.5,currency:'CHF'}},{offerRetailRate:[{amount:380,currency:'CHF'}]}]},
  {hotelId:'lp2',roomTypes:[{offerRetailRate:{amount:'x',currency:'CHF'}}]},
  {hotelId:'nameless',roomTypes:[{offerRetailRate:{amount:10,currency:'CHF'}}]},
 ],hotels:[{id:'lp1',name:'Hotel Sandbox',address:'Unter den Linden 1',rating:8.6,main_photo:'https://static.example.com/p.jpg'},{id:'lp2',name:'Hotel Ohne Preis',main_photo:'http://insecure.example.com/p.jpg'}]}
 const result=lite.normalizeLiteHotels(payload)
 assert.deepEqual(result.map(h=>h.id),['lp1','lp2'])
 assert.ok(result.every(h=>hotels.isHotelOffer(h)&&h.testData===true))
 assert.equal(result[0].price,380);assert.equal(result[0].rating,'Bewertung 8.6');assert.equal(result[0].photo,'https://static.example.com/p.jpg')
 assert.equal(result[1].price,null);assert.equal(result[1].photo,undefined)
 assert.throws(()=>lite.normalizeLiteHotels({}),/Unexpected LiteAPI response/)
 const body=lite.liteRequestBody({cityName:'Berlin',countryCode:'DE',checkin:'2099-01-01',checkout:'2099-01-05',adults:2})
 assert.deepEqual(body.occupancies,[{adults:2}]);assert.equal(body.countryCode,'DE');assert.equal(body.guestNationality,'CH')
})

const trip=load('src/lib/trip-search.ts'),failures=load('src/lib/provider-errors.ts')
const rate={allowRequest:()=>true,pagesClient:()=>'t',RATE_LIMIT_MESSAGE:'limit'}
test('with a Duffel test token the flight search uses Duffel and still hides upstream details',async()=>{
 const posts=[]
 const axios={post:async(url,body,options)=>{posts.push({url,body,options});return {data:{data:{offers:[offer('off_1','120',[out])]}}}},get:async()=>{throw Error('RapidAPI must not be called')}}
 const duffelReal=load('src/lib/duffel.ts',{'./flight-offers':offers,axios})
 const search=load('src/lib/flight-search.ts',{'./trip-search':trip,'./flight-offers':offers,'./provider-errors':failures,'./sandbox-providers':{duffelTestToken:()=>'duffel_test_secret'},'./duffel':duffelReal,axios}).searchFlights
 const result=await search({origin:'ZRH',destination:'BER',date:'2099-01-01',adults:'2'})
 assert.equal(result.status,200);assert.equal(result.body[0].testData,true)
 assert.equal(posts[0].url,'https://api.duffel.com/air/offer_requests');assert.equal(posts[0].options.headers['Duffel-Version'],'v2')
 assert.equal(posts[0].options.headers.Authorization,'Bearer duffel_test_secret');assert.equal(posts[0].body.data.passengers.length,2)
 const failing=load('src/lib/flight-search.ts',{'./trip-search':trip,'./flight-offers':offers,'./provider-errors':failures,'./sandbox-providers':{duffelTestToken:()=>'duffel_test_secret'},'./duffel':{searchDuffel:async()=>{const e=Error('duffel_test_secret leaked');e.response={status:401};throw e}},axios}).searchFlights
 const denied=await failing({origin:'ZRH',destination:'BER',date:'2099-01-01',adults:'1'})
 assert.equal(denied.status,503);assert.ok(!JSON.stringify(denied.body).includes('secret'))
})
test('with a LiteAPI sandbox key the hotel search sends city and country, and refuses unknown cities',async()=>{
 const posts=[]
 const axios={post:async(url,body,options)=>{posts.push({url,body,options});return {data:{data:[{hotelId:'h',roomTypes:[{offerRetailRate:{amount:100,currency:'CHF'}}]}],hotels:[{id:'h',name:'Hotel Test'}]}}},get:async()=>{throw Error('RapidAPI must not be called')}}
 const city=load('src/lib/city-lookup.ts',{'../data/iata-codes.json':require('../src/data/iata-codes.json'),'../data/city-translations.json':require('../src/data/city-translations.json')})
 const handler=load('pages/api/hotels.ts',{'../../src/lib/hotel-offers':hotels,'../../src/lib/trip-search':trip,'../../src/lib/provider-errors':failures,'../../src/lib/rate-limit':rate,'../../src/lib/sandbox-providers':{liteApiSandboxKey:()=>'sand_secret'},'../../src/lib/liteapi':load('src/lib/liteapi.ts',{'./flight-offers':offers,axios}),'../../src/lib/city-lookup':city,'../../src/lib/country-codes':load('src/lib/country-codes.ts'),axios}).default
 const response=()=>{const r={statusCode:0,body:null,status(c){r.statusCode=c;return r},json(b){r.body=b;return r},setHeader(){}};return r}
 const ok=response();await handler({method:'GET',query:{city:'Lisbon',checkin:'2099-01-01',checkout:'2099-01-05',adults:'2'},headers:{}},ok)
 assert.equal(ok.statusCode,200);assert.equal(ok.body.results[0].name,'Hotel Test');assert.equal(ok.body.results[0].testData,true)
 assert.equal(posts[0].url,'https://api.liteapi.travel/v3.0/hotels/rates');assert.equal(posts[0].body.countryCode,'PT');assert.equal(posts[0].body.cityName,'Lisbon');assert.equal(posts[0].options.headers['X-API-Key'],'sand_secret')
 const unknown=response();await handler({method:'GET',query:{city:'Atlantis',checkin:'2099-01-01',checkout:'2099-01-05',adults:'1'},headers:{}},unknown)
 assert.equal(unknown.statusCode,400);assert.equal(posts.length,1)
})
