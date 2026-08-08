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

  const lowStockProductsList = await prisma.$queryRaw`SELECT * FROM products WHERE current_stock <= minimum_stock ORDER BY current_stock ASC` as any[];

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
