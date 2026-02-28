import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthSession {
    userId: string;
    role: string;
}

export function verifyAuth(req: NextRequest): AuthSession | null {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as AuthSession;
        return decoded;
    } catch (error) {
        return null;
    }
}
