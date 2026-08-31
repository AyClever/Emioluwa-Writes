import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { getDatabase } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'emioluwa_writes_secure_secret_key_2026';

export interface AuthTokenPayload {
  adminId: string;
  email: string;
}

export function generateToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  admin?: AuthTokenPayload;
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session token' });
  }

  req.admin = payload;
  next();
}
