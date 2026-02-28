import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const createAddressSchema = z.object({
    label: z.string().min(1),
    fullAddress: z.string().min(5),
    lat: z.number(),
    lng: z.number(),
    isDefault: z.boolean().optional(),
});

// GET /addresses
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const addresses = await prisma.address.findMany({
            where: { userId: req.userId },
            orderBy: { isDefault: 'desc' },
        });

        res.json({ success: true, data: addresses });
    } catch (error) {
        console.error('List addresses error:', error);
        res.status(500).json({ success: false, error: 'Failed to list addresses' });
    }
});

// POST /addresses
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const data = createAddressSchema.parse(req.body);

        // If this is default, unset other defaults
        if (data.isDefault) {
            await prisma.address.updateMany({
                where: { userId: req.userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        const address = await prisma.address.create({
            data: {
                ...data,
                userId: req.userId!,
            },
        });

        res.status(201).json({ success: true, data: address });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.errors,
            });
        }
        console.error('Create address error:', error);
        res.status(500).json({ success: false, error: 'Failed to create address' });
    }
});

// DELETE /addresses/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const address = await prisma.address.findFirst({
            where: { id: req.params.id, userId: req.userId },
        });

        if (!address) {
            return res.status(404).json({ success: false, error: 'Address not found' });
        }

        await prisma.address.delete({ where: { id: req.params.id } });

        res.json({ success: true, message: 'Address deleted' });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete address' });
    }
});

export default router;
