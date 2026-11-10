import { test, expect } from '@playwright/test'

/**
 * Buscador de productos + selección de entrega en checkout + anuncio de
 * admin-content. Todo contra clients/demo (puerto 5173).
 */

const DEMO_URL = 'http://localhost:5173'

test('el buscador filtra por nombre respetando minChars', async ({ page }) => {
  await page.goto(DEMO_URL)
  const search = page.getByTestId('product-search')

  await search.fill('p')
  await expect(page.getByText('Escribe al menos 2 caracteres')).toBeVisible()

  await search.fill('integral')
  await expect(page.locator('[data-product-id="pan-integral-centeno"]')).toBeVisible()
  await expect(page.locator('[data-product-id="galletas-avena"]')).toHaveCount(0)

  await search.fill('xyz-no-existe')
  await expect(page.getByTestId('search-empty')).toBeVisible()
})

test('el checkout ofrece retiro y envío, y suma la tarifa al total', async ({ page }) => {
  await page.goto(DEMO_URL)
  await page.locator('[data-product-id="galletas-avena"] [data-testid="add-to-cart"]').click() // 2.500 CLP
  await page.getByRole('link', { name: /Carrito/ }).click()
  await page.getByRole('link', { name: 'Ir a pagar' }).click()

  const options = page.getByTestId('delivery-options')
  await expect(options).toBeVisible()

  // Por defecto se selecciona la primera opción (retiro, gratis) — el total
  // no debería incluir tarifa de envío.
  await expect(page.getByTestId('checkout-total')).toHaveText(/2[.,]500/)

  // Cambiar a envío a domicilio (2.500 de tarifa) sube el total a 5.000.
  await page.getByTestId('delivery-option-own-delivery:general').check()
  await expect(page.getByTestId('checkout-total')).toHaveText(/5[.,]000/)
})

test('el anuncio de admin-content aparece en demo', async ({ page }) => {
  await page.goto(DEMO_URL)
  await expect(page.getByTestId('site-announcement')).toContainText('Envío gratis')
})
