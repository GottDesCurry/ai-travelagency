const test=require('node:test'),assert=require('node:assert/strict'),ts=require('typescript'),fs=require('node:fs'),Module=require('node:module')
function load(path,deps={}){const m=new Module(path);m.require=name=>deps[name]||(name.endsWith('/rate-limit')?require('./helpers/rate-limit.cjs'):require(name));m._compile(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,path);return m.exports}
const offers=load('src/lib/flight-offers.ts'),fav=load('src/lib/favorites.ts',{'./flight-offers':offers}),total=load('src/lib/trip-total.ts')
const airport=(iataCode,at)=>({iataCode,at})
const flight={id:'f1',price:120.5,currency:'CHF',duration:'PT1H30M',stops:0,departure:airport('ZRH','2099-08-10T07:00:00'),arrival:airport('AGP','2099-08-10T09:30:00'),airline:'Swiss',airlineCode:'LX',bookingLink:'https://flights.booking.com/x'}
const hotel={id:'h1',name:'Hotel Sol',address:'Malaga',rating:'Sehr gut',price:300,currency:'CHF',bookingLink:'https://www.booking.com/hotel/x'}
const now=new Date('2099-01-01T10:00:00Z')
test('favorites keep only the fields shown on the card',()=>{
 const f=fav.favoriteFromFlight({...flight,secret:'nope'},now),h=fav.favoriteFromHotel({...hotel,photo:'https://cf.bstatic.com/p.jpg'},now)
 const raw=fav.encodeFavorites([{...f,payment:'secret'},h])
 assert.ok(!raw.includes('secret'));assert.ok(!raw.includes('bstatic'))
 assert.deepEqual(fav.decodeFavorites(raw),[f,h])
 assert.equal(f.key,'flight:f1');assert.equal(f.price,120.5);assert.equal(h.key,'hotel:h1')
})
test('toggling adds to the top and removes again',()=>{
 const f=fav.favoriteFromFlight(flight,now),h=fav.favoriteFromHotel(hotel,now)
 const one=fav.toggleFavorite([],f),two=fav.toggleFavorite(one,h)
 assert.deepEqual(two.map(v=>v.key),['hotel:h1','flight:f1'])
 assert.deepEqual(fav.toggleFavorite(two,f).map(v=>v.key),['hotel:h1'])
})
test('malformed, unsafe or oversized favorites are ignored',()=>{
 const good=fav.favoriteFromHotel(hotel,now)
 for(const raw of [null,'bad','x'.repeat(60001),'{}',JSON.stringify({version:2,items:[good]})])assert.deepEqual(fav.decodeFavorites(raw),[])
 for(const change of [{link:'javascript:alert(1)'},{link:'http://booking.com'},{price:-1},{price:'12'},{currency:'chf'},{kind:'car'},{key:'flight:h1'},{title:''},{savedAt:'never'}])assert.equal(fav.isFavorite({...good,...change}),false)
 const many=Array.from({length:50},(_,i)=>({...good,key:'hotel:'+i}))
 const result=fav.decodeFavorites(JSON.stringify({version:1,items:[good,good,...many]}))
 assert.equal(result.length,fav.MAX_FAVORITES);assert.equal(new Set(result.map(v=>v.key)).size,result.length)
})
test('cheapest combination adds only real prices in the same currency',()=>{
 const flights=[flight,{...flight,id:'f2',price:90,currency:'EUR'},{...flight,id:'f3',price:150}]
 const hotels=[hotel,{...hotel,id:'h2',price:null},{...hotel,id:'h3',price:200,currency:'USD'},{...hotel,id:'h4',price:250.25}]
 const best=total.cheapestCombination(flights,hotels)
 assert.equal(best.flight.id,'f1');assert.equal(best.hotel.id,'h4');assert.equal(best.total,370.75);assert.equal(best.currency,'CHF')
 assert.equal(total.cheapestCombination([flight],[{...hotel,price:null}]),null)
 assert.equal(total.cheapestCombination([flight],[{...hotel,currency:'EUR'}]),null)
 assert.equal(total.cheapestCombination([],[hotel]),null)
})
