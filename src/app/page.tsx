import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { getDashboardStats } from '@/actions/actions'
import { Calendar, ShoppingCart, Users, Percent, ArrowLeftRight, TrendingUp, DollarSign } from 'lucide-react'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic' 

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ from?: string, to?: string }> }) {
  
  const params = await searchParams
  const from = params.from ? new Date(params.from) : undefined
  const to = params.to ? new Date(params.to) : undefined
  
  const stats = await getDashboardStats(from, to)

  return (
    <main className="min-h-screen bg-[#f3f4f6] p-8 ml-64 font-sans">
      
      {/* HEADER + DATE FILTER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Fahad Traders</h1>
          <div className="flex items-center gap-2 text-slate-500 text-sm font-bold mt-1">
            <Calendar size={14} />
            <span>{from ? from.toLocaleDateString() : 'All Time'} — {to ? to.toLocaleDateString() : 'Present'}</span>
          </div>
        </div>
        
        {/* Simple Date Filter Form */}
        <form className="flex gap-2 items-center bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <input type="date" name="from" className="text-xs font-bold uppercase text-slate-600 outline-none" />
            <span className="text-slate-300">/</span>
            <input type="date" name="to" className="text-xs font-bold uppercase text-slate-600 outline-none" />
            <button type="submit" className="bg-slate-900 text-white p-2 rounded-lg hover:bg-black">
                <ArrowLeftRight size={14} />
            </button>
        </form>
      </div>

      {/* --- CARDS GRID --- */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        
        {/* REVENUE */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-black text-slate-800">{stats.netRevenue.toLocaleString()}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Net Revenue</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <DollarSign size={24} />
            </div>
        </div>

        {/* PROFIT MARGIN */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-black text-slate-800">{stats.profitMargin}%</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Profit Margin</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                <Percent size={24} />
            </div>
        </div>

        {/* PROFIT */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-black text-slate-800">{stats.profit.toLocaleString()}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Net Profit</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <TrendingUp size={24} />
            </div>
        </div>

        {/* RECEIVABLES (FIXED: Now White Background + Dark Text) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-black text-slate-800">{stats.totalReceivable.toLocaleString()}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Receivables</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <ArrowLeftRight size={24} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-12">
         {/* SALES COUNT */}
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                <ShoppingCart size={18} />
             </div>
             <div>
                 <h3 className="text-xl font-black text-slate-800">{stats.salesCount}</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Sales Count</p>
             </div>
         </div>

         {/* CUSTOMER COUNT */}
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Users size={18} />
             </div>
             <div>
                 <h3 className="text-xl font-black text-slate-800">{stats.customerCount}</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Customers</p>
             </div>
         </div>
         
         {/* SYSTEM STATUS */}
         <div className="col-span-2 bg-slate-200/50 rounded-3xl flex items-center justify-center border border-dashed border-slate-300">
             <p className="text-xs font-bold text-slate-400 uppercase">System Status: Online</p>
         </div>
      </div>
    </main>
  )
}