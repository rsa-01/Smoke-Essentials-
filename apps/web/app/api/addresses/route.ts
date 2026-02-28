import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@smoke-essentials/db';
import { z } from 'zod';
import { verifyAuth } from '../../../lib/auth-middleware';

const prisma = new PrismaClient();

const createAddressSchema = z.object({
    label: z.string().min(1),
    fullAddress: z.string().min(5),
    lat: z.number(),
    lng: z.number(),
    isDefault: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const auth = verifyAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const addresses = await prisma.address.findMany({
            where: { userId: auth.userId },
            orderBy: { isDefault: 'desc' },
        });

        return NextResponse.json({ success: true, data: addresses });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to list addresses' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = verifyAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const data = createAddressSchema.parse(body);

        if (data.isDefault) {
            await prisma.address.updateMany({
                where: { userId: auth.userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        const address = await prisma.address.create({
            data: {
                ...data,
                userId: auth.userId,
            },
        });

        return NextResponse.json({ success: true, data: address }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Validation failed',
                details: error.errors,
            }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'Failed to create address' }, { status: 500 });
    }
}
