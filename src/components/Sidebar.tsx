'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Package, FileText, CornerDownLeft, HandCoins, LogOut, Tags, Receipt, BookOpen, Clock } from 'lucide-react'
import { logoutUser } from '@/actions/actions'
import { useEffect, useState } from 'react'

const navGroups = [
  {
    title: 'MAIN',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Sale Invoice', href: '/invoice/new', icon: Receipt },
      { name: 'Returns', href: '/invoice/return', icon: CornerDownLeft },
      { name: 'All Invoices', href: '/invoices', icon: FileText },
      { name: 'Quotations / Hold', href: '/invoice/hold', icon: Clock, color: 'text-orange-500' },
    ]
  },
  {
    title: 'INVENTORY',
    items: [
      { name: 'Add Product', href: '/products', icon: Package },
      { name: 'Categories', href: '/category/product', icon: Tags },
    ]
  },
  {
    title: 'CUSTOMERS',
    items: [
      { name: 'Add Customer', href: '/customers', icon: Users },
      { name: 'Categories', href: '/category/customer', icon: Tags },
    ]
  },
  {
    title: 'FINANCE',
    items: [
      { name: 'Ledger', href: '/ledger', icon: BookOpen },
      { name: 'Receivables', href: '/receivables', icon: HandCoins },
    ]
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const [username, setUsername] = useState('Admin')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
            const data = await res.json();
            if (data && typeof data.username === 'string' && data.username.trim() !== '') {
                setUsername(data.username.charAt(0).toUpperCase() + data.username.slice(1).toLowerCase());
            }
        }
      } catch (err) {
        console.error("API bypass active. Defaulting to Admin.");
      }
    };
    fetchUser();
  }, []);

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen fixed top-0 left-0 flex flex-col border-r border-slate-800 shadow-2xl z-[999]">
      
      <div className="p-8 pt-10 pb-6 border-b border-slate-800">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-1">Fahad<br/>Traders</h1>
        <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mt-2">Management System</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            <h2 className="px-4 text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">
              {group.title}
            </h2>
            <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (pathname.startsWith('/invoice/edit') && item.href === '/invoices')
                  const Icon = item.icon
                  return (
                    <Link key={item.name} href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                        ${isActive 
                          ? 'bg-slate-800 text-white font-black shadow-lg shadow-black/20' 
                          : `font-bold text-slate-400 hover:bg-slate-800/50 hover:text-white ${item.color || ''}`
                        }`}
                    >
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-r-full" />}
                      <Icon size={18} className={`${isActive ? (item.color ? item.color : 'text-blue-500') : 'group-hover:scale-110 transition-transform'}`} />
                      <span className="text-sm tracking-wide">{item.name}</span>
                    </Link>
                  )
                })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-black shadow-lg">
              {username.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-black text-white">{username}</p>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">System Active</p>
            </div>
          </div>
          <form action={logoutUser}>
            <button className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors" title="Secure Logout">
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </div>
      
    </aside>
  )
}