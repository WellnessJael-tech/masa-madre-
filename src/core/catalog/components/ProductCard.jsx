import { Link } from 'react-router'
import { formatMoney } from '@/core/commerce/money.js'
import { useCart } from '@/core/commerce/cart/useCart.js'
import { getRuntime } from '@/core/config/runtime.js'
import { isLowStock } from '@/core/catalog/stockStatus.js'
import { Button } from '@/components/ui/button'

export function ProductCard({ product, categoryName }) {
  const { addItem, quantityOf } = useCart()
  const [image] = product.images
  const outOfStock = product.stock.quantity === 0
  const atMax = quantityOf(product.id) >= product.stock.quantity

  const runtime = getRuntime()
  const lowStockThreshold = runtime.ok ? runtime.value.blueprint.features.stock.lowStockThreshold : 5
  const lowStock = isLowStock(product.stock.quantity, lowStockThreshold)

  return (
    <article
      data-testid="product-card"
      data-product-id={product.id}
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3"
    >
      <Link to={`/producto/${product.id}`} className="flex flex-col gap-2">
        <div className="aspect-square overflow-hidden rounded-md bg-muted">
          {image && (
            <img src={image.src} alt={image.alt} className="h-full w-full object-cover" />
          )}
        </div>

        {categoryName && (
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {categoryName}
          </span>
        )}

        <h3 className="font-heading text-sm font-medium text-foreground">{product.name}</h3>
      </Link>

      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium text-foreground">{formatMoney(product.price)}</span>
        {product.compareAtPrice && (
          <span className="text-xs text-muted-foreground line-through">
            {formatMoney(product.compareAtPrice)}
          </span>
        )}
      </div>

      {outOfStock ? (
        <span className="text-xs text-destructive">Sin stock</span>
      ) : (
        <>
          {lowStock && (
            <span data-testid="stock-message" className="text-xs text-destructive">
              Quedan {product.stock.quantity}
            </span>
          )}
          <Button data-testid="add-to-cart" size="sm" onClick={() => addItem(product.id)} disabled={atMax}>
            {atMax ? 'Máximo agregado' : 'Agregar'}
          </Button>
        </>
      )}
    </article>
  )
}

export default ProductCard
