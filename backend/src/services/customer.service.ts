import { PrismaClient, Prisma, CustomerType, CustomerStatus } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { formatPagination } from '../utils/helpers';

const prisma = new PrismaClient();

export const getAllCustomers = async (page = 1, limit = 10, search?: string, status?: string, customerType?: string) => {
  const skip = (page - 1) * limit;
  const where: Prisma.CustomerWhereInput = { isDeleted: false };
  
  if (search) {
    where.OR = [
      { customerName: { contains: search } },
      { businessName: { contains: search } },
      { mobile: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (status) where.status = status as CustomerStatus;
  if (customerType) where.customerType = customerType as CustomerType;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.customer.count({ where })
  ]);
  return { customers, pagination: formatPagination(page, limit, total) };
};

export const getCustomerById = async (id: number) => {
  const customer = await prisma.customer.findUnique({
    where: { id, isDeleted: false },
    include: {
      followups: { include: { createdBy: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }
    }
  });
  if (!customer) throw new ApiError(404, 'Customer not found');
  return customer;
};

export const createCustomer = async (data: Prisma.CustomerCreateInput) => {
  return await prisma.customer.create({ data });
};

export const updateCustomer = async (id: number, data: Prisma.CustomerUpdateInput) => {
  return await prisma.customer.update({ where: { id }, data });
};

export const deleteCustomer = async (id: number) => {
  await prisma.customer.update({ where: { id }, data: { isDeleted: true } });
  return true;
};

export const getFollowups = async (customerId: number) => {
  return await prisma.customerFollowup.findMany({
    where: { customerId },
    include: { createdBy: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  });
};

export const createFollowup = async (customerId: number, data: any, userId: number) => {
  return await prisma.customerFollowup.create({
    data: {
      customerId,
      followUpDate: data.followUpDate,
      notes: data.notes,
      createdById: userId
    }
  });
};
