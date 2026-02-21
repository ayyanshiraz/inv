import { PrismaClient } from '@prisma/client'
import { verifySession } from '@/lib/session'
import { getDashboardStats } from '@/actions/actions'
import { LayoutDashboard, Receipt, TrendingUp, Users, DollarSign, Package, Clock } from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function Dashboard() {
  const session = await verifySession()
  const stats = await getDashboardStats()

  return (
    <div className="min-h-screen bg-slate-50 lg:ml-64 p-4 pt-20 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Fahad Traders</h1>
            <p className="text-slate-500 font-bold text-sm flex items-center gap-2">
              <Clock size={14} /> All Time — Present
            </p>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-800">{stats.revenue.toLocaleString()}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Net Revenue</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <DollarSign size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              {/* FIXED LINE BELOW: Changed profitMargin to margin */}
              <h2 className="text-2xl font-black text-slate-800">{stats.margin}%</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Profit Margin</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-800">{stats.profit.toLocaleString()}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Net Profit</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Receipt size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between border-l-4 border-l-orange-500">
            <div>
              <h2 className="text-2xl font-black text-slate-800">{stats.totalReceivable.toLocaleString()}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Receivables</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Users size={24} />
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Package size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">{stats.salesCount}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Sales Count</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">{stats.customerCount}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Customers</p>
            </div>
          </div>

          {/* NEW: HOLD COUNT CARD */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 border-l-4 border-l-orange-400">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
              <Clock size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">{stats.holdCount}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Quotations on Hold</p>
            </div>
          </div>

        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
            <Link href="/invoice/new" className="p-8 bg-slate-900 text-white rounded-3xl hover:bg-black transition shadow-xl group">
                <div className="flex justify-between items-start mb-4">
                    <Receipt size={32} />
                    <span className="bg-white/10 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full group-hover:bg-blue-600 transition">Action Required</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">Create Sale Invoice</h3>
                <p className="text-slate-400 text-sm mt-1">Generate a new bill for a customer</p>
            </Link>
            
            <Link href="/ledger" className="p-8 bg-white text-slate-900 border border-slate-200 rounded-3xl hover:border-slate-400 transition shadow-sm group">
                <div className="flex justify-between items-start mb-4">
                    <LayoutDashboard size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">View Ledger</h3>
                <p className="text-slate-500 text-sm mt-1">Detailed financial reports & analysis</p>
            </Link>
        </div>

        <div className="mt-10 p-6 rounded-3xl bg-slate-200/50 border-2 border-dashed border-slate-300 text-center">
             <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">System Status: Online & Secure</p>
        </div>

      </div>
    </div>
  )
}