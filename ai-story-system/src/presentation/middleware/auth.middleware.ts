import jwt from 'jsonwebtoken';
import { InternalError, UnauthorizedError } from '../../domain/errors';
import { NextFunction, Request, Response } from '../../types/express-types';

interface JwtPayload {
  id: number;
  iat: number;
  exp: number;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Allow OPTIONS requests to pass through (for CORS preflight)
    if (req.method === 'OPTIONS') {
      return next();
    }

    const token = req.header?.('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw UnauthorizedError.missingToken({
        operation: 'authentication',
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new InternalError(
        'JWT_SECRET is not defined',
        { service: 'authentication' },
        { operation: 'authentication' },
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      req.user = decoded;
      next();
    } catch (jwtError) {
      // Token inválido ou expirado
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw UnauthorizedError.expiredToken({
          operation: 'authentication',
        });
      }

      if (jwtError instanceof jwt.JsonWebTokenError) {
        throw UnauthorizedError.invalidToken({
          operation: 'authentication',
        });
      }

      throw jwtError;
    }
  } catch (error) {
    // Passar erro para o error handler global
    next(error);
  }
};
