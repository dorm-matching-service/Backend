// src/auth/google.ts
import prisma from '../db/prisma.js';

interface UpsertGoogleUserParams {
  email: string;
  emailVerified: boolean;
}

//ReturnType<typeof 함수>는 “이 함수가 반환하는 타입”을 가져오는 것 입니다.
//마찬가지로 prisma.user.upsert는 Promise<User>를 반환하는 함수입니다.
//따라서 ReturnType<typeof prisma.user.upsert> = Promise<User> 와 같습니다.
//Promise 안에 있는 실제 값을 꺼내고 싶을 때 Awaited를 씁니다. 이는 TS문법 JS에서는 await씀

export async function upsertGoogleUser({
  email,
  emailVerified,
}: UpsertGoogleUserParams): Promise<
  Awaited<ReturnType<typeof prisma.user.upsert>>
> {
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      email,
      email_verified: emailVerified,
      last_login: new Date(),
    },
    create: {
      email,
      email_verified: emailVerified,
      created_at: new Date(),
      last_login: new Date(),
    },
  });
  return user;
}
