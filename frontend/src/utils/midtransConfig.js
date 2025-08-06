// Midtrans configuration for frontend
export const MIDTRANS_CLIENT_KEY = 'Mid-client-OZ2QRMjo1YLcm73c';
export const MIDTRANS_SANDBOX_URL = 'https://app.sandbox.midtrans.com/snap/snap.js';

// Initialize Midtrans Snap
export const initMidtrans = () => {
  return new Promise((resolve, reject) => {
    if (window.snap) {
      resolve(window.snap);
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="snap.js"]`);
    if (existingScript) {
      existingScript.onload = () => resolve(window.snap);
      existingScript.onerror = reject;
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = MIDTRANS_SANDBOX_URL;
    script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
    script.onload = () => resolve(window.snap);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Payment methods mapping
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  BANK_TRANSFER: 'bank_transfer',
  GOPAY: 'gopay',
  OVO: 'ovo',
  DANA: 'dana',
  SHOPEEPAY: 'shopeepay',
  QRIS: 'qris',
  INDOMARET: 'cstore',
  ALFAMART: 'cstore'
};

// Payment status mapping
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

// Transaction status mapping
export const TRANSACTION_STATUS = {
  CAPTURE: 'capture',
  SETTLEMENT: 'settlement',
  PENDING: 'pending',
  DENY: 'deny',
  CANCEL: 'cancel',
  EXPIRE: 'expire'
};
