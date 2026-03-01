import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../shared/types/request.js';
import { ResponseUtil } from '../../shared/utils/response.js';
import { HTTP_STATUS } from '../../shared/constants/httpStatus.js';
import { requireUser } from '../../shared/utils/authHelpers.js';
import { DeviceTokenValidation } from '../../infrastructure/database/device_tokens/validation.js';
import { registerToken, deleteToken } from '../../infrastructure/database/device_tokens/deviceTokenMethods.js';

export const register = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: userId } = requireUser(req);
    const { player_id } = DeviceTokenValidation.validateRegister(req.body);
    const token = await registerToken({ profile_id: userId, player_id });
    ResponseUtil.success(res, { token }, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: userId } = requireUser(req);
    const playerId = String(req.params['playerId'] ?? '');
    await deleteToken(userId, playerId);
    res.status(HTTP_STATUS.NO_CONTENT).end();
  } catch (error) {
    next(error);
  }
};
