import { PrismaClient, Prisma, ChallanStatus } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { formatPagination, generateChallanNumber } from '../utils/helpers';

const prisma = new PrismaClient();

export const getAllChallans = async (page = 1, limit = 10, search?: string, status?: string) => {
  const skip = (page - 1) * limit;
  const where: Prisma.ChallanWhereInput = {};
  if (search) where.challanNumber = { contains: search };
  if (status) where.status = status as ChallanStatus;

  const [challans, total] = await Promise.all([
    prisma.challan.findMany({
      where, skip, take: limit,
      include: {
        customer: { select: { customerName: true, businessName: true } },
        createdBy: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.challan.count({ where })
  ]);
  return { challans, pagination: formatPagination(page, limit, total) };
};

export const getChallanById = async (id: number) => {
  const challan = await prisma.challan.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { productName: true, sku: true } } } },
      customer: true,
      createdBy: { select: { name: true } }
    }
  });
  if (!challan) throw new ApiError(404, 'Challan not found');
  return challan;
};

export const createChallan = async (data: any, userId: number) => {
  return await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findFirst({ where: { id: data.customerId, isDeleted: false } });
    if (!customer) throw new ApiError(404, 'Selected customer does not exist or has been deleted');

    const totalQuantity = data.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
    
    const itemsData = await Promise.all(data.items.map(async (item: any) => {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new ApiError(404, `Product ID ${item.productId} not found`);
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPriceSnapshot: product.unitPrice,
        productNameSnapshot: product.productName,
        skuSnapshot: product.sku
      };
    }));

    return await tx.challan.create({
      data: {
        challanNumber: generateChallanNumber(),
        customerId: data.customerId,
        totalQuantity,
        createdById: userId,
        status: 'DRAFT',
        items: {
          create: itemsData
        }
      },
      include: { items: true }
    });
  });
};

export const updateChallan = async (id: number, data: any) => {
  return await prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({ where: { id } });
    if (!challan) throw new ApiError(404, 'Challan not found');
    if (challan.status !== 'DRAFT') throw new ApiError(400, 'Only DRAFT challans can be updated');

    await tx.challanItem.deleteMany({ where: { challanId: id } });
    
    const totalQuantity = data.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
    
    const itemsData = await Promise.all(data.items.map(async (item: any) => {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new ApiError(404, `Product ${item.productId} not found`);
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPriceSnapshot: product.unitPrice,
        productNameSnapshot: product.productName,
        skuSnapshot: product.sku
      };
    }));

    return await tx.challan.update({
      where: { id },
      data: {
        customerId: data.customerId,
        totalQuantity,
        items: { create: itemsData }
      },
      include: { items: true }
    });
  });
};

export const confirmChallan = async (id: number, userId: number) => {
  return await prisma.$transaction(async (tx) => {
    // Lock challan row
    const [challan]: any[] = await tx.$queryRaw`SELECT * FROM challans WHERE id = ${id} FOR UPDATE`;
    if (!challan) throw new ApiError(404, 'Challan not found');
    if (challan.status !== 'DRAFT') throw new ApiError(400, 'Only DRAFT challans can be confirmed');

    const items = await tx.challanItem.findMany({ where: { challanId: id } });
    const insufficientStock: any[] = [];

    // Verify stock and update
    for (const item of items) {
      // Lock product row
      const [product]: any[] = await tx.$queryRaw`SELECT * FROM products WHERE id = ${item.productId} FOR UPDATE`;
      if (!product) throw new ApiError(404, `Product ${item.productId} not found`);
      
      if (product.current_stock < item.quantity) {
        insufficientStock.push({ product: product.product_name, requested: item.quantity, available: product.current_stock });
      }
    }

    if (insufficientStock.length > 0) {
      throw new ApiError(400, `Insufficient stock for products: ${JSON.stringify(insufficientStock)}`);
    }

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: { decrement: item.quantity } }
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          movementType: 'OUT',
          reason: `Challan ${challan.challan_number} confirmed`,
          createdById: userId
        }
      });
    }

    return await tx.challan.update({
      where: { id },
      data: { status: 'CONFIRMED' }
    });
  });
};

export const cancelChallan = async (id: number, userId: number) => {
  return await prisma.$transaction(async (tx) => {
    const [challan]: any[] = await tx.$queryRaw`SELECT * FROM challans WHERE id = ${id} FOR UPDATE`;
    if (!challan) throw new ApiError(404, 'Challan not found');
    
    if (challan.status === 'CANCELLED') return challan;
    
    if (challan.status === 'CONFIRMED') {
      const items = await tx.challanItem.findMany({ where: { challanId: id } });
      for (const item of items) {
        // Lock product row
        await tx.$queryRaw`SELECT * FROM products WHERE id = ${item.productId} FOR UPDATE`;
        
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { increment: item.quantity } }
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: 'IN',
            reason: `Challan ${challan.challan_number} cancelled`,
            createdById: userId
          }
        });
      }
    }

    return await tx.challan.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
  });
};
