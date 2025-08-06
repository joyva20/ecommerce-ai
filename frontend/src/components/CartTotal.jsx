import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import { formatCurrency } from "../utils/formatCurrency";

const CartTotal = () => {
  const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);
  const cartAmount = getCartAmount();
  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1={"CART"} text2={"TOTALS"} />
      </div>
      <div className="mt-2 flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>
            {formatCurrency(cartAmount)}
          </p>
        </div>
        <hr />
        <div className="flex justify-between">
          <p>Shipping fee</p>
          <p>
            {formatCurrency(cartAmount === 0 || cartAmount === undefined ? 0 : delivery_fee)}
          </p>
        </div>
        <hr />
        <div className="flex justify-between">
          <b>Total</b>
          <b>
            {formatCurrency(cartAmount === 0 || cartAmount === undefined
              ? 0
              : cartAmount + delivery_fee)}
          </b>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
