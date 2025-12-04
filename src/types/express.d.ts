declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      email: string;
    };

    auth?: {
      uid: string; // requireAuth 미들웨어에서 넣는 값
    };
  }
}
