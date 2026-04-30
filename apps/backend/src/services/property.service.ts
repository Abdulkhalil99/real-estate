import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/error.middleware';
import { CONSTANTS } from '../config/constants';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  UpdateStatusDto,
  PropertyQueryDto,
} from '../validators/property.validator';

// Fields to always include when returning a property in a LIST
// We keep this lean — no full inquiry list in list view
const propertyListSelect = {
  id:          true,
  title:       true,
  description: true,
  price:       true,
  status:      true,
  type:        true,
  city:        true,
  state:       true,
  address:     true,
  zipCode:     true,
  country:     true,
  bedrooms:    true,
  bathrooms:   true,
  area:        true,
  yearBuilt:   true,
  featured:    true,
  agentId:     true,
  createdAt:   true,
  updatedAt:   true,
  // Only the primary image for list cards
  images: {
    where:   { isPrimary: true },
    take:    1,
    select:  { id: true, url: true, alt: true },
  },
  // Agent name and phone for contact
  agent: {
    select: { id: true, firstName: true, lastName: true, phone: true, avatar: true },
  },
  // Just the count of inquiries — not the full list
  _count: {
    select: { inquiries: true },
  },
};

export const propertyService = {

  // ── GET ALL ──────────────────────────────────────────────────────────────────
  async findAll(query: PropertyQueryDto) {
    const page  = parseInt(query.page,  10);
    const limit = Math.min(parseInt(query.limit, 10), CONSTANTS.MAX_LIMIT);
    const skip  = (page - 1) * limit;

    // Build WHERE clause dynamically
    // Only add a filter if the query param was actually provided
    const where: Prisma.PropertyWhereInput = {};

    // Full-text search across multiple fields
    if (query.q) {
      where.OR = [
        { title:       { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
        { city:        { contains: query.q, mode: 'insensitive' } },
        { address:     { contains: query.q, mode: 'insensitive' } },
      ];
    }

    if (query.city)    where.city    = { contains: query.city,  mode: 'insensitive' };
    if (query.state)   where.state   = { contains: query.state, mode: 'insensitive' };
    if (query.status)  where.status  = query.status;
    if (query.type)    where.type    = query.type;
    if (query.bedrooms) where.bedrooms = parseInt(query.bedrooms, 10);
    if (query.featured) where.featured = query.featured === 'true';

    // Price range filter
    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
      if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
    }

    // Build ORDER BY clause
    const orderBy: Prisma.PropertyOrderByWithRelationInput = {
      [query.sortBy]: query.sortOrder,
    };

    // Run COUNT and DATA queries in parallel — twice as fast as sequential
    const [total, items] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        skip,
        take:    limit,
        orderBy,
        select:  propertyListSelect,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  // ── GET FEATURED ─────────────────────────────────────────────────────────────
  async findFeatured() {
    return prisma.property.findMany({
      where:   { featured: true, status: { in: ['FOR_SALE', 'FOR_RENT'] } },
      take:    6,
      orderBy: { createdAt: 'desc' },
      select:  propertyListSelect,
    });
  },

  // ── GET ONE ──────────────────────────────────────────────────────────────────
  async findById(id: string) {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        // Full image list ordered by display order
        images: {
          orderBy: { order: 'asc' },
          select:  { id: true, url: true, alt: true, isPrimary: true, order: true },
        },
        // Full agent info for contact section
        agent: {
          select: {
            id: true, firstName: true, lastName: true,
            phone: true, email: true, avatar: true,
          },
        },
        // Latest 5 inquiries (for agent dashboard view)
        inquiries: {
          orderBy: { createdAt: 'desc' },
          take:    5,
          select:  {
            id: true, name: true, email: true,
            message: true, status: true, createdAt: true,
          },
        },
        _count: { select: { inquiries: true } },
      },
    });

    if (!property) throw new AppError('Property not found', 404);
    return property;
  },

  // ── GET MY PROPERTIES ────────────────────────────────────────────────────────
  // Properties listed by the currently logged-in agent
  async findByAgent(agentId: string, query: PropertyQueryDto) {
    const page  = parseInt(query.page,  10);
    const limit = Math.min(parseInt(query.limit, 10), CONSTANTS.MAX_LIMIT);
    const skip  = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = { agentId };
    if (query.status) where.status = query.status;

    const [total, items] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { createdAt: 'desc' },
        select:  propertyListSelect,
      }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  },

  // ── CREATE ───────────────────────────────────────────────────────────────────
  async create(dto: CreatePropertyDto, agentId: string) {
    // Destructure images out so we handle them separately
    const { images: imageUrls, ...propertyData } = dto;

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        agentId,
        // Create all images in the same DB transaction
        images: {
          create: imageUrls.map((url, index) => ({
            url,
            isPrimary: index === 0,   // first image = thumbnail
            order:     index + 1,
          })),
        },
      },
      include: {
        images: true,
        agent: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return property;
  },

  // ── UPDATE ───────────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdatePropertyDto, requesterId: string, requesterRole: string) {
    // 1. Check property exists
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) throw new AppError('Property not found', 404);

    // 2. Check ownership — only the agent who listed it or an admin can update
    if (existing.agentId !== requesterId && requesterRole !== 'ADMIN') {
      throw new AppError('You can only update your own properties', 403);
    }

    const { images: imageUrls, ...propertyData } = dto;

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...propertyData,
        // Only replace images if new ones were provided
        ...(imageUrls !== undefined && {
          images: {
            // Delete ALL existing images first
            deleteMany: {},
            // Create the new set
            create: imageUrls.map((url, index) => ({
              url,
              isPrimary: index === 0,
              order:     index + 1,
            })),
          },
        }),
      },
      include: {
        images: { orderBy: { order: 'asc' } },
        agent:  { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return property;
  },

  // ── UPDATE STATUS ONLY ───────────────────────────────────────────────────────
  // Quick endpoint to mark a property as SOLD without sending all fields
  async updateStatus(id: string, dto: UpdateStatusDto, requesterId: string, requesterRole: string) {
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) throw new AppError('Property not found', 404);

    if (existing.agentId !== requesterId && requesterRole !== 'ADMIN') {
      throw new AppError('You can only update your own properties', 403);
    }

    return prisma.property.update({
      where: { id },
      data:  { status: dto.status },
      select: {
        id: true, title: true, status: true, updatedAt: true,
      },
    });
  },

  // ── DELETE ───────────────────────────────────────────────────────────────────
  async delete(id: string, requesterId: string, requesterRole: string) {
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) throw new AppError('Property not found', 404);

    if (existing.agentId !== requesterId && requesterRole !== 'ADMIN') {
      throw new AppError('You can only delete your own properties', 403);
    }

    // Cascade delete in schema handles images + inquiries automatically
    await prisma.property.delete({ where: { id } });
  },

  // ── STATS ────────────────────────────────────────────────────────────────────
  // For admin dashboard — aggregate counts per status
  async getStats() {
    const [total, forSale, forRent, sold, rented, featured] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: 'FOR_SALE' } }),
      prisma.property.count({ where: { status: 'FOR_RENT' } }),
      prisma.property.count({ where: { status: 'SOLD'     } }),
      prisma.property.count({ where: { status: 'RENTED'   } }),
      prisma.property.count({ where: { featured: true     } }),
    ]);

    return { total, forSale, forRent, sold, rented, featured };
  },
};