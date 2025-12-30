import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fail } from '../utils/responses.js';

dotenv.config();

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return fail(res, 'Authentication token missing', 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    req.user = {
      id: decoded.userId,
      tenantId: decoded.tenantId || null,
      role: decoded.role,
    };
    next();
  } catch (err) {
    return fail(res, 'Invalid or expired token', 401);
  }
};