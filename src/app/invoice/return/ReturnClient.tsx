'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, CornerDownLeft } from 'lucide-react'
import { processSmartReturn } from '@/actions/actions'

// ADDED SAFEGUARDS: customers = [], products = []
export default function ReturnClient({ customers = [], products = [] }: { customers?: any[], products?: any[] }) {
  const router = useRouter()
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0])
  
  const [items, setItems] = useState<any[]>([{ id: Date.now(), productId: '', search: '', unit: 'Bags', quantity: 1, price: 0 }])
  const [activeItemDrop, setActiveItemDrop] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // SAFE FILTER: Will not crash if search is empty
  const filteredItems = (index: number) => {
      const query = items[index]?.search?.toLowerCase() || '';
      return products.filter(p => p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query));
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const handleSelectItem = (index: number, p: any) => {
    const newItems = [...items]
    newItems[index].productId = p.id
    newItems[index].search = p.name
    newItems[index].unit = p.unit || 'Bags'
    newItems[index].price = p.price || 0
    setItems(newItems)
    setActiveItemDrop(null)
    document.getElementById(`return-quantity-${index}`)?.focus()
  }

  const totalReturnAmount = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0)

  const addItem = () => {
    setItems([...items, { id: Date.now(), productId: '', search: '', unit: 'Bags', quantity: 1, price: 0 }])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validItems = items.filter(i => i.productId && Number(i.quantity) > 0)
    if (!selectedCustomerId || validItems.length === 0) return alert("Please select a customer and add valid items to return.")
    
    setIsSaving(true)
    
    try {
      await processSmartReturn('manual', validItems, totalReturnAmount, selectedCustomerId, returnDate) 
      alert("Return Processed Successfully! The customer's balance has been credited.")
      router.push('/invoices') 
    } catch (err) { 
        alert("Failed to process return."); 
        setIsSaving(false) 
    }
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-200 relative w-full mb-20">
      {activeItemDrop !== null && <div className="fixed inset-0 z-10" onClick={() => setActiveItemDrop(null)} />}
      
      <form onSubmit={handleSubmit} className="space-y-6 w-full relative z-20">
        
        {/* CUSTOMER & DATE SECTION */}
        <div className="w-full flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 px-1">Returning Customer:</label>
                <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} required 
                    className="w-full p-4 bg-slate-100 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-red-500 uppercase transition">
                    <option value="">Select a Customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} - ID: {c.id.slice(-6)}</option>)}
                </select>
            </div>
            
            <div className="w-full md:w-48">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 px-1">Return Date:</label>
                <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} 
                    className="w-full p-4 bg-slate-100 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-red-500 uppercase transition cursor-pointer" />
            </div>
        </div>

        {/* ITEMS SECTION */}
        <div className="space-y-4 w-full">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 px-1">Returned Items:</label>
          <div className="hidden md:grid grid-cols-12 gap-4 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <div className="col-span-1 text-center">Sr.</div>
              <div className="col-span-5">Product Description</div>
              <div className="col-span-1 text-center">Unit</div>
              <div className="col-span-2 text-right">Return Qty</div>
              <div className="col-span-1 text-right">Price</div>
              <div className="col-span-2 text-right pr-12">Credit Value</div>
          </div>

          {items.map((item, i) => (
            <div key={item.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center bg-red-50/30 p-4 rounded-xl border border-red-100 relative w-full">
              <div className="hidden md:block col-span-1 text-center font-black text-slate-400">{i + 1}</div>
              
              <div className="col-span-5 relative w-full">
                <input type="text" placeholder="Search product..." value={item.search} 
                  onChange={(e) => { updateItem(i, 'search', e.target.value); updateItem(i, 'productId', ''); updateItem(i, 'price', 0); setActiveItemDrop(i); }} 
                  onFocus={() => { setActiveItemDrop(i); item.quantity = ''; }} 
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 outline-none focus:border-red-500 uppercase transition-all" 
                />
                {activeItemDrop === i && (
                    <div className="absolute left-0 top-full mt-1 w-full z-30 bg-white border border-slate-300 shadow-2xl rounded-lg max-h-48 overflow-y-auto p-1">
                        {filteredItems(i).map((p: any) => (
                            <div key={p.id} onClick={() => handleSelectItem(i, p)} className="p-3 cursor-pointer rounded text-slate-900 hover:bg-slate-100 flex justify-between items-center border-b border-slate-50">
                                <span className="font-black text-xs uppercase">{p.name} - ID: {p.id.slice(-6)}</span>
                                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{p.unit || 'Bags'}</span>
                            </div>
                        ))}
                    </div>
                )}
              </div>

              <div className="col-span-1 w-full">
                  <input type="text" value={item.unit} readOnly placeholder="Bags" className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg text-center font-black text-slate-500 uppercase" />
              </div>

              <div className="col-span-2 w-full">
                <input id={`return-quantity-${i}`} type="number" placeholder="0" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} 
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg text-right font-black text-slate-900 outline-none focus:border-red-500 transition-all" 
                />
              </div>

              <div className="col-span-1 w-full">
                <input type="number" placeholder="0" value={item.price} onChange={(e) => updateItem(i, 'price', e.target.value)} 
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg text-right font-bold text-slate-900 outline-none focus:border-red-500 transition-all" 
                />
              </div>

              <div className="col-span-2 flex items-center gap-2 justify-end w-full">
                <div className="w-full p-3 bg-red-100 border border-transparent rounded-lg text-right font-black text-red-700 truncate">
                    PKR {(Number(item.quantity) * Number(item.price)).toLocaleString()}
                </div>
                {items.length > 1 && (
                    <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 p-2 rounded bg-white border border-red-200"><Trash2 size={16} /></button>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={addItem} className="flex items-center gap-2 text-red-600 font-black uppercase tracking-widest text-xs hover:text-red-800 transition p-2">
            <Plus size={16} /> Add Return Row
          </button>
        </div>

        {/* RETURN SUMMARY */}
        <div className="flex justify-end pt-6 border-t border-slate-100 mt-10 w-full">
            <div className="w-full md:w-80 space-y-3 bg-red-50 p-5 rounded-2xl border border-red-200">
                <div className="flex justify-between items-center text-sm font-bold text-red-900"><span className="uppercase tracking-widest text-xs">Total Credit Value:</span></div>
                <div className="flex justify-between items-center text-3xl font-black text-red-600 pt-2"><span>PKR {totalReturnAmount.toLocaleString()}</span></div>
                <p className="text-[10px] font-bold text-red-400 leading-tight pt-2">This amount will be credited (subtracted) from the customer's total pending balance.</p>
            </div>
        </div>

        {/* SUBMIT ACTIONS */}
        <div className="flex justify-end items-center mt-12 w-full bg-white fixed bottom-0 left-0 right-0 p-4 border-t border-slate-200 lg:pl-72 z-40">
            <button type="submit" disabled={isSaving || totalReturnAmount === 0} className="w-full md:w-auto px-10 py-3 bg-red-600 text-white flex items-center justify-center gap-3 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-red-700 transition shadow-lg disabled:opacity-50">
              <CornerDownLeft size={20} /> {isSaving ? 'Processing...' : 'Process Return & Credit Balance'}
            </button>
        </div>
      </form>
    </div>
  )
}