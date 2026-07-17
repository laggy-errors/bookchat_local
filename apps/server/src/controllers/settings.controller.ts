import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { settingsService } from '../services/settings.service';
import { UnauthorizedError } from '../utils/errors';

export class SettingsController {
  async getThemePreference(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const pref = await settingsService.getThemePreference(userId);
      res.status(200).json({
        status: 'success',
        data: pref,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateThemePreference(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const pref = await settingsService.updateThemePreference(userId, req.body);
      res.status(200).json({
        status: 'success',
        data: pref,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const settingsController = new SettingsController();
