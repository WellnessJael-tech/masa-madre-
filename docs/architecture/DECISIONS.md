# Registro de decisiones arquitectónicas

> **Responde a:** ¿por qué el sistema es así, qué se descartó, y qué está pendiente de aprobar?
>
> Las decisiones se registran aquí. No se asumen recordadas de una conversación anterior.

---

## Cómo usar este archivo

**Tres estados, tres prefijos:**

| Prefijo | Estado | Significado |
|---|---|---|
| `ADR-nnnn` | Aceptada | Decidida y vigente. Se puede construir sobre ella. |
| `PROP-nnnn` | **Pendiente** | Propuesta. **No se implementa hasta aprobación explícita.** |
| `D-nn` | Defecto | Problema detectado en el repositorio. No es una decisión, es deuda. |

Numeración correlativa, nunca reutilizada. Una decisión revertida se marca `Reemplazada por
ADR-nnnn` — **no se borra**: el registro de lo que se intentó y no funcionó vale tanto como el de
lo que quedó.

### Plantilla de entrada

```markdown
### ADR-nnnn — <Título en una línea>

- **Fecha:** YYYY-MM-DD
- **Estado:** Aceptada | Pendiente | Rechazada | Reemplazada por ADR-nnnn
- **Ámbito:** core | módulos | themes | clientes | pagos | delivery | negocio | tooling

**Contexto.** Qué situación obliga a decidir. Hechos, no opiniones.

**Decisión.** Qué se hace. En presente y en afirmativo.

**Motivo.** Por qué esta y no otra.

**Alternativas descartadas.**
| Alternativa | Por qué no |
|---|---|

**Impacto.** Qué código, documentos o clientes se ven afectados. Qué cuesta revertirla.

**Revisar cuando.** La señal concreta que obligaría a reabrir esta decisión.
```

---

# Pendientes de aprobación

> Todo lo de esta sección está **documentado pero NO implementado**. Requiere tu aprobación
> explícita. Las propuestas marcadas 🔴 bloquean trabajo del Bloque 1.

### PROP-0001 — No todo es un módulo: reclasificar el catálogo de funcionalidades 🔴

- **Fecha:** 2026-09-01 · **Estado:** Pendiente · **Ámbito:** módulos

**Qué proponías.** Un catálogo de ~26 módulos activables: catalog, filters, search, cart, checkout,
payment methods, whatsapp, promotions, discounts, coupons, flash sales, carousels, banners,
branches, delivery, delivery zones, shipping rules, seasonal, seo, analytics, marketing components,
landing sections, admin, bulk import, media, reporting.

**Qué propongo.** Repartirlos en cinco categorías con mecanismos de control distintos: CORE-fijo,
CORE-configurable, MODULE, PORT+ADAPTER, SLOT/CONTENT. Detalle en
[MODULES.md §2–3](../modules/MODULES.md).

**Por qué es mejor.**
- Carrito, catálogo y checkout no son opcionales: una tienda sin ellos no es una tienda. Modelarlos
  como activables crea rutas de fallo que nunca se ejercitan.
- Los métodos de pago y envío deben poder **coexistir y compararse** en el checkout. Un booleano
  on/off no expresa eso; un puerto con varios adaptadores sí.
- Carruseles y banners son presentación: activarlos por config sería configurar la existencia de un
  `<div>`.
- El SEO es transversal; desactivarlo degradaría todas las páginas y nadie lo haría nunca.
- `discounts` queda absorbido por `promotions` (un descuento es una regla de promoción); mantenerlos
  separados duplica el motor de reglas.
- Cada categoría tiene un dueño de permisos distinto, y eso es lo que hace posible
  [TIERS.md](../business/TIERS.md).

**Impacto.** Menos superficie de registro, menos configuración por cliente, menos código.
Ninguna funcionalidad de la lista desaparece — cambia cómo se controla.

**Revisar cuando.** Un cliente pida desactivar algo clasificado como CORE-fijo.

---

### PROP-0002 — Separar el blueprint en `BRIEF.md` (humano) y `blueprint.yaml` (máquina) 🔴

- **Fecha:** 2026-09-01 · **Estado:** Pendiente · **Ámbito:** clientes

**Qué proponías.** Un documento único que sirva como entrevista al cliente **y** como configuración
técnica.

**Qué propongo.** Dos archivos con relación explícita: `BRIEF.md` (prosa, entrevista, alcance
comercial) → del que se **deriva** `blueprint.yaml` (validable por máquina). Cada sección del brief
declara qué campos alimenta.

**Por qué es mejor.** El doble uso es real, pero los lectores son incompatibles: un archivo único
obliga a que el humano rellene estructuras de datos o a que el código interprete prosa. Además,
solo un formato validable permite cumplir promesas verificables al cliente: *"ningún color
prohibido aparece en tu tienda"* y *"todo texto cumple contraste AA"* se comprueban en build.

**Riesgo asumido.** Los dos archivos pueden desincronizarse. Se mitiga con la regla de derivación
(el brief se llena primero) y con las referencias cruzadas sección→campo.

**Impacto.** Dos archivos por cliente en vez de uno. El brief se puede compartir con el cliente sin
enseñarle YAML.

> **Implementada el 2026-09-02** al construir el Blueprint Loader. Ver
> [ADR-0002](#adr-0002--blueprint-dividido-en-briefmd--blueprintyaml).

---

### PROP-0003 — Composición en build, un despliegue por cliente 🔴

- **Fecha:** 2026-09-01 · **Estado:** Pendiente · **Ámbito:** core

**Qué proponías.** No estaba especificado.

**Qué propongo.** Un repositorio, un core, y **un build por cliente** seleccionado con
`VITE_CLIENT=<slug>`. Sin resolución de tenant en runtime.

**Por qué es mejor.** Aislamiento real: un blueprint mal formado rompe **un** build, no todas las
tiendas. Sin backend obligatorio. Sin superficie de fuga entre clientes. Los bundles solo contienen
los módulos activos de ese cliente.

**Coste.** N despliegues que gestionar. Aceptable con pocos clientes; se automatiza con CI cuando
duela (ver [VERSIONING.md §10](VERSIONING.md#10-cuándo-cambiar-de-enfoque)).

**Impacto.** La capa de composición está diseñada para que migrar a multi-tenant en runtime más
adelante cambie *cuándo* se resuelve el cliente, no *cómo*.

---

> `PROP-0004` y `PROP-0005` fueron **aprobadas el 2026-09-01**. Ver
> [ADR-0004](#adr-0004--yaml-como-formato-del-blueprint) y
> [ADR-0005](#adr-0005--estructura-completa-declarada-en-claudemd) en Decisiones aceptadas.

---

### PROP-0006 — Decidir el backend es prerrequisito de vender en línea 🔴

- **Fecha:** 2026-09-01 · **Estado:** Pendiente · **Ámbito:** pagos, delivery

**Hecho, no opinión.** El proyecto es hoy una SPA estática sin servidor. Eso impide, por
construcción y no por falta de código:

- Cobrar con tarjeta (las claves secretas y el recálculo del total exigen servidor).
- Recibir webhooks de cualquier proveedor (no hay endpoint público que los reciba).
- Persistir pedidos (un pedido que solo existe en el navegador del comprador no es un pedido).
- Integrar flota externa tipo Uber Direct.
- Verificar permisos de administración de forma segura (`can()` en el frontend es UX, no seguridad).

**Qué propongo.** Tratarlo como una decisión explícita y agendada, no como algo que aparecerá solo.
Dos caminos:

| Camino | Qué habilita | Coste |
|---|---|---|
| **Sin backend** (MVP honesto) | Catálogo, carrito, pedido por WhatsApp, pago por transferencia fuera de línea | ninguno; funciona hoy |
| **Con backend / BaaS** | Todo lo anterior + tarjeta, pedidos persistentes, panel real, webhooks | elección de plataforma + trabajo de servidor |

**Recomendación.** Construir los Bloques 1–3 sin backend (el core no cambia) y decidir la
plataforma antes del bloque de Administración, que es el primero que lo necesita de verdad.

---

> **PROP-0007 cerrada el 2026-09-01.** Ver
> [ADR-0007](#adr-0007--contrato-de-tokens-en-themes_base) en Decisiones aceptadas.
> El bloque de abajo se conserva como registro de la propuesta original.

### PROP-0007 — Contrato de tokens de theme: crear `themes/_base` ✅

- **Fecha:** 2026-09-01 · **Estado:** Aceptada e implementada · **Ámbito:** themes

**Contexto.** *Parcialmente resuelto el 2026-09-01 al corregir D-02 y D-03:* `src/index.css` ya
contiene el contrato de tokens de shadcn (zinc, `oklch`, `@theme inline`, variante `.dark`) sobre
una base mobile-first. El Button ya resuelve sus utilidades.

**Lo que sigue pendiente.** Dos cosas:

1. **Trasladar** ese bloque de `src/index.css` a `src/themes/_base/theme.css`, para que exista la
   capa de themes y un cliente pueda sobrescribir valores sin tocar la hoja global.
2. **Añadir los tokens de extensión Masa Madre** (`--font-heading`, `--density`, `--card-style`,
   `--shadow-card`, `--price-color`, `--badge-*`, `--decoration-*`, ver
   [ARCHITECTURE.md §6](ARCHITECTURE.md#6-sistema-de-diseño-y-themes)). Deliberadamente **no** se
   añadieron ahora: sin ningún componente que los consuma serían tokens muertos. Entran junto con
   los componentes que los usen.

**Regla que se activa con esto.** Prohibido cualquier color literal en `src/core/`, `src/modules/`
y `src/components/ui/`. Solo utilidades semánticas.

---

### PROP-0008 — El tier controla el admin, nunca el storefront

- **Fecha:** 2026-09-01 · **Estado:** Pendiente · **Ámbito:** negocio

**Qué proponías.** Tiers MANAGED y OWNERSHIP como configuración, con una matriz `MODULE_ACCESS`.
De acuerdo con ambas cosas.

**Qué añado.** Una regla que no estaba explícita: el tier **nunca** quita funcionalidad a la tienda,
solo autonomía en el panel. Un cliente MANAGED puede tener todos los módulos; simplemente los
configuramos nosotros.

**Por qué importa.** Sin esta regla, el tier acaba filtrándose al storefront (`if (tier ===
'premium')` dentro de un componente de producto) y el core deja de ser independiente del cliente.
Además separa dos ejes de precio que conviene no mezclar: *qué hace la tienda* y *quién la
administra*.

**Consecuencia comercial a validar contigo.** OWNERSHIP exige construir guardarraíles de validación,
registro de cambios y reversión de contenido. Sin ellos genera más soporte que MANAGED. Hay que
presupuestarlo dentro del tier.

---

### PROP-0009 — Elegir estrategia de estado para carrito y checkout

- **Fecha:** 2026-09-01 · **Estado:** Pendiente · **Ámbito:** core

**Contexto.** No hay ninguna librería de estado instalada. El carrito necesita estado global,
persistencia entre recargas y ser consumible desde módulos sin acoplarlos.

**Opciones.** Context + `useReducer` (cero dependencias, suficiente para un carrito, más
repetitivo) · Zustand (una dependencia pequeña, API mínima, buena para consumo desde módulos).

**Recomendación.** Empezar con Context + reducer en `core/commerce`, exponiendo una **API pública
estable** (`useCart()`). Si luego cambia la implementación, los módulos no se enteran. Decidir al
inicio del Bloque 3 (E-commerce), no antes.

---

### PROP-0010 — Mecanizar la regla de fronteras con ESLint

- **Fecha:** 2026-09-01 · **Estado:** Pendiente · **Ámbito:** tooling

**Qué propongo.** `eslint-plugin-boundaries` configurado con la tabla de importaciones permitidas de
[ARCHITECTURE.md §3](ARCHITECTURE.md#tabla-de-importaciones-permitidas).

**Por qué.** "El core no importa módulos" es la regla que sostiene toda la arquitectura, y hoy solo
la garantiza la revisión humana. Una regla de lint la convierte en un error de build. Es la
inversión de tooling con mejor relación coste/beneficio del proyecto.

**Cuándo.** En cuanto exista la primera carpeta de módulo — no antes, porque no habría nada que
verificar.

---

### PROP-0011 — Contratos con JSDoc en vez de migrar a TypeScript

- **Fecha:** 2026-09-01 · **Estado:** Pendiente · **Ámbito:** tooling

**Contexto.** Los puertos (`PaymentPort`, `DeliveryPort`) son contratos: es donde más aportaría el
tipado. El repo está en JS con `jsconfig.json` y shadcn configurado con `tsx: false`.

**Qué propongo.** No migrar. Expresar los contratos con JSDoc `@typedef` y activar `checkJs` en
`jsconfig.json`. Da autocompletado y verificación en el editor con cero migración.

**Revisar cuando.** El equipo crezca, o los errores de tipo en runtime se vuelvan recurrentes.

---

### PROP-0012 — Nivel comercial (`V1`–`V4`) y tier son dos ejes distintos 🔴

- **Fecha:** 2026-10-15 · **Estado:** Pendiente · **Ámbito:** blueprint, negocio

**Contexto.** El *Contexto Maestro EWB* introduce niveles `V1`–`V4` con "calificación forzada de
planes": límites técnicos de catálogo, empleados y transacciones mensuales, para impedir que una
empresa grande contrate un plan básico. El repo ya tiene `commercial.tier`
(`managed` | `ownership`), y [TIERS.md §1](../business/TIERS.md) establece que el tier controla el
**panel de administración, nunca la tienda**.

**El conflicto.** Si `V1`–`V4` se mapea sobre `tier`, se rompe la regla fundacional de TIERS.md: los
niveles limitan *capacidad y volumen* (storefront), el tier limita *autonomía* (admin). Colapsarlos
obliga a que un componente de catálogo sepa qué pagó el cliente — exactamente el fallo que TIERS.md
existe para prevenir. Y hace imposible razonar sobre el precio: un cliente puede querer mucho
volumen con cero autonomía, o lo contrario.

**Qué propongo.** Dos campos ortogonales en `blueprint.yaml`:

```yaml
commercial:
  tier: managed          # EJE AUTONOMÍA: quién administra. Afecta SOLO al admin.
  level: V2              # EJE CAPACIDAD: límites de volumen. Afecta validación, no componentes.
  limits:                # derivados de level, materializados para que sean auditables
    catalogItems: 200
    adminUsers: 2
    monthlyTransactions: 500
```

Y una regla dura equivalente a la de TIERS.md:

> **`level` se verifica en `masa validate` y en el panel. Jamás se lee desde un componente del
> storefront.** Ningún `if (level === 'V3')` dentro de `core/`, `modules/` o `components/ui/`.

La "calificación forzada" queda como una comprobación del validador: si el contenido del cliente
excede el límite de su nivel, `masa validate` falla con un mensaje accionable y no se despliega. Es
un guardarraíl de build, no lógica de aplicación.

**Por qué así.** Mantiene una sola base de código, hace el límite auditable en CI, y conserva la
separación que ya está probada. Además convierte el argumento de venta en un hecho verificable: el
build no sale si el cliente excede lo contratado.

**Pendiente de decidir.** Los valores concretos de cada nivel. No los invento: son una decisión
comercial, no técnica.

---

### PROP-0013 — El stack del *Contexto Maestro* contradice el motor existente 🔴

- **Fecha:** 2026-10-15 · **Estado:** Pendiente · **Ámbito:** stack, estrategia

**Contexto.** El *Contexto Maestro EWB* describe Masa Madre como un motor que "compila la base de
datos, el ERP y la web del cliente en minutos" sobre **Next.js + TypeScript + Fastify**. El repo
real es **Vite + React 19 + JavaScript**, composición en build (ADR-0003), sin backend
(PROP-0006 sin resolver), con JSDoc en vez de TypeScript (PROP-0011) y ~5.600 líneas funcionales
verificadas en [FUNCTIONAL-READINESS.md](../audits/FUNCTIONAL-READINESS.md).

**El conflicto.** No es una diferencia de preferencia: migrar a Next.js significa reescribir el
cargador de blueprints, el registro de módulos basado en `import.meta.glob`, el descubrimiento de
adaptadores, la secuencia de arranque y los 8 ADR que los sostienen. Es tirar el motor que ya
funciona para reconstruirlo con otro nombre.

**Qué propongo.** Separar dos afirmaciones que el documento maestro mezcla:

| Afirmación del documento | Realidad del repo | Resolución propuesta |
|---|---|---|
| "Genera webs de cliente" | ✅ es exactamente lo que hace | Mantener Vite/React/JS. No migrar. |
| "Genera la base de datos y el ERP" | ❌ no existe, ni está diseñado | El ERP es **otro producto, otro repo**, otro stack (TS + Fastify + PostgreSQL). No es una salida de Masa Madre. |

Masa Madre es un **compositor de storefronts**, no un generador de sistemas. Es más estrecho que lo
que dice el documento maestro, y esa estrechez es la razón de que funcione. Un motor que genera
"cualquier cosa" no genera nada bien.

**Consecuencia si se acepta.** El *Contexto Maestro* se corrige: Masa Madre `[MM]` y Titanium ERP
`[ERP]` son pilares **hermanos**, no uno contenido en el otro. Se integran por API cuando exista
backend, no por generación de código.

**Consecuencia si se rechaza** (es decir, si se migra a Next.js): el repo actual se descarta casi
por completo. Esa decisión es legítima, pero debe tomarse con el costo a la vista, no por inercia
de un documento de visión.

---

# Deuda de arranque detectada

> Defectos reales del repositorio detectados el 2026-09-01. No son decisiones: son cosas que hay
> que arreglar. **D-01 a D-04 corregidos el 2026-09-01.**

| id | Defecto | Estado |
|---|---|---|
| **D-01** | `class-variance-authority`, `clsx` y `tailwind-merge` no estaban instalados, pero los importan `button.jsx` y `lib/utils.js` — **el build fallaba** | ✅ **resuelto** — las tres instaladas; build verificado importando `Button` (117 módulos resueltos) |
| **D-02** | `src/index.css` no definía ningún token de shadcn | ✅ **resuelto** — contrato completo (zinc, oklch) + bloque `@theme inline` + variante `.dark`. Verificado en el CSS emitido. Su **traslado** a `themes/_base/theme.css` sigue pendiente (PROP-0007) |
| **D-03** | `src/index.css` fijaba `#root { width: 1126px; text-align: center; border-inline }` | ✅ **resuelto** — base mobile-first sin anchos fijos ni centrado forzado; añadido `prefers-reduced-motion` |
| **D-04** | La skill principal era `SKILL.mb` (extensión `.mb`), así que Claude Code no la cargaba | ✅ **resuelto** — renombrada a `SKILL.md`; la skill ya se registra |
| **D-05** | `package.json` se llamaba `"temp-app"` | ✅ **resuelto** — renombrado a `masa-madre`. También `index.html`: `<title>` y `lang="es"` (ambos pasarán a derivarse del blueprint) |
| **D-06** | `src/App.jsx` y `src/App.css` eran la plantilla de Vite | ✅ **resuelto** — eliminados junto con sus recursos huérfanos (`src/assets/` completo y `public/icons.svg`). `main.jsx` monta un marcador temporal con JSX en línea; `public/favicon.svg` se conserva |
| **D-07** | No había router instalado | ✅ **resuelto** — `react-router` v8 en modo declarativo. Ver ADR-0013 |
| **D-08** | Playwright no estaba conectado a ningún test real (los binarios estaban descargados desde el setup inicial, pero sin `@playwright/test` en `package.json` ni configuración) | ✅ **resuelto** — `playwright.config.js` + `e2e/checkout-flow.spec.js`. Reemplaza las verificaciones SSR manuales para carrito/checkout. Ver ADR-0018 |
| **D-09** | `lucide-react` no está instalado (iconos por defecto de shadcn) | pendiente — instalar con el primer componente que lo necesite |
| **D-10** | `npm run lint` fallaba con 3 errores preexistentes en `button.jsx` y `vite.config.js` | ✅ **resuelto** — ver ADR-0012. `npx eslint .` da 0 errores y 0 warnings |
| **D-11** | Vite 8 avisaba de que `__dirname` en `vite.config.js` no es compatible con el cargador de config nativo | ✅ **resuelto** — `import.meta.dirname` (Node 24 en este entorno; disponible desde 20.11). El aviso desapareció del build |

> **Aviso para sesiones futuras:** los avisos de VSCode sobre `@theme`, `@apply` y
> `@custom-variant` en `src/index.css` son del validador CSS nativo del editor, que no conoce las
> at-rules de Tailwind v4. No son errores y el build no se ve afectado.

---

# Decisiones aceptadas

### ADR-0004 — YAML como formato del blueprint

- **Fecha:** 2026-09-01 · **Estado:** Aceptada · **Ámbito:** clientes, tooling

**Contexto.** El blueprint necesita comentarios ("este mínimo es porque el cliente pidió X",
"pendiente de confirmar"), textos multilínea, y ser legible por alguien no técnico. JSON no admite
comentarios.

**Decisión.** `clients/<slug>/blueprint.yaml` en YAML.

**Alternativas descartadas.**
| Alternativa | Por qué no |
|---|---|
| JSON | Cero dependencias, pero sin comentarios y con más ruido sintáctico. El blueprint va a necesitar comentarios. |
| TOML | Menos legible para estructuras anidadas profundas, y el blueprint anida mucho. |

**Impacto.** Requiere un parser en build (`js-yaml` o un plugin YAML de Vite). **Todavía no está
instalado**: se añade junto con el cargador de blueprints, en el Bloque 1. Instalarlo ahora, sin
nada que lo importe, sería una dependencia muerta.

**Revisar cuando.** El parser resulte ser un cuello de botella de build, o aparezca la necesidad de
editar blueprints desde una interfaz (entonces conviene JSON como formato de almacenamiento y YAML
solo como formato de autoría).

---

### ADR-0005 — Estructura completa declarada en `CLAUDE.md`

- **Fecha:** 2026-09-01 · **Estado:** Aceptada · **Ámbito:** core

**Contexto.** `CLAUDE.md` declaraba solo `/core` y `/themes`. `SKILL.md` añadía `/modules` y
`/clients`. El encargo del Bloque 0 añadía CONTENT y EXTENSIONS. Ninguno mencionaba `/adapters`.
Tres fuentes, tres mapas distintos.

**Decisión.** `CLAUDE.md` declara la estructura completa de
[ARCHITECTURE.md §4](#4-estructura-de-carpetas) más la tabla de regla de dependencia y las reglas
de trabajo derivadas (criterio core/módulo/extensión, prohibición de color literal, registro de
decisiones, YAML para blueprints).

**Motivo.** `CLAUDE.md` se carga en cada sesión. Un mapa incompleto ahí hace que cada sesión futura
arranque equivocada y gaste contexto corrigiéndose. Es el documento con mejor relación
precisión/coste del proyecto.

**Impacto.** `CLAUDE.md` pasa de 17 a ~60 líneas. Sigue siendo barato de cargar y ahora es
suficiente para ubicar cualquier archivo sin abrir `/docs`.

**Revisar cuando.** La estructura cambie, o `CLAUDE.md` crezca tanto que convenga mover detalle a
`/docs` y dejar solo punteros.

---

### ADR-0012 — `src/components/ui/**` es código vendor: se relaja el lint, no se editan los archivos

- **Fecha:** 2026-09-01 · **Estado:** Aceptada · **Ámbito:** tooling

**Contexto.** `button.jsx`, generado por `npx shadcn add`, producía dos errores de lint: hace
`import * as React from "react"` sin usarlo (el JSX transform no lo requiere) y exporta
`buttonVariants` junto al componente, lo que `react-refresh/only-export-components` rechaza. Ambos
son propios del estilo de shadcn y se repetirán en **todos** los componentes que se añadan.

**Decisión.** Un bloque de override en `eslint.config.js` para `src/components/ui/**`:
`no-unused-vars` con `varsIgnorePattern: '^React$'`, y `react-refresh/only-export-components` en
`off`.

**Motivo.** Estos archivos se actualizan desde upstream; cualquier edición manual se pierde en la
siguiente actualización y habría que rehacerla en cada componente. La excepción es **selectiva, no
general**: verificado que una variable realmente sin usar en esa carpeta sigue dando error.

**Alternativas descartadas.**
| Alternativa | Por qué no |
|---|---|
| Editar `button.jsx` | Se revierte en cada `npx shadcn add` / actualización. Trabajo recurrente e invisible. |
| `no-unused-vars: 'off'` en esa carpeta | Silenciaría errores reales en código que sí llega a producción. |
| Excluir `components/ui/**` del lint | Perdería toda verificación sobre componentes que sí se ejecutan. |

**Impacto.** Refuerza la frontera de
[ARCHITECTURE.md §4](ARCHITECTURE.md#4-estructura-de-carpetas): `components/ui/` es vendor, y lo
nuestro va en `core/ui/`. Si algún día hay que modificar un componente de shadcn a fondo, se copia
a `core/ui/` y deja de ser vendor.

---

### ADR-0007 — Contrato de tokens en `themes/_base`

- **Fecha:** 2026-09-01 · **Estado:** Aceptada · **Ámbito:** themes

**Decisión.** `src/themes/_base/theme.css` declara el contrato completo de tokens con valores
neutros; `src/index.css` lo importa. `src/themes/_base/theme.js` publica la metadata declarativa y
la lista de tokens, para poder validar más adelante que un theme de cliente no invente ninguno.

**Convención de nombres.** Tokens de shadcn **sin prefijo** (`--primary`, `--border`), para que
`npx shadcn add` siga funcionando sin adaptaciones. Tokens propios **con prefijo `--mm-`**
(`--mm-font-heading`, `--mm-layout-max`), para no colisionar con los espacios de nombres de
Tailwind v4 (`--font-*`, `--container-*`), que se mapean aparte en `@theme inline`.

**Por qué `@theme inline`.** Hace que las utilidades apunten a la variable en vez de a una copia
del valor. Verificado en el CSS emitido: `.max-w-page{max-width:var(--mm-layout-max)}` y
`.font-heading{font-family:var(--mm-font-heading)}`. Es lo que permite que un theme de cliente
sobrescriba `:root` y cambie toda la tienda **sin recompilar utilidades**.

**Alcance deliberadamente corto.** Solo se añadieron los tokens de extensión que el shell consume
de verdad (`--mm-font-sans`, `--mm-font-heading`, `--mm-font-mono`, `--mm-layout-max`). Los
previstos en [ARCHITECTURE.md §6](ARCHITECTURE.md#6-sistema-de-diseño-y-themes) que aún no tienen
consumidor (`--mm-density`, `--mm-card-style`, `--mm-price-color`, `--mm-badge-*`,
`--mm-decoration-*`) entran junto con los componentes que los usen: un token sin consumidor es
código muerto que igualmente hay que mantener.

**Revisar cuando.** El primer theme de cliente necesite un token que no exista — entonces se añade
al contrato base, nunca solo en el theme.

---

### ADR-0013 — `react-router` en modo declarativo

- **Fecha:** 2026-09-01 · **Estado:** Aceptada · **Ámbito:** core

**Decisión.** `react-router` v8 en modo declarativo: `<BrowserRouter>` + `<Routes>` + `<Route>` en
JSX, dentro de `core/app/AppShell.jsx`.

**Nota de paquete.** Desde la v7, `react-router-dom` está unificado en `react-router`. **No instalar
`react-router-dom`**: sería un paquete redundante.

**Motivo.** Los módulos tendrán que aportar rutas. Con rutas declarativas en JSX, el registro de
módulos puede inyectarlas en el árbol sin que el shell conozca una estructura de archivos ni un
objeto de configuración externo. El modo framework (basado en archivos) además impondría su propio
build y convenciones de carpetas, que chocarían con la separación core/módulos/adaptadores.

**Alternativas descartadas.**
| Alternativa | Por qué no |
|---|---|
| Modo framework / basado en archivos | Impone estructura de carpetas y build propios; incompatible con la composición por módulos. |
| `createBrowserRouter` (router de datos) | Aporta loaders y acciones que hoy no se usan (no hay backend), y las rutas quedan en un objeto que el registro de módulos tendría que mutar. Reevaluable cuando exista backend. |
| Router propio | Reinventar enrutado, historial y accesibilidad de navegación sin ningún beneficio. |

**Revisar cuando.** Exista backend y los loaders/actions del router de datos aporten algo real.

---

### ADR-0002 — Blueprint dividido en `BRIEF.md` + `blueprint.yaml`

- **Fecha:** 2026-09-02 · **Estado:** Aceptada e implementada · **Ámbito:** clientes

**Decisión.** Cierra PROP-0002 en la práctica: `clients/<slug>/BRIEF.md` (prosa) y
`clients/<slug>/blueprint.yaml` (validable), construidos para `clients/demo/`.

**Motivo.** Ya documentado en la propuesta original. Se acepta sin más debate porque
`docs/client-blueprints/BLUEPRINT-FORMAT.md` ya asumía esta separación desde el Bloque 0 y el
Bloque 1 la usa como instrucción de referencia — no es una decisión nueva, es formalizar una ya
escrita.

**Nota sobre `clients/demo/`.** No es un cliente real: existe para ejercitar el Blueprint Loader,
el Mode Resolver y el Module Registry contra el árbol real (`status: draft`,
`assets.approved: false`, para que un intento de construirlo en producción falle a propósito). El
primer cliente de demostración real llega en un bloque posterior.

---

### ADR-0014 — Adaptadores antes que módulos en el arranque

- **Fecha:** 2026-09-02 · **Estado:** Aceptada · **Ámbito:** core

**Contexto.** `ARCHITECTURE.md §5` listaba "resolver módulos" (paso 4) antes que "resolver
adaptadores" (paso 5). Pero `MODULES.md §6` exige, como parte de la propia resolución de módulos,
comprobar que todo puerto que un módulo declara (`ports: [...]`) tenga un adaptador resuelto. Esa
comprobación es imposible si los adaptadores todavía no se resolvieron. Los dos documentos se
contradecían entre sí.

**Decisión.** El orden real de `core/config/boot.js` es: blueprint → modo → **adaptadores** →
**módulos** → theme → slots. `ARCHITECTURE.md §5` se corrigió para reflejarlo.

**Motivo.** Un módulo como `reporting` (requiere el puerto `analytics`) solo puede validarse si ya
se sabe qué adaptador de analítica quedó resuelto. Invertir el orden habría exigido resolver
módulos dos veces, o debilitar la validación de puertos a "advertencia" en vez de error — ambas
peores que corregir el orden.

**Impacto.** Ninguno sobre código existente: es la primera implementación de esta secuencia. Deja
registrado por qué el orden es este y no el documentado originalmente, para que nadie lo revierta
por error al leer solo `ARCHITECTURE.md` sin ver el código.

---

### ADR-0015 — Validador declarativo propio en vez de una librería de esquemas

- **Fecha:** 2026-09-02 · **Estado:** Aceptada · **Ámbito:** tooling

**Contexto.** El blueprint y el `configSchema` de cada módulo necesitan validación con tipos,
valores por defecto, enums y mensajes de error localizados. Librerías como Zod o Yup resuelven esto
de forma más completa y con mejor DX (uniones, refinamientos, inferencia de tipos).

**Decisión.** `core/config/schema/validator.js`: un validador propio de ~200 líneas, sin
dependencias, con siete tipos de descriptor (`string`, `number`, `boolean`, `object`, `record`,
`array`, `any`) y sugerencia de errata por distancia de edición en claves desconocidas.

**Motivo.** El contrato del blueprint (`BLUEPRINT-FORMAT.md §3`) no usa uniones discriminadas ni
transformaciones — es objetos anidados con tipos simples y valores por defecto, que es exactamente
lo que cubre este validador. Es **puro** (sin APIs de Vite/React), lo que permite ejercitarlo con
`node --test` sin arrancar el navegador ni instalar un runner adicional. Consistente con
[ADR-0011](#pendientes-de-aprobación) (JSDoc en vez de TypeScript): se prioriza lo mínimo necesario
sobre la herramienta más completa.

**Alternativas descartadas.**
| Alternativa | Por qué no |
|---|---|
| Zod / Yup | Dependencia nueva para un caso de uso que no necesita sus capacidades avanzadas. |
| Validar a mano en cada sitio | Es exactamente lo que este archivo evita: cada nuevo módulo repetiría la misma lógica de tipos, defaults y mensajes. |

**Revisar cuando.** El contrato necesite uniones, referencias cruzadas entre campos más complejas
que las ya cubiertas en `validate.js`, o inferencia de tipos TypeScript a partir del esquema.

---

### ADR-0016 — Catálogo es CORE, no un módulo; `content/filesystem` es el primer adaptador real

- **Fecha:** 2026-09-02 · **Estado:** Aceptada · **Ámbito:** core, adapters

**Aclaración de vocabulario.** El catálogo vive en `core/catalog/`, no en `src/modules/`. No es una
decisión nueva — ya estaba clasificado como CORE-fijo en `MODULES.md §3` (PROP-0001): una tienda
sin catálogo no es una tienda, así que no tiene sentido activarlo o desactivarlo por blueprint.

**Primer adaptador real: `content/filesystem`.** Lee `clients/<slug>/content/categories.yaml`
(una lista) y `clients/<slug>/content/products/*.yaml` (uno por producto — coincide con
`commerce.products.source: content/products/` de `BLUEPRINT-FORMAT.md`), valida contra
`core/catalog/schema.js` y cruza que cada producto referencie una categoría existente.
`isMock: false`.

**Por qué el guardarraíl de mocks no aplica aquí.** El guardarraíl de
[DEMO-PRODUCTION.md §3](../business/DEMO-PRODUCTION.md#3-resolución-del-modo) existe para impedir
que una integración con un proveedor externo (pago, delivery) llegue simulada a producción.
`content/filesystem` no integra con nada externo: lee archivos del propio repositorio, igual en
demo que en producción. La diferencia entre modos para el catálogo no es "adaptador real vs falso"
— es **contenido de ejemplo vs contenido real del cliente**, un problema de datos, no de
integración. Coincide con la propia tabla de `DEMO-PRODUCTION.md`: "Catálogo y productos → datos de
ejemplo", categoría distinta de "Pago → mock".

**Reutilización.** `core/catalog/parse.js` (puro) sigue el mismo patrón que
`blueprint/parse.js` + `blueprint/load.js`: parseo y validación puros, descubrimiento por
`import.meta.glob` en una capa fina aparte — reutilizado también por
`scripts/validate-clients.mjs` como puerta de despliegue. El manejo de `YAMLException` se extrajo a
`core/lib/yaml.js` y el descriptor de dinero a `core/commerce/money.js`, ambos usados ahora por el
blueprint y por el catálogo, para no duplicarlos.

---

### ADR-0017 — Carrito: Context + `useReducer`; checkout consulta el adaptador, no el modo

- **Fecha:** 2026-09-02 · **Estado:** Aceptada · **Ámbito:** core, adapters

**Cierra PROP-0009**, dejada pendiente explícitamente "al inicio del Bloque 3" — es este momento.

**Decisión — carrito.** `core/commerce/cart/`: `cartReducer.js` (puro, testeable sin datos de
producto — clampa al `maxQuantity` que le pasa la acción) + `cartContext.js` (el `Context`, sin
JSX) + `CartProvider.jsx` (el componente) + `useCart.js` (API pública: combina el estado con
`getCatalog()` para producir líneas enriquecidas y totales). Cuatro archivos, no uno, por la misma
restricción de fast-refresh que ya separó `adapter.meta.js` de `adapter.js`: un archivo de
componente no puede exportar además un `Context` o un hook sin romper HMR.

`CartProvider` se monta en `AppShell` dentro de `BootGate` (necesita el catálogo resuelto) y fuera
del router (el carrito sobrevive a la navegación). Sin persistencia entre recargas — en memoria,
como se pidió; localStorage queda para cuando haga falta de verdad.

**Decisión — checkout no consulta el modo.** `CheckoutView` no importa `mode.isDemo` en ningún
punto. Pregunta `paymentAdapter?.isMock` para decidir si marca el pedido como
"PEDIDO DE DEMOSTRACIÓN". Es la misma pregunta que ya resuelve el guardarraíl de
`core/config/mode.js` — un adaptador `isMock` nunca llega resuelto a un build de producción — así
que el componente no necesita duplicar esa lógica ni saber en qué modo está.

**Por qué esto es más fuerte que deshabilitar el botón.** Con `payments.adapters: [mock]` en el
blueprint de un cliente, un intento de build en `production` **no llega a renderizar nada**: el
guardarraíl de `checkNoMocksInProduction()` revienta el arranque completo antes de montar
`BootGate`. La UI de checkout ni siquiera se ejecuta. Que el botón de confirmar se deshabilite
cuando no hay adaptador es una segunda capa, para el caso (válido) de un blueprint sin ningún
método de pago configurado.

**Primer adaptador de pago: `payment/mock`.** `isMock: true`, `family: 'offline'`, simula "siempre
aprobado tras un retardo" (`DEMO-PRODUCTION.md §5`). Sigue el patrón `adapter.meta.js`/`adapter.js`
generalizado en la adenda de ADR-0016.

**Alcance deliberadamente reducido.** Sin selección de delivery (el checkout va directo a pago),
sin persistencia de pedido, sin la máquina de estados completa de `PAYMENTS.md §3` (aquí solo se
usa el estado terminal `paid`). Es lo mínimo que prueba el guardarraíl y los totales de punta a
punta; el resto es trabajo de un bloque de Delivery/Administración posterior.

**Revisar cuando.** Exista un segundo adaptador de pago real (offline u online) que necesite
`isEligible()` real, o cuando el checkout necesite persistir un pedido más allá de la sesión del
navegador.

---

### ADR-0018 — Playwright real; cierra D-08

- **Fecha:** 2026-09-02 · **Estado:** Aceptada · **Ámbito:** tooling

**Contexto.** Los binarios de navegador de Playwright estaban descargados desde el setup inicial
del proyecto, pero `@playwright/test` no estaba en `package.json`, no había `playwright.config.js`
ni ningún spec — es decir, nunca se había ejecutado un test real. Las verificaciones de carrito y
checkout de los Bloques 2 y 3 se hicieron con fixtures SSR temporales (`renderToString` +
`MemoryRouter`), que prueban el renderizado pero no pueden simular un click real.

**Decisión.** `playwright.config.js` en la raíz + specs en `e2e/*.spec.js`. Levanta `npm run dev`
como `webServer` (lee `VITE_CLIENT`/`VITE_MODE` de `.env`, ya en `demo`/`demo`), corre cada spec en
dos proyectos — `Desktop Chromium` y `Mobile Chrome` (`devices['Pixel 5']`) — lo que cubre el paso
"verificar responsive en móvil y escritorio" de `.claude/skills/testing/SKILL.md` sin duplicar
ningún test: es el mismo spec, dos configuraciones.

**`e2e/checkout-flow.spec.js`** cubre el flujo completo: cargar la tienda demo, agregar 2 productos
distintos con clicks reales, verificar el total en `/carrito` y en `/checkout`, confirmar el pedido,
y comprobar que aparece "PEDIDO DE DEMOSTRACIÓN". Un segundo test verifica que un producto sin stock
no ofrece botón de agregar. Los selectores usan `data-testid`/`data-product-id` añadidos a
`ProductCard`, `CartPage` y `CheckoutView` — desacoplados del texto visible, salvo la comprobación
de "PEDIDO DE DEMOSTRACIÓN", donde el texto exacto **es** lo que se quiere proteger (es la promesa
de `DEMO-PRODUCTION.md §4`: ese aviso no puede desaparecer silenciosamente).

**En adelante:** este spec reemplaza las verificaciones SSR temporales para todo lo que toque
carrito o checkout. Las fixtures `__ssrcheck*.jsx` de bloques anteriores fueron siempre temporales y
ya se habían eliminado; no queda ninguna en el repositorio.

**Alcance deliberadamente reducido.** Un solo flujo feliz + un caso de borde (sin stock). No cubre
el guardarraíl de "mock en producción" por Playwright (se sigue verificando con `boot()` + un
cliente temporal, como en el Bloque 3) porque requeriría levantar el dev server en modo producción
contra un cliente sin aprobar — más ceremonia que valor para lo que ya prueban los tests unitarios
de `mode.test.js`.

**Impacto.** `@playwright/test` como devDependency. `npm run test:e2e` ejecuta la suite.
`.gitignore` excluye `test-results/`, `playwright-report/`, `blob-report/`.

**Revisar cuando.** Exista un segundo flujo de usuario significativo (búsqueda, un módulo con UI
propia) que valga un spec dedicado — no antes, para no acumular specs redundantes con los tests
unitarios ya existentes.

---

### ADR-0019 — Selección de theme por cliente: `applyTheme()` en `main.jsx`; segundo cliente real

- **Fecha:** 2026-09-02 · **Estado:** Aceptada · **Ámbito:** core, themes, clientes

**Contexto.** Desde el Bloque 1, `index.css` importaba `themes/_base/theme.css` de forma estática
e incondicional. El contrato de tokens existía y funcionaba, pero **nada leía
`blueprint.design.theme` para decidir qué theme aplicar** — cada build usaba siempre `_base`,
sin importar qué declarara el cliente. Era el pendiente citado en cada resumen de bloque desde
entonces.

**Decisión — mecanismo.** `core/config/theme.js` exporta `applyTheme(themeId)`, que hace
`import(\`@/themes/${themeId}/theme.css\`)` — un `import()` dinámico con variable, que Vite trata
como un glob interno y resuelve correctamente contra `src/themes/*/theme.css`. Se llama desde
`main.jsx`, **antes** de `createRoot(...).render(...)`, no desde un componente:

1. `index.css` ya cargó `_base/theme.css` de forma estática (el contrato completo, valores neutros).
2. `main.jsx` resuelve el runtime (`getRuntime()`, cacheado — no repite el arranque que `BootGate`
   volverá a pedir) y, si es válido, espera a que cargue el theme del cliente.
3. El theme del cliente solo sobrescribe `:root { --token: valor }`; por orden de carga (CSS
   cascada, misma especificidad, gana el último) sus valores prevalecen sobre `_base` sin que nadie
   tenga que subir especificidad ni tocar el archivo base.
4. Recién entonces se monta React.

**Por qué antes de montar y no en un `useEffect`.** Resolver el theme dentro de un componente
produciría un parpadeo real: primer paint con los colores neutros de `_base`, luego un re-paint con
los del cliente en cuanto el `import()` resuelva. Resolverlo antes de `render()` cuesta un chunk de
CSS más por descargar antes del primer pintado — el archivo es minúsculo (unas pocas líneas de
`:root`), y evitar el parpadeo vale ese costo. Si `runtime.ok` es `false`, se omite `applyTheme` y
la pantalla de error de `BootGate` se ve con los colores neutros del contrato base — correcto, un
error no necesita la identidad visual del cliente.

**Decisión — segundo cliente: `clients/demo-medical`.** Mismo patrón que `clients/demo`: cliente de
infraestructura, no un cliente real (`status: draft`, `assets.approved: false`). Usa
`design.theme: demo-medical` (azul `#1e4e8c` primario, marrón secundario/acento — la referencia de
"cliente médico" ya citada en `SKILL.md` desde el Bloque 0) y **el mismo adaptador
`content/filesystem`** que `demo`, con contenido propio (productos médicos de ejemplo: termómetro,
alcohol en gel, mascarillas, vitamina C). Cero código nuevo de catálogo, carrito o checkout — el
único archivo de `src/core/` que cambió para que esto funcionara es `theme.js` +
`main.jsx` (la infraestructura de selección en sí), y esos no se vuelven a tocar para un tercer,
cuarto o enésimo cliente.

**Verificación real, no solo teórica: `e2e/theme-derivation.spec.js`.** `playwright.config.js`
levanta **dos** dev servers simultáneos, uno por cliente, en puertos distintos, cada uno con su
propio `VITE_CLIENT`/`VITE_MODE` pasados como `env` al proceso hijo (Playwright's `webServer.env`).
Esto depende de un detalle de `dotenv`/Vite que vale dejar explícito: **una variable ya presente en
`process.env` no se sobrescribe con el valor de `.env`** — así que el `env` de cada `webServer`
gana sobre el `.env` versionado (`VITE_CLIENT=demo`). El test compara ambos clientes en la misma
corrida:
- El color de fondo computado (`getComputedStyle`) del botón "Agregar" es `rgb(30, 78, 140)` en
  `demo-medical` y **distinto** en `demo` — la prueba de que el theme cambió de verdad, no solo en
  el CSS fuente.
- `demo-medical` muestra su propio catálogo (`Termómetro digital`, `Equipos`) y no muestra nada del
  catálogo de `demo`.
- El flujo completo de carrito + checkout (agregar 2 productos, ver el total, confirmar, ver
  "PEDIDO DE DEMOSTRACIÓN") funciona igual, sin ninguna rama de código específica del cliente.
- El caso de borde de "sin stock" se comporta igual.

**Esta es la prueba real de la promesa central del proyecto**, no una afirmación de diseño: derivar
un segundo cliente costó exactamente `theme.css` + `theme.js` + `blueprint.yaml` + `BRIEF.md` +
contenido de catálogo. Cero líneas de `core/catalog/`, `core/commerce/`, `adapters/content/` o
`components/ui/` cambiaron.

**Impacto.** `themes/_base/theme.js`'s ya existente formato de metadata se replica en
`themes/demo-medical/theme.js` (declarativo, sin consumidor todavía — sigue pendiente la validación
de que un theme de cliente no invente tokens fuera del contrato).

**Revisar cuando.** El costo del `import()` dinámico antes de montar (el chunk de CSS adicional)
sea perceptible en una conexión real lenta — entonces conviene precargar el theme del cliente vía
`<link rel="preload">` inyectado por cliente en el build de `index.html`, en vez de resolverlo en
runtime.

---

### ADR-0020 — Primer módulo real (`whatsapp`); cierra el hueco de carga de módulos

- **Fecha:** 2026-09-02 · **Estado:** Aceptada · **Ámbito:** core, modules

**Defecto encontrado: los módulos activos nunca se cargaban.** `resolveModules()` (Bloque 1) decide
qué módulos están activos y valida su configuración, pero **nada llamaba `manifest.load()` ni
ejecutaba `register()`** en el arranque real — ese paso solo se había ejercitado a mano en un
fixture temporal de verificación del Bloque 1, ya eliminado. Un módulo podía "resolver" como activo
en `boot()` sin que su código se ejecutara jamás. Corregido con
`core/registry/load.js#loadActiveModules()`, llamado desde `main.jsx` **antes** de montar React —
mismo momento y mismo motivo que `applyTheme()` (Adenda ADR-0019): las contribuciones a slots deben
existir antes del primer render.

**Por qué secuencial y no `Promise.all`.** `resolveModules()` ya devuelve los módulos en orden
topológico determinista (MODULES.md §7: un empate de prioridad en un slot se resuelve por ese
orden). Cargar en paralelo haría que el orden de registro dependiera de qué `import()` resuelve
primero — nada determinista. Con pocos módulos el costo de secuenciar es irrelevante.

**El módulo: `whatsapp`.** El más simple del catálogo (`MODULES.md §3`): sin `requires`, sin
`conflictsWith`, sin puertos. Contribuye al slot `global.floating` (ya declarado por el core desde
el Bloque 1, y ya documentado como el punto de conflicto con el CTA flotante de una campaña
estacional — `SEASONAL-CAMPAIGNS.md §6`). `configSchema` valida `phone` (patrón `+` + 6-15 dígitos)
y `defaultMessage` (con default). El botón arma el enlace `https://wa.me/<dígitos>?text=<mensaje>`
— sin proveedor externo real que integrar, es solo un enlace `<a>`.

**Color de marca de terceros vs. color de marca del cliente.** El verde de WhatsApp (`#25d366`) es
identidad del proveedor, no del comercio — no debería variar por theme, y sin embargo
`ARCHITECTURE.md §6` prohíbe cualquier color literal en `modules/`. Se resolvió añadiendo
`--mm-whatsapp-brand` / `--mm-whatsapp-brand-foreground` al **contrato base**
(`themes/_base/theme.css`, no a cada theme de cliente) y mapeándolos a `bg-whatsapp` /
`text-whatsapp-foreground` vía `@theme inline`. El módulo consume el token, nunca el hex. Precedente
para cualquier módulo futuro que integre con un proveedor con identidad visual propia.

**Activación probada en las dos direcciones.** `clients/demo` lo activa
(`modules.whatsapp.enabled: true`, con teléfono y mensaje propios);
`clients/demo-medical` lo declara `enabled: false` explícitamente — no por omisión — para ejercitar
la rama de "módulo conocido pero desactivado", distinta de "módulo nunca mencionado".

**Verificado con Playwright** (`e2e/modules.spec.js`, sobre los dos dev servers de ADR-0019): el
botón aparece en `demo` con el número y mensaje correctos (parseando la URL real, no comparando
texto), y **no existe en el DOM** de `demo-medical` — cero elementos, no solo oculto.

**No se escribió un test unitario del módulo.** `register()` solo tiene sentido probado junto a
`WhatsAppButton.jsx`, que contiene JSX; `node --test` no transforma JSX y añadir un loader
experimental para un wrapper de una línea no compensa. La cobertura real está en Playwright (el
comportamiento completo, en un navegador) más los tests ya existentes de `resolve.js` (la lógica de
activar/desactivar por config, genérica, ya cubierta con un módulo sintético).

**Revisar cuando.** Exista un segundo módulo con dependencias reales entre sí (para probar
`requires`/`conflictsWith` con módulos de verdad, no solo con el catálogo sintético de los tests) o
cuando `TIERS.md#MODULE_ACCESS` se implemente en código y `manageableBy` tenga un consumidor.

---

### ADR-0021 — Admin de catálogo: registro de rutas de módulo + API de solo-desarrollo

- **Fecha:** 2026-09-07 · **Estado:** Aceptada · **Ámbito:** core, modules, tooling

**Nota de proceso.** El encargo previo de este bloque (dos módulos con `requires` real, ej.
branches/delivery) quedó sin ejecutar — la sesión terminó sin avanzarlo. Este ADR corresponde al
encargo que lo sustituyó: panel de administración básico de catálogo. La prueba de una dependencia
real entre dos módulos de producción sigue pendiente (ver auditoría de pendientes, más abajo).

**Pieza de infraestructura nueva: registro de rutas.** Hasta ahora los módulos solo podían aportar
contenido a un `<Slot/>` (una posición dentro de un layout fijo). El admin necesita una **página
completa** en una URL propia, sin el header/footer/carrito del storefront — algo que ningún slot
resuelve. `core/routes/registry.js` replica el patrón de `core/slots/registry.js`
(`registerRoute({path, moduleId, Component})` / `getRegisteredRoutes()`), poblado por
`loadActiveModules()` en `main.jsx` antes de montar, y leído una vez en `AppShell.jsx`. Las rutas de
módulo se renderizan como **hermanas** de `<Route element={<Layout/>}>`, no anidadas dentro — así no
heredan la apariencia de la tienda. Esto cierra el pendiente citado en `AppShell.jsx` desde el
Bloque 3 ("inyectar las rutas que aporten los módulos activos").

**El obstáculo real: no hay backend.** "Escribir en los mismos YAML que lee `content/filesystem`"
choca directo con la limitación documentada desde el Bloque 0 (PROP-0006): una SPA estática no
puede escribir en su propio código fuente en producción. La solución honesta, no una promesa vacía:
`vite-plugins/admin-catalog-api.js`, un middleware con `apply: 'serve'` — **existe únicamente
dentro de `vite dev`**, nunca en `vite build`. Expone `GET/POST/PUT/DELETE` sobre
`/__admin-api/products`, usando `node:fs` para leer/escribir los archivos reales de
`clients/<slug>/content/products/*.yaml` y `categories.yaml`. Reutiliza `core/config/schema/
validator.js` + `core/catalog/schema.js` para validar cada escritura contra el **mismo** contrato
que ya valida la lectura — un producto inválido no se puede escribir desde el admin tampoco.

**Esto es una herramienta de edición local, no un backend de producción.** Un despliegue estático
(Netlify, Vercel static, S3, GitHub Pages…) no tiene proceso de servidor para atender el
middleware — el admin, tal como está, **no funcionaría en un sitio publicado**. Sirve para cargar
catálogo durante el desarrollo/onboarding de un cliente, no para que un cliente MANAGED u OWNERSHIP
edite su catálogo en producción. Decidir el backend real (PROP-0006, sin resolver desde el
Bloque 0) sigue siendo el prerrequisito para que esto funcione publicado — este bloque no lo
resuelve, lo rodea con una herramienta honesta sobre su propio límite.

**Protección de la ruta: contraseña, explícitamente no-seguridad.** `admin-catalog` valida
`config.password` (del blueprint) contra un formulario, y guarda "autenticado" en
`sessionStorage` (se pierde al cerrar la pestaña). **La contraseña viaja en el blueprint, que se
empaqueta en el bundle del navegador** — es legible por cualquiera con las herramientas de
desarrollador o mirando el tráfico de red. Esto no es una omisión: es la naturaleza de cualquier
"secreto" en una SPA sin backend (mismo principio ya documentado en `PAYMENTS.md §1`). El único
propósito real es evitar que un visitante casual tropiece con el admin — no es una barrera contra
alguien que lo busque a propósito.

**Sin `admin-content` como dependencia falsa.** `MODULES.md §3` documenta `admin-catalog` como
dependiente de `admin-content` (edición de contenido general — banners, textos, páginas). Ese
módulo no se construyó aquí porque es una funcionalidad distinta, no pedida en este bloque.
Declarar `requires: ['admin-content']` sin que ese módulo exista habría hecho `admin-catalog`
irresolvable — un error de diseño, no una simplificación honesta. `admin-catalog.requires` queda en
`[]`. La prueba real de una dependencia entre módulos de producción (el objetivo del encargo
anterior a este) sigue pendiente.

**Sin ID de imagen real.** El campo de imagen es una URL de texto (coincide con
`productSchema.images[].src`), no una subida de archivo — el puerto `STORAGE` sigue siendo un
contrato vacío (`ports/index.js`), sin ningún adaptador.

**Verificado con Playwright.** `e2e/admin-catalog.spec.js`: una contraseña incorrecta no da acceso;
agregar un producto lo muestra en el admin y, en una **carga fresca** del catálogo público (el
mismo archivo YAML que acaba de escribir el admin), aparece ahí también; el test se autolimpia
(borra el producto) para poder re-ejecutarse — verificado dos veces consecutivas sin intervención
manual. Se encontró y corrigió una condición de carrera real: al escribir/borrar un archivo que
coincide con el patrón de `import.meta.glob`, el propio dev server de Vite puede disparar un
full-reload de la pestaña de `/admin` (todavía con HMR conectado) casi al mismo tiempo que el test
navega explícitamente — dos navegaciones compitiendo abortan una a la otra
(`net::ERR_ABORTED`). Se resolvió con una espera corta y documentada en el spec, no ocultando el
motivo.

**Impacto en el linter.** El `useEffect` de carga inicial en `AdminCatalogManager.jsx` no puede
delegar en una función externa que hace varios `setState` (el linter, con la integración de React
Compiler, lo marca como riesgo de "cascading renders") — mismo motivo que ya obligó a mover la
lógica de `boot()` fuera de un `useMemo` en `BootGate.jsx` (Bloque 1). Se resolvió poniendo el
`fetch` inline dentro del efecto, con guarda de cancelación, y dejando la función `refresh()`
reutilizable solo para los manejadores de click (donde la regla no aplica).

**Revisar cuando.** Se tome una decisión de backend real (PROP-0006) — ese es el momento de decidir
si este admin se reemplaza por uno que hable con un servidor real, o si se mantiene como
herramienta de desarrollo local y se construye un admin de producción aparte.

---

### ADR-0022 — Cablear lo ya declarado: página de producto, footer, contacto en checkout, disclaimer

- **Fecha:** 2026-09-08 · **Estado:** Aceptada · **Ámbito:** core

**Contexto.** La auditoría de pendientes de ADR-0021 identificó que varios campos del esquema del
blueprint ya estaban validados pero sin ningún componente que los leyera
(`features.stock.lowStockThreshold`, `identity.contact.socials`, `delivery.*.freeOver`) y que no
existía página de producto individual. Este bloque cierra esos huecos, priorizando exactamente lo
ya declarado ("cablear, no diseñar desde cero").

**Página de producto: `/producto/:id`.** `core/app/pages/ProductDetailPage.jsx` — galería completa
(`productSchema.images[]`, no solo `images[0]` como en la card), descripción completa, selector de
cantidad que respeta el stock disponible descontando lo que ya hay en el carrito, y dos secciones
reservadas ("Reseñas", "También te puede interesar") explícitamente vacías — ninguno de esos dos
módulos existe (`reviews`, `cross-selling` en `MODULES.md`). `ProductCard.jsx` ahora enlaza a esta
página desde la imagen/nombre.

**Cableado de campos existentes:**
- `features.stock.lowStockThreshold` → `core/catalog/stockStatus.js#isLowStock` (puro, testeado),
  consumido por `ProductCard` y `ProductDetailPage`: "Quedan N" cuando `0 < stock ≤ threshold`.
- `identity.contact.socials` → íconos en el footer (`Layout.jsx`). Sin `lucide-react` (D-09 sigue
  sin resolver): SVG en línea para instagram/facebook/tiktok/x; cualquier otra clave se muestra
  como link de texto en vez de fallar.
- `delivery.ownDelivery.zones[].freeOver` → mensaje informativo en `CartPage.jsx` ("Envío gratis
  en pedidos sobre $X" / "¡Tu pedido tiene envío gratis!"). Toma el menor umbral configurado si hay
  varias zonas. **No calcula envío real** — no hay ningún adaptador de delivery activo; es
  puramente el mismo dato ya presente en el blueprint, mostrado, no una funcionalidad nueva.
- `description` del producto → ya se guardaba desde `admin-catalog` (Bloque 5) pero nada la
  mostraba; ahora aparece en `ProductDetailPage`.

**Footer completo.** Contacto (`identity.contact.email`/`phone`, como `mailto:`/`tel:`), tres links
legales (`/legal/terminos`, `/legal/privacidad`, `/legal/devoluciones` — un componente
`LegalPage.jsx` reutilizado con contenido **explícitamente placeholder**: "reemplázalo con
asesoría legal real antes de publicar", mismo principio de honestidad que `DemoBadge`), e íconos
sociales.

**Formulario de contacto en checkout.** `CheckoutView.jsx` exige nombre y teléfono (email
opcional) antes de habilitar "Confirmar pedido" — en estado local únicamente, sin persistencia
(PROP-0006 sigue abierto). Tras confirmar, la pantalla de éxito ofrece un enlace de WhatsApp con
los datos del pedido. Ese enlace usa `identity.contact.phone` del blueprint, **no** el módulo
`whatsapp` — `core/` no puede importar `modules/` (`CLAUDE.md`), y el teléfono de contacto del
negocio es un dato de identidad, no algo que dependa de si ese módulo específico está activo o no
(de hecho, en `demo-medical` el módulo whatsapp está desactivado y este enlace funciona igual). Se
extrajo `core/lib/whatsappLink.js#buildWhatsAppLink` como pieza compartida entre el checkout y
`modules/whatsapp/WhatsAppButton.jsx`, eliminando la duplicación de esa lógica.

**Disclaimer médico en `demo-medical`.** Texto estático en el footer, condicionado a
`identity.industry === 'health'` — **no** a un chequeo del slug del cliente. Cualquier cliente
futuro de rubro salud lo hereda automáticamente sin tocar código, y `demo` (industria `generic`)
nunca lo muestra. Verificado en ambas direcciones.

**Defecto encontrado: drift silencioso de una dependencia.** `npx eslint` empezó a fallar en
`CheckoutView.jsx` con `react-hooks/purity` sobre una línea (`Date.now()` dentro de un manejador de
click) que no había cambiado desde el Bloque 3 y que nunca había fallado antes. `package.json`
fija `eslint-plugin-react-hooks` en `^7.1.1` (rango, no versión exacta): una actualización menor
instalada en algún punto entre bloques trajo una regla nueva o más estricta. Resuelto con el mismo
patrón ya usado en `BootGate.jsx` y `AdminCatalogManager.jsx`: la llamada impura se mueve a una
función a nivel de módulo, fuera del cuerpo del componente. **Riesgo a anotar:** con rangos `^` en
`package.json`, el lint puede empezar a fallar sin que nadie haya tocado el código relacionado —
ya pasó tres veces en este proyecto.

**Verificado con Playwright, en 3 tandas** (más el Punto 5 dentro de la tanda de footer):
`e2e/product-detail.spec.js` (5 casos: enlace desde la card, galería/descripción/secciones
reservadas, producto inexistente, stock bajo en card y detalle, límite de cantidad respetando
stock), `e2e/footer.spec.js` (5 casos: contacto e íconos sociales, links legales, disclaimer
ausente en `demo` y presente en `demo-medical`, mensaje de envío gratis actualizándose al
alcanzar el umbral), `e2e/checkout-contact.spec.js` (2 casos: botón deshabilitado sin
nombre/teléfono, enlace de WhatsApp con los datos reales del pedido). Los specs existentes de
checkout (Bloque 3) se actualizaron para llenar los nuevos campos obligatorios — sin eso habrían
quedado rotos por este mismo cambio.

**Impacto.** Cero adaptadores nuevos, cero módulos nuevos, cero cambios al registro de
módulos/slots/rutas. Todo el trabajo fue leer datos que el blueprint ya validaba desde bloques
anteriores y construir el componente que los muestra — el "costo bajo esperado" se cumplió: la
mayoría de los archivos nuevos son componentes de presentación puros, sin lógica de dominio nueva
más allá de dos funciones puras (`isLowStock`, `buildWhatsAppLink`) ya cubiertas con tests
unitarios.

**Revisar cuando.** Exista el módulo de reviews o cross-selling (llenarían las secciones
reservadas de `ProductDetailPage`), o cuando se decida quién redacta el contenido legal real de
cada cliente.

---

### ADR-0023 — Base funcional: búsqueda, delivery básico, segunda dependencia real, carga masiva

- **Fecha:** 2026-09-08 · **Estado:** Aceptada · **Ámbito:** core, adapters, modules

**Contexto.** Nueva fase del proyecto: terminar el primer producto funcional antes de invertir en
diseño visual (que una IA externa hará después con `DESIGN-SPEC.md`/`DESIGN-CONTRACT.md`).
Prioridad explícita: funcionalidad y arquitectura reutilizable, no visual.

**1. Búsqueda.** `CatalogView.jsx` cablea `features.search` (existía sin consumidor desde
Bloque 0): filtro por nombre, 100% cliente (el catálogo ya está entero en memoria), respeta
`minChars`. Sin backend, sin índice — no hacía falta para el tamaño de catálogo actual.

**2. Delivery básico (pickup + zona fija).** Dos adaptadores nuevos, ambos `isMock: false` (cómputo
local real, no una simulación — mismo criterio que `content/filesystem`, ADR-0016):
`adapters/delivery/pickup` (una opción gratis por sucursal con `pickup: true`) y
`adapters/delivery/own-delivery` (una opción por zona configurada, aplica `freeOver` ya cableado en
ADR-0022). `CheckoutView.jsx` consulta todos los adaptadores de delivery resueltos, funde sus
opciones, preselecciona la primera (normalmente retiro gratis, para no forzar un click si el
comprador no necesita elegir) y suma la tarifa seleccionada al total a cobrar. Sin selección de
dirección/mapa — "básico" a propósito, consistente con `DELIVERY.md §4.2` (modo `zone-list`, sin
mapas ni geocodificación).

**3. Segunda dependencia real entre módulos.** `admin-content` (nuevo, mínimo: un anuncio de sitio
configurable en `layout.header.top`) y `admin-catalog.requires = ['admin-content']` — exactamente
la relación que `MODULES.md §3` documentaba desde el Bloque 0 y que quedó pendiente en dos
encargos anteriores. Verificado en las dos direcciones con un cliente temporal (mismo patrón que
ADR-0017): desactivar `admin-content` con `admin-catalog` activo falla con
`"admin-catalog" requiere "admin-content", que está desactivado` antes de tocar Playwright — es un
fallo de arranque (`resolveModules`), no de comportamiento en el navegador, así que se verifica con
`npm run validate` igual que el guardarraíl de mocks, no con un test e2e.

**4. Carga masiva, preparada para evolucionar, no una plataforma.** `BulkImportForm.jsx`: pegar CSV
→ parsear → validar y normalizar con el **mismo** `productSchema` que valida altas individuales y
`content/filesystem` → previsualizar fila por fila (✓/✗ con motivo) → publicar (reutiliza
`createProduct()` por fila, sin endpoint de bulk en el servidor). Parser de CSV deliberadamente
ingenuo (sin comillas/comas escapadas), documentado como tal. Sin mapeo de columnas ni edición en
la tabla de previsualización — es la base mínima, no el producto final de importación.

**Corrección de una condición de carrera nueva.** El publish de bulk-import escribe varios YAML en
una sola operación; en Mobile Chrome esto disparó el mismo full-reload de Vite ya documentado en
ADR-0021, y una corrida fallida dejó un archivo de producto sin limpiar (el paso de borrado nunca
se ejecutó). Se corrigió el spec para no depender del resumen transitorio en pantalla — verifica el
estado persistido (la lista de productos), correcto tanto si hubo reload como si no.

---

### Auditoría de reutilización (Fase 2) — solo se corrigieron los hallazgos A

Usando `demo` y `demo-medical` como prueba, buscando específicamente lo que pide la Fase 2: colores
hardcodeados, texto de cliente en componentes genéricos, condiciones específicas de una demo.

**A — crítico, corregido:**
- `index.html` tenía `<title>Masa Madre</title>` fijo — cualquier cliente derivado mostraba nuestro
  nombre en la pestaña del navegador, no el suyo. Corregido en `main.jsx`:
  `document.title = blueprint.identity.tradeName` tras resolver el arranque.
- `HomePage.jsx` mostraba `<h1>Masa Madre</h1>` y un párrafo de lenguaje de desarrollo
  ("el carrito y el checkout llegan en bloques posteriores") **sin condición alguna**, para
  cualquier cliente. Es el caso más directo de lo que pide buscar la Fase 2. Corregido: lee
  `identity.tradeName`/`tagline`/`description`, ya validados por el esquema desde el Bloque 0.

**Verificado limpio (sin hallazgos):** cero colores hexadecimales en `core/` o `modules/`
(`grep` exhaustivo); cero condicionales por slug de cliente (`=== 'demo'` o similar) en `src/`;
ningún texto ni imagen de un cliente específico dentro de `core/`.

**B — recomendable, no corregido en esta fase** (ver auditoría de pendientes más abajo, ya
actualizada): `features.checkout.steps` y `features.stock.allowBackorder` siguen sin consumidor;
`delivery.pickup.branches` (lista de sucursales habilitadas) no se usa — el adaptador `pickup` lee
directamente `branches[].pickup`, una simplificación deliberada más que un defecto;
`commerce.products.source`/`categories.source` siguen sin ser realmente configurables (ruta fija
en el adaptador); `capabilities.get()` (MODULES.md §8) sigue sin implementación — los módulos
declaran `provides` pero nada lo consume; `eslint-plugin-boundaries` (PROP-0010) sigue sin
instalar, la regla de capas se sostiene por disciplina, no por herramienta.

**C — visual, no tocado:** todo lo relacionado a colores, tipografías, densidad o composición
queda para `DESIGN-SPEC.md`/`DESIGN-CONTRACT.md` y el diseño externo posterior.

**Revisar cuando.** Se implemente el primer módulo que necesite consumir una `capability` de otro
(hoy ninguno lo hace, así que construir el consumidor sería especulativo).

---

## Auditoría de pendientes — 2026-09-07

> Pedida explícitamente antes de una revisión completa de requisitos con el cliente. Organizada por
> documento. `❌` no construido · `⚠️` construido parcialmente o sin efecto real · `✅` construido y
> verificado. No repite lo ya marcado resuelto en las secciones anteriores de este archivo.

### Bloqueante — decisión de negocio, no de código

- **❌ Backend (PROP-0006).** Sigue sin decidirse. Bloquea: pagos con tarjeta, persistencia real de
  pedidos, cualquier admin que funcione en producción (ver ADR-0021), webhooks de cualquier
  proveedor, notificaciones salientes. Es la decisión más importante pendiente del proyecto.

### `ARCHITECTURE.md`

- **❌ `eslint-plugin-boundaries` (PROP-0010).** La tabla de importaciones permitidas (§3) se
  sostiene solo por revisión humana. Nunca instalado.
- **⚠️ "Prohibido color literal en `core/`, `modules/`, `components/ui/"`.** Cumplido hasta ahora
  por disciplina manual (incluida la corrección de este mismo bloque, el token
  `--mm-whatsapp-brand`), sin ninguna regla de lint que lo verifique.
- **⚠️ `design.themeOverrides`** existe en el esquema del blueprint pero nada lo lee ni lo aplica
  en runtime — solo la selección de theme completo (ADR-0019) está conectada.
- **⚠️ `checkJs` (PROP-0011).** El JSDoc se escribe consistentemente, pero `jsconfig.json` nunca
  activó `checkJs: true` — nada verifica automáticamente que el JSDoc sea correcto.

### `MODULES.md`

- **❌ Ninguna dependencia real (`requires`) probada entre dos módulos de producción.** `resolve.js`
  la prueba con un catálogo sintético (tests unitarios); `whatsapp` y `admin-catalog` tienen
  `requires: []`. Era el objetivo del encargo anterior a este bloque, no ejecutado.
  `admin-content`/`admin-catalog` (documentado en MODULES.md §3) sería el par natural.
  `promotions`/`coupons` es otro.
- **❌ Capabilities (§8).** `resolveModules()` recolecta `provides` en `result.capabilities`, pero
  no existe ningún `capabilities.get(...)` que un módulo pueda consultar en runtime. El mecanismo
  de "comunicación entre módulos sin acoplarlos" está a medio construir: se recolecta la lista, pero
  nada la expone para consumirla.
- **❌ Ninguno de los demás módulos del catálogo** (filtros, búsqueda, promociones, cupones,
  flash-sales, bundles, cross-selling, branches, wishlist, reviews, seasonal-campaigns,
  admin-content, bulk-import, media-manager, reporting, zonas de delivery). Solo existen `whatsapp`
  y `admin-catalog`.
- **⚠️ Feature flags de core sin consumidor real.** Varios campos de `features.*` se validan en el
  esquema del blueprint pero la UI los ignora por completo:
  - `features.search` — no existe ningún cuadro de búsqueda; solo hay filtro por categoría.
  - `features.filters.facets`/`defaultSort` — no consumido; el filtro actual es fijo (categoría).
  - `features.stock.lowStockThreshold` — ✅ **cableado en ADR-0022** (`isLowStock`, "Quedan N" en
    card y detalle). `features.stock.allowBackorder` sigue sin consumidor: `ProductDetailPage`
    bloquea agregar al llegar a `stock.quantity`, sin excepción para backorder.
  - `features.checkout.steps` — el checkout sigue siendo de un solo paso (resumen + contacto +
    pago); el array de pasos declarado en el blueprint no se lee en ningún lado.

### `DELIVERY.md`

- **❌ Todo.** Cero adaptadores (ni siquiera un mock), sin paso de delivery en el checkout, sin
  contrato `DeliveryPort` en código (solo en el markdown). El checkout va directo de carrito a pago.

### `PAYMENTS.md`

- **✅ Adaptador mock, guardarraíl de producción.** Ver ADR-0017.
- **❌ Ningún adaptador real** (online u offline más allá del mock) — correcto mientras no haya
  backend.
- **⚠️ Máquina de estados de pago (§3).** Solo se usa el estado terminal `paid`; los intermedios
  (`awaiting_payment`, `submitted`, `verifying`) documentados no existen en código.

### `BLUEPRINT-FORMAT.md`

- **⚠️ Validación parcial del contrato.** Construido: tipos, requeridos, rangos de core (semver),
  slug=carpeta, `status`/`assets.approved` cruzados, sucursales de pickup, catálogo
  activo-y-excluido. **No construido**, aunque están documentados en §4 como reglas de validación:
  - Colores de `branding.colors.forbidden` que no aparezcan en el theme resuelto.
  - Contraste de texto/fondo AA.
  - Que todo asset referenciado exista en disco.
- **⚠️ `commerce.products.source`/`commerce.categories.source`** están documentados como
  configurables, pero el adaptador `content/filesystem` tiene la ruta (`content/products/*.yaml`,
  `content/categories.yaml`) fija en código — un cliente no puede realmente cambiarla vía blueprint.

### `DEMO-PRODUCTION.md`

- **✅ Resolución de modo, guardarraíl anti-mock, `DemoBadge`.** Sólido, probado en ambas
  direcciones (ADR-0017).
- **❌ Adaptador mock de analítica.** Nunca construido; `analytics.adapter` vive vacío en ambos
  clientes.
- **❌ Correos/notificaciones marcados `[DEMO]`.** No aplica todavía: no existe ningún sistema de
  notificaciones (requiere backend).

### `TIERS.md`

- **❌ `MODULE_ACCESS` no existe en código.** Es sistema de permisos íntegramente documental. No hay
  roles, no hay `can()`, no hay ninguna verificación de tier en ningún componente.
- **⚠️ El "password gate" de `admin-catalog` NO es el sistema de tiers.** Es un mecanismo mucho más
  simple, construido solo para este bloque — no debe confundirse con `MODULE_ACCESS` al planear el
  siguiente paso.

### `SEASONAL-CAMPAIGNS.md`

- **❌ Todo.** Ningún campaign slot activado, ningún módulo de campaña. Solo existe el slot
  genérico `global.floating` (usado hoy por `whatsapp`), que es donde competiría un CTA de campaña.

### `VERSIONING.md`

- **✅ Manifiesto de build, rango semver del core, `scripts/validate-clients.mjs` como puerta de
  despliegue** (ahora también valida catálogo). Sólido.
- **❌ `clients/REGISTRY.md`** (la vista de flota) nunca se creó. Con 2 clientes su ausencia no
  duele todavía, pero es un artefacto documentado que no existe.
- **❌ Sin CI real, sin artefactos versionados/reversión** — esperado: no hay ningún despliegue.
- **⚠️ Checklist de smoke test (§8)** parcialmente automatizado por Playwright (carrito, checkout,
  catálogo, activación de módulos, derivación de theme, admin). Sin automatizar: contraste AA,
  delivery (no existe), verificación explícita del manifiesto de build en un test.

### Transversales (no ligados a un documento específico)

- **❌ Búsqueda de producto.** No existe ninguna UI de búsqueda, a pesar de `features.search` en el
  esquema.
- **❌ Persistencia de pedidos.** Un pedido confirmado no sobrevive a un recargo de página — no hay
  almacenamiento de órdenes en ningún lado (requiere backend).
- **❌ Subida de imágenes.** El admin y el catálogo solo aceptan URLs de imagen; sin puerto de
  storage implementado.
- **❌ Accesibilidad automatizada.** Aplicados manualmente: skip link, `aria-label`, foco visible,
  `prefers-reduced-motion`. Nunca corrido axe-core, Lighthouse ni ninguna auditoría automatizada;
  el contraste AA sigue sin verificación de ningún tipo.
- **❌ SEO real.** `blueprintSchema.seo` existe (título, sitemap, robots) pero nada lo lee — el
  `<title>` de `index.html` sigue siendo estático, sin meta tags dinámicas, sin sitemap generado.
- **⚠️ Verificación visual/responsive.** Cubierta por el proyecto "Mobile Chrome" de Playwright en
  cada spec, pero sin regresión visual (capturas comparadas), solo aserciones de comportamiento.

**Impacto.** `blueprint/schema.js` gana un campo `content.adapter` (default `filesystem`);
`core/config/adapters.js` lo resuelve igual que `analytics.adapter` (un solo adaptador, no una
lista). `clients/demo/` gana contenido de catálogo de ejemplo para probar la cadena completa.

**Adenda 2026-09-02.** El patrón `adapter.meta.js` se generaliza a **todo** adaptador, use o no
`import.meta.glob` — no solo a los que lo necesitan. Un `scripts/validate-clients.mjs` que tuviera
que decidir caso por caso qué adaptadores puede importar directamente y cuáles no es más frágil que
una regla única. `src/adapters/payment/mock/` (Bloque 3, ver ADR-0017) ya sigue este patrón aunque
no usa glob.

**Patrón nuevo: `adapter.meta.js`.** `adapter.js` usa `import.meta.glob` y solo puede cargarse bajo
Vite; pero `scripts/validate-clients.mjs` necesita conocer `id`/`port`/`isMock` desde Node puro
para validar que las referencias del blueprint resuelven. Solución: `adapter.meta.js` junto a cada
`adapter.js`, con la metadata pura (cero imports), que `adapter.js` reexporta con spread. Mismo
principio que `module.js` con `load()` diferido en el registro de módulos — metadata estática y
segura, implementación real aparte. Todo adaptador futuro que use `import.meta.glob` (o cualquier
API exclusiva de Vite) debe seguir este mismo patrón.
