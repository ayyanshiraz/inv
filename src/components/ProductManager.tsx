'use client'

import { useState } from 'react'
import { Search, Zap, Save, Trash2, Edit } from 'lucide-react'
import { saveProduct, deleteProduct } from '@/actions/actions' 

export default function ProductManager({ products = [], categories = [] }: { products: any[], categories: any[] }) {
  const [search, setSearch] = useState('')
  const [quickEditMode, setQuickEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingOriginalId, setEditingOriginalId] = useState('')

  const [draftCosts, setDraftCosts] = useState<Record<string, number>>({})
  const [draftPrices, setDraftPrices] = useState<Record<string, number>>({})

  const [newId, setNewId] = useState('')
  const [newName, setNewName] = useState('')
  const [newCat, setNewCat] = useState('')
  const [newUnit, setNewUnit] = useState('توڑے') 
  const [newCost, setNewCost] = useState('')
  const [newPrice, setNewPrice] = useState('')

  const units = ['توڑے', 'کلو', 'BAGS', 'KGS', 'CARTONS', 'PCS', 'DOZEN']

  const filteredProducts = products.filter(p => {
      const q = search.toLowerCase()
      return (p.name || '').toLowerCase().includes(q) || (p.id || '').toLowerCase().includes(q)
  })

  const handleEditClick = (p: any) => {
      setEditingOriginalId(p.id)
      setNewId(p.id)
      setNewName(p.name)
      setNewCat(p.category || '')
      setNewUnit(p.unit || 'توڑے')
      setNewCost(p.cost?.toString() || '0')
      setNewPrice(p.price?.toString() || '0')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      document.getElementById('new-name')?.focus()
  }

  const handleCancelEdit = () => {
      setEditingOriginalId('')
      setNewId(''); setNewName(''); setNewCat(''); setNewUnit('توڑے'); setNewCost(''); setNewPrice('');
  }

  const handleAddProduct = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSaving(true)
      try {
          const formData = new FormData()
          if (editingOriginalId) formData.append('originalId', editingOriginalId)
          if (newId) formData.append('id', newId)
          formData.append('name', newName)
          formData.append('category', newCat)
          formData.append('unit', newUnit)
          formData.append('cost', newCost || '0')
          formData.append('price', newPrice || '0')
          
          await saveProduct(formData)
          
          handleCancelEdit()
          alert(editingOriginalId ? 'Product updated successfully!' : 'Product added successfully!')
      } catch (err) {
          alert('Error saving product.')
      } finally {
          setIsSaving(false)
      }
  }

  const handleSaveQuickEdits = async () => {
      setIsSaving(true)
      try {
          for (const p of filteredProducts) {
              const updatedCost = draftCosts[p.id] !== undefined ? draftCosts[p.id] : p.cost
              const updatedPrice = draftPrices[p.id] !== undefined ? draftPrices[p.id] : p.price
              
              if (updatedCost !== p.cost || updatedPrice !== p.price) {
                  const formData = new FormData()
                  formData.append('originalId', p.id)
                  formData.append('id', p.id)
                  formData.append('name', p.name)
                  formData.append('category', p.category || '')
                  formData.append('unit', p.unit || 'Bags')
                  formData.append('cost', updatedCost.toString())
                  formData.append('price', updatedPrice.toString())
                  
                  await saveProduct(formData)
              }
          }
          alert('All prices updated successfully!')
          setQuickEditMode(false)
          setDraftCosts({})
          setDraftPrices({})
      } catch (err) {
          alert('Error saving updates.')
      } finally {
          setIsSaving(false)
      }
  }

  const handleDelete = async (id: string) => {
      if(confirm('Are you sure you want to delete this product?')) {
          await deleteProduct(id)
      }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, nextFieldId: string) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (nextFieldId === 'submit') document.getElementById('prod-submit-btn')?.click();
        else document.getElementById(nextFieldId)?.focus();
    }
  }

  return (
    <div className="w-full space-y-8 relative">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
          @font-face { font-family: 'Jameel Noori Nastaleeq'; src: local('Jameel Noori Nastaleeq'), local('Jameel Noori Nastaleeq Regular'); }
          .urdu-font { font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', sans-serif !important; line-height: 2 !important; }
        `}</style>

        <form onSubmit={handleAddProduct} className={`bg-white p-6 md:p-8 rounded-3xl shadow-xl border ${editingOriginalId ? 'border-blue-400 ring-4 ring-blue-50' : 'border-slate-200'}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase text-slate-900">{editingOriginalId ? 'Edit Product' : 'Add New Product'}</h2>
                {editingOriginalId && <button type="button" onClick={handleCancelEdit} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800">Cancel Edit</button>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Product ID (Optional)</label>
                    <input id="new-id" type="text" value={newId} onChange={e => setNewId(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'new-name')} placeholder="E.G. PRD-001" className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 uppercase" />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Product Name</label>
                    <input id="new-name" type="text" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'new-cat')} required dir="ltr" placeholder="E.G. MASH DAAL" className="urdu-font text-left w-full p-3 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-900 outline-none focus:border-blue-600 transition uppercase" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Category</label>
                    <select id="new-cat" value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'new-unit')} className="urdu-font text-left w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 uppercase">
                        <option value="">No Category</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Unit</label>
                    <select id="new-unit" value={newUnit} onChange={e => setNewUnit(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'new-cost')} className="urdu-font text-left w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 uppercase">
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="text-[10px] font-black uppercase text-emerald-700 mb-2 block">Cost Price (PKR)</label>
                    <input id="new-cost" type="number" value={newCost} onChange={e => setNewCost(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'new-price')} placeholder="0" className="w-full p-3 bg-white border border-emerald-300 rounded-xl font-black text-slate-900 outline-none focus:border-emerald-600" />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-emerald-700 mb-2 block">Selling Price (PKR)</label>
                    <input id="new-price" type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'submit')} placeholder="0" className="w-full p-3 bg-white border border-emerald-300 rounded-xl font-black text-emerald-700 outline-none focus:border-emerald-600" />
                </div>
            </div>

            <button id="prod-submit-btn" type="submit" disabled={isSaving} className={`w-full py-4 text-white rounded-xl font-black uppercase tracking-widest transition disabled:opacity-50 ${editingOriginalId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-black'}`}>
                {isSaving ? 'Saving...' : (editingOriginalId ? 'Update Product' : 'Save Product')}
            </button>
        </form>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-72">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search product or ID..." value={search} onChange={e => setSearch(e.target.value)} dir="ltr" className="urdu-font text-left w-full pl-10 p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600" />
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    {!quickEditMode ? (
                        <button type="button" onClick={() => setQuickEditMode(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200">
                            <Zap size={16} /> Quick Edit Prices
                        </button>
                    ) : (
                        <>
                            <button type="button" onClick={() => { setQuickEditMode(false); setDraftCosts({}); setDraftPrices({}); }} className="px-6 py-3 rounded-xl text-xs font-black uppercase bg-slate-200 text-slate-700 hover:bg-slate-300">Cancel</button>
                            <button type="button" onClick={handleSaveQuickEdits} disabled={isSaving} className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg">
                                <Save size={16} /> {isSaving ? 'Saving...' : 'Save Edits'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b-2 border-slate-200">
                        <tr>
                            <th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4 text-center">Unit</th>
                            <th className={`p-4 text-right ${quickEditMode ? 'bg-orange-100 text-orange-800 border-b-4 border-orange-400' : ''}`}>Cost</th>
                            <th className={`p-4 text-right ${quickEditMode ? 'bg-emerald-100 text-emerald-800 border-b-4 border-emerald-400' : ''}`}>Price</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-bold text-slate-700 divide-y divide-slate-100">
                        {filteredProducts.map((p, index) => (
                            <tr key={p.id} className="hover:bg-slate-50 transition">
                                <td className="p-4 font-mono text-xs uppercase">{p.id.slice(-6)}</td>
                                <td className="p-4 urdu-font text-slate-900 font-black text-base" dir="ltr">{p.name}</td>
                                <td className="p-4 urdu-font" dir="ltr">{p.category || '---'}</td>
                                <td className="p-4 text-center"><span className="urdu-font text-left text-[10px] bg-slate-200 px-2 py-1 rounded text-slate-600">{p.unit}</span></td>
                                
                                <td className={`p-4 text-right ${quickEditMode ? 'bg-orange-50' : ''}`}>
                                    {quickEditMode ? (
                                        <input type="number" id={`cost-${index}`} className="w-24 p-2 text-right border-2 border-orange-300 rounded-lg font-black text-slate-900 outline-none focus:border-orange-600"
                                            value={draftCosts[p.id] !== undefined ? draftCosts[p.id] : p.cost}
                                            onChange={e => setDraftCosts({...draftCosts, [p.id]: Number(e.target.value)})}
                                            onFocus={e => e.target.select()}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById(`price-${index}`)?.focus(); } }}
                                        />
                                    ) : <span className="text-red-600">{p.cost.toLocaleString()}</span>}
                                </td>

                                <td className={`p-4 text-right ${quickEditMode ? 'bg-emerald-50' : ''}`}>
                                    {quickEditMode ? (
                                        <input type="number" id={`price-${index}`} className="w-24 p-2 text-right border-2 border-emerald-300 rounded-lg font-black text-emerald-700 outline-none focus:border-emerald-600"
                                            value={draftPrices[p.id] !== undefined ? draftPrices[p.id] : p.price}
                                            onChange={e => setDraftPrices({...draftPrices, [p.id]: Number(e.target.value)})}
                                            onFocus={e => e.target.select()}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById(`cost-${index + 1}`)?.focus(); } }}
                                        />
                                    ) : <span className="text-emerald-600 font-black">{p.price.toLocaleString()}</span>}
                                </td>

                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEditClick(p)} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  )
}