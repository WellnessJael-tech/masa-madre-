import { test, expect } from '@playwright/test'

const DEMO_URL = 'http://localhost:5173'
const CSV = [
  'id,name,categoryId,price,stock,imageUrl',
  'pan-bulk-e2e,Pan Bulk E2E,panes,3000,5,',
  ',Producto Categoria Mala,no-existe,1000,1,',
].join('\n')

test('importar CSV: previsualiza, marca filas inválidas, y publica solo las válidas', async ({
  page,
}) => {
  await page.goto(`${DEMO_URL}/admin`)
  await page.getByTestId('admin-password-input').fill('panmasamadre')
  await page.getByTestId('admin-password-submit').click()

  await page.getByTestId('admin-bulk-import-open').click()
  await page.getByTestId('bulk-import-textarea').fill(CSV)
  await page.getByTestId('bulk-import-preview').click()

  const rows = page.getByTestId('bulk-import-row')
  await expect(rows).toHaveCount(2)
  await expect(rows.nth(0)).toHaveAttribute('data-valid', 'true')
  await expect(rows.nth(1)).toHaveAttribute('data-valid', 'false')
  await expect(rows.nth(1)).toContainText('no existe')

  await page.getByTestId('bulk-import-publish').click()

  // Publicar escribe YAML por cada fila válida: el propio dev server de Vite
  // puede disparar un full-reload de esta pestaña al detectar el archivo
  // nuevo (mismo motivo documentado en admin-catalog.spec.js). Por eso no se
  // depende del resumen transitorio en pantalla — se verifica el estado
  // final persistido, que es correcto tanto si hubo reload como si no.
  await page.waitForTimeout(500)
  await expect(
    page.getByTestId('admin-product-list').getByText('Pan Bulk E2E')
  ).toBeVisible()
  await expect(
    page.getByTestId('admin-product-list').getByText('Producto Categoria Mala')
  ).toHaveCount(0)

  // Limpieza: elimina el producto creado para poder re-ejecutar el test.
  page.once('dialog', (dialog) => dialog.accept())
  await page
    .locator('[data-product-id="pan-bulk-e2e"]')
    .getByRole('button', { name: 'Eliminar' })
    .click()
  await expect(page.locator('[data-product-id="pan-bulk-e2e"]')).toHaveCount(0)
})
