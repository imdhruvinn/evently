import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { generateToken } from '../utils/jwt';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '../types';
import { AuditService } from '../services/auditService';
import { authenticator } from 'otplib';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { EmailService } from '../services/emailService';

// Register a new user
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw createError('User with this email already exists', 409);
  }

  // Hash password with increased security
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Generate verification token
  const verifyToken = crypto.randomBytes(32).toString('hex');

  // Create user in database
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: (role as UserRole) || UserRole.USER,
      verifyToken
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  });

  // Send verification email - REQUIRED before account is usable
  try {
    await EmailService.sendVerificationEmail(user.email, verifyToken);
    console.log(`✅ Verification email dispatched to ${user.email}`);
  } catch (error) {
    // If email sending fails, delete the created user and return error
    await prisma.user.delete({ where: { id: user.id } });
    throw createError('Failed to send verification email. Please check that your email address is valid and try again.', 400);
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  await AuditService.log('USER_REGISTER', req, { email: user.email }, user.id);

  res.status(201).json({
    status: 'success',
    message: 'Account created! A verification email has been sent to your email address. Please verify before logging in.',
    data: {
      user
    }
  });
});

// Login user
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user in database
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401);
  }

  // Check Email Verification
  if (!user.isEmailVerified) {
    throw createError('Please check your inbox and verify your email address before logging in.', 403);
  }

  // Check MFA if enabled
  const { mfaCode } = req.body;
  if (user.mfaEnabled) {
    if (!mfaCode) {
      return res.status(200).json({
        status: 'mfa_required',
        message: 'MFA code required for login',
        data: { userId: user.id }
      });
    }

    const isValid = authenticator.verify({
      token: mfaCode,
      secret: user.mfaSecret!
    });

    if (!isValid) {
      await AuditService.log('USER_LOGIN_FAILED_MFA', req, { email }, user.id);
      throw createError('Invalid MFA code', 401);
    }
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  // Remove password and mfaSecret from response
  const { password: _, mfaSecret: __, ...userWithoutPassword } = user;

  await AuditService.log('USER_LOGIN', req, { email }, user.id);

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      token
    }
  });
});

// Setup MFA
export const setupMfa = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw createError('User not authenticated', 401);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw createError('User not found', 404);

  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(user.email, 'Evently BTP', secret);
  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  // Save secret temporarily (not enabled yet)
  await prisma.user.update({
    where: { id: userId },
    data: { mfaSecret: secret }
  });

  await AuditService.log('MFA_SETUP_INITIATED', req, null, userId);

  res.status(200).json({
    status: 'success',
    data: { qrCodeUrl, secret }
  });
});

// Verify and Enable MFA
export const verifyAndEnableMfa = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { token } = req.body;
  if (!userId) throw createError('User not authenticated', 401);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.mfaSecret) throw createError('MFA setup not initiated', 400);

  const isValid = authenticator.verify({
    token,
    secret: user.mfaSecret
  });

  if (!isValid) throw createError('Invalid verification code', 400);

  await prisma.user.update({
    where: { id: userId },
    data: { mfaEnabled: true }
  });

  await AuditService.log('MFA_ENABLED', req, null, userId);

  res.status(200).json({
    status: 'success',
    message: 'MFA enabled successfully'
  });
});

// Get current user profile (protected route)
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  // User info is already available from auth middleware
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  // Get full user details from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) throw createError('Token is required', 400);

  const user = await prisma.user.findFirst({ where: { verifyToken: token } });
  if (!user) throw createError('Invalid verification token', 400);

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, verifyToken: null }
  });

  res.json({ status: 'success', message: 'Email verified successfully' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw createError('Email is required', 400);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Return success to prevent email enumeration
    return res.json({ status: 'success', message: 'If an account exists, a reset link was sent.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetPasswordToken: resetToken, resetPasswordExpires }
  });

  await EmailService.sendPasswordResetEmail(user.email, resetToken);
  res.json({ status: 'success', message: 'If an account exists, a reset link was sent.' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) throw createError('Token and password are required', 400);

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() }
    }
  });

  if (!user) throw createError('Invalid or expired reset token', 400);

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null }
  });

  res.json({ status: 'success', message: 'Password reset successfully' });
});
