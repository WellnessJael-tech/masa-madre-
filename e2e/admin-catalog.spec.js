import { test, expect } from '@playwright/test'

/**
 * Verifica el flujo del admin de catálogo (ADR-0021): agregar un producto y
 * confirmar que aparece en el catálogo público (una carga fresca — el
 * catálogo se cachea por sesión, ver core/catalog/getCatalog.js). Se
 * autolimpia al final (elimina el producto) para poder re-ejecutarse.
 *
 * Corre contra clients/demo (puerto 5173, ver playwright.config.js). La
 * contraseña usada aquí NO es un secreto real — ver ADR-0021.
 */

const DEMO_URL = 'http://localhost:5173'
const NEW_PRODUCT_ID = 'pan-de-prueba-e2e'
const NEW_PRODUCT_NAME = 'Pan de Prueba E2E'

test('una contraseña incorrecta no da acceso al admin', async ({ page }) => {
  await page.goto(`${DEMO_URL}/admin`)
  await page.getByTestId('admin-password-input').fill('contrasena-equivocada')
  await page.getByTestId('admin-password-submit').click()

  await expect(page.getByText('Contraseña incorrecta.')).toBeVisible()
  await expect(page.getByTestId('admin-add-product')).toHaveCount(0)
})

test('agregar un producto desde el admin y verlo en el catálogo público', async ({ page }) => {
  await page.goto(`${DEMO_URL}/admin`)
  await page.getByTestId('admin-password-input').fill('panmasamadre')
  await page.getByTestId('admin-password-submit').click()

  await page.getByTestId('admin-add-product').click()
  await page.getByTestId('product-name').fill(NEW_PRODUCT_NAME)
  await page.getByTestId('product-category').selectOption('panes')
  await page.getByTestId('product-price').fill('1234')
  await page.getByTestId('product-stock').fill('7')
  await page.getByTestId('product-form-submit').click()

  await expect(page.getByTestId('admin-product-list').getByText(NEW_PRODUCT_NAME)).toBeVisible()

  // El nuevo YAML coincide con el patrón de import.meta.glob de
  // content/filesystem: el propio dev server de Vite detecta el archivo y
  // puede disparar un full-reload de ESTA pestaña (todavía en /admin, con
  // HMR conectado) casi al mismo tiempo que navegamos explícitamente. Sin
  // esta espera, las dos navegaciones compiten y una aborta a la otra
  // (net::ERR_ABORTED). No hay una señal de "ya recargó" que esperar: es un
  // efecto secundario del propio servidor, no de nuestro código.
  await page.waitForTimeout(500)

  // El catálogo público (carga fresca del dev server) refleja el nuevo
  // archivo YAML — es el MISMO archivo que acaba de escribir el admin.
  await page.goto(DEMO_URL)
  const card = page.locator(`[data-product-id="${NEW_PRODUCT_ID}"]`)
  await expect(card).toBeVisible()
  await expect(card.getByText(NEW_PRODUCT_NAME)).toBeVisible()

  // Limpieza: elimina el producto para que el test se pueda re-ejecutar.
  await page.goto(`${DEMO_URL}/admin`)
  page.once('dialog', (dialog) => dialog.accept())
  await page
    .locator(`[data-product-id="${NEW_PRODUCT_ID}"]`)
    .getByRole('button', { name: 'Eliminar' })
    .click()
  await expect(page.locator(`[data-product-id="${NEW_PRODUCT_ID}"]`)).toHaveCount(0)
  await page.waitForTimeout(500) // mismo motivo que arriba: borrar el YAML también dispara el watcher

  // Confirma que también desapareció del catálogo público.
  await page.goto(DEMO_URL)
  await expect(page.locator(`[data-product-id="${NEW_PRODUCT_ID}"]`)).toHaveCount(0)
})
