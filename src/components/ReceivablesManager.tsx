'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

export default function ReceivablesManager({ vouchers }: { vouchers: any[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Extract unique customer categories for the filter dropdown
  const categories = Array.from(new Set(vouchers.map(v => v.customer?.category).filter(Boolean)))

  // Filter Logic
  const filteredVouchers = vouchers.filter(v => {
    let match = true;
    if (search) {
        const q = search.toLowerCase()
        match = match && (
            v.id.toLowerCase().includes(q) || 
            (v.customer?.name || '').toLowerCase().includes(q) || 
            (v.notes || '').toLowerCase().includes(q)
        )
    }
    if (category) {
        match = match && (v.customer?.category === category)
    }
    if (fromDate) {
        match = match && (new Date(v.createdAt) >= new Date(fromDate))
    }
    if (toDate) {
        match = match && (new Date(v.createdAt) <= new Date(toDate + 'T23:59:59'))
    }
    return match;
  })

  const formatDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return 'DD/MM/YYYY';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
        
        {/* Safari Date Fixer & Urdu Font setup */}
        <style>{`
            .safari-date-killer::-webkit-datetime-edit { color: transparent !important; }
            .safari-date-killer::-webkit-datetime-edit-fields-wrapper { color: transparent !important; }
            .safari-date-killer::-webkit-datetime-edit-text { color: transparent !important; }
            input[type="date"]::-webkit-calendar-picker-indicator {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
            }
            @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
            .urdu-text { font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif; }
        `}</style>

        {/* Filters Bar */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-3 w-full">
                
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        placeholder="Search name, ID, or notes..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition" 
                    />
                </div>
                
                {/* Category Filter */}
                <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="py-2.5 px-3 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition cursor-pointer min-w-[150px]"
                >
                    <option value="">All Categories</option>
                    {categories.map((c: any) => <option key={c} value={c}>{c}</option>)}
                </select>

                {/* Date From */}
                <div className="relative w-36 h-[42px] shrink-0 group">
                    <div className={`absolute inset-0 bg-white border border-slate-300 rounded-lg flex items-center justify-center text-xs font-bold pointer-events-none tracking-widest z-10 group-hover:border-blue-500 transition-colors ${!fromDate ? 'text-slate-400' : 'text-slate-900'}`}>
                        {formatDDMMYYYY(fromDate)}
                    </div>
                    <input type="date" value={fromDate || ''} onChange={(e) => setFromDate(e.target.value)} className="safari-date-killer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 text-transparent bg-transparent" />
                </div>

                <span className="text-slate-300 font-bold">-</span>

                {/* Date To */}
                <div className="relative w-36 h-[42px] shrink-0 group">
                    <div className={`absolute inset-0 bg-white border border-slate-300 rounded-lg flex items-center justify-center text-xs font-bold pointer-events-none tracking-widest z-10 group-hover:border-blue-500 transition-colors ${!toDate ? 'text-slate-400' : 'text-slate-900'}`}>
                        {formatDDMMYYYY(toDate)}
                    </div>
                    <input type="date" value={toDate || ''} onChange={(e) => setToDate(e.target.value)} className="safari-date-killer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 text-transparent bg-transparent" />
                </div>

                {/* Clear Filters */}
                <button 
                    onClick={() => { setSearch(''); setCategory(''); setFromDate(''); setToDate(''); }} 
                    className="bg-slate-200 text-slate-700 px-6 h-[42px] rounded-lg font-black text-xs uppercase tracking-widest hover:bg-slate-300 transition shrink-0"
                >
                    Clear
                </button>
            </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
                    <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Voucher #</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Category</th>
                        <th className="p-4 min-w-[250px]">Notes / Comments</th>
                        <th className="p-4 text-right">Received</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
                    {filteredVouchers.length > 0 ? filteredVouchers.map((v: any) => (
                        <tr key={v.id} className="hover:bg-slate-50 transition group">
                            <td className="p-4 text-xs">
                                {new Date(v.createdAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Karachi', day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </td>
                            <td className="p-4 font-mono text-xs text-slate-500 uppercase">{/^\d+$/.test(v.id) ? v.id : v.id.slice(-6)}</td>
                            <td className="p-4 text-slate-900 uppercase tracking-wide">{v.customer?.name}</td>
                            <td className="p-4 text-xs uppercase tracking-widest text-blue-600">{v.customer?.category || '-'}</td>
                            <td className="p-4 whitespace-normal min-w-[250px]">
                                <div className="text-sm urdu-text leading-relaxed max-w-sm" dir="auto">
                                    {v.notes || <span className="text-slate-300 italic font-sans text-xs">No notes provided</span>}
                                </div>
                            </td>
                            <td className="p-4 text-right text-emerald-600 font-black text-base">
                                PKR {v.paidAmount.toLocaleString()}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={6} className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
                                No payment vouchers found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  )
}