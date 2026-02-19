'use client'

import { useState, useEffect } from 'react'
import { createInvoice, updateInvoice, getCustomerBalance } from '@/actions/actions'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function InvoiceForm({ customers, products, initialData }: { customers: any[], products: any[], initialData?: any }) {
  const router = useRouter()
  
  const [custSearch, setCustSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [showCustDropdown, setShowCustDropdown] = useState(false)
  const [prevBalance, setPrevBalance] = useState(0)

  const [rows, setRows] = useState([{ id: Date.now().toString(), productId: '', search: '', price: '', quantity: 1, total: 0 }])
  const [activeRowDrop, setActiveRowDrop] = useState<number | null>(null)
  const [paidAmount, setPaidAmount] = useState<number | ''>('')

  const [custHoverIndex, setCustHoverIndex] = useState(0)
  const [prodHoverIndex, setProdHoverIndex] = useState(0)

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()) || c.id.includes(custSearch))
  const filteredProducts = (index: number) => products.filter(p => p.name.toLowerCase().includes(rows[index]?.search.toLowerCase()) || p.id.includes(rows[index]?.search))

  useEffect(() => {
    if (initialData) {
        setSelectedCustomer(initialData.customer)
        setCustSearch(initialData.customer.name)
        setPaidAmount(initialData.paidAmount || 0)
        setRows(initialData.items.map((item: any, idx: number) => ({
            id: `edit-${idx}`,
            productId: item.productId,
            search: item.product.name,
            price: item.price.toString(),
            quantity: item.quantity,
            total: item.price * item.quantity
        })))
        
        getCustomerBalance(initialData.customer.id).then(bal => {
            let invoiceImpact = 0;
            if (initialData.isReturn) { invoiceImpact = -(initialData.totalAmount) } 
            else { invoiceImpact = initialData.totalAmount - (initialData.paidAmount || 0) }
            setPrevBalance(bal - invoiceImpact)
        })
    }
  }, [initialData])

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

  const handleProdKeyDown = (e: React.KeyboardEvent, index: number) => {
    const list = filteredProducts(index)
    if (e.key === 'ArrowDown') {
        e.preventDefault(); setProdHoverIndex(prev => Math.min(prev + 1, list.length - 1))
    } else if (e.key === 'ArrowUp') {
        e.preventDefault(); setProdHoverIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
        e.preventDefault()
        if (activeRowDrop === index && list.length > 0) {
            handleSelectProduct(index, list[prodHoverIndex])
        }
    }
  }

  const handleInputEnter = (e: React.KeyboardEvent, nextFieldId: string) => {
    if (e.key === 'Enter') {
        e.preventDefault(); document.getElementById(nextFieldId)?.focus()
    }
  }

  const handlePriceEnter = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
        e.preventDefault(); addRow()
        setTimeout(() => document.getElementById(`search-${index + 1}`)?.focus(), 50)
    }
  }

  const handleSelectCustomer = async (cust: any) => {
    setSelectedCustomer(cust)
    setCustSearch(cust.name)
    setShowCustDropdown(false)
    const balance = await getCustomerBalance(cust.id)
    setPrevBalance(balance)
    document.getElementById('search-0')?.focus()
  }

  const handleSelectProduct = (index: number, prod: any) => {
    const newRows = [...rows]
    newRows[index].productId = prod.id
    newRows[index].search = prod.name
    newRows[index].price = '' 
    newRows[index].total = 0
    setRows(newRows)
    setActiveRowDrop(null)
    document.getElementById(`qty-${index}`)?.focus()
  }

  const updateRowDetails = (index: number, field: string, value: string | number) => {
    const newRows = [...rows] as any
    newRows[index][field] = value
    const priceNum = Number(newRows[index].price) || 0
    const qtyNum = Number(newRows[index].quantity) || 0
    newRows[index].total = priceNum * qtyNum
    setRows(newRows)
  }

  const addRow = () => {
    setRows([...rows, { id: Date.now().toString(), productId: '', search: '', price: '', quantity: 1, total: 0 }])
  }

  const currentTotal = rows.reduce((sum, row) => sum + row.total, 0)
  const grandTotal = currentTotal + prevBalance
  const numericPaid = Number(paidAmount) || 0
  
  let remainingBalance = 0;
  if (initialData?.isReturn) { remainingBalance = prevBalance - currentTotal } 
  else { remainingBalance = grandTotal - numericPaid }

  const handleSave = async () => {
    if (!selectedCustomer) return alert('Please select a customer.')
    const validRows = rows.filter(r => r.productId && Number(r.price) > 0 && r.quantity > 0)
    if (validRows.length === 0) return alert('Please add at least one valid product.')

    const data = {
      customerId: selectedCustomer.id,
      totalAmount: currentTotal,
      paidAmount: numericPaid,
      items: validRows.map(r => ({ productId: r.productId, quantity: Number(r.quantity), price: Number(r.price) }))
    }

    let result;
    if (initialData) { result = await updateInvoice(initialData.id, data) } 
    else { result = await createInvoice(data) }
    
    if (result?.id) {
       window.open(`/print/${result.id}`, '_blank')
       router.push('/invoices')
    }
  }

  return (
    <div className="bg-white p-4 md:p-8 rounded-2xl shadow-xl border border-slate-200 relative">
      {(showCustDropdown || activeRowDrop !== null) && (
          <div className="fixed inset-0 z-30" onClick={() => { setShowCustDropdown(false); setActiveRowDrop(null); }} />
      )}

      {/* HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 relative z-40">
        <div className="relative">
            <label className="text-xs font-black uppercase text-slate-800 mb-2 block">Search Customer</label>
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" value={custSearch} placeholder="Type name or ID..."
                    className="w-full pl-10 p-3 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-900 outline-none focus:border-blue-600 transition placeholder:text-slate-400"
                    onChange={(e) => {
                        setCustSearch(e.target.value)
                        setShowCustDropdown(true)
                        setSelectedCustomer(null)
                        setPrevBalance(0)
                        setCustHoverIndex(0)
                    }}
                    onFocus={() => setShowCustDropdown(true)}
                    onKeyDown={handleCustKeyDown}
                />
            </div>
            {showCustDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 shadow-2xl rounded-xl max-h-60 overflow-y-auto z-50 p-2">
                    {filteredCustomers.map((c, idx) => (
                        <div key={c.id} onClick={() => handleSelectCustomer(c)} onMouseEnter={() => setCustHoverIndex(idx)}
                             className={`p-3 rounded-lg cursor-pointer text-slate-900 border-b border-slate-100 last:border-0 ${custHoverIndex === idx ? 'bg-blue-100' : 'hover:bg-blue-50'}`}>
                            <p className="font-black uppercase">{c.name}</p>
                            <p className="text-xs text-slate-500 font-bold">{c.phone} | ID: {c.id.slice(-4)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="bg-slate-50 p-4 rounded-xl flex flex-col justify-center text-left md:text-right border-2 border-slate-200 mt-4 md:mt-0">
            <span className="text-xs font-black uppercase text-slate-500">Previous Balance</span>
            <span className={`text-3xl font-black ${prevBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                PKR {prevBalance.toLocaleString()}
            </span>
        </div>
      </div>

      {/* ITEMS TABLE (Mobile Responsive) */}
      <div className="space-y-4 relative z-30">
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-2 text-[10px] font-black uppercase text-slate-500">
          <div className="col-span-6">Search Product</div>
          <div className="col-span-2 text-center">{initialData?.isReturn ? 'Returned Qty' : 'Qty'}</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        {rows.map((row, i) => (
          // Mobile: Flex Column Card | Desktop: Grid Row
          <div key={row.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center bg-slate-50 p-4 md:p-3 rounded-xl border-2 border-slate-200 relative">
            
            {/* Product Search */}
            <div className="w-full md:col-span-6 relative">
              <label className="md:hidden text-[10px] font-black uppercase text-slate-500 mb-1 block">Product Search</label>
              <input id={`search-${i}`} type="text" placeholder="Type to search..." value={row.search}
                className="w-full p-3 md:p-2 bg-white border border-slate-300 rounded-lg font-black text-slate-900 outline-none focus:border-blue-500 placeholder:text-slate-400"
                onChange={(e) => {
                    updateRowDetails(i, 'search', e.target.value)
                    updateRowDetails(i, 'productId', '')
                    setActiveRowDrop(i)
                    setProdHoverIndex(0)
                }}
                onFocus={() => setActiveRowDrop(i)}
                onKeyDown={(e) => handleProdKeyDown(e, i)}
              />
              {activeRowDrop === i && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border-2 border-slate-300 shadow-2xl rounded-lg max-h-48 overflow-y-auto z-50 p-1">
                      {filteredProducts(i).map((p, idx) => (
                          <div key={p.id} onClick={() => handleSelectProduct(i, p)} onMouseEnter={() => setProdHoverIndex(idx)}
                               className={`p-3 md:p-2 cursor-pointer rounded text-slate-900 ${prodHoverIndex === idx ? 'bg-blue-100' : 'hover:bg-slate-100'}`}>
                              <p className="font-black text-sm">{p.name}</p>
                          </div>
                      ))}
                  </div>
              )}
            </div>
            
            <div className="flex gap-4 w-full md:contents">
                {/* Qty */}
                <div className="flex-1 md:col-span-2">
                  <label className="md:hidden text-[10px] font-black uppercase text-slate-500 mb-1 block">Qty</label>
                  <input id={`qty-${i}`} type="number" className="w-full p-3 md:p-2 bg-white border border-slate-300 rounded-lg text-center font-black text-slate-900 outline-none placeholder:text-slate-400"
                    value={row.quantity} onChange={(e) => updateRowDetails(i, 'quantity', e.target.value)} onKeyDown={(e) => handleInputEnter(e, `price-${i}`)}
                  />
                </div>
                
                {/* Price */}
                <div className="flex-1 md:col-span-2">
                    <label className="md:hidden text-[10px] font-black uppercase text-slate-500 mb-1 block">Price</label>
                    <input id={`price-${i}`} type="number" placeholder="0" className="w-full p-3 md:p-2 bg-white border border-slate-300 rounded-lg text-right font-black text-slate-900 outline-none focus:border-blue-500 placeholder:text-slate-400"
                        value={row.price} onChange={(e) => updateRowDetails(i, 'price', e.target.value)} onKeyDown={(e) => handlePriceEnter(e, i)}
                    />
                </div>
            </div>

            {/* Total */}
            <div className={`w-full md:col-span-2 flex justify-between md:block text-right font-black text-lg pt-3 md:pt-0 mt-2 md:mt-0 border-t border-slate-200 md:border-0 ${initialData?.isReturn ? 'text-red-600' : 'text-slate-900'}`}>
                <span className="md:hidden text-sm uppercase text-slate-500">Row Total:</span>
                <span>{row.total.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
      
      <button onClick={addRow} className="mt-4 w-full md:w-auto px-4 py-3 md:py-2 bg-slate-900 text-white rounded-lg font-black text-xs uppercase hover:bg-black transition">
        + Add Row
      </button>

      {/* FOOTER TOTALS */}
      <div className="mt-10 border-t-2 border-slate-200 pt-8 space-y-4 md:max-w-md md:ml-auto">
        <div className="flex justify-between text-slate-600 font-bold">
            <span>{initialData?.isReturn ? 'Total Return Value:' : 'Current Invoice Total:'}</span> 
            <span className={initialData?.isReturn ? 'text-red-600 font-black' : 'text-slate-900'}>{currentTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-slate-600 font-bold">
            <span>Previous Balance:</span> 
            <span className="text-slate-900">{prevBalance.toLocaleString()}</span>
        </div>
        
        {!initialData?.isReturn && (
            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-200">
                <span className="font-black text-blue-900 uppercase text-xs md:text-sm">Paid Amount:</span>
                <input type="number" placeholder="0" className="w-32 md:w-40 p-3 bg-white border-2 border-blue-300 rounded-lg text-right font-black text-slate-900 outline-none focus:border-blue-600 placeholder:text-blue-300" 
                    value={paidAmount} onChange={(e) => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                />
            </div>
        )}

        <div className="flex justify-between items-end border-t-2 border-slate-900 pt-4">
            <span className="text-sm font-black uppercase text-slate-600">Remaining Balance:</span> 
            <span className="text-3xl md:text-4xl font-black text-slate-900">PKR {remainingBalance.toLocaleString()}</span>
        </div>
      </div>

      <button onClick={handleSave} style={{ color: 'white' }} 
              className={`w-full mt-10 py-5 text-white rounded-xl font-black text-lg uppercase tracking-widest shadow-2xl transition ${initialData?.isReturn ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
        {initialData ? (initialData.isReturn ? 'Update Return Record' : 'Update & Print Invoice') : 'Generate & Print Invoice'}
      </button>
    </div>
  )
}