import { PrismaClient } from '@prisma/client'
import CategoryManager from '@/components/CategoryManager'
import { addCustomerCategory, deleteCustomerCategory } from '@/actions/actions' // Import Delete

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function CustomerCategoryPage() {
  const categories = await prisma.customerCategory.findMany({ orderBy: { name: 'asc' } })

  return (
    <CategoryManager 
      title="Customer Category" 
      categories={categories} 
      saveAction={addCustomerCategory}
      deleteAction={deleteCustomerCategory} // <--- Pass Delete Action
    />
  )
}