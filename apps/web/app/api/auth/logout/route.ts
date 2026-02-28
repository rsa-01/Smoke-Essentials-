import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@smoke-essentials/db';
import { verifyAuth } from '../../../../lib/auth-middleware';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const auth = verifyAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const refreshToken = body.refreshToken;
        if (refreshToken) {
            await prisma.refreshToken.deleteMany({
                where: { token: refreshToken },
            });
        }

        return NextResponse.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 });
    }
}
