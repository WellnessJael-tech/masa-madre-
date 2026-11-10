#!/usr/bin/env node
/**
 * Valida el blueprint de todos los clientes (o de uno).
 *
 *   npm run validate
 *   npm run validate -- demo
 *
 * Corre en Node puro, sin Vite, porque importa únicamente los módulos puros
 * del core. Es la puerta de despliegue de
 * docs/architecture/VERSIONING.md §8: si esto falla, no se despliega.
 *
 * Sale con código 1 si algún cliente tiene errores.
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

import { parseAndValidate } from '../src/core/config/blueprint/parse.js'
import { ConfigError, formatWarnings } from '../src/core/config/errors.js'
import { resolveModules } from '../src/core/registry/resolve.js'
import { resolveAdapters, flattenAdapters } from '../src/core/config/adapters.js'
import { resolveMode, checkNoMocksInProduction } from '../src/core/config/mode.js'
import { parseProduct, parseCategories, crossValidateCatalog } from '../src/core/catalog/parse.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { version: coreVersion } = createRequire(import.meta.url)('../package.json')
const clientsDir = join(root, 'clients')

const only = process.argv[2]

if (!existsSync(clientsDir)) {
  console.error(`✖ No existe la carpeta clients/ en ${root}`)
  process.exit(1)
}

const slugs = readdirSync(clientsDir)
  .filter((name) => statSync(join(clientsDir, name)).isDirectory())
  .filter((name) => !name.startsWith('_'))
  .filter((name) => (only ? name === only : true))
  .sort()

if (slugs.length === 0) {
  console.error(only ? `✖ No existe el cliente "${only}".` : '✖ No hay clientes que validar.')
  process.exit(1)
}

// Sin Vite no hay import.meta.glob, así que el catálogo se descubre con fs.
// El resultado es equivalente al de core/registry/catalog.js.
const moduleCatalog = await discoverModulesFromDisk()
const adapterCatalog = await discoverAdaptersFromDisk()

console.log(
  `Core ${coreVersion} · ${slugs.length} cliente(s) · ` +
    `${Object.keys(moduleCatalog).length} módulo(s) · ` +
    `${Object.keys(adapterCatalog).length} adaptador(es)\n`
)

let failed = 0

for (const slug of slugs) {
  const source = join(clientsDir, slug, 'blueprint.yaml')

  if (!existsSync(source)) {
    console.error(`✖ ${slug}: falta blueprint.yaml`)
    failed++
    continue
  }

  try {
    const { blueprint, warnings } = parseAndValidate(
      readFileSync(source, 'utf8'),
      slug,
      `clients/${slug}/blueprint.yaml`,
      { coreVersion }
    )

    const allWarnings = [...warnings]

    const mode = resolveMode({ rawMode: process.env.VITE_MODE, blueprint })
    allWarnings.push(...mode.warnings)
    if (mode.errors.length > 0) throw asError('Modo inválido', mode.errors, slug)

    const adapters = resolveAdapters(adapterCatalog, blueprint)
    allWarnings.push(...adapters.warnings)
    if (!adapters.ok) throw asError('Adaptadores', adapters.errors, slug)

    const mocks = checkNoMocksInProduction(mode.mode, flattenAdapters(adapters.adapters))
    if (mocks.length > 0) throw asError('Mocks en producción', mocks, slug)

    const modules = resolveModules(moduleCatalog, blueprint.modules, {
      availablePorts: adapters.availablePorts,
    })
    allWarnings.push(...modules.warnings)
    if (!modules.ok) throw asError('Módulos', modules.errors, slug)

    const catalog = validateClientCatalog(slug)
    if (catalog.errors.length > 0) throw asError('Catálogo', catalog.errors, slug)

    console.log(
      `✔ ${slug} — v${blueprint.blueprintVersion} · core "${blueprint.core}" · ` +
        `${blueprint.status} · modo ${mode.mode} · theme ${blueprint.design.theme} · ` +
        `${modules.modules.length} módulo(s) · ${catalog.products.length} producto(s)`
    )
    const text = formatWarnings(`${allWarnings.length} aviso(s)`, allWarnings)
    if (text) console.log(indent(text))
  } catch (error) {
    failed++
    console.error(error instanceof ConfigError ? error.format() : `✖ ${slug}: ${error.message}`)
  }
  console.log('')
}

if (failed > 0) {
  console.error(`✖ ${failed} de ${slugs.length} cliente(s) con errores.`)
  process.exit(1)
}
console.log(`✔ ${slugs.length} cliente(s) válidos.`)

// ── helpers ────────────────────────────────────────────────────────────────

function asError(title, issues, slug) {
  return new ConfigError(`${slug}: ${title}`, { issues })
}

function indent(text) {
  return text
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n')
}

async function discoverModulesFromDisk() {
  const dir = join(root, 'src', 'modules')
  const catalog = {}
  if (!existsSync(dir)) return catalog

  for (const folder of readdirSync(dir)) {
    const file = join(dir, folder, 'module.js')
    if (!existsSync(file)) continue
    const manifest = (await import(`file://${file}`)).default
    if (manifest?.id) catalog[manifest.id] = manifest
  }
  return catalog
}

/**
 * Valida el catálogo de un cliente en disco (sin Vite). Reutiliza las mismas
 * funciones puras que usa el adaptador content/filesystem en el navegador.
 */
function validateClientCatalog(slug) {
  const categoriesPath = join(clientsDir, slug, 'content', 'categories.yaml')
  const categories = existsSync(categoriesPath)
    ? parseCategories(
        readFileSync(categoriesPath, 'utf8'),
        `clients/${slug}/content/categories.yaml`
      )
    : []

  const productsDir = join(clientsDir, slug, 'content', 'products')
  const products = existsSync(productsDir)
    ? readdirSync(productsDir).map((file) =>
        parseProduct(
          readFileSync(join(productsDir, file), 'utf8'),
          `clients/${slug}/content/products/${file}`
        )
      )
    : []

  return { products, categories, errors: crossValidateCatalog(products, categories) }
}

/**
 * Lee adapter.meta.js, NO adapter.js: la implementación real usa
 * import.meta.glob, que solo existe bajo Vite. Ver adapter.meta.js.
 */
async function discoverAdaptersFromDisk() {
  const dir = join(root, 'src', 'adapters')
  const catalog = {}
  if (!existsSync(dir)) return catalog

  for (const port of readdirSync(dir)) {
    const portDir = join(dir, port)
    if (!statSync(portDir).isDirectory()) continue
    for (const provider of readdirSync(portDir)) {
      const file = join(portDir, provider, 'adapter.meta.js')
      if (!existsSync(file)) continue
      catalog[`${port}/${provider}`] = (await import(`file://${file}`)).default
    }
  }
  return catalog
}
