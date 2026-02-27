import { PrismaClient } from '@prisma/client'
import { verifySession } from '@/lib/session'
import { getDashboardStats } from '@/actions/actions'
import { LayoutDashboard, Receipt, TrendingUp, Users, DollarSign, Package, Clock, Search } from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ from?: string, to?: string }> }) {
  const session = await verifySession()
  const params = await searchParams
  
  const from = params.from ? new Date(params.from) : undefined
  const to = params.to ? new Date(params.to) : undefined
  const stats = await getDashboardStats(from, to)

  // QUICK DATE CALCULATION LOGIC
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  const localToday = new Date(today.getTime() - offset);
  const todayStr = localToday.toISOString().split('T')[0];

  const weekAgo = new Date(localToday); weekAgo.setDate(localToday.getDate() - 7);
  const weekStr = weekAgo.toISOString().split('T')[0];

  const monthAgo = new Date(localToday); monthAgo.setDate(localToday.getDate() - 30);
  const monthStr = monthAgo.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-50 lg:ml-64 p-4 pt-20 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Fahad Traders</h1>
            <p className="text-slate-500 font-bold text-sm flex items-center gap-2">
              <Clock size={14} /> {from ? `${from.toLocaleDateString()} — ${to ? to.toLocaleDateString() : 'Present'}` : 'All Time — Present'}
            </p>
          </div>

          {/* DASHBOARD DATE FILTERS */}
          <form className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200 w-full xl:w-auto">
              <div className="flex bg-slate-100 rounded-lg p-1 mr-1 border border-slate-200 shadow-inner">
                  <Link href={`/?from=${todayStr}&to=${todayStr}`} className="px-3 py-1.5 text-[10px] font-black uppercase rounded hover:bg-white hover:shadow-sm transition text-slate-600">Daily</Link>
                  <Link href={`/?from=${weekStr}&to=${todayStr}`} className="px-3 py-1.5 text-[10px] font-black uppercase rounded hover:bg-white hover:shadow-sm transition text-slate-600 border-l border-r border-slate-200">Weekly</Link>
                  <Link href={`/?from=${monthStr}&to=${todayStr}`} className="px-3 py-1.5 text-[10px] font-black uppercase rounded hover:bg-white hover:shadow-sm transition text-slate-600">Monthly</Link>
              </div>
              <input type="date" name="from" defaultValue={params.from || ''} className="p-2 text-xs font-bold text-slate-900 bg-slate-50 rounded border border-slate-200 outline-none w-[115px]" />
              <span className="text-slate-400 font-bold">-</span>
              <input type="date" name="to" defaultValue={params.to || ''} className="p-2 text-xs font-bold text-slate-900 bg-slate-50 rounded border border-slate-200 outline-none w-[115px]" />
              <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-black transition text-xs font-bold uppercase tracking-widest ml-2">Filter</button>
              <Link href={`/`} className="text-xs font-bold uppercase text-slate-400 px-2 hover:text-red-500">Clear</Link>
          </form>
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