const test = require('node:test'), assert = require('node:assert/strict')
const { allowRequest, clientKey, pagesClient, routeClient, resetRateLimits } = require('./helpers/rate-limit.cjs')

test('per-client AI limit blocks after 40 calls and resets after the window', () => {
 resetRateLimits()
 const now = 1_000_000
 for (let i = 0; i < 40; i++) assert.equal(allowRequest('ai', '1.1.1.1', now), true)
 assert.equal(allowRequest('ai', '1.1.1.1', now), false)
 assert.equal(allowRequest('ai', '2.2.2.2', now), true, 'other clients are unaffected')
 assert.equal(allowRequest('ai', '1.1.1.1', now + 10 * 60 * 1000 + 1), true)
})
test('per-instance cap bounds total spend across many clients', () => {
 resetRateLimits()
 const now = 5_000_000
 for (let i = 0; i < 300; i++) assert.equal(allowRequest('provider', `c${i}`, now), true)
 assert.equal(allowRequest('provider', 'fresh-client', now), false)
 assert.equal(allowRequest('ai', 'fresh-client', now), true, 'scopes are separate')
})
test('client key uses the first forwarded address and tolerates missing headers', () => {
 assert.equal(clientKey('203.0.113.5, 10.0.0.1'), '203.0.113.5')
 assert.equal(clientKey(undefined, '198.51.100.7'), '198.51.100.7')
 assert.equal(pagesClient({ headers: { 'x-forwarded-for': ['192.0.2.1'] } }), '192.0.2.1')
 assert.equal(routeClient({ headers: new Headers({ 'x-real-ip': '192.0.2.9' }) }), '192.0.2.9')
 assert.equal(pagesClient({}), 'unknown')
})
