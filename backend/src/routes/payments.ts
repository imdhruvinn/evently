import { Router } from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getBookingPaymentStatus,
  getUserPayments,
  processRefund
} from '../controllers/paymentController';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// All payment routes require authentication
router.use(requireAuth);

// Validation schemas
const createOrderSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required')
  })
});

const verifyPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    razorpay_order_id: z.string().min(1, 'Razorpay Order ID is required'),
    razorpay_payment_id: z.string().min(1, 'Razorpay Payment ID is required'),
    razorpay_signature: z.string().min(1, 'Razorpay Signature is required')
  })
});

const refundSchema = z.object({
  body: z.object({
    reason: z.string().min(1, 'Refund reason is required')
  })
});

// Validation middleware
const validateBody = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse({ body: req.body });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.issues
        });
      }
      next(error);
    }
  };
};

// POST /api/payments/create-order - Create Razorpay order for booking
router.post('/create-order', validateBody(createOrderSchema), createRazorpayOrder);

// POST /api/payments/verify - Verify Razorpay payment
router.post('/verify', validateBody(verifyPaymentSchema), verifyRazorpayPayment);

// GET /api/payments/booking/:bookingId - Get payment status for a booking
router.get('/booking/:bookingId', getBookingPaymentStatus);

// GET /api/payments/user/:userId - Get user's payment history
router.get('/user/:userId', getUserPayments);

// POST /api/payments/refund/:paymentId - Process refund (Admin only)
router.post('/refund/:paymentId', validateBody(refundSchema), processRefund);

export default router;
