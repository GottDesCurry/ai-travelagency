// Exercise the built server without sending requests to billable providers.
const { spawn } = require('node:child_process')
const assert = require('node:assert/strict')
const { setTimeout: delay } = require('node:timers/promises')
const net = require('node:net')
async function run() {
 const probe = net.createServer()
 await new Promise((resolve,reject)=>{probe.once('error',reject);probe.listen(0,'127.0.0.1',resolve)})
 const port=probe.address().port
 await new Promise(resolve=>probe.close(resolve))
 const env={...process.env};delete env.RAPIDAPI_KEY;delete env.OPENAI_API_KEY
 const child=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'start','-H','127.0.0.1','-p',String(port)],{env,stdio:['ignore','pipe','pipe']})
 let output='';child.stdout.on('data',chunk=>{output+=chunk});child.stderr.on('data',chunk=>{output+=chunk})
 const base=`http://127.0.0.1:${port}`
 try {
  let ready=false
  for(let i=0;i<80;i++) {
   if(child.exitCode!==null)throw Error('Server failed to start')
   try{const response=await fetch(base,{signal:AbortSignal.timeout(1000)});if(response.ok){ready=true;break}}catch{}
   await delay(250)
  }
  assert.ok(ready,'Server did not become ready')
  const html=await (await fetch(base)).text();assert.ok(html.includes('Erwachsene (1'));assert.ok(html.includes('bezahlst anschließend'))
  const cases=[
   ['/api/flights?origin=ZRH&destination=BER&date=2099-01-01',503],
   ['/api/flights?origin=invalid&destination=BER&date=2099-01-01',400],
   ['/api/search-flights?from=ZRH&to=BER&departure=2099-01-01',503],
   ['/api/hotels-location?name=Berlin',503],
   ['/api/hotels-location?name=',400],
   ['/api/flights-booking',503,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin:'ZRH',destination:'BER',date:'2099-01-01',adults:4})}],
   ['/api/flights-booking',400,{method:'POST',headers:{'Content-Type':'application/json'},body:'not json'}],
   ['/api/ai-correct-city',400,{method:'POST',headers:{'Content-Type':'application/json'},body:'null'}],
   ['/api/ai-correct-city',503,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:'Berlin'})}],
   ['/api/parse-trip',503,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:'Berlin'})}]
  ]
  for(const [path,status,options] of cases){
   const result=await fetch(base+path,{...options,signal:AbortSignal.timeout(5000)});assert.equal(result.status,status,path);assert.ok(result.headers.get('content-type')?.includes('application/json'),path);await result.json()
  }
  console.log(`Production smoke passed: page + ${cases.length} API cases; provider credentials removed.`)
 } catch(error) { console.error(output);throw error }
 finally {child.kill('SIGTERM');await Promise.race([new Promise(resolve=>child.once('exit',resolve)),delay(3000)]);if(child.exitCode===null)child.kill('SIGKILL')}
}
run().catch(error=>{console.error(error.message);process.exitCode=1})
