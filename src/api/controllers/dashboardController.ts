import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../shared/types/request';
import { ResponseUtil } from '../../shared/utils/response';
import { HTTP_STATUS } from '../../shared/constants/httpStatus';
import { HttpError } from '../../shared/types/errors/appError';
import DashboardService from '../../infrastructure/database/dashboard/dashboardMethods';
import { DashboardValidation } from '../../infrastructure/database/dashboard/validation';
import { PaginationUtil } from '../../shared/utils/pagination';

export default class DashboardController {
  public static getUpcomingExpiries = async (
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError(HTTP_STATUS.UNAUTHORIZED, 'User not authenticated');
    }

    const params = PaginationUtil.parseQuery(req.query);
    const filters = DashboardValidation.validateFilters(req.query);
    const { items, pagination } = await DashboardService.getUpcomingExpiries(userId, params, filters);
    ResponseUtil.success(res, { expiring_records: items }, HTTP_STATUS.OK, pagination);
  };
}
