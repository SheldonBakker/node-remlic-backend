import type { Request } from 'express';
import type { UserRole } from '../../api/middleware/authMiddleware';
import type { IUserPermissions } from '../../infrastructure/database/subscriptions/types';

export interface IAuthUser {
  id: string;
  email?: string;
  role?: string;
  appRole: UserRole | null;
  permissions?: IUserPermissions;
}

export interface AuthenticatedRequest extends Request {
  user?: IAuthUser;
  requestId?: string;
}
