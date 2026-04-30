import { Request, Response } from 'express';
import { propertyService } from '../services/property.service';
import { AuthRequest } from '../types';
import { asyncHandler, asyncAuthHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../utils/apiResponse';
import { propertyQuerySchema } from '../validators/property.validator';

export const propertyController = {

  // GET /api/v1/properties
  getAll: asyncHandler(async (req: Request, res: Response) => {
    // Validate and parse query params with Zod
    const query = propertyQuerySchema.parse(req.query);
    const result = await propertyService.findAll(query);
    sendSuccess(res, result);
  }),

  // GET /api/v1/properties/featured
  getFeatured: asyncHandler(async (_req: Request, res: Response) => {
    const properties = await propertyService.findFeatured();
    sendSuccess(res, properties);
  }),

  // GET /api/v1/properties/my  ← must be before /:id or Express matches "my" as an id
  getMy: asyncAuthHandler(async (req: AuthRequest, res: Response) => {
    const query = propertyQuerySchema.parse(req.query);
    const result = await propertyService.findByAgent(req.user!.userId, query);
    sendSuccess(res, result);
  }),

  // GET /api/v1/properties/:id
  getOne: asyncHandler(async (req: Request, res: Response) => {
    const property = await propertyService.findById(req.params.id);
    sendSuccess(res, property);
  }),

  // POST /api/v1/properties
  create: asyncAuthHandler(async (req: AuthRequest, res: Response) => {
    const property = await propertyService.create(req.body, req.user!.userId);
    sendCreated(res, property, 'Property created successfully');
  }),

  // PUT /api/v1/properties/:id
  update: asyncAuthHandler(async (req: AuthRequest, res: Response) => {
    const property = await propertyService.update(
      req.params.id,
      req.body,
      req.user!.userId,
      req.user!.role
    );
    sendSuccess(res, property, 'Property updated successfully');
  }),

  // PUT /api/v1/properties/:id/status
  updateStatus: asyncAuthHandler(async (req: AuthRequest, res: Response) => {
    const property = await propertyService.updateStatus(
      req.params.id,
      req.body,
      req.user!.userId,
      req.user!.role
    );
    sendSuccess(res, property, 'Property status updated');
  }),

  // DELETE /api/v1/properties/:id
  remove: asyncAuthHandler(async (req: AuthRequest, res: Response) => {
    await propertyService.delete(req.params.id, req.user!.userId, req.user!.role);
    sendSuccess(res, null, 'Property deleted successfully');
  }),

  // GET /api/v1/properties/stats
  getStats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await propertyService.getStats();
    sendSuccess(res, stats);
  }),
};