// Compiles the real rate limiter once so handler tests exercise it without a TS loader.
const fs = require('node:fs'), ts = require('typescript'), Module = require('node:module')
const path = 'src/lib/rate-limit.ts'
const m = new Module(path)
m._compile(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, path)
module.exports = m.exports
