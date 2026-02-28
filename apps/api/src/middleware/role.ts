import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export function roleMiddleware(role: string) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (req.userRole !== role) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions',
            });
        }
        next();
    };
}

export const adminOnly = roleMiddleware('ADMIN');
