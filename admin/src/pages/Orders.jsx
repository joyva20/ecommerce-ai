import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendURL } from "../App";
import { assets } from "../assets/assets";
const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const fetchAllOrders = async () => {
    if (!token) return null;
    try {
      const response = await axios.post(
        backendURL + "/api/order/list",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchAllOrders();
  }, [token]);
  return (
    <div>
      <h3>Order Page</h3>
      <div>
        {orders.map((order, index) => {
          console.log(order)
          return (
            <div key={index}>
              <img src={assets.parcel_icon} alt="Parcel icon" />
              <div>
                {order.items.map((item,index)=> {
                  if(index === order.items.length - 1){
                    return <p key={index}>{item.name} x {item.quanitity} <span> {item.size} </span></p>
                  }
                  else{
                    return <p key={index}>{item.name} x {item.quanitity} <span> {item.size} </span> , </p>
                  }
                })}
              </div>
              <p>{order.address.firstName + " " + order.address.lastName}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
