import { PrismaClient } from '@prisma/client'
import InvoiceForm from '@/components/InvoiceForm'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function NewInvoicePage() {
  // 1. Fetch Customers for the dropdown
  const customers = await prisma.customer.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  // 2. Fetch ALL Products (Removed the 'where stock > 0' filter)
  const products = await prisma.product.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4 mb-20">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">New Sales Invoice</h1>
      <p className="text-gray-500 mb-8">Create a new sale. (Stock tracking is disabled).</p>
      
      {/* Pass data to the interactive Form */}
      <InvoiceForm customers={customers} products={products} />
    </div>
  )
}