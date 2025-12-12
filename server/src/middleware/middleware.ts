import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { commonResponse } from '../utils/commonResponse';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserRole as ModelUserRole, UserStatus } from '../models/userModel';
import User from '../models/userModel';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (JWT_SECRET + '_refresh');

export enum UserRole {
  ADMIN = "admin",
  CUSTOMER = "customer",
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    userType?: string;
  };
}

const validateRequest = (schema: ObjectSchema) => {

  return (req: Request, res: Response, next: NextFunction): void => {

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map((err) => err.message);

      res.status(200).json(commonResponse(false, null, `${errorMessages.join(', ')}`));
      return;
    }

    next();
  };
};

// Helper function to extract token from header or cookie
const extractToken = (req: Request): string | null => {
  // Try header first (for backward compatibility)
  const headerToken = req.header('auth-token') || req.header('Authorization')?.replace('Bearer ', '');
  if (headerToken) return headerToken;

  // Try cookie
  const cookieToken = req.cookies?.accessToken;
  if (cookieToken) return cookieToken;

  return null;
};

// Main authentication middleware - requireAuth
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json(commonResponse(false, null, 'Access Denied. No token provided.'));
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId).select('status role');
    if (!user) {
      res.status(401).json(commonResponse(false, null, 'User not found.'));
      return;
    }

    if (user.status === UserStatus.SUSPENDED) {
      res.status(403).json(commonResponse(false, null, 'Account is suspended.'));
      return;
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || user.role,
      userType: decoded.userType,
    };

    return next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json(commonResponse(false, null, 'Token expired.'));
    } else {
      res.status(401).json(commonResponse(false, null, 'Invalid Token'));
    }
    return;
  }
};

// Backward compatibility alias
export const authenticateUser = requireAuth;

// Require Admin role
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  // First authenticate
  let authCompleted = false;
  await requireAuth(req, res, () => {
    authCompleted = true;
  });

  if (!authCompleted) {
    return; // requireAuth already sent response
  }

  // Then check role
  if (req.user?.role !== ModelUserRole.ADMIN) {
    res.status(403).json(commonResponse(false, null, 'Access Denied. Admin role required.'));
    return;
  }

  return next();
};


export default validateRequest;
