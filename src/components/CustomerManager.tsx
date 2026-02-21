'use client'

import { useState } from 'react'
import { saveCustomer, deleteCustomer } from '@/actions/actions'
import { Search } from 'lucide-react'

export default function CustomerManager({ customers, categories }: { customers: any[], categories: any[] }) {
  const [formData, setFormData] = useState({ id: '', name: '', phone: '', address: '', category: '', openingBalance: '' })
  const [isEditing, setIsEditing] = useState(false)
  
  // NEW: Search State
  const [searchQuery, setSearchQuery] = useState('')

  const handleEdit = (customer: any) => {
    setFormData({
      id: customer.id, name: customer.name, phone: customer.phone || '', address: customer.address || '',
      category: customer.category || '',
      openingBalance: customer.openingBalance?.toString() || '0'
    })
    setIsEditing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to delete this customer?')) await deleteCustomer(id)
  }

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value })

  // NEW: Real-time filtering logic
  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase()
    return (
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q))
    )
  })

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-lg border border-slate-200">
      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">
        {isEditing ? 'Edit Customer' : 'Customer Feeding'}
      </h2>
      
      <form action={async (data) => { await saveCustomer(data); setFormData({id:'', name:'', phone:'', address:'', category:'', openingBalance:''}); setIsEditing(false); }} className="space-y-4 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Customer ID</label>
            <input type="text" name="id" value={formData.id} onChange={handleChange} readOnly={isEditing} required placeholder="e.g. CUST-001" className={`w-full p-4 border-2 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 ${isEditing ? 'bg-slate-100' : 'bg-slate-50'}`} />
          </div>
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Customer Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. John Doe" className="w-full p-4 border-2 bg-slate-50 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full p-4 border-2 bg-slate-50 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600">
                <option value="">-- Select Category --</option>
                {categories.map((cat: any) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
          </div>
          <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Opening Balance (If Any)</label>
              <input type="number" name="openingBalance" value={formData.openingBalance} onChange={handleChange} placeholder="0" className="w-full p-4 border-2 bg-slate-50 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Phone</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="0300-1234567" className="w-full p-4 border-2 bg-slate-50 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600" />
          </div>
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Store location..." className="w-full p-4 border-2 bg-slate-50 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600" />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
            <button type="submit" className="flex-1 bg-slate-900 text-white font-black uppercase tracking-widest p-5 rounded-xl hover:bg-black transition shadow-xl">
              {isEditing ? 'Update Customer' : 'Save Customer'}
            </button>
            {isEditing && (
                <button type="button" onClick={() => { setIsEditing(false); setFormData({id:'', name:'', phone:'', address:'', category:'', openingBalance:''}) }} className="flex-1 bg-slate-200 text-slate-700 font-black uppercase tracking-widest p-5 rounded-xl hover:bg-slate-300 transition">
                    Cancel
                </button>
            )}
        </div>
      </form>

      <div className="border-t-2 border-slate-100 pt-8">
        
        {/* NEW: SEARCH BAR UI */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-black text-slate-900 uppercase">Existing Customers</h2>
            <div className="relative w-full md:w-72">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search customers..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 p-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 transition"
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
                <tr className="border-b-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="pb-4 px-2">ID</th><th className="pb-4 px-2">Name</th><th className="pb-4 px-2">Category</th><th className="pb-4 px-2">Phone</th><th className="pb-4 px-2">Opening Bal.</th><th className="pb-4 px-2 text-right">Action</th>
                </tr>
            </thead>
            <tbody className="text-sm font-bold text-slate-700 divide-y divide-slate-50">
                {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-5 px-2 text-slate-400 font-mono">{c.id}</td>
                    <td className="py-5 px-2 uppercase text-slate-900">{c.name}</td>
                    <td className="py-5 px-2 text-slate-500">{c.category || 'N/A'}</td>
                    <td className="py-5 px-2 text-blue-700">{c.phone}</td>
                    <td className="py-5 px-2 text-orange-600">PKR {c.openingBalance || 0}</td>
                    <td className="py-5 px-2 text-right">
                    <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-900 text-xs uppercase tracking-widest mr-4">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-900 text-xs uppercase tracking-widest">Delete</button>
                    </td>
                </tr>
                ))}
                {filteredCustomers.length === 0 && (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-bold">No customers found matching "{searchQuery}"</td></tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  )
}