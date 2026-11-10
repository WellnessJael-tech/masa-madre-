import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { slugify } from '@/core/lib/slugify.js'

/**
 * Formulario compartido para crear y editar. Sin subida de imágenes real
 * (no hay puerto de storage implementado todavía — ver ports/index.js): el
 * campo de imagen es una URL de texto, consistente con
 * core/catalog/schema.js#productSchema.images.
 */
export function ProductForm({ initial, categories, currency, onSubmit, onCancel }) {
  const isEditing = Boolean(initial)
  const [name, setName] = useState(initial?.name ?? '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? '')
  const [price, setPrice] = useState(initial?.price?.amount ?? '')
  const [stock, setStock] = useState(initial?.stock?.quantity ?? '')
  const [imageUrl, setImageUrl] = useState(initial?.images?.[0]?.src ?? '')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSaving(true)
    const product = {
      id: initial?.id ?? slugify(name),
      name,
      categoryId,
      price: { amount: Number(price), currency },
      stock: { quantity: Number(stock) },
      images: imageUrl ? [{ src: imageUrl, alt: name }] : [],
    }
    try {
      await onSubmit(product)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="product-form"
      className="flex flex-col gap-3 rounded-lg border border-border p-4"
    >
      <input
        data-testid="product-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Nombre"
        required
        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
      />
      <select
        data-testid="product-category"
        value={categoryId}
        onChange={(event) => setCategoryId(event.target.value)}
        required
        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <input
        data-testid="product-price"
        type="number"
        min="0"
        value={price}
        onChange={(event) => setPrice(event.target.value)}
        placeholder={`Precio (${currency})`}
        required
        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
      />
      <input
        data-testid="product-stock"
        type="number"
        min="0"
        value={stock}
        onChange={(event) => setStock(event.target.value)}
        placeholder="Stock"
        required
        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
      />
      <input
        data-testid="product-image"
        value={imageUrl}
        onChange={(event) => setImageUrl(event.target.value)}
        placeholder="URL de imagen (opcional)"
        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" data-testid="product-form-submit" disabled={saving}>
          {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear producto'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}

export default ProductForm
