import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminOnly } from '../middleware/role';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createProductSchema = z.object({
    name: z.string().min(1),
    brand: z.string().min(1),
    description: z.string().min(1),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    category: z.enum(['CIGARETTE', 'CONDOM', 'COMBO', 'OTHER']),
    imageUrl: z.string().url().or(z.string().startsWith('/')),
    packSize: z.string().min(1),
});

const updateProductSchema = createProductSchema.partial();

// GET /products — list with filters and pagination
router.get('/', async (req, res: Response) => {
    try {
        const {
            category,
            brand,
            priceMin,
            priceMax,
            search,
            page = '1',
            limit = '12',
        } = req.query;

        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
        const skip = (pageNum - 1) * limitNum;

        const where: any = { isActive: true };

        if (category) where.category = category as string;
        if (brand) where.brand = brand as string;
        if (priceMin || priceMax) {
            where.price = {};
            if (priceMin) where.price.gte = parseFloat(priceMin as string);
            if (priceMax) where.price.lte = parseFloat(priceMax as string);
        }
        if (search) {
            where.OR = [
                { name: { contains: search as string } },
                { brand: { contains: search as string } },
                { description: { contains: search as string } },
            ];
        }

        const [items, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where }),
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
        console.error('List products error:', error);
        res.status(500).json({ success: false, error: 'Failed to list products' });
    }
});

// GET /products/:id
router.get('/:id', async (req, res: Response) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
        });

        if (!product || !product.isActive) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.json({ success: true, data: product });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ success: false, error: 'Failed to get product' });
    }
});

// POST /products (ADMIN only)
router.post('/', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const data = createProductSchema.parse(req.body);

        const product = await prisma.product.create({ data });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.errors,
            });
        }
        console.error('Create product error:', error);
        res.status(500).json({ success: false, error: 'Failed to create product' });
    }
});

// PUT /products/:id (ADMIN only)
router.put('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        const data = updateProductSchema.parse(req.body);

        const product = await prisma.product.update({
            where: { id: req.params.id },
            data,
        });

        res.json({ success: true, data: product });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.errors,
            });
        }
        console.error('Update product error:', error);
        res.status(500).json({ success: false, error: 'Failed to update product' });
    }
});

// DELETE /products/:id — soft delete (ADMIN only)
router.delete('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.product.update({
            where: { id: req.params.id },
            data: { isActive: false },
        });

        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete product' });
    }
});

export default router;
