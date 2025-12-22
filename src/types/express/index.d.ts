import type { JwtDecoded } from '../../utils/jwt.js';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: JwtDecoded;
  }
}

export {};
