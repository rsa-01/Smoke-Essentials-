import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@smoke-essentials/db';
import { verifyAuth } from '../../../../lib/auth-middleware';

const prisma = new PrismaClient();

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const auth = verifyAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;

        const address = await prisma.address.findFirst({
            where: { id: id, userId: auth.userId },
        });

        if (!address) {
            return NextResponse.json({ success: false, error: 'Address not found' }, { status: 404 });
        }

        await prisma.address.delete({ where: { id: id } });

        return NextResponse.json({ success: true, message: 'Address deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete address' }, { status: 500 });
    }
}
