import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { userService } from '../services/user.service';
import { UnauthorizedError } from '../utils/errors';

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const profile = await userService.getProfile(userId);
      res.status(200).json({
        status: 'success',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const updated = await userService.updateProfile(userId, req.body);
      res.status(200).json({
        status: 'success',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      await userService.deleteAccount(userId);
      res.status(200).json({
        status: 'success',
        message: 'Account successfully soft-deleted',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
