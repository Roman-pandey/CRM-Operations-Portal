import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/ApiError';
import { formatPagination } from '../utils/helpers';

const prisma = new PrismaClient();

export const getAllUsers = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({ skip, take: limit, select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true } }),
    prisma.user.count()
  ]);
  return { users, pagination: formatPagination(page, limit, total) };
};

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true } });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

export const createUser = async (data: Prisma.UserCreateInput) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new ApiError(400, 'Email already in use');
  data.password = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({ data });
  const { password, ...withoutPassword } = user;
  return withoutPassword;
};

export const updateUser = async (id: number, data: Prisma.UserUpdateInput) => {
  if (data.password && typeof data.password === 'string') {
    data.password = await bcrypt.hash(data.password, 10);
  }
  const user = await prisma.user.update({ where: { id }, data });
  const { password, ...withoutPassword } = user;
  return withoutPassword;
};

export const deleteUser = async (id: number) => {
  await prisma.user.delete({ where: { id } });
  return true;
};
