'use client'

import { useState } from 'react'
import { Edit, Trash2, Save, X } from 'lucide-react'
import { deleteInvoice, updateVoucher } from '@/actions/actions'

const getPKTDateString = (dateObj?: Date | string) => {
    const targetDate = dateObj ? new Date(dateObj) : new Date();
    const pkt = new Date(targetDate.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
    return `${pkt.getFullYear()}-${String(pkt.getMonth() + 1).padStart(2, '0')}-${String(pkt.getDate()).padStart(2, '0')}`;
};

export default function ReceivablesManager({ vouchers }: { vouchers: any[] }) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editAmount, setEditAmount] = useState<string>('')
    const [editDiscount, setEditDiscount] = useState<string>('') 
    const [editDate, setEditDate] = useState<string>('')
    const [isSaving, setIsSaving] = useState(false)

    const handleEditClick = (v: any) => {
        setEditingId(v.id)
        setEditAmount((v.paidAmount || 0).toString())
        setEditDiscount((v.discountAmount || 0).toString())
        setEditDate(getPKTDateString(v.createdAt))
    }

    const handleSave = async (id: string) => {
        const numAmount = Number(editAmount) || 0
        const numDiscount = Number(editDiscount) || 0
        if (numAmount <= 0 && numDiscount <= 0) return alert("Must enter a valid amount or discount.")
        if (!editDate) return alert("Please select a valid date.")
        
        setIsSaving(true)
        
        // PKT Injection Logic
        const todayStr = getPKTDateString();
        let finalEditDate;
        if (editDate === todayStr) {
            finalEditDate = new Date().toISOString();
        } else {
            finalEditDate = new Date(`${editDate}T12:00:00+05:00`).toISOString();
        }

        try {
            await updateVoucher(id, numAmount, finalEditDate, numDiscount)
            setEditingId(null)
        } catch (e) {
            alert("Error updating voucher.")
        }
        setIsSaving(false)
    }

    const handleDelete = async (id: string) => {
        if (confirm("Delete this voucher? This will instantly return the deducted amount back to the customer's balance.")) {
            await deleteInvoice(id)
        }
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-slate-100 border-b-2 border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <tr>
                            <th className="p-4 w-32">Date</th>
                            <th className="p-4 hidden md:table-cell w-28">Voucher ID</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4 text-right w-36">Discount</th>
                            <th className="p-4 text-right w-40">Amount Received</th>
                            <th className="p-4 text-right w-28">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-bold text-slate-700 divide-y divide-slate-100">
                        {vouchers.map(v => (
                            <tr key={v.id} className="hover:bg-slate-50 transition">
                                
                                <td className="p-4 whitespace-nowrap">
                                    {editingId === v.id ? (
                                        <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full p-2 border-2 border-blue-400 rounded-lg bg-white text-slate-900 font-bold outline-none shadow-inner" />
                                    ) : (
                                        new Date(v.createdAt).toLocaleDateString('en-GB', { timeZone: 'Asia/Karachi', day: '2-digit', month: '2-digit', year: 'numeric' })
                                    )}
                                </td>
                                
                                <td className="p-4 font-mono text-xs text-slate-400 hidden md:table-cell">
                                    {/^\d+$/.test(v.id) ? v.id : v.id.slice(-6).toUpperCase()}
                                </td>
                                
                                <td className="p-4 uppercase text-slate-900">{v.customer.name}</td>
                                
                                <td className="p-4 text-right">
                                    {editingId === v.id ? (
                                        <input type="number" value={editDiscount} onChange={(e) => setEditDiscount(e.target.value)} className="w-full p-2 border-2 border-orange-400 rounded-lg bg-white text-orange-700 font-black outline-none text-right shadow-inner" />
                                    ) : (
                                        <span className="text-orange-500">{v.discountAmount > 0 ? `PKR ${v.discountAmount.toLocaleString()}` : '---'}</span>
                                    )}
                                </td>

                                <td className="p-4 text-right">
                                    {editingId === v.id ? (
                                        <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="w-full p-2 border-2 border-emerald-400 rounded-lg bg-white text-emerald-700 font-black outline-none text-right shadow-inner" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleSave(v.id); if (e.key === 'Escape') setEditingId(null); }} />
                                    ) : (
                                        <span className="text-emerald-600 font-black text-lg">PKR {v.paidAmount?.toLocaleString()}</span>
                                    )}
                                </td>
                                
                                <td className="p-4 text-right">
                                    {editingId === v.id ? (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleSave(v.id)} disabled={isSaving} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition"><Save size={16} /></button>
                                            <button onClick={() => setEditingId(null)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"><X size={16} /></button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEditClick(v)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(v.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"><Trash2 size={16} /></button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {vouchers.length === 0 && (<tr><td colSpan={6} className="p-12 text-center text-slate-400">No payment vouchers recorded yet.</td></tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    )
}