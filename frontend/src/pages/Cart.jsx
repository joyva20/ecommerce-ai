import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import CartTotal from "../components/CartTotal";
import { formatCurrency } from "../utils/formatCurrency";

const Cart = () => {
  const { 
    products, 
    currency, 
    cartItems, 
    UpdateQuantity, 
    navigate,
    toggleSelectCartItem,
    selectAllCartItems,
    unselectAllCartItems,
    isItemSelected,
    getSelectedCartAmount,
    getSelectedCartCount
  } = useContext(ShopContext);
  const [cartData, setCarData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({ 
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setCarData(tempData);
    }
  }, [cartItems, products]);
  return (
    <div className="border-t pt-14">
      <div className="mb-3 text-2xl">
        <div>
          <Title text1={"YOUR"} text2={"CART"} />
        </div>
        
        {/* Select All Controls */}
        {cartData.length > 0 && (
          <div className="mt-6 mb-4 flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="selectAll"
                checked={getSelectedCartCount() === cartData.length && cartData.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    selectAllCartItems();
                  } else {
                    unselectAllCartItems();
                  }
                }}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="selectAll" className="text-sm font-medium text-gray-700">
                Select All Items ({cartData.length})
              </label>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={selectAllCartItems}
                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Select All
              </button>
              <button
                onClick={unselectAllCartItems}
                className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Unselect All
              </button>
            </div>
            
            {getSelectedCartCount() > 0 && (
              <div className="ml-auto text-sm font-medium text-green-600">
                {getSelectedCartCount()} items selected
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        {cartData.map((item, index) => {
          const productData = products.find(
            (product) => product._id === item._id,
          );
          return (
            <div
              key={item._id + index}
              className={`grid grid-cols-[auto_4fr_0.5fr_0.5fr] items-center gap-4 border-b border-t py-4 text-gray-700 sm:grid-cols-[auto_4fr_2fr_0.5fr] ${
                isItemSelected(item._id, item.size) ? 'bg-green-50 border-green-200' : ''
              }`}
            >
              {/* Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isItemSelected(item._id, item.size)}
                  onChange={() => toggleSelectCartItem(item._id, item.size)}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
              </div>
              
              <div className="flex items-start gap-5">
                <img
                  src={productData.image[0]}
                  alt="Product Image"
                  className="w-16 sm:w-20"
                />
                <div>
                  <p className="text-xs font-medium sm:text-lg">
                    <Link
                      className="cursor-pointer text-gray-700"
                      to={`/product/${productData._id}`}
                    >
                      {productData.name}
                    </Link>
                  </p>
                  <div className="mt-2 flex items-center gap-5">
                    <p>
                      {formatCurrency(productData.price)}
                    </p>
                    {item.size !== "No Size" && (
                      <p className="bg-slate-50 px-2 sm:px-3 sm:py-1">
                        {item.size}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="bg-gray-200 px-2 py-1 rounded text-lg"
                  onClick={() =>
                    item.quantity > 1 && UpdateQuantity(item._id, item.size, item.quantity - 1)
                  }
                  type="button"
                >
                  -
                </button>
                <input
                  onChange={(e) =>
                    e.target.value === "" || e.target.value === "0"
                      ? null
                      : UpdateQuantity(
                          item._id,
                          item.size,
                          Number(e.target.value),
                        )
                  }
                  type="number"
                  min={1}
                  max={999}
                  value={item.quantity}
                  className="max-w-10 border px-1 py-1 sm:max-w-20 sm:px-2 text-center"
                  readOnly
                />
                <button
                  className="bg-gray-200 px-2 py-1 rounded text-lg"
                  onClick={() =>
                    UpdateQuantity(item._id, item.size, item.quantity + 1)
                  }
                  type="button"
                >
                  +
                </button>
              </div>
              <img
                onClick={() => UpdateQuantity(item._id, item.size, 0)}
                className="mr-4 w-4 cursor-pointer sm:w-5"
                src={assets.bin_icon}
                alt="Delete"
              />
            </div>
          );
        })}
      </div>
      <div className="my-20 flex justify-end">
        <div className="w-full sm:w-[450px]">
          {/* Selected Items Summary */}
          {getSelectedCartCount() > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Selected for Checkout:</h3>
              <p className="text-sm text-green-700">
                {getSelectedCartCount()} items selected
              </p>
              <p className="text-lg font-bold text-green-800">
                Total: {formatCurrency(getSelectedCartAmount())}
              </p>
            </div>
          )}
          
          <CartTotal />
          <div className="w-full text-end">
            <button
              onClick={() => {
                if (!localStorage.getItem("token")) {
                  toast.error("You should login/create account first");
                  navigate("/login");
                  return;
                }
                
                if (getSelectedCartCount() <= 0) {
                  toast.error("Please select items to checkout");
                  return;
                }
                
                navigate("/place-order");
              }}
              className={`my-8 px-8 py-3 text-sm text-white transition ${
                getSelectedCartCount() > 0 
                  ? 'bg-black hover:bg-gray-800' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={getSelectedCartCount() <= 0}
            >
              PROCEED TO CHECKOUT ({getSelectedCartCount()} items)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
