# Tiers comerciales

> **Responde a:** ¿qué puede modificar cada cliente según lo que contrató, y cómo se implementa eso
> sin mantener dos productos?
>
> **Estado: DISEÑO. No implementado.**

---

## 1. Regla fundacional

> **El tier controla el PANEL DE ADMINISTRACIÓN. Nunca la tienda.**

Un cliente MANAGED y uno OWNERSHIP con los mismos módulos activos tienen **exactamente la misma
tienda**. Lo que cambia es cuánto puede tocar el cliente por su cuenta.

Esto no es un detalle de implementación; es lo que evita los dos fracasos clásicos:

- **Dos bases de código** ("la versión básica" y "la premium") — el escenario que `SKILL.md`
  prohíbe explícitamente. Cada fix habría que hacerlo dos veces.
- **El tier filtrándose al storefront** — un `if (tier === 'premium')` en un componente de producto.
  A partir de ahí, cada componente tiene que saber qué pagó el cliente, y el core deja de ser
  independiente del cliente.

**Corolario práctico:** si un cliente MANAGED quiere cupones, se activa el módulo `coupons`. Su
tier no se lo impide — solo determina que lo configuremos nosotros y no él. Vender funcionalidad y
vender autonomía son dos ejes distintos, y mezclarlos hace imposible razonar sobre el precio.

---

## 2. Los dos tiers

### MANAGED (basic) — *nosotros lo administramos*

Para el comercio que quiere vender, no administrar un sitio.

| | |
|---|---|
| Quién carga el contenido | nosotros |
| Quién configura módulos | nosotros |
| Acceso del cliente | consulta: pedidos, métricas, estado |
| Mantenimiento | incluido |
| Actualizaciones de core | automáticas, en nuestra ventana |
| Marketing | incluido según lo acordado |
| Cambios | por solicitud, dentro del alcance |
| Riesgo de que se rompa | bajo — solo tocamos nosotros |

### OWNERSHIP (premium) — *el cliente lo administra*

Para quien tiene equipo y quiere velocidad sin depender de nosotros.

| | |
|---|---|
| Quién carga el contenido | el cliente |
| Quién configura módulos | el cliente, dentro de límites |
| Acceso del cliente | administración ampliada |
| Mantenimiento | incluido (el core sigue siendo nuestro) |
| Actualizaciones de core | coordinadas con el cliente |
| Marketing | herramientas + capacitación |
| Extras | documentación operativa, formación, exportación de datos |
| Riesgo de que se rompa | mayor — de ahí los límites de §4 |

> **Lo que OWNERSHIP no incluye:** el código fuente del core, ni acceso a modificarlo. "Ownership"
> es sobre los datos y la operación de *su* tienda, no sobre Masa Madre. Conviene que esto esté
> escrito en el `BRIEF.md` del cliente para que no haya malentendido comercial.

---

## 3. `MODULE_ACCESS` — el mecanismo

Dos ejes independientes que se cruzan: **tier** (qué contrató) × **rol** (quién es la persona).

### Roles

| Rol | Quién | Alcance |
|---|---|---|
| `viewer` | staff del cliente | solo lectura |
| `staff` | operación diaria del cliente | pedidos, stock |
| `owner` | dueño del cliente | todo lo que su tier permita |
| `operator` | nosotros | todo en ese cliente |
| `superadmin` | nosotros | todos los clientes, core, despliegues |

### La matriz

Cada capacidad administrable declara el **mínimo** de tier y de rol.

```js
// core/config/moduleAccess.js
export const MODULE_ACCESS = {
  'orders.view':            { minTier: 'managed',   minRole: 'viewer' },
  'orders.updateStatus':    { minTier: 'managed',   minRole: 'staff'  },
  'orders.confirmPayment':  { minTier: 'managed',   minRole: 'owner'  },
  'orders.refund':          { minTier: 'managed',   minRole: 'operator' },

  'catalog.editStock':      { minTier: 'managed',   minRole: 'staff'  },
  'catalog.editPrice':      { minTier: 'ownership', minRole: 'owner'  },
  'catalog.createProduct':  { minTier: 'ownership', minRole: 'owner'  },
  'catalog.bulkImport':     { minTier: 'ownership', minRole: 'owner'  },

  'content.editTexts':      { minTier: 'ownership', minRole: 'staff'  },
  'content.editBanners':    { minTier: 'ownership', minRole: 'owner'  },
  'content.editPages':      { minTier: 'ownership', minRole: 'owner'  },

  'promotions.manage':      { minTier: 'ownership', minRole: 'owner'  },
  'campaigns.activate':     { minTier: 'ownership', minRole: 'owner'  },

  'analytics.view':         { minTier: 'managed',   minRole: 'viewer' },
  'analytics.export':       { minTier: 'ownership', minRole: 'owner'  },

  // Nunca el cliente, en ningún tier:
  'modules.toggle':         { minTier: 'ownership', minRole: 'operator' },
  'theme.edit':             { minTier: 'ownership', minRole: 'operator' },
  'payments.configure':     { minTier: 'managed',   minRole: 'operator' },
  'delivery.configureZones':{ minTier: 'ownership', minRole: 'operator' },
  'blueprint.edit':         { minTier: 'managed',   minRole: 'superadmin' },
}
```

Regla de evaluación: `permitido = tier >= minTier && rol >= minRole`. Ambas condiciones. Un `owner`
de tier MANAGED **no** puede editar precios; un `operator` sí, en cualquier tier.

### Cómo lo consume la UI

```js
if (can('catalog.editPrice')) { /* mostrar el control */ }
```

Requisitos:

- Una capacidad **denegada por rol** se muestra deshabilitada con el motivo.
- Una capacidad **no incluida en el tier** se muestra como mejora disponible, no como error. Es
  información comercial útil, no un castigo.
- Una capacidad **reservada a operadores** simplemente no aparece.

> **Advertencia de seguridad:** `can()` en el frontend es experiencia de usuario, **no seguridad**.
> Cualquiera puede alterar el estado del navegador. Cuando exista backend, cada capacidad debe
> verificarse otra vez del lado del servidor. Un permiso comprobado solo en el cliente es un
> permiso inexistente. Ver [PAYMENTS.md §1](../architecture/PAYMENTS.md#1-reglas-innegociables).

---

## 4. Por qué hay capacidades que ningún cliente tiene

No es avaricia comercial. Son las operaciones donde un error del cliente rompe su tienda y nos deja
a nosotros el soporte:

| Capacidad | Riesgo si el cliente la tuviera |
|---|---|
| `modules.toggle` | Desactivar un módulo del que dependen otros → tienda que no arranca |
| `theme.edit` | Colores sin contraste → tienda inaccesible e inutilizable en móvil |
| `payments.configure` | Un dígito mal en la cuenta bancaria → pagos perdidos, sin rastro |
| `delivery.configureZones` | Zona mal definida → vender envíos que no se pueden cumplir |
| `blueprint.edit` | Blueprint inválido → build roto |

Un cliente OWNERSHIP puede **pedir** estos cambios y se hacen rápido. La diferencia es que pasan por
validación. Cuando el sistema tenga validación automática suficiente (contraste, dependencias,
esquema), varias de estas se pueden abrir con seguridad — el diseño lo permite sin cambios
estructurales, solo bajando el `minRole`.

---

## 5. Cómo se declara y se cambia

En el blueprint, una sola línea:

```yaml
commercial:
  tier: managed        # managed | ownership
  addOns: []
```

**Subir de tier = cambiar esa palabra y redesplegar.** No hay migración de datos, ni cambio de
código, ni otra rama. Ese es el test de que el diseño es correcto.

**Add-ons** para lo que se vende suelto sin cambiar el tier:

```yaml
addOns: [bulk-import, extra-campaign, multi-branch]
```

Un add-on concede capacidades puntuales por encima del tier. Se evalúan después de la matriz:
`permitido = (tier >= minTier || addOns incluye la capacidad) && rol >= minRole`.

---

## 6. Qué implica OWNERSHIP para nosotros

No es solo activar interruptores. Lo que hay que entregar de verdad:

- **Documentación operativa** por cliente: cómo cargar un producto, cómo confirmar un pago, cómo
  publicar un banner. Corta y con capturas de *su* panel, no un manual genérico.
- **Capacitación**: una sesión grabada, específica de su tienda.
- **Guardarraíles reales**: validación en el momento de guardar. Si el cliente puede escribir, el
  sistema tiene que impedirle escribir algo roto. Sin esto, OWNERSHIP genera más soporte que
  MANAGED, y se vuelve un mal negocio.
- **Registro de cambios**: quién cambió qué y cuándo. Imprescindible para diagnosticar
  "esto antes funcionaba".
- **Vía de reversión**: deshacer el último cambio de contenido sin llamarnos.

> Los tres últimos puntos son un coste de ingeniería que hay que presupuestar dentro del tier
> OWNERSHIP. Venderlo sin construirlos convierte el margen en horas de soporte.
