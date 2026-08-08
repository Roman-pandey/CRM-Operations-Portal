import { Request } from 'express';
import { Role } from '@prisma/client';

export interface UserPayload {
  id: number;
  email: string;
  role: Role;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
