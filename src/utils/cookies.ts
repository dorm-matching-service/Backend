// src/utils/cookies.ts
import 'dotenv/config';
import type { Response } from 'express';

const isProd = process.env.NODE_ENV === 'production';
const cookieDomain = process.env.COOKIE_DOMAIN;
const cookieSecure = (process.env.COOKIE_SECURE ?? 'false') === 'true';

export function setAuthCookies(res: Response, access: string, refresh: string) {
  // 접근 토큰: 짧게, httpOnly
  res.cookie('access_token', access, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd || cookieSecure,
    domain: cookieDomain,
    path: '/',
    maxAge: 1000 * 60 * 15, // 프론트 리프레시로 갱신되므로 액세스는 15분 가정
  });

  // 리프레시 토큰: 더 길게 보관
  res.cookie('refresh_token', refresh, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd || cookieSecure,
    domain: cookieDomain,
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
  });
}

export function clearAuthCookies(res: Response) {
  const base = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd || (process.env.COOKIE_SECURE ?? 'false') === 'true',
    domain: cookieDomain,
    path: '/',
  };
  res.clearCookie('access_token', base);
  res.clearCookie('refresh_token', base);
}
