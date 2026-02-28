import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@smoke-essentials/db';
import { z } from 'zod';
import { verifyAuth } from '../../../lib/auth-middleware';

const prisma = new PrismaClient();

const createOrderSchema = z.object({
    addressId: z.string().min(1),
    deliveryNotes: z.string().optional(),
    items: z.array(z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
    })).min(1, 'Order must have at least one item'),
});

export async function POST(req: NextRequest) {
    try {
        const auth = verifyAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const data = createOrderSchema.parse(body);

        const address = await prisma.address.findFirst({
            where: { id: data.addressId, userId: auth.userId },
        });

        if (!address) {
            return NextResponse.json({
                success: false,
                error: 'Invalid delivery address',
            }, { status: 400 });
        }

        const productIds = data.items.map(item => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds }, isActive: true },
        });

        if (products.length !== productIds.length) {
            return NextResponse.json({
                success: false,
                error: 'One or more products not found or inactive',
            }, { status: 400 });
        }

        for (const item of data.items) {
            const product = products.find(p => p.id === item.productId);
            if (!product || product.stock < item.quantity) {
                return NextResponse.json({
                    success: false,
                    error: `Insufficient stock for ${product?.name || 'unknown product'}`,
                }, { status: 400 });
            }
        }

        const deliveryFee = 50;
        const orderItems = data.items.map(item => {
            const product = products.find(p => p.id === item.productId)!;
            return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: product.price,
            };
        });

        const subtotal = orderItems.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity,
            0
        );

        const order = await prisma.$transaction(async (tx) => {
            for (const item of data.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            return tx.order.create({
                data: {
                    userId: auth.userId,
                    addressId: data.addressId,
                    totalAmount: subtotal + deliveryFee,
                    deliveryFee,
                    deliveryNotes: data.deliveryNotes,
                    items: {
                        create: orderItems,
                    },
                },
                include: {
                    items: { include: { product: true } },
                    address: true,
                },
            });
        });

        return NextResponse.json({ success: true, data: order }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Validation failed',
                details: error.errors,
            }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const auth = verifyAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '10';
        const status = searchParams.get('status');

        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        if (auth.role !== 'ADMIN') {
            where.userId = auth.userId;
        }

        if (status) {
            where.status = status as string;
        }

        const [items, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: { include: { product: true } },
                    address: true,
                    user: {
                        select: { id: true, name: true, email: true, phone: true },
                    },
                },
            }),
            prisma.order.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                items,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to list orders' }, { status: 500 });
    }
}
