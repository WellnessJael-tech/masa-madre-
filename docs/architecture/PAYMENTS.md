# Pagos — Puerto, adaptadores y seguridad

> **Responde a:** ¿cómo se cobra un pedido, y dónde puede y no puede vivir cada dato sensible?
> **No responde a:** cómo se entrega ([DELIVERY.md](DELIVERY.md)).
>
> **Estado: DISEÑO. No hay ningún procesador de pago elegido, integrado ni simulado como real.**

---

## 1. Reglas innegociables

Estas no se discuten por conveniencia de un cliente ni por prisa de una demo.

1. **Ninguna credencial secreta en el frontend.** Ni API keys privadas, ni secretos de webhook, ni
   tokens de comercio. Todo lo que llega al navegador es público, aunque esté en una variable de
   entorno, aunque esté ofuscado, aunque el repositorio sea privado.
2. **El frontend nunca toca datos de tarjeta.** Ni número, ni CVV, ni fecha. Sin excepciones. Los
   datos de tarjeta se capturan en un formulario alojado por el procesador (redirección o iframe).
   Capturarlos nosotros nos mete de lleno en el alcance de PCI-DSS.
3. **El importe a cobrar no lo decide el cliente.** El navegador *propone* un pedido; el servidor
   **recalcula** el total desde el catálogo y las reglas vigentes antes de cobrar. Un total que
   viaja desde el navegador es un precio editable por el comprador.
4. **La confirmación de pago llega del procesador, no del navegador.** Un "volví a la página de
   éxito" no es prueba de pago. Solo un webhook verificado o una consulta servidor-a-servidor
   confirma un cobro.
5. **Nunca simular un cobro en modo producción.** Ver
   [DEMO-PRODUCTION.md](../business/DEMO-PRODUCTION.md).
6. **No se inventa un procesador.** Mientras no haya uno elegido y contratado, los métodos online
   no existen en el producto.

---

## 2. Dos familias de pago, con arquitecturas distintas

Meterlas en el mismo saco es el error habitual. Se comportan distinto y tienen requisitos de
seguridad distintos.

| | **Offline / manual** | **Online / procesado** |
|---|---|---|
| Ejemplos | transferencia, efectivo, contra entrega | tarjeta, billetera digital |
| Confirmación | humana, diferida | automática, del procesador |
| Necesita backend | no (con límites, ver §7) | **sí, siempre** |
| Riesgo principal | pedido no pagado | fraude, chargeback, fuga de datos |
| Estado inicial del pedido | `awaiting_payment` | `payment_processing` |
| ¿Disponible hoy? | ✅ sí | ❌ no |

---

## 3. El contrato: `PaymentPort`

```js
/**
 * @typedef {Object} PaymentPort
 *
 * @property {string}  id           'bank-transfer' | 'cash' | 'cash-on-delivery' | ...
 * @property {boolean} isMock
 * @property {'offline'|'online'} family
 * @property {PaymentCapabilities} capabilities
 *
 * @property {(ctx: EligibilityContext) => Eligibility} isEligible
 * @property {(req: InitRequest) => Promise<PaymentIntent>} init
 * @property {(id: string) => Promise<PaymentStatus>}       status
 * @property {(id: string, reason: string) => Promise<PaymentStatus>} cancel
 * @property {((id, amount, reason) => Promise<PaymentStatus>)|null}  refund
 */
```

```js
capabilities = {
  requiresRedirect:   boolean,  // el comprador sale del sitio
  requiresProof:      boolean,  // debe subir comprobante
  instantConfirmation:boolean,
  refundable:         boolean,
  partialRefund:      boolean,
  requiresBackend:    boolean,  // si true y no hay backend → no se ofrece
}
```

### `isEligible` — por qué existe

No todo método sirve para todo pedido. Contra entrega no aplica si el envío es por flota externa
que no cobra; efectivo no aplica si es retiro y la sucursal no maneja caja; transferencia puede
tener mínimo. El core pregunta y el adaptador responde con un motivo legible:

```js
{ eligible: false, reason: 'El pago contra entrega solo está disponible para reparto propio.' }
```

Ese motivo se muestra al comprador. No se ocultan opciones en silencio: un método que desaparece
sin explicación se lee como un error de la tienda.

### `PaymentIntent`

```js
{
  id: string,
  orderId: string,
  amount: Money,              // recalculado por el servidor, no recibido del navegador
  state: PaymentState,
  instructions: Instructions | null,   // para métodos offline
  redirectUrl: string | null,          // para métodos online
  expiresAt: string | null,
}
```

### Estados canónicos de pago

Del core, no del procesador. Cada adaptador mapea los suyos.

```
created ──> awaiting_payment ──> submitted ──> verifying ──> paid
   │              │                                │           │
   │              └──> expired                     └──> failed  └──> refunded
   └──> cancelled                                                    partially_refunded
```

| Estado | Cuándo |
|---|---|
| `created` | Intento generado |
| `awaiting_payment` | Esperando acción del comprador (transferir, pagar al recibir) |
| `submitted` | El comprador declara haber pagado (p. ej. subió comprobante) |
| `verifying` | En verificación (humana en offline, del procesador en online) |
| `paid` | Confirmado. **Solo lo fija el servidor o una verificación humana.** |
| `failed` / `expired` / `cancelled` | Terminal, no pagado |
| `refunded` / `partially_refunded` | Terminal, revertido |

> `submitted` ≠ `paid`. Es la distinción que evita despachar pedidos no cobrados. El pedido no
> avanza a preparación hasta `paid`, salvo que el cliente configure explícitamente lo contrario
> (`payments.releaseOn: submitted`) asumiendo el riesgo — se registra esa elección en su blueprint.

---

## 4. Adaptadores offline (implementables sin procesador)

### 4.1 `bank-transfer` — Transferencia

- `family: offline`, `requiresProof: true`, `instantConfirmation: false`.
- **Nuestro sistema:** mostrar los datos bancarios del cliente, generar referencia única del
  pedido, recibir el comprobante, poner el pedido en `submitted`, dar al operador la UI para
  confirmar o rechazar, notificar al comprador.
- **El comerciante:** verifica en su banco y confirma. **No hay conciliación automática** salvo que
  se integre un servicio bancario — que hoy no existe.
- **Configuración del cliente:** banco, tipo y número de cuenta, titular, identificación fiscal,
  correo de aviso, plazo de expiración, instrucciones en su propio texto.

> **Dato bancario ≠ secreto de aplicación.** Los datos de cuenta para recibir transferencias son
> públicos por naturaleza (se le muestran al comprador). Viven en el contenido del cliente, no en
> variables de entorno. Lo que **sí** es secreto es cualquier credencial de acceso al banco —
> que este sistema no maneja jamás.

### 4.2 `cash` — Efectivo en sucursal

- `family: offline`, `instantConfirmation: false`, `requiresProof: false`.
- Solo elegible con `pickup`. El pedido se paga al retirar.
- **Nuestro sistema:** marcar el pedido como pago pendiente en sucursal; el operador confirma al
  entregar. Opción de configurar si se exige seña.

### 4.3 `cash-on-delivery` — Contra entrega

- `family: offline`. Elegible solo con adaptadores de delivery que acepten cobro
  (`own-delivery`, `manual`). **No** con flota externa que no cobre.
- **Nuestro sistema:** validar elegibilidad contra el método de envío elegido, informar si se
  requiere importe exacto, tope máximo configurable, confirmar al entregar.
- **Riesgo real a advertir al cliente:** es el método con más pedidos no concretados. Conviene
  configurar tope de importe y, si aplica, confirmación previa por WhatsApp.

---

## 5. Adaptador online (tarjeta) · **NO IMPLEMENTADO**

> ⚠️ **No hay procesador elegido. No se describe la API de ninguno porque ninguna ha sido
> consultada. Este apartado define qué necesitaremos, no cómo funciona un proveedor concreto.**

### Flujo obligatorio (hosted / redirect)

```
Navegador          Nuestro backend            Procesador
   │  crear pedido      │                          │
   ├───────────────────►│  recalcula el total      │
   │                    ├─────────────────────────►│  crea intento (clave SECRETA)
   │                    │◄─────────────────────────┤  url de pago
   │◄───────────────────┤                          │
   ├─────────────── el comprador paga ────────────►│
   │                    │◄──── webhook FIRMADO ────┤
   │                    │  verifica firma          │
   │                    │  marca 'paid'            │
   │◄── consulta estado─┤                          │
```

Puntos que no se pueden saltar:

- La clave secreta solo existe en el backend. Nunca viaja al navegador.
- El total lo calcula el backend. El navegador no lo envía.
- La confirmación proviene del webhook con **firma verificada**, no del retorno del comprador.
- **Idempotencia** en creación de intentos y en recepción de webhooks: los procesadores reintentan,
  y un webhook procesado dos veces no puede cobrar ni despachar dos veces.
- Verificación anti-replay: rechazar webhooks con marca de tiempo antigua.

### Endpoints que tendrá que exponer el backend

| Endpoint | Responsabilidad |
|---|---|
| `POST /api/orders` | Valida el carrito, **recalcula precios**, crea el pedido |
| `POST /api/payments/intent` | Crea el intento en el procesador con la clave secreta |
| `GET  /api/payments/:id` | Estado autoritativo del pago |
| `POST /api/webhooks/payment/:provider` | Recibe eventos, **verifica firma**, actualiza estado |
| `POST /api/payments/:id/refund` | Reembolso, con autorización |

### Qué averiguar antes de elegir procesador

Comisión y liquidación · países y monedas · métodos locales soportados · requisitos legales del
comercio · modalidad de integración (hosted vs iframe) · fiabilidad y reintento de webhooks ·
entorno de pruebas · reglas de reembolso y contracargo · quién asume el fraude.

Cuando se elija, se registra en [DECISIONS.md](DECISIONS.md) con el motivo y los descartados.

---

## 6. Mock (solo demo)

`payment/mock` simula el flujo completo con `isMock: true`. Requisitos:

- Todo importe y estado de pago mostrado en demo se etiqueta visiblemente como simulado.
- **El build de producción falla** si un adaptador de pago resuelto tiene `isMock: true`.
- El mock nunca imita la marca visual de un procesador real.

---

## 7. Restricción del stack actual

Hoy el proyecto es una SPA estática sin backend. Consecuencia directa:

| Método | ¿Hoy? |
|---|---|
| Transferencia (mostrar datos + instrucciones) | ✅ sí |
| Transferencia con recepción de comprobante | ⚠️ requiere almacenamiento y panel |
| Efectivo en sucursal | ⚠️ requiere persistencia de pedidos |
| Contra entrega | ⚠️ requiere persistencia de pedidos |
| Tarjeta | ❌ **imposible sin backend** |

Además, **sin backend no hay pedidos persistentes**: un pedido que solo existe en el navegador del
comprador no es un pedido. Incluso el flujo más simple (transferencia) necesita que el comercio
reciba y conserve el pedido en algún lado.

**Ruta más barata para el MVP**, sin bloquear el diseño de arriba: pedido por WhatsApp con
pago por transferencia fuera de línea. El core genera el pedido, el módulo `whatsapp` lo entrega al
comerciante, el pago se acuerda fuera del sistema. Funciona sin backend, es honesto sobre lo que
hace, y no requiere reconstruir nada cuando llegue el backend — solo activar otro adaptador.

**Decidir el backend es prerrequisito de vender en línea de verdad.** Registrado como PROP-0006.

---

## 8. Lista de verificación de seguridad

Antes de habilitar cualquier método de pago en un cliente real:

- [ ] Ninguna clave secreta en `src/`, `clients/`, `.env` versionado, ni en el bundle.
- [ ] `.gitignore` cubre `.env*` excepto `.env.example`.
- [ ] El total se recalcula en el servidor antes de cobrar.
- [ ] Las firmas de webhook se verifican; los eventos son idempotentes.
- [ ] HTTPS obligatorio en todo el flujo.
- [ ] Ningún dato de tarjeta atraviesa nuestro código, ni siquiera de paso.
- [ ] Ningún dato de pago en logs, analítica ni mensajes de error.
- [ ] Los comprobantes subidos no son públicamente accesibles por URL adivinable.
- [ ] El acceso a confirmar pagos está restringido por rol
      (ver [TIERS.md](../business/TIERS.md)).
- [ ] `mode: production` y `isMock: true` es un fallo de build verificado.
