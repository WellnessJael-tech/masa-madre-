import { test, expect } from '@playwright/test'

/**
 * Página de producto individual (galería, descripción, cantidad, secciones
 * reservadas) + stock bajo cableado en la card y en el detalle.
 */

const DEMO_URL = 'http://localhost:5173'

test('la card enlaza a la página de detalle del producto', async ({ page }) => {
  await page.goto(DEMO_URL)
  await page.locator('[data-product-id="pan-masa-madre-clasico"] h3').click()
  await expect(page).toHaveURL(/\/producto\/pan-masa-madre-clasico/)
  await expect(page.getByTestId('product-detail')).toBeVisible()
})

test('la página de detalle muestra descripción completa y secciones reservadas', async ({
  page,
}) => {
  await page.goto(`${DEMO_URL}/producto/pan-masa-madre-clasico`)
  await expect(page.getByRole('heading', { name: 'Pan de masa madre clásico' })).toBeVisible()
  await expect(page.getByTestId('product-description')).toHaveText(
    'Fermentación natural de 24 horas. Corteza crujiente, miga alveolada.'
  )
  await expect(page.getByTestId('reviews-placeholder')).toContainText('Próximamente')
  await expect(page.getByTestId('related-placeholder')).toContainText('Próximamente')
})

test('un producto inexistente muestra "no encontrado", no un crash', async ({ page }) => {
  await page.goto(`${DEMO_URL}/producto/no-existe`)
  await expect(page.getByTestId('product-not-found')).toBeVisible()
})

test('el mensaje de stock bajo aparece en la card y en el detalle (mismo umbral)', async ({
  page,
}) => {
  // pan-integral-centeno tiene stock: 5, igual al lowStockThreshold por defecto (5).
  await page.goto(DEMO_URL)
  await expect(
    page.locator('[data-product-id="pan-integral-centeno"]').getByTestId('stock-message')
  ).toHaveText('Quedan 5')

  await page.goto(`${DEMO_URL}/producto/pan-integral-centeno`)
  await expect(page.getByTestId('stock-message')).toHaveText('Quedan 5')
})

test('agregar cantidad desde el detalle respeta el stock disponible', async ({ page }) => {
  await page.goto(`${DEMO_URL}/producto/pan-integral-centeno`)
  const plus = page.getByLabel('Aumentar cantidad')
  // Cantidad inicial es 1; stock disponible es 5 → 4 clics llegan al máximo.
  for (let i = 0; i < 4; i++) await plus.click()
  await expect(page.getByTestId('product-detail-quantity')).toHaveText('5')
  await expect(plus).toBeDisabled()
})
