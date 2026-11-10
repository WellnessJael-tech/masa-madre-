# System Overview — Masa Madre

> **Para quién es esto:** una IA o diseñador que va a trabajar la presentación visual sin haber
> visto el código. Este documento da el mapa conceptual completo antes de tocar cualquier detalle.
> Léelo primero — el resto de `docs/design/` asume que ya entendiste esto.

---

## Qué es Masa Madre

Un motor de e-commerce reutilizable. No es una plantilla que se copia por cliente — es un **core**
único que, combinado con datos distintos por cliente, produce tiendas distintas. La prueba de que
esto funciona ya existe: dos clientes de demostración (`demo`, panadería; `demo-medical`, clínica)
corren sobre el **mismo** código de core, con **cero** líneas de diferencia en `src/core/`,
`src/modules/` o `src/adapters/` entre ambos.

```
TIENDA = CORE + MODULES + BLUEPRINT + CONTENT + THEME + PRESENTATION
```

## Las seis capas, en una frase cada una

| Capa | En una frase | Quién la toca |
|---|---|---|
| **CORE** | La lógica universal: catálogo, carrito, checkout, entrega, sistema de módulos. | Nosotros, rara vez. |
| **MODULES** | Funcionalidad opcional, activable por cliente sin tocar código. | Nosotros, al crear un módulo nuevo. |
| **BLUEPRINT** | Los datos de un cliente: identidad, qué módulos usa, catálogo, logística. | Nosotros, por cliente. |
| **CONTENT** | Productos, categorías — los datos concretos que el BLUEPRINT referencia. | Nosotros o el cliente (admin). |
| **THEME** | Colores, tipografía, radios — la identidad visual pura. | **La capa que vas a diseñar.** |
| **PRESENTATION** | Los componentes React que arman la interfaz con esos datos y esos tokens. | **La capa que vas a diseñar.** |

## Sus límites, sin ambigüedad

- **CORE nunca sabe qué cliente lo está usando.** Lee el BLUEPRINT en el arranque y ya. No hay
  ningún `if (cliente === 'x')` en ningún archivo de `core/`.
- **CORE nunca sabe qué módulos existen.** Los descubre por convención de carpetas
  (`src/modules/*/module.js`) al arrancar. Un módulo se enchufa en "slots" con nombre que el CORE
  declara; si no hay ningún módulo activo para un slot, ese slot no renderiza nada.
- **THEME nunca contiene lógica.** Es CSS puro (variables). Un theme no puede decidir qué mostrar,
  solo cómo se ve lo que el CORE ya decidió mostrar.
- **PRESENTATION nunca decide reglas de negocio.** Recibe datos ya calculados (totales, stock
  disponible, opciones de entrega ya cotizadas) y los muestra. No recalcula nada.
- **BLUEPRINT nunca contiene código ni JSX.** Es YAML + archivos de contenido. Configura
  comportamiento que el CORE ya sabe ejecutar; no puede inventar comportamiento nuevo.

## Cómo arranca una tienda (para entender qué es "dato ya resuelto")

1. Se elige un cliente en el momento de compilar (`VITE_CLIENT=demo`) — **un build por cliente**,
   no una tienda multi-inquilino en runtime.
2. Se carga y valida su `blueprint.yaml`. Un blueprint inválido detiene el arranque con un error
   claro — nunca se muestra una tienda a medio configurar.
3. Se resuelve el modo (`demo` o `production`) y los adaptadores (pago, entrega, contenido).
4. Se resuelven los módulos activos, validando sus dependencias.
5. Se aplica el THEME del cliente.
6. Recién ahí se monta la interfaz.

**Consecuencia para el diseño:** cuando un componente de PRESENTATION recibe datos (un producto,
un total, una lista de opciones de entrega), esos datos **ya están calculados y validados**. El
componente no valida ni calcula — muestra.

## Los dos clientes de referencia

| | `demo` | `demo-medical` |
|---|---|---|
| Rubro | Panadería artesanal | Clínica / productos médicos |
| Theme | `_base` (neutro) | `demo-medical` (azul + marrón) |
| Módulos activos | `whatsapp`, `admin-content`, `admin-catalog` | `admin-content`, `admin-catalog` (`whatsapp` apagado a propósito) |
| Qué prueba | El caso base | Que un rubro distinto, con módulos distintos y colores distintos, corre sobre el mismo core |

Ninguno de los dos es un cliente real — son la prueba viviente de reutilización. Están en
`clients/demo/` y `clients/demo-medical/`.

## Qué leer después

Ver `docs/design/README.md` para el orden recomendado según lo que vayas a hacer.
