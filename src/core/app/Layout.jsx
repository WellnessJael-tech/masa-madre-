import { NavLink, Link, Outlet } from 'react-router'
import { Slot } from '@/core/slots'
import { cn } from '@/lib/utils'
import { useCart } from '@/core/commerce/cart/useCart.js'
import { getRuntime } from '@/core/config/runtime.js'

/**
 * Layout del storefront: header, contenido, footer.
 *
 * Mobile-first y sin identidad visual propia — todo sale de tokens del theme
 * (CLAUDE.md). La navegación es provisional: se derivará del blueprint y del
 * catálogo cuando existan (Bloque 3).
 */
export function Layout() {
  const runtime = getRuntime()
  const identity = runtime.ok ? runtime.value.blueprint.identity : null
  const contact = identity?.contact ?? {}
  const isHealth = identity?.industry === 'health'

  return (
    <div className="flex min-h-svh flex-col">
      {/* Accesibilidad: primer elemento focalizable, visible solo al tabular. */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>

      <Slot name="layout.header.top" />

      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-page items-center gap-4 px-4 py-3">
          <NavLink
            to="/"
            className="font-heading text-base font-medium text-foreground"
          >
            {identity?.tradeName ?? 'Tienda'}
          </NavLink>

          <nav aria-label="Principal" className="ml-auto flex items-center gap-1">
            <NavItem to="/">Inicio</NavItem>
            <CartNavItem />
          </nav>

          <Slot name="layout.header.actions" />
        </div>
      </header>

      <main id="contenido" className="mx-auto w-full max-w-page flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-page flex-col gap-4 px-4 py-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">
                {identity?.tradeName ?? 'Tienda'}
              </p>
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {contact.email}
                </a>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {contact.phone}
                </a>
              )}
            </div>

            <nav aria-label="Legal" className="flex flex-col gap-1">
              <Link
                to="/legal/terminos"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Términos y condiciones
              </Link>
              <Link
                to="/legal/privacidad"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Política de privacidad
              </Link>
              <Link
                to="/legal/devoluciones"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Política de devoluciones
              </Link>
            </nav>

            <SocialLinks socials={contact.socials} />
          </div>

          {isHealth && (
            <p
              data-testid="health-disclaimer"
              className="max-w-prose text-xs text-muted-foreground"
            >
              Este sitio es de carácter informativo y no reemplaza una consulta médica
              profesional. Ante cualquier duda de salud, consulta a un profesional certificado.
            </p>
          )}

          <Slot name="layout.footer.extra" />
        </div>
      </footer>

      <Slot name="global.floating" />
    </div>
  )
}

/**
 * Íconos de redes sociales a partir de identity.contact.socials (blueprint,
 * campo abierto — docs/client-blueprints/BLUEPRINT-FORMAT.md). Sin
 * dependencia de íconos (lucide-react no está instalado, D-09): SVG en
 * línea para las plataformas más comunes; cualquier otra clave se muestra
 * como link de texto.
 */
function SocialLinks({ socials }) {
  if (!socials || Object.keys(socials).length === 0) return null

  const ICONS = { instagram: InstagramIcon, facebook: FacebookIcon, tiktok: TikTokIcon, x: XIcon }

  return (
    <div data-testid="social-links" className="flex items-center gap-3">
      {Object.entries(socials).map(([key, url]) => {
        const Icon = ICONS[key]
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={key}
            data-testid={`social-link-${key}`}
            className="text-muted-foreground hover:text-foreground"
          >
            {Icon ? <Icon className="h-5 w-5" /> : <span className="text-xs capitalize">{key}</span>}
          </a>
        )
      })}
    </div>
  )
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 21v-7.5H16l.4-3H13.5V8.2c0-.87.24-1.46 1.5-1.46H16.5V4.14A20 20 0 0 0 14.1 4C11.8 4 10.2 5.4 10.2 8v2.5H7.7v3h2.5V21h3.3Z" />
    </svg>
  )
}

function TikTokIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M14 3h2.2a5 5 0 0 0 3.8 4v2.3a7.3 7.3 0 0 1-3.8-1.1v6.4a5.6 5.6 0 1 1-4.8-5.5v2.4a3.2 3.2 0 1 0 2.6 3.1V3Z" />
    </svg>
  )
}

function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M4 4l7.2 8.6L4.4 20h2.3l5.9-6.4L17.5 20H20l-7.6-9.1L19.6 4h-2.3l-5.4 5.9L6.5 4H4Z" />
    </svg>
  )
}

function CartNavItem() {
  const { itemCount } = useCart()
  return (
    <NavItem to="/carrito">
      Carrito
      {itemCount > 0 && (
        <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
          {itemCount}
        </span>
      )}
    </NavItem>
  )
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'rounded-md px-3 py-2 text-sm transition-colors',
          isActive
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )
      }
    >
      {children}
    </NavLink>
  )
}

export default Layout
