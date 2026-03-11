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

  const MIN_ROWS = 3;

  return (
    <div className="print-wrapper">
        
        {/* ULTRA-SAFE BARE METAL PRINT ENGINE: No flex math, no inside-breaks, pure block flow */}
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
          
          .urdu-text { font-family: 'Noto Nastaliq Urdu', serif; line-height: 1.8; font-weight: 700 !important; }
          
          /* Web Interface Styling */
          .print-wrapper { background-color: #e2e8f0; min-height: 100vh; padding: 2.5rem 0; }
          .screen-invoice { width: 148mm; margin: 0 auto 2rem auto; background: white; padding: 5mm; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); color: black; display: block; }
          
          table { width: 100%; border-collapse: collapse; border: 1.5px solid black; }
          th, td { border: 1px solid black; padding: 4px 6px; color: black; }
          th { background-color: #e5e7eb; font-weight: 900; }
          .bold-border { border: 1.5px solid black !important; }

          @media print {
              @page { size: A5 portrait; margin: 5mm !important; }
              
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              
              /* CRITICAL SAFARI FIX: Reset all roots to completely unbound block flow */
              html, body, .print-wrapper, .print-container {
                  display: block !important;
                  width: 100% !important;
                  height: auto !important;
                  min-height: 0 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  background: white !important;
                  overflow: visible !important;
              }
              
              .no-print, aside, nav, header { display: none !important; }
              
              .screen-invoice { 
                  display: block !important;
                  width: 148mm !important;
                  height: auto !important;
                  margin: 0 auto !important; 
                  padding: 5mm !important; 
                  border: none !important; 
                  box-shadow: none !important;
                  page-break-after: always !important; 
                  break-after: page !important;
              }
              
              .screen-invoice:last-of-type {
                  page-break-after: auto !important;
                  break-after: auto !important;
              }
              
              /* Safe Table Rendering */
              table { display: table !important; page-break-inside: auto !important; }
              tr { display: table-row !important; page-break-inside: avoid !important; }
              th, td { display: table-cell !important; }
          }
        `}} />

        <div className="no-print" style={{ backgroundColor: 'white', width: '100%', maxWidth: '148mm', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 auto 24px auto', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h1 style={{ fontWeight: 900, fontSize: '14px', color: '#1e293b', textTransform: 'uppercase', margin: 0 }}>Bulk Print ({(invoicesWithBalances || []).length})</h1>
            {/* Using your custom print component to handle the click logic properly */}
            <PrintPageButton title="Print All A5" />
        </div>

        <div className="print-container">
            {(invoicesWithBalances || []).map((invoice, index) => {
                const safeItems = invoice.items || [];
                const subtotal = safeItems.reduce((sum: number, item: any) => sum + ((item.quantity || 0) * (item.price || 0)), 0);
                const netTotal = invoice.totalAmount || 0;
                const payment = invoice.paidAmount || 0;
                const closingBalance = (invoice.prevBalance || 0) + (invoice.isReturn ? -netTotal : netTotal) - payment;
                
                const emptyRowCount = Math.max(0, MIN_ROWS - safeItems.length);
                const emptyRows = Array.from({ length: emptyRowCount });
                const repDetails = getUserDisplayDetails(invoice.user);
                
                const displayDate = new Date(invoice.createdAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Karachi', day: '2-digit', month: '2-digit', year: 'numeric' });
                const displayId = /^\d+$/.test(invoice.id) ? invoice.id : invoice.id.slice(-6).toUpperCase();

                return (
                    <div key={invoice.id} className="screen-invoice">
                        
                        <table style={{ width: '100%', border: 'none', marginBottom: '16px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: '64px', border: 'none', padding: '0', verticalAlign: 'middle' }}>
                                        <img src="/logo.png" alt="Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
                                    </td>
                                    <td style={{ textAlign: 'center', border: 'none', padding: '0 8px', verticalAlign: 'middle' }}>
                                        <p style={{ margin: 0, fontSize: '12px' }} className="urdu-text">کاروبار حلال - سود حرام</p>
                                        <h1 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', color: 'black', lineHeight: 1 }}>Fahad Traders</h1>
                                        <p style={{ margin: '4px 0 0 0', fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'black' }}>
                                            {repDetails.name} <span style={{ marginLeft: '4px' }}>{repDetails.phone}</span>
                                        </p>
                                    </td>
                                    <td style={{ minWidth: '100px', textAlign: 'right', border: 'none', padding: '0', verticalAlign: 'middle', fontSize: '10px', fontWeight: 700, color: 'black' }}>
                                        <p style={{ margin: '0 0 2px 0', fontSize: '12px', fontWeight: 900 }}>Inv# {displayId}</p>
                                        <p style={{ margin: 0 }}>Date: {displayDate}</p>
                                        <p style={{ margin: 0, fontSize: '11px' }} className="urdu-text">تاریخ</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="bold-border" style={{ width: '65%', marginBottom: '12px', display: 'block' }}>
                            <table style={{ width: '100%', border: 'none' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ backgroundColor: '#e5e7eb', borderBottom: '1.5px solid black', padding: '2px 8px', fontWeight: 900, fontSize: '10px', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
                                            <div style={{ display: 'table', width: '100%' }}>
                                                <div style={{ display: 'table-cell', textAlign: 'left' }}>Bill To:</div>
                                                <div style={{ display: 'table-cell', textAlign: 'right', fontSize: '13px' }} className="urdu-text">خریدار:</div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ backgroundColor: 'white', padding: '8px', border: 'none' }}>
                                            <h2 style={{ margin: 0, fontWeight: 900, fontSize: '17px', textTransform: 'uppercase', color: 'black', lineHeight: 1.1 }}>{invoice.customer?.name || 'Unknown'}</h2>
                                            <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: 'black', fontSize: '13px' }}>
                                                {invoice.customer?.phone || '---'}
                                                <span style={{ fontSize: '8px', fontFamily: 'monospace', color: '#6b7280', marginLeft: '8px', backgroundColor: '#f3f4f6', padding: '1px 4px', borderRadius: '4px', border: '1px solid #d1d5db' }}>ID: {invoice.customer?.id || 'N/A'}</span>
                                            </p>
                                            <p style={{ margin: '2px 0 0 0', fontWeight: 700, fontSize: '10px', color: '#1f2937', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{invoice.customer?.address || 'NO ADDRESS PROVIDED'}</p>
                                            <p style={{ margin: '6px 0 0 0', fontSize: '9px', fontWeight: 700, color: '#374151' }}>
                                                Category: <span style={{ color: 'black', textTransform: 'uppercase', marginRight: '12px' }}>{invoice.customer?.category || 'N/A'}</span>
                                                User / تیار کنندہ: <span style={{ color: 'black', textTransform: 'uppercase' }}>{repDetails.name}</span>
                                            </p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <table className="data-table bold-border" style={{ marginBottom: '12px' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '32px', textAlign: 'center', borderBottom: '1.5px solid black' }}><span style={{ display: 'block', fontSize: '11px' }}>Sr.</span><span className="urdu-text" style={{ display: 'block', fontSize: '12px', marginTop: '2px' }}>نمبر</span></th>
                                    <th style={{ textAlign: 'left', borderBottom: '1.5px solid black' }}><span style={{ display: 'block', fontSize: '11px' }}>Description</span><span className="urdu-text" style={{ display: 'block', fontSize: '12px', marginTop: '2px' }}>تفصیل</span></th>
                                    <th style={{ width: '48px', textAlign: 'center', borderBottom: '1.5px solid black' }}><span style={{ display: 'block', fontSize: '11px' }}>Qty</span><span className="urdu-text" style={{ display: 'block', fontSize: '12px', marginTop: '2px' }}>مقدار</span></th>
                                    <th style={{ width: '48px', textAlign: 'center', borderBottom: '1.5px solid black' }}><span style={{ display: 'block', fontSize: '11px' }}>Unit</span><span className="urdu-text" style={{ display: 'block', fontSize: '12px', marginTop: '2px' }}>یونٹ</span></th>
                                    <th style={{ width: '64px', textAlign: 'right', borderBottom: '1.5px solid black' }}><span style={{ display: 'block', fontSize: '11px' }}>Price</span><span className="urdu-text" style={{ display: 'block', fontSize: '12px', marginTop: '2px' }}>قیمت</span></th>
                                    <th style={{ width: '80px', textAlign: 'right', borderBottom: '1.5px solid black' }}><span style={{ display: 'block', fontSize: '11px' }}>Amount</span><span className="urdu-text" style={{ display: 'block', fontSize: '12px', marginTop: '2px' }}>رقم</span></th>
                                </tr>
                            </thead>
                            <tbody style={{ fontWeight: 700, color: 'black', textTransform: 'uppercase' }}>
                                {safeItems.map((item: any, i: number) => (
                                    <tr key={i}>
                                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '10px 6px', fontSize: '14px' }}>{i + 1}</td>
                                        <td style={{ textAlign: 'left', verticalAlign: 'middle', padding: '10px 6px', fontSize: '15px', fontWeight: 900, fontFamily: "'Noto Nastaliq Urdu', sans-serif" }}>{item.product?.name || 'Item'}</td>
                                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '10px 6px', fontSize: '16px', fontWeight: 900 }}>{item.quantity}</td>
                                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '10px 6px', fontSize: '10px', fontWeight: 700, color: '#374151' }}>{item.product?.unit || 'Bags'}</td>
                                        <td style={{ textAlign: 'right', verticalAlign: 'middle', padding: '10px 6px', fontSize: '14px' }}>{(item.price || 0).toLocaleString()}</td>
                                        <td style={{ textAlign: 'right', verticalAlign: 'middle', padding: '10px 6px', fontSize: '14px', fontWeight: 900 }}>{((item.quantity || 0) * (item.price || 0)).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {emptyRows.map((_, i) => (<tr key={`empty-${i}`}><td style={{ padding: '16px 6px', color: 'transparent' }}>-</td><td></td><td></td><td></td><td></td><td></td></tr>))}
                            </tbody>
                        </table>

                        <div style={{ display: 'block', width: '100%', marginBottom: '24px', overflow: 'hidden' }}>
                            <table className="bold-border" style={{ width: '190px', float: 'right', backgroundColor: 'white', fontSize: '11px', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ fontWeight: 900, borderBottom: '1px solid black', padding: '6px 8px' }}>Subtotal: <span className="urdu-text" style={{ fontSize: '12px', float: 'right' }}>میزان</span></td>
                                        <td style={{ textAlign: 'right', fontWeight: 900, borderBottom: '1px solid black', borderLeft: '1.5px solid black', padding: '6px 8px' }}>{subtotal.toLocaleString()}</td>
                                    </tr>
                                    {invoice.discountAmount > 0 && (
                                        <tr>
                                            <td style={{ fontWeight: 900, borderBottom: '1px solid black', padding: '6px 8px' }}>Discount: <span className="urdu-text" style={{ fontSize: '12px', float: 'right' }}>رعایت</span></td>
                                            <td style={{ textAlign: 'right', fontWeight: 900, borderBottom: '1px solid black', borderLeft: '1.5px solid black', padding: '6px 8px' }}>- {(invoice.discountAmount || 0).toLocaleString()}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td style={{ fontWeight: 900, borderBottom: '1px solid black', padding: '6px 8px' }}>Prev. Bal: <span className="urdu-text" style={{ fontSize: '12px', float: 'right' }}>سابقہ بقایا</span></td>
                                        <td style={{ textAlign: 'right', fontWeight: 900, borderBottom: '1px solid black', borderLeft: '1.5px solid black', padding: '6px 8px' }}>{(invoice.prevBalance || 0).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 900, borderBottom: '1px solid black', padding: '6px 8px' }}>Total: <span className="urdu-text" style={{ fontSize: '12px', float: 'right' }}>کل رقم</span></td>
                                        <td style={{ textAlign: 'right', fontWeight: 900, borderBottom: '1px solid black', borderLeft: '1.5px solid black', padding: '6px 8px', fontSize: '14px' }}>{ ((invoice.prevBalance || 0) + (invoice.isReturn ? -netTotal : netTotal)).toLocaleString() }</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 900, borderBottom: '1px solid black', padding: '6px 8px' }}>Payment: <span className="urdu-text" style={{ fontSize: '12px', float: 'right' }}>وصول شدہ</span></td>
                                        <td style={{ textAlign: 'right', fontWeight: 900, borderBottom: '1px solid black', borderLeft: '1.5px solid black', padding: '6px 8px' }}>{payment.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 900, padding: '6px 8px' }}>Balance: <span className="urdu-text" style={{ fontSize: '12px', float: 'right' }}>موجودہ بقایا</span></td>
                                        <td style={{ textAlign: 'right', fontWeight: 900, borderLeft: '1.5px solid black', padding: '6px 8px', fontSize: '14px' }}>{closingBalance.toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div style={{ width: '100%', textAlign: 'center', backgroundColor: 'white', marginTop: '32px', paddingTop: '16px', clear: 'both' }}>
                            <h3 className="urdu-text" style={{ fontSize: '18px', fontWeight: 900, color: 'black', margin: 0, lineHeight: 1 }}>سیلز مین سے لین دین کے لئے رابطہ کریں</h3>
                            <p style={{ fontWeight: 900, fontSize: '12px', letterSpacing: '0.1em', color: 'black', margin: '4px 0 0 0' }}>{repDetails.phone}</p>
                        </div>

                    </div>
                )
            })}
        </div>
    </div>
  )
}