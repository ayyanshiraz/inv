'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Trash2, Save } from 'lucide-react'
import { createInvoice, getCustomerBalance } from '@/actions/actions'

const getPKTDateString = () => {
    const pkt = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
    return `${pkt.getFullYear()}-${String(pkt.getMonth() + 1).padStart(2, '0')}-${String(pkt.getDate()).padStart(2, '0')}`;
};

export default function VoucherForm({ customers }: { customers: any[] }) {
  const router = useRouter()
  
  const [voucherDate, setVoucherDate] = useState(getPKTDateString())
  const [rows, setRows] = useState([{ id: Date.now().toString(), customerId: '', search: '', amount: '', discount: '', notes: '', balance: 0 }])
  const [activeRowDrop, setActiveRowDrop] = useState<number | null>(null)
  const [custHoverIndex, setCustHoverIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredCustomers = (index: number) => customers.filter(c => 
      c.name.toLowerCase().includes(rows[index]?.search.toLowerCase()) || 
      c.id.toLowerCase().includes(rows[index]?.search.toLowerCase())
  )

  const handleSave = async () => {
    const validRows = rows.filter(r => r.customerId && (Number(r.amount) > 0 || Number(r.discount) > 0))
    if (validRows.length === 0) return alert('Please enter at least one valid payment row (Customer + Amount or Discount).')

    setIsSubmitting(true)

    const finalTimestamp = voucherDate === getPKTDateString() ? new Date().toISOString() : new Date(`${voucherDate}T12:00:00+05:00`).toISOString(); 

    try {
        for (const row of validRows) {
            const data = { 
                customerId: row.customerId, 
                invoiceDate: finalTimestamp, 
                totalAmount: 0, 
                discountAmount: Number(row.discount) || 0, 
                paidAmount: Number(row.amount) || 0, 
                isReturn: false, 
                isHold: false, 
                notes: row.notes ? row.notes.trim() : '', 
                items: [] // Fixes backend crash
            }
            await createInvoice(data)
        }
        
        alert('All payment vouchers recorded successfully!')
        setRows([{ id: Date.now().toString(), customerId: '', search: '', amount: '', discount: '', notes: '', balance: 0 }])
        document.getElementById('search-0')?.focus()
        
    } catch (error) { 
        alert("Error saving vouchers. Please try again.") 
    } finally { 
        setIsSubmitting(false) 
    }
  }

  // CTRL + S Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rows]);

  const handleCustKeyDown = (e: React.KeyboardEvent, index: number) => {
    const list = filteredCustomers(index)
    if (e.key === 'ArrowDown') { e.preventDefault(); setCustHoverIndex(prev => Math.min(prev + 1, list.length - 1)) } 
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCustHoverIndex(prev => Math.max(prev - 1, 0)) } 
    else if (e.key === 'Enter') { e.preventDefault(); if (activeRowDrop === index && list.length > 0) handleSelectCustomer(index, list[custHoverIndex]) }
  }

  const handleInputEnter = (e: React.KeyboardEvent, nextFieldId: string) => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById(nextFieldId)?.focus() } }
  const handleNotesEnter = (e: React.KeyboardEvent, index: number) => { 
      if (e.key === 'Enter') { 
          e.preventDefault(); 
          addRow(); 
          setTimeout(() => document.getElementById(`search-${index + 1}`)?.focus(), 50) 
      } 
  }

  const handleSelectCustomer = async (index: number, cust: any) => {
    const newRows = [...rows]; 
    newRows[index].customerId = cust.id; 
    newRows[index].search = `${cust.id} - ${cust.name}`; 
    const bal = await getCustomerBalance(cust.id);
    newRows[index].balance = bal;
    setRows(newRows); 
    setActiveRowDrop(null); 
    document.getElementById(`amount-${index}`)?.focus()
  }

  const updateRowDetails = (index: number, field: string, value: string | number) => {
    const newRows = [...rows] as any; newRows[index][field] = value; setRows(newRows)
  }

  const addRow = () => setRows([...rows, { id: Date.now().toString(), customerId: '', search: '', amount: '', discount: '', notes: '', balance: 0 }])
  const removeRow = (index: number) => { if (rows.length > 1) setRows(rows.filter((_, i) => i !== index)) }

  return (
    <div className="bg-white p-4 md:p-8 rounded-2xl shadow-xl border border-slate-200 relative w-full overflow-hidden">
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
          @font-face { font-family: 'Jameel Noori Nastaleeq'; src: local('Jameel Noori Nastaleeq'), local('Jameel Noori Nastaleeq Regular'); }
          .urdu-font { font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif !important; line-height: 2 !important; }
      `}</style>

      {activeRowDrop !== null && <div className="fixed inset-0 z-30" onClick={() => setActiveRowDrop(null)} />}

      <div className="flex justify-between items-center mb-8 relative z-40 w-full">
          <div><h2 className="text-xl font-black uppercase text-slate-900">Add Receivables</h2><p className="text-xs font-bold text-slate-500 uppercase">Multi-row Payment Entry</p></div>
          <div>
              <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block text-right">Voucher Date</label>
              <input type="date" value={voucherDate} onChange={(e) => setVoucherDate(e.target.value)} className="font-black text-sm p-2 bg-slate-50 border border-slate-300 rounded-lg outline-none cursor-pointer" />
          </div>
      </div>

      <div className="space-y-4 relative z-30 w-full">
        {/* RIGID 12-COLUMN CSS GRID HEADER */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-2 text-[10px] font-black uppercase text-slate-500 w-full">
          <div className="col-span-1 text-center">Sr.</div>
          <div className="col-span-3">Select Customer</div>
          <div className="col-span-2 text-right">Amount (PKR)</div>
          <div className="col-span-2 text-right">Discount</div>
          <div className="col-span-4 pl-2">Notes / Comments</div>
        </div>

        {/* ROWS WITH FORCED MIN-W-0 TO PREVENT SQUASHING */}
        {rows.map((row, i) => (
          <div key={row.id} className="w-full flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center bg-slate-50 p-4 md:p-3 rounded-xl border-2 border-slate-200 relative">
            
            <div className="hidden md:block col-span-1 text-center font-black text-slate-400 text-sm">{i + 1}</div>
            
            <div className="w-full md:col-span-3 relative min-w-0">
              <label className="md:hidden text-[10px] font-black uppercase text-slate-500 mb-1 block">Select Customer</label>
              <div className="relative w-full min-w-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input id={`search-${i}`} type="text" placeholder="Search..." value={row.search} dir="ltr" className="urdu-font text-left pl-8 w-full min-w-0 p-3 md:p-2 bg-white border border-slate-300 rounded-lg font-black text-slate-900 outline-none focus:border-blue-500 uppercase transition-all" onChange={(e) => { updateRowDetails(i, 'search', e.target.value); updateRowDetails(i, 'customerId', ''); updateRowDetails(i, 'balance', 0); setActiveRowDrop(i); setCustHoverIndex(0) }} onFocus={(e) => { setActiveRowDrop(i); e.target.select() }} onKeyDown={(e) => handleCustKeyDown(e, i)} />
              </div>

              {activeRowDrop === i && (
                  <div className="absolute top-full left-0 w-full min-w-[250px] mt-1 bg-white border-2 border-slate-300 shadow-2xl rounded-lg max-h-48 overflow-y-auto z-[9999] p-1">
                      {filteredCustomers(i).map((c, idx) => (
                          <div key={c.id} onClick={() => handleSelectCustomer(i, c)} onMouseEnter={() => setCustHoverIndex(idx)} className={`p-3 md:p-2 cursor-pointer rounded text-slate-900 flex justify-between items-center ${custHoverIndex === idx ? 'bg-blue-100' : 'hover:bg-slate-100'}`}>
                              <p className="font-black text-sm uppercase urdu-font text-left truncate" dir="ltr">{c.id} - {c.name}</p>
                          </div>
                      ))}
                  </div>
              )}
              {row.customerId && <div className="absolute -bottom-5 left-2 text-[9px] font-bold text-slate-500 truncate w-full">Bal: <span className={row.balance > 0 ? 'text-red-500' : 'text-emerald-500'}>{row.balance.toLocaleString()}</span></div>}
            </div>
            
            <div className="w-full md:col-span-2 min-w-0">
                <label className="md:hidden text-[10px] font-black uppercase text-slate-500 mb-1 block">Amount (PKR)</label>
                <input id={`amount-${i}`} type="number" placeholder="0" className="w-full min-w-0 p-3 md:p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-right font-black text-emerald-700 outline-none focus:border-emerald-600" value={row.amount} onChange={(e) => updateRowDetails(i, 'amount', e.target.value)} onFocus={(e) => e.target.select()} onKeyDown={(e) => handleInputEnter(e, `discount-${i}`)} />
            </div>

            <div className="w-full md:col-span-2 min-w-0">
                <label className="md:hidden text-[10px] font-black uppercase text-slate-500 mb-1 block">Discount Allowed</label>
                <input id={`discount-${i}`} type="number" placeholder="0" className="w-full min-w-0 p-3 md:p-2 bg-orange-50 border border-orange-300 rounded-lg text-right font-black text-orange-700 outline-none focus:border-orange-600" value={row.discount} onChange={(e) => updateRowDetails(i, 'discount', e.target.value)} onFocus={(e) => e.target.select()} onKeyDown={(e) => handleInputEnter(e, `notes-${i}`)} />
            </div>
            
            <div className="w-full md:col-span-4 flex items-center gap-2 min-w-0">
                <div className="flex-1 w-full min-w-0">
                    <label className="md:hidden text-[10px] font-black uppercase text-slate-500 mb-1 block">Notes / Comments</label>
                    <input id={`notes-${i}`} type="text" placeholder="Optional notes..." value={row.notes} onChange={(e) => updateRowDetails(i, 'notes', e.target.value)} onFocus={(e) => e.target.select()} onKeyDown={(e) => handleNotesEnter(e, i)} dir="auto" className="urdu-font w-full min-w-0 p-3 md:p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 outline-none focus:border-blue-500 truncate" />
                </div>
                {rows.length > 1 && (
                    <button type="button" onClick={() => removeRow(i)} className="shrink-0 text-red-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition" title="Delete Row"><Trash2 size={16} /></button>
                )}
            </div>
          </div>
        ))}
      </div>
      
      <button type="button" onClick={addRow} className="mt-6 w-full md:w-auto px-4 py-3 md:py-2 bg-slate-900 text-white rounded-lg font-black text-xs uppercase hover:bg-black transition">+ Add Row</button>

      <div className="flex flex-col md:flex-row gap-4 mt-8 pt-6 border-t border-slate-200 w-full">
          <button onClick={handleSave} type="button" disabled={isSubmitting} className="w-full py-5 bg-blue-600 text-white rounded-xl font-black text-sm md:text-lg uppercase tracking-widest shadow-xl hover:opacity-90 transition active:scale-95 flex flex-col items-center justify-center disabled:opacity-50">
            <div className="flex items-center gap-2"><Save size={20} /> {isSubmitting ? 'Saving...' : 'Record All Vouchers'}</div>
            <span className="text-[10px] opacity-75 mt-1 font-bold">Shortcut: CTRL + S</span>
          </button>
      </div>
    </div>
  )
}