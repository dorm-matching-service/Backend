import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import type { AuthenticatedRequest } from '../types/auth.js';

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): asserts req is AuthenticatedRequest {
  const authz = req.headers.authorization;

  if (!authz || !authz.startsWith('Bearer ')) {
    res.status(401).json({ message: '인증 필요' });
    return;
  }

  try {
    const token = authz.slice('Bearer '.length);
    const decoded = verifyAccessToken(token);

    req.auth = decoded;
    next();
  } catch {
    res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
  }
}
