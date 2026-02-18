import { PrismaClient } from '@prisma/client'
import PrintActions from '@/components/PrintActions'

const prisma = new PrismaClient()

export default async function PrintInvoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params 

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, items: { include: { product: true } } }
  })

  if (!invoice) return <div>Invoice Not Found</div>

  // --- LOGIC ---
  const pastInvoices = await prisma.invoice.findMany({
    where: {
      customerId: invoice.customerId,
      createdAt: { lt: invoice.createdAt }
    }
  })
  
  // Previous Balance = (Total - Paid) of all past invoices
  const previousBalance = pastInvoices.reduce((sum, inv) => sum + (inv.totalAmount - (inv.paidAmount || 0)), 0)
  
  const subtotal = invoice.totalAmount
  const currentPaid = invoice.paidAmount || 0
  const grandTotal = subtotal + previousBalance
  const totalBalance = grandTotal - currentPaid

  const phone = invoice.customer.phone || "" 

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      
      {/* FIX: This CSS hides everything by default when printing,
         then turns visibility back ON just for the invoice wrapper.
      */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
        .urdu { font-family: 'Noto Nastaliq Urdu', serif; }

        @media print {
            /* 1. Hide EVERYTHING */
            body * {
                visibility: hidden;
            }
            
            /* 2. Show ONLY the print wrapper and its children */
            #print-wrapper, #print-wrapper * {
                visibility: visible;
            }

            /* 3. Position the wrapper at the very top-left */
            #print-wrapper {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 10px; /* Optional padding to prevent cut-off */
            }

            /* 4. Hide buttons specifically */
            .no-print {
                display: none !important;
            }
        }
      `}</style>

      {/* BUTTONS */}
      <div className="no-print w-full max-w-[210mm] mb-6">
        <PrintActions 
            id={invoice.id.slice(-6).toUpperCase()} 
            phone={phone}
            amount={grandTotal}
            customer={invoice.customer.name}
        />
      </div>

      {/* --- INVOICE PAPER --- */}
      {/* Added 'text-black' to ensure ink isn't white/gray */}
      <div id="print-wrapper" className="bg-white w-[210mm] min-h-[297mm] p-10 shadow-2xl mx-auto relative text-black">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
            {/* Logo: Added 'mix-blend-multiply' to hide white background box */}
            <div className="w-24 h-24 shrink-0 overflow-hidden rounded-full border-2 border-black mr-4 relative">
                <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover mix-blend-multiply" />
            </div>

            <div className="flex-1 text-center">
                <h2 className="urdu text-xl font-bold mb-0 text-black" dir="rtl">کاروبار حلال - سود حرام</h2>
                <h1 className="text-4xl font-black uppercase tracking-tight mb-1 text-black">Fahad Traders</h1>
                <p className="font-bold text-sm uppercase text-black">SH NADIR 0321-4030049 0311-4034921</p>
            </div>

            <div className="text-right min-w-[120px]">
                <p className="font-bold text-lg text-black">Inv# <span className="font-mono">{invoice.id.slice(-6).toUpperCase()}</span></p>
                <p className="font-bold text-sm text-black">Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
            </div>
        </div>

        {/* BILL TO */}
        <div className="mb-6">
            <div className="border border-black w-2/3 inline-block">
                <div className="border-b border-black bg-gray-200 px-2 py-1 text-sm font-bold text-black">Bill To:</div>
                <div className="p-2">
                    <h3 className="font-bold text-xl uppercase text-black">{invoice.customer.name}</h3>
                    <p className="font-bold text-sm text-black">{phone}</p>
                </div>
            </div>
        </div>

        {/* TABLE */}
        <table className="w-full border-collapse border border-black mb-1">
            <thead>
                <tr className="bg-gray-200 text-sm border-b border-black text-black">
                    <th className="border-r border-black px-2 py-1 text-left font-bold w-[50%]">Description</th>
                    <th className="border-r border-black px-2 py-1 text-center font-bold w-[15%]">Qty</th>
                    <th className="border-r border-black px-2 py-1 text-right font-bold w-[15%]">Price</th>
                    <th className="border-black px-2 py-1 text-right font-bold w-[20%]">Amount</th>
                </tr>
            </thead>
            <tbody className="text-sm font-bold text-black">
                {invoice.items.map((item, i) => (
                    <tr key={i} className="border-b border-black">
                        <td className="border-r border-black px-2 py-1 uppercase urdu text-left" dir="auto">{item.product.name}</td>
                        <td className="border-r border-black px-2 py-1 text-center">{item.quantity}</td>
                        <td className="border-r border-black px-2 py-1 text-right">{item.price}</td>
                        <td className="border-black px-2 py-1 text-right">{(item.quantity * item.price).toLocaleString()}</td>
                    </tr>
                ))}
                {[...Array(Math.max(0, 10 - invoice.items.length))].map((_, i) => (
                    <tr key={`empty-${i}`} className="h-6 border-b border-black">
                        <td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-black"></td>
                    </tr>
                ))}
            </tbody>
        </table>

        {/* FINANCIALS GRID */}
        <div className="flex justify-end mt-0 text-black">
            <div className="w-[50%] border-l border-r border-b border-black">
                <div className="flex border-b border-black">
                    <div className="w-1/2 bg-gray-200 border-r border-black px-2 py-1 text-sm font-bold">Subtotal:</div>
                    <div className="w-1/2 px-2 py-1 text-right text-sm font-bold">{subtotal.toLocaleString()}</div>
                </div>
                <div className="flex border-b border-black">
                    <div className="w-1/2 bg-gray-200 border-r border-black px-2 py-1 text-sm font-bold">Prev. Balance:</div>
                    <div className="w-1/2 px-2 py-1 text-right text-sm font-bold">{previousBalance.toLocaleString()}</div>
                </div>
                <div className="flex border-b border-black">
                    <div className="w-1/2 bg-gray-200 border-r border-black px-2 py-1 text-sm font-bold">Total:</div>
                    <div className="w-1/2 px-2 py-1 text-right text-sm font-bold">{grandTotal.toLocaleString()}</div>
                </div>
                <div className="flex border-b border-black">
                    <div className="w-1/2 bg-gray-200 border-r border-black px-2 py-1 text-sm font-bold">Payment:</div>
                    <div className="w-1/2 px-2 py-1 text-right text-sm font-bold">{currentPaid.toLocaleString()}</div>
                </div>
                <div className="flex border-b border-black last:border-b-0">
                    <div className="w-1/2 bg-gray-200 border-r border-black px-2 py-1 text-sm font-bold">Balance:</div>
                    <div className="w-1/2 px-2 py-1 text-right text-sm font-bold">{totalBalance.toLocaleString()}</div>
                </div>
            </div>
        </div>

        {/* FOOTER */}
        <div className="relative text-center mt-20 text-black">
            <div className="absolute left-1/2 -top-16 -translate-x-1/2 w-40 h-40 border-[6px] border-[#8b5a2b]/20 rounded-full opacity-60 pointer-events-none filter blur-[2px]"></div>
            <p className="urdu text-xl font-bold mb-0 text-black" dir="rtl">سیلز مین سے لین دین کے لئے رابطہ کریں</p>
            <p className="font-bold text-black">0321-4030049</p>
        </div>
      </div>
    </div>
  )
}