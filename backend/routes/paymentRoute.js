import express from 'express';
import { createTransaction, handleNotification, checkPaymentStatus, cancelPayment } from '../controllers/paymentController.js';
import authUser from '../middleware/auth.js';

const paymentRouter = express.Router();

// Create Midtrans transaction (requires authentication)
paymentRouter.post('/create-transaction', authUser, createTransaction);

// Handle Midtrans notification webhook (no auth required)
paymentRouter.post('/notification', handleNotification);

// Check payment status (requires authentication)
paymentRouter.get('/status/:orderId', authUser, checkPaymentStatus);

// Cancel payment (requires authentication)
paymentRouter.post('/cancel/:orderId', authUser, cancelPayment);

export default paymentRouter;
