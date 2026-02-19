import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { TrendingUp, DollarSign, ArrowLeftRight } from 'lucide-react'
import { getLedgerReportData } from '@/actions/actions'
import PrintButton from '@/components/PrintButton'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function LedgerPage({ searchParams }: { searchParams: Promise<{ from?: string, to?: string, view?: string }> }) {
  const params = await searchParams
  
  const from = params.from ? new Date(params.from) : undefined
  const to = params.to ? new Date(params.to) : undefined
  const view = params.view || 'customers' 

  const data = await getLedgerReportData(from, to)

  const today = new Date().toISOString().split('T')[0]
  const curr = new Date()
  const firstDayOfWeek = new Date(curr.setDate(curr.getDate() - curr.getDay())).toISOString().split('T')[0]
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-slate-50 md:ml-64 p-4 pt-20 md:p-8 print:m-0 print:p-0 print:bg-white">
      <div className="max-w-5xl mx-auto">
        
        {/* PRINT STYLES */}
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

        {/* HEADER & FILTERS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 no-print">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Ledger</h1>
            <p className="text-slate-500 font-bold text-sm">Financial Reports</p>
          </div>
          
          <form className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
              <div className="flex gap-2 border-r border-slate-200 pr-3">
                  <Link href={`/ledger?from=${today}&to=${today}&view=${view}`} className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition">Today</Link>
                  <Link href={`/ledger?from=${firstDayOfWeek}&to=${today}&view=${view}`} className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition">Week</Link>
                  <Link href={`/ledger?from=${firstDayOfMonth}&to=${today}&view=${view}`} className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition">Month</Link>
              </div>

              <div className="flex items-center gap-2">
                  <input type="hidden" name="view" value={view} />
                  <input type="date" name="from" defaultValue={params.from} className="text-xs font-bold uppercase text-slate-900 outline-none cursor-pointer bg-slate-50 p-2 rounded border border-slate-200" />
                  <span className="text-slate-400 font-bold">-</span>
                  <input type="date" name="to" defaultValue={params.to} className="text-xs font-bold uppercase text-slate-900 outline-none cursor-pointer bg-slate-50 p-2 rounded border border-slate-200" />
              </div>
              
              <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-black transition text-xs font-bold uppercase tracking-widest">Filter</button>
              <Link href={`/ledger?view=${view}`} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition text-xs font-bold uppercase tracking-widest">Clear</Link>
          </form>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 no-print">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Period Revenue</p>
                  <h2 className="text-xl font-black text-slate-900">PKR {data.stats.revenue.toLocaleString()}</h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><DollarSign size={20} /></div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Period Profit ({data.stats.margin}%)</p>
                  <h2 className="text-xl font-black text-slate-900">PKR {data.stats.profit.toLocaleString()}</h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><TrendingUp size={20} /></div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center border-l-4 border-l-orange-500">
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Receivables</p>
                  <h2 className="text-xl font-black text-slate-900">PKR {data.stats.receivables.toLocaleString()}</h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center"><ArrowLeftRight size={20} /></div>
          </div>
        </div>

        {/* TABS & PRINT */}
        <div className="flex justify-between items-end border-b-2 border-slate-200 pb-3 mb-6 no-print">
            {/* NEW: Added Category Ledger Tab */}
            <div className="flex gap-6 overflow-x-auto">
                <Link href={`/ledger?from=${params.from || ''}&to=${params.to || ''}&view=customers`} 
                      className={`text-sm font-black uppercase tracking-widest pb-3 -mb-[14px] border-b-4 transition whitespace-nowrap ${view === 'customers' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>
                    Customer Ledger
                </Link>
                <Link href={`/ledger?from=${params.from || ''}&to=${params.to || ''}&view=categories`} 
                      className={`text-sm font-black uppercase tracking-widest pb-3 -mb-[14px] border-b-4 transition whitespace-nowrap ${view === 'categories' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>
                    Category Ledger
                </Link>
                <Link href={`/ledger?from=${params.from || ''}&to=${params.to || ''}&view=products`} 
                      className={`text-sm font-black uppercase tracking-widest pb-3 -mb-[14px] border-b-4 transition whitespace-nowrap ${view === 'products' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>
                    Product Sales
                </Link>
            </div>
            <PrintButton />
        </div>

        {/* =========================================
            THE A4 PRINT AREA
           ========================================= */}
        <div id="print-area" className="bg-white border border-slate-200 rounded-xl shadow-sm print:shadow-none print:border-none print:rounded-none">
          
          <div className="p-6 md:p-8">
              <div className="text-center mb-6 border-b-2 border-slate-800 pb-6">
                  <h1 className="text-2xl font-black uppercase text-black tracking-widest font-serif mb-1">Fahad Traders</h1>
                  <h2 className="text-base font-bold text-slate-800 mb-1">
                      {view === 'customers' ? 'Customer Ledger Summary' : view === 'categories' ? 'Category Ledger Summary' : 'Product Sales Summary'}
                  </h2>
                  <p className="text-xs font-bold text-slate-500 uppercase">
                      Period: {from ? from.toLocaleDateString() : 'Beginning of Time'} - {to ? to.toLocaleDateString() : 'Present'}
                  </p>
              </div>

              <div className="w-full overflow-x-auto">
                  
                  {/* VIEW 1: CUSTOMERS */}
                  {view === 'customers' && (
                      <table className="w-full min-w-[800px] text-left border-collapse border border-slate-300">
                      <thead className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-300">
                          <tr>
                          <th className="p-3 border border-slate-300 w-12 text-center">Sr.</th>
                          <th className="p-3 border border-slate-300">Customer</th>
                          <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Opening Bal</th>
                          <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Invoiced</th>
                          <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Returns</th>
                          <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Paid Amount</th>
                          <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Closing Bal</th>
                          </tr>
                      </thead>
                      <tbody className="text-xs font-bold text-slate-700">
                          {data.customerLedgers.map((c, index) => (
                          <tr key={c.id} className="hover:bg-slate-50 transition">
                              <td className="p-3 border border-slate-300 text-center text-slate-400">{index + 1}</td>
                              <td className="p-3 border border-slate-300 uppercase whitespace-nowrap text-slate-900">{c.name}</td>
                              <td className="p-3 border border-slate-300 text-right">{c.openingBalance.toLocaleString()}</td>
                              <td className="p-3 border border-slate-300 text-right text-blue-700">{c.invoicedAmount.toLocaleString()}</td>
                              <td className="p-3 border border-slate-300 text-right text-red-600">{c.returnAmount.toLocaleString()}</td>
                              <td className="p-3 border border-slate-300 text-right text-emerald-600">{c.paidAmount.toLocaleString()}</td>
                              <td className="p-3 border border-slate-300 text-right font-black text-slate-900">{c.closingBalance.toLocaleString()}</td>
                          </tr>
                          ))}
                          <tr className="bg-slate-100 border-t-2 border-slate-400 font-black text-slate-900 text-xs">
                              <td colSpan={2} className="p-3 border border-slate-300 text-right uppercase">Total Market:</td>
                              <td className="p-3 border border-slate-300 text-right">{data.customerLedgers.reduce((s,c)=>s+c.openingBalance,0).toLocaleString()}</td>
                              <td className="p-3 border border-slate-300 text-right text-blue-700">{data.customerLedgers.reduce((s,c)=>s+c.invoicedAmount,0).toLocaleString()}</td>
                              <td className="p-3 border border-slate-300 text-right text-red-600">{data.customerLedgers.reduce((s,c)=>s+c.returnAmount,0).toLocaleString()}</td>
                              <td className="p-3 border border-slate-300 text-right text-emerald-600">{data.customerLedgers.reduce((s,c)=>s+c.paidAmount,0).toLocaleString()}</td>
                              <td className="p-3 border border-slate-300 text-right text-sm">{data.stats.receivables.toLocaleString()}</td>
                          </tr>
                      </tbody>
                      </table>
                  )}

                  {/* VIEW 2: CATEGORIES (NEW!) */}
                  {view === 'categories' && (
                      <table className="w-full min-w-[800px] text-left border-collapse border border-slate-300">
                      <thead className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-300">
                          <tr>
                          <th className="p-3 border border-slate-300 w-12 text-center">Sr.</th>
                          <th className="p-3 border border-slate-300">Customer Category</th>
                          <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Opening Bal</th>
                          <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Invoiced</th>
                          <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Returns</th>
                          <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Paid Amount</th>
                          <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Closing Bal</th>
                          </tr>
                      </thead>
                      <tbody className="text-xs font-bold text-slate-700">
                          {data.categoryLedgers.map((cat, index) => (
                          <tr key={index} className="hover:bg-slate-50 transition">
                              <td className="p-3 border border-slate-300 text-center text-slate-400">{index + 1}</td>
                              <td className="p-3 border border-slate-300 uppercase whitespace-nowrap text-slate-900">{cat.category}</td>
                              <td className="p-3 border border-slate-300 text-right">{cat.openingBalance.toLocaleString()}</td>
                              <td className="p-3 border border-slate-300 text-right text-blue-700">{cat.invoicedAmount.toLocaleString()}</td>
                              <td className="p-3 border border-slate-300 text-right text-red-600">{cat.returnAmount.toLocaleString()}</td>
                              <td className="p-3 border border-slate-300 text-right text-emerald-600">{cat.paidAmount.toLocaleString()}</td>
                              <td className="p-3 border border-slate-300 text-right font-black text-slate-900">{cat.closingBalance.toLocaleString()}</td>
                          </tr>
                          ))}
                          <tr className="bg-slate-100 border-t-2 border-slate-400 font-black text-slate-900 text-xs">
                              <td colSpan={2} className="p-3 border border-slate-300 text-right uppercase">Total Market:</td>
                              <td className="p-3 border border-slate-300 text-right">{data.categoryLedgers.reduce((s,c)=>s+c.openingBalance,0).toLocaleString()}</td>
                              <td className="p-3 border border-slate-300 text-right text-blue-700">{data.categoryLedgers.reduce((s,c)=>s+c.invoicedAmount,0).toLocaleString()}</td>
                              <td className="p-3 border border-slate-300 text-right text-red-600">{data.categoryLedgers.reduce((s,c)=>s+c.returnAmount,0).toLocaleString()}</td>
                              <td className="p-3 border border-slate-300 text-right text-emerald-600">{data.categoryLedgers.reduce((s,c)=>s+c.paidAmount,0).toLocaleString()}</td>
                              <td className="p-3 border border-slate-300 text-right text-sm">{data.stats.receivables.toLocaleString()}</td>
                          </tr>
                      </tbody>
                      </table>
                  )}

                  {/* VIEW 3: PRODUCTS */}
                  {view === 'products' && (
                      <table className="w-full min-w-[700px] text-left border-collapse border border-slate-300">
                      <thead className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-300">
                          <tr>
                          <th className="p-3 border border-slate-300 w-12 text-center">Sr.</th>
                          <th className="p-3 border border-slate-300 whitespace-nowrap">Product Name</th>
                          <th className="p-3 border border-slate-300 whitespace-nowrap">Category</th>
                          <th className="p-3 border border-slate-300 text-center whitespace-nowrap">Qty Sold</th>
                          <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Gross Revenue</th>
                          <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Generated Profit</th>
                          </tr>
                      </thead>
                      <tbody className="text-xs font-bold text-slate-700">
                          {data.productSales.map((p, index) => (
                          <tr key={index} className="hover:bg-slate-50 transition">
                              <td className="p-3 border border-slate-300 text-center text-slate-400">{index + 1}</td>
                              <td className="p-3 border border-slate-300 uppercase whitespace-nowrap text-slate-900">{p.name}</td>
                              <td className="p-3 border border-slate-300 whitespace-nowrap">{p.category}</td>
                              <td className="p-3 border border-slate-300 text-center font-black text-slate-900">{p.qty}</td>
                              <td className="p-3 border border-slate-300 text-right text-blue-700">{p.revenue.toLocaleString()}</td>
                              <td className="p-3 border border-slate-300 text-right text-emerald-600 font-black">{(p.revenue - p.cost).toLocaleString()}</td>
                          </tr>
                          ))}
                          {data.productSales.length === 0 && (
                              <tr><td colSpan={6} className="p-6 text-center text-slate-400">No products sold in this period.</td></tr>
                          )}
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