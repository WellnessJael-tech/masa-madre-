# Arquitectura — Masa Madre

> **Responde a:** ¿dónde vive cada cosa, y qué capa puede depender de cuál?
> **No responde a:** cómo se activa un módulo ([MODULES.md](../modules/MODULES.md)), cómo se cobra
> ([PAYMENTS.md](PAYMENTS.md)), ni qué se le pregunta al cliente ([BLUEPRINT-FORMAT.md](../client-blueprints/BLUEPRINT-FORMAT.md)).

---

## 1. Estado real del repositorio

Auditoría del 2026-09-01. Esto es lo que **existe**, no lo que se planea.

> **Actualizado el 2026-09-01 tras corregir D-01 a D-04.** El build ya compila y el contrato de
> tokens existe. El detalle de cada corrección está en
> [DECISIONS.md § Deuda de arranque](DECISIONS.md#deuda-de-arranque-detectada).

### Instalado y funcionando
| Pieza | Versión | Nota |
|---|---|---|
| Vite | ^8.2.2 | `vite.config.js` con alias `@` → `./src` |
| React / React DOM | ^19.2.8 | |
| Tailwind CSS | v4 vía `@tailwindcss/vite` ^4.3.3 | sin `tailwind.config.js` (v4 usa CSS) |
| `radix-ui` | ^1.6.7 | paquete unificado (no los `@radix-ui/react-*` sueltos) |
| `class-variance-authority`, `clsx`, `tailwind-merge` | — | añadidas al corregir D-01 |
| ESLint | ^10.9.0 | `eslint.config.js` flat config |

- **shadcn/ui** — `components.json` (`style: new-york`, `baseColor: zinc`, `cssVariables: true`,
  `tsx: false`, `ui → @/components/ui`). Hay **un** componente: `src/components/ui/button.jsx`,
  que ya compila y resuelve sus utilidades.
- **Alias** — declarado de forma consistente en `vite.config.js` (resolve) y `jsconfig.json` (paths).
- **Contrato de tokens** — en `src/index.css`: set completo de shadcn en `oklch`, bloque
  `@theme inline` y variante `.dark`. Base mobile-first, sin anchos fijos, con
  `prefers-reduced-motion`. **Se trasladará** a `themes/_base/theme.css` con PROP-0007.

`src/` está limpio de plantilla: solo `main.jsx` (marcador temporal), `index.css`,
`components/ui/button.jsx` y `lib/utils.js`. `npm run build` y `npx eslint .` pasan sin errores
ni warnings.

### Faltante (a decidir en Bloque 1)
1. **No hay router.** Ni `react-router` ni alternativa. D-07.
2. **No hay gestión de estado.** Carrito/checkout necesitan una decisión — PROP-0009.
3. **No hay runner de tests.** La skill `testing` asume Playwright; no está instalado. D-08.
4. **`lucide-react` no está instalado** (iconos por defecto de shadcn). D-09.

> Estado y detalle de cada punto en
> [DECISIONS.md § Deuda de arranque](DECISIONS.md#deuda-de-arranque-detectada).

---

## 2. El principio: derivar, no copiar

Una tienda nueva **no** es una copia del proyecto. Es una composición:

```
TIENDA = CORE + THEME + MODULE CONFIG + CONTENT + BLUEPRINT [+ EXTENSIONS]
```

| Ingrediente | Quién lo escribe | Se repite por cliente | Contiene lógica de negocio |
|---|---|---|---|
| CORE | nosotros, una vez | ❌ nunca | ✅ universal |
| MODULES | nosotros, una vez por módulo | ❌ nunca | ✅ opcional |
| ADAPTERS | nosotros, una vez por proveedor | ❌ nunca | ✅ de integración |
| THEME | nosotros, uno por cliente | ✅ | ❌ **jamás** |
| BLUEPRINT | nosotros, con el cliente | ✅ | ❌ es datos |
| CONTENT | el cliente / nosotros | ✅ | ❌ es datos |
| EXTENSIONS | nosotros, solo si es inevitable | ✅ (raro) | ✅ específica |

**Criterio de decisión, en una pregunta:** *¿lo necesitan todos los clientes?*
Sí → CORE. Algunos → MODULE. Solo este → EXTENSION. No es funcionalidad, es apariencia → THEME.
No es funcionalidad, es texto/imagen → CONTENT. Es un proveedor externo → ADAPTER.

---

## 3. Capas y regla de dependencia

La regla es **unidireccional**. Es la protección real contra "un cliente rompió a otro".

```
        ┌───────────────────────────────────────────────┐
        │  CLIENTS  (datos: blueprint, content, assets) │  ← no es código
        └───────────────────┬───────────────────────────┘
                            │ configura (en boot)
        ┌───────────────────▼───────────────────────────┐
        │  APP SHELL  (composición: lee blueprint,      │
        │              monta core + módulos + adapters) │
        └───────┬───────────────┬───────────┬───────────┘
                │               │           │
        ┌───────▼──────┐  ┌─────▼──────┐  ┌─▼──────────┐
        │   MODULES    │  │ EXTENSIONS │  │  ADAPTERS  │
        └───────┬──────┘  └─────┬──────┘  └─┬──────────┘
                │               │           │ implementan
                └───────┬───────┘     ┌─────▼──────┐
                        │             │   PORTS    │
                ┌───────▼─────────────▼────────────┐
                │              CORE                │
                └──────────────┬───────────────────┘
                               │ consume tokens (CSS, no JS)
                        ┌──────▼──────┐
                        │   THEMES    │
                        └─────────────┘
```

### Tabla de importaciones permitidas

| Capa | **Puede** importar | **No puede** importar |
|---|---|---|
| `core/` | `core/`, `core/ports/`, `components/ui/` | modules, adapters, themes, clients, extensions |
| `core/ports/` | nada (solo tipos/JSDoc) | todo lo demás |
| `modules/<id>/` | `core/`, `core/ports/`, `components/ui/` | **otros modules**, adapters, clients |
| `adapters/<port>/<prov>/` | `core/ports/`, SDK externo | core UI, modules, otros adapters |
| `extensions/` (de un cliente) | `core/`, `core/ports/`, API pública de modules | core interno, otros clientes |
| `themes/` | nada (es CSS + metadata) | **todo** |
| `clients/` | nada (es YAML/MD/assets) | **todo** |

Tres consecuencias que importan:

- **El core nunca sabe qué módulos existen.** Los módulos se enchufan en *slots* declarados por el
  core; el core solo renderiza `<Slot name="..."/>`. Un módulo ausente = slot vacío, no un error.
- **Los módulos no se conocen entre sí.** Si `promotions` necesita algo de `coupons`, no lo importa:
  consume una *capability* que `coupons` publica en el registro. Así se puede desactivar `coupons`
  sin romper `promotions` (degrada, no explota).
- **Un theme no puede romper la lógica**, porque no tiene JavaScript que ejecutar.

> Esta tabla es mecanizable con `eslint-plugin-boundaries`. Propuesto para el Bloque 1 (PROP-0010) —
> mientras no exista, la regla se sostiene por revisión humana.

---

## 4. Estructura de carpetas

```
masa-madre/
├─ src/
│  ├─ core/                       # UNIVERSAL. Nunca específico de un cliente.
│  │  ├─ app/                     #   shell, routing, providers, error boundaries, layout
│  │  ├─ config/                  #   loader de blueprint, resolución de modo, feature flags
│  │  ├─ registry/                #   registro de módulos + resolución de dependencias
│  │  ├─ slots/                   #   <Slot/>, registro de slots, tipos de slot
│  │  ├─ routes/                  #   registro de rutas aportadas por módulos (ADR-0021)
│  │  ├─ ports/                   #   CONTRATOS (interfaces). Cero implementación.
│  │  │                           #     payment, delivery, analytics, content, storage, auth
│  │  ├─ commerce/                #   dominio: product, category, variant, price, stock,
│  │  │                           #     cart, checkout, order, order state machine
│  │  ├─ catalog/                 #   listado, búsqueda, filtros, ordenación
│  │  ├─ ui/                      #   composiciones propias sobre las primitivas
│  │  └─ lib/                     #   utilidades puras (formato, dinero, fechas, slug)
│  │
│  ├─ components/ui/              # PRIMITIVAS shadcn. Gestionadas por `npx shadcn add`.
│  │                              #   Vendor: se actualizan desde upstream, no se editan a mano.
│  ├─ lib/utils.js                # `cn()` — requerido por shadcn en esta ruta exacta.
│  │
│  ├─ modules/<module-id>/        # OPCIONAL, activable por config.
│  │  ├─ module.js                #   manifiesto: id, requires, provides, slots, configSchema
│  │  ├─ components/
│  │  └─ index.js                 #   API pública del módulo (lo único importable desde fuera)
│  │
│  ├─ adapters/<port>/<provider>/ # IMPLEMENTACIONES de un puerto.
│  │                              #   p.ej. adapters/delivery/own-delivery/
│  │                              #         adapters/delivery/uber-direct/     (pendiente)
│  │                              #         adapters/payment/bank-transfer/
│  │                              #         adapters/*/mock/                   (solo demo)
│  │
│  └─ themes/<theme-name>/        # IDENTIDAD VISUAL. Cero lógica.
│     ├─ theme.css                #   tokens: color, tipografía, radio, sombra, densidad
│     ├─ theme.js                 #   solo metadata declarativa (nombre, modo claro/oscuro)
│     └─ assets/                  #   decoraciones propias del theme
│
├─ clients/<client-slug>/         # UN CLIENTE = UNA CARPETA DE DATOS.
│  ├─ BRIEF.md                    #   entrevista y alcance comercial (humano)
│  ├─ blueprint.yaml              #   configuración técnica (máquina)
│  ├─ content/                    #   textos, páginas, productos, categorías
│  ├─ assets/                     #   logo, hero, banners aprobados
│  └─ extensions/                 #   código exclusivo de este cliente (último recurso)
│
├─ docs/                          # ver docs/README.md
└─ (raíz: vite.config.js, components.json, jsconfig.json, eslint.config.js)
```

### Decisiones de ubicación que conviene entender

**`components/ui/` se queda donde está, fuera de `core/`.**
`components.json` ya apunta ahí y `npx shadcn add <x>` escribirá ahí. Moverlo a `core/ui/`
significa pelear con la herramienta en cada componente nuevo, a cambio de nada. Se trata como
**vendor**: primitivas de terceros que actualizamos desde upstream. Lo *nuestro* (ProductCard,
CartDrawer, CheckoutStepper) vive en `core/ui/` y compone esas primitivas.

**`clients/` en la raíz, no en `src/`.**
No es código de aplicación: es datos de negocio con ciclo de vida y permisos propios. Fuera de
`src/` es trivial excluir un cliente de un build, moverlo a otro repositorio, o darle al cliente
acceso solo a su carpeta. Coincide con lo que ya dice `SKILL.md`.

**`ports/` dentro de `core/`, `adapters/` fuera.**
El contrato es del core (el core lo consume y no puede vivir sin él). La implementación es
intercambiable y a menudo depende de un SDK externo. Separarlos es lo que permite cambiar de
proveedor de delivery sin tocar el checkout.

**`themes/` en `src/`, no en `clients/`.**
Un theme es reutilizable: dos clientes de la misma industria pueden compartir base. El blueprint
del cliente *referencia* un theme por nombre y puede sobrescribir tokens puntuales; no lo posee.

---

## 5. Secuencia de arranque

Orden fijo. Si un paso falla, la app **no arranca** y muestra el error — nunca arranca a medias.

1. **Resolver cliente** — `VITE_CLIENT=<slug>` en build. Sin valor → error de build.
2. **Cargar y validar blueprint** — contra el esquema. Campo desconocido = advertencia;
   campo requerido ausente o inválido = error fatal.
3. **Resolver modo** — `demo` | `production` (ver [DEMO-PRODUCTION.md](../business/DEMO-PRODUCTION.md)).
4. **Resolver adaptadores** — un adaptador por puerto activo. En `production`, si algún adaptador
   resuelto es mock → **error fatal**.
5. **Resolver módulos** — expandir dependencias, detectar conflictos, ordenar topológicamente.
   Módulo desconocido, dependencia faltante, conflicto, o puerto sin adaptador = error fatal.
   *(Orden corregido respecto a versiones anteriores de este documento: los adaptadores deben
   estar resueltos antes de validar módulos, porque un módulo puede exigir un puerto activo —
   ver [ADR-0014](DECISIONS.md#adr-0014--adaptadores-antes-que-módulos-en-el-arranque).)*
6. **Aplicar theme** — importar `theme.css`; aplicar overrides de token del blueprint.
7. **Registrar slots** — cada módulo activo publica sus contribuciones.
8. **Montar shell** — router, providers, layout.

El resultado de los pasos 1–5 es un **manifiesto de build** inmutable
(`{ client, coreVersion, blueprintVersion, mode, modules[], adapters{}, theme, commit, builtAt }`)
que se incrusta en la app. Es lo que se lee para responder "¿qué está corriendo esta tienda?"
(ver [VERSIONING.md](VERSIONING.md)).

---

## 6. Sistema de diseño y themes

Tailwind v4 configura el diseño **en CSS**, no en `tailwind.config.js`. Eso encaja perfectamente
con el requisito de `CLAUDE.md` ("variables de diseño separadas del núcleo"), así que el mecanismo
de theming es: **custom properties CSS + `@theme` de Tailwind v4.** Nada de objetos JS de tema.

Tres niveles, en orden de precedencia:

1. **`themes/_base/theme.css`** — el **contrato**. Declara el conjunto completo de tokens con
   valores neutros. Todo token que el core usa debe existir aquí. *No existe todavía; es la primera
   tarea del Bloque 1, porque hoy `src/index.css` no lo tiene.*
2. **`themes/<cliente>/theme.css`** — sobrescribe valores. No puede inventar tokens que el core no
   conozca (si los necesita, el token pertenece al contrato base).
3. **Overrides del blueprint** — ajustes finos por cliente, aplicados como variables inline.

### Tokens del contrato

- **shadcn (obligatorios):** `--background`, `--foreground`, `--card`, `--card-foreground`,
  `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`,
  `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`,
  `--destructive`, `--border`, `--input`, `--ring`, `--radius`.
- **Masa Madre (extensión):** `--font-sans`, `--font-heading`, `--density` (compacto/cómodo),
  `--card-style`, `--shadow-card`, `--shadow-raised`, `--price-color`, `--badge-*`,
  `--decoration-*` (para campañas, ver [SEASONAL-CAMPAIGNS.md](SEASONAL-CAMPAIGNS.md)).

### Regla dura, verificable

> **Prohibido cualquier color literal (`#hex`, `rgb()`, `hsl()`, nombre CSS) dentro de
> `src/core/`, `src/modules/` y `src/components/ui/`.** Solo utilidades semánticas
> (`bg-primary`, `text-muted-foreground`, `border-border`).

Si un componente del core necesita un color que no existe como token, el fallo está en el
contrato de tokens, no en el componente. Se añade el token al base y se propaga.

---

## 7. Alternativas descartadas

| Alternativa | Por qué se descartó |
|---|---|
| **Un repositorio por cliente** (fork del core) | Duplica el core. Prohibido explícitamente por `CLAUDE.md`. Un fix de seguridad exigiría N pull requests. Es exactamente el problema que Masa Madre existe para evitar. |
| **Multi-tenant en runtime** (un despliegue sirve a todos, resuelve cliente por dominio) | Exige backend y resolución de tenant desde el día 1; un blueprint mal formado tumba a todos los clientes a la vez; superficie real de fuga de datos entre tiendas. Para tiendas pequeñas y estáticas, el coste supera al ahorro. **Descartado para MVP, no para siempre**: la capa de composición está diseñada para que migrar signifique cambiar *cuándo* se resuelve el cliente, no *cómo*. |
| **Monorepo con workspaces y `@masamadre/core` publicado** | Es el destino correcto a ~5 clientes. Hoy añade versionado, publicación y enlazado a un proyecto de un solo paquete sin ningún cliente en producción. Se adopta cuando el dolor sea real (ver [VERSIONING.md](VERSIONING.md)). |
| **Themes como objetos JavaScript** (`{ colors: { primary: '#...' } }`) | Rompe la integración con Tailwind v4, obliga a pasar el tema por contexto de React, impide cambiar el tema sin re-render, y permite que un theme contenga lógica — justo lo que se quiere prohibir. Las custom properties CSS lo hacen imposible por construcción. |
| **Todo es un módulo** (incluidos carrito, catálogo, checkout) | Una tienda sin carrito no es una tienda. Convertir lo obligatorio en "opcional" añade 20+ superficies de registro y rutas de fallo que nunca se van a ejercitar. Ver la reclasificación en [MODULES.md](../modules/MODULES.md) y PROP-0001. |
| **Activar features con comentarios / `if` dispersos** | Explícitamente rechazado en el encargo, y con razón: no es auditable, no valida dependencias, y obliga a editar código de aplicación para configurar un cliente. |
| **TypeScript ahora** | Sería mejor para contratos de puertos. Pero el repo ya está en JS con `jsconfig.json` y shadcn configurado con `tsx: false`; migrar a mitad del arranque cuesta más de lo que aporta hoy. **Los contratos se expresan con JSDoc**, que da autocompletado y verificación con `checkJs` sin migración. Revisable (PROP-0011). |

---

## 8. Qué NO existe todavía

> **Corregido el 2026-10-15.** Esta sección describía el repositorio del 2026-09-01 y afirmaba
> "cero código de Masa Madre", lo cual dejó de ser cierto en el Bloque 2. Se mantenía como una
> trampa para cualquier sesión que la leyera. La lista verificada capacidad por capacidad está en
> [audits/FUNCTIONAL-READINESS.md](../audits/FUNCTIONAL-READINESS.md); lo de abajo es el resumen.

**Sí existe** (verificado contra el árbol real): core (`config`, `registry`, `slots`, `routes`,
`ports`, `commerce`, `catalog`), tres módulos (`whatsapp`, `admin-content`, `admin-catalog`),
cuatro adaptadores (`content/filesystem`, `delivery/pickup`, `delivery/own-delivery`,
`payment/mock`), dos themes (`_base`, `demo-medical`), dos clientes de demostración
(`demo`, `demo-medical`) y suite e2e en Playwright.

**Sigue sin existir:**

- **Backend. Ninguno.** Es la restricción que más bloquea: sin él no hay pago real, ni persistencia
  de pedidos, ni gateway de WhatsApp, ni integración con el ERP. Decisión abierta en PROP-0006.
  Ver [PAYMENTS.md § Restricción del stack](PAYMENTS.md#7-restricción-del-stack-actual).
- Integración real con proveedor de pago, flota de delivery externa, WhatsApp API, mapas o
  analítica. El único adaptador de pago es `mock` y rompe el build en producción por diseño.
- Autenticación real. El acceso del admin de catálogo es una contraseña en el blueprint
  (ADR-0021) y **no es seguridad**.
- SEO dinámico: `blueprintSchema.seo` existe pero nada lo consume.
- Auditoría de accesibilidad automatizada y regresión visual.

---

## 9. Documentos relacionados

- Cómo se declara y activa un módulo → [MODULES.md](../modules/MODULES.md)
- Contratos de puerto ya diseñados → [DELIVERY.md](DELIVERY.md), [PAYMENTS.md](PAYMENTS.md)
- Qué configura un cliente → [BLUEPRINT-FORMAT.md](../client-blueprints/BLUEPRINT-FORMAT.md)
- Por qué se decidió todo esto → [DECISIONS.md](DECISIONS.md)
