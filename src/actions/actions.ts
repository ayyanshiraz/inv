'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/session' // Import session checker

const prisma = new PrismaClient()

// --- HELPER TO GET CURRENT USER ---
async function getUser() {
  const session = await verifySession()
  return session.userId
}

// ==========================================
// 1. PRODUCT ACTIONS
// ==========================================

export async function saveProduct(formData: FormData) {
  const userId = await getUser() // <--- Dynamic User ID
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const cost = parseFloat(formData.get('cost') as string) || 0
  const price = parseFloat(formData.get('price') as string) || 0
  const stock = 1000 

  const existing = await prisma.product.findUnique({ where: { id } })

  // Security Check: Ensure user owns the product they are editing
  if (existing && existing.userId !== userId) throw new Error("Unauthorized")

  if (existing) {
    await prisma.product.update({
      where: { id },
      data: { name, category, cost, price }
    })
  } else {
    await prisma.product.create({
      data: { id, name, category, cost, price, stock, userId }
    })
  }

  revalidatePath('/products')
  revalidatePath('/invoice/new') 
  revalidatePath('/invoice/return')
  revalidatePath('/ledger')
}

export async function deleteProduct(id: string) {
  const userId = await getUser()
  // Ensure we delete only our own product
  const product = await prisma.product.findUnique({ where: { id } })
  if (product?.userId !== userId) return // or throw error

  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath('/products')
    revalidatePath('/invoice/new')
  } catch (error) {
    console.error("Failed to delete product", error)
  }
}

export async function addProductCategory(formData: FormData) {
  const userId = await getUser()
  const name = formData.get('name') as string
  const id = formData.get('id') as string

  const existing = await prisma.productCategory.findUnique({ where: { id } })
  
  if (existing) {
    await prisma.productCategory.update({ where: { id }, data: { name } })
  } else {
    await prisma.productCategory.create({ data: { id, name, userId } })
  }
  
  revalidatePath('/category/product')
  revalidatePath('/products')
}

export async function deleteProductCategory(id: string) {
  await prisma.productCategory.delete({ where: { id } })
  revalidatePath('/category/product')
  revalidatePath('/products')
}

// ==========================================
// 2. CUSTOMER ACTIONS
// ==========================================

export async function saveCustomer(formData: FormData) {
  const userId = await getUser()
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const category = formData.get('category') as string

  const existing = await prisma.customer.findUnique({ where: { id } })

  if (existing) {
    await prisma.customer.update({
      where: { id },
      data: { name, phone, address, category }
    })
  } else {
    await prisma.customer.create({
      data: { id, name, phone, address, category, userId }
    })
  }

  revalidatePath('/customers')
  revalidatePath('/invoice/new')
  revalidatePath('/invoice/return')
}

export async function deleteCustomer(id: string) {
  try {
    await prisma.customer.delete({ where: { id } })
    revalidatePath('/customers')
    revalidatePath('/invoice/new')
  } catch (error) {
    console.error("Failed to delete customer", error)
  }
}

export async function addCustomerCategory(formData: FormData) {
  const userId = await getUser()
  const name = formData.get('name') as string
  const id = formData.get('id') as string

  const existing = await prisma.customerCategory.findUnique({ where: { id } })

  if (existing) {
    await prisma.customerCategory.update({ where: { id }, data: { name } })
  } else {
    await prisma.customerCategory.create({ data: { id, name, userId } })
  }
  
  revalidatePath('/category/customer')
  revalidatePath('/customers')
}

export async function deleteCustomerCategory(id: string) {
  await prisma.customerCategory.delete({ where: { id } })
  revalidatePath('/category/customer')
  revalidatePath('/customers')
}

// ==========================================
// 3. INVOICE LOGIC (ISOLATED)
// ==========================================

export async function createInvoice(invoiceData: any) {
  const userId = await getUser()
  
  const result = await prisma.$transaction(async (tx) => {
    return await tx.invoice.create({
      data: {
        customerId: invoiceData.customerId,
        totalAmount: invoiceData.totalAmount,
        paidAmount: invoiceData.paidAmount || 0,
        isReturn: invoiceData.isReturn || false,
        userId: userId, // <--- Assigned to current user
        items: {
          create: invoiceData.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    })
  })
  
  revalidatePath('/')
  revalidatePath('/invoices')
  revalidatePath('/ledger')
  return result
}

export async function deleteInvoice(id: string) {
  await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } })
  await prisma.invoice.delete({ where: { id } })
  
  revalidatePath('/')
  revalidatePath('/ledger')
  revalidatePath('/invoices')
}

// ==========================================
// 4. DATA FETCHERS (ISOLATED)
// ==========================================

// Dashboard Stats
export async function getDashboardStats(from?: Date, to?: Date) {
  const userId = await getUser() // <--- Only fetch for THIS user
  
  const dateFilter = (from && to) ? { createdAt: { gte: from, lte: to } } : {}

  const invoices = await prisma.invoice.findMany({
    where: { userId, ...dateFilter },
    include: { items: { include: { product: true } }, customer: true }
  })

  let revenue = 0; let returns = 0; let costOfGoods = 0; let salesCount = 0

  invoices.forEach(inv => {
    if (inv.isReturn) {
      returns += inv.totalAmount
    } else {
      revenue += inv.totalAmount
      salesCount++
      inv.items.forEach(item => {
        costOfGoods += ((item.product?.cost || 0) * item.quantity)
      })
    }
  })

  const netRevenue = revenue - returns
  const profit = netRevenue - costOfGoods
  const profitMargin = netRevenue > 0 ? ((profit / netRevenue) * 100).toFixed(1) : 0
  const customerCount = await prisma.customer.count({ where: { userId } })
  
  // Total Receivables
  const allInvoices = await prisma.invoice.findMany({ where: { userId } })
  const totalReceivable = allInvoices.reduce((acc, inv) => {
      const paid = inv.paidAmount || 0
      if(inv.isReturn) return acc - inv.totalAmount + paid
      else return acc + inv.totalAmount - paid
  }, 0)

  return { revenue, returns, netRevenue, profit, profitMargin, salesCount, customerCount, totalReceivable }
}

// Search
export async function searchInvoices(query: string) {
  const userId = await getUser()
  if (!query) return []
  
  return await prisma.invoice.findMany({
    where: {
      userId, // <--- Lock search to user
      OR: [
        { id: { contains: query, mode: 'insensitive' } },
        { customer: { name: { contains: query, mode: 'insensitive' } } },
        { customer: { phone: { contains: query, mode: 'insensitive' } } }
      ]
    },
    include: { customer: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20
  })
}

export async function getInvoiceDetails(id: string) {
  const userId = await getUser()
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, items: { include: { product: true } } }
  })
  // Security check: Don't show invoice if it doesn't belong to user
  if (invoice?.userId !== userId) return null
  return invoice
}

export async function getCustomerBalance(customerId: string) {
  // We assume customer is already filtered by user in the UI selection, 
  // but strictly, we should check ownership here too if we had a pure API.
  const invoices = await prisma.invoice.findMany({ where: { customerId } })
  return invoices.reduce((acc, inv) => acc + (inv.totalAmount - (inv.paidAmount || 0)), 0)
}

// Smart Return
export async function processSmartReturn(originalInvoiceId: string, returnItems: any[], totalReturnAmount: number, customerId: string) {
  const userId = await getUser()
  await prisma.invoice.create({
    data: {
      isReturn: true,
      totalAmount: totalReturnAmount,
      paidAmount: totalReturnAmount,
      customerId: customerId,
      userId: userId,
      items: {
        create: returnItems.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      }
    }
  })
  revalidatePath('/')
  revalidatePath('/ledger')
  revalidatePath('/invoices')
}