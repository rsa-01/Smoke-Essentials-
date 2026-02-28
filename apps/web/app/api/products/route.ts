import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@smoke-essentials/db';
import { z } from 'zod';
import { verifyAuth } from '../../../lib/auth-middleware';

const prisma = new PrismaClient();

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

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const brand = searchParams.get('brand');
        const priceMin = searchParams.get('priceMin');
        const priceMax = searchParams.get('priceMax');
        const search = searchParams.get('search');
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '12';

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

        return NextResponse.json({
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
        return NextResponse.json({ success: false, error: 'Failed to list products' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = verifyAuth(req);
        if (!auth || auth.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const data = createProductSchema.parse(body);

        const product = await prisma.product.create({ data });

        return NextResponse.json({ success: true, data: product }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Validation failed',
                details: error.errors,
            }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
    }
}
