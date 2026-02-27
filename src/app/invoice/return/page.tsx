import { PrismaClient } from '@prisma/client'
import { verifySession } from '@/lib/session'
import ReturnClient from './ReturnClient'

export const dynamic = 'force-dynamic' 
const prisma = new PrismaClient()

export default async function SmartReturnPage() {
  const session = await verifySession()
  
  // STRICT DATA LOCK
  const customers = await prisma.customer.findMany({ 
      where: { userId: session.userId },
      orderBy: { name: 'asc' }
  })

  return (
    <div className="min-h-screen bg-slate-50 lg:ml-64 p-4 pt-20 lg:p-8">
      <div className="max-w-5xl mx-auto mb-20">
        <h1 className="text-3xl font-black mb-2 text-slate-900 uppercase tracking-tight">Sales Return</h1>
        <p className="text-slate-500 font-bold text-sm mb-8">Record returned items and securely credit isolated customer balances.</p>
        
        <ReturnClient customers={customers} />
      </div>
    </div>
  )
}