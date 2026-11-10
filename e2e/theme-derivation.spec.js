import { test, expect } from '@playwright/test'

/**
 * Prueba que dos clientes derivados del mismo core (demo vs demo-medical)
 * producen colores de marca distintos SOLO cambiando VITE_CLIENT — sin tocar
 * ningún archivo de src/core, src/modules ni src/components/ui. Es la
 * verificación real de la promesa central de Masa Madre: CLIENT BLUEPRINT +
 * THEME + CONTENT deriva una tienda sin reescribir el núcleo.
 *
 * Ver docs/architecture/ARCHITECTURE.md §6 y docs/architecture/DECISIONS.md
 * ADR-0019. playwright.config.js levanta un dev server por cliente, en
 * puertos distintos, cada uno con su propio VITE_CLIENT.
 */

const DEMO_URL = 'http://localhost:5173'
const MEDICAL_URL = 'http://localhost:5175'

test('demo y demo-medical usan colores primarios distintos', async ({ page }) => {
  await page.goto(DEMO_URL)
  const demoPrimary = await page
    .locator('[data-testid="add-to-cart"]')
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor)

  await page.goto(MEDICAL_URL)
  const medicalPrimary = await page
    .locator('[data-testid="add-to-cart"]')
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor)

  expect(demoPrimary).not.toBe(medicalPrimary)
  // demo-medical declara --primary: #1e4e8c en su theme.css → rgb(30, 78, 140)
  expect(medicalPrimary).toBe('rgb(30, 78, 140)')
})

test('demo-medical sirve su propio catálogo — mismo adaptador, contenido distinto', async ({
  page,
}) => {
  await page.goto(MEDICAL_URL)
  await expect(page.getByText('Termómetro digital')).toBeVisible()
  // "Equipos" aparece varias veces (pestaña de filtro + badge por tarjeta):
  // basta con que exista al menos una.
  await expect(page.getByText('Equipos').first()).toBeVisible()
  await expect(page.getByText('Pan de masa madre')).toHaveCount(0)
})

test('carrito y checkout funcionan igual en demo-medical, sin lógica duplicada', async ({
  page,
}) => {
  await page.goto(MEDICAL_URL)

  await page.locator('[data-product-id="termometro-digital"] [data-testid="add-to-cart"]').click()
  await page.locator('[data-product-id="alcohol-gel-500ml"] [data-testid="add-to-cart"]').click()

  const cartLink = page.getByRole('link', { name: /Carrito/ })
  await expect(cartLink).toContainText('2')
  await cartLink.click()
  await expect(page).toHaveURL(/\/carrito/)

  // 12.990 + 2.990 = 15.980 CLP
  await expect(page.getByTestId('cart-total')).toHaveText(/15[.,]980/)

  await page.getByRole('link', { name: 'Ir a pagar' }).click()
  await expect(page).toHaveURL(/\/checkout/)

  // Datos de contacto obligatorios desde el Bloque 6 (ver e2e/checkout-contact.spec.js).
  await page.getByTestId('checkout-contact-name').fill('Cliente de Prueba')
  await page.getByTestId('checkout-contact-phone').fill('+56900000000')

  await page.getByTestId('confirm-order').click()

  const confirmation = page.getByTestId('order-confirmed')
  await expect(confirmation).toBeVisible()
  await expect(confirmation.getByText('PEDIDO DE DEMOSTRACIÓN')).toBeVisible()
})

test('un producto sin stock se comporta igual en demo-medical', async ({ page }) => {
  await page.goto(MEDICAL_URL)
  const outOfStock = page.locator('[data-product-id="mascarillas-quirurgicas"]')
  await expect(outOfStock.getByText('Sin stock')).toBeVisible()
  await expect(outOfStock.getByTestId('add-to-cart')).toHaveCount(0)
})
