import express from 'express';
import { registerUser, loginUser, googleLogin } from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.js';
import { createResponse } from '../utils/response.js';
import validateRequest from '../middlewares/validateRequest.js';
import { authSchemas } from '../validators/apiSchemas.js';
import { authLimiter } from '../middlewares/rateLimit.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validateRequest(authSchemas.register), registerUser);
router.post('/login', authLimiter, validateRequest(authSchemas.login), loginUser);
router.post('/google', authLimiter, validateRequest(authSchemas.google), googleLogin);

// Protected route
router.get('/me', authMiddleware, (req, res) => {
  return createResponse(res, true, req.user, null, 200);
});

// Logout (clears cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return createResponse(res, true, { message: 'Logged out' }, null, 200);
});

export default router;
