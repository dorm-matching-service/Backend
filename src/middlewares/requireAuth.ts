import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type JwtDecoded } from '../utils/jwt';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: JwtDecoded;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // 1) Authorization 헤더 우선
    const authz = req.headers.authorization;
    let token = authz?.startsWith('Bearer ')
      ? authz.slice('Bearer '.length)
      : undefined;

    // 2) 없으면 httpOnly 쿠키에서
    if (!token && req.cookies?.access_token) {
      token = req.cookies.access_token as string;
    }
    if (!token) return res.status(401).json({ message: '인증 필요' });

    const decoded = verifyAccessToken(token);
    req.auth = decoded;
    next();
  } catch {
    return res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
  }
}
