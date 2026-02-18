'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { processSmartReturn, searchInvoices } from '@/actions/actions'
import { Search, RefreshCcw, User, Calendar } from 'lucide-react'

export default function SmartReturnPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [returnQtys, setReturnQtys] = useState<{[key: string]: number}>({})
  const [loading, setLoading] = useState(false)

  // 1. Search Function
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery) return
    setLoading(true)
    const results = await searchInvoices(searchQuery)
    setSearchResults(results)
    if (results.length === 0) alert('No invoices found.')
    setLoading(false)
  }

  // 2. Select an Invoice from results
  const selectInvoice = (inv: any) => {
    setSelectedInvoice(inv)
    setSearchResults([]) // Clear list to show selected detail
    setSearchQuery('')
  }

  // ... (Keep existing Qty logic)
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
    if (refundTotal <= 0) return alert("Please select quantity to return.")

    const itemsToReturn = selectedInvoice.items
      .map((item: any) => ({
        productId: item.productId,
        quantity: returnQtys[item.id] || 0,
        price: item.price
      }))
      .filter((i: any) => i.quantity > 0)

    await processSmartReturn(selectedInvoice.id, itemsToReturn, refundTotal, selectedInvoice.customerId)
    alert("Return Processed Successfully!")
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 ml-64">
      <h1 className="text-3xl font-black text-slate-900 uppercase mb-8">Sales Return</h1>

      {/* SEARCH SECTION */}
      {!selectedInvoice && (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
                <h3 className="text-xl font-bold text-slate-700 mb-4">Find Invoice</h3>
                <form onSubmit={handleSearch} className="flex gap-4">
                    <input 
                        type="text" 
                        placeholder="Search by Customer Name, Phone or Invoice ID..." 
                        className="flex-1 p-4 border rounded-xl font-bold bg-slate-50 outline-none focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" disabled={loading} className="bg-slate-900 text-white px-8 rounded-xl font-bold hover:bg-black transition">
                        {loading ? '...' : <Search />}
                    </button>
                </form>
            </div>

            {/* RESULTS LIST */}
            {searchResults.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 bg-slate-100 font-bold text-xs uppercase text-slate-500 tracking-widest">Select an invoice to return</div>
                    {searchResults.map((inv) => (
                        <div key={inv.id} onClick={() => selectInvoice(inv)} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-blue-50 cursor-pointer transition">
                            <div className="flex gap-4 items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                    {inv.customer.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 uppercase">{inv.customer.name}</h4>
                                    <p className="text-xs text-slate-500 font-bold flex gap-2 items-center">
                                        <Calendar size={12}/> {new Date(inv.createdAt).toLocaleDateString()}
                                        <span className="text-slate-300">|</span>
                                        Inv: {inv.id.slice(-6).toUpperCase()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-emerald-600">PKR {inv.totalAmount.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}

      {/* RETURN DETAILS SECTION (Selected Invoice) */}
      {selectedInvoice && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                <div>
                    <p className="text-xs font-bold uppercase opacity-50">Returning Items For</p>
                    <h2 className="text-2xl font-black uppercase flex items-center gap-2"><User size={20}/> {selectedInvoice.customer.name}</h2>
                </div>
                <button onClick={() => {setSelectedInvoice(null); setSearchResults([]);}} className="text-xs font-bold bg-white/20 px-3 py-1 rounded hover:bg-white/30">
                    Change Invoice
                </button>
            </div>

            <div className="p-8">
                <table className="w-full text-left mb-8">
                    <thead>
                        <tr className="text-xs font-black text-slate-400 uppercase tracking-widest border-b">
                            <th className="pb-4">Item</th>
                            <th className="pb-4">Orig. Qty</th>
                            <th className="pb-4">Price</th>
                            <th className="pb-4 w-32">Return Qty</th>
                            <th className="pb-4 text-right">Refund</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-bold text-slate-700">
                        {selectedInvoice.items.map((item: any) => (
                            <tr key={item.id} className="border-b last:border-0">
                                <td className="py-4">{item.product.name}</td>
                                <td className="py-4 text-slate-400">{item.quantity}</td>
                                <td className="py-4">PKR {item.price}</td>
                                <td className="py-4">
                                    <input 
                                        type="number" 
                                        className="w-24 p-2 border-2 border-slate-200 rounded-lg text-center focus:border-red-500 outline-none"
                                        min="0"
                                        max={item.quantity}
                                        value={returnQtys[item.id] || ''}
                                        placeholder="0"
                                        onChange={(e) => handleQtyChange(item.id, item.quantity, e.target.value)}
                                    />
                                </td>
                                <td className="py-4 text-right text-red-600">
                                    PKR {((returnQtys[item.id] || 0) * item.price).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end items-center gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-400 text-right">Total Refund</p>
                        <p className="text-3xl font-black text-red-600">PKR {calculateTotalRefund().toLocaleString()}</p>
                    </div>
                    <button onClick={handleSubmit} className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition flex items-center gap-2">
                        <RefreshCcw size={20} /> Confirm Return
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}