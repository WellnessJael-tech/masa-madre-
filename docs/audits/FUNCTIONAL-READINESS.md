# Functional Readiness — Masa Madre

> Auditoría final antes de cerrar la fase de base funcional (previa a diseño externo). Clasifica
> cada capacidad, no cada archivo. Verificado contra el repositorio real el 2026-09-16, no contra
> documentación antigua.

**Leyenda:** `PROBADO` (test automatizado real, unitario o e2e) · `PROBADO MEDIANTE SIMULACIÓN`
(funciona, pero sobre un adaptador `isMock: true`, ej. el pago) · `BLOQUEADO POR DEPENDENCIA
EXTERNA` (requiere una decisión o infraestructura que no tenemos, ej. backend) · `NO IMPLEMENTADO` ·
`REQUIERE MEJORA` (funciona, con una limitación conocida) · `REQUIERE BACKEND`.

---

## Catálogo

| Capacidad | Estado | Evidencia |
|---|---|---|
| Listado de productos por categoría | PROBADO | `e2e/theme-derivation.spec.js`, `e2e/product-detail.spec.js` |
| Búsqueda por nombre | PROBADO | `e2e/search-delivery.spec.js` |
| Página de producto individual (galería, descripción, cantidad) | PROBADO | `e2e/product-detail.spec.js` (5 casos) |
| Aviso de stock bajo / sin stock | PROBADO | `core/catalog/stockStatus.test.js` + e2e |
| Filtros por precio/atributos | NO IMPLEMENTADO | — |
| Productos destacados | NO IMPLEMENTADO | — |
| Reseñas | NO IMPLEMENTADO | Sección reservada y vacía en `ProductDetailPage` |

## Carrito y checkout

| Capacidad | Estado | Evidencia |
|---|---|---|
| Agregar/quitar, cambiar cantidad respetando stock | PROBADO | `e2e/checkout-flow.spec.js` |
| Cálculo de totales | PROBADO | `e2e/search-delivery.spec.js` (con tarifa de entrega sumada) |
| Datos de contacto obligatorios | PROBADO | `e2e/checkout-contact.spec.js` |
| Pago | PROBADO MEDIANTE SIMULACIÓN | Único adaptador es `payment/mock`; guardarraíl que impide que llegue a producción probado en `mode.test.js` |
| Pago real (tarjeta u otro) | BLOQUEADO POR DEPENDENCIA EXTERNA | Requiere backend + elegir procesador (PROP-0006, sin decidir) |
| Persistencia del pedido tras confirmar | NO IMPLEMENTADO | Requiere backend |
| Checkout multi-paso | NO IMPLEMENTADO | Es un solo paso; `features.checkout.steps` declarado sin consumidor |

## Delivery

| Capacidad | Estado | Evidencia |
|---|---|---|
| Retiro en sucursal (pickup) | PROBADO | `adapters/delivery/pickup/adapter.test.js` + `e2e/search-delivery.spec.js` |
| Envío a zona fija con tarifa | PROBADO | `adapters/delivery/own-delivery/adapter.test.js` + e2e |
| Envío gratis sobre un umbral | PROBADO | `e2e/footer.spec.js`, `e2e/search-delivery.spec.js` |
| Selección de dirección / mapa / geocodificación | NO IMPLEMENTADO | Deliberado — fuera de alcance ("básico") |
| Flota externa (ej. Uber Direct) | BLOQUEADO POR DEPENDENCIA EXTERNA | Requiere backend + contrato con el proveedor |

## Módulos

| Capacidad | Estado | Evidencia |
|---|---|---|
| Activar/desactivar módulos por cliente | PROBADO | `e2e/modules.spec.js` (whatsapp activo en `demo`, apagado en `demo-medical`) |
| Dependencia real entre dos módulos (`requires`) | PROBADO | `npm run validate` con un cliente temporal en ambas direcciones (ver ADR-0023) — verificado como fallo de arranque, no con Playwright, porque es exactamente eso: un fallo de arranque |
| Capacidades (`provides`/consumo entre módulos) | NO IMPLEMENTADO | Los módulos declaran `provides`; nada lo consume todavía |
| Admin de catálogo (alta/edición/baja) | PROBADO | `e2e/admin-catalog.spec.js` |
| Carga masiva (CSV) | PROBADO | `e2e/bulk-import.spec.js` |
| Admin en producción real | BLOQUEADO POR DEPENDENCIA EXTERNA | El API de escritura es `apply: 'serve'` — no existe en un build de producción (ver ADR-0021) |

## Reutilización (Fase 4 de este ciclo)

| Capacidad | Estado | Evidencia |
|---|---|---|
| Dos clientes, mismo core, cero diferencias en `src/core/`, `src/modules/`, `src/adapters/` | PROBADO | `git diff` entre bloques de `demo`/`demo-medical`; `e2e/theme-derivation.spec.js` |
| Cambio de identidad visual completo sin tocar componentes | PROBADO | Theme `demo-medical` (8 líneas de CSS) vs. `_base` |
| Cero colores hardcodeados en `core/`/`modules/` | PROBADO | Auditoría por búsqueda de texto, ADR-0023 |
| Cero texto de cliente hardcodeado en componentes genéricos | PROBADO (tras corrección) | 2 hallazgos críticos encontrados y corregidos: `index.html` title, `HomePage.jsx` — ver ADR-0023 |
| Regla de capas (`core` no importa `modules`) forzada por herramienta | NO IMPLEMENTADO | Se sostiene por disciplina/revisión manual; `eslint-plugin-boundaries` sigue sin instalar (PROP-0010) |

## Infraestructura y calidad

| Capacidad | Estado | Evidencia |
|---|---|---|
| Validación de blueprint (esquema, referencias cruzadas) | PROBADO | `core/config/blueprint/validate.test.js`, `npm run validate` |
| Guardarraíl demo/producción (ningún mock en producción) | PROBADO | `core/config/mode.test.js` + verificación con cliente temporal |
| Suite unitaria | PROBADO | 88/88, `npm test` |
| Suite end-to-end | PROBADO | 54/54 (27 casos × Desktop/Mobile), `npx playwright test` |
| Build de producción | PROBADO | `npm run build`, limpio para ambos clientes |
| Backend real | BLOQUEADO POR DEPENDENCIA EXTERNA | Decisión de negocio pendiente (PROP-0006) — bloquea pago real, persistencia de pedidos, admin en producción |
| Analítica | NO IMPLEMENTADO | `analytics.adapter` existe en el esquema, ningún adaptador construido |
| SEO dinámico (meta tags, sitemap) | NO IMPLEMENTADO | `blueprintSchema.seo` existe, sin consumidor |

---

## Lectura rápida para decidir el próximo paso

**Lo que ya se puede vender como demo comercial hoy:** navegar el catálogo, buscar, ver el detalle
de un producto, armar un carrito, elegir entrega (pickup o zona), pagar (simulado, marcado como
tal), y administrar el catálogo en desarrollo local. Es una demo honesta de la experiencia
completa de compra.

**Lo único que bloquea convertir esto en un negocio real, no en más funcionalidad:** la decisión de
backend (PROP-0006). Sin eso, no hay pago real, no hay pedidos persistentes, y el admin de catálogo
no funciona publicado. Todo lo demás documentado como `NO IMPLEMENTADO` es funcionalidad adicional,
no un bloqueo — se puede seguir agregando después de tener el primer cliente real.
