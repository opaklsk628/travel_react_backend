import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  role: string;
}

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret'
    ) as JwtPayload;

    (req as any).userId = decoded.id;
    (req as any).userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const operatorOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if ((req as any).userRole !== 'operator') {
    res.status(403).json({ message: 'Operators only' });
    return;
  }
  next();
};

export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if ((req as any).userRole !== 'admin') {
    res.status(403).json({ message: 'Admins only' });
    return;
  }
  next();
};
