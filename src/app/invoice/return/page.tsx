import { PrismaClient } from '@prisma/client'
import { verifySession } from '@/lib/session'
import ReturnClient from './ReturnClient'

// FIX: Forces Next.js to fetch live data instead of using a cached empty list!
export const dynamic = 'force-dynamic' 

const prisma = new PrismaClient()

export default async function SmartReturnPage() {
  const session = await verifySession()
  
  const customers = await prisma.customer.findMany({ 
      where: { userId: session.userId },
      orderBy: { name: 'asc' }
  })

  return (
    <div className="min-h-screen bg-slate-50 p-4 pt-24 md:p-8 md:ml-64">
      <h1 className="text-3xl font-black text-slate-900 uppercase mb-8">Sales Return</h1>
      <ReturnClient customers={customers} />
    </div>
  )
}