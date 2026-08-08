import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async () => {
  const [
    totalCustomers,
    totalProducts,
    totalChallans,
    draftChallans,
    confirmedChallans,
    cancelledChallans,
    recentChallans
  ] = await Promise.all([
    prisma.customer.count({ where: { isDeleted: false } }),
    prisma.product.count(),
    prisma.challan.count(),
    prisma.challan.count({ where: { status: 'DRAFT' } }),
    prisma.challan.count({ where: { status: 'CONFIRMED' } }),
    prisma.challan.count({ where: { status: 'CANCELLED' } }),
    prisma.challan.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { customer: { select: { customerName: true } }, createdBy: { select: { name: true } } } })
  ]);

  const rawLowStock = await prisma.$queryRaw`SELECT * FROM products WHERE current_stock <= minimum_stock ORDER BY current_stock ASC` as any[];
  const lowStockProductsList = rawLowStock.map((p: any) => ({
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

  return {
    totalCustomers,
    totalProducts,
    lowStockCount: lowStockProductsList.length,
    totalChallans,
    challansByStatus: {
      draft: draftChallans,
      confirmed: confirmedChallans,
      cancelled: cancelledChallans
    },
    lowStockProducts: lowStockProductsList,
    recentChallans
  };
};
