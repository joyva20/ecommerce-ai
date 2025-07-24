import axios from "axios";
import { useEffect, useState } from "react";
import { backendURL } from "../App";
import { toast } from "react-toastify";
import Edit from "./Edit";
const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);

  const fetchList = async () => {
    try {
      const response = await axios.get(backendURL + "/api/product/list");
      // console.log(response.data.products)
      if (response.data.success) setList(response.data.products);
      else toast.error(response.data.message);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };
  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendURL + "/api/product/remove",
        { id },
        { headers: { token } },
      );
      if (response.data.success) {
        toast.info(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchList();
  }, []);
  const currency = "Rp ";
  return (
    <>
      <p className="mb-2">All Products List</p>
      <div className="flex flex-col gap-2">
        {/* ---------------- List Table Title ------------------------ */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className="text-center">Edit</b>
          <b className="text-center">Action</b>
        </div>
        {/* ---------------- Product List ------------------------ */}
        {list.map((item, index) => {
          return (
            <div
              className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
              key={index}
            >
              <img className="w-12" src={item.image[0]} alt="Product Image" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>
                {currency}
                {Number(item.price).toLocaleString('id-ID')}
              </p>
              <p
                onClick={() => setEditId(item._id)}
                className="text-right md:text-center cursor-pointer text-blue-600 underline"
              >
                Edit
              </p>
              <p
                onClick={() => removeProduct(item._id)}
                className="text-right md:text-center cursor-pointer text-lg"
              >
                X
              </p>
            </div>
          );
        })}
      </div>
      {editId && (
        <Edit
          token={token}
          productId={editId}
          onClose={() => setEditId(null)}
          onUpdated={fetchList}
        />
      )}
    </>
  );
};

export default List;
