'use client'

import { useState } from 'react'
import { saveCustomer, deleteCustomer } from '@/actions/actions'

export default function CustomerManager({ customers, categories }: { customers: any[], categories: any[] }) {
  const [formData, setFormData] = useState({
    id: '', name: '', phone: '', address: '', category: ''
  })
  
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = (customer: any) => {
    setFormData({
      id: customer.id,
      name: customer.name,
      phone: customer.phone || '',
      address: customer.address || '',
      category: customer.category || ''
    })
    setIsEditing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to delete this customer?')) {
        await deleteCustomer(id)
    }
  }

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      
      {/* FORM SECTION */}
      <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 mb-10">
        <h1 className="text-2xl font-bold mb-6 text-blue-800">
          {isEditing ? 'Edit Customer' : 'Customer Feeding'}
        </h1>
        
        <form action={async (data) => { await saveCustomer(data); alert('Saved!'); setFormData({id:'', name:'', phone:'', address:'', category:''}); setIsEditing(false); }} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">Customer ID</label>
              <input 
                type="text" name="id" value={formData.id} onChange={handleChange} readOnly={isEditing} required placeholder="e.g. CUST-001"
                className={`mt-1 block w-full rounded-md border shadow-sm p-3 ${isEditing ? 'bg-gray-100 text-gray-500' : 'border-gray-300 text-black'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">Customer Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. John Doe"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Category</label>
            <select name="category" value={formData.category} onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border text-black"
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="0300-1234567"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border text-black"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-3 px-4 rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700">
            {isEditing ? 'Update Customer' : 'Save Customer'}
          </button>
        </form>
      </div>

      {/* LIST SECTION */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Existing Customers</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-bold text-gray-500">ID</th>
              <th className="px-6 py-3 text-left font-bold text-gray-500">Name</th>
              <th className="px-6 py-3 text-left font-bold text-gray-500">Category</th>
              <th className="px-6 py-3 text-left font-bold text-gray-500">Phone</th>
              <th className="px-6 py-3 text-right font-bold text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-blue-600">{c.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900 font-bold">{c.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{c.category || 'N/A'}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.phone}</td>
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