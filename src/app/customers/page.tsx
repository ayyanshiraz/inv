import { PrismaClient } from '@prisma/client'
import CustomerManager from '@/components/CustomerManager'

const prisma = new PrismaClient()

// Force fresh data on every load
export const dynamic = 'force-dynamic'

export default async function CustomerPage() {
  // 1. Fetch all customers
  const customers = await prisma.customer.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  // 2. Fetch customer-specific categories
  const categories = await prisma.customerCategory.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  // 3. Render the Manager Component
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <CustomerManager customers={customers} categories={categories} />
    </div>
  )
}