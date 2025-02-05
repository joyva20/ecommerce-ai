import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import style from "./PlaceOrder.module.css";

const PlaceOrder = () => {
  const { navigate } = useContext(ShopContext);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  return (
    <div className="flex min-h-[80vh] flex-col justify-between gap-4 border-t pt-5 sm:flex-row sm:pt-14">
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
            required
          />
          <input
            className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
            type="text"
            placeholder="Last name*"
            required
          />
        </div>
        <input
          className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
          type="email"
          placeholder="Email address"
        />
        <input
          className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
          type="text"
          placeholder="Street*"
          required
        />
        <div className="flex gap-3">
          <input
            className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
            type="text"
            placeholder="Country*"
            required
          />
          <input
            className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
            type="text"
            placeholder="State*"
            required
          />
          <input
            className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
            type="text"
            placeholder="City*"
            required
          />
        </div>
        <div className="flex gap-3">
          <input
            className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
            type="number"
            placeholder="Zip code*"
            required
          />
        </div>
        <input
          className="w-full rounded border border-gray-300 bg-slate-100 px-3.5 py-1.5"
          type="text"
          placeholder="Phone Number*"
          pattern="((09)|(\+?989))[0-9]{10}"
          maxLength="13"
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
              onClick={() => {
                let navPath = "/orders";
                let canShowError = 0;
                let inputsNotFilled = [];
                const inputs = document.querySelectorAll(`input:required`);
                for (let i = 0; i < inputs.length; i++) {
                  const input = inputs[i];
                  if (input.value === "") {
                    const inputThatIsNotFilled = input.placeholder.slice(0, -1);
                    navPath = "/place-order";
                    canShowError = 1;
                    inputsNotFilled.push(inputThatIsNotFilled);
                  }
                }
                if (canShowError) {
                  let errorMessage = "Fill out the required fills:";
                  inputsNotFilled.map(
                    (inputName) => (errorMessage += "\n" + inputName),
                  );
                  toast.error(<pre>{errorMessage}</pre>);
                } else {
                  toast.success("Your order has been submitted.");
                }
                navigate(navPath);
              }}
              className="bg-black px-16 py-3 text-sm text-white"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
