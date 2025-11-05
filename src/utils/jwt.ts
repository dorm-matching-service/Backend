// ✅ import 방식: esModuleInterop=true 라면 이대로, 아니면 주석 아래 라인으로
import jwt from 'jsonwebtoken';
// import * as jwt from 'jsonwebtoken';

type JwtPayloadIn = {
  uid: string; // 우리 서비스 사용자 ID
  // sub 없이 가기로 했으면 이 줄 지워도 됨
  sub?: string; // (선택) 구글 고유 ID를 claim으로만 넣고 싶으면 유지
  email: string;
};

const JWT_ISSUER = 'knock-backend' as const;

export function signAccessToken(payload: JwtPayloadIn) {
  const secret: jwt.Secret = process.env.JWT_SECRET!;

  // ✅ expiresIn은 SignOptions['expiresIn']로 단언하면 TS가 깔끔하게 인식
  const expiresIn = (process.env.JWT_EXPIRES_IN ??
    '1h') as jwt.SignOptions['expiresIn'];

  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    issuer: JWT_ISSUER,
    expiresIn,
  });
}

export type JwtDecoded = jwt.JwtPayload & JwtPayloadIn;

export function verifyAccessToken(token: string): JwtDecoded {
  const secret: jwt.Secret = process.env.JWT_SECRET!;
  // verify는 string | JwtPayload를 반환하므로 단언 + 기본 검증 옵션을 함께 사용
  const decoded = jwt.verify(token, secret, {
    algorithms: ['HS256'],
    issuer: JWT_ISSUER,
  }) as jwt.JwtPayload;

  // 최소 필드 체크(런타임 안정성). 필요 없다면 이 블록 제거 가능
  if (typeof decoded !== 'object' || decoded === null) {
    throw new Error('Invalid token payload');
  }
  // 여기서 구조를 좁혀서 반환
  return decoded as JwtDecoded;
}
