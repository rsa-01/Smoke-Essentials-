import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@smoke-essentials/db';
import { verifyAuth } from '../../../../lib/auth-middleware';

const prisma = new PrismaClient();

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const auth = verifyAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        const where: any = { id };
        if (auth.role !== 'ADMIN') {
            where.userId = auth.userId;
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
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: order });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to get order' }, { status: 500 });
    }
}
