'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { processSmartReturn, getCustomerInvoices } from '@/actions/actions'
import { Search, RefreshCcw, User, Calendar, ArrowLeft } from 'lucide-react'

export default function ReturnClient({ customers }: { customers: any[] }) {
  const router = useRouter()

  // CUSTOMER SEARCH STATE
  const [custSearch, setCustSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [showCustDropdown, setShowCustDropdown] = useState(false)
  const [custHoverIndex, setCustHoverIndex] = useState(0)

  // INVOICE STATE
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [returnQtys, setReturnQtys] = useState<{[key: string]: number}>({})
  const [loading, setLoading] = useState(false)

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()) || c.id.includes(custSearch))

  // --- KEYBOARD NAVIGATION ---
  const handleCustKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault(); setCustHoverIndex(prev => Math.min(prev + 1, filteredCustomers.length - 1))
    } else if (e.key === 'ArrowUp') {
        e.preventDefault(); setCustHoverIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
        e.preventDefault()
        if (showCustDropdown && filteredCustomers.length > 0) {
            handleSelectCustomer(filteredCustomers[custHoverIndex])
        }
    }
  }

  // --- SELECT CUSTOMER & FETCH INVOICES ---
  const handleSelectCustomer = async (cust: any) => {
    setSelectedCustomer(cust)
    setCustSearch(cust.name)
    setShowCustDropdown(false)
    setLoading(true)
    
    // Fetch their history
    const invoices = await getCustomerInvoices(cust.id)
    setCustomerInvoices(invoices)
    setLoading(false)
  }

  // --- SELECT INVOICE TO RETURN ---
  const selectInvoice = (inv: any) => {
    setSelectedInvoice(inv)
    setReturnQtys({}) // Reset quantities
  }

  const handleQtyChange = (itemId: string, max: number, val: string) => {
    const qty = Math.min(Math.max(0, Number(val)), max)
    setReturnQtys({ ...returnQtys, [itemId]: qty })
  }

  const calculateTotalRefund = () => {
    if (!selectedInvoice) return 0
    return selectedInvoice.items.reduce((sum: number, item: any) => {
      const qty = returnQtys[item.id] || 0
      return sum + (qty * item.price)
    }, 0)
  }

  const handleSubmit = async () => {
    if (!selectedInvoice) return
    const refundTotal = calculateTotalRefund()
    if (refundTotal <= 0) return alert("Please specify a quantity to return.")

    const itemsToReturn = selectedInvoice.items
      .map((item: any) => ({
        productId: item.productId,
        quantity: returnQtys[item.id] || 0,
        price: item.price
      }))
      .filter((i: any) => i.quantity > 0)

    await processSmartReturn(selectedInvoice.id, itemsToReturn, refundTotal, selectedInvoice.customerId)
    alert("Return Processed Successfully!")
    router.push('/invoices')
  }

  return (
    <div className="max-w-4xl mx-auto relative">
      
      {showCustDropdown && (
          <div className="fixed inset-0 z-30" onClick={() => setShowCustDropdown(false)} />
      )}

      {/* STEP 1 & 2: SEARCH CUSTOMER & SELECT INVOICE */}
      {!selectedInvoice && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            
            {/* CUSTOMER SEARCH */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative z-40">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">1. Search Customer</h3>
                <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        value={custSearch}
                        placeholder="Type customer name or ID..."
                        className="w-full pl-12 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-black text-slate-900 outline-none focus:border-blue-600 transition placeholder:text-slate-400"
                        onChange={(e) => {
                            setCustSearch(e.target.value)
                            setShowCustDropdown(true)
                            setSelectedCustomer(null)
                            setCustomerInvoices([])
                            setCustHoverIndex(0)
                        }}
                        onFocus={() => setShowCustDropdown(true)}
                        onKeyDown={handleCustKeyDown}
                    />
                </div>
                {showCustDropdown && (
                    <div className="absolute top-full left-8 right-8 mt-2 bg-white border-2 border-slate-200 shadow-2xl rounded-xl max-h-60 overflow-y-auto z-50 p-2">
                        {filteredCustomers.map((c, idx) => (
                            <div key={c.id} 
                                 onClick={() => handleSelectCustomer(c)} 
                                 onMouseEnter={() => setCustHoverIndex(idx)}
                                 className={`p-4 rounded-lg cursor-pointer text-slate-900 border-b border-slate-100 last:border-0 ${custHoverIndex === idx ? 'bg-blue-100' : 'hover:bg-blue-50'}`}>
                                <p className="font-black uppercase">{c.name}</p>
                                <p className="text-xs text-slate-500 font-bold">{c.phone} | ID: {c.id.slice(-4)}</p>
                            </div>
                        ))}
                        {filteredCustomers.length === 0 && <div className="p-4 text-slate-500 font-bold">No customers found.</div>}
                    </div>
                )}
            </div>

            {/* INVOICE LIST */}
            {selectedCustomer && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in">
                    <div className="p-6 bg-slate-900 flex justify-between items-center text-white">
                        <h3 className="text-sm font-black uppercase tracking-widest opacity-80">2. Select Invoice to Return</h3>
                        {loading && <span className="text-xs font-bold animate-pulse text-blue-300">Loading History...</span>}
                    </div>
                    
                    <div className="divide-y divide-slate-100">
                        {customerInvoices.map((inv) => (
                            <div key={inv.id} onClick={() => selectInvoice(inv)} className="flex justify-between items-center p-6 hover:bg-blue-50 cursor-pointer transition">
                                <div>
                                    <h4 className="font-mono font-black text-slate-800 text-lg">{inv.id.slice(-6).toUpperCase()}</h4>
                                    <p className="text-xs text-slate-500 font-bold flex gap-2 items-center mt-1">
                                        <Calendar size={12}/> {new Date(inv.createdAt).toLocaleDateString()} 
                                        <span className="text-slate-300">|</span> 
                                        {inv.items.length} Items
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-slate-900">PKR {inv.totalAmount.toLocaleString()}</p>
                                    <p className="text-[10px] font-black uppercase text-blue-600">Click to Return</p>
                                </div>
                            </div>
                        ))}
                        {customerInvoices.length === 0 && !loading && (
                            <div className="p-10 text-center text-slate-400 font-bold">This customer has no invoices.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
      )}

      {/* STEP 3: RETURN DETAILS */}
      {selectedInvoice && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Processing Return</p>
                    <h2 className="text-2xl font-black uppercase flex items-center gap-2 mt-1">
                        <User size={20}/> {selectedCustomer.name}
                    </h2>
                </div>
                <button onClick={() => setSelectedInvoice(null)} className="flex items-center gap-2 text-xs font-bold bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition">
                    <ArrowLeft size={14}/> Back to Invoices
                </button>
            </div>

            <div className="p-8">
                <table className="w-full text-left mb-8">
                    <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100">
                            <th className="pb-4">Product Name</th>
                            <th className="pb-4 text-center">Orig. Qty</th>
                            <th className="pb-4 text-right">Sold Price</th>
                            <th className="pb-4 text-center w-32">Return Qty</th>
                            <th className="pb-4 text-right">Refund Amount</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-bold text-slate-900 divide-y divide-slate-50">
                        {selectedInvoice.items.map((item: any) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition">
                                <td className="py-4 uppercase">{item.product.name}</td>
                                <td className="py-4 text-center text-slate-400 font-black">{item.quantity}</td>
                                <td className="py-4 text-right">PKR {item.price.toLocaleString()}</td>
                                <td className="py-4 px-2">
                                    <input 
                                        type="number" 
                                        className="w-full p-3 border-2 border-slate-200 rounded-lg text-center focus:border-red-500 outline-none font-black text-slate-900 placeholder:text-slate-300"
                                        min="0"
                                        max={item.quantity}
                                        value={returnQtys[item.id] || ''}
                                        placeholder="0"
                                        onChange={(e) => handleQtyChange(item.id, item.quantity, e.target.value)}
                                    />
                                </td>
                                <td className="py-4 text-right font-black text-red-600 text-lg">
                                    {((returnQtys[item.id] || 0) * item.price).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-xl border border-slate-200 mt-8">
                    <div className="text-slate-500 font-bold text-sm">
                        Original Invoice Total: <span className="text-slate-900">PKR {selectedInvoice.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="text-right flex items-center gap-6">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Refund</p>
                            <p className="text-4xl font-black text-red-600">PKR {calculateTotalRefund().toLocaleString()}</p>
                        </div>
                        <button 
                            onClick={handleSubmit} 
                            className="bg-red-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 transition flex items-center gap-3"
                            style={{ color: 'white' }}
                        >
                            <RefreshCcw size={20} /> Process Return
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}