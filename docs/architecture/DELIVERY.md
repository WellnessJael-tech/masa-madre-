# Delivery — Puerto y adaptadores

> **Responde a:** ¿cómo calcula, cobra y sigue el envío una tienda, sin que el core dependa de
> ningún proveedor concreto?
> **No responde a:** cómo se cobra el pedido ([PAYMENTS.md](PAYMENTS.md)).
>
> **Estado: DISEÑO. No hay ninguna integración implementada.**
> **Ninguna API de proveedor descrita aquí ha sido verificada contra su documentación real.**

---

## 1. El problema que resuelve

El checkout necesita responder tres preguntas: *¿se puede entregar aquí?*, *¿cuánto cuesta?*,
*¿cuándo llega?* Las respuestas cambian por completo según quién entregue (el propio comercio, un
repartidor asignado a mano, una flota externa por API, o nadie porque es retiro en sucursal).

Si el checkout conoce a los proveedores, cada cliente nuevo con una logística distinta obliga a
modificar el checkout — es decir, el core. Eso está prohibido.

**Solución:** el core habla con un solo contrato, `DeliveryPort`. Los proveedores son adaptadores
intercambiables. El checkout nunca sabe con quién está hablando.

---

## 2. El contrato: `DeliveryPort`

```js
/**
 * @typedef {Object} DeliveryPort
 *
 * @property {string}  id            Identificador del adaptador. p.ej. 'own-delivery'
 * @property {boolean} isMock        true solo en adaptadores de demo. Ver DEMO-PRODUCTION.md
 * @property {DeliveryCapabilities} capabilities  Qué sabe hacer este adaptador
 *
 * @property {(req: QuoteRequest) => Promise<QuoteResult>}  quote
 * @property {(req: CreateRequest) => Promise<Fulfillment>} create
 * @property {(id: string) => Promise<Fulfillment>}         status
 * @property {(id: string, reason: string) => Promise<Fulfillment>} cancel
 */
```

### `capabilities` — cómo el core sabe qué UI mostrar

En lugar de que el checkout pregunte "¿eres Uber?", pregunta "¿sabes dar seguimiento?". Así se
añaden proveedores sin tocar la UI.

```js
{
  quoting:        'dynamic' | 'static' | 'none',  // ¿precio por API, por tabla, o a convenir?
  scheduling:     boolean,   // ¿permite elegir franja horaria?
  tracking:       boolean,   // ¿hay seguimiento en vivo?
  proofOfDelivery:boolean,
  cancellable:    boolean,
  requiresAddress:boolean,   // false en pickup
  requiresBranch: boolean,   // true en pickup y en delivery desde sucursal
  coverageCheck:  'zone' | 'radius' | 'postal-code' | 'api' | 'none',
  etaAccuracy:    'exact' | 'range' | 'manual' | 'none',
}
```

### Tipos de dato

```js
/** @typedef {Object} QuoteRequest
 *  @property {CartSnapshot} cart        Ítems, peso, volumen, valor total
 *  @property {Address|null} destination
 *  @property {string|null}  branchId    Origen, si el cliente tiene sucursales
 *  @property {string|null}  requestedAt ISO 8601, si se pide franja programada
 */

/** @typedef {Object} DeliveryOption
 *  @property {string} id              Único dentro del adaptador
 *  @property {string} adapterId
 *  @property {string} label           Texto mostrable. Viene del contenido, no hardcodeado.
 *  @property {'delivery'|'pickup'} kind
 *  @property {Money}  price           { amount, currency }. amount=0 es válido (envío gratis).
 *  @property {Eta}    eta             { type: 'exact'|'range'|'manual', ... }
 *  @property {string[]} constraints   p.ej. ['pedido mínimo no alcanzado']
 *  @property {boolean} available
 *  @property {string|null} unavailableReason  Legible por humanos. Se muestra al comprador.
 */

/** @typedef {Object} QuoteResult
 *  @property {DeliveryOption[]} options
 *  @property {boolean} covered        false = fuera de cobertura de ESTE adaptador
 */

/** @typedef {Object} Fulfillment
 *  @property {string} id
 *  @property {FulfillmentState} state       Estado CANÓNICO del core (ver §5)
 *  @property {string} providerState         Estado crudo del proveedor. Solo para diagnóstico.
 *  @property {Eta|null} eta
 *  @property {TrackingInfo|null} tracking
 *  @property {string|null} assignedTo       Repartidor, si aplica
 */
```

### Lo que el puerto NO hace, deliberadamente

- **No cobra.** El precio del envío es una línea del pedido; el cobro es de `PaymentPort`.
- **No decide.** Devuelve opciones; elige el comprador.
- **No guarda estado.** El pedido es del core. El adaptador refleja lo que dice el proveedor.
- **No traduce.** Las etiquetas visibles vienen del contenido del cliente, no del adaptador.

---

## 3. Combinar métodos: cómo funciona el checkout

El cliente puede tener varios adaptadores activos a la vez (retiro en sucursal + reparto propio en
zona céntrica + flota externa fuera de zona). El core:

1. Pide `quote()` **en paralelo** a todos los adaptadores activos.
2. Descarta los que devuelven `covered: false`.
3. Funde todas las `options` en una sola lista.
4. Ordena según `delivery.optionOrder` del blueprint (`price` | `eta` | `manual`).
5. Si la lista queda vacía → muestra el mensaje de "fuera de cobertura" del cliente, con la
   alternativa configurada (p. ej. contactar por WhatsApp).
6. Un adaptador que falla o expira **no rompe el checkout**: se registra y se excluye de esa
   cotización. Si *todos* fallan, se aplica el fallback configurado.

**Timeout obligatorio por adaptador** (por defecto 5 s, configurable). Un proveedor lento no puede
bloquear una venta.

---

## 4. Adaptadores

### 4.1 `pickup` — Retiro en sucursal

El caso degenerado: no hay transporte. Se modela como adaptador de delivery para que el checkout
tenga **un solo flujo** de "cómo recibo el pedido", en vez de una rama especial.

- `quoting: 'static'`, precio 0, `requiresAddress: false`, `requiresBranch: true`.
- Depende del módulo `branches` si hay más de una sucursal.
- Configuración: sucursales elegibles, horarios de retiro, tiempo de preparación, instrucciones.
- **Nuestro sistema:** todo. Sin dependencias externas. Es el primer adaptador a construir.

### 4.2 `own-delivery` — Reparto propio

El comercio reparte. Cobertura y tarifa se calculan **localmente**, sin API externa.

- `quoting: 'static'`, `coverageCheck: 'zone' | 'radius' | 'postal-code'`, `etaAccuracy: 'range'`.
- Modelos de tarifa soportados:
  - **fija** por zona
  - **por tramos de distancia** (0–3 km: X; 3–7 km: Y)
  - **por valor del pedido** (gratis sobre un umbral)
  - **por peso/volumen**
  - **combinada** (tarifa base + regla de gratuidad)
- Cada zona declara: nombre, geometría, tarifa, pedido mínimo, franja horaria, ETA, activa sí/no.
- **Nuestro sistema:** cálculo de zona, tarifa, ETA, validación, UI.
- **Proveedor externo:** ninguno — **salvo** que la cobertura se defina por geometría y haga falta
  geocodificar la dirección del comprador. Ver §6.

**Geometría de zona — tres modos, en orden de coste:**

| Modo | Necesita | Precisión |
|---|---|---|
| Lista de códigos postales / barrios | nada | baja, cero coste, funciona hoy |
| Radio desde sucursal | geocodificar la dirección | media |
| Polígono | geocodificar + point-in-polygon | alta |

> **Recomendación para MVP:** empezar por lista de zonas seleccionables por el comprador. No
> requiere mapas, ni geocodificación, ni claves de API, y es suficiente para comercios locales.
> El puerto ya contempla los otros dos modos, así que subir de precisión luego no toca el checkout.

### 4.3 `manual` — Asignación manual

Hay entrega, pero la coordina una persona. Muy común en comercios pequeños y en pedidos grandes.

- `quoting: 'none'` o `'static'`, `tracking: false`, `etaAccuracy: 'manual'`.
- El pedido entra en `awaiting_assignment`. Un operador asigna repartidor y confirma ETA desde el
  panel. Los cambios de estado son acciones humanas, no callbacks.
- **Nuestro sistema:** todo (UI de asignación, estados, notificación al comprador).
- **Proveedor externo:** ninguno.

### 4.4 `uber-direct` — Flota externa por API · **NO IMPLEMENTADO**

> ⚠️ **No hay integración, ni credenciales, ni contrato verificado con el proveedor.**
> Lo siguiente describe **qué necesita nuestro sistema**, derivado de nuestro puerto — no
> la API real de Uber Direct, que no ha sido consultada. Antes de implementar hay que leer su
> documentación oficial y ajustar este apartado.

Qué haría falta averiguar y acordar, en este orden:

1. **Comercial:** ¿el comercio tiene cuenta habilitada? ¿en qué ciudades? ¿qué comisión?
2. **Credenciales:** las claves son **secretas** → no pueden vivir en el frontend.
   Esta integración **exige un backend** (ver §7).
3. **Contrato mínimo que necesita nuestro puerto:**
   | Necesitamos | Le enviamos | Nos devuelve |
   |---|---|---|
   | Cotizar | origen (sucursal), destino, tamaño/peso del pedido | precio, ETA, id de cotización, validez |
   | Crear entrega | id de cotización, datos de contacto, instrucciones | id de entrega, estado inicial |
   | Consultar | id de entrega | estado, ubicación del repartidor, ETA |
   | Cancelar | id de entrega, motivo | estado final, penalización si la hay |
   | Recibir cambios | endpoint de webhook + verificación de firma | eventos de estado |
4. **Reparto de responsabilidad:**
   - **Proveedor:** repartidores, precio real, seguimiento, prueba de entrega, seguro, soporte.
   - **Nosotros:** enviar datos correctos, mapear sus estados a los nuestros, mostrar precio y ETA
     tal como los devuelve, manejar fallo/timeout, guardar el id de entrega en el pedido.
5. **Riesgo a decidir con el cliente antes de implementar:** ¿quién absorbe la diferencia si la
   cotización mostrada al comprador no coincide con el cobro final del proveedor?

**Mientras tanto:** en `demo` se usa `delivery/mock`, marcado como simulado. En `production` no se
ofrece esta opción. El core no cambia cuando llegue.

### 4.5 `mock` — Solo demo

Devuelve opciones plausibles y avanza estados con temporizadores. `isMock: true`. El build de
producción **falla** si este adaptador queda resuelto
(ver [DEMO-PRODUCTION.md](../business/DEMO-PRODUCTION.md)).

### 4.6 `other / future` — Cómo añadir un proveedor

Un adaptador nuevo es una carpeta en `src/adapters/delivery/<proveedor>/` que exporta un objeto
conforme a `DeliveryPort`. **No se toca el core, ni el checkout, ni ningún otro adaptador.** Si un
proveedor nuevo obliga a cambiar el puerto, es señal de que el puerto está mal diseñado — se
discute y se versiona (ver [VERSIONING.md](VERSIONING.md)), no se parchea el checkout.

---

## 5. Máquina de estados — propiedad del core

Los estados canónicos son **nuestros**. Cada adaptador mapea los suyos a estos. El core nunca
guarda un estado de proveedor como estado del pedido.

```
              ┌──────────────────────────────────────────┐
              ▼                                          │
  pending ──> confirmed ──> preparing ──> ready ──┬──> dispatched ──> delivered
     │            │             │                 │         │
     │            │             │                 └──> awaiting_pickup ──> picked_up
     │            │             │
     └────────────┴─────────────┴──> cancelled            (cualquiera) ──> failed
```

| Estado | Significado |
|---|---|
| `pending` | Pedido creado, sin confirmar (p. ej. esperando pago) |
| `confirmed` | Confirmado, aún no se prepara |
| `preparing` | En preparación |
| `ready` | Listo. Bifurca según sea entrega o retiro |
| `awaiting_assignment` | (solo `manual`) esperando repartidor |
| `dispatched` | En camino |
| `awaiting_pickup` | (solo `pickup`) esperando al comprador en sucursal |
| `delivered` / `picked_up` | Terminal, exitoso |
| `cancelled` | Terminal, cancelado |
| `failed` | Terminal, fallido (dirección incorrecta, ausente, rechazo) |

Reglas: transiciones inválidas se rechazan y se registran; los estados terminales no admiten
transición; `providerState` se conserva íntegro junto al canónico para diagnóstico.

---

## 6. Mapas y geolocalización · **NO IMPLEMENTADO**

> No hay proveedor de mapas elegido, ni clave, ni integración.

Solo hace falta si se usa cobertura por radio o polígono, o mapa visible.

| Necesidad | Nuestro sistema | Proveedor externo |
|---|---|---|
| Dirección → coordenadas | enviar la dirección, cachear el resultado | geocodificación |
| Autocompletado de dirección | UI del campo | sugerencias |
| Mapa visible | contenedor, marcadores, estilo del theme | tiles |
| Punto dentro de zona | cálculo (nuestro, sin API) | — |

**Advertencia de coste y privacidad:** la geocodificación se factura por petición y las claves de
mapas expuestas en el frontend deben restringirse por dominio y cuota. Una dirección es dato
personal: no enviarla a un tercero sin base legal ni informarlo. Si se elige un proveedor, se
registra como decisión en [DECISIONS.md](DECISIONS.md).

---

## 7. Restricción del stack actual

El proyecto **no tiene backend**. Eso implica:

| Adaptador | ¿Funciona solo con frontend? |
|---|---|
| `pickup` | ✅ sí |
| `own-delivery` (zonas seleccionables) | ✅ sí |
| `own-delivery` (radio/polígono con geocodificación) | ⚠️ requiere clave restringida por dominio |
| `manual` | ⚠️ necesita persistencia de pedidos y un panel |
| `uber-direct` | ❌ **requiere backend** (credenciales secretas + webhooks) |

Un webhook necesita un endpoint público que reciba peticiones del proveedor: eso no existe en una
SPA estática. Cualquier proveedor con seguimiento en vivo lo exige. Decidir el backend es
prerrequisito de esa funcionalidad, no un detalle posterior.

---

## 8. Qué configura el cliente

Resumen; el esquema completo está en
[BLUEPRINT-FORMAT.md](../client-blueprints/BLUEPRINT-FORMAT.md).

```yaml
delivery:
  adapters: [pickup, own-delivery]      # orden = orden de presentación si optionOrder: manual
  optionOrder: price                    # price | eta | manual
  quoteTimeoutMs: 5000
  fallbackWhenUncovered:
    action: contact                     # contact | hide | message
    module: whatsapp
    message: "No llegamos a tu zona todavía. Escríbenos y lo coordinamos."
  ownDelivery:
    coverage: zone-list                 # zone-list | radius | polygon | postal-code
    zones:
      - id: centro
        label: "Centro"
        fee: { amount: 2500, currency: CLP }
        minOrder: { amount: 10000, currency: CLP }
        eta: { type: range, minMinutes: 30, maxMinutes: 60 }
        freeOver: { amount: 30000, currency: CLP }
  pickup:
    branches: [sucursal-centro]
    preparationMinutes: 20
```
