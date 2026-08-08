import { PrismaClient, Prisma, MovementType } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { formatPagination } from '../utils/helpers';

const prisma = new PrismaClient();

export const getAllProducts = async (page = 1, limit = 10, search?: string, category?: string) => {
  const skip = (page - 1) * limit;
  const where: Prisma.ProductWhereInput = {};
  
  if (search) {
    where.OR = [
      { productName: { contains: search } },
      { sku: { contains: search } }
    ];
  }
  if (category) where.category = { contains: category };

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where })
  ]);
  return { products, pagination: formatPagination(page, limit, total) };
};

export const getProductById = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      stockMovements: { include: { createdBy: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 5 }
    }
  });
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

export const createProduct = async (data: Prisma.ProductCreateInput) => {
  return await prisma.product.create({ data });
};

export const updateProduct = async (id: number, data: Prisma.ProductUpdateInput) => {
  return await prisma.product.update({ where: { id }, data });
};

export const deleteProduct = async (id: number) => {
  const itemsCount = await prisma.challanItem.count({ where: { productId: id } });
  if (itemsCount > 0) {
    throw new ApiError(400, 'Cannot delete product referenced in challans');
  }
  await prisma.product.delete({ where: { id } });
  return true;
};

export const getLowStockProducts = async () => {
  const raw = await prisma.$queryRaw`SELECT * FROM products WHERE current_stock <= minimum_stock ORDER BY current_stock ASC` as any[];
  return raw.map((p: any) => ({
    id: p.id,
    productName: p.product_name || p.productName,
    sku: p.sku,
    category: p.category,
    unitPrice: p.unit_price || p.unitPrice,
    currentStock: p.current_stock ?? p.currentStock,
    minimumStock: p.minimum_stock ?? p.minimumStock,
    warehouseLocation: p.warehouse_location || p.warehouseLocation,
    createdAt: p.created_at || p.createdAt,
    updatedAt: p.updated_at || p.updatedAt,
  }));
};

export const adjustStock = async (productId: number, quantity: number, movementType: MovementType, reason: string, userId: number) => {
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new ApiError(404, 'Product not found');

    if (movementType === 'OUT' && product.currentStock < quantity) {
      throw new ApiError(400, 'Insufficient stock');
    }

    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: {
        currentStock: movementType === 'IN' ? { increment: quantity } : { decrement: quantity }
      }
    });

    await tx.stockMovement.create({
      data: {
        productId,
        quantity,
        movementType,
        reason,
        createdById: userId
      }
    });

    return updatedProduct;
  });
};

export const getStockMovements = async (page = 1, limit = 10, productId?: number) => {
  const skip = (page - 1) * limit;
  const where = productId ? { productId } : {};
  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where, skip, take: limit,
      include: { product: { select: { productName: true } }, createdBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.stockMovement.count({ where })
  ]);
  return { movements, pagination: formatPagination(page, limit, total) };
};
