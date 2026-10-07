import { test, expect } from '@playwright/test'
async function fillTrip(page: import('@playwright/test').Page) {
 await page.getByLabel('Hinreise / Check-in').fill('2099-01-01')
 await page.getByLabel('Rückreise / Check-out').fill('2099-01-05')
}
test('saved search restores after reload and can be deleted',async({page})=>{
 await page.goto('/');await fillTrip(page)
 await page.getByRole('button',{name:'Aktuelle Suche speichern'}).click()
 await expect(page.getByRole('button',{name:'Übernehmen'})).toBeVisible()
 await page.reload();await expect(page.getByRole('button',{name:'Übernehmen'})).toBeVisible()
 await page.getByLabel('Reiseziel',{exact:true}).fill('MAD')
 await page.getByRole('button',{name:'Übernehmen'}).click()
 await expect(page.getByLabel('Reiseziel',{exact:true})).toHaveValue('BER')
 await expect(page.getByLabel('Hinreise / Check-in')).toHaveValue('2099-01-01')
 await page.getByRole('button',{name:'Alle gespeicherten Suchen löschen'}).click()
 await page.reload();await expect(page.getByRole('button',{name:'Übernehmen'})).toHaveCount(0)
})
test('missing provider configuration is visible independently for flights and hotels',async({page})=>{
 await page.goto('/');await fillTrip(page)
 await page.getByRole('button',{name:'Suche starten'}).click()
 await expect(page.getByText('Flüge: Die Flugsuche ist noch nicht konfiguriert.')).toBeVisible()
 await expect(page.getByText('Hotels: Die Hotelsuche ist noch nicht konfiguriert.')).toBeVisible()
 await expect(page.getByRole('button',{name:'Suche starten'})).toBeEnabled()
})
test('a stalled search can be cancelled',async({page})=>{
 await page.route('**/api/flights-aggregated?*',async route=>{await new Promise(resolve=>setTimeout(resolve,2000));await route.fulfill({json:[]}).catch(()=>{})})
 await page.route('**/api/hotels?*',async route=>{await new Promise(resolve=>setTimeout(resolve,2000));await route.fulfill({json:{results:[]}}).catch(()=>{})})
 await page.goto('/');await fillTrip(page)
 await page.getByRole('button',{name:'Suche starten'}).click()
 await page.getByRole('button',{name:'Suche abbrechen'}).click()
 await expect(page.getByText('Flüge: Die Suche wurde abgebrochen.')).toBeVisible()
 await expect(page.getByRole('button',{name:'Suche starten'})).toBeEnabled()
})
test('help and contact work and the contact page never pretends to send',async({page})=>{
 await page.goto('/hilfe');await expect(page.getByRole('heading',{name:'Hilfe zur Beta'})).toBeVisible()
 await page.getByRole('link',{name:'Kontakt und Fehler melden'}).click()
 await expect(page.getByRole('link',{name:'E-Mail-Programm öffnen'})).toHaveAttribute('href','mailto:info@book-repeat.ch')
 await expect(page.locator('form')).toHaveCount(0)
})
