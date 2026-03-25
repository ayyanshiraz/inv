import { PrismaClient } from '@prisma/client'
import ReturnForm from '@/components/ReturnForm'
import { verifySession } from '@/lib/session'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function ReturnPage() {
  const session = await verifySession()
  const userId = session.userId

  // Fetches BOTH customers and products securely
  const customers = await prisma.customer.findMany({ where: { userId }, orderBy: { name: 'asc' } })
  const products = await prisma.product.findMany({ where: { userId }, orderBy: { name: 'asc' } })

  return (
    <div className="min-h-screen bg-slate-50 lg:ml-64 p-4 pt-20 lg:p-8">
      <div className="max-w-5xl mx-auto mb-20">
        <h1 className="text-3xl font-black mb-2 text-slate-900 uppercase tracking-tight">Process Return</h1>
        <p className="text-slate-500 font-bold text-sm mb-8">Record returned items and credit customer balances.</p>
        
        {/* Injecting the new crash-proof, Urdu-supported ReturnForm here */}
        <ReturnForm customers={customers} products={products} />
      </div>
    </div>
  )
}