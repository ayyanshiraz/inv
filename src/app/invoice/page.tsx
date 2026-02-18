import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { Printer, Trash2, ArrowLeftRight } from 'lucide-react'
import { deleteInvoice } from '@/actions/actions'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function AllInvoicesPage({ searchParams }: { searchParams: Promise<{ from?: string, to?: string }> }) {
  const params = await searchParams
  const from = params.from ? new Date(params.from) : undefined
  const to = params.to ? new Date(params.to) : undefined

  // Date Filter Logic
  const dateFilter = (from && to) ? {
    createdAt: {
      gte: from,
      lte: to
    }
  } : {}

  const invoices = await prisma.invoice.findMany({
    where: {
      ...dateFilter
    },
    orderBy: { createdAt: 'desc' },
    include: { customer: true }
  })

  return (
    <div className="min-h-screen bg-slate-50 p-8 ml-64">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-black text-slate-900 uppercase">All Invoices</h1>
           <p className="text-slate-500 font-bold text-sm">Record count: {invoices.length}</p>
        </div>
        
        {/* DATE FILTER */}
        <form className="flex gap-2 items-center bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <input type="date" name="from" className="text-xs font-bold uppercase text-slate-600 outline-none" />
            <span className="text-slate-300">/</span>
            <input type="date" name="to" className="text-xs font-bold uppercase text-slate-600 outline-none" />
            <button type="submit" className="bg-slate-900 text-white p-2 rounded-lg hover:bg-black">
                <ArrowLeftRight size={14} />
            </button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="p-4">Invoice #</th>
              <th className="p-4">Date</th>
              <th className="p-4">Customer</th>
              <th className="p-4 text-right">Total</th>
              <th className="p-4 text-right">Paid</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-mono text-slate-500">{inv.id.slice(-6).toUpperCase()}</td>
                <td className="p-4">{new Date(inv.createdAt).toLocaleDateString()}</td>
                <td className="p-4 uppercase">{inv.customer.name}</td>
                <td className={`p-4 text-right ${inv.isReturn ? 'text-red-600' : 'text-slate-800'}`}>
                    PKR {inv.totalAmount.toLocaleString()}
                </td>
                <td className="p-4 text-right text-emerald-600">PKR {inv.paidAmount?.toLocaleString() || 0}</td>
                <td className="p-4 flex justify-center gap-2">
                  <Link href={`/print/${inv.id}`} target="_blank">
                    <button className="p-2 bg-blue-50 text-blue-600 rounded"><Printer size={16}/></button>
                  </Link>
                  <form action={deleteInvoice.bind(null, inv.id)}>
                    <button className="p-2 bg-red-50 text-red-600 rounded"><Trash2 size={16}/></button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && <div className="p-10 text-center font-bold text-slate-400">No records found.</div>}
      </div>
    </div>
  )
}
