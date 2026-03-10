'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ExternalLink, PenSquare } from 'lucide-react'

export default function InvoiceList({ invoices, initialQuery, initialCat, initialFrom, initialTo, categories }: any) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCat)
  const [from, setFrom] = useState(initialFrom)
  const [to, setTo] = useState(initialTo)

  const formatDDMMYYYY = (dateStr: string) => {
      if (!dateStr) return 'DD/MM/YYYY';
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
  }

  const handleSearch = () => {
    let url = `/invoices?q=${query}&cat=${category}`
    if (from) url += `&from=${from}`
    if (to) url += `&to=${to}`
    router.push(url)
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
        
        {/* Upgraded Safari Date Killer CSS Block */}
        <style>{`
            .safari-date-killer::-webkit-datetime-edit,
            .safari-date-killer::-webkit-datetime-edit-fields-wrapper,
            .safari-date-killer::-webkit-datetime-edit-text,
            .safari-date-killer::-webkit-datetime-edit-month-field,
            .safari-date-killer::-webkit-datetime-edit-day-field,
            .safari-date-killer::-webkit-datetime-edit-year-field { 
                color: transparent !important; 
                background: transparent !important; 
            }
        `}</style>

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">All Invoices</h2>
                <span className="bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest">{invoices.length} Found</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or ID..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition" />
                </div>
                
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition cursor-pointer">
                    <option value="">All Categories</option>
                    {categories.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>

                {/* EXACT DASHBOARD MATCH: From Date */}
                <div className="relative w-36 h-10 shrink-0 group">
                    <div className={`absolute inset-0 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-xs font-bold pointer-events-none tracking-widest z-10 group-hover:border-blue-500 transition-colors ${!from ? 'text-slate-400' : 'text-slate-900'}`}>
                        {formatDDMMYYYY(from)}
                    </div>
                    <input type="date" value={from || ''} onChange={(e) => setFrom(e.target.value)} className="safari-date-killer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 text-transparent bg-transparent" style={{ color: 'transparent' }} />
                </div>

                <span className="text-slate-300 font-bold">-</span>

                {/* EXACT DASHBOARD MATCH: To Date */}
                <div className="relative w-36 h-10 shrink-0 group">
                    <div className={`absolute inset-0 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-xs font-bold pointer-events-none tracking-widest z-10 group-hover:border-blue-500 transition-colors ${!to ? 'text-slate-400' : 'text-slate-900'}`}>
                        {formatDDMMYYYY(to)}
                    </div>
                    <input type="date" value={to || ''} onChange={(e) => setTo(e.target.value)} className="safari-date-killer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 text-transparent bg-transparent" style={{ color: 'transparent' }} />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={handleSearch} className="flex-1 sm:flex-none bg-slate-900 text-white px-6 h-10 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-black transition shadow-lg shrink-0">Filter</button>
                    <button onClick={() => { setQuery(''); setCategory(''); setFrom(''); setTo(''); router.push('/invoices') }} className="flex-1 sm:flex-none bg-slate-100 text-slate-600 px-6 h-10 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition shrink-0">Clear</button>
                </div>
            </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
                    <tr>
                        <th className="p-4">Invoice #</th>
                        <th className="p-4">Date & Time</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Category</th>
                        <th className="p-4 text-right">Net Total</th>
                        <th className="p-4 text-right">Discount</th>
                        <th className="p-4 text-right">Paid</th>
                        <th className="p-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
                    {invoices.length > 0 ? invoices.map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-slate-50 transition group">
                            <td className="p-4 font-mono text-xs text-slate-500 uppercase">{inv.id}</td>
                            <td className="p-4 text-xs">{new Date(inv.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Karachi', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                            <td className="p-4 text-slate-900 uppercase tracking-wide">{inv.customer.name}</td>
                            <td className="p-4 uppercase text-xs text-slate-500">{inv.customer.category || '-'}</td>
                            <td className={`p-4 text-right ${inv.isReturn ? 'text-red-600' : 'text-slate-900 font-black'}`}>PKR {inv.totalAmount.toLocaleString()}</td>
                            <td className="p-4 text-right text-orange-500">{inv.discountAmount > 0 ? `PKR ${inv.discountAmount.toLocaleString()}` : '-'}</td>
                            <td className="p-4 text-right text-emerald-600">{inv.paidAmount > 0 ? `PKR ${inv.paidAmount.toLocaleString()}` : '-'}</td>
                            <td className="p-4 text-center">
                                <div className="flex justify-center gap-2">
                                    <Link href={`/print/${inv.id}`} target="_blank" className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition" title="Print Invoice"><ExternalLink size={16} /></Link>
                                    <Link href={`/invoice/edit/${inv.id}`} className="p-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition" title="Edit Invoice"><PenSquare size={16} /></Link>
                                </div>
                            </td>
                        </tr>
                    )) : <tr><td colSpan={8} className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">No records found matching filters.</td></tr>}
                </tbody>
            </table>
        </div>
    </div>
  )
}