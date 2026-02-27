'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

async function getUser() {
  const session = await verifySession()
  return session.userId
}

function revalidateAll() {
  revalidatePath('/') 
  revalidatePath('/invoices')
  revalidatePath('/invoice/hold')
  revalidatePath('/ledger')
  revalidatePath('/products')
  revalidatePath('/customers')
  revalidatePath('/receivables')
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete('session') 
  redirect('/login')
}

// ==========================================
// 1. PRODUCT ACTIONS
// ==========================================
export async function saveProduct(formData: FormData) {
  const userId = await getUser()
  const originalId = formData.get('originalId') as string 
  let id = formData.get('id') as string
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const unit = formData.get('unit') as string || 'Bags' 
  const cost = Number(formData.get('cost')) || 0
  const price = Number(formData.get('price')) || 0 

  if (!id || id.trim() === '') id = `PROD-${Math.floor(Math.random() * 100000)}`

  if (originalId && originalId !== id) {
      const existing = await prisma.product.findUnique({ where: { id: originalId } })
      if (existing?.userId !== userId) throw new Error("Unauthorized")
      await prisma.product.update({ where: { id: originalId }, data: { id, name, category, unit, cost, price } })
  } else {
      const existing = await prisma.product.findUnique({ where: { id } })
      if (existing) { 
          if (existing.userId !== userId) {
              const uniqueId = `${id}-${Math.floor(Math.random() * 10000)}`
              await prisma.product.create({ data: { id: uniqueId, name, category, unit, cost, price, stock: 1000, userId } }) 
          } else {
              await prisma.product.update({ where: { id }, data: { name, category, unit, cost, price } }) 
          }
      } else { 
          await prisma.product.create({ data: { id, name, category, unit, cost, price, stock: 1000, userId } }) 
      }
  }
  revalidateAll()
}

export async function deleteProduct(id: string) {
  const userId = await getUser()
  const existing = await prisma.product.findUnique({ where: { id } })
  if (existing?.userId === userId) { await prisma.product.delete({ where: { id } }) }
  revalidateAll()
}

export async function bulkUpdateProductPrices(updates: { id: string, cost: number, price: number }[]) {
  const userId = await getUser()
  const myProducts = await prisma.product.findMany({ where: { userId } })
  const myProductIds = myProducts.map((p: any) => p.id)

  const validUpdates = updates.filter(u => myProductIds.includes(u.id))
  await prisma.$transaction( validUpdates.map((update: any) => prisma.product.update({ where: { id: update.id }, data: { cost: Number(update.cost) || 0, price: Number(update.price) || 0 } })) )
  revalidateAll() 
}

// ==========================================
// 2. CATEGORY & CUSTOMER ACTIONS
// ==========================================
export async function addProductCategory(formData: FormData) {
  const userId = await getUser()
  const name = formData.get('name') as string
  let id = formData.get('id') as string
  
  if (!id || id.trim() === '') id = `PCAT-${Math.floor(Math.random() * 100000)}`
  
  const existing = await prisma.productCategory.findUnique({ where: { id }})
  if (existing) {
      if (existing.userId !== userId) {
          const uniqueId = `${id}-${Math.floor(Math.random() * 10000)}`
          await prisma.productCategory.create({ data: { id: uniqueId, name, userId } }) 
      } else {
          await prisma.productCategory.update({ where: { id }, data: { name } }) 
      }
  } else { 
      await prisma.productCategory.create({ data: { id, name, userId } }) 
  }
  revalidateAll()
}

export async function deleteProductCategory(id: string) {
  const userId = await getUser()
  const existing = await prisma.productCategory.findUnique({ where: { id }})
  if (existing?.userId === userId) { await prisma.productCategory.delete({ where: { id } }) }
  revalidateAll()
}

export async function saveCustomer(formData: FormData) {
  const userId = await getUser()
  let id = formData.get('id') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const category = formData.get('category') as string
  const openingBalance = Number(formData.get('openingBalance')) || 0 

  if (!id || id.trim() === '') id = `CUST-${Math.floor(Math.random() * 100000)}`

  const existing = await prisma.customer.findUnique({ where: { id } })
  if (existing) { 
      if (existing.userId !== userId) {
          const uniqueId = `${id}-${Math.floor(Math.random() * 10000)}`
          await prisma.customer.create({ data: { id: uniqueId, name, phone, address, category, openingBalance, userId } }) 
      } else {
          await prisma.customer.update({ where: { id }, data: { name, phone, address, category, openingBalance } }) 
      }
  } else { 
      await prisma.customer.create({ data: { id, name, phone, address, category, openingBalance, userId } }) 
  }
  revalidateAll()
}

export async function deleteCustomer(id: string) {
  const userId = await getUser()
  const existing = await prisma.customer.findUnique({ where: { id } })
  if (existing?.userId === userId) { try { await prisma.customer.delete({ where: { id } }); revalidateAll() } catch (error) { console.error("Failed", error) } }
}

export async function addCustomerCategory(formData: FormData) {
  const userId = await getUser()
  const name = formData.get('name') as string
  let id = formData.get('id') as string

  if (!id || id.trim() === '') id = `CCAT-${Math.floor(Math.random() * 100000)}`

  const existing = await prisma.customerCategory.findUnique({ where: { id }})
  if (existing) { 
      if (existing.userId !== userId) {
          const uniqueId = `${id}-${Math.floor(Math.random() * 10000)}`
          await prisma.customerCategory.create({ data: { id: uniqueId, name, userId } }) 
      } else {
          await prisma.customerCategory.update({ where: { id }, data: { name } }) 
      }
  } else { 
      await prisma.customerCategory.create({ data: { id, name, userId } }) 
  }
  revalidateAll()
}

export async function deleteCustomerCategory(id: string) {
  const userId = await getUser()
  const existing = await prisma.customerCategory.findUnique({ where: { id }})
  if (existing?.userId === userId) { await prisma.customerCategory.delete({ where: { id } }) }
  revalidateAll()
}

// ==========================================
// 3. INVOICE & RETURN LOGIC
// ==========================================
export async function createInvoice(invoiceData: any) {
  const userId = await getUser()
  const result = await prisma.$transaction(async (tx: any) => {
    return await tx.invoice.create({
      data: {
        customerId: invoiceData.customerId, totalAmount: Number(invoiceData.totalAmount) || 0, paidAmount: Number(invoiceData.paidAmount) || 0, discountAmount: Number(invoiceData.discountAmount) || 0, isReturn: invoiceData.isReturn || false, isHold: invoiceData.isHold || false, userId: userId,
        items: { create: invoiceData.items.map((item: any) => ({ productId: item.productId, quantity: Number(item.quantity), price: Number(item.price) })) }
      }
    })
  })
  revalidateAll(); return result;
}

export async function updateInvoice(invoiceId: string, invoiceData: any) {
  const userId = await getUser()
  const existing = await prisma.invoice.findUnique({ where: { id: invoiceId } })
  if (existing?.userId !== userId) throw new Error("Unauthorized")

  await prisma.$transaction(async (tx: any) => {
    await tx.invoiceItem.deleteMany({ where: { invoiceId } })
    await tx.invoice.update({
      where: { id: invoiceId },
      data: { 
          customerId: invoiceData.customerId, totalAmount: Number(invoiceData.totalAmount) || 0, paidAmount: Number(invoiceData.paidAmount) || 0, discountAmount: Number(invoiceData.discountAmount) || 0, isHold: invoiceData.isHold || false,
          items: { create: invoiceData.items.map((item: any) => ({ productId: item.productId, quantity: Number(item.quantity), price: Number(item.price) })) }
      }
    })
  })
  revalidateAll(); return { id: invoiceId };
}

export async function deleteInvoice(id: string) {
  const userId = await getUser()
  const existing = await prisma.invoice.findUnique({ where: { id } })
  if (existing?.userId === userId) {
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } })
      await prisma.invoice.delete({ where: { id } })
  }
  revalidateAll()
}

export async function bulkDeleteInvoices(invoiceIds: string[]) {
  const userId = await getUser()
  const myInvoices = await prisma.invoice.findMany({ where: { userId } })
  const validIds = myInvoices.filter((i: any) => invoiceIds.includes(i.id)).map((i: any) => i.id)

  await prisma.invoiceItem.deleteMany({ where: { invoiceId: { in: validIds } } })
  await prisma.invoice.deleteMany({ where: { id: { in: validIds } } })
  revalidateAll()
}

export async function bulkMakeActive(invoiceIds: string[]) {
  const userId = await getUser()
  const myInvoices = await prisma.invoice.findMany({ where: { userId } })
  const validIds = myInvoices.filter((i: any) => invoiceIds.includes(i.id)).map((i: any) => i.id)

  await prisma.$transaction( validIds.map(id => prisma.invoice.update({ where: { id }, data: { isHold: false } })) )
  revalidateAll()
}

export async function bulkMarkAsPaid(invoiceIds: string[]) {
  const userId = await getUser()
  const myInvoices = await prisma.invoice.findMany({ where: { userId, isReturn: false } })
  const validInvoices = myInvoices.filter((i: any) => invoiceIds.includes(i.id))

  await prisma.$transaction( validInvoices.map((inv: any) => prisma.invoice.update({ where: { id: inv.id }, data: { paidAmount: inv.totalAmount, isHold: false } })) )
  revalidateAll()
}

export async function bulkUpdatePayments(updates: { id: string, paidAmount: number, discountAmount: number }[]) {
  const userId = await getUser()
  const myInvoices = await prisma.invoice.findMany({ where: { userId } })
  const validUpdates = updates.filter(u => myInvoices.some((i: any) => i.id === u.id))

  await prisma.$transaction( validUpdates.map(u => prisma.invoice.update({ where: { id: u.id }, data: { paidAmount: Number(u.paidAmount) || 0, discountAmount: Number(u.discountAmount) || 0, isHold: false } })) )
  revalidateAll()
}

export async function processSmartReturn(originalInvoiceId: string, returnItems: any[], totalReturnAmount: number, customerId: string) {
  const userId = await getUser(); await prisma.invoice.create({ data: { isReturn: true, totalAmount: Number(totalReturnAmount) || 0, paidAmount: 0, discountAmount: 0, customerId: customerId, userId: userId, items: { create: returnItems.map((item: any) => ({ productId: item.productId, quantity: Number(item.quantity), price: Number(item.price) })) } } }); revalidateAll()
}

export async function getCustomerBalance(customerId: string) {
  const userId = await getUser()
  const customer = await prisma.customer.findUnique({ where: { id: customerId } })
  if (!customer || customer.userId !== userId) return 0;

  const invoices = await prisma.invoice.findMany({ where: { customerId, userId, isHold: false } })
  const invoiceBalance = invoices.reduce((acc: number, inv: any) => { return inv.isReturn ? acc - inv.totalAmount : acc + inv.totalAmount - (inv.paidAmount || 0) }, 0)
  return Number(customer.openingBalance || 0) + invoiceBalance 
}

export async function getCustomerInvoices(customerId: string) {
  const userId = await getUser(); return await prisma.invoice.findMany({ where: { customerId, userId, isReturn: false, isHold: false }, include: { items: { include: { product: true } }, customer: true }, orderBy: { createdAt: 'desc' } })
}

// ==========================================
// 4. REPORTING LOGIC
// ==========================================
export async function searchInvoices(query: string) {
  const userId = await getUser(); if (!query) return []
  return await prisma.invoice.findMany({ where: { userId, OR: [ { id: { contains: query, mode: 'insensitive' } }, { customer: { name: { contains: query, mode: 'insensitive' } } }, { customer: { phone: { contains: query, mode: 'insensitive' } } } ] }, include: { customer: true, items: { include: { product: true } } }, orderBy: { createdAt: 'desc' }, take: 20 })
}

export async function getInvoiceDetails(id: string) {
  const userId = await getUser(); const invoice = await prisma.invoice.findUnique({ where: { id }, include: { customer: true, items: { include: { product: true } } } }); 
  if (invoice?.userId !== userId) return null; return invoice;
}

export async function getDashboardStats(from?: Date, to?: Date) {
  const userId = await getUser(); const dateFilter = (from && to) ? { createdAt: { gte: from, lte: to } } : {}
  const invoices = await prisma.invoice.findMany({ where: { userId, ...dateFilter }, include: { items: { include: { product: true } } } })
  let revenue = 0; let returns = 0; let costOfGoods = 0; let salesCount = 0; let holdCount = 0;
  invoices.forEach((inv: any) => {
    if (inv.isHold) { holdCount++; return; } 
    if (inv.isReturn) returns += Number(inv.totalAmount)
    else { revenue += Number(inv.totalAmount); salesCount++; inv.items.forEach((item: any) => costOfGoods += (Number(item.product?.cost || 0) * Number(item.quantity))) }
  })
  const customers = await prisma.customer.findMany({ where: { userId } }); const allInvoices = await prisma.invoice.findMany({ where: { userId, isHold: false } }) 
  let totalReceivable = customers.reduce((sum: number, c: any) => sum + Number(c.openingBalance || 0), 0)
  allInvoices.forEach((inv: any) => { totalReceivable += inv.isReturn ? -Number(inv.totalAmount) : (Number(inv.totalAmount) - Number(inv.paidAmount || 0)) })
  return { revenue, returns, netRevenue: revenue - returns, profit: (revenue - returns) - costOfGoods, salesCount, holdCount, margin: revenue > 0 ? (((revenue - returns - costOfGoods) / (revenue - returns)) * 100).toFixed(1) : 0, customerCount: customers.length, totalReceivable }
}

export async function getLedgerReportData(from?: Date, to?: Date) {
    const userId = await getUser()
    const start = from ? new Date(from) : new Date(0)
    const end = to ? new Date(to) : new Date()
    end.setHours(23, 59, 59, 999)
  
    let periodRevenue = 0; let periodCost = 0;
    const productSales: Record<string, any> = {}

    const customers = await prisma.customer.findMany({ where: { userId }, orderBy: { name: 'asc' } })
    const allInvoicesRaw = await prisma.invoice.findMany({ where: { userId }, include: { items: { include: { product: true } } } })
  
    const activeInvoices = allInvoicesRaw.filter((i: any) => !i.isHold)
    const holdInvoices = allInvoicesRaw.filter((i: any) => i.isHold)

    const customerLedgers = customers.map((cust: any) => {
      let openingBalance = Number(cust.openingBalance || 0); let invoicedAmount = 0; let paidAmount = 0; let returnAmount = 0;
      activeInvoices.filter((inv: any) => inv.customerId === cust.id).forEach((inv: any) => {
        const invDate = new Date(inv.createdAt)
        if (invDate < start) { 
            if (inv.isReturn) openingBalance -= Number(inv.totalAmount); 
            else openingBalance += (Number(inv.totalAmount) - Number(inv.paidAmount || 0)) 
        } 
        else if (invDate <= end) { 
            if (inv.isReturn) returnAmount += Number(inv.totalAmount); 
            else { invoicedAmount += Number(inv.totalAmount); paidAmount += Number(inv.paidAmount || 0) } 
        }
      })
      return { id: cust.id, name: cust.name, category: cust.category || 'Uncategorized', openingBalance, invoicedAmount, returnAmount, paidAmount, closingBalance: openingBalance + invoicedAmount - returnAmount - paidAmount }
    })

    const categoryMap: Record<string, any> = {}
    customerLedgers.forEach((c: any) => {
        const cat = c.category || 'Uncategorized';
        if (!categoryMap[cat]) categoryMap[cat] = { category: cat, customers: [], openingBalance: 0, invoicedAmount: 0, returnAmount: 0, paidAmount: 0, closingBalance: 0 }
        categoryMap[cat].customers.push(c); 
        categoryMap[cat].openingBalance += c.openingBalance; categoryMap[cat].invoicedAmount += c.invoicedAmount; 
        categoryMap[cat].returnAmount += c.returnAmount; categoryMap[cat].paidAmount += c.paidAmount; categoryMap[cat].closingBalance += c.closingBalance
    })
  
    activeInvoices.forEach((inv: any) => {
       const invDate = new Date(inv.createdAt)
       if (invDate >= start && invDate <= end && !inv.isReturn) {
           periodRevenue += Number(inv.totalAmount)
           inv.items.forEach((item: any) => {
               const pId = item.productId; const pCost = Number(item.product?.cost || 0); periodCost += (pCost * Number(item.quantity))
               if (!productSales[pId]) productSales[pId] = { id: pId, name: item.product?.name || 'Unknown', category: item.product?.category || 'Uncategorized', unit: item.product?.unit || 'Bags', qty: 0, revenue: 0, cost: 0 }
               productSales[pId].qty += Number(item.quantity); productSales[pId].revenue += (Number(item.price) * Number(item.quantity)); productSales[pId].cost += (pCost * Number(item.quantity))
           })
       }
    })

  const productCategoryMap: Record<string, any> = {}
  Object.values(productSales).forEach((p: any) => {
      const cat = p.category || 'Uncategorized';
      if (!productCategoryMap[cat]) productCategoryMap[cat] = { category: cat, products: [], totalQty: 0, totalRevenue: 0, totalCost: 0, totalProfit: 0 };
      const profit = p.revenue - p.cost;
      productCategoryMap[cat].products.push({...p, profit});
      productCategoryMap[cat].totalQty += p.qty; 
      productCategoryMap[cat].totalRevenue += p.revenue; 
      productCategoryMap[cat].totalCost += p.cost; 
      productCategoryMap[cat].totalProfit += profit;
  });
  Object.values(productCategoryMap).forEach(c => c.products.sort((a:any, b:any) => b.revenue - a.revenue));

    return {
        customerLedgers, 
        categoryLedgers: Object.values(categoryMap).sort((a:any, b:any) => a.category.localeCompare(b.category)),
        productSales: Object.values(productSales).sort((a:any, b:any) => b.revenue - a.revenue),
        allProducts: await prisma.product.findMany({ where: { userId }, orderBy: { name: 'asc' } }),
        allCustomers: customers,
        productCategoryLedgers: Object.values(productCategoryMap).sort((a:any, b:any) => a.category.localeCompare(b.category)),
        holdInvoices,
        stats: { revenue: periodRevenue, profit: periodRevenue - periodCost, margin: periodRevenue > 0 ? (((periodRevenue - periodCost) / periodRevenue) * 100).toFixed(1) : 0, receivables: customerLedgers.reduce((sum: number, c: any) => sum + c.closingBalance, 0) }
    }
}

// ==========================================
// 5. RECEIVABLES & VOUCHERS
// ==========================================
export async function createVouchers(vouchers: { customerId: string, amount: number }[]) {
  const userId = await getUser()
  await prisma.$transaction(
    vouchers.map(v => prisma.invoice.create({
      data: { customerId: v.customerId, totalAmount: 0, paidAmount: Number(v.amount), discountAmount: 0, isReturn: false, isHold: false, userId: userId, items: { create: [] } }
    }))
  )
  revalidateAll()
}
export async function updateVoucher(id: string, amount: number) {
  const userId = await getUser()
  // Ensure we are only editing a voucher (totalAmount: 0) that belongs to the user
  await prisma.invoice.updateMany({
    where: { id, userId, totalAmount: 0 },
    data: { paidAmount: Number(amount) }
  })
  revalidateAll()
}