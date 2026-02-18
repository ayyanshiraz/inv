import Link from 'next/link'
import { LayoutDashboard, Receipt, Undo2, Package, Users, BookOpen, FileText, Tags, UserCog, LogOut } from 'lucide-react'
import { logout } from '@/actions/auth' // Import the logout action

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-[#1a1a1a] text-slate-400 fixed left-0 top-0 flex flex-col border-r border-slate-800 z-50">
      
      {/* Brand Header */}
      <div className="p-8 border-b border-slate-800 bg-[#1a1a1a]">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Fahad Traders</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Management System</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        
        {/* MAIN */}
        <div className="px-4 mb-2 text-[10px] font-black uppercase text-slate-600 tracking-widest">Main</div>
        <Link href="/" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition font-bold">
            <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link href="/invoice/new" className="flex items-center gap-4 py-3 px-4 rounded-lg bg-slate-800 text-white font-bold shadow-md">
            <Receipt size={18} /> Sale Invoice
        </Link>
        <Link href="/invoice/return" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition font-bold">
            <Undo2 size={18} /> Returns
        </Link>
        <Link href="/invoices" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition font-bold">
            <FileText size={18} /> All Invoices
        </Link>
        
        {/* INVENTORY */}
        <div className="pt-6 pb-2 px-4 text-[10px] font-black uppercase text-slate-600 tracking-widest">Inventory</div>
        <Link href="/products" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition font-bold">
            <Package size={18} /> Products
        </Link>
        <Link href="/category/product" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition font-bold">
            <Tags size={18} /> Categories
        </Link>

        {/* CUSTOMERS */}
        <div className="pt-6 pb-2 px-4 text-[10px] font-black uppercase text-slate-600 tracking-widest">Customers</div>
        <Link href="/customers" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition font-bold">
            <Users size={18} /> Customers
        </Link>
        <Link href="/category/customer" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition font-bold">
            <UserCog size={18} /> Cust. Categories
        </Link>
        
        {/* FINANCE */}
        <div className="pt-6 pb-2 px-4 text-[10px] font-black uppercase text-slate-600 tracking-widest">Finance</div>
        <Link href="/ledger" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition font-bold">
            <BookOpen size={18} /> Ledger
        </Link>
      </nav>

      {/* Footer / User Profile / LOGOUT */}
      <div className="p-4 border-t border-slate-800 bg-[#1a1a1a]">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs">FT</div>
                <div>
                    <p className="text-xs font-bold text-white">Admin</p>
                    <p className="text-[10px] text-slate-500 uppercase">Fahad Traders</p>
                </div>
            </div>
            
            {/* LOGOUT BUTTON */}
            <form action={logout}>
                <button 
                    type="submit"
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-800 rounded-lg transition"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </form>
        </div>
      </div>
    </div>
  )
}