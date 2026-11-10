import { useEffect, useState } from 'react'
import { useCart } from '../cart/useCart.js'
import { formatMoney } from '../money.js'
import { getRuntime } from '@/core/config/runtime.js'
import { buildWhatsAppLink } from '@/core/lib/whatsappLink.js'
import { Button } from '@/components/ui/button'

/**
 * Fuera del componente a propósito: el linter (integración de React
 * Compiler, regla react-hooks/purity) marca Date.now() como impuro si el
 * cuerpo del componente lo llama directamente, aunque sea dentro de un
 * manejador de evento — no analiza si la función que lo envuelve solo se
 * invoca desde un click. Mismo motivo que ya movió boot() fuera de
 * BootGate.jsx (Bloque 1) y el fetch inicial fuera de un useEffect en
 * AdminCatalogManager.jsx (Bloque 5).
 */
function generateOrderId() {
  return `demo-${Date.now()}`
}

/**
 * Resumen del pedido + entrega + datos de contacto + confirmación.
 *
 * NO consulta el modo (demo/producción) directamente: pregunta si el
 * adaptador de pago resuelto es simulado (`isMock`). Es la misma pregunta
 * que ya resuelve el guardarraíl de core/config/mode.js — un adaptador mock
 * nunca llega resuelto a un build de producción. Si en el futuro un
 * adaptador real reemplaza al mock, esta UI no cambia (ADR-0016).
 *
 * Selección de entrega (Bloque 7): consulta TODOS los adaptadores de
 * delivery resueltos (pickup, own-delivery — ninguno es mock, son cómputo
 * local real, ver DELIVERY.md §4) y funde sus opciones, igual que describe
 * DELIVERY.md §3. Selecciona la primera automáticamente (normalmente
 * retiro, gratis) para no romper el flujo de un solo click si el comprador
 * no necesita elegir. Sin selección de dirección/mapa: "básico" a propósito.
 *
 * Datos de contacto: nombre/teléfono/email, SOLO en estado local — no hay
 * backend que los persista (PROP-0006).
 */
export function CheckoutView() {
  const { lines, itemCount, total, clear } = useCart()
  const [state, setState] = useState('idle') // idle | processing | confirmed | failed
  const [error, setError] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [contact, setContact] = useState({ name: '', phone: '', email: '' })
  const [deliveryOptions, setDeliveryOptions] = useState([])
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null)

  const runtime = getRuntime()
  const resolvedPayment = runtime.ok ? runtime.value.adapters.payment : undefined
  const paymentAdapter = Array.isArray(resolvedPayment) ? resolvedPayment[0] : resolvedPayment
  const storePhone = runtime.ok ? runtime.value.blueprint.identity.contact?.phone : null

  const resolvedDelivery = runtime.ok ? runtime.value.adapters.delivery : undefined
  const deliveryAdapters = Array.isArray(resolvedDelivery)
    ? resolvedDelivery
    : resolvedDelivery
      ? [resolvedDelivery]
      : []

  // Carga las opciones de entrega inline en el efecto (no delega en una
  // función externa con varios setState) — mismo motivo de purity que
  // AdminCatalogManager.jsx.
  useEffect(() => {
    if (!runtime.ok || deliveryAdapters.length === 0) return
    let cancelled = false
    Promise.all(
      deliveryAdapters.map((adapter) => adapter.quote({ blueprint: runtime.value.blueprint, cartTotal: total }))
    ).then((results) => {
      if (cancelled) return
      const options = results.flat()
      setDeliveryOptions(options)
      setSelectedDeliveryId((current) => current ?? options[0]?.id ?? null)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliveryAdapters se recalcula cada render desde runtime (estable)
  }, [runtime.ok, total.amount])

  const selectedOption = deliveryOptions.find((o) => o.id === selectedDeliveryId)
  const deliveryFee = selectedOption?.fee ?? { amount: 0, currency: total.currency }
  const totalToCharge = { amount: total.amount + deliveryFee.amount, currency: total.currency }

  const contactComplete = contact.name.trim() !== '' && contact.phone.trim() !== ''
  const deliveryResolved = deliveryOptions.length === 0 || Boolean(selectedDeliveryId)
  const canConfirm = Boolean(paymentAdapter) && contactComplete && deliveryResolved

  async function handleConfirm() {
    if (!canConfirm) return
    setState('processing')
    setError(null)
    try {
      const id = generateOrderId()
      const result = await paymentAdapter.init({ orderId: id, amount: totalToCharge })
      if (result.state === 'paid') {
        setOrderId(id)
        setState('confirmed')
        clear()
      } else {
        setState('failed')
        setError('El pago no pudo confirmarse.')
      }
    } catch (e) {
      setState('failed')
      setError(e.message)
    }
  }

  if (state === 'confirmed') {
    const whatsappHref = storePhone
      ? buildWhatsAppLink(
          storePhone,
          `Hola, soy ${contact.name}. Confirmo mi pedido #${orderId} por ${formatMoney(totalToCharge)}. ` +
            `Mi teléfono de contacto es ${contact.phone}.`
        )
      : null

    return (
      <div
        data-testid="order-confirmed"
        className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
      >
        {paymentAdapter?.isMock && (
          <span className="w-fit rounded-full bg-demo-banner px-2 py-0.5 text-xs font-medium text-demo-banner-foreground">
            PEDIDO DE DEMOSTRACIÓN
          </span>
        )}
        <h2 className="font-heading text-lg font-medium text-foreground">¡Pedido confirmado!</h2>
        <p className="text-sm text-muted-foreground">
          {paymentAdapter?.isMock
            ? `Este es un pedido simulado (#${orderId}). No se realizó ningún cobro real.`
            : `Pedido #${orderId} confirmado.`}
        </p>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="checkout-whatsapp-link"
            className="w-fit text-sm text-primary underline-offset-4 hover:underline"
          >
            Contactar por WhatsApp sobre este pedido
          </a>
        )}
      </div>
    )
  }

  if (lines.length === 0) {
    return <p className="text-sm text-muted-foreground">El carrito está vacío.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {lines.map((line) => (
          <li key={line.productId} className="flex justify-between text-sm">
            <span>
              {line.product.name} × {line.quantity}
            </span>
            <span>{formatMoney(line.subtotal)}</span>
          </li>
        ))}
      </ul>

      {deliveryOptions.length > 0 && (
        <fieldset className="flex flex-col gap-2 rounded-lg border border-border p-3" data-testid="delivery-options">
          <legend className="px-1 text-sm font-medium text-foreground">Entrega</legend>
          {deliveryOptions.map((option) => (
            <label key={option.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="delivery"
                  data-testid={`delivery-option-${option.id}`}
                  checked={selectedDeliveryId === option.id}
                  onChange={() => setSelectedDeliveryId(option.id)}
                />
                {option.label}
              </span>
              <span>{option.fee.amount === 0 ? 'Gratis' : formatMoney(option.fee)}</span>
            </label>
          ))}
        </fieldset>
      )}

      <div className="flex justify-between border-t border-border pt-2 font-medium text-foreground">
        <span>
          Total ({itemCount} artículo{itemCount === 1 ? '' : 's'})
        </span>
        <span data-testid="checkout-total">{formatMoney(totalToCharge)}</span>
      </div>

      <ContactFields value={contact} onChange={setContact} />

      {!paymentAdapter && (
        <p className="text-sm text-destructive">
          No hay ningún método de pago configurado para esta tienda.
        </p>
      )}
      {paymentAdapter?.isMock && (
        <p className="text-xs text-muted-foreground">
          Pago simulado — no se procesará ningún cobro real.
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        data-testid="confirm-order"
        onClick={handleConfirm}
        disabled={!canConfirm || state === 'processing'}
      >
        {state === 'processing' ? 'Procesando…' : 'Confirmar pedido'}
      </Button>
    </div>
  )
}

/**
 * Nombre y teléfono obligatorios (se usan para el enlace de WhatsApp del
 * pedido); email opcional. Sin persistencia — se pierde al recargar.
 */
function ContactFields({ value, onChange }) {
  function set(field) {
    return (event) => onChange({ ...value, [field]: event.target.value })
  }

  return (
    <fieldset className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <legend className="px-1 text-sm font-medium text-foreground">Datos de contacto</legend>
      <input
        data-testid="checkout-contact-name"
        value={value.name}
        onChange={set('name')}
        placeholder="Nombre"
        required
        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
      />
      <input
        data-testid="checkout-contact-phone"
        value={value.phone}
        onChange={set('phone')}
        placeholder="Teléfono"
        required
        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
      />
      <input
        data-testid="checkout-contact-email"
        type="email"
        value={value.email}
        onChange={set('email')}
        placeholder="Email (opcional)"
        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
      />
    </fieldset>
  )
}

export default CheckoutView
