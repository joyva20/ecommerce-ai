import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import CheckoutRecommendations from "../components/CheckoutRecommendations";
import { assets } from "../assets/assets";
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
    getCartAmount,
    delivery_fee,
    BACKEND_URL,
    products,
    addToCart
  } = useContext(ShopContext);
  const [paymentMethod, setPaymentMethod] = useState("cod");
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

  // Get cart items for recommendations
  const getCartItemsForRecommendations = () => {
    let orderItems = [];
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
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
    try {
      let orderItems = [];
      for (const items in cartItems)
        for (const item in cartItems[items])
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(
              products.find((product) => product._id === items),
            );
            if (itemInfo) itemInfo.size = item;
            itemInfo.quanitity = cartItems[items][item];
            orderItems.push(itemInfo);
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
        amount: getCartAmount() + delivery_fee,
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
              setCartItems({});
              navigate("/orders");
              toast.success("Your order has been placed.");
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
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex min-h-[80vh] flex-col justify-between gap-4 border-t pt-5 sm:flex-row sm:pt-14"
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
          <CartTotal />
        </div>
        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          {/*----------------------- Payment Method Selection -----------------------*/}
          <div className="flex flex-col gap-3 lg:flex-row">
            <div
              onClick={() => setPaymentMethod("sepah")}
              className="flex cursor-pointer items-center gap-3 border p-2 px-3"
            >
              <p
                className={`h-3.5 min-w-3.5 rounded-full border transition duration-300 ease-in-out ${paymentMethod === "sepah" ? "bg-green-600" : ""}`}
              ></p>
              <img
                className="mx-4 h-5"
                src={assets.Sepah_logo}
                alt="Bank Sepah"
              />
            </div>
            <div
              onClick={() => setPaymentMethod("tejarat")}
              className="flex cursor-pointer items-center gap-3 border p-2 px-3"
            >
              <p
                className={`h-3.5 min-w-3.5 rounded-full border transition duration-300 ease-in-out ${paymentMethod === "tejarat" ? "bg-green-600" : ""}`}
              ></p>
              <img
                className="mx-4 h-5"
                src={assets.Tejarat_Logo}
                alt="Bank Tejarat"
              />
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
            <button
              type="submit"
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
              className="bg-black px-16 py-3 text-sm text-white"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>

      {/* AI Recommendations Section */}
      <CheckoutRecommendations 
        cartItems={getCartItemsForRecommendations()} 
        onAddToCart={addToCart}
      />
    </form>
  );
};

export default PlaceOrder;
