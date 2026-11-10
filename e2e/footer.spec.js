import { test, expect } from '@playwright/test'

/**
 * Footer completo (contacto, links legales, íconos sociales), disclaimer
 * médico en demo-medical, y mensaje informativo de envío gratis en el
 * carrito. Todo leído de identity.contact/delivery.ownDelivery.zones del
 * blueprint — sin ninguna rama de código por cliente.
 */

const DEMO_URL = 'http://localhost:5173'
const MEDICAL_URL = 'http://localhost:5175'

test('el footer muestra contacto e íconos sociales de demo', async ({ page }) => {
  await page.goto(DEMO_URL)
  await expect(page.getByRole('link', { name: 'hola@tiendademo.cl' })).toHaveAttribute(
    'href',
    'mailto:hola@tiendademo.cl'
  )
  await expect(page.getByRole('link', { name: '+56912345678' })).toHaveAttribute(
    'href',
    'tel:+56912345678'
  )
  await expect(page.getByTestId('social-link-instagram')).toHaveAttribute(
    'href',
    'https://instagram.com/tiendademo'
  )
  await expect(page.getByTestId('social-link-facebook')).toBeVisible()
})

test('los links legales navegan a páginas de placeholder honestas', async ({ page }) => {
  await page.goto(DEMO_URL)
  await page.getByRole('link', { name: 'Términos y condiciones' }).click()
  await expect(page).toHaveURL(/\/legal\/terminos/)
  await expect(page.getByTestId('legal-page')).toContainText('placeholder')
})

test('demo-medical NO muestra el disclaimer de salud está ausente en demo (genérico)', async ({
  page,
}) => {
  await page.goto(DEMO_URL)
  await expect(page.getByTestId('health-disclaimer')).toHaveCount(0)
})

test('demo-medical muestra el disclaimer de salud (industry: health)', async ({ page }) => {
  await page.goto(MEDICAL_URL)
  await expect(page.getByTestId('health-disclaimer')).toContainText(
    'no reemplaza una consulta médica profesional'
  )
  // También tiene su propio contacto e ícono social, mismo mecanismo.
  await expect(page.getByTestId('social-link-instagram')).toHaveAttribute(
    'href',
    'https://instagram.com/centromedicodemo'
  )
})

test('el carrito informa el umbral de envío gratis y lo actualiza al alcanzarlo', async ({
  page,
}) => {
  await page.goto(DEMO_URL)
  // pan-masa-madre-clasico: 4.500 CLP. Umbral demo: 30.000 CLP.
  await page.locator('[data-product-id="pan-masa-madre-clasico"] [data-testid="add-to-cart"]').click()
  await page.getByRole('link', { name: /Carrito/ }).click()

  await expect(page.getByTestId('free-shipping-message')).toContainText('30.000')

  // Sube la cantidad a 7 (7 * 4.500 = 31.500, supera el umbral).
  const plus = page.getByLabel('Aumentar cantidad')
  for (let i = 0; i < 6; i++) await plus.click()

  await expect(page.getByTestId('free-shipping-message')).toContainText('envío gratis')
})
