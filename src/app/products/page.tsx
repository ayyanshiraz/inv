import { PrismaClient } from '@prisma/client'
import ProductManager from '@/components/ProductManager'
import { verifySession } from '@/lib/session'

const prisma = new PrismaClient()

export default async function ProductsPage() {
  const session = await verifySession()
  
  const products = await prisma.product.findMany({ 
      where: { userId: session.userId },
      orderBy: { name: 'asc' } 
  })
  const categories = await prisma.productCategory.findMany({ 
      where: { userId: session.userId },
      orderBy: { name: 'asc' } 
  })

  return (
    // FIX: Cleaned up the padding. pt-24 (mobile) and md:pt-10 (desktop).
    <div className="min-h-screen bg-slate-50 px-4 pt-24 pb-10 md:p-10 md:ml-64">
      <div className="mb-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 uppercase">Products Database</h1>
        <p className="text-slate-500 font-bold text-sm">Manage inventory and costs.</p>
      </div>
      <ProductManager products={products} categories={categories} />
    </div>
  )
}