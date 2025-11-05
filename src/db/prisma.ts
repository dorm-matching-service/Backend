// src/db/prisma.ts
// 1) .env를 *가장 먼저* 로드
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const isProd = process.env.NODE_ENV === 'production';

// (선택) Supabase일 때 SSL 힌트
const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is not set');
}
if (!/\bsslmode=require\b/.test(url)) {
  console.warn('Hint: Supabase needs ?sslmode=require in DATABASE_URL');
}

// 2) 개발 중 핫리로드에서 PrismaClient 중복 생성 방지 (singleton)
const prismaClientSingleton = () =>
  new PrismaClient({
    log: isProd ? ['error'] : ['error', 'warn'], // 필요시 'query' 추가
  });

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientSingleton;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (!isProd) globalForPrisma.prisma = prisma;

export default prisma;
