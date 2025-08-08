import Title from "../components/Title";
import SelectedCartTotal from "../components/SelectedCartTotal";
import CheckoutRecommendations from "../components/CheckoutRecommendations";
import PaymentButton from "../components/PaymentButton";
import { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import style from "./PlaceOrder.module.css";
import axios from "axios";

const PlaceOrder = () => {
  const {
    navigate,
    token,
    cartItems,
    setCartItems,
    selectedCartItems,
    getCartAmount,
    getSelectedCartAmount,
    getSelectedCartCount,
    clearSelectedFromCart,
    delivery_fee,
    BACKEND_URL,
    products,
    addToCart
  } = useContext(ShopContext);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    state: "",
    city: "",
    street: "",
    zipcode: "",
    phone: "",
  });

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    // Updating form data by maintaining the previous state and setting a new value for a specific field
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Get cart items for recommendations (only selected)
  const getCartItemsForRecommendations = () => {
    let orderItems = [];
    for (const items in selectedCartItems) {
      for (const item in selectedCartItems[items]) {
        if (selectedCartItems[items][item] && cartItems[items] && cartItems[items][item] > 0) {
          const itemInfo = products.find((product) => product._id === items);
          if (itemInfo) {
            orderItems.push({
              _id: itemInfo._id,
              name: itemInfo.name,
              category: itemInfo.category,
              price: itemInfo.price,
              quantity: cartItems[items][item]
            });
          }
        }
      }
    }
    return orderItems;
  };
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (isProcessingOrder) return;
    setIsProcessingOrder(true);
    
    try {
      let orderItems = [];
      
      // Debug: Log selected items
      console.log('🛒 Selected Cart Items:', selectedCartItems);
      console.log('🛒 All Cart Items:', cartItems);
      console.log('📦 Products:', products);
      
      // Process only selected items
      for (const items in selectedCartItems) {
        for (const item in selectedCartItems[items]) {
          if (selectedCartItems[items][item] && cartItems[items] && cartItems[items][item] > 0) {
            const itemInfo = structuredClone(
              products.find((product) => product._id === items),
            );
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }
      
      // Debug: Log order items
      console.log('📋 Order Items (Selected):', orderItems);
      
      if (orderItems.length === 0) {
        toast.error("No items selected for checkout! Please select items first.");
        setIsProcessingOrder(false);
        return;
      }
      
      let orderData = {
        address: {
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  address:formData.address,
                  country: formData.country,
                  city: formData.city,
                  state: formData.state,
                  street: formData.street,
                  zipcode: formData.zipcode,

        },
        items: orderItems,
        amount: getSelectedCartAmount() + delivery_fee,
      };
      
      switch (paymentMethod) {
        // API calls for COD
        case "cod":
          {
            const response = await axios.post(
              BACKEND_URL + "/api/order/place",
              orderData,
              { headers: { token } },
            );
            if (response.data.success) {
              await clearSelectedFromCart();
              navigate("/orders", { replace: true });
              toast.success("Your order has been placed.");
            } else {
              toast.error(response.data.message);
            }
          }
          break;
          
        // API calls for Digital Payments (QRIS, DANA, GOPAY, SHOPEEPAY)
        case "qris":
        case "dana":
        case "gopay":
        case "shopeepay":
          {
            orderData.paymentMethod = paymentMethod.toUpperCase();
            const response = await axios.post(
              BACKEND_URL + "/api/order/place",
              orderData,
              { headers: { token } },
            );
            
            if (response.data.success) {
              setCurrentOrderId(response.data.orderId);
              toast.success(`Order created! Please complete payment with ${paymentMethod.toUpperCase()}.`);
              
              // Clear selected cart items and redirect immediately after order creation
              await clearSelectedFromCart();
              navigate("/orders", { replace: true });
            } else {
              toast.error(response.data.message);
            }
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (result) => {
    console.log('Payment successful:', result);
    await clearSelectedFromCart();
    navigate("/orders", { replace: true });
    toast.success("Payment successful! Your order is being processed.");
  };

  // Handle pending payment
  const handlePaymentPending = (result) => {
    console.log('Payment pending:', result);
    navigate("/orders", { replace: true });
    toast.info("Payment is being processed. Please check your order status.");
  };

  // Handle payment error
  const handlePaymentError = (result) => {
    console.error('Payment error:', result);
    toast.error("Payment failed. Please try again or contact support.");
  };

  return (
    <div className="min-h-[80vh] border-t pt-5 sm:pt-14">
      {/* Main Form Section */}
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col justify-between gap-4 sm:flex-row"
      >
        {/*----------------------- Left Side -----------------------*/}
        <div className="flex w-full flex-col gap-4 sm:max-w-[480px]">
          <div className="my-3 text-xl sm:text-2xl">
            <Title text1={"DELIVERY"} text2={"INFORMATION"} />
          </div>
        <div className="flex gap-3">
          <input
            className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
            type="text"
            placeholder="First name*"
            onChange={onChangeHandler}
            name="firstName"
            value={formData.firstName}
            required
          />
          <input
            className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
            type="text"
            placeholder="Last name*"
            onChange={onChangeHandler}
            name="lastName"
            value={formData.lastName}
            required
          />
        </div>
        <input
          className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
          type="email"
          placeholder="Email address*"
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          required
        />
        <input
          className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
          type="text"
          placeholder="Street*"
          onChange={onChangeHandler}
          name="street"
          value={formData.street}
          required
        />
                <input
          className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
          type="text"
          placeholder="Address*"
          onChange={onChangeHandler}
          name="address"
          value={formData.address}
          required
        />
        <div className="flex gap-3">
          <input
            className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
            type="text"
            placeholder="Country*"
            onChange={onChangeHandler}
            name="country"
            value={formData.country}
            required
          />
          <input
            className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
            type="text"
            placeholder="State*"
            onChange={onChangeHandler}
            name="state"
            value={formData.state}
            required
          />
          <input
            className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
            type="text"
            placeholder="City*"
            onChange={onChangeHandler}
            name="city"
            value={formData.city}
            required
          />
        </div>
        <div className="flex gap-3">
          <input
            className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
            type="number"
            placeholder="Zip code*"
            onChange={onChangeHandler}
            name="zipcode"
            value={formData.zipcode}
            required
          />
        </div>
        <input
          className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
          type="tel"
          placeholder="Phone Number*"
          pattern="^(\+62|62|08)[0-9]{8,11}$"
          maxLength="14"
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          required
        />
        <p className={style.req}>*: Required</p>
      </div>
      {/*----------------------- Right Side -----------------------*/}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <SelectedCartTotal />
        </div>
        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          {/*----------------------- Payment Method Selection -----------------------*/}
          <div className="flex flex-col gap-3 lg:flex-row">
            <div
              onClick={() => setPaymentMethod("qris")}
              className="flex cursor-pointer items-center gap-3 border p-2 px-3"
            >
              <p
                className={`h-3.5 min-w-3.5 rounded-full border transition duration-300 ease-in-out ${paymentMethod === "qris" ? "bg-green-600" : ""}`}
              ></p>
              <div className="mx-4 text-sm font-medium text-gray-500">
                <p>QRIS</p>
                <p className="text-xs text-gray-400">Scan QR Code</p>
              </div>
            </div>
            <div
              onClick={() => setPaymentMethod("dana")}
              className="flex cursor-pointer items-center gap-3 border p-2 px-3"
            >
              <p
                className={`h-3.5 min-w-3.5 rounded-full border transition duration-300 ease-in-out ${paymentMethod === "dana" ? "bg-green-600" : ""}`}
              ></p>
              <div className="mx-4 text-sm font-medium text-gray-500">
                <p>DANA</p>
                <p className="text-xs text-gray-400">E-Wallet</p>
              </div>
            </div>
            <div
              onClick={() => setPaymentMethod("gopay")}
              className="flex cursor-pointer items-center gap-3 border p-2 px-3"
            >
              <p
                className={`h-3.5 min-w-3.5 rounded-full border transition duration-300 ease-in-out ${paymentMethod === "gopay" ? "bg-green-600" : ""}`}
              ></p>
              <div className="mx-4 text-sm font-medium text-gray-500">
                <p>GOPAY</p>
                <p className="text-xs text-gray-400">E-Wallet</p>
              </div>
            </div>
            <div
              onClick={() => setPaymentMethod("shopeepay")}
              className="flex cursor-pointer items-center gap-3 border p-2 px-3"
            >
              <p
                className={`h-3.5 min-w-3.5 rounded-full border transition duration-300 ease-in-out ${paymentMethod === "shopeepay" ? "bg-green-600" : ""}`}
              ></p>
              <div className="mx-4 text-sm font-medium text-gray-500">
                <p>SHOPEEPAY</p>
                <p className="text-xs text-gray-400">E-Wallet</p>
              </div>
            </div>
            <div
              onClick={() => setPaymentMethod("cod")}
              className="flex cursor-pointer items-center gap-3 border p-2 px-3"
            >
              <p
                className={`h-3.5 min-w-3.5 rounded-full border transition duration-300 ease-in-out ${paymentMethod === "cod" ? "bg-green-600" : ""}`}
              ></p>
              <p className="mx-4 text-sm font-medium text-gray-500">
                CASH ON DELIVERY
              </p>
            </div>
          </div>
          <div className="mt-8 w-full text-center">
            {(paymentMethod === "qris" || paymentMethod === "dana" || paymentMethod === "gopay" || paymentMethod === "shopeepay") && currentOrderId ? (
              <PaymentButton
                orderId={currentOrderId}
                amount={getCartAmount() + delivery_fee}
                onSuccess={handlePaymentSuccess}
                onPending={handlePaymentPending}
                onError={handlePaymentError}
                className="bg-blue-600 hover:bg-blue-700 text-white px-16 py-3 text-sm"
              >
                PAY WITH {paymentMethod.toUpperCase()}
              </PaymentButton>
            ) : (
              <button
                type="submit"
                disabled={isProcessingOrder}
                onClick={() => {
                  // let navPath = "/orders";
                  let canShowError = false;
                  let inputsNotFilled = [];
                  const inputs = document.querySelectorAll(`input:required`);
                  for (const i in inputs) {
                    const input = inputs[i];
                    if (input.value === "") {
                      const inputThatIsNotFilled = input.placeholder.slice(0, -1);
                      // navPath = "/place-order";
                      canShowError = true;
                      inputsNotFilled.push(inputThatIsNotFilled);
                    }
                  }
                  if (canShowError) {
                    let errorMessage = "Fill out the required fills:";
                    inputsNotFilled.map(
                      (inputName) => (errorMessage += "\n" + inputName),
                    );
                    toast.error(<pre>{errorMessage}</pre>);
                  }
                  // else {
                  //   toast.success("Your order has been submitted.");
                  // }
                  // navigate(navPath);
                }}
                className={`px-16 py-3 text-sm text-white transition-colors ${
                  isProcessingOrder 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-black hover:bg-gray-800'
                }`}
              >
                {isProcessingOrder ? 'PROCESSING...' : 'PLACE ORDER'}
              </button>
            )}
          </div>
        </div>
      </div>
      </form>

      {/* AI Recommendations Section - Full Width Below */}
      <CheckoutRecommendations 
        cartItems={getCartItemsForRecommendations()} 
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default PlaceOrder;
