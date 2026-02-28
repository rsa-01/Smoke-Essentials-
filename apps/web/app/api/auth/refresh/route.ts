import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@smoke-essentials/db';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

function generateAccessToken(userId: string, role: string): string {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any }
    );
}

function generateRefreshToken(userId: string, role: string): string {
    return jwt.sign(
        { userId, role },
        process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any }
    );
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { refreshToken } = body;

        if (!refreshToken) {
            return NextResponse.json({
                success: false,
                error: 'Refresh token required',
            }, { status: 400 });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || 'refresh-secret'
        ) as { userId: string; role: string };

        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });

        if (!storedToken || storedToken.expiresAt < new Date()) {
            return NextResponse.json({
                success: false,
                error: 'Invalid or expired refresh token',
            }, { status: 401 });
        }

        await prisma.refreshToken.delete({
            where: { id: storedToken.id },
        });

        const newAccessToken = generateAccessToken(decoded.userId, decoded.role);
        const newRefreshToken = generateRefreshToken(decoded.userId, decoded.role);

        await prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: decoded.userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        return NextResponse.json({
            success: true,
            data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Token refresh failed' }, { status: 401 });
    }
}
