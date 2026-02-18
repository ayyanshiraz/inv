import { PrismaClient } from '@prisma/client'
import CategoryManager from '@/components/CategoryManager'
import { addProductCategory, deleteProductCategory } from '@/actions/actions' // Import Delete

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function ProductCategoryPage() {
  const categories = await prisma.productCategory.findMany({ orderBy: { name: 'asc' } })

  return (
    <CategoryManager 
      title="Product Category" 
      categories={categories} 
      saveAction={addProductCategory}
      deleteAction={deleteProductCategory} // <--- Pass Delete Action
    />
  )
}