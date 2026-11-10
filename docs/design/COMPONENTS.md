# Component Specifications — Masa Madre

> Léelo junto a `DESIGN-CONTRACT.md` (qué puede tocar cada capa) y `SYSTEM-OVERVIEW.md` (el mapa
> general). Cada componente real vive en `src/core/...` — las rutas de archivo se dan para que
> sepas dónde está el código, no para que lo estudies antes de proponer un diseño.
>
> **`ProductCard` es la referencia de profundidad.** El resto de los componentes se documentan con
> el mismo criterio, resumido donde el componente es más simple o no existe todavía.

---

## ProductCard

**Archivo:** `src/core/catalog/components/ProductCard.jsx`

**Propósito.** Representar un producto dentro de una grilla (o cualquier colección visual).

**Props que recibe:**
| Prop | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `product` | objeto Product (ver `BLUEPRINT-MANUAL.md` §Content) | sí | `{id, name, description, categoryId, price, compareAtPrice?, images[], stock: {quantity}}` |
| `categoryName` | string | no | Nombre de la categoría a mostrar como badge; si no se pasa, el badge no se muestra |

**De dónde saca el resto de sus datos:** llama internamente a `useCart()` (cantidad ya en el
carrito, para saber si llegó al máximo) y a `getRuntime()` (umbral de stock bajo del cliente,
`features.stock.lowStockThreshold`). Esto es intencional — la card no depende de que su padre le
pase esos datos.

**Estados posibles (mutuamente excluyentes en la zona inferior de la card):**
1. **Disponible, stock normal** — botón "Agregar" habilitado.
2. **Stock bajo** (`0 < stock.quantity ≤ lowStockThreshold`) — texto "Quedan N" **además** del
   botón "Agregar" (no lo reemplaza).
3. **Sin stock** (`stock.quantity === 0`) — texto "Sin stock", **sin** botón de agregar en absoluto
   (no un botón deshabilitado sin explicación).
4. **Ya al máximo en el carrito** (`quantityOf(product.id) >= stock.quantity`, con stock > 0) —
   botón presente pero deshabilitado, con texto "Máximo agregado".

**Variantes de contenido (no de layout):**
- Con imagen / sin imagen (`images[0]` puede no existir — debe degradar con un placeholder, hoy es
  un `<div>` de fondo `bg-muted` vacío).
- Con descuento (`compareAtPrice` presente) → precio tachado junto al precio actual.
- Con o sin badge de categoría (según si se pasó `categoryName`).

**Acciones disponibles:**
- Click en imagen o nombre → navega a `/producto/:id` (el detalle completo, ver `ProductDetail`).
- Click en "Agregar" → agrega 1 unidad al carrito. **Este click no debe disparar también la
  navegación al detalle** — son dos áreas clicables distintas dentro de la misma card.

**Información obligatoria (no puede faltar en ningún rediseño):** nombre, precio, estado de stock
(algún indicador de disponible/bajo/agotado). **Información opcional:** imagen, categoría, precio
comparado.

**Comportamiento responsive.** Hoy vive dentro de `ProductGrid`, que define 2 columnas en móvil, 3
en tablet, 4 en escritorio (ver `ProductGrid`). La card en sí no fija su propio ancho — se adapta
al contenedor. Cualquier rediseño debe seguir funcionando en una columna angosta (mobile-first).

**Restricciones (no negociables):**
- El estado de stock debe seguir siendo visible sin importar la composición elegida.
- El precio debe usar `formatMoney()` (ver `THEME-MANUAL.md` — no es un token visual, es una
  función de `core/commerce/money.js` que aplica el formato de moneda correcto).

**Libertad visual (todo lo demás):** proporción de imagen, densidad, borde vs. sombra vs. plano,
posición relativa de precio/nombre/categoría, tipografía, si el botón es de texto o ícono.

**Relación con BLUEPRINT:** `features.stock.lowStockThreshold` (umbral de "Quedan N"),
`commerce.currency` (vía `formatMoney`).

**Relación con THEME:** usa exclusivamente utilidades semánticas (`bg-card`, `text-foreground`,
`text-destructive`, `text-muted-foreground`, `bg-primary`) — ningún color literal. Cambiar el
theme cambia la card sin tocar su código.

**Ejemplos reales para inspeccionar visualmente:** `clients/demo/content/products/` (4 productos:
uno agotado — `focaccia-romero`, uno con descuento — `pan-integral-centeno`, uno en el umbral de
stock bajo por defecto — también `pan-integral-centeno`, con `stock: 5`).

**Tests relevantes:** `e2e/product-detail.spec.js` (navegación a detalle, stock bajo),
`e2e/checkout-flow.spec.js` (agregar al carrito, producto sin stock no ofrece botón).

---

## ProductGrid

**Archivo:** `src/core/catalog/components/ProductGrid.jsx`

**Propósito.** Layout de una colección de `ProductCard`.

**Props:** `products` (array de Product ya filtrado), `categoriesById` (`Map` id→categoría, para
resolver el nombre de cada card).

**Estados:** con productos (grilla) / lista vacía tras un filtro válido → mensaje "No hay productos
para mostrar" (nunca un espacio en blanco silencioso, ver `DESIGN-RULES.md`).

**Responsive:** hoy fijo en CSS grid, 2/3/4 columnas por breakpoint (`sm`/`lg`). Es la parte más
abierta a rediseño — podría ser un carrusel horizontal, una lista, una grilla asimétrica, sin
cambiar ni sus props ni su comportamiento.

**Relación con BLUEPRINT/THEME:** ninguna directa — es un contenedor de layout puro, delega los
tokens a `ProductCard`.

**Tests relevantes:** los mismos de `ProductCard` (se ejercita siempre en conjunto).

---

## Header / Navigation

**Archivo:** `src/core/app/Layout.jsx` (el header vive dentro del layout raíz, no es un archivo
separado).

**Propósito.** Identidad de marca + navegación a inicio/carrito + puntos de extensión para módulos.

**De dónde saca sus datos:** `getRuntime().value.blueprint.identity.tradeName` (nombre a mostrar,
**nunca** un texto fijo — corregido explícitamente en ADR-0023 tras encontrarlo hardcodeado),
`useCart().itemCount` (contador del carrito).

**Slots que declara** (puntos donde un módulo puede insertar contenido, ver `DESIGN-CONTRACT.md
§4`): `layout.header.top` (arriba de todo el header — hoy lo usa el anuncio de `admin-content`),
`layout.header.actions` (dentro del header, al final).

**Estados:** carrito vacío (sin contador) / con ítems (contador visible); con o sin anuncio en
`layout.header.top`; con o sin acciones extra de módulos.

**Acciones:** ir a inicio, ir al carrito.

**Restricciones:** el link "Saltar al contenido" (accesibilidad, oculto salvo con teclado) debe
seguir siendo el primer elemento focalizable de la página, sin importar el rediseño. El contador
del carrito es información de estado — debe seguir siendo visible en cualquier composición.

**Libertad visual:** logo vs. texto, navegación horizontal vs. hamburguesa, header fijo o no,
densidad.

**Relación con BLUEPRINT:** `identity.tradeName`. **Relación con THEME:** `border-border`,
`text-foreground`, `bg-primary` (badge del contador).

**Tests relevantes:** `e2e/search-delivery.spec.js` (anuncio en `layout.header.top`).

---

## Hero

**Estado real: no existe.** La home hoy solo tiene un `<h1>` con `identity.tradeName` y un párrafo
opcional con `identity.tagline`/`description` (`src/core/app/pages/HomePage.jsx`). No hay imagen de
portada, ni campo de blueprint para una — proponer un hero visual es agregar un componente nuevo
sobre datos que ya existen (tradeName, tagline, description); una **imagen** de portada requeriría
extender el BLUEPRINT primero (ver `DESIGN-TO-CODE.md`).

**Datos disponibles hoy:** `identity.tradeName`, `identity.tagline`, `identity.description`,
`identity.valueProposition` (los cuatro son de texto libre, validados por el esquema).

**Restricción:** ninguna — es el área con más libertad de diseño porque no hay lógica detrás.

---

## Category Navigation

**Archivo:** `src/core/catalog/components/CatalogView.jsx` (subcomponente `CategoryTab`, no
exportado por separado).

**Propósito.** Filtrar el catálogo por categoría.

**Datos:** lista de categorías del cliente (`{id, name}` — sin jerarquía, plana), categoría activa
(`'all'` por defecto).

**Estados:** "Todo" activo por defecto / una categoría activa / sin categorías configuradas → el
bloque entero no se renderiza (no mostrar un selector vacío).

**Acciones:** seleccionar una categoría, volver a "Todo".

**Restricción de accesibilidad:** usa `role="tablist"`/`role="tab"`/`aria-selected` — el estado
activo no puede depender solo del color.

**Libertad visual:** tabs, dropdown, sidebar, chips — cualquier composición que exprese "una
opción seleccionada de N" es válida.

**Relación con BLUEPRINT:** el contenido de categorías viene de `clients/<slug>/content/categories.yaml`.

**Tests relevantes:** `e2e/theme-derivation.spec.js` (categorías distintas por cliente).

---

## Search

**Archivo:** `src/core/catalog/components/CatalogView.jsx` (mismo archivo que Category Navigation
— ambos son controles de filtrado sobre el mismo catálogo en memoria).

**Propósito.** Filtrar el catálogo por texto (nombre del producto).

**Props/config:** `features.search.enabled` (booleano, si es `false` el input no se muestra),
`features.search.minChars` (número mínimo de caracteres antes de filtrar, default 2).

**Estados:** vacío / escribiendo por debajo del mínimo → mensaje "Escribe al menos N caracteres" /
con resultados / sin resultados → mensaje explícito "Sin resultados para "X"" (nunca una grilla
vacía muda) / desactivado por configuración del cliente (no se renderiza).

**Restricción:** búsqueda 100% cliente sobre el catálogo ya cargado — no hay estado de "buscando en
el servidor" porque no hay servidor. No diseñar un spinner de búsqueda real.

**Libertad visual:** posición (header vs. dentro del catálogo), estilo del input.

**Relación con BLUEPRINT:** `features.search.*`.

**Tests relevantes:** `e2e/search-delivery.spec.js`.

---

## Filters

**Estado real: no implementado** más allá de categoría (arriba) y búsqueda (arriba). No hay panel
de filtros por precio ni por atributos. `features.filters.facets`/`defaultSort` existen en el
esquema del blueprint pero ningún componente los lee — son configuración sin efecto todavía.
Proponer un panel de filtros es una extensión real de funcionalidad, no solo de presentación.

---

## Cart

**Archivo:** `src/core/app/pages/CartPage.jsx`

**Propósito.** Ver y modificar el contenido del carrito antes de pagar.

**Datos:** líneas (`{productId, quantity, product, subtotal}`), `itemCount`, `total`, umbral de
envío gratis (opcional, el menor configurado entre las zonas de entrega del cliente).

**Estados:** vacío (mensaje + botón "Ver catálogo", nunca una tabla vacía) / con líneas / con
umbral de envío gratis no alcanzado (mensaje del monto que falta) / umbral alcanzado (mensaje de
confirmación "¡Tu pedido tiene envío gratis!").

**Acciones:** subir/bajar cantidad de una línea (tope = stock disponible), quitar una línea, ir a
pagar (`/checkout`).

**Restricción dura:** el stepper de cantidad no puede superar el stock disponible — el control
debe reflejarlo (botón "+" deshabilitado al llegar al tope), no solo validarlo en silencio.

**Libertad visual:** layout de línea (lista, tarjetas), estilo del stepper, posición del mensaje de
envío gratis.

**Relación con BLUEPRINT:** `delivery.ownDelivery.zones[].freeOver`.

**Tests relevantes:** `e2e/checkout-flow.spec.js`, `e2e/footer.spec.js` (mensaje de envío gratis).

---

## Checkout

**Archivo:** `src/core/commerce/checkout/CheckoutView.jsx`

**Propósito.** Confirmar contacto, elegir entrega, pagar, ver confirmación. Es **un solo paso**
hoy — todo vive en una vista, no en páginas separadas de wizard.

**Datos:** líneas del pedido, opciones de entrega ya cotizadas (ver `Delivery` más abajo), total a
cobrar (mercancía + tarifa de entrega elegida), disponibilidad de un método de pago.

**Campos de contacto:** nombre (obligatorio), teléfono (obligatorio), email (opcional) — en estado
local del navegador, **sin persistencia** (no hay backend, ver `SYSTEM-OVERVIEW.md`).

**Estados:** carrito vacío (sin formulario) / formulario incompleto (botón de confirmar refleja
que no se puede continuar) / sin método de pago configurado (mensaje + botón deshabilitado) /
procesando pago (estado transitorio, botón lo comunica) / confirmado (pantalla de éxito) / pago
fallido (mensaje de error, permite reintentar sin perder los datos ya ingresados).

**Restricción no negociable:** un pedido de demostración debe mostrar una marca explícita de que es
simulado — puede cambiar de forma, no puede eliminarse. **Nunca** pedir datos de tarjeta (número,
CVV, fecha) en ningún formulario propio.

**Libertad visual:** todo el layout — un paso o varios pasos visuales (wizard) sobre los mismos
campos y el mismo botón final de confirmar.

**Relación con BLUEPRINT:** `identity.contact.phone` (para el enlace de WhatsApp post-confirmación,
independiente de si el módulo `whatsapp` está activo), `payments.adapters`.

**Tests relevantes:** `e2e/checkout-contact.spec.js`, `e2e/checkout-flow.spec.js`,
`e2e/search-delivery.spec.js`.

---

## ProductDetail

**Archivo:** `src/core/app/pages/ProductDetailPage.jsx` — ruta `/producto/:id`.

**Propósito.** Toda la información de un producto para decidir la compra.

**Datos:** producto completo (todas las imágenes, no solo la primera; descripción completa),
categoría, y dos secciones reservadas sin datos todavía: "Reseñas" y "También te puede interesar".

**Estados:** los mismos de stock que `ProductCard`, más "producto no encontrado" (id inválido en
la URL) → página con vuelta al catálogo, nunca un error sin salida.

**Acciones:** navegar entre imágenes (ver `ProductGallery`), elegir cantidad (descontando lo que
ya haya en el carrito del stock disponible), agregar al carrito, volver.

**Restricción:** las secciones reservadas pueden rediseñarse en apariencia, pero deben seguir
diciendo "Próximamente" — no inventar reseñas ni productos relacionados falsos.

**Relación con BLUEPRINT:** `features.stock.lowStockThreshold` (igual que `ProductCard`).

**Tests relevantes:** `e2e/product-detail.spec.js` (5 casos: navegación, galería+descripción,
producto inexistente, stock bajo, límite de cantidad).

---

## ProductGallery

**Ubicación:** parte de `ProductDetailPage.jsx` (no es un archivo separado hoy).

**Propósito.** Imagen activa + miniaturas navegables.

**Datos:** lista de imágenes (`{src, alt}`) — puede tener 0, 1, o varias.

**Estados:** sin imágenes (placeholder) / una imagen (sin miniaturas) / varias (miniaturas
clicables, una marcada como activa vía `aria-current`).

**Restricción:** el `alt` de cada imagen es un dato del producto — no debe perderse al rediseñar
(accesibilidad).

**Libertad visual:** disposición de miniaturas, tamaño, transición (respetando `prefers-reduced-motion`).

---

## Delivery selector

**Ubicación:** parte de `CheckoutView.jsx` (`fieldset` con `data-testid="delivery-options"`).

**Propósito.** Elegir cómo se recibe el pedido.

**Datos:** lista de opciones ya calculadas por los adaptadores de entrega —
`{id, kind: 'pickup'|'delivery', label, fee, etaMinutes}`. El fee ya viene resuelto (puede ser 0).

**Estados:** sin ninguna opción configurada (el selector no se muestra en absoluto) / una opción
preseleccionada automáticamente al cargar (la primera de la lista) / varias para elegir.

**Acciones:** elegir una opción — recalcula el total del checkout de inmediato.

**Restricción:** selección única (tipo radio). Sin dirección ni mapa — el sistema no cotiza por
dirección, solo por zona/sucursal fija (ver `BLUEPRINT-MANUAL.md §delivery`).

**Relación con BLUEPRINT:** `branches[].pickup`, `delivery.adapters`,
`delivery.ownDelivery.zones[]`.

**Tests relevantes:** `e2e/search-delivery.spec.js`.

---

## Payment selector

**Estado real: no hay UI de selección.** El sistema interno soporta una lista de adaptadores de
pago, pero la interfaz siempre toma el primero resuelto — nunca se le pregunta al comprador qué
método usar porque hoy cada cliente tiene resuelto un único método visible. Si se diseña un
selector, es una extensión de UI sobre un dato que ya existe como lista.

**Restricción dura y permanente:** ningún formulario propio pide ni muestra datos de tarjeta.

---

## Order confirmation

**Ubicación:** parte de `CheckoutView.jsx` (estado `state === 'confirmed'`,
`data-testid="order-confirmed"`).

**Datos:** número de pedido, total cobrado, si el pago es simulado (`isMock` del adaptador),
enlace de WhatsApp opcional (si `identity.contact.phone` existe).

**Restricción no negociable:** si el pago fue simulado, debe decirlo explícitamente ("PEDIDO DE
DEMOSTRACIÓN" + texto aclaratorio). El pedido **no se persiste** — al recargar, esta pantalla
desaparece; no diseñarla como si fuera un historial consultable después.

**Tests relevantes:** `e2e/checkout-contact.spec.js`, `e2e/checkout-flow.spec.js`.

---

## Footer

**Archivo:** `src/core/app/Layout.jsx` (mismo archivo que el header).

**Datos:** `identity.tradeName`, `identity.contact.email`/`phone` (ambos opcionales),
`identity.contact.socials` (mapa plataforma→URL, 0 o más — íconos SVG en línea para
instagram/facebook/tiktok/x, cualquier otra clave se muestra como texto), tres links legales fijos
(`/legal/terminos`, `/legal/privacidad`, `/legal/devoluciones` — contenido **placeholder**
explícito, no texto legal real), y el disclaimer de salud si `identity.industry === 'health'`.

**Restricción:** los tres links legales deben seguir presentes y funcionales en cualquier
rediseño.

**Slot:** `layout.footer.extra` (para módulos futuros).

**Tests relevantes:** `e2e/footer.spec.js` (5 casos).

---

## Promotions / Banners

**Estado real: mecanismo listo, sin contenido.** Existen los slots (`layout.header.top`,
`layout.header.actions`, `layout.footer.extra`, `home.sections`) donde un módulo puede insertar
contenido, pero **ningún módulo de banners/promociones existe todavía**. El único contenido real
en un slot hoy es el anuncio de texto de `admin-content`. Cualquier banner debe asumir que puede
estar completamente ausente sin romper el layout.

---

## Empty states

Ya cubiertos donde aplican: catálogo sin productos tras filtrar (`ProductGrid`), búsqueda sin
resultados (`Search`), carrito vacío (`Cart`), checkout con carrito vacío (`Checkout`). **Regla
general** (ver `DESIGN-RULES.md`): mensaje explícito + acción de salida cuando tenga sentido, nunca
un espacio en blanco silencioso.

---

## Loading states

**Casi no existen porque casi no hay esperas reales** (el catálogo se carga una sola vez al abrir
la tienda). La única espera real es la confirmación del pago (unos segundos) — `Checkout` ya
comunica "Procesando…" y deshabilita el botón; el diseño puede estilizar libremente ese estado.

---

## Error states

- **Página no encontrada** (ruta inexistente o producto con id inválido): salida clara al
  catálogo, nunca una pantalla en blanco.
- **Error de confirmación de pago:** texto legible + posibilidad de reintentar, sin perder los
  datos de contacto ya ingresados.
- **Blueprint inválido:** esto ocurre en el arranque, antes de que exista una tienda — se muestra
  el detalle técnico solo en desarrollo, un mensaje genérico en producción. No es una pantalla que
  un diseño visual necesite rehacer (es de `core/app/ErrorBoundary.jsx` y `BootGate.jsx`).
