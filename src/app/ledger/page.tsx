import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { TrendingUp, DollarSign, ArrowLeftRight, Search } from 'lucide-react'
import { getLedgerReportData } from '@/actions/actions'
import PrintButton from '@/components/PrintButton'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function LedgerPage({ searchParams }: { searchParams: Promise<{ from?: string, to?: string, view?: string, search?: string, category?: string }> }) {
  const params = await searchParams
  
  const from = params.from ? new Date(params.from) : undefined
  const to = params.to ? new Date(params.to) : undefined
  const view = params.view || 'customers' 
  const searchQuery = params.search?.toLowerCase() || ''
  const catQuery = params.category || ''

  const data = await getLedgerReportData(from, to)

  const today = new Date().toISOString().split('T')[0]
  const curr = new Date()
  const firstDayOfWeek = new Date(curr.setDate(curr.getDate() - curr.getDay())).toISOString().split('T')[0]
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  let displayCustomers = data.customerLedgers
  if (catQuery) displayCustomers = displayCustomers.filter((c: any) => c.category === catQuery)
  if (searchQuery) displayCustomers = displayCustomers.filter((c: any) => c.name.toLowerCase().includes(searchQuery) || c.id.toLowerCase().includes(searchQuery))

  let displayCategories = data.categoryLedgers
  if (catQuery) displayCategories = displayCategories.filter((c: any) => c.category === catQuery)
  if (searchQuery) displayCategories = displayCategories.filter((c: any) => c.category.toLowerCase().includes(searchQuery))

  let displayProducts = data.productSales
  if (searchQuery) displayProducts = displayProducts.filter((p: any) => p.name.toLowerCase().includes(searchQuery) || p.category.toLowerCase().includes(searchQuery))

  let displayProductCategories = data.productCategoryLedgers || []
  if (catQuery) displayProductCategories = displayProductCategories.filter((c: any) => c.category === catQuery)
  if (searchQuery) displayProductCategories = displayProductCategories.filter((c: any) => c.category.toLowerCase().includes(searchQuery))

  let displayInventory = data.allProducts
  if (searchQuery) displayInventory = displayInventory.filter((p: any) => p.name.toLowerCase().includes(searchQuery) || p.id.toLowerCase().includes(searchQuery))

  let displayAllCustomers = data.allCustomers
  if (catQuery) displayAllCustomers = displayAllCustomers.filter((c: any) => c.category === catQuery)
  if (searchQuery) displayAllCustomers = displayAllCustomers.filter((c: any) => c.name.toLowerCase().includes(searchQuery) || (c.phone && c.phone.includes(searchQuery)))

  return (
    <div className="min-h-screen bg-slate-50 lg:ml-64 p-4 pt-20 lg:p-8 print:m-0 print:p-0 print:bg-white">
      <div className="max-w-5xl mx-auto">
        
        <style>{`
          @media print {
              @page { size: A4 portrait; margin: 15mm; }
              body { background-color: white !important; margin: 0; padding: 0; }
              body * { visibility: hidden; }
              #print-area, #print-area * { visibility: visible; }
              #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0 !important; border: none !important; box-shadow: none !important; }
              .no-print { display: none !important; }
              table { width: 100% !important; border-collapse: collapse; }
              th, td { border: 1px solid #000 !important; padding: 6px !important; color: #000 !important; font-size: 11px !important; }
              th { background-color: #e5e7eb !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}</style>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 no-print">
          <div><h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Ledger</h1><p className="text-slate-500 font-bold text-sm">Financial Reports & Search</p></div>
          
          <form className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-200 w-full md:w-auto">
              <input type="hidden" name="view" value={view} />
              
              <div className="flex items-center gap-2">
                  <div className="flex bg-slate-100 rounded-lg p-1 mr-1 border border-slate-200 shadow-inner">
                      <Link href={`/ledger?view=${view}&from=${today}&to=${today}`} className="px-3 py-1.5 text-[10px] font-black uppercase rounded hover:bg-white hover:shadow-sm transition text-slate-600">Daily</Link>
                      <Link href={`/ledger?view=${view}&from=${firstDayOfWeek}&to=${today}`} className="px-3 py-1.5 text-[10px] font-black uppercase rounded hover:bg-white hover:shadow-sm transition text-slate-600 border-l border-r border-slate-200">Weekly</Link>
                      <Link href={`/ledger?view=${view}&from=${firstDayOfMonth}&to=${today}`} className="px-3 py-1.5 text-[10px] font-black uppercase rounded hover:bg-white hover:shadow-sm transition text-slate-600">Monthly</Link>
                  </div>

                  <input type="date" name="from" defaultValue={params.from} className="text-xs font-bold uppercase text-slate-900 outline-none cursor-pointer bg-slate-50 p-2 rounded border border-slate-200" />
                  <span className="text-slate-400 font-bold">-</span>
                  <input type="date" name="to" defaultValue={params.to} className="text-xs font-bold uppercase text-slate-900 outline-none cursor-pointer bg-slate-50 p-2 rounded border border-slate-200" />
              </div>

              <div className="relative">
                  <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" name="search" defaultValue={searchQuery} placeholder="Search..." className="pl-7 p-2 text-xs font-bold text-slate-900 outline-none bg-slate-50 rounded border border-slate-200 w-28 lg:w-40" />
              </div>

              {(view === 'customers' || view === 'customer_list' || view === 'categories' || view === 'product_categories') && (
                  <select name="category" defaultValue={catQuery} className="p-2 text-xs font-bold text-slate-900 outline-none bg-slate-50 rounded border border-slate-200">
                      <option value="">All Categories</option>
                      {data.categoryLedgers.map((c: any) => <option key={c.category} value={c.category}>{c.category}</option>)}
                  </select>
              )}
              
              <div className="flex gap-2 w-full sm:w-auto">
                  <button type="submit" className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-black transition text-xs font-bold uppercase tracking-widest">Filter</button>
                  <Link href={`/ledger?view=${view}`} className="flex-1 text-center bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition text-xs font-bold uppercase tracking-widest">Clear</Link>
              </div>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 no-print">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center"><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Period Revenue</p><h2 className="text-xl font-black text-slate-900">PKR {data.stats.revenue.toLocaleString()}</h2></div><div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><DollarSign size={20} /></div></div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center"><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Period Profit ({data.stats.margin}%)</p><h2 className="text-xl font-black text-slate-900">PKR {data.stats.profit.toLocaleString()}</h2></div><div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><TrendingUp size={20} /></div></div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center border-l-4 border-l-orange-500"><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Receivables</p><h2 className="text-xl font-black text-slate-900">PKR {data.stats.receivables.toLocaleString()}</h2></div><div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center"><ArrowLeftRight size={20} /></div></div>
        </div>

        <div className="flex justify-between items-end border-b-2 border-slate-200 pb-3 mb-6 no-print">
            <div className="flex gap-6 overflow-x-auto pb-2 custom-scrollbar">
                <Link href={`/ledger?from=${params.from || ''}&to=${params.to || ''}&view=customers`} className={`text-sm font-black uppercase tracking-widest pb-3 -mb-[14px] border-b-4 transition whitespace-nowrap ${view === 'customers' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>Customer Ledger</Link>
                <Link href={`/ledger?from=${params.from || ''}&to=${params.to || ''}&view=categories`} className={`text-sm font-black uppercase tracking-widest pb-3 -mb-[14px] border-b-4 transition whitespace-nowrap ${view === 'categories' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>Customer Categories</Link>
                <Link href={`/ledger?from=${params.from || ''}&to=${params.to || ''}&view=products`} className={`text-sm font-black uppercase tracking-widest pb-3 -mb-[14px] border-b-4 transition whitespace-nowrap ${view === 'products' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>Product Sales</Link>
                <Link href={`/ledger?from=${params.from || ''}&to=${params.to || ''}&view=product_categories`} className={`text-sm font-black uppercase tracking-widest pb-3 -mb-[14px] border-b-4 transition whitespace-nowrap ${view === 'product_categories' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>Product Categories</Link>
                <Link href={`/ledger?from=${params.from || ''}&to=${params.to || ''}&view=inventory_list`} className={`text-sm font-black uppercase tracking-widest pb-3 -mb-[14px] border-b-4 transition whitespace-nowrap ${view === 'inventory_list' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>T.Product List</Link>
                <Link href={`/ledger?from=${params.from || ''}&to=${params.to || ''}&view=customer_list`} className={`text-sm font-black uppercase tracking-widest pb-3 -mb-[14px] border-b-4 transition whitespace-nowrap ${view === 'customer_list' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>T.Customer List</Link>
            </div>
            <PrintButton />
        </div>

        <div id="print-area" className="bg-white border border-slate-200 rounded-xl shadow-sm print:shadow-none print:border-none print:rounded-none">
          <div className="p-6 md:p-8">
              <div className="text-center mb-6 border-b-2 border-slate-800 pb-6"><h1 className="text-2xl font-black uppercase text-black tracking-widest font-serif mb-1">Fahad Traders</h1><h2 className="text-base font-bold text-slate-800 mb-1">{view === 'customers' ? (catQuery ? `${catQuery} Ledger Summary` : 'Customer Ledger Summary') : view === 'categories' ? (catQuery ? `${catQuery} Detailed Ledger` : 'Category Ledger Summary') : view === 'product_categories' ? (catQuery ? `${catQuery} Product Categories` : 'Product Category Summary') : view === 'inventory_list' ? 'Active Product List' : view === 'customer_list' ? 'Active Customer List' : 'Product Sales Summary'}</h2><p className="text-xs font-bold text-slate-500 uppercase">Period: {from ? from.toLocaleDateString() : 'Beginning of Time'} - {to ? to.toLocaleDateString() : 'Present'}</p></div>

              <div className="w-full overflow-x-auto">
                  
                  {view === 'customers' && (
                      <table className="w-full min-w-[800px] text-left border-collapse border border-slate-300">
                      <thead className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-300">
                          <tr><th className="p-3 border border-slate-300 w-12 text-center">Sr.</th><th className="p-3 border border-slate-300">Customer</th><th className="p-3 border border-slate-300 text-right whitespace-nowrap">Opening Bal</th><th className="p-3 border border-slate-300 text-right whitespace-nowrap">Invoiced</th><th className="p-3 border border-slate-300 text-right whitespace-nowrap">Returns</th><th className="p-3 border border-slate-300 text-right whitespace-nowrap">Paid Amount</th><th className="p-3 border border-slate-300 text-right whitespace-nowrap">Closing Bal</th></tr>
                      </thead>
                      <tbody className="text-xs font-bold text-slate-700">
                          {displayCustomers.map((c: any, index: number) => (<tr key={c.id} className="hover:bg-slate-50 transition"><td className="p-3 border border-slate-300 text-center text-slate-400">{index + 1}</td><td className="p-3 border border-slate-300 uppercase whitespace-nowrap text-slate-900">{c.name}</td><td className="p-3 border border-slate-300 text-right">{c.openingBalance.toLocaleString()}</td><td className="p-3 border border-slate-300 text-right text-blue-700">{c.invoicedAmount.toLocaleString()}</td><td className="p-3 border border-slate-300 text-right text-red-600">{c.returnAmount.toLocaleString()}</td><td className="p-3 border border-slate-300 text-right text-emerald-700">{c.paidAmount.toLocaleString()}</td><td className="p-3 border border-slate-300 text-right font-black text-slate-900">{c.closingBalance.toLocaleString()}</td></tr>))}
                          <tr className="bg-slate-100 border-t-2 border-slate-400 font-black text-slate-900 text-xs"><td colSpan={2} className="p-3 border border-slate-300 text-right uppercase">Filtered Total:</td><td className="p-3 border border-slate-300 text-right">{displayCustomers.reduce((s: number, c: any) => s + c.openingBalance, 0).toLocaleString()}</td><td className="p-3 border border-slate-300 text-right text-blue-700">{displayCustomers.reduce((s: number, c: any) => s + c.invoicedAmount, 0).toLocaleString()}</td><td className="p-3 border border-slate-300 text-right text-red-600">{displayCustomers.reduce((s: number, c: any) => s + c.returnAmount, 0).toLocaleString()}</td><td className="p-3 border border-slate-300 text-right text-emerald-600">{displayCustomers.reduce((s: number, c: any) => s + c.paidAmount, 0).toLocaleString()}</td><td className="p-3 border border-slate-300 text-right text-sm">{displayCustomers.reduce((s: number, c: any) => s + c.closingBalance, 0).toLocaleString()}</td></tr>
                      </tbody>
                      </table>
                  )}

                  {view === 'categories' && (
                      <table className="w-full min-w-[800px] text-left border-collapse border border-slate-300">
                      <thead className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-300">
                          <tr>
                            <th className="p-3 border border-slate-300">Customer Category & Details</th>
                            <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Opening Bal</th>
                            <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Invoiced</th>
                            <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Returns</th>
                            <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Paid Amount</th>
                            <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Closing Bal</th>
                          </tr>
                      </thead>
                      {displayCategories.map((cat: any) => (
                          <tbody key={cat.category} className="text-xs font-bold text-slate-700 border-b-4 border-slate-400">
                              <tr className="bg-slate-200 text-slate-900 transition">
                                  <td className="p-3 border border-slate-300 uppercase whitespace-nowrap tracking-widest text-sm font-black text-blue-900 border-l-4 border-l-blue-600">
                                      {cat.category} (Total)
                                  </td>
                                  <td className="p-3 border border-slate-300 text-right">{cat.openingBalance.toLocaleString()}</td>
                                  <td className="p-3 border border-slate-300 text-right text-blue-800">{cat.invoicedAmount.toLocaleString()}</td>
                                  <td className="p-3 border border-slate-300 text-right text-red-700">{cat.returnAmount.toLocaleString()}</td>
                                  <td className="p-3 border border-slate-300 text-right text-emerald-700">{cat.paidAmount.toLocaleString()}</td>
                                  <td className="p-3 border border-slate-300 text-right font-black text-lg">{cat.closingBalance.toLocaleString()}</td>
                              </tr>
                              {displayCustomers.filter((c: any) => c.category === cat.category).map((c: any) => (
                                  <tr key={c.id} className="hover:bg-slate-50 transition bg-white">
                                      <td className="p-3 border border-slate-300 uppercase whitespace-nowrap text-slate-600 pl-6 border-l-4 border-l-transparent">
                                          ↳ <span className="ml-2 text-slate-900">{c.name}</span>
                                      </td>
                                      <td className="p-3 border border-slate-300 text-right">{c.openingBalance.toLocaleString()}</td>
                                      <td className="p-3 border border-slate-300 text-right text-blue-600">{c.invoicedAmount.toLocaleString()}</td>
                                      <td className="p-3 border border-slate-300 text-right text-red-500">{c.returnAmount.toLocaleString()}</td>
                                      <td className="p-3 border border-slate-300 text-right text-emerald-600">{c.paidAmount.toLocaleString()}</td>
                                      <td className="p-3 border border-slate-300 text-right font-black">{c.closingBalance.toLocaleString()}</td>
                                  </tr>
                              ))}
                          </tbody>
                      ))}
                      <tfoot className="bg-slate-900 text-white font-black text-xs">
                          <tr>
                              <td className="p-3 border border-slate-700 text-right uppercase tracking-widest">Grand Market Total:</td>
                              <td className="p-3 border border-slate-700 text-right">{displayCategories.reduce((s: number, c: any) => s + c.openingBalance, 0).toLocaleString()}</td>
                              <td className="p-3 border border-slate-700 text-right text-blue-300">{displayCategories.reduce((s: number, c: any) => s + c.invoicedAmount, 0).toLocaleString()}</td>
                              <td className="p-3 border border-slate-700 text-right text-red-400">{displayCategories.reduce((s: number, c: any) => s + c.returnAmount, 0).toLocaleString()}</td>
                              <td className="p-3 border border-slate-700 text-right text-emerald-400">{displayCategories.reduce((s: number, c: any) => s + c.paidAmount, 0).toLocaleString()}</td>
                              <td className="p-3 border border-slate-700 text-right text-sm">{displayCategories.reduce((s: number, c: any) => s + c.closingBalance, 0).toLocaleString()}</td>
                          </tr>
                      </tfoot>
                      </table>
                  )}

                  {view === 'products' && (
                      <table className="w-full min-w-[700px] text-left border-collapse border border-slate-300">
                      <thead className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-300">
                          <tr><th className="p-3 border border-slate-300 w-12 text-center">Sr.</th><th className="p-3 border border-slate-300 whitespace-nowrap">Product Name</th><th className="p-3 border border-slate-300 whitespace-nowrap">Category</th><th className="p-3 border border-slate-300 text-center whitespace-nowrap">Qty Sold</th><th className="p-3 border border-slate-300 text-right whitespace-nowrap">Gross Revenue</th><th className="p-3 border border-slate-300 text-right whitespace-nowrap">Generated Profit</th></tr>
                      </thead>
                      <tbody className="text-xs font-bold text-slate-700">
                          {displayProducts.map((p: any, index: number) => (
                              <tr key={index} className="hover:bg-slate-50 transition">
                                  <td className="p-3 border border-slate-300 text-center text-slate-400">{index + 1}</td>
                                  <td className="p-3 border border-slate-300 uppercase whitespace-nowrap text-slate-900">{p.name}</td>
                                  <td className="p-3 border border-slate-300 whitespace-nowrap">{p.category}</td>
                                  <td className="p-3 border border-slate-300 text-center font-black text-slate-900">
                                      {p.qty.toLocaleString()} <span className="text-[9px] text-slate-500 font-bold uppercase ml-1">{p.unit || 'Bags'}</span>
                                  </td>
                                  <td className="p-3 border border-slate-300 text-right text-blue-700">{p.revenue.toLocaleString()}</td>
                                  <td className="p-3 border border-slate-300 text-right text-emerald-600 font-black">{(p.revenue - p.cost).toLocaleString()}</td>
                              </tr>
                          ))}
                          {displayProducts.length === 0 && (<tr><td colSpan={6} className="p-6 text-center text-slate-400">No products sold in this period.</td></tr>)}
                      </tbody>
                      </table>
                  )}

                  {view === 'product_categories' && (
                      <table className="w-full min-w-[800px] text-left border-collapse border border-slate-300">
                      <thead className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-300">
                          <tr><th className="p-3 border border-slate-300">Product Category & Details</th><th className="p-3 border border-slate-300 text-center whitespace-nowrap">Qty Sold</th><th className="p-3 border border-slate-300 text-right whitespace-nowrap">Revenue</th><th className="p-3 border border-slate-300 text-right whitespace-nowrap">Cost</th><th className="p-3 border border-slate-300 text-right font-black whitespace-nowrap">Profit</th></tr>
                      </thead>
                      {displayProductCategories?.map((cat: any) => (
                          <tbody key={cat.category} className="text-xs font-bold text-slate-700 border-b-4 border-slate-400">
                              <tr className="bg-slate-200 text-slate-900 transition">
                                  <td className="p-3 border border-slate-300 uppercase whitespace-nowrap tracking-widest text-sm font-black text-blue-900 border-l-4 border-l-blue-600">
                                      {cat.category} (Total)
                                  </td>
                                  <td className="p-3 border border-slate-300 text-center text-blue-900 font-black">{cat.totalQty.toLocaleString()}</td>
                                  <td className="p-3 border border-slate-300 text-right text-blue-900 font-black">{cat.totalRevenue.toLocaleString()}</td>
                                  <td className="p-3 border border-slate-300 text-right text-orange-700 font-black">{cat.totalCost.toLocaleString()}</td>
                                  <td className="p-3 border border-slate-300 text-right font-black text-emerald-700 text-lg">{cat.totalProfit.toLocaleString()}</td>
                              </tr>
                              {cat.products.map((p: any) => (
                                  <tr key={p.id} className="hover:bg-slate-50 transition bg-white">
                                      <td className="p-3 border border-slate-300 uppercase whitespace-nowrap text-slate-600 pl-6 border-l-4 border-l-transparent">
                                          ↳ <span className="ml-2 text-slate-900">{p.name}</span>
                                      </td>
                                      <td className="p-3 border border-slate-300 text-center text-slate-700 font-bold">
                                          {p.qty.toLocaleString()} <span className="text-[9px] text-slate-400 font-black uppercase ml-1">{p.unit || 'Bags'}</span>
                                      </td>
                                      <td className="p-3 border border-slate-300 text-right text-blue-600">{p.revenue.toLocaleString()}</td>
                                      <td className="p-3 border border-slate-300 text-right text-orange-500">{p.cost.toLocaleString()}</td>
                                      <td className="p-3 border border-slate-300 text-right font-black text-emerald-600">{p.profit.toLocaleString()}</td>
                                  </tr>
                              ))}
                          </tbody>
                      ))}
                      <tfoot className="bg-slate-900 text-white font-black text-xs">
                          <tr>
                              <td className="p-3 border border-slate-700 text-right uppercase tracking-widest">Grand Market Total:</td>
                              <td className="p-3 border border-slate-700 text-center">{displayProductCategories?.reduce((s:number,c:any)=>s+c.totalQty,0).toLocaleString()}</td>
                              <td className="p-3 border border-slate-700 text-right text-blue-300">{displayProductCategories?.reduce((s:number,c:any)=>s+c.totalRevenue,0).toLocaleString()}</td>
                              <td className="p-3 border border-slate-700 text-right text-orange-400">{displayProductCategories?.reduce((s:number,c:any)=>s+c.totalCost,0).toLocaleString()}</td>
                              <td className="p-3 border border-slate-700 text-right text-emerald-400 text-sm">{displayProductCategories?.reduce((s:number,c:any)=>s+c.totalProfit,0).toLocaleString()}</td>
                          </tr>
                      </tfoot>
                      </table>
                  )}

                  {view === 'inventory_list' && (
                      <table className="w-full min-w-[700px] text-left border-collapse border border-slate-300">
                      <thead className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-300">
                          <tr><th className="p-3 border border-slate-300 w-12 text-center">Sr.</th><th className="p-3 border border-slate-300">Product Name</th><th className="p-3 border border-slate-300">Category</th><th className="p-3 border border-slate-300 text-right">Cost Price</th><th className="p-3 border border-slate-300 text-right">Selling Price</th></tr>
                      </thead>
                      <tbody className="text-xs font-bold text-slate-700">
                          {displayInventory.map((p: any, index: number) => (
                              <tr key={p.id} className="hover:bg-slate-50 transition">
                                  <td className="p-3 border border-slate-300 text-center text-slate-400">{index + 1}</td>
                                  <td className="p-3 border border-slate-300 uppercase text-slate-900">
                                      {p.name} <span className="text-[9px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded ml-2">{p.unit || 'Bags'}</span>
                                  </td>
                                  <td className="p-3 border border-slate-300">{p.category}</td>
                                  <td className="p-3 border border-slate-300 text-right text-red-600">PKR {p.cost.toLocaleString()}</td>
                                  <td className="p-3 border border-slate-300 text-right text-emerald-600 font-black">PKR {p.price?.toLocaleString() || 0}</td>
                              </tr>
                          ))}
                      </tbody>
                      </table>
                  )}

                  {view === 'customer_list' && (
                      <table className="w-full min-w-[700px] text-left border-collapse border border-slate-300">
                      <thead className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-300">
                          <tr><th className="p-3 border border-slate-300 w-12 text-center">Sr.</th><th className="p-3 border border-slate-300">Customer Name</th><th className="p-3 border border-slate-300">Phone</th><th className="p-3 border border-slate-300">Address</th></tr>
                      </thead>
                      <tbody className="text-xs font-bold text-slate-700">
                          {displayAllCustomers.map((c: any, index: number) => (<tr key={c.id} className="hover:bg-slate-50 transition"><td className="p-3 border border-slate-300 text-center text-slate-400">{index + 1}</td><td className="p-3 border border-slate-300 uppercase text-slate-900 font-black">{c.name}</td><td className="p-3 border border-slate-300 text-blue-700">{c.phone || '---'}</td><td className="p-3 border border-slate-300 italic text-slate-500">{c.address || 'N/A'}</td></tr>))}
                      </tbody>
                      </table>
                  )}

              </div>
              <div className="mt-6 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest no-print">
                  End of Report. Click "Print Report" to export PDF or send to Printer.
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}