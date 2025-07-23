import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { toast } from "react-toastify";
import axios from "axios";

const Orders = () => {
  const { BACKEND_URL, token, currency, products } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [status, setStatus] = useState("info");
  const loadOrderData = async () => {
    try {
      if (!token) return null;
      const response = await axios.post(
        BACKEND_URL + "/api/order/userorders",
        {},
        { headers: { token } },
      );

      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.map((order) => {
          setStatus(order.statusState)
          order.items.map((item) => {
            item["status"] = order.status;
            item["statusState"] = order.statusState;
            item["payment"] = order.payment;
            item["paymentMethod"] = order.paymentMethod;
            item["date"] = order.date;
            allOrdersItem.push(item);
          });
        });

        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };
  useEffect(() => {
    loadOrderData();
  }, [token]);
  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>
      <div>
        {orderData.map((item, index) => {
          console.log(item)
          return (
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
                      {currency}
                      {item.price}
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
                </div>
              </div>
              <div className="flex justify-between md:w-1/2">
                <div className="flex items-center gap-2">
                  <p
                    className={`h-2 min-w-2 rounded-full ${item.statusState === "info" ? "bg-blue-400" : item.statusState === "error" ? "bg-red-600" : "bg-green-500"}`}
                  ></p>
                  <p className="text-sm md:text-base">{item.status}</p>
                </div>
                <button
                  onClick={loadOrderData}
                  className="rounded-ss-md border px-4 py-2 text-sm font-medium"
                >
                  Track Order
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
