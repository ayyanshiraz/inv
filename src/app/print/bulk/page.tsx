import { PrismaClient } from '@prisma/client'
import PrintPageButton from '@/components/PrintPageButton'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'
export const revalidate = 0

function getUserDisplayDetails(user: any) {
    const userStr = JSON.stringify(user || {}).toLowerCase();
    if (userStr.includes('admin3') || userStr.includes('subhani') || userStr.includes('mahmood subhani')) return { name: 'MAHMOOD SUBHANI', phone: '0300-4216125' };
    if (userStr.includes('admin2') || userStr.includes('abdullah') || userStr.includes('abdullah mahmood')) return { name: 'ABDULLAH MAHMOOD', phone: '0306-4216125' };
    return { name: 'SH NADIR', phone: '0321-4030049' };
}

export default async function BulkPrintPage({ searchParams }: { searchParams: Promise<any> | any }) {
  const params = (await searchParams) || {}
  let ids: string[] = []
  if (typeof params.ids === 'string') ids = params.ids.split(',')
  else if (Array.isArray(params.ids)) ids = params.ids

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
  const allPrevInvoices = await prisma.invoice.findMany({ where: { customerId: { in: customerIds }, userId: session.userId, isHold: false } });

  const invoicesWithBalances = safeInvoices.map(invoice => {
      const prevInvoices = allPrevInvoices.filter(inv => inv.customerId === invoice.customerId && new Date(inv.createdAt) < new Date(invoice.createdAt));
      let prevBalance = invoice.customer?.openingBalance || 0;
      prevInvoices.forEach(inv => { if (inv.isReturn) prevBalance -= (inv.totalAmount || 0); else prevBalance += ((inv.totalAmount || 0) - (inv.paidAmount || 0)); });
      return { ...invoice, prevBalance };
  });

  const MIN_ROWS = 3;

  return (
    <div className="bg-slate-200 min-h-screen py-10 block print:min-h-0 print:p-0 print:m-0 print:bg-white">
        
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
          .urdu-text { font-family: 'Noto Nastaliq Urdu', serif; line-height: 1.8; font-weight: 700 !important; }
          
          @media print {
              @page { size: A5 portrait; margin: 0 !important; }
              body, html { margin: 0 !important; padding: 0 !important; background: white !important; height: auto !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; display: block !important; }
              .no-print, aside, nav, header, [class*="fixed"] { display: none !important; }
              
              .invoice-page { 
                  width: 148mm !important; 
                  height: 188mm !important; 
                  max-height: 188mm !important;
                  margin: 0 auto !important; 
                  padding: 6mm !important; 
                  box-sizing: border-box !important;
                  border: none !important; 
                  page-break-after: always !important;
                  page-break-inside: avoid !important;
                  display: block !important;
                  position: relative !important;
                  overflow: hidden !important; 
              }
              .invoice-page:last-child, .invoice-page:last-of-type {
                  page-break-after: avoid !important;
                  break-after: avoid !important;
              }
          }
          
          table { width: 100%; border-collapse: collapse; border: 1.5px solid black; }
          th, td { border: 1px solid black; padding: 4px 6px; color: black; }
          th { background-color: #e5e7eb; font-weight: 900; }
          .bold-border { border: 1.5px solid black !important; }
        `}</style>

        <div className="no-print bg-white w-full max-w-[148mm] p-4 flex justify-between items-center shadow mb-6 rounded-xl border border-slate-200 mx-auto">
            <h1 className="font-black text-sm text-slate-800 uppercase">Bulk Print ({(invoicesWithBalances || []).length})</h1>
            <PrintPageButton title="Print All A5" />
        </div>

        <div className="w-full block print:w-full print:max-w-none print:m-0 print:p-0">
            {(invoicesWithBalances || []).map((invoice, index) => {
                const safeItems = invoice.items || [];
                const subtotal = safeItems.reduce((sum: number, item: any) => sum + ((item.quantity || 0) * (item.price || 0)), 0);
                const netTotal = invoice.totalAmount || 0;
                const payment = invoice.paidAmount || 0;
                const closingBalance = (invoice.prevBalance || 0) + (invoice.isReturn ? -netTotal : netTotal) - payment;
                const emptyRows = Array.from({ length: Math.max(0, MIN_ROWS - safeItems.length) });
                const repDetails = getUserDisplayDetails(invoice.user);
                
                const displayDate = new Date(invoice.createdAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Karachi', day: '2-digit', month: '2-digit', year: 'numeric' });
                const displayId = /^\d+$/.test(invoice.id) ? invoice.id : invoice.id.slice(-6).toUpperCase();

                return (
                    <div key={invoice.id} className="invoice-page bg-white w-[148mm] h-[188mm] mx-auto p-[6mm] shadow-2xl relative text-black box-border block mb-8 print:mb-0 print:shadow-none">
                        
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <div className="w-16 h-16 flex items-center justify-center shrink-0 bg-white">
                                {/* UNFORMATTED LOGO.PNG */}
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="text-center flex-1 px-2">
                                <p className="text-[12px] urdu-text mb-0">کاروبار حلال - سود حرام</p>
                                <h1 className="text-2xl font-black uppercase tracking-tighter text-black leading-none mt-1">Fahad Traders</h1>
                                <p className="font-bold text-[9px] mt-1 text-black uppercase tracking-widest">{repDetails.name} <span className="ml-1">{repDetails.phone}</span></p>
                            </div>
                            <div className="text-right text-[10px] font-bold text-black min-w-[100px]">
                                <p className="mb-0.5 text-xs font-black">Inv# {displayId}</p>
                                <p>Date: {displayDate}</p>
                                <p className="urdu-text mt-0 text-[11px]">تاریخ</p>
                            </div>
                        </div>

                        <div className="w-[65%] border-[1.5px] border-black mb-4 flex flex-col shrink-0">
                            <div className="bg-gray-200 border-b-[1.5px] border-black px-2 py-0.5 font-black text-[10px] flex justify-between items-center">
                                <span>Bill To:</span><span className="urdu-text text-[13px]">خریدار:</span>
                            </div>
                            <div className="p-2 bg-white flex flex-col justify-center">
                                <h2 className="font-black text-[17px] uppercase text-black leading-tight">{invoice.customer?.name || 'Unknown'}</h2>
                                <p className="font-bold text-black mt-0.5 text-[13px]">{invoice.customer?.phone || '---'}<span className="text-[8px] font-mono text-gray-500 ml-2 bg-gray-100 px-1 py-[1px] rounded border border-gray-300">ID: {invoice.customer?.id || 'N/A'}</span></p>
                                <p className="font-bold text-[10px] text-gray-800 uppercase mt-0.5 w-full truncate">{invoice.customer?.address || 'NO ADDRESS PROVIDED'}</p>
                                <div className="flex gap-3 mt-1.5 text-[9px] font-bold text-gray-700"><p>Category: <span className="text-black uppercase">{invoice.customer?.category || 'N/A'}</span></p><p>User / تیار کنندہ: <span className="text-black uppercase">{repDetails.name}</span></p></div>
                            </div>
                        </div>

                        <table className="bold-border mb-3 w-full shrink-0">
                            <thead>
                                <tr>
                                    <th className="w-8 text-center border-b-[1.5px] border-black"><span className="block text-[11px]">Sr.</span><span className="urdu-text text-[12px] block mt-0.5">نمبر</span></th>
                                    <th className="text-left border-b-[1.5px] border-black"><span className="block text-[11px]">Description</span><span className="urdu-text text-[12px] block mt-0.5">تفصیل</span></th>
                                    <th className="w-12 text-center border-b-[1.5px] border-black"><span className="block text-[11px]">Qty</span><span className="urdu-text text-[12px] block mt-0.5">مقدار</span></th>
                                    <th className="w-12 text-center border-b-[1.5px] border-black"><span className="block text-[11px]">Unit</span><span className="urdu-text text-[12px] block mt-0.5">یونٹ</span></th>
                                    <th className="w-16 text-right border-b-[1.5px] border-black"><span className="block text-[11px]">Price</span><span className="urdu-text text-[12px] block mt-0.5">قیمت</span></th>
                                    <th className="w-20 text-right border-b-[1.5px] border-black"><span className="block text-[11px]">Amount</span><span className="urdu-text text-[12px] block mt-0.5">رقم</span></th>
                                </tr>
                            </thead>
                            <tbody className="font-bold text-black uppercase">
                                {safeItems.map((item: any, i: number) => (
                                    <tr key={i}>
                                        <td className="text-center align-middle py-2.5 text-sm">{i + 1}</td>
                                        <td className="text-left py-2.5 text-[15px] md:text-[17px] font-black leading-relaxed" style={{ fontFamily: "'Noto Nastaliq Urdu', sans-serif" }}>{item.product?.name || 'Item'}</td>
                                        <td className="text-center align-middle py-2.5 text-base font-black">{item.quantity}</td>
                                        <td className="text-center align-middle py-2.5 text-[10px] font-bold text-gray-700">{item.product?.unit || 'Bags'}</td>
                                        <td className="text-right align-middle py-2.5 text-sm">{(item.price || 0).toLocaleString()}</td>
                                        <td className="text-right align-middle py-2.5 text-sm font-black">{((item.quantity || 0) * (item.price || 0)).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {(emptyRows || []).map((_, i) => (<tr key={`empty-${i}`}><td className="py-4 text-transparent">-</td><td></td><td></td><td></td><td></td><td></td></tr>))}
                            </tbody>
                        </table>

                        <div className="block w-full mb-2 shrink-0">
                            <table className="w-[190px] bold-border h-fit ml-auto bg-white text-[11px]">
                                <tbody>
                                    <tr><td className="font-black w-24 border-b border-black py-1.5 px-2 flex justify-between items-center"><span>Subtotal:</span><span className="urdu-text text-[12px] ml-1">میزان</span></td><td className="text-right font-black border-b border-black border-l-[1.5px] px-2">{subtotal.toLocaleString()}</td></tr>
                                    {invoice.discountAmount > 0 && (<tr><td className="font-black border-b border-black py-1.5 px-2 flex justify-between items-center"><span>Discount:</span><span className="urdu-text text-[12px] ml-1">رعایت</span></td><td className="text-right font-black border-b border-black border-l-[1.5px] px-2">- {(invoice.discountAmount || 0).toLocaleString()}</td></tr>)}
                                    <tr><td className="font-black border-b border-black py-1.5 px-2 flex justify-between items-center"><span>Prev. Bal:</span><span className="urdu-text text-[12px] ml-1">سابقہ بقایا</span></td><td className="text-right font-black border-b border-black border-l-[1.5px] px-2">{(invoice.prevBalance || 0).toLocaleString()}</td></tr>
                                    <tr><td className="font-black border-b border-black py-1.5 px-2 flex justify-between items-center"><span>Total:</span><span className="urdu-text text-[12px] ml-1">کل رقم</span></td><td className="text-right font-black border-b border-black border-l-[1.5px] px-2 text-sm">{ ((invoice.prevBalance || 0) + (invoice.isReturn ? -netTotal : netTotal)).toLocaleString() }</td></tr>
                                    <tr><td className="font-black border-b border-black py-1.5 px-2 flex justify-between items-center"><span>Payment:</span><span className="urdu-text text-[12px] ml-1">وصول شدہ</span></td><td className="text-right font-black border-b border-black border-l-[1.5px] px-2">{payment.toLocaleString()}</td></tr>
                                    <tr><td className="font-black py-1.5 px-2 flex justify-between items-center"><span>Balance:</span><span className="urdu-text text-[12px] ml-1">موجودہ بقایا</span></td><td className="text-right font-black border-l-[1.5px] px-2 text-sm">{closingBalance.toLocaleString()}</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="absolute bottom-[5mm] left-0 w-full text-center bg-white border-none pb-1">
                            <h3 className="urdu-text text-[18px] font-black text-black z-10 text-center mb-0 leading-none">سیلز مین سے لین دین کے لئے رابطہ کریں</h3>
                            <p className="font-black text-[12px] tracking-widest text-black z-10 mt-1">{repDetails.phone}</p>
                        </div>

                    </div>
                )
            })}
        </div>
    </div>
  )
}