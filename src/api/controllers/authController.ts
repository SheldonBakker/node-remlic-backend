import type { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../../shared/utils/response';
import { HTTP_STATUS } from '../../shared/constants/httpStatus';
import AuthService from '../../infrastructure/database/auth/authMethods';
import { AuthValidation } from '../../infrastructure/database/auth/validation';

export default class AuthController {
  public static signup = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const validatedData = AuthValidation.validateSignup(req.body);
    const result = await AuthService.signup(validatedData);

    ResponseUtil.success(res, result, HTTP_STATUS.CREATED);
  };
}
