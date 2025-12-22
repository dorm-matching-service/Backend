import type { Request } from 'express-serve-static-core';
import type { JwtDecoded } from '../utils/jwt.js';

export type AuthenticatedRequest = Request & {
  auth: JwtDecoded;
};
