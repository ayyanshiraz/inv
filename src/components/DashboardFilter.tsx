'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardFilter({ initialFrom, initialTo }: { initialFrom: string, initialTo: string }) {
    const router = useRouter()
    const [from, setFrom] = useState(initialFrom)
    const [to, setTo] = useState(initialTo)
    
    const [fromFocus, setFromFocus] = useState(false)
    const [toFocus, setToFocus] = useState(false)

    // Strict DD/MM/YYYY Formatter
    const formatDDMMYYYY = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        router.push(`/?from=${from}&to=${to}`)
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
            
            {/* THE FOCUS SWAP FIX */}
            <input 
                type={fromFocus ? "date" : "text"} 
                name="from"
                value={fromFocus ? from : formatDDMMYYYY(from)} 
                onChange={(e) => setFrom(e.target.value)}
                onFocus={() => setFromFocus(true)}
                onBlur={() => setFromFocus(false)}
                className="w-36 h-10 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-blue-500 transition cursor-pointer text-center tracking-widest shrink-0" 
            />
            
            <span className="text-slate-400 font-bold shrink-0">-</span>
            
            <input 
                type={toFocus ? "date" : "text"} 
                name="to"
                value={toFocus ? to : formatDDMMYYYY(to)} 
                onChange={(e) => setTo(e.target.value)}
                onFocus={() => setToFocus(true)}
                onBlur={() => setToFocus(false)}
                className="w-36 h-10 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-blue-500 transition cursor-pointer text-center tracking-widest shrink-0" 
            />

            <button type="submit" className="bg-slate-900 text-white px-5 h-10 rounded-lg hover:bg-black transition text-xs font-black uppercase tracking-widest shrink-0">
                Filter
            </button>
        </form>
    )
}