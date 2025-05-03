import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload { id: string; role: string; }

export const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret'
    ) as JwtPayload;

    (req as any).userId  = decoded.id;
    (req as any).userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const operatorOnly = (_req: Request, res: Response, next: NextFunction) => {
  if ((_req as any).userRole !== 'operator') {
    return res.status(403).json({ message: 'Operators only' });
  }
  next();
};

export const adminOnly = (_req: Request, res: Response, next: NextFunction) => {
  if ((_req as any).userRole !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }
  next();
};
