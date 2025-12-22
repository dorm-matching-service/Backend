// src/types/express.d.ts
import type { JwtDecoded } from '../utils/jwt.js';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: JwtDecoded;
    user?: {
      id: string;
      email: string;
    };
  }
}
