import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminOnly } from '../middleware/role';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createOrderSchema = z.object({
    addressId: z.string().min(1),
    deliveryNotes: z.string().optional(),
    items: z.array(z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
    })).min(1, 'Order must have at least one item'),
});

const updateStatusSchema = z.object({
    status: z.enum(['PENDING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
});

// POST /orders — create order
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const data = createOrderSchema.parse(req.body);

        // Validate address belongs to user
        const address = await prisma.address.findFirst({
            where: { id: data.addressId, userId: req.userId },
        });

        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Invalid delivery address',
            });
        }

        // Validate products and stock
        const productIds = data.items.map(item => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds }, isActive: true },
        });

        if (products.length !== productIds.length) {
            return res.status(400).json({
                success: false,
                error: 'One or more products not found or inactive',
            });
        }

        // Check stock availability
        for (const item of data.items) {
            const product = products.find(p => p.id === item.productId);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    error: `Insufficient stock for ${product?.name || 'unknown product'}`,
                });
            }
        }

        // Calculate total
        const deliveryFee = 50;
        const orderItems = data.items.map(item => {
            const product = products.find(p => p.id === item.productId)!;
            return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: product.price,
            };
        });

        const subtotal = orderItems.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity,
            0
        );

        // Create order in transaction
        const order = await prisma.$transaction(async (tx) => {
            // Deduct stock
            for (const item of data.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            // Create order with items
            return tx.order.create({
                data: {
                    userId: req.userId!,
                    addressId: data.addressId,
                    totalAmount: subtotal + deliveryFee,
                    deliveryFee,
                    deliveryNotes: data.deliveryNotes,
                    items: {
                        create: orderItems,
                    },
                },
                include: {
                    items: { include: { product: true } },
                    address: true,
                },
            });
        });

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.errors,
            });
        }
        console.error('Create order error:', error);
        res.status(500).json({ success: false, error: 'Failed to create order' });
    }
});

// GET /orders — list user's orders (or all for admin)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { page = '1', limit = '10', status } = req.query;
        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        // Non-admin can only see their own orders
        if (req.userRole !== 'ADMIN') {
            where.userId = req.userId;
        }

        if (status) {
            where.status = status as string;
        }

        const [items, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: { include: { product: true } },
                    address: true,
                    user: {
                        select: { id: true, name: true, email: true, phone: true },
                    },
                },
            }),
            prisma.order.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                items,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('List orders error:', error);
        res.status(500).json({ success: false, error: 'Failed to list orders' });
    }
});

// GET /orders/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const where: any = { id: req.params.id };
        if (req.userRole !== 'ADMIN') {
            where.userId = req.userId;
        }

        const order = await prisma.order.findFirst({
            where,
            include: {
                items: { include: { product: true } },
                address: true,
                user: {
                    select: { id: true, name: true, email: true, phone: true },
                },
            },
        });

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        res.json({ success: true, data: order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ success: false, error: 'Failed to get order' });
    }
});

// PATCH /orders/:id/status (ADMIN only)
router.patch('/:id/status', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const { status } = updateStatusSchema.parse(req.body);

        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: { status },
            include: {
                items: { include: { product: true } },
                address: true,
            },
        });

        res.json({ success: true, data: order });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.errors,
            });
        }
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, error: 'Failed to update order status' });
    }
});

export default router;
