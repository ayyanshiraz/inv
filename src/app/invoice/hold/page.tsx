import { PrismaClient } from '@prisma/client'
import InvoiceList from '@/components/InvoiceList'
import { verifySession } from '@/lib/session'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function HoldInvoicesPage() {
  const session = await verifySession()
  const userId = session.userId

  const customers = await prisma.customer.findMany({ where: { userId } })
  
  // FETCH ONLY HOLD INVOICES
  const holdInvoices = await prisma.invoice.findMany({
    where: { userId, isHold: true },
    include: { customer: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  })

  const categories = await prisma.customerCategory.findMany({ where: { userId } })

  const customerBalances = customers.reduce((acc: any, c: any) => {
      let bal = Number(c.openingBalance || 0);
      acc[c.id] = bal; // We don't add historical math here because quotations don't impact it yet!
      return acc;
  }, {})

  const invoicesWithBalances = holdInvoices.map((inv: any) => ({ ...inv, customerCurrentBalance: customerBalances[inv.customerId] || 0 }))

  return (
    <div className="min-h-screen bg-slate-50 lg:ml-64 p-4 pt-20 lg:p-8">
       <div className="mb-4 bg-orange-100 border-l-4 border-orange-500 text-orange-800 p-4 rounded shadow-sm">
           <h3 className="font-black uppercase tracking-widest text-sm">Quotations / Hold Mode</h3>
           <p className="text-xs font-bold mt-1">These invoices are currently drafts. They do not affect customer balances, revenue, or your Ledger until you "Make Active".</p>
       </div>
       <InvoiceList invoices={invoicesWithBalances} categories={categories} isHoldView={true} />
    </div>
  )
}