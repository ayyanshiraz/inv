import { PrismaClient } from '@prisma/client'
import ProductManager from '@/components/ProductManager'

const prisma = new PrismaClient()

// Force the page to always fetch fresh data
export const dynamic = 'force-dynamic'

export default async function ProductPage() {
  // 1. Fetch all products, sorted by name
  const products = await prisma.product.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  // 2. Fetch all categories for the dropdown
  const categories = await prisma.productCategory.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  // 3. Render the Manager Component
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <ProductManager products={products} categories={categories} />
    </div>
  )
}