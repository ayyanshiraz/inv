'use client'

import { useState } from 'react'

export default function CategoryManager({ 
  title, 
  categories, 
  saveAction,
  deleteAction 
}: { 
  title: string, 
  categories: any[], 
  saveAction: (formData: FormData) => Promise<void>,
  deleteAction: (id: string) => Promise<void>
}) {
  const [formData, setFormData] = useState({ id: '', name: '' })
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = (cat: any) => {
    setFormData({ id: cat.id, name: cat.name })
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if(confirm(`Are you sure you want to delete this ${title}?`)) {
        await deleteAction(id)
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      
      {/* FORM */}
      <div className="p-6 bg-white rounded-xl shadow-lg border border-slate-200 mb-10">
        <h1 className="text-2xl font-black mb-6 text-slate-900 uppercase tracking-tight">
          {isEditing ? `Edit ${title}` : `Add ${title}`}
        </h1>
        
        <form action={async (data) => { await saveAction(data); alert('Saved Successfully!'); setFormData({id:'', name:''}); setIsEditing(false); }} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Category ID (Optional)</label>
            <input 
              type="text" name="id" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})}
              readOnly={isEditing} placeholder="Leave blank to auto-generate"
              className={`w-full rounded-lg border-2 p-4 font-bold text-slate-900 outline-none transition ${isEditing ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-50 border-slate-200 focus:border-blue-600'}`}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Category Name</label>
            <input 
              type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              required placeholder="e.g. VIP Customer or Daal"
              className="w-full rounded-lg border-2 bg-slate-50 border-slate-200 p-4 font-bold text-slate-900 outline-none focus:border-blue-600 transition"
            />
          </div>

          <button type="submit" className="w-full py-4 px-4 rounded-xl shadow-lg font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-black transition">
            {isEditing ? 'Update Category' : 'Save Category'}
          </button>
        </form>
      </div>

      {/* LIST */}
      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">Existing Categories</h2>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b-2 border-slate-200">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-xs font-mono text-slate-400">{c.id}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 uppercase">{c.name}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                  <button type="button" onClick={() => handleEdit(c)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-bold text-xs uppercase tracking-widest transition">Edit</button>
                  <button type="button" onClick={() => handleDelete(c.id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold text-xs uppercase tracking-widest transition">Delete</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
                <tr><td colSpan={3} className="p-8 text-center text-slate-400 font-bold">No categories found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}