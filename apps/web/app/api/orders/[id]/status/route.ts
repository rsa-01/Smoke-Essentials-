import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@smoke-essentials/db';
import { z } from 'zod';
import { verifyAuth } from '../../../../../lib/auth-middleware';

const prisma = new PrismaClient();

const updateStatusSchema = z.object({
    status: z.enum(['PENDING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
});

export async function PATCH(
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
        const { status } = updateStatusSchema.parse(body);

        const order = await prisma.order.update({
            where: { id },
            data: { status },
            include: {
                items: { include: { product: true } },
                address: true,
            },
        });

        return NextResponse.json({ success: true, data: order });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Validation failed',
                details: error.errors,
            }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'Failed to update order status' }, { status: 500 });
    }
}
