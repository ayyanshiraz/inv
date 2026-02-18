'use client'

import { useState } from 'react'

// Generic Component for both Product and Customer Categories
export default function CategoryManager({ 
  title, 
  categories, 
  saveAction,
  deleteAction // <--- NEW: Accepts a delete function
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
      <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 mb-10">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          {isEditing ? `Edit ${title}` : `Add ${title}`}
        </h1>
        
        <form action={async (data) => { await saveAction(data); alert('Saved!'); setFormData({id:'', name:''}); setIsEditing(false); }} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700">Category ID</label>
            <input 
              type="text" name="id" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})}
              readOnly={isEditing} required placeholder="e.g. CAT-VIP"
              className={`mt-1 block w-full rounded-md border shadow-sm p-3 ${isEditing ? 'bg-gray-100' : 'border-gray-300'} text-black`}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Category Name</label>
            <input 
              type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              required placeholder="e.g. VIP Customer"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border text-black"
            />
          </div>

          <button type="submit" className="w-full py-3 px-4 rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700">
            {isEditing ? 'Update Category' : 'Save Category'}
          </button>
        </form>
      </div>

      {/* LIST */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Existing Categories</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-bold text-gray-500">ID</th>
              <th className="px-6 py-3 text-left font-bold text-gray-500">Name</th>
              <th className="px-6 py-3 text-right font-bold text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-blue-600">{c.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900 font-bold">{c.name}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(c)} className="text-indigo-600 hover:text-indigo-900 font-bold text-sm mr-4">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-900 font-bold text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}