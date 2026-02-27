'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, Printer } from 'lucide-react'
import { createInvoice, updateInvoice } from '@/actions/actions'

// Standard Units used in Fahad Traders
const standardUnits = ['Bags', 'Kgs'];

export default function InvoiceForm({ initialInvoice, customers, products }: { initialInvoice?: any, customers: any[], products: any[] }) {
  const router = useRouter()
  const isEditing = !!initialInvoice
  
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialInvoice?.customerId || '')
  const [items, setItems] = useState<any[]>(initialInvoice?.items.map((it:any) => ({ id: it.id, productId: it.productId, search: products.find((p:any)=>p.id===it.productId)?.name || '', unit: products.find((p:any)=>p.id===it.productId)?.unit || 'Bags', quantity: it.quantity, price: it.price })) || [{ id: Date.now(), productId: '', search: '', unit: 'Bags', quantity: 1, price: 0 }])
  const [paidAmount, setPaidAmount] = useState<string>(initialInvoice?.paidAmount?.toString() || '0')
  const [discountAmount, setDiscountAmount] = useState<string>(initialInvoice?.discountAmount?.toString() || '0')
  const [activeItemDrop, setActiveItemDrop] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const filteredItems = (index: number) => products.filter(p => p.name.toLowerCase().includes(items[index]?.search.toLowerCase()) || p.id.toLowerCase().includes(items[index]?.search.toLowerCase()))

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
    document.getElementById(`quantity-${index}`)?.focus()
  }

  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0)
  const totalAmount = subtotal - Number(discountAmount)
  const currentBalance = totalAmount - Number(paidAmount)

  const customerInvoices = selectedCustomerId ? products[0 /* placeholder */] : []; // placeholder for actual customer invoice fetch logic

  const addItem = () => {
    setItems([...items, { id: Date.now(), productId: '', search: '', unit: 'Bags', quantity: 1, price: 0 }])
  }

  const handleSubmit = async (e: React.FormEvent, isHold: boolean = false) => {
    e.preventDefault()
    const validItems = items.filter(i => i.productId && Number(i.quantity) > 0)
    if (!selectedCustomerId || validItems.length === 0) return alert("Please select a customer and add valid items.")
    
    setIsSaving(true)
    const invoiceData = { customerId: selectedCustomerId, totalAmount, paidAmount: isHold ? 0 : Number(paidAmount), discountAmount: Number(discountAmount), isHold, items: validItems.map(i => ({ productId: i.productId, quantity: Number(i.quantity), price: Number(i.price) })) }
    
    try {
      if (isEditing) { await updateInvoice(initialInvoice.id, invoiceData); alert("Invoice Updated Successfully!"); router.push('/invoices') } 
      else { const newInv = await createInvoice(invoiceData); alert(`Invoice Created Successfully: ID ${newInv.id.slice(-6)}`); router.push(`/print/${newInv.id}`) }
    } catch (err) { alert("Failed to save invoice. Ensure customer/products are valid."); setIsSaving(false) }
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-200 relative w-full mb-20">
      {activeItemDrop !== null && <div className="fixed inset-0 z-10" onClick={() => setActiveItemDrop(null)} />}
      
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6 w-full relative z-20">
        
        {/* CUSTOMER SECTION */}
        <div className="w-full">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 px-1">Bill To:</label>
            <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} required 
                className="w-full md:max-w-md p-4 bg-slate-100 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500 uppercase transition">
                <option value="">Select a Customer...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} - ID: {c.id.slice(-6)}</option>)}
            </select>
        </div>

        {/* ITEMS SECTION */}
        <div className="space-y-4 w-full">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 px-1">Items:</label>
          <div className="hidden md:grid grid-cols-12 gap-4 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <div className="col-span-1 text-center">Sr.</div>
              <div className="col-span-5">Product Description</div>
              <div className="col-span-1 text-center">Unit</div>
              <div className="col-span-2 text-right">Quantity</div>
              <div className="col-span-1 text-right">Price</div>
              <div className="col-span-2 text-right pr-12">Amount</div>
          </div>

          {items.map((item, i) => (
            <div key={item.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200 relative w-full">
              <div className="hidden md:block col-span-1 text-center font-black text-slate-400">{i + 1}</div>
              
              <div className="col-span-5 relative w-full">
                <input type="text" placeholder="Search product..." value={item.search} 
                  onChange={(e) => { updateItem(i, 'search', e.target.value); updateItem(i, 'productId', ''); updateItem(i, 'price', 0); setActiveItemDrop(i); }} 
                  onFocus={() => { setActiveItemDrop(i); item.quantity = ''; }} 
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 outline-none focus:border-blue-500 uppercase transition-all" 
                />
                {activeItemDrop === i && (
                    <div className="absolute left-0 top-full mt-1 w-full z-30 bg-white border border-slate-300 shadow-2xl rounded-lg max-h-48 overflow-y-auto p-1">
                        {filteredItems(i).map(p => (
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
                <input id={`quantity-${i}`} type="number" placeholder="0" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} 
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg text-right font-black text-slate-900 outline-none focus:border-blue-500 transition-all" 
                />
              </div>

              <div className="col-span-1 w-full">
                <input type="number" placeholder="0" value={item.price} onChange={(e) => updateItem(i, 'price', e.target.value)} 
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg text-right font-bold text-slate-900 outline-none focus:border-blue-500 transition-all" 
                />
              </div>

              <div className="col-span-2 flex items-center gap-2 justify-end w-full">
                <div className="w-full p-3 bg-slate-200 border border-transparent rounded-lg text-right font-black text-slate-600 truncate">
                    PKR {(Number(item.quantity) * Number(item.price)).toLocaleString()}
                </div>
                {items.length > 1 && (
                    <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 p-2 rounded bg-red-50"><Trash2 size={16} /></button>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={addItem} className="flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-xs hover:text-blue-800 transition p-2">
            <Plus size={16} /> Add Product Row
          </button>
        </div>

        {/* PAYMENT SUMMARY */}
        <div className="flex justify-end pt-6 border-t border-slate-100 mt-10 w-full">
            <div className="w-full md:w-80 space-y-3 bg-slate-100 p-5 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center text-sm font-bold"><span className="text-slate-500">Subtotal:</span><span className="text-slate-900">PKR {subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-sm font-bold"><span className="text-slate-500">Discount:</span><input type="number" placeholder="0" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} className="w-24 text-right p-1.5 border border-slate-300 rounded font-black text-slate-900 outline-none focus:border-blue-500"/></div>
                <div className="flex justify-between items-center text-lg font-black pt-2 border-t border-slate-200"><span className="text-slate-700">Total:</span><span className="text-slate-950">PKR {totalAmount.toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-sm font-bold"><span className="text-slate-500">Payment:</span><input id="paymentInput" type="number" placeholder="0" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} className="w-24 text-right p-1.5 border-2 border-emerald-400 rounded font-black text-emerald-700 outline-none focus:border-emerald-600"/></div>
                <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-slate-200"><span className="text-slate-700">Balance:</span><span className={`font-black ${currentBalance>0?'text-red-600':'text-emerald-700'}`}>PKR {currentBalance.toLocaleString()}</span></div>
            </div>
        </div>

        {/* SUBMIT ACTIONS */}
        <div className="flex flex-col md:flex-row justify-end items-center gap-4 mt-12 w-full bg-white fixed bottom-0 left-0 right-0 p-4 border-t border-slate-200 lg:pl-72 z-40">
            <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={isSaving} className="w-full md:w-auto px-6 py-3 bg-orange-100 text-orange-700 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-orange-200 transition">Hold / Quotation</button>
            <button type="submit" disabled={isSaving} className="w-full md:w-auto px-10 py-3 bg-slate-900 text-white flex items-center justify-center gap-3 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-black transition shadow-lg disabled:opacity-50">
              <Save size={20} /> {isEditing ? 'Update & Active' : (Number(currentBalance)<=0 ? 'Save & Print (Paid)' : 'Save & Print (Credit)')}
            </button>
        </div>
      </form>
    </div>
  )
}