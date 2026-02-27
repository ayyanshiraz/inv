import { PrismaClient } from '@prisma/client'
import PrintPageButton from '@/components/PrintPageButton'

const prisma = new PrismaClient()

// Forces Next.js to skip static simulation during deployment
export const dynamic = 'force-dynamic'
export const revalidate = 0

// AGGRESSIVE USER CHECK
function getUserDisplayDetails(user: any) {
    const userStr = JSON.stringify(user || {}).toLowerCase();
    
    if (userStr.includes('admin3') || userStr.includes('subhani') || userStr.includes('mahmood subhani')) {
        return { name: 'MAHMOOD SUBHANI', phone: '0300-4216125' };
    }
    if (userStr.includes('admin2') || userStr.includes('abdullah') || userStr.includes('abdullah mahmood')) {
        return { name: 'ABDULLAH MAHMOOD', phone: '0306-4216125' };
    }
    return { name: 'SH NADIR', phone: '0321-4030049' };
}

export default async function BulkPrintPage({ searchParams }: { searchParams: Promise<any> | any }) {
  // BUILD-SAFE PARAMETER PARSING
  const params = (await searchParams) || {}
  let ids: string[] = []
  
  if (typeof params.ids === 'string') {
      ids = params.ids.split(',')
  } else if (Array.isArray(params.ids)) {
      ids = params.ids
  }

  // Safely stop if simulation has no IDs
  if (!ids || ids.length === 0) return <div className="p-10 text-center font-bold">No invoices selected for printing.</div>

  const { verifySession } = await import('@/lib/session')
  const session = await verifySession()
  
  if (!session || !session.userId) return <div className="p-10 text-center font-bold">Unauthorized.</div>

  const invoices = await prisma.invoice.findMany({
    where: { id: { in: ids }, userId: session.userId },
    include: { customer: true, user: true, items: { include: { product: true } } }
  })

  const safeInvoices = invoices || [];
  const customerIds = [...new Set(safeInvoices.map(i => i.customerId))];
  
  const allPrevInvoices = await prisma.invoice.findMany({
      where: { customerId: { in: customerIds }, userId: session.userId, isHold: false }
  });

  const safePrevInvoices = allPrevInvoices || [];

  const invoicesWithBalances = safeInvoices.map(invoice => {
      const prevInvoices = safePrevInvoices.filter(inv => 
          inv.customerId === invoice.customerId && new Date(inv.createdAt) < new Date(invoice.createdAt)
      );
      let prevBalance = invoice.customer?.openingBalance || 0;
      prevInvoices.forEach(inv => {
          if (inv.isReturn) prevBalance -= (inv.totalAmount || 0);
          else prevBalance += ((inv.totalAmount || 0) - (inv.paidAmount || 0));
      });
      return { ...invoice, prevBalance };
  });

  const MIN_ROWS = 3;

  return (
    <div className="bg-slate-200 min-h-screen pb-10 flex flex-col items-center">
        
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
          .urdu-text { font-family: 'Noto Nastaliq Urdu', serif; line-height: 1.5; }
          
          @media print {
              @page { size: A5 portrait; margin: 10mm; }
              body, html { background-color: white !important; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print, aside, nav, header, [class*="fixed"] { display: none !important; }
              .lg\\:ml-64, .md\\:ml-64 { margin-left: 0 !important; }
              
              .invoice-page { 
                  width: 100% !important; 
                  min-height: 195mm !important; 
                  margin: 0 !important; 
                  padding: 0mm !important; 
                  box-sizing: border-box !important;
                  border: none !important; 
                  background-color: white !important;
                  box-shadow: none !important;
                  overflow: hidden !important; 
                  page-break-after: always !important;
                  break-after: page !important;
              }
              .invoice-page:last-child {
                  page-break-after: auto !important;
                  break-after: auto !important;
              }
          }
          
          table { width: 100%; border-collapse: collapse; border: 1.5px solid black; }
          th, td { border: 1px solid black; padding: 4px 6px; color: black; }
          th { background-color: #e5e7eb; font-weight: 900; }
          .bold-border { border: 1.5px solid black !important; }
        `}</style>

        <div className="no-print bg-white w-full max-w-[148mm] p-4 flex justify-between items-center shadow mb-6 mt-6 rounded-xl border border-slate-200">
            <h1 className="font-black text-lg text-slate-800 uppercase">Bulk Print ({(invoicesWithBalances || []).length})</h1>
            <PrintPageButton title="Print All A5" />
        </div>

        <div className="w-full block">
            {(invoicesWithBalances || []).map((invoice, index) => {
                const safeItems = invoice.items || [];
                const subtotal = safeItems.reduce((sum: number, item: any) => sum + ((item.quantity || 0) * (item.price || 0)), 0);
                const netTotal = invoice.totalAmount || 0;
                const payment = invoice.paidAmount || 0;
                const closingBalance = (invoice.prevBalance || 0) + (invoice.isReturn ? -netTotal : netTotal) - payment;
                const emptyRowsCount = Math.max(0, MIN_ROWS - safeItems.length);
                const emptyRows = Array.from({ length: emptyRowsCount });
                
                const repDetails = getUserDisplayDetails(invoice.user);

                return (
                    <div key={invoice.id} className="invoice-page bg-white w-[148mm] min-h-[195mm] mx-auto p-[10mm] shadow-2xl relative text-black box-border flex flex-col mb-8 print:mb-0 print:p-0">
                        
                        <div className="flex justify-between items-center mb-4">
                            <div className="w-16 h-16 overflow-hidden flex items-center justify-center shrink-0 bg-white">
                                <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-contain mix-blend-multiply" />
                            </div>

                            <div className="text-center flex-1 px-2">
                                <p className="text-[10px] urdu-text font-bold mb-0">کاروبار حلال - سود حرام</p>
                                <h1 className="text-2xl font-black uppercase tracking-tighter text-black leading-none mt-1">Fahad Traders</h1>
                                <p className="font-bold text-[9px] mt-1 text-black uppercase tracking-widest">{repDetails.name} <span className="ml-1">{repDetails.phone}</span></p>
                            </div>

                            <div className="text-right text-[10px] font-bold text-black min-w-[100px]">
                                <p className="mb-0.5 text-xs font-black">Inv# {invoice.id.slice(-6).toUpperCase()}</p>
                                <p>Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
                                <p className="urdu-text mt-0 text-[8px]">تاریخ</p>
                            </div>
                        </div>

                        <div className="w-[65%] border-[1.5px] border-black mb-4 flex flex-col">
                            <div className="bg-gray-200 border-b-[1.5px] border-black px-2 py-0.5 font-black text-[10px] flex justify-between items-center">
                                <span>Bill To:</span>
                                <span className="urdu-text">خریدار:</span>
                            </div>
                            <div className="p-2 bg-white">
                                <h2 className="font-black text-sm uppercase text-black leading-tight">{invoice.customer?.name || 'Unknown'}</h2>
                                <p className="font-bold text-black mt-0.5 text-[10px]">
                                    {invoice.customer?.phone || '---'}
                                    <span className="text-[8px] font-mono text-gray-500 ml-2 bg-gray-100 px-1 py-[1px] rounded border border-gray-300">ID: {invoice.customer?.id || 'N/A'}</span>
                                </p>
                                <div className="flex gap-3 mt-1.5 text-[8px] font-bold text-gray-700">
                                    <p>Category: <span className="text-black uppercase">{invoice.customer?.category || 'N/A'}</span></p>
                                    <p>User / تیار کنندہ: <span className="text-black uppercase">{repDetails.name}</span></p>
                                </div>
                            </div>
                        </div>

                        <table className="bold-border mb-3 w-full">
                            <thead>
                                <tr>
                                    <th className="w-8 text-center border-b-[1.5px] border-black"><span className="block text-[11px]">Sr.</span><span className="urdu-text text-[9px] font-normal block mt-0.5">نمبر</span></th>
                                    <th className="text-left border-b-[1.5px] border-black"><span className="block text-[11px]">Description</span><span className="urdu-text text-[9px] font-normal block mt-0.5">تفصیل</span></th>
                                    <th className="w-12 text-center border-b-[1.5px] border-black"><span className="block text-[11px]">Qty</span><span className="urdu-text text-[9px] font-normal block mt-0.5">مقدار</span></th>
                                    <th className="w-12 text-center border-b-[1.5px] border-black"><span className="block text-[11px]">Unit</span><span className="urdu-text text-[9px] font-normal block mt-0.5">یونٹ</span></th>
                                    <th className="w-16 text-right border-b-[1.5px] border-black"><span className="block text-[11px]">Price</span><span className="urdu-text text-[9px] font-normal block mt-0.5">قیمت</span></th>
                                    <th className="w-20 text-right border-b-[1.5px] border-black"><span className="block text-[11px]">Amount</span><span className="urdu-text text-[9px] font-normal block mt-0.5">رقم</span></th>
                                </tr>
                            </thead>
                            <tbody className="font-bold text-black uppercase">
                                {safeItems.map((item: any, i: number) => (
                                    <tr key={i}>
                                        <td className="text-center align-middle py-2.5 text-sm">{i + 1}</td>
                                        <td className="text-left py-2.5 text-sm md:text-[15px] font-black leading-tight UrduFontReadability">
                                            {item.product?.name || 'Item'}
                                        </td>
                                        <td className="text-center align-middle py-2.5 text-base font-black">{item.quantity}</td>
                                        <td className="text-center align-middle py-2.5 text-[10px] font-bold text-gray-700">{item.product?.unit || 'Bags'}</td>
                                        <td className="text-right align-middle py-2.5 text-sm">{(item.price || 0).toLocaleString()}</td>
                                        <td className="text-right align-middle py-2.5 text-sm font-black">{((item.quantity || 0) * (item.price || 0)).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {(emptyRows || []).map((_, i) => (
                                    <tr key={`empty-${i}`}><td className="py-4 text-transparent">-</td><td></td><td></td><td></td><td></td><td></td></tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex justify-end mb-2 flex-grow">
                            <table className="w-[190px] bold-border h-fit">
                                <tbody className="text-[11px]">
                                    <tr><td className="bg-gray-200 font-black w-24 border-b border-black py-1.5 px-2 flex justify-between items-center"><span>Subtotal:</span><span className="urdu-text text-[9px] ml-1">میزان</span></td><td className="text-right font-black border-b border-black border-l-[1.5px] px-2">{subtotal.toLocaleString()}</td></tr>
                                    {invoice.discountAmount > 0 && (
                                        <tr><td className="bg-gray-200 font-black border-b border-black py-1.5 px-2 flex justify-between items-center"><span>Discount:</span><span className="urdu-text text-[9px] ml-1">رعایت</span></td><td className="text-right font-black border-b border-black border-l-[1.5px] px-2">- {(invoice.discountAmount || 0).toLocaleString()}</td></tr>
                                    )}
                                    <tr><td className="bg-gray-200 font-black border-b border-black py-1.5 px-2 flex justify-between items-center"><span>Prev. Bal:</span><span className="urdu-text text-[9px] ml-1">سابقہ بقایا</span></td><td className="text-right font-black border-b border-black border-l-[1.5px] px-2">{(invoice.prevBalance || 0).toLocaleString()}</td></tr>
                                    <tr><td className="bg-gray-200 font-black border-b border-black py-1.5 px-2 flex justify-between items-center"><span>Total:</span><span className="urdu-text text-[9px] ml-1">کل رقم</span></td><td className="text-right font-black border-b border-black border-l-[1.5px] px-2 text-sm">{ ((invoice.prevBalance || 0) + (invoice.isReturn ? -netTotal : netTotal)).toLocaleString() }</td></tr>
                                    <tr><td className="bg-gray-200 font-black border-b border-black py-1.5 px-2 flex justify-between items-center"><span>Payment:</span><span className="urdu-text text-[9px] ml-1">وصول شدہ</span></td><td className="text-right font-black border-b border-black border-l-[1.5px] px-2">{payment.toLocaleString()}</td></tr>
                                    <tr><td className="bg-gray-200 font-black py-1.5 px-2 flex justify-between items-center"><span>Balance:</span><span className="urdu-text text-[9px] ml-1">موجودہ بقایا</span></td><td className="text-right font-black border-l-[1.5px] px-2 text-sm">{closingBalance.toLocaleString()}</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="w-full flex flex-col items-center justify-center opacity-90 pt-4 mt-auto bg-white border-none">
                            <h3 className="urdu-text text-xl font-black text-black z-10 text-center mb-0 leading-none">سیلز مین سے لین دین کے لئے رابطہ کریں</h3>
                            <p className="font-black text-sm tracking-widest text-black z-10 mt-1">{repDetails.phone}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
  )
}