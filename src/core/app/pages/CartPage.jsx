import { Link } from 'react-router'
import { useCart } from '@/core/commerce/cart/useCart.js'
import { formatMoney } from '@/core/commerce/money.js'
import { getRuntime } from '@/core/config/runtime.js'
import { Button } from '@/components/ui/button'

/**
 * Umbral de envío gratis, solo informativo: no hay ningún adaptador de
 * delivery activo (docs/architecture/DELIVERY.md), así que esto NO calcula
 * envío real — es un mensaje de merchandising leído directamente de
 * delivery.ownDelivery.zones[].freeOver del blueprint. Toma el menor de los
 * configurados, si hay varias zonas.
 */
function lowestFreeShippingThreshold(blueprint) {
  const zones = blueprint?.delivery?.ownDelivery?.zones ?? []
  const thresholds = zones.map((z) => z.freeOver).filter(Boolean)
  if (thresholds.length === 0) return null
  return thresholds.reduce((min, t) => (t.amount < min.amount ? t : min))
}

export function CartPage() {
  const { lines, itemCount, total, setQuantity, removeItem } = useCart()
  const runtime = getRuntime()
  const freeShippingThreshold = runtime.ok
    ? lowestFreeShippingThreshold(runtime.value.blueprint)
    : null

  if (lines.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-xl font-medium text-foreground">Carrito</h1>
        <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
        <Button asChild className="w-fit">
          <Link to="/">Ver catálogo</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-xl font-medium text-foreground">Carrito</h1>

      {freeShippingThreshold && (
        <p data-testid="free-shipping-message" className="text-sm text-muted-foreground">
          {total.amount >= freeShippingThreshold.amount
            ? '¡Tu pedido tiene envío gratis!'
            : `Envío gratis en pedidos sobre ${formatMoney(freeShippingThreshold)}.`}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {lines.map((line) => (
          <li
            key={line.productId}
            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{line.product.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatMoney(line.product.price)} c/u
              </span>
            </div>

            <div className="flex items-center gap-3">
              <QuantityStepper
                quantity={line.quantity}
                max={line.product.stock.quantity}
                onChange={(q) => setQuantity(line.productId, q)}
              />
              <span className="w-20 text-right text-sm font-medium text-foreground">
                {formatMoney(line.subtotal)}
              </span>
              <button
                type="button"
                onClick={() => removeItem(line.productId)}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Quitar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="font-medium text-foreground">Total ({itemCount})</span>
        <span data-testid="cart-total" className="font-medium text-foreground">
          {formatMoney(total)}
        </span>
      </div>

      <Button asChild className="w-fit self-end">
        <Link to="/checkout">Ir a pagar</Link>
      </Button>
    </div>
  )
}

function QuantityStepper({ quantity, max, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-sm"
        aria-label="Disminuir cantidad"
      >
        −
      </button>
      <span className="w-6 text-center text-sm text-foreground">{quantity}</span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= max}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-sm disabled:opacity-40"
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  )
}

export default CartPage
