import { ProductCard } from './ProductCard.jsx'

export function ProductGrid({ products, categoriesById }) {
  if (products.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay productos para mostrar.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={categoriesById.get(product.categoryId)?.name}
        />
      ))}
    </div>
  )
}

export default ProductGrid
