const test = require('node:test')
const assert = require('node:assert/strict')
const { run } = require('../scripts/verify-beta-lib.cjs')
const html = () => new Response('Buchung und Zahlung erfolgen beim Anbieter.', { headers: { 'content-type': 'text/html' } })
const args = ['--url', 'https://preview.example', '--live', '--origin', 'ZRH', '--destination', 'BER', '--city', 'Berlin', '--date', '2099-01-01', '--return-date', '2099-01-05']
test('default verification never calls a provider endpoint', async () => {
  const urls = []
  const report = await run(['--url', 'https://preview.example'], async url => { urls.push(url.pathname); return html() })
  assert.equal(report.passed, true); assert.equal(report.liveSearchPerformed, false)
  assert.equal(urls.length, 6); assert.ok(urls.every(url => !url.startsWith('/api/')))
})
test('protected redirects and login pages block all live search calls', async () => {
  for (const response of [new Response('', { status: 307, headers: { location: 'https://login.example' } }), new Response('Login', { headers: { 'content-type': 'text/html' } })]) {
    let calls = 0
    const report = await run(args, async () => { calls++; return response })
    assert.equal(report.passed, false); assert.equal(report.liveSearchPerformed, false); assert.equal(calls, 1)
  }
})
test('provider access failure stops repeated flight calls and does not expose response details', async () => {
  const urls = []
  const report = await run(args, async url => {
    urls.push(url.pathname)
    return url.pathname.startsWith('/api/') ? new Response(JSON.stringify({ error: 'private billing detail' }), { status: 503 }) : html()
  })
  assert.equal(report.passed, false)
  assert.equal(urls.filter(p => p === '/api/flights').length, 1)
  assert.equal(urls.filter(p => p === '/api/hotels').length, 1)
  assert.ok(!JSON.stringify(report).includes('private'))
})
test('empty successful responses are not live acceptance evidence', async () => {
  const report = await run(args, async url => url.pathname.startsWith('/api/') ? Response.json(url.pathname === '/api/flights' ? [] : { city: 'Berlin', results: [] }) : html())
  assert.equal(report.passed, false)
  assert.ok(report.checks.filter(c => c.name.startsWith('Flüge') || c.name.startsWith('Hotels')).every(c => !c.passed))
})
test('valid search contracts pass and a wrong return route fails', async () => {
  const leg = (from, to, date) => ({ duration: 'PT1H', stops: 0, departure: { iataCode: from, at: date + 'T10:00:00' }, arrival: { iataCode: to, at: date + 'T11:00:00' }, airline: 'LX', airlineCode: 'LX', segments: [{ departure: { iataCode: from, at: date + 'T10:00:00' }, arrival: { iataCode: to, at: date + 'T11:00:00' }, airlineCode: 'LX' }] })
  for (const wrongRoute of [false, true]) {
    const report = await run(args, async url => {
      if (url.pathname === '/api/flights') {
        const outbound = leg('ZRH', 'BER', '2099-01-01')
        return Response.json([{ id: 'real', price: 220, currency: 'CHF', ...outbound, outboundLeg: outbound, ...(url.searchParams.has('returnDate') ? { returnLeg: leg('BER', wrongRoute ? 'GVA' : 'ZRH', '2099-01-05') } : {}), bookingLink: 'https://supplier.example/offer' }])
      }
      if (url.pathname === '/api/hotels') return Response.json({ city: 'Berlin', results: [{ id: 'hotel', name: 'Hotel', address: 'Berlin', rating: 'Gut', price: 400, currency: 'CHF', bookingLink: 'https://supplier.example/hotel' }] })
      return html()
    })
    assert.equal(report.passed, !wrongRoute)
  }
})
test('invalid travel dates and URLs fail before any request', async () => {
  let calls = 0
  const request = async () => { calls++; return html() }
  await assert.rejects(run(['--url', 'https://user:secret@example.com'], request))
  await assert.rejects(run([...args.slice(0, -4), '--date', '2026-02-30', '--return-date', '2099-01-05'], request))
  assert.equal(calls, 0)
})
