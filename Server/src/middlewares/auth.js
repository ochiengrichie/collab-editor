import jwt from 'jsonwebtoken';
import { createResponse } from '../utils/response.js';

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return createResponse(res, false, null, 'Unauthorized', 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return createResponse(res, false, null, 'Token expired', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return createResponse(res, false, null, 'Invalid token', 401);
    }
    console.error('Authentication error:', error);
    return createResponse(res, false, null, 'Authentication error', 500);
  }
};

export default authMiddleware;
