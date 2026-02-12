import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../shared/types/request';
import { ResponseUtil } from '../../shared/utils/response';
import { HTTP_STATUS } from '../../shared/constants/httpStatus';
import { HttpError } from '../../shared/types/errors/appError';
import PermissionsService from '../../infrastructure/database/permissions/permissionsMethods';
import { PermissionsValidation } from '../../infrastructure/database/permissions/validation';
import { PaginationUtil } from '../../shared/utils/pagination';

export default class PermissionsController {
  public static getPermissions = async (
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const params = PaginationUtil.parseQuery(req.query);
    const { items, pagination } = await PermissionsService.getPermissions(params);
    ResponseUtil.success(res, { permissions: items }, HTTP_STATUS.OK, pagination);
  };

  public static getPermissionById = async (
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const permissionId = PermissionsValidation.validatePermissionId(req.params.id);
    const permission = await PermissionsService.getPermissionById(permissionId);
    ResponseUtil.success(res, { permission }, HTTP_STATUS.OK);
  };

  public static createPermission = async (
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const validatedData = PermissionsValidation.validateCreatePermission(req.body);
    const permission = await PermissionsService.createPermission(validatedData);
    ResponseUtil.success(res, { permission }, HTTP_STATUS.CREATED);
  };

  public static updatePermission = async (
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const permissionId = PermissionsValidation.validatePermissionId(req.params.id);
    const validatedData = PermissionsValidation.validateUpdatePermission(req.body);
    const permission = await PermissionsService.updatePermission(permissionId, validatedData);
    ResponseUtil.success(res, { permission }, HTTP_STATUS.OK);
  };

  public static deletePermission = async (
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const permissionId = PermissionsValidation.validatePermissionId(req.params.id);
    await PermissionsService.deletePermission(permissionId);
    ResponseUtil.success(res, { message: 'Permission deleted successfully' }, HTTP_STATUS.OK);
  };
}
