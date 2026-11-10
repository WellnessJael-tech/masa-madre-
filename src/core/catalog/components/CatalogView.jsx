import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getRuntime } from '@/core/config/runtime.js'
import { getCatalog } from '../getCatalog.js'
import { ProductGrid } from './ProductGrid.jsx'

/**
 * Listado con filtro por categoría + búsqueda por nombre. Cablea
 * features.search (minChars) del blueprint, que existía sin consumidor.
 * Búsqueda 100% cliente: el catálogo entero ya está en memoria
 * (getCatalog()), sin backend ni índice — suficiente para catálogos chicos.
 */
export function CatalogView() {
  const { products, categories } = getCatalog()
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')

  const runtime = getRuntime()
  const searchConfig = runtime.ok
    ? runtime.value.blueprint.features.search
    : { enabled: true, minChars: 2 }

  const categoriesById = new Map(categories.map((c) => [c.id, c]))

  const byCategory =
    activeCategory === 'all' ? products : products.filter((p) => p.categoryId === activeCategory)

  const trimmedQuery = query.trim().toLowerCase()
  const searching = searchConfig.enabled && trimmedQuery.length >= searchConfig.minChars
  const visible = searching
    ? byCategory.filter((p) => p.name.toLowerCase().includes(trimmedQuery))
    : byCategory

  return (
    <div className="flex flex-col gap-4">
      {searchConfig.enabled && (
        <div className="flex flex-col gap-1">
          <input
            type="search"
            data-testid="product-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar productos…"
            aria-label="Buscar productos"
            className="w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          {query.trim().length > 0 && !searching && (
            <p className="text-xs text-muted-foreground">
              Escribe al menos {searchConfig.minChars} caracteres para buscar.
            </p>
          )}
        </div>
      )}

      {categories.length > 0 && (
        <div role="tablist" aria-label="Categorías" className="flex flex-wrap gap-2">
          <CategoryTab
            label="Todo"
            active={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          />
          {categories.map((category) => (
            <CategoryTab
              key={category.id}
              label={category.name}
              active={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
        </div>
      )}

      {searching && visible.length === 0 ? (
        <p data-testid="search-empty" className="text-sm text-muted-foreground">
          Sin resultados para "{query.trim()}".
        </p>
      ) : (
        <ProductGrid products={visible} categoriesById={categoriesById} />
      )}
    </div>
  )
}

function CategoryTab({ label, active, onClick }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
    </button>
  )
}

export default CatalogView
