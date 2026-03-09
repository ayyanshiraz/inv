'use client'

import { useState } from 'react'
import { saveCustomer, deleteCustomer } from '@/actions/actions'

export default function CustomerManager({ customers = [], categories = [] }: { customers: any[], categories: any[] }) {
  const [formData, setFormData] = useState<{id: string, name: string, phone: string, address: string, category: string, openingBalance: number | ''}>({ id: '', name: '', phone: '', address: '', category: '', openingBalance: 0 })
  const [isEditing, setIsEditing] = useState(false)
  const [originalId, setOriginalId] = useState('')

  const handleEdit = (cust: any) => {
    setFormData({ id: cust.id, name: cust.name, phone: cust.phone || '', address: cust.address || '', category: cust.category || '', openingBalance: cust.openingBalance || 0 })
    setOriginalId(cust.id)
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to delete this customer?')) {
        const res = await deleteCustomer(id)
        if (res?.error) {
            alert(res.error)
        }
    }
  }

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <div className="p-6 md:p-8 bg-white rounded-3xl shadow-xl border border-slate-200 mb-10">
        <h1 className="text-2xl font-black mb-6 text-slate-900 uppercase tracking-tight">
          {isEditing ? 'Edit Customer' : 'Add New Customer'}
        </h1>
        
        <form action={async (data) => { 
            const res = await saveCustomer(data); 
            if (res?.error) {
                alert(res.error)
            } else {
                alert('Saved successfully!'); 
                setFormData({id:'', name:'', phone:'', address:'', category:'', openingBalance:0}); 
                setIsEditing(false); 
                setOriginalId('');
            }
        }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <input type="hidden" name="originalId" value={originalId} />

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Primary ID</label>
            <input type="text" name="id" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})}
              readOnly={isEditing} placeholder="e.g. CUST-001"
              className={`w-full rounded-xl border-2 p-4 font-bold outline-none transition uppercase ${isEditing ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'}`}
            />
            {isEditing && <p className="text-[10px] text-red-500 font-bold mt-1">ID cannot be changed during editing to protect ledger history.</p>}
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Customer Name</label>
            <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Ali Khan"
              className="w-full rounded-xl border-2 bg-slate-50 border-slate-200 p-4 font-bold text-slate-900 outline-none focus:border-blue-600 uppercase" />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Phone Number</label>
            <input type="text" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="e.g. 0300-1234567"
              className="w-full rounded-xl border-2 bg-slate-50 border-slate-200 p-4 font-bold text-slate-900 outline-none focus:border-blue-600" />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Category</label>
            <select name="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full rounded-xl border-2 bg-slate-50 border-slate-200 p-4 font-bold text-slate-900 outline-none focus:border-blue-600 uppercase">
              <option value="">No Category</option>
              {categories && categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Address</label>
            <input type="text" name="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Customer Address"
              className="w-full rounded-xl border-2 bg-slate-50 border-slate-200 p-4 font-bold text-slate-900 outline-none focus:border-blue-600" />
          </div>

          <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-200">
            <label className="block text-[10px] font-black uppercase tracking-widest text-blue-800 mb-2">Opening Balance (PKR)</label>
            <input type="number" name="openingBalance" value={formData.openingBalance} onChange={(e) => setFormData({...formData, openingBalance: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="0"
              className="w-full rounded-xl border-2 bg-white border-blue-300 p-4 font-black text-blue-900 outline-none focus:border-blue-600 text-lg" />
          </div>

          <div className="md:col-span-2 mt-4 flex gap-4">
              <button type="submit" className="flex-1 py-4 px-4 rounded-xl shadow-lg font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-black transition">
                {isEditing ? 'Update Customer' : 'Save Customer'}
              </button>
              {isEditing && (
                  <button type="button" onClick={() => { setIsEditing(false); setFormData({id:'', name:'', phone:'', address:'', category:'', openingBalance:0}); }} className="px-8 rounded-xl font-black uppercase tracking-widest text-slate-600 bg-slate-200 hover:bg-slate-300 transition">Cancel</button>
              )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b-2 border-slate-200">
            <tr><th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4">Phone</th><th className="p-4 text-right">Opening Bal</th><th className="p-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
            {customers && customers.length > 0 ? customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-mono text-xs text-slate-400 uppercase">{c.id}</td>
                <td className="p-4 uppercase text-slate-900">{c.name}</td>
                <td className="p-4 uppercase">{c.category || '-'}</td>
                <td className="p-4">{c.phone || '-'}</td>
                <td className="p-4 text-right text-blue-600">PKR {c.openingBalance?.toLocaleString()}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(c)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded mr-2 hover:bg-blue-100 uppercase text-[10px] font-black tracking-widest transition">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 uppercase text-[10px] font-black tracking-widest transition">Delete</button>
                </td>
              </tr>
            )) : <tr><td colSpan={6} className="p-8 text-center text-slate-400">No customers found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}