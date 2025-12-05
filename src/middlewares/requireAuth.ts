import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type JwtDecoded } from '../utils/jwt.js';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: JwtDecoded;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // 1) Authorization 헤더 우선
    const authz = req.headers.authorization;
    if (!authz || !authz.startsWith('Bearer ')) {
      return res.status(401).json({ message: '인증 필요' });
    }

    const token = authz.slice('Bearer '.length);

    const decoded = verifyAccessToken(token);
    req.auth = decoded;
    next();
  } catch {
    return res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
  }
}
