// Verify the exact deployment testers will use. No provider calls without --live.
const { loadEnvConfig } = require('@next/env')
const { run } = require('./verify-beta-lib.cjs')
loadEnvConfig(process.cwd())
run(process.argv.slice(2)).then(report => {
  console.log(JSON.stringify(report, null, 2))
  process.exitCode = report.passed ? 0 : 1
}).catch(() => { console.error('Beta-Abnahme konnte nicht gestartet werden. URL und Argumente prüfen.'); process.exitCode = 1 })
