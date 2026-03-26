'use client'

import { useState } from 'react'
import { Search, Edit, Trash2, Save, X } from 'lucide-react'
import { updateInvoice, deleteInvoice } from '@/actions/actions'

// ADDED SAFETY FALLBACK: { vouchers = [] } ensures it defaults to an empty array if data is missing
export default function ReceivablesManager({ vouchers = [] }: { vouchers?: any[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftAmount, setDraftAmount] = useState<number | ''>('')
  const [draftNotes, setDraftNotes] = useState('')

  // CRITICAL FIX: Safe mapping. If vouchers is somehow undefined, it safely maps over an empty array.
  const safeVouchers = Array.isArray(vouchers) ? vouchers : []
  const categories = Array.from(new Set(safeVouchers.map(v => v.customer?.category).filter(Boolean)))

  const filteredVouchers = safeVouchers.filter(v => {
    let match = true;
    if (search) {
        const q = search.toLowerCase()
        match = match && (
            v.id.toLowerCase().includes(q) || 
            (v.customer?.id || '').toLowerCase().includes(q)
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

  const handleEditClick = (v: any) => {
      setEditingId(v.id)
      setDraftAmount(v.paidAmount || 0)
      setDraftNotes(v.notes || '')
  }

  const handleCancelEdit = () => {
      setEditingId(null)
      setDraftAmount('')
      setDraftNotes('')
  }

  const handleSaveEdit = async (v: any) => {
      setIsSaving(true)
      try {
          await updateInvoice(v.id, {
              customerId: v.customerId,
              totalAmount: v.totalAmount || 0,
              paidAmount: Number(draftAmount) || 0,
              discountAmount: v.discountAmount || 0,
              isReturn: v.isReturn || false,
              isHold: v.isHold || false,
              notes: draftNotes,
              items: [] 
          })
          alert('Voucher updated successfully!')
          setEditingId(null)
      } catch (error) {
          alert('Failed to update voucher. Please try again.')
      } finally {
          setIsSaving(false)
      }
  }

  const handleDelete = async (id: string) => {
      if (confirm('Are you sure you want to permanently delete this payment voucher? This will alter the customer\'s ledger balance.')) {
          try { await deleteInvoice(id) } catch (error) { alert('Failed to delete voucher.') }
      }
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
        
        <style>{`
            .safari-date-killer::-webkit-datetime-edit { color: transparent !important; }
            .safari-date-killer::-webkit-datetime-edit-fields-wrapper { color: transparent !important; }
            .safari-date-killer::-webkit-datetime-edit-text { color: transparent !important; }
            input[type="date"]::-webkit-calendar-picker-indicator { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
            @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
            .urdu-text { font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif; }
        `}</style>

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-3 w-full">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Customer ID or Voucher ID..." dir="ltr" className="urdu-text text-left w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition" />
                </div>
                
                <select value={category} onChange={(e) => setCategory(e.target.value)} dir="ltr" className="urdu-text text-left py-2.5 px-3 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition cursor-pointer min-w-[150px]">
                    <option value="">All Categories</option>
                    {categories.map((c: any) => <option key={c} value={c}>{c}</option>)}
                </select>

                <div className="relative w-36 h-[42px] shrink-0 group">
                    <div className={`absolute inset-0 bg-white border border-slate-300 rounded-lg flex items-center justify-center text-xs font-bold pointer-events-none tracking-widest z-10 group-hover:border-blue-500 transition-colors ${!fromDate ? 'text-slate-400' : 'text-slate-900'}`}>{formatDDMMYYYY(fromDate)}</div>
                    <input type="date" value={fromDate || ''} onChange={(e) => setFromDate(e.target.value)} className="safari-date-killer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 text-transparent bg-transparent" />
                </div>
                <span className="text-slate-300 font-bold">-</span>
                <div className="relative w-36 h-[42px] shrink-0 group">
                    <div className={`absolute inset-0 bg-white border border-slate-300 rounded-lg flex items-center justify-center text-xs font-bold pointer-events-none tracking-widest z-10 group-hover:border-blue-500 transition-colors ${!toDate ? 'text-slate-400' : 'text-slate-900'}`}>{formatDDMMYYYY(toDate)}</div>
                    <input type="date" value={toDate || ''} onChange={(e) => setToDate(e.target.value)} className="safari-date-killer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 text-transparent bg-transparent" />
                </div>
                <button onClick={() => { setSearch(''); setCategory(''); setFromDate(''); setToDate(''); }} className="bg-slate-200 text-slate-700 px-6 h-[42px] rounded-lg font-black text-xs uppercase tracking-widest hover:bg-slate-300 transition shrink-0">Clear</button>
            </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
                    <tr><th className="p-4 w-12 text-center">Sr.</th><th className="p-4">Date</th><th className="p-4">Voucher #</th><th className="p-4">Customer</th><th className="p-4">Category</th><th className="p-4 min-w-[250px]">Notes / Comments</th><th className="p-4 text-right">Received</th><th className="p-4 text-right w-28">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
                    {filteredVouchers.length > 0 ? filteredVouchers.map((v: any, index: number) => (
                        <tr key={v.id} className={`transition group ${editingId === v.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                            <td className="p-4 text-center text-xs text-slate-400 font-black">{index + 1}</td>
                            <td className="p-4 text-xs">{new Date(v.createdAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Karachi', day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                            <td className="p-4 font-mono text-xs text-slate-500 uppercase">{/^\d+$/.test(v.id) ? v.id : v.id.slice(-6)}</td>
                            <td className="p-4 text-slate-900 uppercase tracking-wide urdu-text text-lg" dir="ltr"><span className="font-sans text-[10px] text-slate-400 block -mb-2">{v.customer?.id}</span>{v.customer?.name}</td>
                            <td className="p-4 text-xs uppercase tracking-widest text-blue-600 urdu-text" dir="ltr">{v.customer?.category || '-'}</td>
                            <td className="p-4 whitespace-normal min-w-[250px]">
                                {editingId === v.id ? (
                                    <textarea value={draftNotes} onChange={(e) => setDraftNotes(e.target.value)} className="urdu-text w-full p-2 border-2 border-blue-300 rounded-lg outline-none focus:border-blue-600 text-sm resize-none" rows={2} dir="auto" />
                                ) : (<div className="text-sm urdu-text leading-relaxed max-w-sm" dir="auto">{v.notes || <span className="text-slate-300 italic font-sans text-xs uppercase tracking-widest">No notes provided</span>}</div>)}
                            </td>
                            <td className="p-4 text-right text-emerald-600 font-black text-base">
                                {editingId === v.id ? (
                                    <div className="flex justify-end">
                                        <input type="number" value={draftAmount} onChange={(e) => setDraftAmount(e.target.value === '' ? '' : Number(e.target.value))} className="w-32 p-2 border-2 border-emerald-300 rounded-lg text-right font-black outline-none focus:border-emerald-600 text-slate-900" onFocus={(e) => e.target.select()} onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(v) }} />
                                    </div>
                                ) : (<span>PKR {v.paidAmount.toLocaleString()}</span>)}
                            </td>
                            <td className="p-4 text-right">
                                {editingId === v.id ? (
                                    <div className="flex justify-end gap-2">
                                        <button onClick={handleCancelEdit} disabled={isSaving} className="p-2 bg-white border border-slate-300 text-slate-500 rounded hover:bg-slate-100 transition disabled:opacity-50"><X size={16} /></button>
                                        <button onClick={() => handleSaveEdit(v)} disabled={isSaving} className="p-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition disabled:opacity-50"><Save size={16} /></button>
                                    </div>
                                ) : (
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditClick(v)} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(v.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"><Trash2 size={16} /></button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    )) : (<tr><td colSpan={8} className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">No payment vouchers found.</td></tr>)}
                </tbody>
            </table>
        </div>
    </div>
  )
}