import { snap, coreApi } from '../config/midtrans.js';
import orderModel from '../models/orderModel.js';
import crypto from 'crypto';

// Helper function to get enabled payment methods
const getEnabledPayments = (paymentMethod) => {
  const paymentMethods = {
    'QRIS': ['gopay', 'qris'],
    'DANA': ['dana'],
    'GOPAY': ['gopay'],
    'SHOPEEPAY': ['shopeepay']
  };
  
  return paymentMethods[paymentMethod] || ['credit_card', 'bca_va', 'bni_va', 'bri_va', 'gopay', 'dana', 'shopeepay', 'qris'];
};

// Create Midtrans Transaction
const createTransaction = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Find order
    const order = await orderModel.findById(orderId).populate('userID', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if order already has payment in progress
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }
    
    // Generate unique transaction ID
    const transactionId = `ORDER-${order._id}-${Date.now()}`;
    
    // Prepare item details
    const itemDetails = order.items.map(item => ({
      id: item._id,
      price: item.price,
      quantity: item.quantity || item.quanitity || 1, // Handle typo in existing data
      name: item.name,
      category: item.category
    }));
    
    // Calculate shipping cost (if any)
    const shippingCost = 0; // You can implement shipping calculation
    const grossAmount = order.amount + shippingCost;
    
    // Midtrans transaction parameter
    const parameter = {
      transaction_details: {
        order_id: transactionId,
        gross_amount: grossAmount
      },
      credit_card: {
        secure: true
      },
      item_details: itemDetails,
      customer_details: {
        first_name: order.userID.name,
        email: order.userID.email,
        billing_address: {
          first_name: order.userID.name,
          email: order.userID.email,
          address: order.address.street,
          city: order.address.city,
          postal_code: order.address.zipcode,
          country_code: "IDN"
        }
      },
      // Enable specific payment methods based on order payment method
      enabled_payments: getEnabledPayments(order.paymentMethod),
      callbacks: {
        finish: `${process.env.FRONTEND_URL}/payment/finish`,
        error: `${process.env.FRONTEND_URL}/payment/error`,
        pending: `${process.env.FRONTEND_URL}/payment/pending`
      },
      expiry: {
        start_time: new Date().toISOString(),
        unit: "minutes",
        duration: 60 // 1 hour expiry
      }
    };
    
    // Create transaction with Midtrans
    const transaction = await snap.createTransaction(parameter);
    
    // Update order with Midtrans data
    order.midtransOrderId = transactionId;
    order.snapToken = transaction.token;
    order.paymentStatus = 'pending';
    order.expiredAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    await order.save();
    
    res.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      orderId: order._id,
      transactionId: transactionId
    });
    
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Handle Midtrans Notification
const handleNotification = async (req, res) => {
  try {
    const notification = req.body;
    console.log('Midtrans notification:', notification);
    
    const {
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
      gross_amount,
      signature_key
    } = notification;
    
    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const hash = crypto
      .createHash('sha512')
      .update(`${order_id}${notification.status_code}${gross_amount}${serverKey}`)
      .digest('hex');
    
    if (hash !== signature_key) {
      console.error('Invalid signature');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
    
    // Find order by Midtrans order ID
    const order = await orderModel.findOne({ midtransOrderId: order_id });
    if (!order) {
      console.error('Order not found:', order_id);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Update order based on transaction status
    order.transactionStatus = transaction_status;
    order.fraudStatus = fraud_status;
    order.paymentType = payment_type;
    order.paymentDetails = notification;
    
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept') {
        // Payment successful
        order.paymentStatus = 'paid';
        order.payment = true;
        order.status = 'Paid';
        order.statusState = 'success';
        order.paidAt = new Date();
      }
    } else if (transaction_status === 'pending') {
      order.paymentStatus = 'pending';
      order.status = 'Awaiting Payment';
      order.statusState = 'info';
    } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
      order.paymentStatus = 'failed';
      order.status = 'Payment Failed';
      order.statusState = 'error';
    }
    
    await order.save();
    
    console.log(`Order ${order._id} updated: ${transaction_status}`);
    res.json({ success: true, message: 'Notification processed' });
    
  } catch (error) {
    console.error('Handle notification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check Payment Status
const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // If order has Midtrans transaction, check with Midtrans API
    if (order.midtransOrderId) {
      try {
        const statusResponse = await coreApi.transaction.status(order.midtransOrderId);
        
        // Update order with latest status
        order.transactionStatus = statusResponse.transaction_status;
        order.fraudStatus = statusResponse.fraud_status;
        order.paymentDetails = statusResponse;
        
        if (statusResponse.transaction_status === 'settlement' || statusResponse.transaction_status === 'capture') {
          order.paymentStatus = 'paid';
          order.payment = true;
          order.status = 'Paid';
          order.statusState = 'success';
          order.paidAt = new Date();
        }
        
        await order.save();
      } catch (midtransError) {
        console.error('Midtrans status check error:', midtransError);
      }
    }
    
    res.json({
      success: true,
      order: {
        id: order._id,
        paymentStatus: order.paymentStatus,
        transactionStatus: order.transactionStatus,
        fraudStatus: order.fraudStatus,
        paymentType: order.paymentType,
        paidAt: order.paidAt,
        expiredAt: order.expiredAt
      }
    });
    
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel Payment
const cancelPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Cannot cancel paid order' });
    }
    
    // Cancel with Midtrans if transaction exists
    if (order.midtransOrderId) {
      try {
        await coreApi.transaction.cancel(order.midtransOrderId);
      } catch (midtransError) {
        console.error('Midtrans cancel error:', midtransError);
      }
    }
    
    // Update order status
    order.paymentStatus = 'cancelled';
    order.status = 'Cancelled';
    order.statusState = 'error';
    await order.save();
    
    res.json({ success: true, message: 'Payment cancelled' });
    
  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createTransaction, handleNotification, checkPaymentStatus, cancelPayment };
