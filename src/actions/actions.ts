'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/session'

const prisma = new PrismaClient()

async function getUser() {
  const session = await verifySession()
  return session.userId
}

// ==========================================
// 1. PRODUCT ACTIONS
// ==========================================

export async function saveProduct(formData: FormData) {
  const userId = await getUser()
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const cost = parseFloat(formData.get('cost') as string) || 0
  // Selling price is now 0 by default. It is decided manually at the invoice level.
  const price = 0 
  const stock = 1000 

  const existing = await prisma.product.findUnique({ where: { id } })

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
  const product = await prisma.product.findUnique({ where: { id } })
  if (product?.userId !== userId) return

  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath('/products')
    revalidatePath('/invoice/new')
  } catch (error) {
    console.error("Failed to delete product", error)
  }
}

// ... Category & Customer actions remain exactly the same ...
export async function addProductCategory(formData: FormData) {
  const userId = await getUser()
  const name = formData.get('name') as string
  const id = formData.get('id') as string
  const existing = await prisma.productCategory.findUnique({ where: { id } })
  if (existing) { await prisma.productCategory.update({ where: { id }, data: { name } }) } 
  else { await prisma.productCategory.create({ data: { id, name, userId } }) }
  revalidatePath('/category/product'); revalidatePath('/products')
}

export async function deleteProductCategory(id: string) {
  await prisma.productCategory.delete({ where: { id } })
  revalidatePath('/category/product'); revalidatePath('/products')
}

export async function saveCustomer(formData: FormData) {
  const userId = await getUser()
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const category = formData.get('category') as string
  const existing = await prisma.customer.findUnique({ where: { id } })
  if (existing) { await prisma.customer.update({ where: { id }, data: { name, phone, address, category } }) } 
  else { await prisma.customer.create({ data: { id, name, phone, address, category, userId } }) }
  revalidatePath('/customers'); revalidatePath('/invoice/new'); revalidatePath('/invoice/return')
}

export async function deleteCustomer(id: string) {
  try { await prisma.customer.delete({ where: { id } }); revalidatePath('/customers'); revalidatePath('/invoice/new') } 
  catch (error) { console.error("Failed to delete customer", error) }
}

export async function addCustomerCategory(formData: FormData) {
  const userId = await getUser()
  const name = formData.get('name') as string
  const id = formData.get('id') as string
  const existing = await prisma.customerCategory.findUnique({ where: { id } })
  if (existing) { await prisma.customerCategory.update({ where: { id }, data: { name } }) } 
  else { await prisma.customerCategory.create({ data: { id, name, userId } }) }
  revalidatePath('/category/customer'); revalidatePath('/customers')
}

export async function deleteCustomerCategory(id: string) {
  await prisma.customerCategory.delete({ where: { id } })
  revalidatePath('/category/customer'); revalidatePath('/customers')
}

// ==========================================
// 3. INVOICE & RETURN LOGIC (FIXED BALANCE CALCULATION)
// ==========================================

export async function createInvoice(invoiceData: any) {
  const userId = await getUser()
  const result = await prisma.$transaction(async (tx) => {
    return await tx.invoice.create({
      data: {
        customerId: invoiceData.customerId,
        totalAmount: invoiceData.totalAmount,
        paidAmount: invoiceData.paidAmount || 0,
        isReturn: false,
        userId: userId,
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
  
  revalidatePath('/'); revalidatePath('/invoices'); revalidatePath('/ledger')
  return result
}

export async function deleteInvoice(id: string) {
  await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } })
  await prisma.invoice.delete({ where: { id } })
  revalidatePath('/'); revalidatePath('/ledger'); revalidatePath('/invoices')
}

export async function getCustomerBalance(customerId: string) {
  const invoices = await prisma.invoice.findMany({ where: { customerId } })
  
  const balance = invoices.reduce((acc, inv) => {
    const paid = inv.paidAmount || 0
    if (inv.isReturn) {
      // FIX: Force returns to ALWAYS deduct from the balance, 
      // ignoring the accidental paidAmount from the old code.
      return acc - inv.totalAmount
    } else {
      // Normal sale: increases balance, payments reduce it.
      return acc + inv.totalAmount - paid
    }
  }, 0)
  
  return balance
}

export async function processSmartReturn(originalInvoiceId: string, returnItems: any[], totalReturnAmount: number, customerId: string) {
  const userId = await getUser()
  await prisma.invoice.create({
    data: {
      isReturn: true,
      totalAmount: totalReturnAmount,
      // FIX: Setting paidAmount to 0 ensures this return acts as an account credit, reducing their previous balance!
      paidAmount: 0, 
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
  revalidatePath('/'); revalidatePath('/ledger'); revalidatePath('/invoices')
}

// ... Data fetchers (getDashboardStats, searchInvoices, getInvoiceDetails) remain the same ...
export async function getDashboardStats(from?: Date, to?: Date) {
  const userId = await getUser() 
  
  // ==========================================
  // MAGIC FIX: Migrate old 'user_123' test data to Admin 1
  // This rescues Yasir and old invoices!
  // ==========================================
  if (userId === 'user_admin_1') {
      await prisma.customer.updateMany({ where: { userId: 'user_123' }, data: { userId } })
      await prisma.invoice.updateMany({ where: { userId: 'user_123' }, data: { userId } })
      await prisma.product.updateMany({ where: { userId: 'user_123' }, data: { userId } })
  }

  const dateFilter = (from && to) ? { createdAt: { gte: from, lte: to } } : {}
  
  // Fetch stats securely for THIS user
  const invoices = await prisma.invoice.findMany({
    where: { userId, ...dateFilter },
    include: { items: { include: { product: true } }, customer: true }
  })

  let revenue = 0; let returns = 0; let costOfGoods = 0; let salesCount = 0

  invoices.forEach(inv => {
    if (inv.isReturn) { returns += inv.totalAmount } 
    else {
      revenue += inv.totalAmount; salesCount++
      inv.items.forEach(item => { costOfGoods += ((item.product?.cost || 0) * item.quantity) })
    }
  })

  const netRevenue = revenue - returns
  const profit = netRevenue - costOfGoods
  const profitMargin = netRevenue > 0 ? ((profit / netRevenue) * 100).toFixed(1) : 0
  const customerCount = await prisma.customer.count({ where: { userId } })
  const allInvoices = await prisma.invoice.findMany({ where: { userId } })
  
  const totalReceivable = allInvoices.reduce((acc, inv) => {
      const paid = inv.paidAmount || 0
      if(inv.isReturn) return acc - inv.totalAmount
      else return acc + inv.totalAmount - paid
  }, 0)

  return { revenue, returns, netRevenue, profit, profitMargin, salesCount, customerCount, totalReceivable }
}  
  export async function searchInvoices(query: string) {
    const userId = await getUser()
    if (!query) return []
    return await prisma.invoice.findMany({
      where: {
        userId, OR: [ { id: { contains: query, mode: 'insensitive' } }, { customer: { name: { contains: query, mode: 'insensitive' } } }, { customer: { phone: { contains: query, mode: 'insensitive' } } } ]
      },
      include: { customer: true, items: { include: { product: true } } }, orderBy: { createdAt: 'desc' }, take: 20
    })
  }
  
  export async function getInvoiceDetails(id: string) {
    const userId = await getUser()
    const invoice = await prisma.invoice.findUnique({ where: { id }, include: { customer: true, items: { include: { product: true } } } })
    if (invoice?.userId !== userId) return null
    return invoice
  }
  // Add this at the very bottom of src/actions/actions.ts

export async function updateInvoice(invoiceId: string, invoiceData: any) {
  const userId = await getUser()
  
  // Security check
  const existing = await prisma.invoice.findUnique({ where: { id: invoiceId } })
  if (existing?.userId !== userId) throw new Error("Unauthorized")

  await prisma.$transaction(async (tx) => {
    // 1. Delete old items
    await tx.invoiceItem.deleteMany({ where: { invoiceId } })
    
    // 2. Update Header & Insert New Items
    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        customerId: invoiceData.customerId,
        totalAmount: invoiceData.totalAmount,
        paidAmount: invoiceData.paidAmount || 0,
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
  return { id: invoiceId }
}
// Add this at the bottom of src/actions/actions.ts

export async function getCustomerInvoices(customerId: string) {
  const userId = await getUser()
  // Fetch all non-return invoices for this specific customer
  return await prisma.invoice.findMany({
    where: { 
        customerId: customerId, 
        userId: userId, 
        isReturn: false 
    },
    include: { 
        items: { include: { product: true } }, 
        customer: true 
    },
    orderBy: { createdAt: 'desc' }
  })
}
// ==========================================
// 5. MASTER LEDGER & REPORTING ENGINE
// ==========================================

// ==========================================
// 5. MASTER LEDGER & REPORTING ENGINE
// ==========================================

export async function getLedgerReportData(from?: Date, to?: Date) {
    const userId = await getUser()
    
    const start = from ? new Date(from) : new Date(0)
    start.setHours(0, 0, 0, 0)
    
    const end = to ? new Date(to) : new Date()
    end.setHours(23, 59, 59, 999)
  
    const customers = await prisma.customer.findMany({ where: { userId }, orderBy: { name: 'asc' } })
    const allInvoices = await prisma.invoice.findMany({
      where: { userId },
      include: { items: { include: { product: true } } }
    })
  
    // 1. CUSTOMER LEDGER
    const customerLedgers = customers.map(cust => {
      let openingBalance = 0; let invoicedAmount = 0; let paidAmount = 0; let returnAmount = 0;
  
      allInvoices.filter(inv => inv.customerId === cust.id).forEach(inv => {
        const invDate = new Date(inv.createdAt)
        const isBefore = invDate < start
        const isWithin = invDate >= start && invDate <= end
  
        const total = inv.totalAmount
        const paid = inv.paidAmount || 0
  
        if (isBefore) {
          if (inv.isReturn) openingBalance -= total
          else openingBalance += (total - paid)
        } else if (isWithin) {
          if (inv.isReturn) { returnAmount += total; paidAmount += paid; } 
          else { invoicedAmount += total; paidAmount += paid; }
        }
      })
  
      return {
        id: cust.id,
        name: cust.name,
        category: cust.category || 'Uncategorized', // Grab the category
        openingBalance, invoicedAmount, returnAmount, paidAmount,
        closingBalance: openingBalance + invoicedAmount - returnAmount - paidAmount
      }
    })

    // 2. CATEGORY LEDGER (NEW: Grouping Customers by Category)
    const categoryMap: Record<string, any> = {}
    customerLedgers.forEach(c => {
        if (!categoryMap[c.category]) {
            categoryMap[c.category] = { category: c.category, openingBalance: 0, invoicedAmount: 0, returnAmount: 0, paidAmount: 0, closingBalance: 0 }
        }
        categoryMap[c.category].openingBalance += c.openingBalance
        categoryMap[c.category].invoicedAmount += c.invoicedAmount
        categoryMap[c.category].returnAmount += c.returnAmount
        categoryMap[c.category].paidAmount += c.paidAmount
        categoryMap[c.category].closingBalance += c.closingBalance
    })
    // Convert object to sorted array
    const categoryLedgers = Object.values(categoryMap).sort((a: any, b: any) => a.category.localeCompare(b.category))
  
    // 3. PRODUCT SALES
    let periodRevenue = 0; let periodCost = 0;
    const productSales: Record<string, any> = {}
  
    allInvoices.forEach(inv => {
       const invDate = new Date(inv.createdAt)
       if (invDate >= start && invDate <= end && !inv.isReturn) {
           periodRevenue += inv.totalAmount
           inv.items.forEach(item => {
               const pId = item.productId
               const pCost = item.product?.cost || 0
               periodCost += (pCost * item.quantity)
               
               if (!productSales[pId]) {
                   productSales[pId] = { name: item.product?.name || 'Unknown', category: item.product?.category || 'Uncategorized', qty: 0, revenue: 0, cost: 0 }
               }
               productSales[pId].qty += item.quantity
               productSales[pId].revenue += (item.price * item.quantity)
               productSales[pId].cost += (pCost * item.quantity)
           })
       }
    })
  
    return {
        customerLedgers,
        categoryLedgers, // <--- New data passed to frontend
        productSales: Object.values(productSales).sort((a:any, b:any) => b.revenue - a.revenue),
        stats: {
            revenue: periodRevenue,
            profit: periodRevenue - periodCost,
            margin: periodRevenue > 0 ? (((periodRevenue - periodCost) / periodRevenue) * 100).toFixed(1) : 0,
            receivables: customerLedgers.reduce((sum, c) => sum + c.closingBalance, 0)
        }
    }
}