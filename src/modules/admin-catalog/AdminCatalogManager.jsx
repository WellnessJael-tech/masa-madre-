import { useEffect, useState } from 'react'
import { getRuntime } from '@/core/config/runtime.js'
import { formatMoney } from '@/core/commerce/money.js'
import { Button } from '@/components/ui/button'
import { listProducts, createProduct, updateProduct, deleteProduct } from './adminApi.js'
import { ProductForm } from './ProductForm.jsx'
import { BulkImportForm } from './BulkImportForm.jsx'

/**
 * Lista de productos + alta/edición/baja. Lee y escribe directamente contra
 * el API de solo-desarrollo (adminApi.js) — NO usa el caché de
 * core/catalog/getCatalog.js, porque ese caché es para el storefront
 * público (una foto fija por carga de página); el admin necesita ver sus
 * propios cambios de inmediato, sin depender de HMR.
 */
export function AdminCatalogManager() {
  const runtime = getRuntime()
  const slug = runtime.ok ? runtime.value.manifest.client : null
  const currency = runtime.ok ? runtime.value.blueprint.commerce.currency : 'CLP'

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [editing, setEditing] = useState(null) // null | 'new' | <producto>
  const [bulkOpen, setBulkOpen] = useState(false)
  const [error, setError] = useState(null)

  // Carga inicial: inline dentro del efecto (no delega en refresh()), con
  // guarda de cancelación. Llamar a una función externa que hace varios
  // setState desde un efecto es lo que el linter (integración de React
  // Compiler) marca como riesgo de cascada — mismo motivo que en
  // core/app/BootGate.jsx (Bloque 1).
  useEffect(() => {
    if (!slug) return
    let cancelled = false
    listProducts(slug)
      .then((data) => {
        if (cancelled) return
        setProducts(data.products)
        setCategories(data.categories)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  // Recarga tras una mutación: se llama desde manejadores de click, no desde
  // un efecto, así que no aplica la misma restricción.
  async function refresh() {
    try {
      const data = await listProducts(slug)
      setProducts(data.products)
      setCategories(data.categories)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCreate(product) {
    await createProduct(slug, product)
    setEditing(null)
    await refresh()
  }

  async function handleUpdate(product) {
    await updateProduct(slug, editing.id, product)
    setEditing(null)
    await refresh()
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este producto? No se puede deshacer.')) return
    await deleteProduct(slug, id)
    await refresh()
  }

  async function handleMarkOutOfStock(product) {
    await updateProduct(slug, product.id, { ...product, stock: { quantity: 0 } })
    await refresh()
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <h1 className="font-heading text-xl font-medium text-foreground">Catálogo — {slug}</h1>
      <p className="text-xs text-muted-foreground">
        Herramienta de edición local (solo funciona con `npm run dev`, no en producción). Ver
        docs/architecture/DECISIONS.md ADR-0021.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {editing === 'new' && (
        <ProductForm
          categories={categories}
          currency={currency}
          onSubmit={handleCreate}
          onCancel={() => setEditing(null)}
        />
      )}
      {editing && editing !== 'new' && (
        <ProductForm
          initial={editing}
          categories={categories}
          currency={currency}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}
      {!editing && !bulkOpen && (
        <div className="flex gap-2">
          <Button data-testid="admin-add-product" onClick={() => setEditing('new')} className="w-fit">
            Agregar producto
          </Button>
          <Button
            data-testid="admin-bulk-import-open"
            variant="outline"
            onClick={() => setBulkOpen(true)}
            className="w-fit"
          >
            Importar CSV
          </Button>
        </div>
      )}

      {bulkOpen && (
        <BulkImportForm
          categories={categories}
          existingIds={new Set(products.map((p) => p.id))}
          currency={currency}
          onPublishOne={(product) => createProduct(slug, product)}
          onClose={() => {
            setBulkOpen(false)
            refresh()
          }}
        />
      )}

      <ul data-testid="admin-product-list" className="flex flex-col gap-2">
        {products.map((product) => (
          <li
            key={product.id}
            data-testid="admin-product-row"
            data-product-id={product.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatMoney(product.price)} · stock: {product.stock.quantity}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(product)}>
                Editar
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleMarkOutOfStock(product)}>
                Sin stock
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                Eliminar
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default AdminCatalogManager
