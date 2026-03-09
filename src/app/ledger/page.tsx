import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { TrendingUp, DollarSign, ArrowLeftRight, Search, FileText, CornerDownLeft, HandCoins, Users, Tags, Package, ListTree, UsersRound, Boxes } from 'lucide-react'
import { getLedgerReportData } from '@/actions/actions'
import PrintButton from '@/components/PrintButton'
import CustomerHistorySearch from '@/components/CustomerHistorySearch'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

const formatPKTDate = (dateObj: Date | string) => {
    if (!dateObj) return '---';
    return new Date(dateObj).toLocaleDateString('en-GB', { timeZone: 'Asia/Karachi', day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default async function LedgerPage({ searchParams }: { searchParams: Promise<{ from?: string, to?: string, view?: string, search?: string, category?: string, customerId?: string }> }) {
  const params = await searchParams
  
  const from = params.from ? new Date(params.from) : undefined
  const to = params.to ? new Date(params.to) : undefined
  const view = params.view || 'customers' 
  const searchQuery = params.search?.toLowerCase() || ''
  const catQuery = params.category || ''
  const histCustomerId = params.customerId || ''

  const data = await getLedgerReportData(from, to)

  const pktNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
  const today = `${pktNow.getFullYear()}-${String(pktNow.getMonth() + 1).padStart(2, '0')}-${String(pktNow.getDate()).padStart(2, '0')}`;
  
  const curr = new Date(pktNow);
  const firstDayOfWeek = new Date(curr.setDate(curr.getDate() - curr.getDay())).toISOString().split('T')[0];
  const firstDayOfMonth = new Date(pktNow.getFullYear(), pktNow.getMonth(), 1).toISOString().split('T')[0];

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

  let historyCustomer = null;
  let historyRows: any[] = [];
  let periodOpeningBal = 0;
  let periodDebit = 0;
  let periodCredit = 0;
  
  if (view === 'customer_history' && histCustomerId) {
      historyCustomer = data.allCustomers.find((c:any) => c.id === histCustomerId);
      if (historyCustomer) {
          const cInvoices = await prisma.invoice.findMany({
              where: { customerId: histCustomerId, isHold: false },
              orderBy: { createdAt: 'asc' }
          });
          
          let runningBal = Number(historyCustomer.openingBalance || 0);
          periodOpeningBal = runningBal;

          const fromDateObj = params.from ? new Date(params.from) : null;
          if (fromDateObj) fromDateObj.setHours(0,0,0,0);
          
          const toDateObj = params.to ? new Date(params.to) : null;
          if (toDateObj) toDateObj.setHours(23,59,59,999);
          
          cInvoices.forEach(inv => {
              let debit = 0; let credit = 0; let desc = '';
              if (inv.isReturn) { credit = inv.totalAmount; desc = 'Return / Credit Note'; } 
              else if (inv.totalAmount === 0 && (inv.paidAmount > 0 || inv.discountAmount > 0)) { 
                  // Updates Description to show if discount was given
                  credit = inv.paidAmount + (inv.discountAmount || 0); 
                  desc = `Cash Received (Voucher) ${inv.discountAmount > 0 ? ` + Disc` : ''}`; 
              } 
              else { debit = inv.totalAmount; credit = inv.paidAmount; desc = `Sale Invoice`; }

              const invDate = new Date(inv.createdAt);

              if (fromDateObj && invDate < fromDateObj) {
                  periodOpeningBal = periodOpeningBal + debit - credit;
                  runningBal = periodOpeningBal;
              } 
              else if (toDateObj && invDate > toDateObj) { } 
              else {
                  periodDebit += debit;
                  periodCredit += credit;
                  runningBal = runningBal + debit - credit;
                  historyRows.push({ id: inv.id, date: inv.createdAt, desc, debit, credit, runningBal })
              }
          })
      }
  }

  const navItems = [
      { id: 'customers', label: 'Customer Ledger', icon: Users },
      { id: 'customer_history', label: 'Customer History', icon: FileText },
      { id: 'categories', label: 'Customer Categories', icon: Tags },
      { id: 'products', label: 'Product Sales', icon: Package },
      { id: 'product_categories', label: 'Product Categories', icon: ListTree },
      { id: 'inventory_list', label: 'T. Product List', icon: Boxes },
      { id: 'customer_list', label: 'T. Customer List', icon: UsersRound },
  ]

  return (
    <div className="min-h-screen bg-slate-50 lg:ml-64 p-4 pt-20 lg:p-8 print:m-0 print:p-0 print:bg-white">
      <div className="max-w-[1400px] mx-auto">
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

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-6 gap-4 no-print">
          <div><h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Ledger Reports</h1><p className="text-slate-500 font-bold text-sm">Financial Summaries & Analytics</p></div>
          <form className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-200 w-full xl:w-auto">
              <input type="hidden" name="view" value={view} />
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-full lg:w-auto">
                  <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 shadow-inner w-full sm:w-auto justify-between">
                      <Link href={`/ledger?view=${view}&from=${today}&to=${today}`} className="px-3 py-1.5 text-[10px] font-black uppercase rounded hover:bg-white hover:shadow-sm transition text-slate-600">Daily</Link>
                      <Link href={`/ledger?view=${view}&from=${firstDayOfWeek}&to=${today}`} className="px-3 py-1.5 text-[10px] font-black uppercase rounded hover:bg-white hover:shadow-sm transition text-slate-600 border-l border-r border-slate-200">Weekly</Link>
                      <Link href={`/ledger?view=${view}&from=${firstDayOfMonth}&to=${today}`} className="px-3 py-1.5 text-[10px] font-black uppercase rounded hover:bg-white hover:shadow-sm transition text-slate-600">Monthly</Link>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input type="date" name="from" defaultValue={params.from} className="text-xs font-bold uppercase text-slate-900 outline-none cursor-pointer bg-slate-50 p-2 rounded border border-slate-200 w-full sm:w-auto" />
                      <span className="text-slate-400 font-bold">-</span>
                      <input type="date" name="to" defaultValue={params.to} className="text-xs font-bold uppercase text-slate-900 outline-none cursor-pointer bg-slate-50 p-2 rounded border border-slate-200 w-full sm:w-auto" />
                  </div>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-40">
                      <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" name="search" defaultValue={searchQuery} placeholder="Search..." className="pl-7 p-2 w-full text-xs font-bold text-slate-900 outline-none bg-slate-50 rounded border border-slate-200" />
                  </div>
                  {(view === 'customers' || view === 'customer_list' || view === 'categories' || view === 'product_categories') && (
                      <select name="category" defaultValue={catQuery} className="p-2 flex-1 sm:w-32 text-xs font-bold text-slate-900 outline-none bg-slate-50 rounded border border-slate-200">
                          <option value="">All Cats</option>
                          {data.categoryLedgers.map((c: any) => <option key={c.category} value={c.category}>{c.category}</option>)}
                      </select>
                  )}
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <button type="submit" className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-black transition text-xs font-bold uppercase tracking-widest">Filter</button>
                      <Link href={`/ledger?view=${view}`} className="flex-1 text-center bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition text-xs font-bold uppercase tracking-widest">Clear</Link>
                  </div>
              </div>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 no-print">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center"><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Period Revenue</p><h2 className="text-xl font-black text-slate-900">PKR {data.stats.revenue.toLocaleString()}</h2></div><div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><DollarSign size={20} /></div></div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center"><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Period Profit ({data.stats.margin}%)</p><h2 className="text-xl font-black text-slate-900">PKR {data.stats.profit.toLocaleString()}</h2></div><div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><TrendingUp size={20} /></div></div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center border-l-4 border-l-orange-500"><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Receivables</p><h2 className="text-xl font-black text-slate-900">PKR {data.stats.receivables.toLocaleString()}</h2></div><div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center"><ArrowLeftRight size={20} /></div></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-64 shrink-0 no-print">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sticky top-24">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 mb-3">Report Menus</h3>
                    <div className="flex flex-col gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon; const isActive = view === item.id;
                            return (
                                <Link key={item.id} href={`/ledger?from=${params.from || ''}&to=${params.to || ''}&view=${item.id}`} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold transition-all ${isActive ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />{item.label}</Link>
                            )
                        })}
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 px-2"><PrintButton /></div>
                </div>
            </div>

            <div id="print-area" className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm print:shadow-none print:border-none print:rounded-none min-h-[600px] overflow-hidden relative">
                <div className="p-6 md:p-8">
                    <div className="text-center mb-6 border-b-2 border-slate-800 pb-6">
                        <h1 className="text-2xl font-black uppercase text-black tracking-widest font-serif mb-1">Fahad Traders</h1>
                        <h2 className="text-base font-bold text-slate-800 mb-1">
                            {view === 'customers' ? (catQuery ? `${catQuery} Ledger Summary` : 'Customer Ledger Summary') : 
                             view === 'customer_history' ? (historyCustomer ? `Account Statement: ${historyCustomer.id} - ${historyCustomer.name}` : 'Customer Account History') : 
                             view === 'categories' ? (catQuery ? `${catQuery} Detailed Ledger` : 'Category Ledger Summary') : 
                             view === 'product_categories' ? (catQuery ? `${catQuery} Product Categories` : 'Product Category Summary') : 
                             view === 'inventory_list' ? 'Active Product List' : 
                             view === 'customer_list' ? 'Active Customer List' : 
                             'Product Sales Summary'}
                        </h2>
                        <p className="text-xs font-bold text-slate-500 uppercase">Period: {from ? formatPKTDate(from) : 'Beginning of Time'} - {to ? formatPKTDate(to) : 'Present'}</p>
                    </div>

                    <div className="w-full overflow-x-auto relative">
                        
                        {view === 'customer_history' && (
                            <div className="space-y-6">
                                <div className="no-print relative z-50 mb-8 max-w-xl mx-auto">
                                    <CustomerHistorySearch customers={data.allCustomers} currentFrom={params.from} currentTo={params.to} />
                                </div>
                                {histCustomerId && historyCustomer ? (
                                    <>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm"><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Period Opening</p><p className="text-lg font-black text-slate-900 leading-none">PKR {periodOpeningBal.toLocaleString()}</p></div>
                                            <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-sm"><p className="text-[9px] font-black uppercase text-blue-500 tracking-widest mb-1">Period Debit (+)</p><p className="text-lg font-black text-blue-700 leading-none">{periodDebit.toLocaleString()}</p></div>
                                            <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-sm"><p className="text-[9px] font-black uppercase text-emerald-500 tracking-widest mb-1">Period Credit (-)</p><p className="text-lg font-black text-emerald-600 leading-none">{periodCredit.toLocaleString()}</p></div>
                                            <div className="p-3 bg-slate-900 rounded-lg shadow-sm text-white flex flex-col justify-center"><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Closing Balance</p><p className="text-xl font-black leading-none">PKR {(periodOpeningBal + periodDebit - periodCredit).toLocaleString()}</p></div>
                                        </div>
                                        <table className="w-full min-w-[800px] text-left border-collapse border border-slate-300 relative z-0">
                                            <thead className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-300">
                                                <tr><th className="p-3 border border-slate-300">Date</th><th className="p-3 border border-slate-300">Description</th><th className="p-3 border border-slate-300 text-right">Debit (+)</th><th className="p-3 border border-slate-300 text-right">Credit (-)</th><th className="p-3 border border-slate-300 text-right font-black text-blue-900">Running Bal</th></tr>
                                            </thead>
                                            <tbody className="text-xs font-bold text-slate-700">
                                                <tr className="bg-slate-100 border-b-2 border-slate-300 print:bg-gray-200"><td className="p-3 border border-slate-300 text-slate-400">---</td><td className="p-3 border border-slate-300 uppercase text-slate-900 font-black tracking-widest">Opening Balance {from ? '(Period Start)' : ''}</td><td className="p-3 border border-slate-300 text-right text-slate-400">---</td><td className="p-3 border border-slate-300 text-right text-slate-400">---</td><td className="p-3 border border-slate-300 text-right font-black text-base text-slate-900 print:text-black">{periodOpeningBal.toLocaleString()}</td></tr>
                                                {historyRows.map((r: any) => (
                                                    <tr key={r.id} className="hover:bg-slate-50 transition">
                                                        <td className="p-3 border border-slate-300 whitespace-nowrap">{formatPKTDate(r.date)}</td>
                                                        <td className="p-3 border border-slate-300 uppercase flex items-center gap-2">{r.desc.includes('Sale') && <FileText size={14} className="text-blue-500" />}{r.desc.includes('Return') && <CornerDownLeft size={14} className="text-red-500" />}{r.desc.includes('Cash') && <HandCoins size={14} className="text-emerald-500" />}<Link href={`/print/${r.id}`} className="hover:text-blue-600 transition" target="_blank">{r.desc}</Link></td>
                                                        <td className="p-3 border border-slate-300 text-right text-blue-700">{r.debit > 0 ? r.debit.toLocaleString() : '-'}</td>
                                                        <td className="p-3 border border-slate-300 text-right text-emerald-600">{r.credit > 0 ? r.credit.toLocaleString() : '-'}</td>
                                                        <td className="p-3 border border-slate-300 text-right font-black text-slate-900 text-sm print:text-black">{r.runningBal.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                                {historyRows.length === 0 && (<tr><td colSpan={5} className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest">No transactions recorded in this period.</td></tr>)}
                                            </tbody>
                                        </table>
                                    </>
                                ) : (<div className="text-center py-10 opacity-30 no-print"><Search size={64} className="mx-auto mb-4" /><p className="font-black uppercase tracking-widest text-xl">Awaiting Selection</p></div>)}
                            </div>
                        )}

                        {view === 'customers' && (
                            <table className="w-full min-w-[800px] text-left border-collapse border border-slate-300">
                            <thead className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-300">
                                <tr><th className="p-3 border border-slate-300 w-12 text-center">Sr.</th><th className="p-3 border border-slate-300">Customer</th><th className="p-3 border border-slate-300 text-right whitespace-nowrap">Opening Bal</th><th className="p-3 border border-slate-300 text-right whitespace-nowrap">Invoiced</th><th className="p-3 border border-slate-300 text-right whitespace-nowrap">Paid Amount</th><th className="p-3 border border-slate-300 text-right whitespace-nowrap">Closing Bal</th></tr>
                            </thead>
                            <tbody className="text-xs font-bold text-slate-700">
                                {displayCustomers.map((c: any, index: number) => (
                                    <tr key={c.id} className="hover:bg-slate-50 transition">
                                        <td className="p-3 border border-slate-300 text-center text-slate-400">{index + 1}</td>
                                        <td className="p-3 border border-slate-300 uppercase whitespace-nowrap text-slate-900">{c.id} - {c.name}</td>
                                        <td className="p-3 border border-slate-300 text-right">{c.openingBalance.toLocaleString()}</td>
                                        <td className="p-3 border border-slate-300 text-right text-blue-700">{c.invoicedAmount.toLocaleString()}</td>
                                        <td className="p-3 border border-slate-300 text-right text-emerald-700">{c.paidAmount.toLocaleString()}</td>
                                        <td className="p-3 border border-slate-300 text-right font-black text-slate-900">{c.closingBalance.toLocaleString()}</td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-100 border-t-2 border-slate-400 font-black text-slate-900 text-xs"><td colSpan={2} className="p-3 border border-slate-300 text-right uppercase">Filtered Total:</td><td className="p-3 border border-slate-300 text-right">{displayCustomers.reduce((s: number, c: any) => s + c.openingBalance, 0).toLocaleString()}</td><td className="p-3 border border-slate-300 text-right text-blue-700">{displayCustomers.reduce((s: number, c: any) => s + c.invoicedAmount, 0).toLocaleString()}</td><td className="p-3 border border-slate-300 text-right text-emerald-600">{displayCustomers.reduce((s: number, c: any) => s + c.paidAmount, 0).toLocaleString()}</td><td className="p-3 border border-slate-300 text-right text-sm">{displayCustomers.reduce((s: number, c: any) => s + c.closingBalance, 0).toLocaleString()}</td></tr>
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
                                  <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Paid Amount</th>
                                  <th className="p-3 border border-slate-300 text-right whitespace-nowrap">Closing Bal</th>
                                </tr>
                            </thead>
                            {displayCategories.map((cat: any) => (
                                <tbody key={cat.category} className="text-xs font-bold text-slate-700 border-b-4 border-slate-400">
                                    <tr className="bg-slate-200 text-slate-900 transition"><td className="p-3 border border-slate-300 uppercase whitespace-nowrap tracking-widest text-sm font-black text-blue-900 border-l-4 border-l-blue-600">{cat.category} (Total)</td><td className="p-3 border border-slate-300 text-right">{cat.openingBalance.toLocaleString()}</td><td className="p-3 border border-slate-300 text-right text-blue-800">{cat.invoicedAmount.toLocaleString()}</td><td className="p-3 border border-slate-300 text-right text-emerald-700">{cat.paidAmount.toLocaleString()}</td><td className="p-3 border border-slate-300 text-right font-black text-lg">{cat.closingBalance.toLocaleString()}</td></tr>
                                    {displayCustomers.filter((c: any) => c.category === cat.category).map((c: any) => (
                                        <tr key={c.id} className="hover:bg-slate-50 transition bg-white">
                                            <td className="p-3 border border-slate-300 uppercase whitespace-nowrap text-slate-600 pl-6 border-l-4 border-l-transparent">↳ <span className="ml-2 text-slate-900">{c.id} - {c.name}</span></td>
                                            <td className="p-3 border border-slate-300 text-right">{c.openingBalance.toLocaleString()}</td>
                                            <td className="p-3 border border-slate-300 text-right text-blue-600">{c.invoicedAmount.toLocaleString()}</td>
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
                                        <td className="p-3 border border-slate-300 uppercase whitespace-nowrap text-slate-900">{p.id} - {p.name}</td>
                                        <td className="p-3 border border-slate-300 whitespace-nowrap">{p.category}</td>
                                        <td className="p-3 border border-slate-300 text-center font-black text-slate-900">{p.qty.toLocaleString()} <span className="text-[9px] text-slate-500 font-bold uppercase ml-1">{p.unit || 'Bags'}</span></td>
                                        <td className="p-3 border border-slate-300 text-right text-blue-700">{p.revenue.toLocaleString()}</td>
                                        <td className="p-3 border border-slate-300 text-right text-emerald-600 font-black">{(p.revenue - p.cost).toLocaleString()}</td>
                                    </tr>
                                ))}
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
                                    <tr className="bg-slate-200 text-slate-900 transition"><td className="p-3 border border-slate-300 uppercase whitespace-nowrap tracking-widest text-sm font-black text-blue-900 border-l-4 border-l-blue-600">{cat.category} (Total)</td><td className="p-3 border border-slate-300 text-center text-blue-900 font-black">{cat.totalQty.toLocaleString()}</td><td className="p-3 border border-slate-300 text-right text-blue-900 font-black">{cat.totalRevenue.toLocaleString()}</td><td className="p-3 border border-slate-300 text-right text-orange-700 font-black">{cat.totalCost.toLocaleString()}</td><td className="p-3 border border-slate-300 text-right font-black text-emerald-700 text-lg">{cat.totalProfit.toLocaleString()}</td></tr>
                                    {cat.products.map((p: any) => (
                                        <tr key={p.id} className="hover:bg-slate-50 transition bg-white">
                                            <td className="p-3 border border-slate-300 uppercase whitespace-nowrap text-slate-600 pl-6 border-l-4 border-l-transparent">↳ <span className="ml-2 text-slate-900">{p.id} - {p.name}</span></td>
                                            <td className="p-3 border border-slate-300 text-center text-slate-700 font-bold">{p.qty.toLocaleString()} <span className="text-[9px] text-slate-400 font-black uppercase ml-1">{p.unit || 'Bags'}</span></td>
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
                                        <td className="p-3 border border-slate-300 uppercase text-slate-900">{p.id} - {p.name} <span className="text-[9px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded ml-2">{p.unit || 'Bags'}</span></td>
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
                                <tr><th className="p-3 border border-slate-300 w-12 text-center">Sr.</th><th className="p-3 border border-slate-300">Customer ID & Name</th><th className="p-3 border border-slate-300">Phone</th><th className="p-3 border border-slate-300">Address</th></tr>
                            </thead>
                            <tbody className="text-xs font-bold text-slate-700">
                                {displayAllCustomers.map((c: any, index: number) => (
                                <tr key={c.id} className="hover:bg-slate-50 transition">
                                    <td className="p-3 border border-slate-300 text-center text-slate-400">{index + 1}</td>
                                    <td className="p-3 border border-slate-300 uppercase text-slate-900 font-black">{c.id} - {c.name}</td>
                                    <td className="p-3 border border-slate-300 text-blue-700">{c.phone || '---'}</td>
                                    <td className="p-3 border border-slate-300 italic text-slate-500">{c.address || 'N/A'}</td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        )}

                    </div>
                    <div className="mt-8 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest no-print border-t border-slate-100 pt-4">
                        End of Report. Click "Print Report" on the left menu to export PDF.
                    </div>
                </div>
            </div>
            
        </div>
      </div>
    </div>
  )
}