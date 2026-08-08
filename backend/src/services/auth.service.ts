import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { config } from '../config';

const prisma = new PrismaClient();

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = jwt.sign({ id: user.id }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN as any });
  const { password: _, ...userWithoutPassword } = user;

  return { token, user: userWithoutPassword };
};

export const getCurrentUser = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
