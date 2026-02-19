'use client'

import { useState } from 'react'
import { saveProduct, deleteProduct } from '@/actions/actions'
import { Edit, Trash2 } from 'lucide-react'

export default function ProductManager({ products, categories }: { products: any[], categories: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    // FIX: Added 'max-w-5xl mx-auto' to prevent infinite stretching
    <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-lg border border-slate-200">
      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">
        {editingId ? 'Edit Product' : 'Add New Product'}
      </h2>

      <form action={saveProduct} className="flex flex-col gap-5 mb-12" onSubmit={() => setTimeout(() => setEditingId(null), 100)}>
        <input 
            type="text" 
            name="id" 
            placeholder="Product Code / ID" 
            defaultValue={editingId || ''} 
            readOnly={!!editingId}
            className={`p-4 border-2 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 placeholder:text-slate-400 ${editingId ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`}
            required 
        />
        <input 
            type="text" 
            name="name" 
            placeholder="Product Name" 
            defaultValue={editingId ? products.find(p => p.id === editingId)?.name : ''}
            className="p-4 border-2 bg-slate-50 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 placeholder:text-slate-400"
            required 
        />
        <select 
            name="category" 
            defaultValue={editingId ? products.find(p => p.id === editingId)?.category : ''}
            className="p-4 border-2 bg-slate-50 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600"
            required
        >
          <option value="" disabled>Select Category</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        
        <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Cost Price (Purchase Price)</label>
            <input 
                type="number" 
                name="cost" 
                placeholder="0"
                defaultValue={editingId ? products.find(p => p.id === editingId)?.cost : ''}
                className="w-full p-4 border-2 bg-slate-50 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 placeholder:text-slate-400"
            />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4">
            <button type="submit" className="flex-1 bg-slate-900 text-white font-black uppercase tracking-widest p-5 rounded-xl hover:bg-black transition shadow-xl">
                Save Product
            </button>
            {editingId && (
                <button type="button" onClick={() => setEditingId(null)} className="flex-1 bg-slate-200 text-slate-700 font-black uppercase tracking-widest p-5 rounded-xl hover:bg-slate-300 transition">
                    Cancel Edit
                </button>
            )}
        </div>
      </form>

      {/* Scrollable Table Wrapper */}
      <div className="overflow-x-auto border-t-2 border-slate-100 pt-8">
        <table className="w-full min-w-[600px] text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="pb-4 px-2">Code / ID</th>
              <th className="pb-4 px-2">Name</th>
              <th className="pb-4 px-2">Category</th>
              <th className="pb-4 px-2">Cost</th>
              <th className="pb-4 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-bold text-slate-700 divide-y divide-slate-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition">
                <td className="py-5 px-2 text-slate-400 font-mono">{p.id}</td>
                <td className="py-5 px-2 uppercase text-slate-900">{p.name}</td>
                <td className="py-5 px-2">{p.category}</td>
                <td className="py-5 px-2 text-emerald-600 font-black">PKR {p.cost}</td>
                <td className="py-5 px-2 flex justify-end gap-3">
                  <button onClick={() => setEditingId(p.id)} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition" title="Edit">
                      <Edit size={18} />
                  </button>
                  <form action={deleteProduct.bind(null, p.id)}>
                      <button className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition" title="Delete">
                          <Trash2 size={18} />
                      </button>
                  </form>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
                <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-bold">No products found. Add your first item above.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}