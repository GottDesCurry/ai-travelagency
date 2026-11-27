const test = require('node:test'), assert = require('node:assert/strict')
const fs = require('node:fs'), ts = require('typescript'), Module = require('node:module')
const path = 'src/lib/city-lookup.ts'
const m = new Module(path)
const deps = { '../data/iata-codes.json': require('../src/data/iata-codes.json'), '../data/city-translations.json': require('../src/data/city-translations.json') }
m.require = name => deps[name] || require(name)
m._compile(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, resolveJsonModule: true } }).outputText, path)
const { resolveCity, airportCode, hotelCityName, unresolvedCityMessage, airports } = m.exports

test('known cities, German names, accents and codes resolve without AI', () => {
 for (const [input, code] of [['Zürich', 'ZRH'], ['zurich', 'ZRH'], ['Zuerich', 'ZRH'], ['ZRH', 'ZRH'], ['zrh', 'ZRH'], ['Malaga', 'AGP'], ['Málaga', 'AGP'], ['München', 'MUC'], ['Munich', 'MUC'], ['Lisbon', 'LIS'], ['Lissabon', 'LIS'], ['Genf', 'GVA'], [' Berlin ', 'BER'], ['Rom', 'ROM']]) {
  assert.equal(airportCode(resolveCity(input)), code, input)
 }
})
test('misspellings are not guessed locally (they go to the AI correction)', () => {
 for (const input of ['Zurick', 'Malagga', 'Lissabonn', 'Münchn', 'a', 'Ber lin x']) assert.equal(resolveCity(input).kind, 'unknown', input)
})
test('unknown 3-letter input is passed on as an IATA code, as before', () => {
 assert.deepEqual(resolveCity('pmo'), { kind: 'found', code: 'PMO', city: 'Palermo' })
 assert.deepEqual(resolveCity('XYZ'), { kind: 'code', code: 'XYZ' })
})
test('hotel search receives English provider names', () => {
 assert.equal(hotelCityName('Zürich'), 'Zurich'); assert.equal(hotelCityName('LIS'), 'Lisbon'); assert.equal(hotelCityName('Malaga'), 'Malaga'); assert.equal(hotelCityName('Kleinstadt'), 'Kleinstadt')
})
test('airport data is unique and well-formed', () => {
 const codes = airports.map(a => a.code)
 assert.equal(new Set(codes).size, codes.length)
 for (const a of airports) { assert.match(a.code, /^[A-Z]{3}$/); assert.ok(a.city && a.country && a.airport) }
})
test('unclear input gets an understandable message', () => {
 assert.match(unresolvedCityMessage('Reiseziel', 'Atlantis', { kind: 'unknown' }), /nicht erkannt.*Flughafencode/)
 assert.match(unresolvedCityMessage('Reiseziel', 'X', { kind: 'ambiguous', options: [airports[0], airports[1]] }), /mehrdeutig/)
})
