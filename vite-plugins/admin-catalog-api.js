/**
 * Middleware de SOLO DESARROLLO que expone un API minimo para que el modulo
 * admin-catalog escriba en los MISMOS archivos YAML que lee
 * adapters/content/filesystem — no un sistema paralelo.
 *
 * ⚠️ SOLO EXISTE EN `vite dev` (apply: 'serve'). Nunca se incluye en
 * `vite build`. Un despliegue estatico (Netlify, Vercel static, S3...) no
 * tiene un proceso de servidor que pueda atender esto — es una herramienta
 * de edicion local, no un backend de produccion.
 * Ver docs/architecture/DECISIONS.md ADR-0021 y docs/architecture/
 * DECISIONS.md PROP-0006 (decidir el backend real sigue pendiente).
 *
 * Reutiliza el mismo contrato de producto que valida el resto del sistema
 * (core/catalog/schema.js + core/config/schema/validator.js) — un producto
 * invalido no se puede escribir desde aqui tampoco.
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { load as parseYaml, dump } from 'js-yaml'
import { validate } from '../src/core/config/schema/validator.js'
import { productSchema, categoryListSchema } from '../src/core/catalog/schema.js'

const CLIENT_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const API_PREFIX = '/__admin-api/products'

export function adminCatalogApiPlugin() {
  return {
    name: 'masa-madre-admin-catalog-api',
    apply: 'serve', // NUNCA en build de produccion.
    configureServer(server) {
      server.middlewares.use(API_PREFIX, (req, res) => {
        handle(req, res).catch((error) => send(res, 500, { error: error.message }))
      })
    },
  }
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost')
  const slug = url.searchParams.get('client')
  if (!slug || !CLIENT_PATTERN.test(slug)) {
    return send(res, 400, { error: 'Parámetro "client" ausente o inválido.' })
  }

  const root = process.cwd()
  const productsDir = join(root, 'clients', slug, 'content', 'products')
  const categoriesPath = join(root, 'clients', slug, 'content', 'categories.yaml')

  // req.url ya viene sin el prefijo de middlewares.use(); solo queda "" o "/<id>".
  const id = req.url.split('?')[0].replace(/^\/+/, '') || null

  if (req.method === 'GET' && !id) {
    return send(res, 200, {
      products: listProductFiles(productsDir),
      categories: readCategories(categoriesPath),
    })
  }

  if (req.method === 'POST' && !id) {
    const body = await readJsonBody(req)
    const result = validate(body, productSchema)
    if (!result.ok) return send(res, 422, { error: formatIssues(result.errors) })

    mkdirSync(productsDir, { recursive: true })
    const filePath = join(productsDir, `${result.value.id}.yaml`)
    if (existsSync(filePath)) {
      return send(res, 409, { error: `Ya existe un producto con id "${result.value.id}".` })
    }
    writeFileSync(filePath, dump(result.value), 'utf8')
    return send(res, 201, result.value)
  }

  if (req.method === 'PUT' && id) {
    const body = await readJsonBody(req)
    const result = validate({ ...body, id }, productSchema)
    if (!result.ok) return send(res, 422, { error: formatIssues(result.errors) })

    const filePath = join(productsDir, `${id}.yaml`)
    if (!existsSync(filePath)) return send(res, 404, { error: `No existe el producto "${id}".` })
    writeFileSync(filePath, dump(result.value), 'utf8')
    return send(res, 200, result.value)
  }

  if (req.method === 'DELETE' && id) {
    const filePath = join(productsDir, `${id}.yaml`)
    if (!existsSync(filePath)) return send(res, 404, { error: `No existe el producto "${id}".` })
    unlinkSync(filePath)
    return send(res, 204, null)
  }

  send(res, 405, { error: `Método "${req.method}" no soportado en esta ruta.` })
}

function listProductFiles(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => parseYaml(readFileSync(join(dir, f), 'utf8')))
}

function readCategories(path) {
  if (!existsSync(path)) return []
  const parsed = parseYaml(readFileSync(path, 'utf8'))
  const result = validate(parsed, categoryListSchema)
  return result.ok ? result.value : []
}

function formatIssues(issues) {
  return issues.map((i) => `${i.path}: ${i.message}`).join(' — ')
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch {
        reject(new Error('El cuerpo de la petición no es JSON válido.'))
      }
    })
    req.on('error', reject)
  })
}

function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(body === null ? '' : JSON.stringify(body))
}
