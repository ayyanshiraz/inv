import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { verifySession } from '@/lib/session'
import { Plus } from 'lucide-react'
import ReceivablesManager from '@/components/ReceivablesManager'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function ReceivablesPage() {
  const session = await verifySession()
  const userId = session.userId

  // Fetches only "Payment Vouchers" (Invoices with 0 total but a paid amount)
  const vouchers = await prisma.invoice.findMany({
      where: { userId, totalAmount: 0, paidAmount: { gt: 0 } },
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-slate-50 lg:ml-64 p-4 pt-20 lg:p-8">
      <div className="max-w-5xl mx-auto mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-black mb-2 text-slate-900 uppercase tracking-tight">Receivables</h1>
                <p className="text-slate-500 font-bold text-sm">Manage payment collections.</p>
            </div>
            <Link href="/receivables/new" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black transition flex items-center justify-center gap-2 shadow-lg w-full md:w-auto">
                <Plus size={16} /> Add Voucher
            </Link>
        </div>

        {/* INTERACTIVE TABLE COMPONENT */}
        <ReceivablesManager vouchers={vouchers} />
      </div>
    </div>
  )
}