import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@smoke-essentials/db';
import { z } from 'zod';
import { verifyAuth } from '../../../../lib/auth-middleware';

const prisma = new PrismaClient();

const updateProductSchema = z.object({
    name: z.string().min(1),
    brand: z.string().min(1),
    description: z.string().min(1),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    category: z.enum(['CIGARETTE', 'CONDOM', 'COMBO', 'OTHER']),
    imageUrl: z.string().url().or(z.string().startsWith('/')),
    packSize: z.string().min(1),
}).partial();

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product || !product.isActive) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to get product' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const auth = verifyAuth(req);
        if (!auth || auth.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        const body = await req.json();
        const data = updateProductSchema.parse(body);

        const product = await prisma.product.update({
            where: { id },
            data,
        });

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Validation failed',
                details: error.errors,
            }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const auth = verifyAuth(req);
        if (!auth || auth.role !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        await prisma.product.update({
            where: { id },
            data: { isActive: false },
        });

        return NextResponse.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
    }
}
