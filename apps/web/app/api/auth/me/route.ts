import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@smoke-essentials/db';
import { verifyAuth } from '../../../../lib/auth-middleware';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const auth = verifyAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: auth.userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isAgeVerified: true,
                createdAt: true,
                updatedAt: true,
                addresses: true,
            },
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to get user' }, { status: 500 });
    }
}
