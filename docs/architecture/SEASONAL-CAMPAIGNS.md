# Campañas estacionales

> **Responde a:** ¿cómo se monta Navidad, Black Friday o un aniversario en una tienda sin
> destrozar su identidad visual ni pisar otras promociones?
>
> **Estado: DISEÑO. No implementado.**

---

## 1. El problema

La forma fácil de hacer una campaña estacional es pegar decoración encima: nieve en el header,
banner rojo, todo en oferta. Falla siempre por lo mismo:

- **Ignora el theme.** Una clínica con paleta azul y marrón amanece con rojo y verde navideño.
- **Rompe el contraste.** Un overlay oscuro sobre texto oscuro deja la tienda ilegible.
- **Choca consigo misma.** Banner de Navidad + banner de Black Friday + banner de envío gratis, los
  tres a la vez, compitiendo.
- **No se apaga.** El 3 de enero la tienda sigue con guirnaldas porque nadie la desmontó.
- **Es un parche por cliente.** La misma campaña se rehace desde cero para cada tienda.

Una campaña no es decoración pegada. Es **contenido con fecha, colocado en huecos que el core
declara, expresado en los tokens del theme del cliente.**

---

## 2. Modelo

```
CAMPAÑA = VENTANA TEMPORAL + CONTRIBUCIONES A SLOTS + OVERRIDES DE TOKEN (limitados)
```

Tres restricciones que sostienen todo lo demás:

1. Una campaña **solo puede escribir en slots declarados**. No puede inyectar nada en otro sitio.
2. Una campaña **solo puede sobrescribir tokens de una lista permitida**. No puede cambiar la
   paleta base ni la tipografía.
3. Una campaña **no contiene lógica comercial**. Los descuentos son del módulo `promotions`; la
   campaña es su ropa. Si una campaña necesita calcular un precio, está mal modelada.

La campaña se define **una vez**, en el core, y cada cliente decide si la activa y con qué
contenido. Navidad no se rehace por tienda.

---

## 3. Campaign slots

Distintos de los slots normales (ver [MODULES.md §7](../modules/MODULES.md#7-slots-cómo-se-enchufa-un-módulo-sin-tocar-el-core)):
son **exclusivos** (una campaña por slot) y **opcionales por cliente**.

| Slot | Dónde | Restricciones |
|---|---|---|
| `campaign.announcement` | franja superior, sobre el header | una línea, descartable, altura fija |
| `campaign.header.decoration` | dentro del header | **decorativo puro**, `aria-hidden`, sin capturar clics |
| `campaign.hero.overlay` | sobre el hero | debe preservar el contraste del texto del hero |
| `campaign.promotion.zone` | bloque en la home | bloque completo, contenido libre dentro del theme |
| `campaign.category.banner` | cabecera de listado | por categoría; no tapa los filtros |
| `campaign.product.badge` | tarjeta y detalle de producto | texto corto; convive con badges de stock |
| `campaign.floating.cta` | flotante | **conflicto conocido**: ver §6 |
| `campaign.footer.note` | footer | texto de vigencia y condiciones |

Reglas comunes:

- Un slot vacío no renderiza nada ni reserva espacio.
- Ninguna campaña puede desplazar contenido de forma que altere el layout tras la carga
  (nada de saltos de contenido).
- La decoración es `aria-hidden="true"` y nunca focalizable por teclado.
- Todo slot de campaña respeta `prefers-reduced-motion`: sin animación si el usuario la desactivó.
- El cliente puede **desactivar slots individuales** sin desactivar la campaña entera.

---

## 4. Definición de campaña

```yaml
# src/modules/seasonal-campaigns/campaigns/navidad.yaml
id: navidad
name: "Navidad"
description: "Decoración y promoción de temporada navideña"

window:
  start: "12-01"        # MM-DD → se repite cada año
  end:   "12-26"
  timezone: from-client # SIEMPRE la zona del cliente, nunca la del navegador
  priority: 50          # mayor gana el slot en caso de solapamiento

# Tokens que esta campaña PUEDE tocar. Fuera de esta lista está prohibido.
tokenOverrides:
  allowed: [--campaign-accent, --campaign-surface, --campaign-on-accent, --decoration-pattern]
  defaults:
    --campaign-accent: "var(--primary)"     # por defecto: el theme del cliente, no rojo navideño
    --decoration-pattern: "snow-subtle"

slots:
  campaign.announcement:
    required: false
    content: { key: campaigns.navidad.announcement }
  campaign.header.decoration:
    required: false
    variant: garland
  campaign.hero.overlay:
    required: false
    variant: soft-frame
  campaign.promotion.zone:
    required: false
    content: { key: campaigns.navidad.promo }
  campaign.product.badge:
    required: false
    appliesTo: { promotionTag: navidad }

accessibility:
  enforceContrast: AA         # se valida en build, no en revisión visual
  reducedMotionFallback: static
```

### Activación por cliente

```yaml
# clients/<slug>/blueprint.yaml
marketing:
  seasonal:
    enabled: true
    campaigns:
      - id: navidad
        enabled: true
        slots: [campaign.announcement, campaign.promotion.zone]   # solo estos dos
        tokenOverrides:
          --campaign-accent: "#0F5132"     # verde, pero elegido por el cliente
        window: { start: "12-05", end: "12-24" }   # ajusta las fechas
        content: content/campaigns/navidad.yaml
```

**Lo importante del ejemplo:** el cliente elige *dónde* aparece la campaña y *con qué color*. Por
defecto, `--campaign-accent` hereda `--primary` del theme. Una campaña sin personalizar se ve como
la tienda, no como una plantilla genérica de Navidad.

---

## 5. Campañas base previstas

Definidas en el core, activables por cualquier cliente:

| id | Ventana típica | Nota |
|---|---|---|
| `navidad` | 01-12 → 26-12 | decoración + promoción |
| `black-friday` | variable, se fija por año | fechas absolutas, no `MM-DD` |
| `cyber-monday` | variable | conflicto habitual con `black-friday` |
| `halloween` | 20-10 → 01-11 | decoración fuerte; muchos rubros no aplican |
| `san-valentin` | 05-02 → 15-02 | |
| `dia-de-la-madre` | variable por país | **la fecha cambia según el país** |
| `aniversario` | por cliente | fechas siempre del cliente |
| `liquidacion` | por cliente | sin decoración, solo promoción |

Las de fecha variable llevan `window.dates` con años explícitos y una **advertencia de build** el
año que no esté definido. Es mejor un aviso en el despliegue que una campaña que no se activó.

---

## 6. Conflictos: cómo se resuelven

**En build, no en runtime.** Un solapamiento detectado al desplegar se corrige; uno detectado por
el comprador ya costó una venta.

| Conflicto | Regla |
|---|---|
| Dos campañas activas en el mismo slot | Gana la de mayor `priority`. La otra pierde **ese slot**, no la campaña entera. |
| Empate de prioridad | Error de build. Que lo decida una persona. |
| Campaña + promoción permanente en `promotion.zone` | La campaña gana durante su ventana; la permanente vuelve al terminar. |
| `campaign.floating.cta` + botón de WhatsApp | **Error de build.** Dos flotantes en móvil tapan el contenido y se pisan. El cliente elige uno. |
| Color de campaña sin contraste AA sobre el theme | Error de build, con el ratio calculado y una sugerencia. |
| Color de campaña en `branding.colors.forbidden` | Error de build. |
| Campaña activa con `promotions` desactivado | Advertencia: se verá la decoración sin ofertas detrás. |

### Fin de vigencia

- La ventana se evalúa en la **zona horaria del cliente**. Una campaña que termina "el 24" no puede
  seguir activa para un comprador en otro huso.
- El sitio es estático: **una campaña no se apaga sola sin un redespliegue.** Hay dos opciones y la
  diferencia debe estar clara con el cliente:
  - **Evaluación en el navegador** con la fecha del dispositivo — se apaga sola, pero un reloj mal
    puesto la muestra fuera de fecha.
  - **Evaluación en build** — fiable, pero exige un redespliegue programado al cerrar la ventana.
- **Recomendación:** evaluar en el navegador para *ocultar* (falla del lado seguro: si el reloj está
  mal, como mucho no se ve la decoración) y programar igualmente el redespliegue de cierre. La
  fecha de fin entra en el checklist de la campaña.

---

## 7. Qué **no** puede hacer una campaña

Lista cerrada. Si una campaña necesita algo de aquí, el diseño está mal:

- ❌ Cambiar `--primary`, `--background`, `--foreground` ni ninguna tipografía.
- ❌ Inyectar CSS arbitrario o etiquetas `<style>`.
- ❌ Modificar precios, stock o reglas de descuento (eso es `promotions`).
- ❌ Añadir pasos al checkout o alterar su flujo.
- ❌ Cargar recursos de terceros (fuentes, scripts, imágenes externas).
- ❌ Escribir en slots que no sean de campaña.
- ❌ Cubrir controles interactivos con decoración.
- ❌ Reproducir sonido, o animar sin respetar `prefers-reduced-motion`.

---

## 8. Checklist para lanzar una campaña

- [ ] Fechas confirmadas por el cliente, en su zona horaria.
- [ ] Contraste AA verificado con el theme del cliente (validación de build).
- [ ] Ningún color prohibido del cliente en uso.
- [ ] Probada en móvil: la decoración no tapa CTA ni navegación.
- [ ] Probada con `prefers-reduced-motion: reduce`.
- [ ] Sin conflicto de flotantes.
- [ ] Las promociones que la campaña anuncia **existen** y están activas.
- [ ] Fecha de cierre y redespliegue agendados.
- [ ] Si es de fecha variable, el año en curso está definido.
