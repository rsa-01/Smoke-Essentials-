import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@smoke-essentials/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^(\+?880|0)?1[3-9]\d{8}$/, 'Invalid Bangladesh phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    isAgeVerified: z.boolean().refine(val => val === true, 'You must be 18+ to register'),
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
        const data = registerSchema.parse(body);

        const existing = await prisma.user.findFirst({
            where: { OR: [{ email: data.email }, { phone: data.phone }] },
        });

        if (existing) {
            return NextResponse.json({
                success: false,
                error: 'User with this email or phone already exists',
            }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(data.password, 12);

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                passwordHash,
                isAgeVerified: data.isAgeVerified,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isAgeVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id, user.role);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        return NextResponse.json({
            success: true,
            data: { user, accessToken, refreshToken },
        }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = error.errors.map(err => err.message).join(', ');
            return NextResponse.json({
                success: false,
                error: errorMessage || 'Validation failed',
                details: error.errors,
            }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
    }
}
