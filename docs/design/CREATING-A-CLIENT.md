# Creación de un cliente nuevo — Masa Madre

> Proceso completo, usando `clients/demo/` y `clients/demo-medical/` como ejemplos reales de cada
> paso. Ninguno de los dos es un cliente real — son la prueba de que el proceso funciona.

## 1. Blueprint

Crear `clients/<slug>/blueprint.yaml`. Copiar uno de los dos existentes como punto de partida (son
casi idénticos en estructura; difieren en identidad, theme, y qué módulos activan). Ver
`BLUEPRINT-MANUAL.md` para cada campo. Mínimo indispensable: `schemaVersion`, `blueprintVersion`,
`core`, `slug` (= nombre de la carpeta), `status: draft`, `identity.tradeName`, `design.theme`,
`assets.approved: false` (hasta tener recursos reales), `commerce.currency`, `commercial.tier`.

## 2. Theme

Si el cliente usa un theme ya existente (`_base`), no hace falta nada. Si necesita uno propio:
crear `src/themes/<nombre>/theme.css` sobrescribiendo solo los tokens que cambian (ver
`THEME-MANUAL.md`). Referenciarlo en `design.theme` del blueprint.

## 3. Content (categorías)

Crear `clients/<slug>/content/categories.yaml` — una lista de `{id, name}`. Ver
`clients/demo/content/categories.yaml`.

## 4. Products

Crear `clients/<slug>/content/products/<id>.yaml`, uno por producto. Ver
`clients/demo/content/products/` (4 ejemplos reales, incluyendo un caso sin stock y uno con
descuento). El `categoryId` de cada producto debe existir en `categories.yaml` — si no,
`npm run validate` lo rechaza con un mensaje claro.

## 5. Modules

En `blueprint.yaml`, sección `modules:` — activar los que correspondan (`whatsapp`,
`admin-content`, `admin-catalog`). Recordar: `admin-catalog` requiere `admin-content` activo.

## 6. Assets

Logo, íconos, imágenes de producto — hoy son **URLs** (campo `images[].src` de cada producto, y
`identity.contact`/branding sin campos de imagen todavía). No hay subida de archivos real.

## 7. Configuración (delivery, pagos, contacto)

- `branches:` — al menos una sucursal con `pickup: true` si se quiere ofrecer retiro.
- `delivery.adapters: [pickup, own-delivery]` — activa los adaptadores de entrega.
- `delivery.ownDelivery.zones:` — al menos una zona con `fee` (y opcionalmente `freeOver`).
- `payments.adapters: [mock]` — el único adaptador de pago que existe hoy (simulado).
- `identity.contact.email/phone/socials` — para el footer y el enlace de WhatsApp post-pedido.

## 8. Ejecución local

```
VITE_CLIENT=<slug> VITE_MODE=demo npm run dev
```

(o editar `.env` para no repetir la variable en cada comando — es lo que hacen `demo`/`demo-medical`
hoy vía `playwright.config.js`, que levanta un servidor por cliente en un puerto distinto para
poder compararlos en la misma corrida de tests).

## 9. Pruebas

```
npm run validate          # valida el blueprint y el catálogo de TODOS los clientes, sin Vite
npm test                  # tests unitarios del core (no dependen de ningún cliente)
npx playwright test       # end-to-end contra los clientes configurados en playwright.config.js
```

Para agregar el cliente nuevo a la verificación end-to-end, sumar un `webServer` más en
`playwright.config.js` (mismo patrón que `demo`/`demo-medical`) y especs que naveguen a su puerto.

## 10. Build / Deploy

```
VITE_CLIENT=<slug> VITE_MODE=production npm run build
```

**Antes de que esto funcione de verdad en producción hace falta `assets.approved: true` y
`status: live`** — y el proyecto todavía no tiene backend ni hosting configurado (ver
`docs/architecture/DECISIONS.md`, PROP-0006). El build en sí compila; publicarlo es un paso
posterior no resuelto todavía.

## Diferencia real entre `demo` y `demo-medical`, línea por línea

Para ver el proceso completo aplicado, comparar ambos blueprints directamente
(`clients/demo/blueprint.yaml` vs. `clients/demo-medical/blueprint.yaml`) — las diferencias son
exactamente: `identity.*`, `design.theme`, qué módulos están `enabled`, contraseñas de
`admin-catalog`, y los montos de `delivery`. **Ningún archivo de `src/core/`, `src/modules/` ni
`src/adapters/` cambia entre los dos.** Esa es la prueba de reutilización.
