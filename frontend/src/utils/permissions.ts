import { Role } from '../types';

export const canAccessCustomers = (role?: Role) => {
  return ['ADMIN', 'SALES', 'ACCOUNTS'].includes(role || '');
};

export const canModifyCustomers = (role?: Role) => {
  return ['ADMIN', 'SALES'].includes(role || '');
};

export const canAccessProducts = (role?: Role) => {
  return ['ADMIN', 'WAREHOUSE', 'ACCOUNTS', 'SALES'].includes(role || '');
};

export const canModifyProducts = (role?: Role) => {
  return ['ADMIN', 'WAREHOUSE'].includes(role || '');
};

export const canManageStock = (role?: Role) => {
  return ['ADMIN', 'WAREHOUSE'].includes(role || '');
};

export const canAccessChallans = (role?: Role) => {
  return ['ADMIN', 'SALES', 'ACCOUNTS'].includes(role || '');
};

export const canCreateChallans = (role?: Role) => {
  return ['ADMIN', 'SALES'].includes(role || '');
};

export const canConfirmChallans = (role?: Role) => {
  return ['ADMIN', 'SALES', 'ACCOUNTS'].includes(role || '');
};

export const canManageUsers = (role?: Role) => {
  return role === 'ADMIN';
};

export const canViewStockMovements = (role?: Role) => {
  return ['ADMIN', 'WAREHOUSE', 'ACCOUNTS'].includes(role || '');
};
