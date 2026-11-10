# Blueprint Manual — Masa Madre

> Todos los campos que existen **hoy**, tal como los valida `src/core/config/blueprint/schema.js`.
> No hay campos inventados aquí — si algo no aparece en esta lista, no existe todavía (proponerlo
> es una extensión, ver `DESIGN-TO-CODE.md`). Ejemplos reales completos en
> `clients/demo/blueprint.yaml` y `clients/demo-medical/blueprint.yaml`.

---

## Metadatos (obligatorios en todo blueprint)

| Campo | Tipo | Propósito | Ejemplo | Consumidor |
|---|---|---|---|---|
| `schemaVersion` | número | Versión del contrato que el core entiende | `1` | Validador de blueprint |
| `blueprintVersion` | string `x.y.z` | Versión de este blueprint | `"0.1.0"` | Manifiesto de build |
| `core` | string (rango semver) | Qué versión de core acepta este cliente | `"^0.1"` | Chequeo de compatibilidad en el arranque |
| `slug` | string (minúsculas, guiones) | Identificador único, debe coincidir con la carpeta | `demo` | `VITE_CLIENT`, adaptador de contenido |
| `status` | enum `draft \| staging \| live \| archived` | Estado de publicación | `draft` | SEO (`robots`), guardarraíl de producción |

---

## `identity` — quién es el cliente

| Campo | Tipo | Obligatorio | Propósito | Consumidor visual |
|---|---|---|---|---|
| `tradeName` | string | **sí** | Nombre comercial a mostrar | Header, footer, `<title>` de la pestaña, home |
| `legalName` | string | no | Razón social | (sin consumidor visual todavía) |
| `taxId` | string | no | RUT/identificación fiscal | — |
| `tagline` | string | no | Frase corta de marca | Home (subtítulo) |
| `description` | string | no | Descripción del negocio | Home (si no hay tagline) |
| `industry` | string libre | no | Rubro. Sin enum cerrado — hoy solo `"health"` tiene efecto especial | Footer (disclaimer de salud si es `"health"`) |
| `valueProposition` | string | no | Por qué elegirte | Disponible para un futuro Hero |
| `tone` | string libre | no | Tono de comunicación (documental, sin efecto en código) | — |
| `locales` | array de string | no (default `["es"]`) | Idiomas | — |
| `defaultLocale` | string | no (default `"es"`) | Idioma principal | `<html lang>` (pendiente de cablear, ver auditoría) |
| `countries` | array de string | no | Países donde opera | — |
| `audience` | objeto libre | no | Notas de público objetivo (sin validar campos internos) | — |
| `contact.email` | string | no | Email de contacto | Footer (`mailto:`) |
| `contact.phone` | string | no | Teléfono de contacto | Footer (`tel:`), enlace de WhatsApp en confirmación de pedido |
| `contact.socials` | objeto abierto `{plataforma: url}` | no | Redes sociales | Footer (íconos) |

---

## `design` — theme y comportamiento visual global

| Campo | Tipo | Obligatorio | Propósito | Ejemplo |
|---|---|---|---|---|
| `theme` | string (slug) | **sí** | Qué carpeta de `src/themes/` usar | `demo-medical` |
| `themeOverrides` | mapa `{token: valor}` | no | Ajustes puntuales de tokens sin crear un theme nuevo | **Declarado en el esquema, sin consumidor todavía** (ver auditoría de pendientes) |
| `animations` | enum `none \| subtle \| expressive` | no (default `subtle`) | Intensidad de animación deseada | Sin consumidor de código todavía — es una intención para el diseño |
| `respectReducedMotion` | boolean | no (default `true`) | Si debe respetarse `prefers-reduced-motion` | Ya aplicado globalmente en `index.css`, no por cliente |

---

## `content` — de dónde vienen productos y categorías

| Campo | Tipo | Propósito |
|---|---|---|
| `adapter` | string (default `"filesystem"`) | Único adaptador que existe hoy: lee `clients/<slug>/content/` |

**Los archivos de contenido en sí** (no son parte del YAML del blueprint, son archivos aparte):

- `clients/<slug>/content/categories.yaml` — lista de categorías: `[{id, name}]`.
- `clients/<slug>/content/products/*.yaml` — un archivo por producto:

| Campo del producto | Tipo | Obligatorio | Propósito |
|---|---|---|---|
| `id` | string (slug) | sí | Identificador único, también nombre del archivo |
| `name` | string | sí | Nombre a mostrar |
| `description` | string | no | Descripción completa (se muestra en `ProductDetail`) |
| `categoryId` | string | sí | Debe existir en `categories.yaml` |
| `price` | `{amount, currency}` | sí | Precio actual |
| `compareAtPrice` | `{amount, currency}` | no | Precio tachado, si hay descuento |
| `images` | array de `{src, alt}` | no (default `[]`) | Imágenes — **URLs**, no hay subida de archivo real |
| `stock.quantity` | número entero | no (default `0`) | Unidades disponibles |

---

## `modules` — qué funcionalidad opcional está activa

Mapa `{ moduleId: { enabled: boolean, config: {...} } }`. Los módulos que existen hoy y su config:

| Módulo | `config` | Ejemplo |
|---|---|---|
| `whatsapp` | `phone` (string, requerido), `defaultMessage` (string) | `{ phone: "+56912345678", defaultMessage: "Hola…" }` |
| `admin-content` | `announcement` (string, default vacío) | `{ announcement: "Envío gratis sobre $30.000" }` |
| `admin-catalog` | `password` (string, mín. 4 caracteres), `basePath` (string, default `/admin`) | `{ password: "panmasamadre" }` |

`admin-catalog` **requiere** `admin-content` activo (si no, el arranque falla con un mensaje
explícito). Ver `docs/modules/MODULES.md` para el catálogo completo de módulos documentados
(muchos siguen sin construir — ver `docs/architecture/DECISIONS.md`, auditoría de pendientes).

---

## `features` — comportamiento configurable del core

| Campo | Tipo | Default | Propósito | Consumidor |
|---|---|---|---|---|
| `search.enabled` | boolean | `true` | Muestra u oculta el buscador | `CatalogView` |
| `search.minChars` | número entero | `2` | Caracteres mínimos antes de filtrar | `CatalogView` |
| `filters.facets` | array de string | `[]` | **Sin consumidor todavía** | — |
| `filters.defaultSort` | string | `"relevance"` | **Sin consumidor todavía** | — |
| `stock.show` | boolean | `true` | **Sin consumidor todavía** (el stock siempre se muestra) | — |
| `stock.allowBackorder` | boolean | `false` | **Sin consumidor todavía** — hoy sin stock siempre bloquea la compra | — |
| `stock.lowStockThreshold` | número entero | `5` | Umbral de "Quedan N" | `ProductCard`, `ProductDetailPage` |
| `checkout.guestCheckout` | boolean | `true` | **Sin consumidor todavía** — no hay login, todo es guest siempre | — |
| `checkout.steps` | array de string | `["contact","delivery","payment","review"]` | **Sin consumidor todavía** — el checkout es un solo paso | — |

---

## `commerce` — moneda y precio

| Campo | Tipo | Obligatorio | Propósito |
|---|---|---|---|
| `currency` | string (3 letras mayúsculas) | **sí** | Moneda de toda la tienda, ej. `CLP` |
| `minOrder` | `{amount, currency}` | no | **Sin consumidor todavía** |
| `priceDisplay.taxIncluded` | boolean | no (default `true`) | **Sin consumidor todavía** — el precio se muestra tal cual, sin cálculo de impuesto |
| `priceDisplay.showStrikethrough` | boolean | no (default `true`) | **Sin consumidor todavía** — el tachado de `compareAtPrice` siempre se muestra si existe |

---

## `branches` — sucursales

Array de objetos:

| Campo | Tipo | Obligatorio | Propósito |
|---|---|---|---|
| `id` | string (slug) | sí | Identificador único |
| `name` | string | sí | Nombre a mostrar (ej. "Retiro en {name}") |
| `address` | string | no | Dirección (texto libre, sin geocodificación) |
| `pickup` | boolean | no (default `false`) | Si esta sucursal ofrece retiro |
| `hours` | mapa `{día: horario}` | no | Horarios (texto libre, sin estructura fija) |

**Consumidor:** el adaptador `delivery/pickup` genera una opción de entrega gratis por cada
sucursal con `pickup: true`.

---

## `delivery` — entrega

| Campo | Tipo | Obligatorio | Propósito |
|---|---|---|---|
| `adapters` | array de string | no (default `[]`) | Qué adaptadores de entrega están activos: `pickup`, `own-delivery` (los dos que existen hoy) |
| `optionOrder` | enum `price \| eta \| manual` | no (default `price`) | **Sin consumidor todavía** — el orden real es el de `adapters` |
| `quoteTimeoutMs` | número | no (default `5000`) | **Sin consumidor todavía** — la cotización es local e instantánea |
| `ownDelivery.coverage` | enum | no (default `zone-list`) | Documentado, solo `zone-list` implementado |
| `ownDelivery.zones[].id` | string | sí (dentro de zona) | Identificador de la zona |
| `ownDelivery.zones[].label` | string | sí | Texto a mostrar en el selector de entrega |
| `ownDelivery.zones[].fee` | `{amount, currency}` | sí | Tarifa de esa zona |
| `ownDelivery.zones[].freeOver` | `{amount, currency}` | no | Umbral de envío gratis para esa zona |
| `ownDelivery.zones[].minOrder` | `{amount, currency}` | no | **Sin consumidor todavía** |
| `ownDelivery.zones[].eta` | `{type, minMinutes, maxMinutes}` | no | `maxMinutes` se muestra como tiempo estimado si existe |
| `pickup.branches` | array de string | no | **Sin consumidor todavía** — el adaptador `pickup` usa `branches[].pickup` directamente, no esta lista |
| `pickup.preparationMinutes` | número | no (default `20`) | Tiempo estimado mostrado en la opción de retiro |

---

## `payments` — pago

| Campo | Tipo | Propósito |
|---|---|---|
| `adapters` | array de string | Hoy solo existe `mock` (simulado, **nunca** se resuelve en un build de producción) |
| `releaseOn` | enum `paid \| submitted` | **Sin consumidor todavía** |
| `orderStates` | mapa | **Sin consumidor todavía** |

---

## `analytics` — métricas

| Campo | Tipo | Propósito |
|---|---|---|
| `adapter` | string (default `""`) | Ningún adaptador de analítica existe todavía — default vacío = sin rastreo |
| `track` | array de string | **Sin consumidor todavía** |
| `consent.required` / `consent.mode` | boolean / enum | **Sin consumidor todavía** |

---

## `commercial` — alcance contratado (no afecta al storefront)

| Campo | Tipo | Obligatorio | Propósito |
|---|---|---|---|
| `tier` | enum `managed \| ownership` | **sí** | Nivel de autonomía del cliente — hoy documental, sin sistema de permisos implementado |
| `addOns` | array de string | no | **Sin consumidor todavía** |
| `contentManagedBy` | enum `us \| client` | no (default `us`) | **Sin consumidor todavía** |
| `acceptanceCriteria` | array de string | no | Documental, para checklist humano |

---

## Campos que el diseño NO debe asumir que existen

Estos aparecieron como necesarios en `docs/design/COMPONENTS.md` pero **no están en el esquema
hoy** — proponerlos requiere extender `schema.js` primero (ver `DESIGN-TO-CODE.md`):

- Imagen de portada / hero.
- Producto "destacado".
- Reseñas de producto.
- Productos relacionados / cross-selling.
- Cualquier campo de tarjeta de pago (nunca se agregará al blueprint — es un dato que jamás debe
  pasar por el frontend, ver `docs/architecture/PAYMENTS.md`).
