import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { toast } from "react-toastify";
import axios from "axios";
import { formatCurrency } from "../utils/formatCurrency";

const Orders = () => {
  const { BACKEND_URL, token, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(false);

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
                    <p>Size: {item.size}</p>
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
                <button
                  onClick={loadOrderData}
                  className="rounded border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Track Order"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
