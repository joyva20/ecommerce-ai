import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const transactionStatus = searchParams.get('transaction_status');
    const statusCode = searchParams.get('status_code');

    if (!orderId) {
      setStatus('error');
      return;
    }

    // Determine status based on transaction_status
    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      setStatus('success');
      toast.success('Payment successful!');
    } else if (transactionStatus === 'pending') {
      setStatus('pending');
      toast.info('Payment is being processed...');
    } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
      setStatus('failed');
      toast.error('Payment failed or cancelled.');
    } else {
      setStatus('error');
    }

    // Optionally fetch order details
    setOrderDetails({
      orderId,
      transactionStatus,
      statusCode
    });
  }, [searchParams]);

  const handleBackToOrders = () => {
    navigate('/orders');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing payment result...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully. Your order is now being prepared.
            </p>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-yellow-600 mb-2">Payment Pending</h2>
            <p className="text-gray-600 mb-6">
              Your payment is being processed. Please wait for confirmation or check your order status.
            </p>
          </>
        )}

        {(status === 'failed' || status === 'error') && (
          <>
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">
              Your payment could not be processed. Please try again or contact support.
            </p>
          </>
        )}

        {orderDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Order Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Order ID: <span className="font-mono">{orderDetails.orderId}</span></p>
              <p>Status: <span className="capitalize">{orderDetails.transactionStatus}</span></p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleBackToOrders}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            View My Orders
          </button>
          <button
            onClick={handleBackToHome}
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
