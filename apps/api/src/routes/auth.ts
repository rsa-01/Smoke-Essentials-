import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^(\+?880|0)?1[3-9]\d{8}$/, 'Invalid Bangladesh phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    isAgeVerified: z.boolean().refine(val => val === true, 'You must be 18+ to register'),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Helper: generate tokens
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

// POST /auth/register
router.post('/register', async (req, res: Response) => {
    try {
        const data = registerSchema.parse(req.body);

        // Check if user exists
        const existing = await prisma.user.findFirst({
            where: { OR: [{ email: data.email }, { phone: data.phone }] },
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                error: 'User with this email or phone already exists',
            });
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

        // Store refresh token
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        res.status(201).json({
            success: true,
            data: { user, accessToken, refreshToken },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.errors,
            });
        }
        console.error('Register error:', error);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

// POST /auth/login
router.post('/login', async (req, res: Response) => {
    try {
        const data = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
        }

        const validPassword = await bcrypt.compare(data.password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
        }

        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id, user.role);

        // Store refresh token
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        const { passwordHash, ...safeUser } = user;

        res.json({
            success: true,
            data: { user: safeUser, accessToken, refreshToken },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.errors,
            });
        }
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

// POST /auth/logout
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const refreshToken = req.body.refreshToken;
        if (refreshToken) {
            await prisma.refreshToken.deleteMany({
                where: { token: refreshToken },
            });
        }

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, error: 'Logout failed' });
    }
});

// POST /auth/refresh
router.post('/refresh', async (req, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token required',
            });
        }

        // Verify token
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || 'refresh-secret'
        ) as { userId: string; role: string };

        // Check if token exists in DB
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });

        if (!storedToken || storedToken.expiresAt < new Date()) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired refresh token',
            });
        }

        // Rotate token
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

        res.json({
            success: true,
            data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
        });
    } catch (error) {
        console.error('Refresh error:', error);
        res.status(401).json({ success: false, error: 'Token refresh failed' });
    }
});

// GET /auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
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
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Me error:', error);
        res.status(500).json({ success: false, error: 'Failed to get user' });
    }
});

export default router;
