/**
 * Descubrimiento del catálogo de módulos.
 *
 * CAPA FINA DE VITE. Es el único archivo del core que sabe dónde viven los
 * módulos, y aun así NO importa ninguno por su nombre.
 *
 * `import.meta.glob` resuelve el patrón en build. Consecuencia buscada:
 * **añadir un módulo es crear una carpeta con su module.js.** No hay que
 * registrar nada, ni editar el core, ni tocar una lista. Es lo que exige
 * ARCHITECTURE.md §3 ("el core nunca sabe qué módulos existen").
 *
 * Con cero módulos el glob devuelve {} y el catálogo queda vacío: correcto,
 * no es un error.
 */

/**
 * @returns {Record<string, import('./resolve.js').ModuleManifest>} id → manifiesto
 */
export function discoverModules() {
  const found = import.meta.glob('/src/modules/*/module.js', {
    eager: true,
    import: 'default',
  })

  const catalog = {}
  for (const [path, manifest] of Object.entries(found)) {
    const folder = path.split('/').at(-2)

    if (!manifest || typeof manifest !== 'object') {
      throw new Error(`[registry] ${path} no exporta por defecto un manifiesto de módulo.`)
    }
    if (!manifest.id) {
      throw new Error(`[registry] El manifiesto de ${path} no declara "id".`)
    }
    if (manifest.id !== folder) {
      throw new Error(
        `[registry] El módulo en /src/modules/${folder}/ declara id "${manifest.id}". ` +
          `El id y el nombre de la carpeta deben coincidir.`
      )
    }
    if (catalog[manifest.id]) {
      throw new Error(`[registry] Id de módulo duplicado: "${manifest.id}".`)
    }

    catalog[manifest.id] = manifest
  }
  return catalog
}

/**
 * Descubrimiento de adaptadores. Mismo principio: añadir un adaptador es crear
 * src/adapters/<puerto>/<proveedor>/adapter.js.
 *
 * @returns {Record<string, object>} "puerto/proveedor" → adaptador
 */
export function discoverAdapters() {
  const found = import.meta.glob('/src/adapters/*/*/adapter.js', {
    eager: true,
    import: 'default',
  })

  const catalog = {}
  for (const [path, adapter] of Object.entries(found)) {
    const parts = path.split('/')
    const key = `${parts.at(-3)}/${parts.at(-2)}`
    if (!adapter || typeof adapter !== 'object') {
      throw new Error(`[registry] ${path} no exporta por defecto un adaptador.`)
    }
    catalog[key] = adapter
  }
  return catalog
}
