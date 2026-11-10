import { BrowserRouter, Route, Routes } from 'react-router'
import { BootGate } from './BootGate.jsx'
import { ErrorBoundary } from './ErrorBoundary.jsx'
import { Layout } from './Layout.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { ProductDetailPage } from './pages/ProductDetailPage.jsx'
import { CartPage } from './pages/CartPage.jsx'
import { CheckoutPage } from './pages/CheckoutPage.jsx'
import { LegalPage } from './pages/LegalPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { CartProvider } from '@/core/commerce/cart/CartProvider.jsx'
import { getRegisteredRoutes } from '@/core/routes'

/**
 * Shell del core.
 *
 * Routing declarativo (ADR-0013). Las rutas se declaran en JSX en vez de con
 * un router de datos: los módulos podrán aportar rutas sin que el shell tenga
 * que conocer una estructura de archivos.
 *
 * <BootGate> ejecuta la secuencia de arranque (blueprint → modo → adaptadores
 * → módulos) y solo monta el árbol si toda la configuración es válida.
 * <CartProvider> va DENTRO de BootGate (necesita el catálogo ya resuelto) y
 * FUERA del router (el carrito sobrevive a la navegación entre páginas).
 *
 * El theme del cliente se resuelve en main.jsx (applyTheme), antes de montar
 * este árbol — no aquí.
 *
 * Las rutas de módulos (getRegisteredRoutes, poblado por loadActiveModules()
 * en main.jsx antes de montar) se renderizan como HERMANAS de <Layout/>, no
 * anidadas dentro — así no heredan el header/footer/carrito del storefront.
 * Un módulo que sí quiera esa apariencia puede componerla él mismo. Cierra
 * el pendiente citado aquí desde el Bloque 3 (ver ADR-0021).
 *
 * PENDIENTE de bloques posteriores:
 *  - themeOverrides puntuales del blueprint (ajustes finos sin theme propio).
 *  - Checkout multi-paso con selección de delivery (hoy: pago directo).
 */
export function AppShell() {
  return (
    <ErrorBoundary>
      <BootGate>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {getRegisteredRoutes().map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="producto/:id" element={<ProductDetailPage />} />
                <Route path="carrito" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="legal/:slug" element={<LegalPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </BootGate>
    </ErrorBoundary>
  )
}

export default AppShell
