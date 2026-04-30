import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../types';
import { asyncHandler, asyncAuthHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, HttpError } from '../utils/apiResponse';

export const authController = {

  // POST /api/v1/auth/register
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    sendCreated(res, result, 'Account created successfully');
  }),

  // POST /api/v1/auth/login
  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 'Login successful');
  }),

  // POST /api/v1/auth/refresh
  // Client sends: { refreshToken: "..." }
  refresh: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      HttpError.badRequest(res, 'Refresh token is required');
      return;
    }
    const result = await authService.refresh(refreshToken);
    sendSuccess(res, result, 'Token refreshed');
  }),

  // POST /api/v1/auth/logout
  logout: asyncAuthHandler(async (req: AuthRequest, res: Response) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    sendSuccess(res, null, 'Logged out successfully');
  }),

  // POST /api/v1/auth/logout-all
  logoutAll: asyncAuthHandler(async (req: AuthRequest, res: Response) => {
    await authService.logoutAll(req.user!.userId);
    sendSuccess(res, null, 'Logged out from all devices');
  }),

  // GET /api/v1/auth/me
  getMe: asyncAuthHandler(async (req: AuthRequest, res: Response) => {
    const user = await authService.getProfile(req.user!.userId);
    sendSuccess(res, user);
  }),

  // PUT /api/v1/auth/me
  updateMe: asyncAuthHandler(async (req: AuthRequest, res: Response) => {
    const user = await authService.updateProfile(req.user!.userId, req.body);
    sendSuccess(res, user, 'Profile updated successfully');
  }),

  // POST /api/v1/auth/change-password
  changePassword: asyncAuthHandler(async (req: AuthRequest, res: Response) => {
    await authService.changePassword(req.user!.userId, req.body);
    sendSuccess(res, null, 'Password changed successfully');
  }),
};