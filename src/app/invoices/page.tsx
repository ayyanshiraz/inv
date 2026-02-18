import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { Printer, Trash2, Search, ArrowLeftRight, FileText } from 'lucide-react'
import { deleteInvoice } from '@/actions/actions'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function AllInvoicesPage({ searchParams }: { searchParams: Promise<{ from?: string, to?: string, query?: string }> }) {
  const params = await searchParams
  const from = params.from ? new Date(params.from) : undefined
  const to = params.to ? new Date(params.to) : undefined
  const query = params.query || ""

  // Build Filter
  const whereCondition: any = {}

  // Date Filter
  if (from && to) {
    whereCondition.createdAt = { gte: from, lte: to }
  }

  // Text Search Filter (Name, Phone, Address, ID, Category)
  if (query) {
    whereCondition.OR = [
        { id: { contains: query, mode: 'insensitive' } },
        { customer: { name: { contains: query, mode: 'insensitive' } } },
        { customer: { phone: { contains: query, mode: 'insensitive' } } },
        { customer: { address: { contains: query, mode: 'insensitive' } } },
        { customer: { category: { contains: query, mode: 'insensitive' } } }
    ]
  }

  const invoices = await prisma.invoice.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' },
    include: { customer: true }
  })

  return (
    <div className="min-h-screen bg-slate-50 p-8 ml-64">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900 uppercase">All Invoices</h1>
           <p className="text-slate-500 font-bold text-sm">Found {invoices.length} records</p>
        </div>
        
        {/* FILTERS FORM */}
        <form className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            {/* Search Input */}
            <div className="relative border-r border-slate-200 pr-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input 
                    type="text" 
                    name="query" 
                    defaultValue={query} 
                    placeholder="Search Name, ID, Phone..." 
                    className="pl-8 p-2 text-sm font-bold text-slate-700 outline-none w-48"
                />
            </div>

            {/* Date Inputs */}
            <input type="date" name="from" className="text-xs font-bold uppercase text-slate-600 outline-none" />
            <span className="text-slate-300 font-bold">-</span>
            <input type="date" name="to" className="text-xs font-bold uppercase text-slate-600 outline-none" />
            
            <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-black transition text-xs font-bold uppercase">
                Filter Results
            </button>
            
            {/* Clear Filters Button */}
            <Link href="/invoices" className="bg-slate-200 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-300 transition text-xs font-bold uppercase">
                Clear
            </Link>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="p-4">Invoice #</th>
              <th className="p-4">Date</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Phone / Address</th>
              <th className="p-4 text-right">Total</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-mono text-slate-500">{inv.id.slice(-6).toUpperCase()}</td>
                <td className="p-4">{new Date(inv.createdAt).toLocaleDateString()}</td>
                <td className="p-4 uppercase">{inv.customer.name}</td>
                <td className="p-4 text-xs text-slate-500">{inv.customer.phone} <br/> {inv.customer.address}</td>
                <td className={`p-4 text-right ${inv.isReturn ? 'text-red-600' : 'text-slate-800'}`}>
                    PKR {inv.totalAmount.toLocaleString()}
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <Link href={`/print/${inv.id}`} target="_blank">
                    <button className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 border border-blue-200"><Printer size={16}/></button>
                  </Link>
                  <form action={deleteInvoice.bind(null, inv.id)}>
                    <button className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 border border-red-200"><Trash2 size={16}/></button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
                <FileText size={48} className="mb-4 opacity-20" />
                <p className="font-bold">No records found matching your search.</p>
            </div>
        )}
      </div>
    </div>
  )
}