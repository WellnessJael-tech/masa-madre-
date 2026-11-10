import { test, expect } from '@playwright/test'

/**
 * Prueba que un módulo (whatsapp) se activa o no según lo que declara el
 * blueprint de cada cliente — sin ninguna rama de código que distinga
 * clientes. clients/demo lo activa; clients/demo-medical lo declara
 * `enabled: false` a propósito. Ver docs/modules/MODULES.md y
 * docs/architecture/DECISIONS.md ADR-0020.
 */

const DEMO_URL = 'http://localhost:5173'
const MEDICAL_URL = 'http://localhost:5175'

test('el botón de WhatsApp aparece en demo (módulo activado)', async ({ page }) => {
  await page.goto(DEMO_URL)
  await expect(page.getByTestId('whatsapp-button')).toBeVisible()
})

test('el enlace de WhatsApp usa el número y el mensaje del blueprint de demo', async ({
  page,
}) => {
  await page.goto(DEMO_URL)
  const href = await page.getByTestId('whatsapp-button').getAttribute('href')
  const url = new URL(href)
  expect(url.hostname).toBe('wa.me')
  expect(url.pathname).toBe('/56912345678')
  expect(url.searchParams.get('text')).toBe(
    'Hola, quiero consultar por un producto de la tienda.'
  )
})

test('el botón de WhatsApp NO aparece en demo-medical (módulo desactivado)', async ({ page }) => {
  await page.goto(MEDICAL_URL)
  await expect(page.getByTestId('whatsapp-button')).toHaveCount(0)
})
