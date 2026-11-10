import { useState } from 'react'
import { useParams, Link } from 'react-router'
import { getCatalog } from '@/core/catalog/getCatalog.js'
import { isLowStock } from '@/core/catalog/stockStatus.js'
import { formatMoney } from '@/core/commerce/money.js'
import { useCart } from '@/core/commerce/cart/useCart.js'
import { getRuntime } from '@/core/config/runtime.js'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Página de producto individual. Galería completa (productSchema.images,
 * no solo la primera foto), descripción completa, selector de cantidad, y
 * secciones reservadas para reseñas/relacionados — vacías a propósito
 * (ninguno de los dos módulos existe todavía).
 */
export function ProductDetailPage() {
  const { id } = useParams()
  const { products, categories } = getCatalog()
  const product = products.find((p) => p.id === id)

  const { addItem, quantityOf } = useCart()
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const runtime = getRuntime()
  const lowStockThreshold = runtime.ok ? runtime.value.blueprint.features.stock.lowStockThreshold : 5

  if (!product) {
    return (
      <div className="flex flex-col gap-3" data-testid="product-not-found">
        <h1 className="font-heading text-xl font-medium text-foreground">Producto no encontrado</h1>
        <Button asChild className="w-fit">
          <Link to="/">Ver catálogo</Link>
        </Button>
      </div>
    )
  }

  const categoryName = categories.find((c) => c.id === product.categoryId)?.name
  const outOfStock = product.stock.quantity === 0
  const availableToAdd = product.stock.quantity - quantityOf(product.id)
  const images = product.images

  function handleAdd() {
    addItem(product.id, quantity)
    setQuantity(1)
  }

  return (
    <div className="flex flex-col gap-6" data-testid="product-detail">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Volver al catálogo
      </Link>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            {images[activeImage]?.src && (
              <img
                src={images[activeImage].src}
                alt={images[activeImage].alt}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2" data-testid="product-thumbnails">
              {images.map((image, index) => (
                <button
                  key={`${image.src}-${index}`}
                  type="button"
                  data-testid="product-thumbnail"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Ver imagen ${index + 1} de ${product.name}`}
                  aria-current={index === activeImage}
                  className={cn(
                    'h-16 w-16 overflow-hidden rounded-md border-2',
                    index === activeImage ? 'border-primary' : 'border-transparent'
                  )}
                >
                  <img src={image.src} alt={image.alt} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {categoryName && (
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {categoryName}
            </span>
          )}
          <h1 className="font-heading text-2xl font-medium text-foreground">{product.name}</h1>

          <div className="flex items-baseline gap-2">
            <span className="text-lg font-medium text-foreground">{formatMoney(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatMoney(product.compareAtPrice)}
              </span>
            )}
          </div>

          {product.description && (
            <p data-testid="product-description" className="max-w-prose text-sm text-muted-foreground">
              {product.description}
            </p>
          )}

          {outOfStock ? (
            <span className="text-sm text-destructive" data-testid="stock-message">
              Sin stock
            </span>
          ) : (
            <>
              {isLowStock(product.stock.quantity, lowStockThreshold) && (
                <span className="text-sm text-destructive" data-testid="stock-message">
                  Quedan {product.stock.quantity}
                </span>
              )}
              {availableToAdd > 0 ? (
                <div className="flex items-center gap-3">
                  <QuantityPicker
                    quantity={Math.min(quantity, availableToAdd)}
                    max={availableToAdd}
                    onChange={setQuantity}
                  />
                  <Button data-testid="product-detail-add" onClick={handleAdd}>
                    Agregar al carrito
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Ya tienes el máximo disponible en tu carrito.</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reservado para futuras reseñas — sin módulo todavía (MODULES.md). */}
      <section aria-label="Reseñas" data-testid="reviews-placeholder" className="border-t border-border pt-6">
        <h2 className="font-heading text-lg font-medium text-foreground">Reseñas</h2>
        <p className="text-sm text-muted-foreground">Próximamente.</p>
      </section>

      {/* Reservado para cross-selling — sin módulo todavía (MODULES.md). */}
      <section
        aria-label="Productos relacionados"
        data-testid="related-placeholder"
        className="border-t border-border pt-6"
      >
        <h2 className="font-heading text-lg font-medium text-foreground">También te puede interesar</h2>
        <p className="text-sm text-muted-foreground">Próximamente.</p>
      </section>
    </div>
  )
}

function QuantityPicker({ quantity, max, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm"
        aria-label="Disminuir cantidad"
      >
        −
      </button>
      <span data-testid="product-detail-quantity" className="w-8 text-center text-sm text-foreground">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm disabled:opacity-40"
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  )
}

export default ProductDetailPage
