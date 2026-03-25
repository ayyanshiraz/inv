'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { createInvoice } from '@/actions/actions' // Adjust this import if your action is named differently

export default function VoucherForm({ customers }: { customers: any[] }) {
  const router = useRouter()
  const [customerId, setCustomerId] = useState('')
  const [paidAmount, setPaidAmount] = useState('')
  const [discountAmount, setDiscountAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedCustomer = customers.find(c => c.id === customerId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId) return alert('Please select a customer.')
    if (!paidAmount || Number(paidAmount) <= 0) return alert('Please enter a valid amount.')

    setIsSubmitting(true)
    
    // Creating a payment voucher: Total is 0, but paid amount is recorded.
    // Ensure your Prisma schema for Invoice has a 'notes' or 'description' string field!
    const data = {
        customerId,
        totalAmount: 0, 
        paidAmount: Number(paidAmount),
        discountAmount: Number(discountAmount) || 0,
        notes: notes, // Passing the notes to the database
        isReturn: false,
        isHold: false,
        items: [] 
    }

    try {
        await createInvoice(data)
        alert('Voucher recorded successfully!')
        router.push('/receivables')
        router.refresh()
    } catch (error) {
        alert('Error saving voucher. Please try again.')
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200">
        
        {/* Font injection for beautiful Urdu Nastaleeq rendering */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
          .urdu-input { 
              font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif; 
              line-height: 2; 
              font-size: 16px;
          }
        `}</style>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <label className="text-xs font-black uppercase text-slate-800 mb-2 block">Select Customer</label>
                <select 
                    value={customerId} 
                    onChange={(e) => setCustomerId(e.target.value)} 
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 transition cursor-pointer"
                    required
                >
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.name} (Bal: PKR {c.balance?.toLocaleString() || 0})
                        </option>
                    ))}
                </select>
            </div>

            {selectedCustomer && (
                <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col justify-center items-start border border-slate-800">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Current Balance</span>
                    <span className="text-2xl font-black leading-none">PKR {selectedCustomer.balance?.toLocaleString() || 0}</span>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <label className="text-xs font-black uppercase text-slate-800 mb-2 block">Amount Received (PKR)</label>
                <input 
                    type="number" 
                    value={paidAmount} 
                    onChange={(e) => setPaidAmount(e.target.value)} 
                    placeholder="e.g. 50000"
                    className="w-full p-3 bg-white border-2 border-emerald-300 rounded-xl font-black text-slate-900 outline-none focus:border-emerald-600 transition"
                    required
                />
            </div>
            <div>
                <label className="text-xs font-black uppercase text-slate-800 mb-2 block">Discount Allowed (Optional)</label>
                <input 
                    type="number" 
                    value={discountAmount} 
                    onChange={(e) => setDiscountAmount(e.target.value)} 
                    placeholder="e.g. 500"
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 transition"
                />
            </div>
        </div>

        <div className="mb-8">
            <label className="text-xs font-black uppercase text-slate-800 mb-2 block">Notes / Comments (Optional - English or Urdu)</label>
            <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Enter details like check number, bank transfer ID, or remarks..."
                rows={3}
                dir="auto" // Automatically detects RTL for Urdu or LTR for English
                className="urdu-input w-full p-4 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 transition resize-none"
            />
        </div>

        <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
            <Save size={18} /> {isSubmitting ? 'Saving...' : 'Record Payment Voucher'}
        </button>
    </form>
  )
}