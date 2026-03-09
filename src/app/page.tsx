import { PrismaClient } from '@prisma/client'
import { verifySession } from '@/lib/session'
import { TrendingUp, DollarSign, Package, ArrowLeftRight } from 'lucide-react'
import { getDashboardStats } from '@/actions/actions'
import Link from 'next/link'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<any> | any }) {
  const session = await verifySession()
  const params = await searchParams || {}

  // STRICT PKT TIME LOGIC
  const pktNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
  const todayStr = `${pktNow.getFullYear()}-${String(pktNow.getMonth()+1).padStart(2,'0')}-${String(pktNow.getDate()).padStart(2,'0')}`;

  // Defaults to today if no date is manually selected
  const from = params.from ? new Date(params.from) : new Date(todayStr)
  const to = params.to ? new Date(params.to) : new Date(todayStr)
  
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  const stats = await getDashboardStats(from, to)

  return (
    <div className="min-h-screen bg-slate-50 lg:ml-64 p-4 pt-20 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Dashboard</h1>
            <p className="text-slate-500 font-bold text-sm">Business overview for selected period.</p>
          </div>
          
          <form className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
            <input type="date" name="from" defaultValue={params.from || todayStr} className="text-xs font-bold uppercase text-slate-900 outline-none cursor-pointer bg-slate-50 p-2 rounded border border-slate-200" />
            <span className="text-slate-400 font-bold">-</span>
            <input type="date" name="to" defaultValue={params.to || todayStr} className="text-xs font-bold uppercase text-slate-900 outline-none cursor-pointer bg-slate-50 p-2 rounded border border-slate-200" />
            <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-black transition text-xs font-bold uppercase tracking-widest">Filter</button>
          </form>
        </div>

        {/* RESTORED: Clean, Horizontal Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Period Revenue</p>
                  <h2 className="text-xl font-black text-slate-900">PKR {stats.revenue.toLocaleString()}</h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <DollarSign size={20} />
              </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Period Profit ({stats.margin}%)</p>
                  <h2 className="text-xl font-black text-slate-900">PKR {stats.profit.toLocaleString()}</h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp size={20} />
              </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Invoices Generated</p>
                  <h2 className="text-xl font-black text-slate-900">{stats.salesCount} Sales</h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Package size={20} />
              </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center border-l-4 border-l-orange-500">
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Receivables</p>
                  <h2 className="text-xl font-black text-slate-900">PKR {stats.totalReceivable.toLocaleString()}</h2>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                  <ArrowLeftRight size={20} />
              </div>
          </div>

        </div>

      </div>
    </div>
  )
}