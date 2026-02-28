import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@smoke-essentials/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

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
        const data = loginSchema.parse(body);

        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'Invalid email or password',
            }, { status: 401 });
        }

        const validPassword = await bcrypt.compare(data.password, user.passwordHash);
        if (!validPassword) {
            return NextResponse.json({
                success: false,
                error: 'Invalid email or password',
            }, { status: 401 });
        }

        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id, user.role);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        const { passwordHash, ...safeUser } = user;

        return NextResponse.json({
            success: true,
            data: { user: safeUser, accessToken, refreshToken },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Validation failed',
                details: error.errors,
            }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
    }
}
