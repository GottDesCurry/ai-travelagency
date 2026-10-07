const test = require('node:test'), assert = require('node:assert/strict')
const fs = require('node:fs'), ts = require('typescript'), Module = require('node:module')
function load(path, deps = {}) {
 const m = new Module(path); m.require = name => deps[name] || require(name)
 m._compile(ts.transpileModule(fs.readFileSync(path, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,path)
 return m.exports
}
const trip = load('src/lib/trip-search.ts'), offers = load('src/lib/flight-offers.ts')
const parsed = load('src/lib/parsed-trip.ts', {'./trip-search':trip})
const query = {origin:'ZRH',destination:'BER',date:'2099-01-01',returnDate:'2099-01-05',adults:'4'}
const server = {'next/server':{NextResponse:{json:(body,options={})=>Response.json(body,options)}}}
async function withKey(key,fn) { const old=process.env.RAPIDAPI_KEY; if(key===undefined)delete process.env.RAPIDAPI_KEY;else process.env.RAPIDAPI_KEY=key;try{return await fn()}finally{if(old===undefined)delete process.env.RAPIDAPI_KEY;else process.env.RAPIDAPI_KEY=old} }
test('flight requests reject malformed input and configuration before calling provider', async()=>{
 let calls=0
 const search=load('src/lib/flight-search.ts',{'./trip-search':trip,'./flight-offers':offers,axios:{get:async()=>{calls++;throw Error()}}}).searchFlights
 await withKey(undefined,async()=>{
  for(const bad of [{...query,origin:''},{...query,origin:'Zurich'},{...query,destination:'ZRH'},{...query,adults:'01'},{...query,adults:['4']},{...query,date:'2099-02-30'}]) assert.equal((await search(bad)).status,400)
  assert.equal((await search(query)).status,503);assert.equal(calls,0)
 })
})
test('flight provider receives dates and adults; unexpected envelopes produce 502',async()=>{
 let options
 const search=load('src/lib/flight-search.ts',{'./trip-search':trip,'./flight-offers':offers,axios:{get:async(url,o)=>{options=o;return {data:{data:[]}}}}}).searchFlights
 await withKey('test',async()=>{assert.deepEqual(await search(query),{status:200,body:[]});assert.equal(options.params.returnDate,query.returnDate);assert.equal(options.params.adults,'4');assert.equal(options.timeout,15000)})
 const broken=load('src/lib/flight-search.ts',{'./trip-search':trip,'./flight-offers':offers,axios:{get:async()=>({data:{error:'secret provider detail'}})}}).searchFlights
 await withKey('test',async()=>{const result=await broken(query);assert.equal(result.status,502);assert.ok(!JSON.stringify(result).includes('secret'))})
})
test('legacy flight endpoint rejects malformed JSON and shares the validated search contract',async()=>{
 let forwarded
 const route=load('src/app/api/flights-booking/route.ts',{...server,'../../../lib/flight-search':{searchFlights:async(q)=>{forwarded=q;return {status:200,body:[]}}}})
 assert.equal((await route.POST({json:async()=>{throw Error()}})).status,400)
 assert.equal((await route.POST({json:async()=>null})).status,400)
 const response=await route.POST({json:async()=>({...query,adults:4})});assert.equal(response.status,200);assert.equal(forwarded.adults,'4');assert.equal(forwarded.returnDate,query.returnDate)
})
test('hotel location encodes names and distinguishes empty, bad and missing configuration responses',async()=>{
 const route=load('src/app/api/hotels-location/route.ts',server), old=global.fetch
 try {
  await withKey(undefined,async()=>assert.equal((await route.GET({url:'https://local/api?name=Berlin'})).status,503))
  await withKey('test',async()=>{
   let requested
   global.fetch=async(url)=>{requested=new URL(url);return Response.json([{dest_id:'1',name:'A & B'}])}
   assert.equal((await route.GET({url:'https://local/api?name=A%20%26%20B'})).status,200)
   assert.equal(requested.searchParams.get('name'),'A & B');assert.equal(requested.searchParams.get('locale'),'de')
   global.fetch=async()=>Response.json([]);assert.equal((await route.GET({url:'https://local/api?name=X'})).status,404)
   for(const data of [{error:'bad'},[{}]]) {global.fetch=async()=>Response.json(data);assert.equal((await route.GET({url:'https://local/api?name=X'})).status,502)}
   global.fetch=async()=>new Response('bad',{status:429});assert.equal((await route.GET({url:'https://local/api?name=X'})).status,502)
  })
 }finally{global.fetch=old}
})
test('AI trip fields are optional but malformed shapes, dates and people are rejected',()=>{
 assert.deepEqual(parsed.normalizeParsedTrip({origin:' Zurich ',date:'2099-01-01',people:4}),{origin:'Zurich',destination:null,date:'2099-01-01',returnDate:null,people:4})
 for(const value of [null,[],{date:123},{date:'2099-02-30'},{date:'2099-01-05',returnDate:'2099-01-01'},{people:'4'},{people:2.5},{people:10},{origin:{bad:true}}])assert.throws(()=>parsed.normalizeParsedTrip(value))
})
test('city correction rejects null and oversized bodies without an AI call',async()=>{
 const handler=load('pages/api/ai-correct-city.ts',{openai:class{constructor(){throw Error('No network')}}}).default
 let status;const res={setHeader(){},status(n){status=n;return this},json(){return this}}
 for(const body of [null,{}, {input:'x'.repeat(121)}]){await handler({method:'POST',body},res);assert.equal(status,400)}
})
test('legacy one-way parameter names preserve return date and adults and reject POST',async()=>{
 let forwarded,status
 const handler=load('pages/api/search-flights.ts',{'../../src/lib/flight-search':{searchFlights:async(q)=>{forwarded=q;return {status:200,body:[]}}}}).default
 const res={setHeader(){},status(n){status=n;return this},json(){return this}}
 await handler({method:'GET',query:{from:'ZRH',to:'BER',departure:query.date,returnDate:query.returnDate,adults:'4'}},res)
 assert.equal(status,200);assert.deepEqual(forwarded,query)
 await handler({method:'POST',query:{}},res);assert.equal(status,405)
})
