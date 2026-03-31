import { PrismaClient } from '@prisma/client'
import PrintPageButton from '@/components/PrintPageButton'
import { verifySession } from '@/lib/session'

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

  const MIN_ROWS = 2;

  return (
    <div className="bg-slate-200 min-h-screen py-10 block print:bg-white print:p-0 print:m-0">
        
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
          @font-face { font-family: 'Jameel Noori Nastaleeq'; src: local('Jameel Noori Nastaleeq'), local('Jameel Noori Nastaleeq Regular'); }
          
          .urdu-text { font-family: 'Noto Nastaliq Urdu', serif; line-height: 1.8; font-weight: 700 !important; }
          .jameel-font { font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif !important; }
          
          @media print {
              /* Forced exact mm dimensions to bypass browser A5 bugs */
              @page { size: 148mm 210mm; margin: 5mm !important; }
              body, html { margin: 0 !important; padding: 0 !important; background: white !important; display: block !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print, aside, nav, header, [class*="fixed"] { display: none !important; }
              
              .invoice-page { 
                  width: 148mm !important; 
                  margin: 0 auto !important; 
                  padding: 0 !important; 
                  box-sizing: border-box !important;
                  border: none !important; 
                  display: block !important;
                  page-break-inside: avoid !important;
                  page-break-after: always !important; /* Critical for bulk print breaks */
              }
              .invoice-page:last-of-type {
                  page-break-after: auto !important;
              }
          }
          
          table { width: 100%; border-collapse: collapse; border: 1.5px solid black; }
          th, td { border: 1px solid black; padding: 3px 4px; color: black; }
          th { background-color: #e5e7eb; font-weight: 900; }
          .bold-border { border: 1.5px solid black !important; }
        `}</style>

        <div className="no-print bg-white w-full max-w-[148mm] p-4 flex justify-between items-center shadow mb-6 rounded-xl border border-slate-200 mx-auto">
            <h1 className="font-black text-sm text-slate-800">Bulk Print Preview ({invoicesWithBalances.length})</h1>
            <PrintPageButton title="Print All A5" />
        </div>

        <div className="w-full block print:w-full print:max-w-none print:m-0 print:p-0">
            {invoicesWithBalances.map((invoice, index) => {
                const prevBalance = invoice.prevBalance || 0;
                const subtotal = invoice.items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
                const netTotal = invoice.totalAmount;
                const payment = invoice.paidAmount || 0;
                const closingBalance = prevBalance + (invoice.isReturn ? -netTotal : netTotal) - payment;

                const emptyRowsCount = Math.max(0, MIN_ROWS - invoice.items.length);
                const emptyRows = Array.from({ length: emptyRowsCount });

                const repDetails = getUserDisplayDetails(invoice.user);
                const displayDate = new Date(invoice.createdAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Karachi', day: '2-digit', month: '2-digit', year: 'numeric' });
                const displayId = /^\d+$/.test(invoice.id) ? invoice.id : invoice.id.slice(-6).toUpperCase();

                return (
                    <div key={invoice.id} className="invoice-page bg-white w-[148mm] mx-auto p-[5mm] shadow-2xl text-black block mb-8 print:shadow-none print:m-0">
                        
                        <div className="flex justify-between items-center mb-3">
                            <div className="w-16 h-16 flex items-center justify-center bg-white">
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="text-center flex-1 px-2">
                                <p className="text-[12px] urdu-text mb-0">کاروبار حلال - سود حرام</p>
                                <h1 className="text-2xl font-black uppercase tracking-tighter text-black leading-none mt-1">Fahad Traders</h1>
                                <p className="font-bold text-[9px] mt-1 text-black uppercase tracking-widest">{repDetails.name} <span className="ml-1">{repDetails.phone}</span></p>
                            </div>
                            <div className="text-right font-bold text-black min-w-[110px]">
                                <p className="mb-0.5 text-[15px] font-black">Inv# {displayId}</p>
                                <p className="text-[13px] m-0 font-black">Date: {displayDate}</p>
                                <p className="urdu-text m-0 text-[14px]">تاریخ</p>
                            </div>
                        </div>

                        {/* Crash-Proof Bill To Box (No absolute positioning) */}
                        <div className="bold-border" style={{ width: '65%', marginBottom: '3px', display: 'block' }}>
                            <table style={{ width: '100%', border: 'none' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ backgroundColor: '#e5e7eb', borderBottom: '1.5px solid black', padding: '2px 6px', fontWeight: 900, fontSize: '10px', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
                                            <div style={{ display: 'table', width: '100%' }}>
                                                <div style={{ display: 'table-cell', textAlign: 'left' }}>Bill To:</div>
                                                <div style={{ display: 'table-cell', textAlign: 'right', fontSize: '12px' }} className="urdu-text">خریدار:</div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ backgroundColor: 'white', padding: '0', border: 'none' }}>
                                            <table style={{ width: '100%', border: 'none' }}>
                                                <tbody>
                                                    <tr>
                                                        <td style={{ border: 'none', padding: '4px 6px', verticalAlign: 'top' }}>
                                                            <h2 className="jameel-font" style={{ margin: 0, fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', color: 'black', lineHeight: 1.2, textAlign: 'left' }} dir="ltr">
                                                                {invoice.customer?.name || 'Unknown'}
                                                            </h2>
                                                            <p className="font-bold text-black mt-0 text-[11px]">
                                                                {invoice.customer?.phone || '---'} 
                                                                <span className="text-[8px] font-mono text-gray-500 ml-2 bg-gray-100 px-1 py-[1px] rounded border border-gray-300">ID: {invoice.customer?.id}</span>
                                                            </p>
                                                            <p className="font-bold text-[9px] text-gray-800 uppercase mt-0 w-full truncate">{invoice.customer?.address || 'NO ADDRESS PROVIDED'}</p>
                                                        </td>
                                                        <td style={{ border: 'none', padding: '4px 6px', verticalAlign: 'top', textAlign: 'right', width: '80px' }}>
                                                            <div style={{ fontSize: '9px', fontWeight: 900, color: '#374151', lineHeight: 1.2 }}>
                                                                Category:<br/><span style={{ color: 'black', textTransform: 'uppercase' }}>{invoice.customer?.category || 'N/A'}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <table className="bold-border mb-2 w-full mt-1">
                            <thead>
                                <tr>
                                    <th className="w-8 text-center border-b-[1.5px] border-black"><span className="block text-[11px]">Sr.</span><span className="urdu-text text-[12px] block mt-0.5">نمبر</span></th>
                                    <th className="text-left border-b-[1.5px] border-black"><span className="block text-[11px]">Description</span><span className="urdu-text text-[12px] block mt-0.5">تفصیل</span></th>
                                    <th className="w-10 text-center border-b-[1.5px] border-black"><span className="block text-[11px]">Qty</span><span className="urdu-text text-[12px] block mt-0.5">مقدار</span></th>
                                    <th className="w-10 text-center border-b-[1.5px] border-black"><span className="block text-[11px]">Unit</span><span className="urdu-text text-[12px] block mt-0.5">یونٹ</span></th>
                                    <th className="w-16 text-right border-b-[1.5px] border-black"><span className="block text-[11px]">Price</span><span className="urdu-text text-[12px] block mt-0.5">قیمت</span></th>
                                    <th className="w-20 text-right border-b-[1.5px] border-black"><span className="block text-[11px]">Amount</span><span className="urdu-text text-[12px] block mt-0.5">رقم</span></th>
                                </tr>
                            </thead>
                            <tbody className="font-bold text-black uppercase">
                                {invoice.items.map((item: any, i: number) => (
                                    <tr key={i}>
                                        <td className="text-center align-middle py-1 text-[11px]">{i + 1}</td>
                                        <td className="text-left py-1 text-[13px] font-black leading-none jameel-font" dir="ltr">
                                            {item.product?.name || 'Item'}
                                        </td>
                                        <td className="text-center align-middle py-1 text-[12px] font-black">{item.quantity}</td>
                                        <td className="text-center align-middle py-1 text-[9px] font-bold text-gray-700">{item.product?.unit || 'Bags'}</td>
                                        <td className="text-right align-middle py-1 text-[12px]">{(item.price).toLocaleString()}</td>
                                        <td className="text-right align-middle py-1 text-[12px] font-black">{(item.quantity * item.price).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {emptyRows.map((_, i) => (
                                    <tr key={`empty-${i}`}><td className="py-2.5 text-transparent">-</td><td></td><td></td><td></td><td></td><td></td></tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="block w-full mb-3">
                            <table className="w-[190px] bold-border h-fit ml-auto bg-white text-[11px]">
                                <tbody>
                                    <tr><td className="font-black w-24 border-b border-black py-1 px-2 flex justify-between items-center"><span>Subtotal:</span><span className="urdu-text text-[11px] ml-1">میزان</span></td><td className="text-right font-black border-b border-black border-l-[1.5px] px-2">{subtotal.toLocaleString()}</td></tr>
                                    {invoice.discountAmount > 0 && (<tr><td className="font-black border-b border-black py-1 px-2 flex justify-between items-center"><span>Discount:</span><span className="urdu-text text-[11px] ml-1">رعایت</span></td><td className="text-right font-black border-b border-black border-l-[1.5px] px-2">- {invoice.discountAmount.toLocaleString()}</td></tr>)}
                                    <tr><td className="font-black border-b border-black py-1 px-2 flex justify-between items-center"><span>Prev. Bal:</span><span className="urdu-text text-[11px] ml-1">سابقہ بقایا</span></td><td className="text-right font-black border-b border-black border-l-[1.5px] px-2">{prevBalance.toLocaleString()}</td></tr>
                                    <tr><td className="font-black border-b border-black py-1 px-2 flex justify-between items-center"><span>Total:</span><span className="urdu-text text-[11px] ml-1">کل رقم</span></td><td className="text-right font-black border-b border-black border-l-[1.5px] px-2 text-[12px]">{ (prevBalance + (invoice.isReturn ? -netTotal : netTotal)).toLocaleString() }</td></tr>
                                    <tr><td className="font-black border-b border-black py-1 px-2 flex justify-between items-center"><span>Payment:</span><span className="urdu-text text-[11px] ml-1">وصول شدہ</span></td><td className="text-right font-black border-b border-black border-l-[1.5px] px-2">{payment.toLocaleString()}</td></tr>
                                    <tr><td className="font-black py-1 px-2 flex justify-between items-center"><span>Balance:</span><span className="urdu-text text-[11px] ml-1">موجودہ بقایا</span></td><td className="text-right font-black border-l-[1.5px] px-2 text-[12px]">{closingBalance.toLocaleString()}</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="w-full text-center bg-white border-none mt-2 pt-1">
                            <h3 className="urdu-text text-[14px] font-black text-black z-10 text-center mb-0 leading-none">سیلز مین سے لین دین کے لئے رابطہ کریں</h3>
                            <p className="font-black text-[10px] tracking-widest text-black z-10 mt-0.5">{repDetails.phone}</p>
                        </div>
                        
                    </div>
                )
            })}
        </div>
    </div>
  )
}