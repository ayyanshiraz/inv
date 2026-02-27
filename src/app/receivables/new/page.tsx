import { PrismaClient } from '@prisma/client'
import { verifySession } from '@/lib/session'
import VoucherForm from '@/components/VoucherForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function NewVoucherPage() {
  const session = await verifySession()
  const userId = session.userId

  const customers = await prisma.customer.findMany({ where: { userId }, orderBy: { name: 'asc' } })
  const allInvoices = await prisma.invoice.findMany({ where: { userId, isHold: false } })

  const customersWithBalances = customers.map(c => {
      const cInvs = allInvoices.filter(i => i.customerId === c.id)
      const balance = cInvs.reduce((acc, inv) => {
          return inv.isReturn ? acc - inv.totalAmount : acc + inv.totalAmount - (inv.paidAmount || 0)
      }, Number(c.openingBalance || 0))
      return { ...c, balance }
  })

  return (
    <div className="min-h-screen bg-slate-50 lg:ml-64 p-4 pt-20 lg:p-8">
      <div className="max-w-5xl mx-auto mb-20">
        
        {/* FIXED BACK BUTTON: Clean, solid, and fail-proof */}
        <Link href="/receivables" className="inline-flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition mb-8 w-max">
            <ArrowLeft size={16} /> Back to Receivables
        </Link>

        <h1 className="text-3xl font-black mb-2 text-slate-900 uppercase tracking-tight">Record Vouchers</h1>
        <p className="text-slate-500 font-bold text-sm mb-8">Quickly log cash collections to deduct from customer balances.</p>
        
        <VoucherForm customers={customersWithBalances} />
      </div>
    </div>
  )
}