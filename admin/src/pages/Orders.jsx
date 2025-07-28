import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendURL, currency } from "../App";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
const Orders = ({ token }) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [orders, setOrders] = useState([]);
  const fetchAllOrders = async () => {
    if (!token) {
      navigate("/login");
      return null;
    }
    try {
      const response = await axios.post(
        backendURL + "/api/order/list",
        {},
        { headers: { token } },
      );
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        // Hanya tampilkan notifikasi jika benar-benar unauthorized
        if (response.data.message && response.data.message.toLowerCase().includes("unauthorized")) {
          toast.error("Not authorized, please login again");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data order");
    }
  };

  useEffect(() => {
    fetchAllOrders();
    const interval = setInterval(fetchAllOrders, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const statusHandler = async (event, orderId) => {
    try {
      const newStatus = event.target.value;
      
      // Determine statusState based on status
      let statusState = "info"; // default
      if (newStatus === "Cancel") {
        statusState = "error";
      } else if (newStatus === "Delivered") {
        statusState = "success";
      } else if (newStatus === "Shipped" || newStatus === "Out for delivery") {
        statusState = "info";
      }
      
      const response = await axios.post(
        backendURL + "/api/order/status",
        { 
          orderId: orderId,
          status: newStatus,
          statusState: statusState
        },
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success("Order status updated successfully");
        // Refresh orders list
        fetchAllOrders();
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update order status");
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">Daftar Order</h2>
      {orders.length === 0 ? (
        <p className="text-center text-gray-500">Belum ada order.</p>
      ) : (
        orders.map((order, index) => (
          <div
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700 rounded-lg shadow-sm"
            key={order._id || index}
          >
            <img
              className="w-12"
              src={assets.parcel_icon}
              alt="Parcel icon"
            />
            <div>
              {/* Username pembeli di atas Items */}
              {order.userID && (
                <div className="mb-2 text-pink-700 font-semibold">
                  <p>Username: {order.userID.name || order.userID._id}</p>
                </div>
              )}
              <div>
                {order.items.map((item, idx) => (
                  <p className="py-0.5" key={idx}>
                    {item.name} x {item.quanitity} <span> {item.size} </span>{idx === order.items.length - 1 ? "" : ", "}
                  </p>
                ))}
              </div>
              <p className="mt-3 mb-2 font-medium">
                {order.address.firstName && order.address.lastName
                  ? `${order.address.firstName} ${order.address.lastName}`
                  : order.address}
              </p>
              <div>
                <p>{`${order.address.street},`}</p>
                <p>{`${order.address.city}, ${order.address.state}, ${order.address.country}, ${order.address.zipcode}`}</p>
              </div>
              <p>{order.address.phone}</p>
            </div>
            <div>
              {/* Tampilkan date & time */}
              <p className="text-sm sm:text-[15px]">
                Items: {order.items.length}
              </p>
              <p className="mt-3">Method: {order.paymentMethod}</p>
              <p>Payment: {order.payment ? "Done" : "Pending"}</p>
              <p>Date: {new Date(order.date).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            </div>
            <p className="text-sm sm:text-[15px]">
              Rp {Number(order.amount).toLocaleString('id-ID')}
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div 
                  className={`w-3 h-3 rounded-full ${
                    order.status === "Delivered" ? "bg-green-500" :
                    order.status === "Cancel" ? "bg-red-500" :
                    order.status === "Shipped" || order.status === "Out for delivery" ? "bg-blue-500" :
                    "bg-yellow-500"
                  }`}
                ></div>
                <span className="text-sm font-medium">
                  {order.status}
                </span>
              </div>
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
                className="p-2 font-semibold border rounded"
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancel">Cancel</option>
              </select>
              <button
                className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                onClick={() => {
                  setDeleteOrderId(order._id);
                  setShowDeleteModal(true);
                }}
              >
                Delete Order
              </button>
            </div>
          </div>
        ))
      )}
      {/* Modal delete order, jika diperlukan */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>Yakin ingin menghapus order ini?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={async () => {
                  setDeleting(true);
                  try {
                    const response = await axios.post(
                      backendURL + "/api/order/delete",
                      { orderId: deleteOrderId },
                      { headers: { token } }
                    );
                    
                    if (response.data.success) {
                      toast.success("Order berhasil dihapus");
                      fetchAllOrders();
                    } else {
                      toast.error(response.data.message || "Gagal menghapus order");
                    }
                  } catch (error) {
                    console.error("Delete error:", error);
                    toast.error("Gagal menghapus order");
                  }
                  setDeleting(false);
                  setShowDeleteModal(false);
                  setDeleteOrderId(null);
                }}
                disabled={deleting}
              >
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
