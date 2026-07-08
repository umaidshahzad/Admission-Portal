import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'applicant' | 'officer' | 'dept_head' | 'admin';
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'JWT123';

/**
 * Middleware to authenticate requests using JWT tokens
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: 'applicant' | 'officer' | 'dept_head' | 'admin';
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired authentication token.' });
  }
}

/**
 * Middleware to restrict route access based on user role(s)
 * @param allowedRoles Array of roles authorized to access this route
 */
export function requireRole(allowedRoles: ('applicant' | 'officer' | 'dept_head' | 'admin')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden. This resource is restricted to: ${allowedRoles.join(', ')}.` 
      });
    }

    next();
  };
}
