'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save } from 'lucide-react'
import { createVouchers } from '@/actions/actions'

export default function VoucherForm({ customers }: { customers: any[] }) {
  const router = useRouter()
  const [rows, setRows] = useState([{ id: Date.now().toString(), customerId: '', search: '', balance: 0, amount: '' }])
  const [activeRowDrop, setActiveRowDrop] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // FIX: Added `c.id` to the search filter!
  const filteredCustomers = (index: number) => {
      const query = (rows[index]?.search || '').toLowerCase();
      return customers.filter(c => 
          c.name.toLowerCase().includes(query) || 
          (c.phone && c.phone.includes(query)) ||
          (c.id && c.id.toLowerCase().includes(query))
      )
  }

  const updateRow = (index: number, field: string, value: any) => {
      const newRows = [...rows] as any
      newRows[index][field] = value
      setRows(newRows)
  }

  const handleSelectCustomer = (index: number, c: any) => {
      const newRows = [...rows]
      newRows[index].customerId = c.id
      newRows[index].search = c.name
      newRows[index].balance = c.balance
      setRows(newRows)
      setActiveRowDrop(null)
      
      setTimeout(() => document.getElementById(`amount-${index}`)?.focus(), 50)
  }

  const addRow = () => {
      setRows([...rows, { id: Date.now().toString(), customerId: '', search: '', balance: 0, amount: '' }])
  }

  const handleAmountEnter = (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'Enter') {
          e.preventDefault()
          addRow()
          setTimeout(() => (document.getElementById(`search-${index + 1}`) as HTMLInputElement)?.focus(), 50)
      }
  }

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      const validRows = rows.filter(r => r.customerId && Number(r.amount) > 0)
      if (validRows.length === 0) return alert("Please enter at least one valid payment amount.")
      
      setIsSubmitting(true)
      const data = validRows.map(r => ({ customerId: r.customerId, amount: Number(r.amount) }))
      
      try {
          await createVouchers(data)
          alert("Vouchers recorded successfully!")
          router.push('/receivables')
      } catch (err) {
          alert("Failed to record vouchers.")
          setIsSubmitting(false)
      }
  }

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')

  return (
    <div className="bg-white p-4 md:p-8 rounded-2xl shadow-xl border border-slate-200">
        {activeRowDrop !== null && <div className="fixed inset-0 z-30" onClick={() => setActiveRowDrop(null)} />}

        <div className="flex flex-wrap items-center gap-6 mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700">
            <div className="flex items-center gap-3">
                <span className="font-black text-slate-900">Date:</span>
                <div className="bg-slate-200 px-4 py-1.5 rounded text-slate-600">{today}</div>
            </div>
            <div className="flex items-center gap-3">
                <span className="font-black text-slate-900">MOP:</span>
                <select className="bg-white border border-slate-300 px-3 py-1.5 rounded outline-none cursor-pointer">
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                </select>
            </div>
        </div>

        <div className="w-full relative z-40 border rounded-xl border-slate-300 bg-white">
            <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-100 border-b border-slate-300 text-[11px] uppercase tracking-widest text-slate-600">
                    <tr>
                        <th className="p-3 border-r border-slate-300 w-12 text-center font-black">Sr.</th>
                        <th className="p-3 border-r border-slate-300 text-left font-black">Accounts Receivable</th>
                        <th className="p-3 border-r border-slate-300 text-right w-40 font-black">Balance</th>
                        <th className="p-3 border-r border-slate-300 text-right w-48 font-black">Amount</th>
                        <th className="p-3 w-14 text-center font-black">Act</th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {rows.map((row, i) => (
                        <tr key={row.id} className={`border-b border-slate-200 hover:bg-blue-50/50 transition-colors ${activeRowDrop === i ? 'relative z-50' : 'relative z-0'}`}>
                            
                            <td className="p-0 border-r border-slate-200 text-center font-bold text-slate-400">
                                {i + 1}
                            </td>
                            
                            <td className="p-0 border-r border-slate-200 relative overflow-visible">
                                <input id={`search-${i}`} type="text" placeholder="Search customer or ID..." value={row.search} 
                                    autoComplete="off"
                                    onChange={(e) => { updateRow(i, 'search', e.target.value); updateRow(i, 'customerId', ''); setActiveRowDrop(i); }} 
                                    onFocus={(e) => { setActiveRowDrop(i); e.target.select() }} 
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const list = filteredCustomers(i);
                                            if (activeRowDrop === i && list.length > 0 && !row.customerId) {
                                                handleSelectCustomer(i, list[0]);
                                            } else {
                                                document.getElementById(`amount-${i}`)?.focus();
                                            }
                                        }
                                    }}
                                    className="w-full h-full p-3 md:p-4 bg-transparent font-bold text-slate-900 outline-none uppercase placeholder:text-slate-300 placeholder:font-normal focus:bg-blue-50/50 transition-colors" 
                                />
                                {activeRowDrop === i && (
                                    <div className="absolute left-0 top-full mt-1 w-full md:w-[400px] z-[100] bg-white border border-slate-300 shadow-2xl rounded-lg max-h-60 overflow-y-auto p-1">
                                        {filteredCustomers(i).map(c => (
                                            <div key={c.id} onClick={() => handleSelectCustomer(i, c)} className="p-3 cursor-pointer rounded text-slate-900 hover:bg-slate-100 flex justify-between items-center border-b border-slate-50 last:border-0">
                                                
                                                {/* FIX: Shows ID next to name in dropdown */}
                                                <span className="font-black text-xs uppercase">
                                                    {c.name} <span className="text-[10px] text-slate-400 font-mono ml-2 lowercase">#{c.id}</span>
                                                </span>

                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${c.balance > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>PKR {c.balance.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {filteredCustomers(i).length === 0 && (
                                            <div className="p-3 text-xs text-slate-400 font-bold text-center">No customers found.</div>
                                        )}
                                    </div>
                                )}
                            </td>

                            <td className="p-0 border-r border-slate-200 bg-slate-50/50">
                                <div className="w-full h-full p-3 md:p-4 text-right font-black text-slate-500 truncate">
                                    {row.customerId ? row.balance.toLocaleString() : '---'}
                                </div>
                            </td>

                            <td className="p-0 border-r border-slate-200">
                                <input id={`amount-${i}`} type="number" placeholder="0" value={row.amount} 
                                    onChange={(e) => updateRow(i, 'amount', e.target.value)} 
                                    onFocus={(e) => e.target.select()} 
                                    onKeyDown={(e) => handleAmountEnter(e, i)}
                                    className="w-full h-full p-3 md:p-4 bg-transparent text-right font-black text-emerald-600 outline-none focus:bg-emerald-50/50 transition-colors" 
                                />
                            </td>

                            <td className="p-0 text-center">
                                {rows.length > 1 ? (
                                    <button type="button" onClick={() => setRows(rows.filter((_, idx) => idx !== i))} className="w-full h-full p-3 md:p-4 text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors" title="Delete Row">
                                        <Trash2 size={16} />
                                    </button>
                                ) : (
                                    <div className="w-full h-full p-3 md:p-4 text-slate-200 flex items-center justify-center">
                                        <Trash2 size={16} />
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="flex justify-between items-center mt-4">
            <button type="button" onClick={addRow} className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-black text-[10px] uppercase hover:bg-slate-200 transition flex items-center gap-2">
                <Plus size={14} /> Add Row
            </button>

            <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 bg-slate-900 text-white flex items-center gap-2 rounded-lg font-black uppercase tracking-widest text-xs hover:bg-black transition shadow-lg disabled:opacity-50">
                <Save size={16} /> {isSubmitting ? 'Saving...' : 'Save Vouchers'}
            </button>
        </div>
    </div>
  )
}