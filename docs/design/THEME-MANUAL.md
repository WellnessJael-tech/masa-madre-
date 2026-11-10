# Theme Manual — Masa Madre

> Cómo funciona el sistema visual **hoy**, tal como existe en `src/themes/_base/theme.css`. No es
> un sistema de diseño aspiracional — es exactamente lo que hay.

---

## El mecanismo

Un theme es un archivo CSS que declara variables (`--token: valor`). `src/themes/_base/theme.css`
es el **contrato**: declara TODOS los tokens que el core puede usar, con valores neutros. Un theme
de cliente (ej. `src/themes/demo-medical/theme.css`) **sobrescribe valores**, nunca inventa tokens
nuevos.

En el arranque, `main.jsx` importa dinámicamente el `theme.css` del cliente **después** del
contrato base — por cascada CSS normal, sus valores ganan sin necesitar más especificidad. Esto es
lo que permite que `demo` y `demo-medical` tengan colores distintos con el mismo código de
componentes.

**Consecuencia práctica:** crear un theme nuevo es escribir un archivo CSS de ~10-20 líneas que
solo sobrescribe los tokens que quieres cambiar. No hay que tocar ningún componente.

## Tokens disponibles

### Color (todos son valores de color válidos en CSS — hoy en formato `oklch()`, pero puede ser
cualquier sintaxis de color CSS)

| Token | Uso |
|---|---|
| `--background` / `--foreground` | Fondo y texto de página |
| `--card` / `--card-foreground` | Fondo y texto de tarjetas (`ProductCard`, etc.) |
| `--popover` / `--popover-foreground` | Menús/paneles flotantes |
| `--primary` / `--primary-foreground` | Color de marca principal — botones, links activos |
| `--secondary` / `--secondary-foreground` | Color de marca secundario |
| `--accent` / `--accent-foreground` | Acentos |
| `--muted` / `--muted-foreground` | Texto/fondo de menor énfasis |
| `--destructive` | Errores, "sin stock", acciones destructivas |
| `--border` / `--input` / `--ring` | Bordes, campos de formulario, foco |
| `--chart-1` … `--chart-5` | Reservados para futuros gráficos (sin uso hoy) |
| `--sidebar*` | Reservados para un futuro panel de administración con sidebar (sin uso hoy) |

### Tipografía

| Token | Uso |
|---|---|
| `--mm-font-sans` | Fuente de texto general (mapea a la utilidad `font-sans`) |
| `--mm-font-heading` | Fuente de títulos (mapea a `font-heading`) |
| `--mm-font-mono` | Fuente monoespaciada (uso técnico, poco visible) |

### Layout y forma

| Token | Uso |
|---|---|
| `--radius` | Radio de borde base — todas las utilidades `rounded-*` derivan de este único valor |
| `--mm-layout-max` | Ancho máximo de página (mapea a `max-w-page`) |

### Marca de terceros (fijos, NO sobreescribibles por theme de cliente a propósito)

| Token | Uso |
|---|---|
| `--mm-whatsapp-brand` / `--mm-whatsapp-brand-foreground` | El verde de WhatsApp. Es identidad de ese proveedor, no del cliente — vive en el contrato base únicamente. |

## Lo que NO es configurable por theme (todavía)

- **Sombras.** No hay tokens de `shadow` en el contrato — los componentes que usan sombra (poco
  frecuente) usan las utilidades por defecto de Tailwind, no un token propio.
- **Densidad/spacing como token único.** No existe un `--density` que reescale todo el espaciado —
  el espaciado se define por componente con utilidades de Tailwind (`gap-4`, `p-3`, etc.), no por
  una variable global.
- **Variantes de componente** (ej. "card con borde" vs. "card con sombra") — no existe un
  mecanismo de variantes por theme; cambiar la apariencia de un componente requiere editar sus
  clases directamente (esto es una limitación real, no una feature oculta).

Si el diseño necesita cualquiera de estos, es una extensión real del sistema de tokens, no un
cambio de valores — ver `DESIGN-TO-CODE.md`.

## Regla dura

**Prohibido cualquier color literal (`#hex`, `rgb()`, nombre de color) dentro de `core/`,
`modules/` y `components/ui/`.** Solo utilidades semánticas (`bg-primary`,
`text-muted-foreground`). Esto se verifica hoy por revisión manual, no por una regla de lint
automática (`eslint-plugin-boundaries` sigue pendiente de instalar).

## Themes que existen hoy

| Theme | Cliente | Color primario | Nota |
|---|---|---|---|
| `_base` | `demo` | Neutro (gris oscuro) | El contrato completo, valores por defecto |
| `demo-medical` | `demo-medical` | Azul `#1e4e8c` | Sobrescribe primary/secondary/accent/ring/radius — 8 líneas de CSS |

`src/themes/demo-medical/theme.css` es el ejemplo completo más corto de "cómo se ve un theme
nuevo" — vale la pena abrirlo antes de crear uno.
