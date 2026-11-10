# Contrato entre lógica y diseño — Masa Madre

> **Para quién es este documento:** define, capa por capa, qué controla cada parte del sistema.
> Úsalo junto a `COMPONENTS.md` (que describe cada componente/pantalla) para saber, ante
> cualquier duda, **dónde** cambiar algo y **qué no se puede tocar** desde ahí.
>
> Frase resumen para dársela a una IA de diseño: *"Puedes rediseñar todo lo que controla
> PRESENTATION y THEME. Puedes pedir cambios a BLUEPRINT si necesitas un dato nuevo, pero no
> inventes que ya existe. No toques CORE ni MODULES — no son capas de diseño."*

---

## 1. CORE — qué entrega

El núcleo funcional: catálogo, carrito, checkout, entrega, pedidos, sistema de módulos, sistema de
configuración. **Universal — igual para cualquier cliente.**

Entrega a la capa de presentación:
- **Datos ya resueltos y validados**: catálogo (productos, categorías), líneas de carrito con
  subtotales, opciones de entrega con tarifas ya calculadas, total a cobrar, estado del pedido.
- **Comportamiento**: agregar/quitar del carrito, cambiar cantidad, elegir entrega, confirmar
  pago, navegar entre páginas.
- **Puntos de extensión con nombre** ("slots") donde un módulo puede insertar contenido, y rutas
  completas que un módulo puede registrar (ej. `/admin`).
- **Tokens de theme** (variables CSS) que la presentación consume para pintar cualquier cosa.

El CORE **nunca** decide:
- Colores, tipografías, espaciado, composición visual.
- Qué módulos existen (los descubre por convención de carpetas, no los conoce por nombre).
- Contenido de marca (nombre, textos, imágenes) — eso siempre viene del BLUEPRINT.

**No se puede modificar sin razón real.** Antes de tocar código de `core/`, la pregunta obligatoria
es: *¿esto lo necesitan todos los clientes?* Si la respuesta es "depende del cliente", el cambio no
va en CORE — va en BLUEPRINT, THEME, o un MODULE.

---

## 2. PRESENTATION — qué puede modificar

Todo lo que **se ve**, dentro de los límites que impone el CORE. Esto es lo que una IA/diseñador
externo va a rediseñar.

**Puede modificar libremente:**
- Composición: dónde va cada bloque, en qué orden, con qué layout (grilla, lista, carrusel).
- Tipografía, espaciado, densidad, bordes, sombras (a través de tokens del THEME).
- Iconografía, ilustraciones, animaciones (respetando `prefers-reduced-motion`).
- Cómo se agrupan visualmente los pasos del checkout (una página, un wizard de varios pasos —
  mientras los mismos campos y el mismo botón de confirmación sigan existiendo).
- Estilo de cada estado (vacío, error, cargando, sin stock) — el contenido del mensaje puede
  adaptarse en tono, pero no puede desaparecer ni mentir sobre el estado real.

**No puede modificar (pertenece al CORE, no a PRESENTATION):**
- Qué campos son obligatorios en un formulario (ej. nombre/teléfono en checkout).
- El cálculo de totales, tarifas de entrega, o stock disponible.
- Cuándo se muestra un aviso obligatorio (demo, disclaimer de salud, error de pago) — puede
  cambiar CÓMO se ve, no SI aparece.
- La existencia de una acción funcional requerida (agregar al carrito, confirmar pedido, elegir
  entrega) — puede cambiar su apariencia, no eliminarla.

---

## 3. BLUEPRINT — qué configura

El archivo de datos de un cliente (`clients/<slug>/blueprint.yaml` + su contenido). Es lo que hace
que la MISMA presentación y el MISMO core produzcan tiendas distintas.

**Configura:**
- Identidad: nombre, descripción, tagline, industria, tono, datos de contacto, redes sociales.
- Qué THEME usa el cliente.
- Qué MODULES están activos y su configuración (contraseña de admin, teléfono de WhatsApp, texto
  de anuncio, etc.).
- Catálogo: productos, categorías, precios, stock, imágenes (vía contenido del cliente).
- Comercio: moneda, si el precio muestra impuestos incluidos.
- Logística: sucursales, zonas de entrega, tarifas, umbral de envío gratis.
- Pagos: qué adaptador(es) de pago están activos.
- Umbrales de negocio: a partir de qué stock se considera "bajo".

**No configura (no es su rol):**
- Nada visual directamente — el aspecto lo controla el THEME, no el BLUEPRINT. El BLUEPRINT dice
  *qué* THEME usar, no *cómo* se ve ese THEME.
- Lógica de negocio nueva — el BLUEPRINT parametriza comportamiento que el CORE ya sabe ejecutar,
  no puede inventar comportamiento nuevo.

**Si el diseño necesita un dato que el BLUEPRINT no tiene hoy** (ej. una imagen de portada para el
hero, un campo "producto destacado"), **no asumir que existe** — debe proponerse como una
extensión del esquema del blueprint (ver `COMPONENTS.md` secciones "Hero" y "Featured products",
y `BLUEPRINT-MANUAL.md` §"Campos que el diseño NO debe asumir que existen", para ejemplos
concretos de esto).

---

## 4. MODULES — qué funcionalidades puede activar/desactivar

Piezas de funcionalidad opcionales, activables por cliente vía BLUEPRINT, sin tocar código.

**Módulos que existen hoy:**
| Módulo | Qué hace | Depende de |
|---|---|---|
| `whatsapp` | Botón de contacto flotante por WhatsApp | — |
| `admin-content` | Anuncio de sitio editable | — |
| `admin-catalog` | Alta/edición/baja de productos, carga masiva por CSV | `admin-content` |

**Lo que un módulo puede aportar a la presentación:**
- Contenido dentro de un "slot" ya declarado por el CORE (una posición fija: arriba del header,
  dentro del header, en el footer, en la home). Un módulo **no puede** aparecer en un lugar que el
  CORE no haya declarado.
- Una ruta completa nueva (ej. `/admin`), con su propio diseño interno, independiente del
  storefront.

**Relación con PRESENTATION:** un módulo activo puede estar ausente en la interfaz (si el slot
donde contribuye no se renderiza, o si el cliente lo desactivó) — **el diseño de cualquier zona
que reciba contenido de un módulo debe funcionar igual de bien vacía que con contenido.**

**No confundir con BLUEPRINT:** un módulo se activa/desactiva y se configura desde el BLUEPRINT,
pero el módulo en sí es código — el diseño no "activa" un módulo, solo debe soportar su presencia
o ausencia.

---

## 5. THEME — qué propiedades visuales controla

El conjunto de variables CSS (tokens) que define la identidad visual de un cliente. Es la capa que
una IA de diseño edita más directamente.

**Controla:**
- Paleta de color completa (fondo, texto, color primario/secundario/de acento, bordes, estados de
  error) — un conjunto fijo de tokens ya definidos en `themes/_base/theme.css`.
- Tipografía (familia de fuente para texto y para títulos).
- Radio de bordes, densidad general.
- Un token de "ancho máximo de página".

**No controla (no es su rol):**
- Lógica de negocio, ni siquiera indirectamente. Un theme es CSS puro — no puede decidir qué
  mostrar, solo cómo se ve lo que el CORE ya decidió mostrar.
- Colores de marcas de terceros (ej. el verde de WhatsApp) — esos son tokens **fijos** del
  contrato base, deliberadamente no sobreescribibles por theme (la identidad de un proveedor
  externo no debería cambiar según el cliente).

**Cómo se crea un theme nuevo:** un archivo `theme.css` que sobrescribe los valores de los tokens
ya existentes. **No se pueden inventar tokens nuevos** sin que el CORE los declare primero en el
contrato base — si un diseño necesita una variable que no existe (ej. un color específico para un
badge de "nuevo"), debe proponerse como una extensión del contrato de tokens, no crearse suelta
dentro de un theme.

---

## 6. Resumen en una tabla

| Pregunta | Capa responsable |
|---|---|
| ¿Qué campos tiene el formulario de checkout? | CORE |
| ¿Cómo se ven esos campos, en qué orden, en qué página? | PRESENTATION |
| ¿Qué colores usa esa página? | THEME |
| ¿Está habilitado el checkout con contra-entrega? | BLUEPRINT (vía MODULES/adapters) |
| ¿Aparece un botón de WhatsApp? | BLUEPRINT (activa o no el módulo `whatsapp`) |
| ¿Dónde aparece ese botón en la pantalla? | CORE (el slot donde el módulo se enchufa) + THEME (color) |
| ¿Qué dice el mensaje de WhatsApp? | BLUEPRINT (config del módulo) |
| ¿Puedo agregar un carrusel de productos destacados? | Requiere extender BLUEPRINT primero (el dato no existe) — luego es PRESENTATION |

---

## 7. Instrucción lista para copiar a una IA de diseño

Ver `docs/design/README.md` para la instrucción completa y el orden de lectura recomendado — este
documento (`DESIGN-CONTRACT.md`) es el segundo que debe leerse, después de `SYSTEM-OVERVIEW.md`.
