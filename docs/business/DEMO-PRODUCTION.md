# Demo vs Producción

> **Responde a:** ¿qué datos son simulados, cómo se distinguen a simple vista, y cómo se garantiza
> que un mock nunca llegue a una tienda real?
>
> **Estado: DISEÑO. No implementado.**

---

## 1. El riesgo real

Una demo tiene que enseñar el producto completo antes de que existan las integraciones. Eso obliga
a mostrar pedidos, pagos, entregas y métricas que no son reales.

El peligro no es técnico, es de confianza:

- Un cliente ve "247 pedidos este mes" y cree que su tienda ya vende.
- Un comprador real recibe una confirmación de pago que nunca ocurrió.
- Alguien toma una decisión de negocio sobre un gráfico inventado.

La arquitectura tiene que hacer que estas tres cosas sean **difíciles de provocar por accidente**,
no solo desaconsejadas.

---

## 2. Dos modos, una sola UI

```
                    ┌───────────────┐
                    │   UI / CORE   │   ← idéntica en ambos modos
                    └───────┬───────┘
                            │  habla solo con PUERTOS
                    ┌───────▼───────┐
                    │    PUERTOS    │
                    └───┬───────┬───┘
              mode=demo │       │ mode=production
                ┌───────▼──┐  ┌─▼──────────┐
                │  MOCKS   │  │ ADAPTADORES│
                │isMock:true│ │   REALES   │
                └──────────┘  └────────────┘
```

**El modo solo cambia qué adaptador se resuelve.** Ni un `if (isDemo)` en un componente. Si un
componente necesita saber el modo, es que la diferencia se filtró a la capa equivocada — la única
excepción legítima es el marcado visual (§4), que se hace en el shell, no en los componentes.

Consecuencia buscada: conectar un proveedor real **no reconstruye la UI**. Cambia una línea del
blueprint.

---

## 3. Resolución del modo

```
VITE_MODE = demo | production
```

Reglas:

| Situación | Resultado |
|---|---|
| `VITE_MODE` ausente | **`demo`**. El default seguro es el que no puede engañar a nadie. |
| Valor no reconocido | error de build |
| `production` + algún adaptador resuelto con `isMock: true` | **error de build** |
| `production` + `assets.approved: false` | error de build |
| `production` + `status != live` | advertencia + `robots: disallow` forzado |

El modo queda registrado en el manifiesto de build y es visible en el panel de administración.

> **La validación clave es la tercera.** Es lo que convierte "no publicar mocks" de una intención
> a una garantía: un build de producción con un mock dentro **no compila**.

---

## 4. Marcado visual de lo simulado

Obligatorio en `demo`, en tres niveles:

1. **Banner global** — franja persistente y **no descartable**: *"MODO DEMO — datos simulados"*.
   No se puede cerrar; si se pudiera, alguien tomaría una captura sin ella.
2. **Etiqueta por superficie** — cada bloque alimentado por un mock lleva un distintivo
   `DEMO` junto al dato: métricas, estado de pago, seguimiento de envío, stock.
3. **Texto acompañante** — donde el dato podría confundirse con una cifra de negocio real
   (paneles, informes), una línea explícita: *"Cifras de ejemplo. No corresponden a ventas reales."*

Requisitos del marcado:

- Debe sobrevivir a una **captura de pantalla**. Un tooltip no sirve: lo que circula por WhatsApp
  es la captura.
- Debe cumplir contraste AA sobre cualquier theme (los themes de cliente **no pueden** ocultarlo:
  el banner usa tokens propios que un theme no puede sobrescribir).
- Debe imprimirse. Nada de `@media print { display: none }`.
- Los correos y mensajes generados en demo llevan `[DEMO]` en el asunto y **no se envían a
  direcciones reales del cliente**.

---

## 5. Qué se simula y qué no

| Dominio | En demo | Marcado |
|---|---|---|
| Catálogo y productos | datos de ejemplo | "Catálogo de demostración" |
| Carrito y checkout | reales (lógica de core, sin cobro) | — |
| Pago | mock: siempre "aprobado" tras un retardo | etiqueta en cada estado |
| Delivery | mock: cotizaciones y estados plausibles | etiqueta en cotización y seguimiento |
| Pedidos | persisten solo en el navegador | "Los pedidos de demo no se conservan" |
| Métricas | series generadas | banner + texto explícito |
| WhatsApp | abre el chat con texto real, sin enviar nada | — |
| Correo / notificaciones | no se envían; se muestran en pantalla | "Este correo no fue enviado" |
| Analítica | no se rastrea nada | — |

**Nunca se simula:** el cálculo de precios, las reglas de promoción, las restricciones de stock ni
la validación del checkout. Esa lógica es del core y debe comportarse igual en ambos modos — si en
demo se simplifica, la demo deja de demostrar el producto.

### Los datos de ejemplo no pueden parecerse a los reales

- Nombres de productos genéricos y evidentemente de muestra.
- Cifras que no puedan confundirse con las del cliente.
- Nunca la marca, los precios ni las fotos reales del cliente en superficies simuladas.
- Los datos de ejemplo viven en `src/adapters/*/mock/fixtures/`, no en `clients/`.

---

## 6. Contrato de un adaptador mock

```js
export const mockDeliveryAdapter = {
  id: 'delivery-mock',
  isMock: true,              // ← OBLIGATORIO. Sin esto, el guardarraíl de build no funciona.
  capabilities: { /* mismas que un adaptador real */ },
  async quote(req) { /* respuesta plausible, con retardo realista */ },
}
```

Requisitos:

- `isMock: true` **siempre presente**. Un mock sin esa marca es un defecto grave.
- Implementa el puerto **completo**, incluidos los fallos: si un adaptador real puede agotar el
  tiempo o devolver "fuera de cobertura", el mock también debe poder hacerlo. Un mock que solo
  tiene el camino feliz produce una UI que no sabe manejar errores.
- Retardos realistas. Una respuesta instantánea enseña una experiencia que no existirá.
- Determinista cuando importe (misma entrada → misma salida), para que la demo sea repetible.
- **Nunca** imita la marca visual de un proveedor real.

---

## 7. Pasar un cliente a producción

- [ ] Todos los adaptadores mock reemplazados por reales o desactivados.
- [ ] `VITE_MODE=production` y el build compila (el guardarraíl de mocks pasa).
- [ ] Datos de ejemplo eliminados; catálogo real cargado y revisado.
- [ ] Datos bancarios verificados **contra el original entregado por el cliente**.
- [ ] Zonas y tarifas de envío confirmadas por el cliente.
- [ ] Ningún texto con "demo", "ejemplo", "lorem" en el contenido publicado.
- [ ] `status: live`, `robots: allow`, sitemap generado.
- [ ] `assets.approved: true` y sin restricciones de uso vencidas.
- [ ] Analítica con consentimiento configurado.
- [ ] Un pedido de prueba de principio a fin, en un móvil real.
- [ ] Criterios de aceptación del `BRIEF.md` verificados uno por uno.
- [ ] Manifiesto de build registrado (ver [VERSIONING.md](../architecture/VERSIONING.md)).
