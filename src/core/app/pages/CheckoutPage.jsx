import { CheckoutView } from '@/core/commerce/checkout/CheckoutView.jsx'

export function CheckoutPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-xl font-medium text-foreground">Checkout</h1>
      <CheckoutView />
    </div>
  )
}

export default CheckoutPage
