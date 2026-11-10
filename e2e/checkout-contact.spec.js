import { test, expect } from '@playwright/test'

/**
 * Formulario de contacto en checkout (nombre/teléfono, sin backend, solo
 * estado local) + enlace de WhatsApp con los datos del pedido tras
 * confirmar. Usa identity.contact.phone del blueprint — funciona en
 * demo-medical aunque el módulo whatsapp esté desactivado ahí, porque no
 * depende de ese módulo.
 */

const DEMO_URL = 'http://localhost:5173'

async function addOneProductAndGoToCheckout(page) {
  await page.goto(DEMO_URL)
  await page.locator('[data-product-id="galletas-avena"] [data-testid="add-to-cart"]').click()
  await page.getByRole('link', { name: /Carrito/ }).click()
  await page.getByRole('link', { name: 'Ir a pagar' }).click()
}

test('no se puede confirmar el pedido sin nombre y teléfono', async ({ page }) => {
  await addOneProductAndGoToCheckout(page)
  await expect(page.getByTestId('confirm-order')).toBeDisabled()

  await page.getByTestId('checkout-contact-name').fill('Ana Pérez')
  await expect(page.getByTestId('confirm-order')).toBeDisabled() // falta teléfono

  await page.getByTestId('checkout-contact-phone').fill('+56911112222')
  await expect(page.getByTestId('confirm-order')).toBeEnabled()
})

test('la confirmación incluye un enlace de WhatsApp con los datos del pedido', async ({
  page,
}) => {
  await addOneProductAndGoToCheckout(page)
  await page.getByTestId('checkout-contact-name').fill('Ana Pérez')
  await page.getByTestId('checkout-contact-phone').fill('+56911112222')
  await page.getByTestId('confirm-order').click()

  await expect(page.getByTestId('order-confirmed')).toBeVisible()

  const link = page.getByTestId('checkout-whatsapp-link')
  await expect(link).toBeVisible()
  const href = await link.getAttribute('href')
  const url = new URL(href)
  expect(url.hostname).toBe('wa.me')
  expect(url.pathname).toBe('/56912345678') // identity.contact.phone de demo
  const text = decodeURIComponent(url.searchParams.get('text'))
  expect(text).toContain('Ana Pérez')
  expect(text).toContain('+56911112222')
})
