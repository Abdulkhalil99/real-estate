import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../types';
import { asyncHandler, asyncAuthHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../utils/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { CreateInquiryDto, UpdateInquiryStatusDto } from '../validators/inquiry.validator';

export const inquiryController = {

  // POST /api/v1/inquiries  — public
  create: asyncHandler(async (req: Request, res: Response) => {
    const dto: CreateInquiryDto = req.body;

    // Verify property exists before creating inquiry
    const property = await prisma.property.findUnique({
      where:  { id: dto.propertyId },
      select: { id: true, title: true },
    });
    if (!property) throw new AppError('Property not found', 404);

    const inquiry = await prisma.inquiry.create({
      data: {
        name:       dto.name,
        email:      dto.email,
        phone:      dto.phone,
        message:    dto.message,
        propertyId: dto.propertyId,
      },
      include: {
        property: { select: { id: true, title: true, city: true } },
      },
    });

    sendCreated(res, inquiry, 'Inquiry submitted successfully');
  }),

  // GET /api/v1/inquiries  — agent/admin only
  getAll: asyncAuthHandler(async (req: AuthRequest, res: Response) => {
    const page  = parseInt((req.query.page  as string) || '1',  10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const skip  = (page - 1) * limit;

    // Agents see only inquiries on THEIR properties
    // Admins see ALL inquiries
    const where = req.user!.role === 'ADMIN'
      ? {}
      : { property: { agentId: req.user!.userId } };

    const [total, items] = await Promise.all([
      prisma.inquiry.count({ where }),
      prisma.inquiry.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: { select: { id: true, title: true, city: true } },
        },
      }),
    ]);

    sendSuccess(res, {
      items,
      pagination: {
        total, page, limit,
        totalPages:  Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  }),

  // GET /api/v1/inquiries/:id  — agent/admin only
  getOne: asyncAuthHandler(async (req: AuthRequest, res: Response) => {
    const inquiry = await prisma.inquiry.findUnique({
      where:   { id: req.params.id },
      include: {
        property: { select: { id: true, title: true, city: true, agentId: true } },
      },
    });

    if (!inquiry) throw new AppError('Inquiry not found', 404);

    // Agent can only see inquiries on their own properties
    if (
      req.user!.role !== 'ADMIN' &&
      inquiry.property.agentId !== req.user!.userId
    ) {
      throw new AppError('You do not have access to this inquiry', 403);
    }

    sendSuccess(res, inquiry);
  }),

  // PUT /api/v1/inquiries/:id/status  — agent/admin only
  updateStatus: asyncAuthHandler(async (req: AuthRequest, res: Response) => {
    const dto: UpdateInquiryStatusDto = req.body;

    const inquiry = await prisma.inquiry.findUnique({
      where:   { id: req.params.id },
      include: { property: { select: { agentId: true } } },
    });

    if (!inquiry) throw new AppError('Inquiry not found', 404);

    if (
      req.user!.role !== 'ADMIN' &&
      inquiry.property.agentId !== req.user!.userId
    ) {
      throw new AppError('You do not have access to this inquiry', 403);
    }

    const updated = await prisma.inquiry.update({
      where: { id: req.params.id },
      data:  { status: dto.status },
    });

    sendSuccess(res, updated, 'Inquiry status updated');
  }),
};