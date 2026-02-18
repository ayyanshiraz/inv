'use client'

import { useState } from 'react'
import { saveProduct, deleteProduct } from '@/actions/actions' // Import Delete

export default function ProductManager({ products, categories }: { products: any[], categories: any[] }) {
  const [formData, setFormData] = useState({ id: '', name: '', category: '', cost: '', price: '' })
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = (prod: any) => {
    setFormData({ id: prod.id, name: prod.name, category: prod.category, cost: prod.cost, price: prod.price })
    setIsEditing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to delete this product?')) {
        await deleteProduct(id)
    }
  }

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value })

  return (
    <div className="max-w-4xl mx-auto mt-10">
      {/* FORM SECTION (Same as before, simplified for brevity) */}
      <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 mb-10">
        <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Edit' : 'Add'} Product</h1>
        <form action={async (data) => { await saveProduct(data); alert('Saved!'); setFormData({id:'', name:'', category:'', cost:'', price:''}); setIsEditing(false); }} className="space-y-4">
            {/* ... Inputs for ID, Name, Category ... */}
            <input type="text" name="id" value={formData.id} onChange={handleChange} placeholder="ID" className="w-full p-3 border rounded mb-2" required readOnly={isEditing} />
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full p-3 border rounded mb-2" required />
            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 border rounded mb-2">
                <option value="">Category</option>
                {categories.map((c:any) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-4">
                <input type="number" name="cost" value={formData.cost} onChange={handleChange} placeholder="Cost (PKR)" className="w-full p-3 border rounded" required />
                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price (PKR)" className="w-full p-3 border rounded" required />
            </div>
            <button type="submit" className="w-full bg-black text-white p-3 rounded font-bold">Save</button>
        </form>
      </div>

      {/* LIST SECTION WITH DELETE BUTTON */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-bold text-gray-500">ID</th>
              <th className="px-6 py-3 text-left font-bold text-gray-500">Name</th>
              <th className="px-6 py-3 text-right font-bold text-gray-500">Price (PKR)</th>
              <th className="px-6 py-3 text-right font-bold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4 text-blue-600">{p.id}</td>
                <td className="px-6 py-4 font-bold">{p.name}</td>
                <td className="px-6 py-4 text-right text-green-600 font-bold">{p.price}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(p)} className="text-blue-600 font-bold mr-4">Edit</button>
                  {/* DELETE BUTTON */}
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 font-bold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}