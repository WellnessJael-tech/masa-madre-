# Sistema de módulos — Masa Madre

> **Responde a:** ¿qué es un módulo, cómo se declara, cómo se activa por cliente, y cómo se
> impide que dos módulos se rompan entre sí?
> **No responde a:** dónde vive cada carpeta ([ARCHITECTURE.md](../architecture/ARCHITECTURE.md)).
>
> **Estado: DISEÑO. Nada de esto está implementado.**

---

## 1. Regla de activación

Un módulo se activa **exclusivamente** desde el blueprint del cliente. Nunca:

- ❌ comentando/descomentando código
- ❌ con un `if (cliente === 'x')` en el core
- ❌ con una variable de entorno suelta por feature
- ❌ borrando archivos de un build

```yaml
# clients/<slug>/blueprint.yaml
modules:
  whatsapp:
    enabled: true
    config:
      phone: "+00000000000"
      defaultMessage: "Hola, quiero consultar por..."
  coupons:
    enabled: false
```

Consecuencia: **configurar una tienda no toca código de aplicación.** Ese es el test de si el
sistema de módulos funciona.

---

## 2. Cinco categorías — no todo es un módulo

La lista de funcionalidades del encargo mezcla cosas de naturaleza distinta. Tratarlas todas como
"módulos activables" produciría ~26 puntos de registro, la mayoría de los cuales nunca se
desactivarían. Clasificación propuesta (**PROP-0001, pendiente de aprobación**):

| Categoría | Qué es | Cómo se controla |
|---|---|---|
| **CORE-fijo** | Sin esto no hay tienda | No se desactiva. Se configura. |
| **CORE-configurable** | Capacidad del core con comportamiento ajustable | Feature flags dentro del core |
| **MODULE** | Unidad de comportamiento + UI, genuinamente opcional | `modules.<id>.enabled` |
| **PORT + ADAPTER** | Depende de un proveedor externo intercambiable | Elección de adaptador |
| **SLOT / CONTENT** | Presentación o texto, sin lógica de negocio | Theme + contenido del cliente |

**Por qué importa:** cada categoría tiene un mecanismo de cambio y un dueño distinto. Un cliente
MANAGED puede editar CONTENT sin que nadie revise; cambiar un ADAPTER de pago exige a un operador
nuestro. Si todo fuera "módulo", esa distinción de permisos no existiría
(ver [TIERS.md](../business/TIERS.md)).

---

## 3. Catálogo completo, clasificado

### CORE-fijo (siempre presente)

| Funcionalidad | Nota |
|---|---|
| Catálogo de productos | Entidad producto, variantes, precio, stock, media |
| Categorías | Jerarquía, navegación |
| Carrito | Líneas, cantidades, totales, persistencia local |
| Checkout | Flujo por pasos, validación, creación de pedido |
| Pedidos | Entidad pedido + máquina de estados |
| Navegación / layout / routing | Shell |
| Sistema de configuración | Carga y validación de blueprint |
| Registro de módulos | Este documento |
| Feature flags | Ver §4 |

### CORE-configurable (existe siempre, se ajusta)

| Funcionalidad | Flags de ejemplo |
|---|---|
| Filtros de producto | qué facetas, rango de precio, orden por defecto |
| Búsqueda | activa/inactiva, campos indexados, mínimo de caracteres |
| Stock | ¿se muestra?, ¿se permite venta sin stock?, umbral "últimas unidades" |
| Precios | moneda, formato, impuestos incluidos/excluidos, mostrar precio tachado |
| SEO | meta base, sitemap, datos estructurados (ver [nota SEO](#nota-sobre-seo)) |

> **Búsqueda y filtros no son módulos.** Un catálogo sin búsqueda sigue funcionando, pero el código
> vive en el mismo dominio que el catálogo y comparte su índice; separarlo produciría acoplamiento
> encubierto. Se apagan con un flag, no con un módulo.

### MODULE (verdaderamente opcional)

| id | Qué hace | Requiere | Conflictos |
|---|---|---|---|
| `whatsapp` | CTA flotante, pedido por WhatsApp, compartir producto | — | — |
| `promotions` | Motor de reglas de descuento (%, monto, 2x1, bundle) | — | — |
| `coupons` | Códigos canjeables en checkout | `promotions` | — |
| `flash-sales` | Promoción con ventana temporal + contador | `promotions` | — |
| `bundles` | Paquetes de productos con precio propio | `promotions` | — |
| `cross-selling` | "También te puede interesar", relacionados | — | — |
| `branches` | Múltiples sucursales, horarios, selector | — | — |
| `wishlist` | Guardados / favoritos | — | — |
| `reviews` | Reseñas y valoraciones | — | — |
| `seasonal-campaigns` | Campañas por fecha en slots | — | ver [SEASONAL-CAMPAIGNS.md](../architecture/SEASONAL-CAMPAIGNS.md) |
| `admin-content` | Edición de contenido por el cliente | — | — |
| `admin-catalog` | ABM de productos por el cliente | `admin-content` | — |
| `bulk-import` | Importación masiva CSV/XLSX de productos | `admin-catalog` | — |
| `media-manager` | Subida y gestión de imágenes de producto | `admin-catalog` | — |
| `reporting` | Informes de ventas y productos | `analytics` (puerto) | — |

> `discounts` del encargo original queda absorbido por `promotions` (un descuento es una regla de
> promoción). Mantenerlos separados duplicaría el motor de reglas.

### PORT + ADAPTER (proveedor externo intercambiable)

| Puerto | Adaptadores previstos | Documento |
|---|---|---|
| `payment` | bank-transfer, cash, cash-on-delivery, card (pendiente), mock | [PAYMENTS.md](../architecture/PAYMENTS.md) |
| `delivery` | own-delivery, manual, pickup, uber-direct (pendiente), mock | [DELIVERY.md](../architecture/DELIVERY.md) |
| `analytics` | mock, (proveedor real pendiente) | — |
| `content` | filesystem (archivos del cliente), (CMS pendiente) | — |
| `storage` | local, (subida de imágenes pendiente — requiere backend) | — |
| `notifications` | (email/WhatsApp saliente — pendiente, requiere backend) | — |

> **Los métodos de pago y de envío no son módulos on/off.** Son adaptadores de un puerto, porque el
> checkout debe poder ofrecer *varios a la vez* y compararlos. Un booleano no expresa eso.

### SLOT / CONTENT (presentación y texto)

| Funcionalidad | Dónde vive |
|---|---|
| Carruseles | Componente de core, alimentado por contenido; colocado en un slot |
| Banners | Contenido del cliente + slot |
| Secciones de landing a medida | Contenido del cliente, compuesto con bloques de core |
| Componentes de marketing (CTA, destacados) | Bloques de core, configurados por contenido |
| Decoración estacional | Theme + `seasonal-campaigns` |

> **Un carrusel no es un módulo.** Es un componente de presentación que renderiza los datos que le
> pasen. Hacerlo activable por config sería configurar la existencia de un `<div>`.

### Nota sobre SEO

El SEO es **transversal**, no una feature. Se implementa como responsabilidad del core en cada
página (títulos, meta, datos estructurados, jerarquía de encabezados) y se *configura* desde el
blueprint. Un "módulo SEO" desactivable sería un módulo que nadie desactiva y cuya ausencia
degradaría todas las páginas.

---

## 4. Módulos vs feature flags

Se confunden fácilmente. No son lo mismo:

| | Módulo | Feature flag |
|---|---|---|
| Unidad | Carpeta con código y UI propios | Booleano/valor dentro de código existente |
| Coste si está apagado | Cero (no se carga) | Nulo (una rama) |
| Ejemplo | `coupons` | `checkout.guestCheckout: true` |
| Tiene dependencias | Sí, declaradas | No |
| Contribuye a slots | Sí | No |

**Regla:** si apagarlo elimina código y UI → módulo. Si apagarlo cambia el comportamiento de código
que igual se envía → flag. No modelar un flag como módulo para "que se vea modular".

---

## 5. Manifiesto de módulo

Cada módulo declara **un** archivo `module.js`. Es su contrato completo.

```js
// src/modules/coupons/module.js
export default {
  id: 'coupons',
  version: '1.0.0',

  // Dependencias duras: sin ellas el módulo NO puede activarse.
  requires: ['promotions'],

  // Incompatibilidades declaradas: no pueden estar activos a la vez.
  conflictsWith: [],

  // Dependencias blandas: si están, se integra; si no, degrada sin fallar.
  optional: ['analytics'],

  // Capacidades que este módulo publica para que otros las consuman
  // SIN importarlo directamente.
  provides: ['discount.code-redemption'],

  // Puertos que este módulo necesita que estén resueltos.
  ports: [],

  // Slots del core que este módulo rellena.
  slots: ['checkout.summary.extra', 'cart.footer'],

  // Esquema de la config que acepta desde el blueprint.
  configSchema: {
    maxPerOrder:    { type: 'number',  default: 1,     min: 1 },
    stackable:      { type: 'boolean', default: false },
    caseSensitive:  { type: 'boolean', default: false },
  },

  // Permiso mínimo para modificar la config de este módulo.
  // Ver docs/business/TIERS.md
  manageableBy: 'operator',

  // Carga diferida: el código solo entra al bundle si el módulo está activo.
  load: () => import('./index.js'),
}
```

### Responsabilidades

| Campo | Quién lo escribe | Quién lo lee |
|---|---|---|
| `id`, `version`, `requires`, `conflictsWith`, `provides`, `slots` | autor del módulo | registro, en boot |
| `configSchema` | autor del módulo | validador de blueprint |
| `enabled`, `config` | blueprint del cliente | registro, en boot |
| `manageableBy` | autor del módulo | capa de permisos del admin |

**El módulo declara qué necesita. El cliente declara qué quiere. El registro decide si es posible.**
Ninguno de los tres invade el trabajo de los otros.

---

## 6. Resolución y validación

En boot, el registro ejecuta en este orden. **Cualquier fallo detiene el arranque con un mensaje
accionable** — nunca se arranca con una tienda a medio configurar.

1. **Existencia** — todo `id` del blueprint corresponde a un módulo real.
   → `Módulo desconocido "cupones" en clients/acme/blueprint.yaml. ¿Quisiste decir "coupons"?`
2. **Dependencias** — todo `requires` de un módulo activo está también activo.
   → `"coupons" requiere "promotions", que está desactivado. Actívalo o desactiva "coupons".`
3. **Conflictos** — ningún par activo aparece en el `conflictsWith` del otro.
4. **Ciclos** — el grafo de `requires` es acíclico. Ordenación topológica.
5. **Puertos** — todo puerto listado por un módulo activo tiene un adaptador resuelto.
6. **Config** — la config del blueprint valida contra el `configSchema`; se aplican defaults.
   Clave desconocida = **advertencia ruidosa** (probablemente un typo), no error.
7. **Slots** — ningún slot exclusivo recibe dos contribuciones sin prioridad declarada.

Salida: una lista ordenada de módulos activos con su config resuelta, incluida en el manifiesto de
build (ver [VERSIONING.md](../architecture/VERSIONING.md)).

### Por qué fallar en boot y no degradar en silencio

Una tienda que arranca con el checkout mal configurado pierde ventas sin que nadie se entere. Una
tienda que no arranca se detecta en el despliegue, antes de llegar al cliente. El fallo ruidoso es
más barato. En `demo`, además, el error se muestra en pantalla con el detalle; en `production` se
muestra una página de error genérica y el detalle va al log.

---

## 7. Slots: cómo se enchufa un módulo sin tocar el core

El core declara puntos de extensión con nombre. No sabe quién los rellena.

```jsx
// en el core — no importa ningún módulo
<Slot name="product.card.badges" context={{ product }} />
```

```js
// en el módulo — se registra al cargarse
registerSlot('product.card.badges', {
  moduleId: 'promotions',
  priority: 10,
  render: ({ product }) => <DiscountBadge product={product} />,
})
```

### Reglas de slot

- Un slot **vacío no es un error**. Renderiza nada.
- Un slot recibe **contexto de solo lectura**. Un módulo no puede mutar el estado del core desde un
  slot; para eso usa la API pública del core.
- Múltiples contribuciones se ordenan por `priority` (menor = antes). Empate → orden topológico de
  módulos, que es determinista.
- Los slots **exclusivos** (uno solo, p. ej. `checkout.payment.selector`) rechazan la segunda
  contribución en boot con error.
- El nombre de un slot es **API pública del core**: renombrarlo es un cambio breaking
  (ver [VERSIONING.md](../architecture/VERSIONING.md)).

### Slots iniciales previstos

`layout.header.top` · `layout.header.actions` · `layout.footer.extra` · `home.sections` ·
`catalog.filters.extra` · `product.card.badges` · `product.detail.after-price` ·
`product.detail.actions` · `cart.line.extra` · `cart.footer` · `checkout.steps` ·
`checkout.summary.extra` · `checkout.payment.selector` · `checkout.delivery.selector` ·
`global.floating` · `admin.nav`

Los slots de campaña estacional se documentan aparte en
[SEASONAL-CAMPAIGNS.md](../architecture/SEASONAL-CAMPAIGNS.md).

---

## 8. Capabilities: comunicación entre módulos sin acoplarlos

Un módulo **nunca** importa a otro. Si necesita algo de otro, lo pide por capacidad:

```js
const redeem = capabilities.get('discount.code-redemption')
if (redeem) {
  // coupons está activo
} else {
  // degrada: sin campo de cupón. No se rompe nada.
}
```

Esto es lo que permite desactivar `coupons` en un cliente sin que `checkout` ni `promotions` se
enteren. Si un módulo *no puede* degradar sin la capacidad, entonces no es opcional: es una
dependencia dura y va en `requires`.

---

## 9. Checklist para añadir un módulo nuevo

1. ¿Es realmente un módulo? Revisa la clasificación de §2–3. La mayoría de las ideas son
   CORE-configurable, CONTENT o un ADAPTER.
2. ¿Lo necesita más de un cliente? Si no → extensión del cliente.
3. Crear `src/modules/<id>/module.js` con el manifiesto completo.
4. Declarar `requires`, `conflictsWith`, `provides`, `slots`, `configSchema` — **todos**.
5. Verificar: no importa ningún otro módulo. No lo importa el core.
6. Verificar: el módulo funciona con sus `optional` ausentes.
7. Documentar el módulo en la tabla de §3 de este archivo.
8. Añadir su bloque al esquema de
   [BLUEPRINT-FORMAT.md](../client-blueprints/BLUEPRINT-FORMAT.md).
