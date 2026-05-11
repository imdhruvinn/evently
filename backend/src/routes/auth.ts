import { Router } from 'express';
import { register, login, getProfile, setupMfa, verifyAndEnableMfa, verifyEmail, forgotPassword, resetPassword } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { registerSchema, loginSchema } from '../validation/schemas';

const router = Router();

// POST /api/auth/register - Register new user
router.post('/register', validateBody(registerSchema), register);

// POST /api/auth/login - Login user
router.post('/login', validateBody(loginSchema), login);

// GET /api/auth/profile - Get current user profile (protected)
router.get('/profile', requireAuth, getProfile);

// POST /api/auth/logout - Logout (clear cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.'
  });
});

// POST /api/auth/mfa/setup
router.post('/mfa/setup', requireAuth, setupMfa);

// POST /api/auth/mfa/verify
router.post('/mfa/verify', requireAuth, verifyAndEnableMfa);

// POST /api/auth/verify-email
router.post('/verify-email', verifyEmail);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

export default router;
