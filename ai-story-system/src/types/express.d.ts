declare module 'express' {
  interface Request {
    user?: {
      id: number;
      iat: number;
      exp: number;
    };
  }
}
