# Client Blueprint — Formato

> **Responde a:** ¿qué se le pregunta a un cliente, y cómo se convierte esa respuesta en la
> configuración que deriva su tienda?
> **No responde a:** cómo funciona el sistema de módulos ([MODULES.md](../modules/MODULES.md)).
>
> **Estado: DISEÑO. No existe ningún cliente ni ningún validador de esquema.**

---

## 1. Un cliente, dos archivos

El encargo pide que este documento sirva **doble**: entrevista al cliente y configuración técnica.
Son dos usos reales, pero con lectores incompatibles: la entrevista necesita prosa, matices y
acuerdos comerciales; la configuración necesita ser válida, tipada y legible por una máquina.

Un solo archivo obliga a elegir entre que el humano rellene JSON o que el código lea prosa. Por eso
se separan en dos, con una relación explícita (**PROP-0002**):

```
clients/<slug>/
├─ BRIEF.md          ← ENTREVISTA. Humano. Fuente de verdad de lo ACORDADO.
├─ blueprint.yaml    ← CONFIGURACIÓN. Máquina. Fuente de verdad de lo QUE SE CONSTRUYE.
├─ content/          ← textos, páginas, productos, categorías
├─ assets/           ← logo, hero, banners aprobados
└─ extensions/       ← código exclusivo del cliente (último recurso)
```

**Regla de oro:** `BRIEF.md` se llena primero, con el cliente. `blueprint.yaml` se deriva de él.
Cada sección del brief indica qué campos del blueprint alimenta. Si algo está en el blueprint pero
no en el brief, no fue acordado con nadie.

**Formato del blueprint: YAML** (aprobado — [ADR-0004](../architecture/DECISIONS.md#adr-0004--yaml-como-formato-del-blueprint)).
Admite comentarios (críticos para "por qué está esto así"), valores multilínea, y se lee sin ruido
de llaves. Coste: una dependencia de build para parsearlo, que **todavía no está instalada** — se
añade junto con el cargador de blueprints en el Bloque 1, no antes.

---

## 2. `BRIEF.md` — Guion de entrevista

Plantilla. Cada sección declara qué campos del blueprint alimenta. Lo que no se sepa se marca
`PENDIENTE` — **nunca se inventa**, porque una suposición aquí se convierte en una tienda mal
configurada.

<details>
<summary><strong>Plantilla completa de BRIEF.md</strong></summary>

```markdown
# Brief — <Nombre comercial>

Fecha: YYYY-MM-DD · Levantado por: · Estado: borrador | acordado | firmado

## 1. Identidad
> Alimenta: identity.*
- Nombre legal:
- Nombre comercial:
- Identificación fiscal:
- Descripción en una frase:
- Industria / rubro:
- Público objetivo (edad, ubicación, hábito de compra, dispositivo):
- Propuesta de valor (¿por qué te compran a ti y no al de al lado?):
- Tono de comunicación (cercano / formal / técnico / juvenil / sobrio):
- Idioma(s) y país(es) donde vende:
- Competencia de referencia (y qué le gusta / no le gusta de cada una):

## 2. Marca
> Alimenta: branding.*, theme
- Logo: ¿existe? ¿en qué formatos? ¿versión horizontal / isotipo / monocromo?
- Colores de marca (códigos exactos, no "azul"):
- **Colores PROHIBIDOS** (competencia, connotación, decisión del cliente):
- Tipografías: ¿tiene licencia? ¿o usamos alternativa web?
- Manual de marca: ¿existe? adjuntar.
- Estilo visual buscado: minimalista / cálido / lujoso / técnico / divertido
- Bordes: rectos / suaves / muy redondeados
- Sombras: planas / sutiles / marcadas
- Iconografía: línea / relleno / ilustrada
- ¿Modo oscuro? ¿obligatorio, opcional, no?

## 3. Recursos gráficos
> Alimenta: assets.*
- Fotos de producto: ¿existen? ¿cuántas? ¿calidad? ¿fondo homogéneo?
- Imágenes de portada (hero):
- Banners:
- Fotos de la empresa / equipo / local:
- Videos:
- **Restricciones de uso**: ¿hay imágenes con licencia limitada, con personas que no autorizaron
  su imagen, o de stock que no se puede usar en publicidad?
- ¿Quién produce lo que falte, y está dentro del alcance?

## 4. Diseño y experiencia
> Alimenta: design.*
- Personalidad visual en tres palabras:
- Nivel de minimalismo (1 = muy cargado, 5 = muy limpio):
- Animaciones: ninguna / sutiles / expresivas
- Estilo de tarjetas de producto: plana / con borde / con sombra / con imagen a sangre
- Estilo de promociones: discreto / evidente / agresivo
- Prioridad de dispositivo: (por defecto MÓVIL — confirmar si hay excepción)
- Referencias de sitios que le gustan, y por qué:

## 5. Funcionalidad
> Alimenta: modules.*
- Qué necesita **desde el día 1**:
- Qué querría **más adelante** (y en qué plazo):
- Qué **NO** quiere, explícitamente:
- Prioridad si hay que recortar (ordenar):

## 6. Comercio
> Alimenta: commerce.*, content/
- ¿Cuántos productos? ¿crecerá?
- ¿Categorías? ¿jerarquía?
- ¿Variantes? (talla, color, sabor, tamaño)
- ¿Precios visibles o "consultar"? ¿IVA incluido?
- ¿Descuentos habituales?
- ¿Controla stock? ¿vende sin stock?
- ¿Pedido mínimo?
- ¿Quién carga los productos: nosotros o el cliente?

## 7. Logística
> Alimenta: delivery.*, branches
- Sucursales (dirección, horario, teléfono, ¿retira ahí?):
- Zonas donde entrega:
- Países / ciudades:
- ¿Reparto propio? ¿cuántos repartidores? ¿cómo cobra el envío hoy?
- ¿Retiro en tienda?
- ¿Trabaja con transportistas? ¿cuáles?
- ¿Le interesa una flota externa tipo Uber Direct? ¿tiene cuenta? (ver DELIVERY.md §4.4)
- Tiempo de preparación:

## 8. Pagos
> Alimenta: payments.*
- Cómo cobra hoy:
- Métodos que quiere ofrecer:
- Datos bancarios para transferencia:
- ¿Contra entrega? ¿tope de importe?
- ¿Tiene cuenta con algún procesador de pago?
- Estados de pedido que usa hoy (con sus nombres):
- ¿Quién confirma los pagos y desde dónde?

## 9. Marketing
> Alimenta: marketing.*, seasonal
- Campañas que hace al año (nombre + fechas):
- Temporadas fuertes y flojas:
- ¿Banners rotativos? ¿destacados?
- Promociones habituales (2x1, packs, envío gratis...):
- ¿Venta cruzada / paquetes?
- Llamados a la acción preferidos:
- Redes sociales y WhatsApp:
- ¿Hace SEO / publicidad pagada hoy?

## 10. Métricas
> Alimenta: analytics.*
- Qué quiere saber (ventas, productos más vendidos, conversión, promos que funcionan):
- ¿Con qué frecuencia lo mira?
- ¿Tiene alguna herramienta de analítica ya?

## 11. Alcance comercial y operativo
> Alimenta: commercial.*
- Tier contratado: MANAGED | OWNERSHIP (ver TIERS.md)
- Qué INCLUYE:
- Qué NO incluye:
- Add-ons acordados:
- Quién carga el contenido:
- Quién mantiene:
- Criterios de aceptación (lista concreta y verificable):
- Plazo:
- Dominio y hosting: ¿quién los contrata y a nombre de quién?

> Este apartado registra lo acordado comercialmente. **No es asesoría legal** y no sustituye un
> contrato. Términos y condiciones, política de privacidad y devoluciones son responsabilidad del
> cliente y de su asesor legal; nosotros los publicamos, no los redactamos.
```

</details>

---

## 3. `blueprint.yaml` — Esquema completo

Todos los campos. `#` marca comentarios explicativos.

```yaml
# ─── META ──────────────────────────────────────────────────────────────────
schemaVersion: 1              # versión del ESQUEMA (lo cambia el core)
blueprintVersion: "1.0.0"     # versión de ESTE cliente (lo cambiamos nosotros)
core: "^1.0"                  # rango de core compatible. Ver VERSIONING.md
slug: acme-salud              # id único. debe coincidir con el nombre de carpeta
status: draft                 # draft | staging | live | archived

# ─── IDENTIDAD ─────────────────────────────────────────────────────────────
identity:
  legalName: "Acme Salud SpA"
  tradeName: "Acme Salud"
  taxId: "00.000.000-0"
  tagline: "Cuidado clínico a domicilio"
  description: "…"
  industry: health
  audience:
    ageRange: [30, 65]
    location: ["Santiago"]
    devicePriority: mobile        # mobile | desktop | balanced
    notes: "Compran por indicación médica, no por impulso."
  valueProposition: "…"
  tone: professional-warm         # formal | professional-warm | casual | playful | technical
  locales: [es-CL]
  defaultLocale: es-CL
  countries: [CL]
  contact:
    email: ""
    phone: ""
    whatsapp: ""
    socials: { instagram: "", facebook: "" }

# ─── MARCA ─────────────────────────────────────────────────────────────────
branding:
  logo:
    primary:    assets/logo.svg
    horizontal: assets/logo-h.svg
    isotype:    assets/isotipo.svg
    monochrome: assets/logo-mono.svg
    favicon:    assets/favicon.svg
    minWidthPx: 120               # por debajo, usar isotipo
  colors:
    brand:      "#1E4E8C"
    brandAlt:   "#6B4A2F"
    accent:     "#C9A227"
    forbidden:  ["#FF0000", "#00FF00"]   # se VALIDA: no pueden aparecer en el theme
  typography:
    heading: { family: "Inter", weights: [500, 700], source: google, licensed: true }
    body:    { family: "Inter", weights: [400, 500], source: google, licensed: true }
    mono:    { family: "system", source: system }
  visualStyle: clean-clinical
  radius: md                      # none | sm | md | lg | full
  shadow: subtle                  # none | subtle | soft | strong
  iconStyle: line                 # line | solid | duotone
  darkMode: optional              # off | optional | forced

# ─── RECURSOS ──────────────────────────────────────────────────────────────
assets:
  approved: true                  # false = no publicar en producción
  hero:     [{ src: assets/hero.jpg, alt: "…", focal: center }]
  banners:  []
  product:  { path: content/products/images, style: white-background }
  company:  []
  video:    []
  usageRestrictions:
    - asset: assets/equipo.jpg
      restriction: "Solo web propia. No publicidad pagada. Vence 2027-01-01."
  missing:  ["fotos de 12 productos"]    # visible en el checklist de lanzamiento

# ─── DISEÑO ────────────────────────────────────────────────────────────────
design:
  theme: acme-salud               # → src/themes/acme-salud/
  personality: [confiable, sereno, cercano]
  minimalism: 4                   # 1..5
  density: comfortable            # compact | comfortable | spacious
  animations: subtle              # none | subtle | expressive
  respectReducedMotion: true      # SIEMPRE true. Ver skill accessibility.
  cardStyle: bordered             # flat | bordered | elevated | image-bleed
  promoStyle: moderate            # discreet | moderate | loud
  layout:
    mobile:  { columns: 1, stickyCta: true,  bottomNav: true }
    tablet:  { columns: 2 }
    desktop: { columns: 4, maxWidthPx: 1280 }
  themeOverrides:                 # ajustes finos SIN crear un theme nuevo
    --radius: "0.5rem"

# ─── MÓDULOS ───────────────────────────────────────────────────────────────
# Ver docs/modules/MODULES.md. Solo ids reales; un id desconocido rompe el build.
modules:
  whatsapp:
    enabled: true
    config: { phone: "+56000000000", defaultMessage: "Hola, quiero consultar por…" }
  branches:  { enabled: true }
  promotions:{ enabled: true }
  coupons:   { enabled: false }
  reviews:   { enabled: false }
roadmap:                          # querido, no contratado. NO afecta al build.
  - { module: coupons, when: "2026-Q4", note: "tras validar promociones" }
excluded:                         # rechazado explícitamente. Evita re-proponerlo.
  - { module: reviews, reason: "el cliente no quiere moderar contenido" }

# ─── FLAGS DE CORE ─────────────────────────────────────────────────────────
features:
  search:   { enabled: true, minChars: 2 }
  filters:  { facets: [category, price], defaultSort: relevance }
  stock:    { show: true, allowBackorder: false, lowStockThreshold: 5 }
  checkout: { guestCheckout: true, steps: [contact, delivery, payment, review] }

# ─── COMERCIO ──────────────────────────────────────────────────────────────
commerce:
  currency: CLP
  priceDisplay: { taxIncluded: true, showStrikethrough: true, hidePricesUntilLogin: false }
  minOrder: { amount: 0, currency: CLP }
  catalogSize: ~120
  categories: { source: content/categories.yaml, maxDepth: 2 }
  variants:
    enabled: true
    axes: [size, presentation]
  products: { source: content/products/, managedBy: us }   # us | client
  stock:    { tracked: true, source: manual }

# ─── LOGÍSTICA ─────────────────────────────────────────────────────────────
# Esquema detallado en docs/architecture/DELIVERY.md §8
branches:
  - id: centro
    name: "Sucursal Centro"
    address: "…"
    coords: null
    hours: { mon-fri: "09:00-19:00", sat: "10:00-14:00" }
    pickup: true
    phone: ""
delivery:
  adapters: [pickup, own-delivery]
  optionOrder: price
  quoteTimeoutMs: 5000
  fallbackWhenUncovered: { action: contact, module: whatsapp, message: "…" }
  ownDelivery:
    coverage: zone-list
    zones:
      - { id: centro, label: "Centro", fee: {amount: 2500, currency: CLP},
          minOrder: {amount: 10000, currency: CLP},
          eta: {type: range, minMinutes: 30, maxMinutes: 60},
          freeOver: {amount: 30000, currency: CLP} }
  pickup: { branches: [centro], preparationMinutes: 20 }
  uberDirect: { enabled: false, note: "NO IMPLEMENTADO. Ver DELIVERY.md §4.4" }

# ─── PAGOS ─────────────────────────────────────────────────────────────────
# Esquema detallado en docs/architecture/PAYMENTS.md
payments:
  adapters: [bank-transfer]
  releaseOn: paid                 # paid | submitted (submitted = riesgo asumido por el cliente)
  bankTransfer:
    bank: ""
    accountType: ""
    accountNumber: ""
    holder: ""
    taxId: ""
    notifyEmail: ""
    expiresInHours: 48
    instructions: "content/payment-instructions.md"
  cashOnDelivery: { enabled: false, maxAmount: null }
  card: { enabled: false, note: "NO IMPLEMENTADO. Requiere backend. Ver PAYMENTS.md §5" }
  orderStates:                    # renombrado VISIBLE. El estado interno no cambia.
    confirmed: "Confirmado"
    preparing: "En preparación"
    dispatched: "En camino"

# ─── MARKETING ─────────────────────────────────────────────────────────────
marketing:
  homeSections: [hero, featured, categories, promo-banner, testimonials]
  carousels:
    - { id: featured, title: "Destacados", source: featured, autoplay: false }
  banners:  { source: content/banners.yaml }
  featured: { source: manual, ids: [] }
  crossSelling: { enabled: true, strategy: same-category, max: 4 }
  bundles: []
  cta: { primary: "Agregar al carrito", secondary: "Consultar por WhatsApp" }
  seasonal:                       # ver docs/architecture/SEASONAL-CAMPAIGNS.md
    enabled: true
    campaigns: [navidad, aniversario]

# ─── SEO ───────────────────────────────────────────────────────────────────
seo:
  titleTemplate: "%s · Acme Salud"
  defaultDescription: "…"
  ogImage: assets/og.jpg
  sitemap: true
  robots: allow                   # allow | disallow (disallow mientras status != live)
  structuredData: [Organization, Product, BreadcrumbList]

# ─── MÉTRICAS ──────────────────────────────────────────────────────────────
analytics:
  adapter: mock                   # mock | (proveedor real: PENDIENTE)
  track: [sales, topProducts, conversion, promoInteraction, searchTerms, abandonedCart]
  dashboardFor: [owner, operator]
  consent: { required: true, mode: opt-in }   # no rastrear antes del consentimiento

# ─── COMERCIAL ─────────────────────────────────────────────────────────────
# No afecta al storefront. Controla el ADMIN. Ver docs/business/TIERS.md
commercial:
  tier: managed                   # managed | ownership
  addOns: []
  contentManagedBy: us            # us | client
  maintenance: included
  acceptanceCriteria:
    - "El catálogo carga en menos de 3 s en 4G en un móvil de gama media."
    - "Se puede completar un pedido de principio a fin en móvil."
    - "Los datos de transferencia mostrados coinciden con los entregados por el cliente."
    - "Ningún dato marcado como DEMO aparece en el sitio publicado."
  launchDate: null
  domain: { name: "", ownedBy: client }
```

---

## 4. Reglas de validación

El blueprint se valida en boot. **Error fatal** detiene el build; **advertencia** se registra y se
muestra en el checklist de lanzamiento.

| Regla | Nivel |
|---|---|
| `slug` coincide con el nombre de la carpeta | error |
| `schemaVersion` es soportada por el core | error |
| `core` es compatible con la versión del core instalado | error |
| Todo id de módulo existe | error |
| Dependencias de módulo satisfechas, sin conflictos ni ciclos | error |
| Todo adaptador referenciado existe | error |
| `mode: production` y algún adaptador resuelto es mock | error |
| El theme referenciado existe | error |
| Ningún color de `branding.colors.forbidden` aparece en el theme resuelto | error |
| Todo asset referenciado existe en disco | error |
| Contraste de texto sobre fondo cumple AA (4.5:1) | error |
| `assets.approved: false` con `status: live` | error |
| Clave desconocida (probable typo) | advertencia |
| `assets.missing` no vacío con `status: live` | advertencia |
| `usageRestrictions` con fecha vencida | advertencia |
| `roadmap` referencia un módulo inexistente | advertencia |

> Las dos validaciones de marca —colores prohibidos y contraste— son la razón principal para que
> el blueprint sea legible por máquina. Son promesas al cliente que se pueden **verificar**, no
> solo prometer.

---

## 5. Derivar una tienda: procedimiento

1. Completar `BRIEF.md` **con el cliente**. Lo desconocido queda `PENDIENTE`, no inventado.
2. `cp -r clients/_template clients/<slug>` *(la plantilla se crea en el Bloque 1)*.
3. Traducir el brief a `blueprint.yaml`, sección por sección.
4. Crear `src/themes/<slug>/theme.css` con los tokens del contrato.
   **Solo tokens.** Si hace falta lógica, no va en el theme.
5. Cargar contenido en `clients/<slug>/content/`.
6. Ejecutar la validación. Resolver todos los errores.
7. Revisar el checklist de lanzamiento (advertencias, assets faltantes, criterios de aceptación).
8. Desplegar con `VITE_CLIENT=<slug>` y `VITE_MODE=production`.

**Si en el paso 4 o 5 hace falta escribir código de aplicación, algo va mal.** Es la señal de que
falta un módulo o un token en el core — se resuelve ahí, no en la carpeta del cliente.
