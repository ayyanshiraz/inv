'use client'

import { useState } from 'react'
import { saveProduct, deleteProduct, bulkUpdateProductPrices } from '@/actions/actions'
import { Edit, Trash2, Search, Zap, Save } from 'lucide-react'

export default function ProductManager({ products, categories }: { products: any[], categories: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  
  // NEW: Quick Price Edit State
  const [bulkEditMode, setBulkEditMode] = useState(false)
  const [draftPrices, setDraftPrices] = useState<Record<string, number>>({})

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase()
    return (
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
  })

  // NEW: Save spreadsheet prices
  const handleSaveBulkPrices = async () => {
    const updates = Object.keys(draftPrices).map(id => ({
      id,
      price: draftPrices[id]
    }))

    if (updates.length > 0) {
      await bulkUpdateProductPrices(updates)
      alert('All prices updated successfully!')
    }
    setBulkEditMode(false)
    setDraftPrices({})
  }

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-lg border border-slate-200">
      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">
        {editingId ? 'Edit Product' : 'Add New Product'}
      </h2>

      <form action={saveProduct} className="flex flex-col gap-5 mb-12" onSubmit={() => setTimeout(() => setEditingId(null), 100)}>
        <input type="text" name="id" placeholder="Product Code / ID" defaultValue={editingId || ''} readOnly={!!editingId}
            className={`p-4 border-2 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 placeholder:text-slate-400 ${editingId ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`} required />
        <input type="text" name="name" placeholder="Product Name" defaultValue={editingId ? products.find(p => p.id === editingId)?.name : ''}
            className="p-4 border-2 bg-slate-50 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 placeholder:text-slate-400" required />
        <select name="category" defaultValue={editingId ? products.find(p => p.id === editingId)?.category : ''}
            className="p-4 border-2 bg-slate-50 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600" required>
          <option value="" disabled>Select Category</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        
        <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Cost Price (Purchase)</label>
                <input type="number" name="cost" placeholder="0" defaultValue={editingId ? products.find(p => p.id === editingId)?.cost : ''}
                    className="w-full p-4 border-2 bg-slate-50 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 placeholder:text-slate-400" />
            </div>
            <div className="flex-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Default Selling Price</label>
                <input type="number" name="price" placeholder="0" defaultValue={editingId ? products.find(p => p.id === editingId)?.price : ''}
                    className="w-full p-4 border-2 bg-slate-50 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 placeholder:text-slate-400" />
            </div>
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

      <div className="border-t-2 border-slate-100 pt-8">
        
        {/* TOP BAR: Search & Bulk Edit Toggles */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
            <h2 className="text-xl font-black text-slate-900 uppercase">Existing Products</h2>
            
            <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
                <div className="relative w-full md:w-64">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 p-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 transition"
                    />
                </div>

                {/* SPREADSHEET BUTTONS */}
                <div className="flex gap-2 w-full md:w-auto">
                    <button 
                        onClick={() => { setBulkEditMode(!bulkEditMode); setDraftPrices({}) }} 
                        className={`flex items-center justify-center gap-2 w-full md:w-auto px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition ${bulkEditMode ? 'bg-slate-900 text-white shadow-lg' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`}
                    >
                        <Zap size={14} /> {bulkEditMode ? 'Cancel Edit' : 'Quick Price Edit'}
                    </button>

                    {bulkEditMode && (
                        <button 
                            onClick={handleSaveBulkPrices} 
                            style={{ backgroundColor: '#059669', color: 'white' }}
                            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:opacity-80 transition shadow-lg animate-fade-in"
                        >
                            <Save size={14} /> Save Prices
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
                <tr className="border-b-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="pb-4 px-2">Code / ID</th>
                <th className="pb-4 px-2">Name</th>
                <th className="pb-4 px-2">Category</th>
                <th className="pb-4 px-2">Cost Price</th>
                <th className={`pb-4 px-2 ${bulkEditMode ? 'text-emerald-700 bg-emerald-50 rounded-t-lg border-b-4 border-emerald-400' : ''}`}>
                    {bulkEditMode ? 'ENTER NEW SELLING PRICE' : 'Selling Price'}
                </th>
                <th className="pb-4 px-2 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="text-sm font-bold text-slate-700 divide-y divide-slate-50">
                {filteredProducts.map((p, index) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-5 px-2 text-slate-400 font-mono">{p.id}</td>
                    <td className="py-5 px-2 uppercase text-slate-900">{p.name}</td>
                    <td className="py-5 px-2">{p.category}</td>
                    <td className="py-5 px-2 text-orange-600 font-black">PKR {p.cost}</td>
                    
                    {/* DYNAMIC SPREADSHEET SELLING PRICE COLUMN */}
                    <td className={`py-3 px-2 ${bulkEditMode ? 'bg-emerald-50' : ''}`}>
                        {bulkEditMode ? (
                            <input
                                id={`price-input-${index}`}
                                type="number"
                                className="w-24 p-2 text-left border-2 border-emerald-300 rounded-lg font-black text-slate-900 outline-none focus:border-emerald-600 bg-white shadow-sm"
                                value={draftPrices[p.id] !== undefined ? draftPrices[p.id] : (p.price || 0)}
                                onChange={(e) => setDraftPrices({...draftPrices, [p.id]: Number(e.target.value)})}
                                onFocus={(e) => e.target.select()}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const nextField = document.getElementById(`price-input-${index + 1}`);
                                        if (nextField) {
                                            nextField.focus(); // Jump down
                                        } else {
                                            handleSaveBulkPrices(); // Auto-save if last!
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <span className="text-emerald-600 font-black">PKR {p.price || 0}</span>
                        )}
                    </td>

                    <td className="py-5 px-2 flex justify-end gap-3">
                        <button onClick={() => { setEditingId(p.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition" disabled={bulkEditMode} title="Edit"><Edit size={18} /></button>
                        <form action={deleteProduct.bind(null, p.id)}>
                            <button className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition" disabled={bulkEditMode} title="Delete"><Trash2 size={18} /></button>
                        </form>
                    </td>
                </tr>
                ))}
                {filteredProducts.length === 0 && (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-bold">No products found matching "{searchQuery}"</td></tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  )
}