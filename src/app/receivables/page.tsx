import { PrismaClient } from '@prisma/client'
import { verifySession } from '@/lib/session'
import ReceivablesManager from '@/components/ReceivablesManager'
import Link from 'next/link'
import { Plus } from 'lucide-react'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function ReceivablesPage() {
  const session = await verifySession()
  
  const vouchers = await prisma.invoice.findMany({
    where: { 
        userId: session.userId,
        isReturn: false,
        totalAmount: 0,
        paidAmount: { gt: 0 }
    },
    include: { customer: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-slate-50 lg:ml-64 p-4 pt-20 lg:p-8">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Receivables</h1>
                <p className="text-slate-500 font-bold text-sm">Manage payment collections.</p>
            </div>
            {/* 🔴 FIXED 404: Link is now correctly plural (/receivables/new) */}
            <Link href="/receivables/new" className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition shadow-lg w-full md:w-auto justify-center">
                <Plus size={16} /> Add Voucher
            </Link>
        </div>

        <ReceivablesManager vouchers={vouchers} />
      </div>
    </div>
  )
}