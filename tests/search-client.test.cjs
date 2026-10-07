const test=require('node:test'), assert=require('node:assert/strict'),ts=require('typescript'),fs=require('node:fs'),Module=require('node:module')
function load(path,deps={}){const m=new Module(path);m.require=name=>deps[name]||require(name);m._compile(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,path);return m.exports}
const flights=load('src/lib/flight-offers.ts'),hotels=load('src/lib/hotel-offers.ts',{'./flight-offers':flights}),client=load('src/lib/search-client.ts',{'./flight-offers':flights,'./hotel-offers':hotels})
const offer={id:'1',price:100,currency:'CHF',duration:'PT2H',stops:0,departure:{iataCode:'ZRH',at:'2099-01-01T10:00:00'},arrival:{iataCode:'BER',at:'2099-01-01T12:00:00'},airline:'LX',airlineCode:'LX'}
test('hotel success survives a simultaneous failed flight search',async()=>{
 const results=[],errors=[]
 await Promise.all([client.settleSearch(async()=>{throw new Error('Provider down')},v=>results.push(v),e=>errors.push(e)),client.settleSearch(async()=>['hotel'],v=>results.push(v),e=>errors.push(e))])
 assert.deepEqual(results,[['hotel']]);assert.deepEqual(errors,['Provider down'])
})
test('HTTP errors and non-JSON responses remain visible',async()=>{
 const previous=global.fetch
 try{
 global.fetch=async()=>({ok:false,status:503,json:async()=>({error:'Missing provider key'})});await assert.rejects(client.requestJson('/api/test'),/Missing provider key/)
 global.fetch=async()=>({ok:true,json:async()=>{throw new Error('html')}});await assert.rejects(client.requestJson('/api/test'),/JSON/)
 }finally{global.fetch=previous}
})
test('a stalled request is aborted and returns a retry message',async()=>{
 const previous=global.fetch
 try{global.fetch=async(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted'))));await assert.rejects(client.requestJson('/api/test',{},10),/zu lange/)}finally{global.fetch=previous}
})
test('AI HTTP failure preserves real search offers',async()=>{
 const previous=global.fetch
 try{global.fetch=async url=>url.startsWith('/api/flights')?{ok:true,json:async()=>[offer]}:{ok:false,status:500,json:async()=>({error:'AI down'})};assert.deepEqual(await client.loadFlights(''),[offer])}finally{global.fetch=previous}
})
test('ranking cannot change original prices or invent offers',async()=>{
 const previous=global.fetch
 try{global.fetch=async url=>({ok:true,json:async()=>url.startsWith('/api/flights')?[offer]:[{...offer,price:1}]});assert.equal((await client.loadFlights(''))[0].price,100)}finally{global.fetch=previous}
})
test('caller cancellation aborts HTTP and keeps its reason distinct from timeout',async()=>{
 const previous=global.fetch
 try {
  let calls=0
  global.fetch=async(url,{signal})=>{calls++;return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted'))))}
  const controller=new AbortController();const pending=client.requestJson('/api/test',{signal:controller.signal});controller.abort()
  await assert.rejects(pending,/abgebrochen/)
  await assert.rejects(client.requestJson('/api/test',{signal:controller.signal}),/abgebrochen/);assert.equal(calls,1)
 }finally{global.fetch=previous}
})
test('cancelling AI ranking does not restore already cancelled flight results',async()=>{
 const previous=global.fetch,controller=new AbortController()
 try {
  global.fetch=async(url,{signal})=>url.startsWith('/api/flights')?{ok:true,json:async()=>[offer]}:new Promise((resolve,reject)=>{signal.addEventListener('abort',()=>reject(new Error('aborted')));controller.abort()})
  await assert.rejects(client.loadFlights('',controller.signal),/abgebrochen/)
 }finally{global.fetch=previous}
})
