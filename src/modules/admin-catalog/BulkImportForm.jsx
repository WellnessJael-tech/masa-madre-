import { useState } from 'react'
import { validate } from '@/core/config/schema/validator.js'
import { productSchema } from '@/core/catalog/schema.js'
import { slugify } from '@/core/lib/slugify.js'
import { Button } from '@/components/ui/button'

/**
 * Carga masiva vía CSV pegado (sin subida de archivo real — coherente con
 * el resto del admin, que tampoco sube imágenes, solo URLs).
 *
 * Pipeline explícitamente en dos pasos, preparado para evolucionar (ver
 * DECISIONS.md ADR-0023): pegar/parsear → validar+normalizar (reutiliza
 * EXACTAMENTE el mismo productSchema que valida altas individuales y
 * content/filesystem) → previsualizar fila por fila → publicar. No hay
 * endpoint de "bulk" en el servidor: publicar reusa createProduct() por
 * fila (mismo camino que un alta manual, solo repetido). Deliberadamente
 * NO es una plataforma de importación empresarial: no hay mapeo de
 * columnas, ni corrección de errores en la tabla, ni importación
 * incremental — es la base mínima sobre la que construir eso después.
 *
 * Parser de CSV deliberadamente ingenuo (split por coma, sin soporte de
 * comillas/comas escapadas) — documentado, no oculto.
 */
const COLUMNS = ['id', 'name', 'categoryId', 'price', 'stock', 'imageUrl']
const EXAMPLE =
  'id,name,categoryId,price,stock,imageUrl\n' +
  ',Pan de centeno,panes,4500,10,\n' +
  'galletas-jengibre,Galletas de jengibre,reposteria,2800,15,'

function parseCsv(text) {
  const lines = text
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.trim())
    const row = {}
    headers.forEach((header, index) => (row[header] = cells[index] ?? ''))
    return row
  })
}

function rowToProduct(row, currency) {
  return {
    id: row.id || slugify(row.name || ''),
    name: row.name || '',
    categoryId: row.categoryId || '',
    price: { amount: Number(row.price) || 0, currency },
    stock: { quantity: Number(row.stock) || 0 },
    images: row.imageUrl ? [{ src: row.imageUrl, alt: row.name || '' }] : [],
  }
}

export function BulkImportForm({ categories, existingIds, currency, onPublishOne, onClose }) {
  const [csvText, setCsvText] = useState('')
  const [rows, setRows] = useState(null) // null = todavía sin previsualizar
  const [publishing, setPublishing] = useState(false)
  const [summary, setSummary] = useState(null)

  const categoryIds = new Set(categories.map((c) => c.id))

  function handlePreview() {
    const parsedRows = parseCsv(csvText).map((row) => {
      const product = rowToProduct(row, currency)
      const result = validate(product, productSchema)
      const issues = result.errors.map((e) => `${e.path || 'producto'}: ${e.message}`)
      if (result.ok && !categoryIds.has(product.categoryId)) {
        issues.push(`categoryId "${product.categoryId}" no existe`)
      }
      if (result.ok && existingIds.has(product.id)) {
        issues.push(`ya existe un producto con id "${product.id}"`)
      }
      return { product: result.value ?? product, issues }
    })
    setRows(parsedRows)
    setSummary(null)
  }

  async function handlePublish() {
    setPublishing(true)
    const valid = rows.filter((r) => r.issues.length === 0)
    let created = 0
    let failed = 0
    for (const { product } of valid) {
      try {
        await onPublishOne(product)
        created++
      } catch {
        failed++
      }
    }
    setPublishing(false)
    setSummary({ created, failed, skipped: rows.length - valid.length })
    setRows(null)
    setCsvText('')
  }

  const validCount = rows?.filter((r) => r.issues.length === 0).length ?? 0

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4" data-testid="bulk-import-form">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Importar productos (CSV)</h2>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Columnas: {COLUMNS.join(', ')}. El id se genera del nombre si se omite.
      </p>

      {summary && (
        <p data-testid="bulk-import-summary" className="text-sm text-foreground">
          {summary.created} producto(s) creados, {summary.failed} fallidos, {summary.skipped} omitidos por
          errores de validación.
        </p>
      )}

      {!rows ? (
        <>
          <textarea
            data-testid="bulk-import-textarea"
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
            placeholder={EXAMPLE}
            rows={6}
            className="rounded-md border border-input bg-background p-2 font-mono text-xs text-foreground"
          />
          <Button
            type="button"
            data-testid="bulk-import-preview"
            onClick={handlePreview}
            disabled={csvText.trim() === ''}
            className="w-fit"
          >
            Previsualizar
          </Button>
        </>
      ) : (
        <>
          <ul data-testid="bulk-import-preview-list" className="flex flex-col gap-1">
            {rows.map((row, index) => (
              <li
                key={`${row.product.id}-${index}`}
                data-testid="bulk-import-row"
                data-valid={row.issues.length === 0}
                className="flex flex-col gap-0.5 rounded-md border border-border p-2 text-xs"
              >
                <span className="font-medium text-foreground">
                  {row.issues.length === 0 ? '✓' : '✗'} {row.product.name || '(sin nombre)'} —{' '}
                  {row.product.id}
                </span>
                {row.issues.map((issue) => (
                  <span key={issue} className="text-destructive">
                    {issue}
                  </span>
                ))}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Button
              type="button"
              data-testid="bulk-import-publish"
              onClick={handlePublish}
              disabled={validCount === 0 || publishing}
            >
              {publishing ? 'Publicando…' : `Publicar ${validCount} producto(s) válido(s)`}
            </Button>
            <Button type="button" variant="outline" onClick={() => setRows(null)}>
              Volver a editar
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default BulkImportForm
