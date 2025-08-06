import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { toast } from "react-toastify";
import axios from "axios";
import { formatCurrency } from "../utils/formatCurrency";
import ReviewModal from "../components/ReviewModal";

const Orders = () => {
  const { BACKEND_URL, token, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewedProducts, setReviewedProducts] = useState(new Map()); // Changed to Map to store review data

  const loadOrderData = async () => {
    try {
      if (!token) {
        toast.error("Please login to view orders");
        return;
      }
      
      setLoading(true);
      const response = await axios.post(
        BACKEND_URL + "/api/order/userorders",
        {},
        { headers: { token } },
      );

      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            item["status"] = order.status;
            item["statusState"] = order.statusState;
            item["payment"] = order.payment;
            item["paymentMethod"] = order.paymentMethod;
            item["date"] = order.date;
            item["orderId"] = order._id;
            item["amount"] = order.amount;
            allOrdersItem.push(item);
          });
        });

        setOrderData(allOrdersItem.reverse());
        
        // Check review status for all products
        await checkReviewStatus(allOrdersItem);
      } else {
        toast.error(response.data.message || "Failed to load orders");
      }
    } catch (error) {
      console.error("Load orders error:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Function to check review status for all products
  const checkReviewStatus = async (orders) => {
    try {
      if (!token) return;
      
      const reviewStatusMap = new Map();
      
      // Create unique list of products to check
      const uniqueProducts = new Set();
      orders.forEach(order => {
        uniqueProducts.add(order._id); // product ID
      });
      
      // Check review status for each unique product
      for (const productId of uniqueProducts) {
        try {
          const response = await axios.post(
            `${BACKEND_URL}/api/reviews/check/${productId}`,
            {},
            { headers: { token } }
          );
          
          if (response.data.success) {
            reviewStatusMap.set(productId, {
              hasReviewed: response.data.hasReviewed,
              review: response.data.review || null
            });
          }
        } catch (error) {
          console.error(`Error checking review status for product ${productId}:`, error);
        }
      }
      
      setReviewedProducts(reviewStatusMap);
    } catch (error) {
      console.error("Error checking review status:", error);
    }
  };

  useEffect(() => {
    loadOrderData();
    
    // Auto refresh every 30 seconds to get latest status updates
    const interval = setInterval(loadOrderData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const getStatusColor = (statusState) => {
    switch (statusState) {
      case "info":
        return "bg-blue-400";
      case "error":
        return "bg-red-600";
      case "success":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusTextColor = (status) => {
    if (status === "Delivered") return "text-green-600";
    if (status === "Cancel") return "text-red-600";
    if (status === "Shipped" || status === "Out for delivery") return "text-blue-600";
    return "text-gray-600";
  };

  const handleTrackOrder = (order) => {
    if (order.status === 'Delivered') {
      // Button is disabled for delivered orders
      return;
    }
    
    // Show popup for feature under development
    alert('This feature is currently under development');
  };

  const handleReview = async (order, product) => {
    // Check if user has already reviewed this product
    const reviewStatus = reviewedProducts.get(product._id);
    
    if (reviewStatus && reviewStatus.hasReviewed) {
      toast.info('You have already reviewed this product');
      return;
    }
    
    setSelectedProduct({
      ...product,
      orderId: order._id
    });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token  // Use 'token' header instead of Authorization Bearer
        },
        body: JSON.stringify(reviewData)
      });
      
      if (response.ok) {
        toast.success('Review submitted successfully!');
        
        // Update local review status
        setReviewedProducts(prev => {
          const newMap = new Map(prev);
          newMap.set(selectedProduct._id, {
            hasReviewed: true,
            review: reviewData
          });
          return newMap;
        });
        
        // Refresh orders to get latest data
        loadOrderData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error submitting review');
    }
  };
  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>
      
      {loading && (
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading orders...</div>
        </div>
      )}
      
      <div>
        {orderData.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500">
            <p>No orders found</p>
            <a href="/collection" className="text-blue-500 hover:underline">
              Start shopping
            </a>
          </div>
        ) : (
          orderData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 border-b border-t py-4 text-gray-700 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-6 text-sm">
                <img
                  src={item.image[0]}
                  alt="Product Image"
                  className="w-16 sm:w-20"
                />
                <div>
                  <p className="font-medium sm:text-base">{item.name}</p>
                  <div className="mt-1 flex items-center gap-3 text-base text-gray-700">
                    <p>
                      {formatCurrency(item.price)}
                    </p>
                    <p>Quantity: {item.quanitity}</p>
                    {item.size !== "No Size" && (
                      <p>Size: {item.size}</p>
                    )}
                  </div>
                  <p className="mt-1">
                    Date:{" "}
                    <span className="text-gray-400">
                      {new Date(item.date).toDateString()}
                    </span>
                  </p>
                  <p className="mt-1">
                    Payment:{" "}
                    <span className="text-gray-400">{item.paymentMethod}</span>
                  </p>
                  {item.payment && (
                    <p className="mt-1 text-green-600 text-sm">✓ Payment Confirmed</p>
                  )}
                </div>
              </div>
              <div className="flex justify-between md:w-1/2">
                <div className="flex items-center gap-2">
                  <p
                    className={`h-2 min-w-2 rounded-full ${getStatusColor(item.statusState)}`}
                  ></p>
                  <p className={`text-sm md:text-base font-medium ${getStatusTextColor(item.status)}`}>
                    {item.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  {item.status === 'Delivered' && (
                    <button
                      onClick={() => handleReview(item, item)}
                      className={`rounded border px-3 py-1 text-sm font-medium transition ${
                        reviewedProducts.get(item._id)?.hasReviewed
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
                          : "hover:bg-gray-50 text-blue-600 border-blue-600"
                      }`}
                      disabled={reviewedProducts.get(item._id)?.hasReviewed}
                    >
                      {reviewedProducts.get(item._id)?.hasReviewed ? "✓ Reviewed" : "Write Review"}
                    </button>
                  )}
                  <button
                    onClick={() => handleTrackOrder(item)}
                    className={`rounded border px-4 py-2 text-sm font-medium transition ${
                      item.status === 'Delivered' 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
                        : "hover:bg-gray-50 border-gray-300"
                    }`}
                    disabled={item.status === 'Delivered'}
                  >
                    Track Order
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        product={selectedProduct}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default Orders;
