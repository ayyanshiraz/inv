'use client'

import { useState } from 'react'
import { createInvoice, getCustomerBalance } from '@/actions/actions' // Import helper
import { useRouter } from 'next/navigation'

export default function InvoiceForm({ customers, products, isReturnMode = false }: { customers: any[], products: any[], isReturnMode?: boolean }) {
  const router = useRouter()
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [prevBalance, setPrevBalance] = useState(0) // <--- Store Previous Balance
  const [paidAmount, setPaidAmount] = useState(0)   // <--- Store Paid Amount
  const [rows, setRows] = useState([{ productId: '', price: 0, quantity: 1, total: 0 }])

  // Handle Customer Selection
  const handleCustomerChange = async (e: any) => {
    const custId = e.target.value
    setSelectedCustomer(custId)
    if (custId) {
        const balance = await getCustomerBalance(custId)
        setPrevBalance(balance)
    } else {
        setPrevBalance(0)
    }
  }

  // ... (Keep existing handleKeyDown, updateRow, addRow) ...
  const handleKeyDown = (e: React.KeyboardEvent) => { /* ... same as before ... */ }
  const updateRow = (index: number, field: string, value: any) => {
    const newRows = [...rows] as any
    newRows[index][field] = value
    if (field === 'productId') {
        const prod = products.find(p => p.id === value)
        if (prod) newRows[index].price = prod.price
    }
    newRows[index].total = newRows[index].price * newRows[index].quantity
    setRows(newRows)
  }

  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0)
  const totalDue = (grandTotal + prevBalance) - paidAmount

  const handleSave = async () => {
    if (!selectedCustomer) return alert('Select Customer')
    
    const data = {
      customerId: selectedCustomer,
      totalAmount: grandTotal,
      paidAmount: Number(paidAmount), // <--- Send Paid Amount
      isReturn: isReturnMode,
      items: rows.map(r => ({ productId: r.productId, quantity: Number(r.quantity), price: Number(r.price) }))
    }

    const result = await createInvoice(data)
    if (result?.id) {
       window.open(`/print/${result.id}`, '_blank')
       router.push('/')
    }
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Customer</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold"
              onChange={handleCustomerChange}
            >
              <option value="">Select Customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
        <div className="bg-slate-100 p-3 rounded-lg flex flex-col justify-center text-right">
            <span className="text-xs font-bold uppercase text-slate-500">Previous Balance</span>
            <span className="text-2xl font-black text-red-600">PKR {prevBalance.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-2">
         {/* ... (Keep existing rows loop) ... */}
         {rows.map((row, i) => (
             <div key={i} className="grid grid-cols-12 gap-4 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                 <div className="col-span-5"><select dir="auto" className="w-full bg-transparent font-bold outline-none" value={row.productId} onChange={(e) => updateRow(i, 'productId', e.target.value)}><option value="">Item...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                 <div className="col-span-2 text-sm text-slate-500">{row.price}</div>
                 <div className="col-span-2"><input type="number" className="w-full p-1 bg-white border rounded text-center" value={row.quantity} onChange={(e) => updateRow(i, 'quantity', e.target.value)} /></div>
                 <div className="col-span-3 text-right font-bold">{row.total.toLocaleString()}</div>
             </div>
         ))}
      </div>
      
      <button onClick={() => setRows([...rows, { productId: '', price: 0, quantity: 1, total: 0 }])} className="mt-4 px-4 py-2 bg-slate-200 text-slate-700 rounded font-bold text-xs uppercase hover:bg-slate-300">+ Add Row</button>

      {/* FOOTER CALCS */}
      <div className="mt-8 border-t pt-6 space-y-2">
        <div className="flex justify-between text-sm"><span>Current Total:</span> <span className="font-bold">{grandTotal.toLocaleString()}</span></div>
        <div className="flex justify-between text-sm"><span>Prev Balance:</span> <span className="font-bold">{prevBalance.toLocaleString()}</span></div>
        <div className="flex justify-between items-center text-lg font-black bg-slate-50 p-2 rounded">
            <span>Paid Amount:</span>
            <input 
                type="number" 
                className="w-32 p-2 border border-slate-300 rounded text-right" 
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
            />
        </div>
        <div className="flex justify-between text-xl font-black text-slate-900 border-t pt-2">
            <span>Remaining Balance:</span> 
            <span>PKR {totalDue.toLocaleString()}</span>
        </div>
      </div>

      <button onClick={handleSave} className="w-full mt-8 py-4 bg-slate-900 text-white rounded-lg font-bold">Print Invoice</button>
    </div>
  )
}