const test=require('node:test'),assert=require('node:assert/strict'),ts=require('typescript'),fs=require('node:fs'),Module=require('node:module')
function load(path,deps={}){const m=new Module(path);m.require=name=>deps[name]||require(name);m._compile(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,path);return m.exports}
const trip=load('src/lib/trip-search.ts'),saved=load('src/lib/saved-searches.ts',{'./trip-search':trip})
const value={id:'abc',origin:'ZRH',destination:'BER',date:'2099-01-01',returnDate:'2099-01-05',people:2,searchFlights:true,searchHotels:true}
test('saved searches round-trip only the documented fields',()=>{
 const raw=saved.encodeSavedSearches([{...value,prompt:'private',payment:'secret',bookingLink:'https://private.test'}])
 assert.ok(!raw.includes('private'));assert.ok(!raw.includes('secret'));assert.deepEqual(saved.decodeSavedSearches(raw),[value])
})
test('malformed, oversized and unsupported saved data is ignored',()=>{
 for(const raw of [null,'bad','x'.repeat(20001),'{}',JSON.stringify({version:2,searches:[value]})])assert.deepEqual(saved.decodeSavedSearches(raw),[])
 for(const change of [{id:'../../private'},{origin:''},{people:2.5},{people:10},{date:'2099-02-30'},{returnDate:''},{searchFlights:false,searchHotels:false}])assert.equal(saved.isSavedSearch({...value,...change}),false)
})
test('duplicates are removed and at most ten saved searches can be restored',()=>{
 const searches=[value,value,...Array.from({length:20},(_,i)=>({...value,id:'id-'+i}))]
 const result=saved.decodeSavedSearches(JSON.stringify({version:1,searches}));assert.equal(result.length,10);assert.equal(new Set(result.map(v=>v.id)).size,10)
})
