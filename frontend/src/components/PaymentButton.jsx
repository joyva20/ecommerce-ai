import { useState } from 'react';
import { initMidtrans, PAYMENT_STATUS } from '../utils/midtransConfig';
import { toast } from 'react-toastify';

const PaymentButton = ({ 
  orderId, 
  amount, 
  onSuccess, 
  onPending, 
  onError, 
  onClose,
  disabled = false,
  className = "",
  children = "Pay Now"
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Get token from backend
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to proceed with payment');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/payment/create-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ orderId })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create payment');
      }

      // Initialize Midtrans
      const snap = await initMidtrans();

      // Configure payment options
      const paymentOptions = {
        onSuccess: (result) => {
          console.log('Payment success:', result);
          setPaymentStatus(PAYMENT_STATUS.PAID);
          toast.success('Payment successful!');
          if (onSuccess) onSuccess(result);
        },
        onPending: (result) => {
          console.log('Payment pending:', result);
          setPaymentStatus(PAYMENT_STATUS.PENDING);
          toast.info('Payment is being processed...');
          if (onPending) onPending(result);
        },
        onError: (result) => {
          console.error('Payment error:', result);
          setPaymentStatus(PAYMENT_STATUS.FAILED);
          toast.error('Payment failed. Please try again.');
          if (onError) onError(result);
        },
        onClose: () => {
          console.log('Payment popup closed');
          if (onClose) onClose();
        }
      };

      // Open Snap payment popup
      snap.pay(data.token, paymentOptions);

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed');
      setPaymentStatus(PAYMENT_STATUS.FAILED);
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Processing...';
    if (paymentStatus === PAYMENT_STATUS.PENDING) return 'Payment Pending';
    if (paymentStatus === PAYMENT_STATUS.PAID) return 'Payment Successful';
    if (paymentStatus === PAYMENT_STATUS.FAILED) return 'Retry Payment';
    return children;
  };

  const getButtonClass = () => {
    let baseClass = `px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${className}`;
    
    if (disabled || loading) {
      return `${baseClass} bg-gray-300 text-gray-500 cursor-not-allowed`;
    }
    
    if (paymentStatus === PAYMENT_STATUS.PAID) {
      return `${baseClass} bg-green-500 text-white cursor-default`;
    }
    
    if (paymentStatus === PAYMENT_STATUS.FAILED) {
      return `${baseClass} bg-red-500 hover:bg-red-600 text-white`;
    }
    
    if (paymentStatus === PAYMENT_STATUS.PENDING) {
      return `${baseClass} bg-yellow-500 text-white cursor-default`;
    }
    
    return `${baseClass} bg-blue-600 hover:bg-blue-700 text-white`;
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading || paymentStatus === PAYMENT_STATUS.PAID}
      className={getButtonClass()}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {getButtonText()}
    </button>
  );
};

export default PaymentButton;
