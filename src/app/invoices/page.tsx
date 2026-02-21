import { PrismaClient } from '@prisma/client'
import InvoiceList from '@/components/InvoiceList'
import { verifySession } from '@/lib/session'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function InvoicesPage() {
  const session = await verifySession()
  const userId = session.userId

  const customers = await prisma.customer.findMany({ where: { userId } })
  
  // ONLY FETCH ACTIVE INVOICES
  const activeInvoices = await prisma.invoice.findMany({
    where: { userId, isHold: false }, 
    include: { customer: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  })

  const categories = await prisma.customerCategory.findMany({ where: { userId } })

  const customerBalances = customers.reduce((acc: any, c: any) => {
      let bal = Number(c.openingBalance || 0);
      activeInvoices.filter((i: any) => i.customerId === c.id).forEach((inv: any) => {
          if (inv.isReturn) bal -= Number(inv.totalAmount);
          else bal += (Number(inv.totalAmount) - Number(inv.paidAmount || 0))
      })
      acc[c.id] = bal;
      return acc;
  }, {})

  const invoicesWithBalances = activeInvoices.map((inv: any) => ({
      ...inv,
      customerCurrentBalance: customerBalances[inv.customerId] || 0
  }))

  return (
    <div className="min-h-screen bg-slate-50 lg:ml-64 p-4 pt-20 lg:p-8">
       <InvoiceList invoices={invoicesWithBalances} categories={categories} />
    </div>
  )
}