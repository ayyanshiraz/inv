'use client'

import { useState } from 'react'
import { saveProduct, deleteProduct } from '@/actions/actions'

export default function ProductManager({ products = [], categories = [] }: { products: any[], categories: any[] }) {
  const [formData, setFormData] = useState({ id: '', name: '', category: '', unit: 'Bags', cost: 0, price: 0 })
  const [isEditing, setIsEditing] = useState(false)
  const [originalId, setOriginalId] = useState('')

  const handleEdit = (prod: any) => {
    setFormData({ id: prod.id, name: prod.name, category: prod.category || '', unit: prod.unit || 'Bags', cost: prod.cost, price: prod.price })
    setOriginalId(prod.id)
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to delete this product?')) {
        const res = await deleteProduct(id)
        if (res?.error) {
            alert(res.error)
        }
    }
  }

  // Intercepts Enter key and moves focus instead of submitting early
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, nextFieldId: string) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (nextFieldId === 'submit') {
            document.getElementById('prod-submit-btn')?.click();
        } else {
            document.getElementById(nextFieldId)?.focus();
        }
    }
  }

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <div className="p-6 md:p-8 bg-white rounded-3xl shadow-xl border border-slate-200 mb-10">
        <h1 className="text-2xl font-black mb-6 text-slate-900 uppercase tracking-tight">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>
        
        <form action={async (data) => { 
            const res = await saveProduct(data); 
            if (res?.error) {
                alert(res.error)
            } else {
                alert('Saved successfully!'); 
                setFormData({id:'', name:'', category:'', unit:'Bags', cost:0, price:0}); 
                setIsEditing(false); 
                setOriginalId('');
                document.getElementById('prod-id')?.focus(); // Jump back to start
            }
        }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <input type="hidden" name="originalId" value={originalId} />

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Product ID</label>
            <input id="prod-id" type="text" name="id" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})}
              onKeyDown={(e) => handleKeyDown(e, 'prod-name')} placeholder="e.g. PRD-001"
              className="w-full rounded-xl border-2 bg-slate-50 border-slate-200 p-4 font-bold text-slate-900 outline-none focus:border-blue-600 uppercase"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Product Name</label>
            <input id="prod-name" type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
              onKeyDown={(e) => handleKeyDown(e, 'prod-category')} required placeholder="e.g. Mash Daal"
              className="w-full rounded-xl border-2 bg-slate-50 border-slate-200 p-4 font-bold text-slate-900 outline-none focus:border-blue-600 uppercase" />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Category</label>
            <select id="prod-category" name="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
              onKeyDown={(e) => handleKeyDown(e, 'prod-unit')}
              className="w-full rounded-xl border-2 bg-slate-50 border-slate-200 p-4 font-bold text-slate-900 outline-none focus:border-blue-600 uppercase">
              <option value="">No Category</option>
              {categories && categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Unit</label>
            <select id="prod-unit" name="unit" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}
              onKeyDown={(e) => handleKeyDown(e, 'prod-cost')}
              className="w-full rounded-xl border-2 bg-slate-50 border-slate-200 p-4 font-bold text-slate-900 outline-none focus:border-blue-600 uppercase">
              <option value="Bags">Bags</option>
              <option value="Kgs">Kgs</option>
            </select>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 gap-6 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-800 mb-2">Cost Price</label>
                <input id="prod-cost" type="number" name="cost" value={formData.cost} onChange={(e) => setFormData({...formData, cost: Number(e.target.value)})} 
                onKeyDown={(e) => handleKeyDown(e, 'prod-price')} placeholder="0"
                className="w-full rounded-xl border-2 bg-white border-emerald-300 p-4 font-black text-slate-900 outline-none focus:border-emerald-600 text-lg" />
            </div>
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-800 mb-2">Selling Price</label>
                <input id="prod-price" type="number" name="price" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} 
                onKeyDown={(e) => handleKeyDown(e, 'submit')} placeholder="0"
                className="w-full rounded-xl border-2 bg-white border-emerald-300 p-4 font-black text-emerald-700 outline-none focus:border-emerald-600 text-lg" />
            </div>
          </div>

          <div className="md:col-span-3 mt-4 flex gap-4">
              <button id="prod-submit-btn" type="submit" className="flex-1 py-4 px-4 rounded-xl shadow-lg font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-black transition">
                {isEditing ? 'Update Product' : 'Save Product'}
              </button>
              {isEditing && (
                  <button type="button" onClick={() => { setIsEditing(false); setFormData({id:'', name:'', category:'', unit:'Bags', cost:0, price:0}); setOriginalId(''); }} className="px-8 rounded-xl font-black uppercase tracking-widest text-slate-600 bg-slate-200 hover:bg-slate-300 transition">Cancel</button>
              )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b-2 border-slate-200">
            <tr><th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4 text-center">Unit</th><th className="p-4 text-right">Cost</th><th className="p-4 text-right">Price</th><th className="p-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
            {products && products.length > 0 ? products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-mono text-xs text-slate-400 uppercase">{p.id}</td>
                <td className="p-4 uppercase text-slate-900">{p.name}</td>
                <td className="p-4 uppercase">{p.category || '-'}</td>
                <td className="p-4 text-center uppercase text-xs">{p.unit || 'BAGS'}</td>
                <td className="p-4 text-right text-red-600">{p.cost.toLocaleString()}</td>
                <td className="p-4 text-right text-emerald-600 font-black">{p.price.toLocaleString()}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(p)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded mr-2 hover:bg-blue-100 uppercase text-[10px] font-black tracking-widest transition">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 uppercase text-[10px] font-black tracking-widest transition">Delete</button>
                </td>
              </tr>
            )) : <tr><td colSpan={7} className="p-8 text-center text-slate-400">No products found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}