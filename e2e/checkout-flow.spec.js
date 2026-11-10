import { test, expect } from '@playwright/test'

/**
 * Smoke test end-to-end del flujo de compra completo contra clients/demo.
 *
 * Reemplaza las verificaciones SSR manuales de los Bloques 2-3 para todo lo
 * que toque carrito o checkout: esto SÍ simula clicks reales de un usuario en
 * un navegador (ver docs/architecture/DECISIONS.md D-08). Corre contra el
 * dev server real (playwright.config.js lo levanta), leyendo VITE_CLIENT y
 * VITE_MODE de .env (demo/demo, ya versionado).
 */

const PAN_CLASICO = 'pan-masa-madre-clasico' // 4.500 CLP
const PAN_INTEGRAL = 'pan-integral-centeno' // 5.200 CLP
const EXPECTED_TOTAL = 4500 + 5200 // 9.700 CLP — un producto de cada uno

/** Acepta "9.700" o "9,700" según el separador de miles del ICU del runner. */
function moneyPattern(amount) {
  const withSeparators = String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '[.,]')
  return new RegExp(withSeparators)
}

test('agregar 2 productos, verificar el total y completar el checkout de demostración', async ({
  page,
}) => {
  await page.goto('/')

  // La tienda demo carga con el catálogo real y el aviso de modo demo.
  await expect(page.getByText('MODO DEMO')).toBeVisible()
  await expect(page.locator(`[data-product-id="${PAN_CLASICO}"]`)).toBeVisible()

  // 2. Agregar 2 productos distintos con clicks reales.
  await page.locator(`[data-product-id="${PAN_CLASICO}"] [data-testid="add-to-cart"]`).click()
  await page.locator(`[data-product-id="${PAN_INTEGRAL}"] [data-testid="add-to-cart"]`).click()

  const cartLink = page.getByRole('link', { name: /Carrito/ })
  await expect(cartLink).toContainText('2')
  await cartLink.click()
  await expect(page).toHaveURL(/\/carrito/)

  // 3. El total mostrado coincide con lo esperado.
  await expect(page.getByTestId('cart-total')).toHaveText(moneyPattern(EXPECTED_TOTAL))

  // 4. Completar el checkout.
  await page.getByRole('link', { name: 'Ir a pagar' }).click()
  await expect(page).toHaveURL(/\/checkout/)
  await expect(page.getByTestId('checkout-total')).toHaveText(moneyPattern(EXPECTED_TOTAL))

  // Datos de contacto obligatorios desde el Bloque 6 (sin ellos el botón
  // de confirmar queda deshabilitado — ver e2e/checkout-contact.spec.js).
  await page.getByTestId('checkout-contact-name').fill('Cliente de Prueba')
  await page.getByTestId('checkout-contact-phone').fill('+56900000000')

  await page.getByTestId('confirm-order').click()

  // 5. Confirmación marcada explícitamente como demostración.
  const confirmation = page.getByTestId('order-confirmed')
  await expect(confirmation).toBeVisible()
  await expect(confirmation.getByText('PEDIDO DE DEMOSTRACIÓN')).toBeVisible()
  await expect(confirmation.getByText('¡Pedido confirmado!')).toBeVisible()

  // El carrito quedó vacío tras confirmar (useCart().clear() en CheckoutView).
  await page.goto('/carrito')
  await expect(page.getByText('Tu carrito está vacío.')).toBeVisible()
})

test('un producto sin stock no se puede agregar', async ({ page }) => {
  await page.goto('/')
  const outOfStock = page.locator('[data-product-id="focaccia-romero"]')
  await expect(outOfStock.getByText('Sin stock')).toBeVisible()
  await expect(outOfStock.getByTestId('add-to-cart')).toHaveCount(0)
})
