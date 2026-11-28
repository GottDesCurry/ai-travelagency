const test=require('node:test'),assert=require('node:assert/strict'),ts=require('typescript'),fs=require('node:fs'),Module=require('node:module'),path=require('node:path')
function load(p,deps={}){const m=new Module(p);m.require=name=>deps[name]||require(name);m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,p);return m.exports}
const status=load('src/lib/service-status.ts')
test('status reports only whether keys are set, never their values',()=>{
 assert.deepEqual(status.serviceStatus({}),{search:false,ai:false})
 assert.deepEqual(status.serviceStatus({RAPIDAPI_KEY:'  ',OPENAI_API_KEY:''}),{search:false,ai:false})
 const result=status.serviceStatus({RAPIDAPI_KEY:'secret-r',OPENAI_API_KEY:'secret-o'})
 assert.deepEqual(result,{search:true,ai:true});assert.ok(!JSON.stringify(result).includes('secret'))
 assert.equal(status.isServiceStatus({search:true,ai:false}),true)
 for(const v of [null,{},{search:'yes',ai:true},{search:true}])assert.equal(status.isServiceStatus(v),false)
})
test('live check sends at most 3 provider requests and never prints the key',async()=>{
 const calls=[],lines=[]
 const fixtures={'/stays/auto-complete':[{id:'-1746443'}],'/stays/search':{data:[]},'/flights/search':{data:[]}}
 const realFetch=global.fetch,realLog=console.log,realKey=process.env.RAPIDAPI_KEY
 process.env.RAPIDAPI_KEY='very-secret-key-123'
 global.fetch=async(url,init)=>{calls.push(String(url));assert.equal(init.headers['X-RapidAPI-Key'],'very-secret-key-123');const u=new URL(url);return {status:200,json:async()=>fixtures[u.pathname]}}
 console.log=(...args)=>lines.push(args.join(' '))
 try{
  const script=path.join(__dirname,'..','scripts','live-check.cjs');delete require.cache[script];require(script)
  for(let i=0;i<50&&calls.length<3;i++)await new Promise(r=>setTimeout(r,10))
  await new Promise(r=>setTimeout(r,50))
 }finally{global.fetch=realFetch;console.log=realLog;if(realKey===undefined)delete process.env.RAPIDAPI_KEY;else process.env.RAPIDAPI_KEY=realKey}
 assert.equal(calls.length,3);assert.ok(calls.every(c=>c.startsWith('https://booking-com18.p.rapidapi.com/')))
 const out=lines.join('\n');assert.ok(!out.includes('very-secret-key-123'));assert.match(out,/Flüge ZRH ⇄ BER: HTTP 200 · 0 Angebote/);assert.match(out,/Hotels Berlin: HTTP 200 · SCHEMA PASST NICHT/)
})
