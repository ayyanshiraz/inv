'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
    LayoutDashboard, Receipt, Undo2, Package, Users, BookOpen, 
    FileText, Tags, UserCog, LogOut, Menu, X, FileClock, Wallet, 
    ChevronDown, ChevronRight 
} from 'lucide-react'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // State to manage which dropdowns are open
  const [sections, setSections] = useState({
    main: true, // Main open by default
    inventory: false,
    customers: false,
    finance: false
  })

  // Toggle function for clicking
  const toggleSection = (sec: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [sec]: !prev[sec] }))
  }

  // Auto-close mobile menu on navigation & auto-expand active sections
  useEffect(() => {
    setIsOpen(false)
    
    // Smart expansion: Opens the folder you are currently inside
    if (pathname.includes('/product') || pathname.includes('/category/product')) {
        setSections(s => ({ ...s, inventory: true }))
    }
    if (pathname.includes('/customer') || pathname.includes('/category/customer')) {
        setSections(s => ({ ...s, customers: true }))
    }
    if (pathname.includes('/ledger') || pathname.includes('/receivables')) {
        setSections(s => ({ ...s, finance: true }))
    }
    if (pathname === '/' || pathname.includes('/invoice')) {
        setSections(s => ({ ...s, main: true }))
    }
  }, [pathname])

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1a1a1a] text-white flex items-center justify-between px-4 z-50 border-b border-slate-800">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs">FT</div>
            <h1 className="text-lg font-black uppercase tracking-tight">Fahad Traders</h1>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white transition">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* SIDEBAR */}
      <div className={`w-64 h-screen bg-[#1a1a1a] text-slate-400 fixed left-0 top-0 flex flex-col border-r border-slate-800 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        <div className="hidden lg:block p-8 border-b border-slate-800 bg-[#1a1a1a]">
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Fahad Traders</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Management System</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 mt-16 lg:mt-0 custom-scrollbar">
          
          {/* MAIN SECTION */}
          <button onClick={() => toggleSection('main')} className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg tracking-widest transition">
            <span>Main</span>
            {sections.main ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          
          {sections.main && (
            <div className="space-y-2 mt-2 mb-6 animate-fade-in">
              <Link href="/" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition font-bold"><LayoutDashboard size={18} /> Dashboard</Link>
              <Link href="/invoice/new" className="flex items-center gap-4 py-3 px-4 rounded-lg bg-slate-800 text-white font-bold shadow-md"><Receipt size={18} /> Sale Invoice</Link>
              <Link href="/invoice/return" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition font-bold"><Undo2 size={18} /> Returns</Link>
              <Link href="/invoices" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition font-bold"><FileText size={18} /> All Invoices</Link>
              <Link href="/invoice/hold" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-orange-400 hover:text-orange-300 transition font-bold"><FileClock size={18} /> Quotations / Hold</Link>
            </div>
          )}
          
          {/* INVENTORY SECTION */}
          <button onClick={() => toggleSection('inventory')} className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg tracking-widest transition">
            <span>Inventory</span>
            {sections.inventory ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {sections.inventory && (
            <div className="space-y-2 mt-2 mb-6 animate-fade-in">
              <Link href="/products" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition font-bold"><Package size={18} /> Products</Link>
              <Link href="/category/product" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition font-bold"><Tags size={18} /> Categories</Link>
            </div>
          )}

          {/* CUSTOMERS SECTION */}
          <button onClick={() => toggleSection('customers')} className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg tracking-widest transition">
            <span>Customers</span>
            {sections.customers ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {sections.customers && (
            <div className="space-y-2 mt-2 mb-6 animate-fade-in">
              <Link href="/customers" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition font-bold"><Users size={18} /> Customers</Link>
              <Link href="/category/customer" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition font-bold"><UserCog size={18} /> Cust. Categories</Link>
            </div>
          )}
          
          {/* FINANCE SECTION */}
          <button onClick={() => toggleSection('finance')} className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg tracking-widest transition">
            <span>Finance</span>
            {sections.finance ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {sections.finance && (
            <div className="space-y-2 mt-2 mb-6 animate-fade-in">
              <Link href="/ledger" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition font-bold"><BookOpen size={18} /> Ledger</Link>
              <Link href="/receivables" className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition font-bold"><Wallet size={18} /> Receivables</Link>
            </div>
          )}

        </nav>

        <div className="p-4 border-t border-slate-800 bg-[#1a1a1a]">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs">FT</div>
                  <div>
                      <p className="text-xs font-bold text-white">Admin</p>
                      <p className="text-[10px] text-slate-500 uppercase">System Active</p>
                  </div>
              </div>
              
              <Link href="/logout" className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-800 rounded-lg transition" title="Logout">
                  <LogOut size={18} />
              </Link>
          </div>
        </div>
      </div>
    </>
  )
}