'use client'

import { login } from '@/actions/auth'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4">
      <div className="bg-white w-full max-w-md p-10 rounded-3xl shadow-2xl">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
                Fahad<span className="text-blue-600">Traders</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Secure Access Portal</p>
        </div>

        <form action={login} className="space-y-6">
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Username</label>
                <input 
                    name="username" 
                    type="text" 
                    placeholder="Enter Admin ID"
                    // FIXED: Added text-slate-900 to make text dark and visible
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 transition"
                    required
                />
            </div>
            
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Password</label>
                <input 
                    name="password" 
                    type="password" 
                    placeholder="••••••••"
                    // FIXED: Added text-slate-900
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 transition"
                    required
                />
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-black transition shadow-lg">
                Authenticate
            </button>
        </form>
        
        <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Restricted System • Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  )
}