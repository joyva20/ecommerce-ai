import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import { formatCurrency } from "../utils/formatCurrency";

const SelectedCartTotal = () => {
  const { delivery_fee, getSelectedCartAmount } = useContext(ShopContext);
  const selectedAmount = getSelectedCartAmount();
  
  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1={"SELECTED"} text2={"TOTALS"} />
      </div>
      <div className="mt-2 flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <p>Subtotal (Selected Items)</p>
          <p>
            {formatCurrency(selectedAmount)}
          </p>
        </div>
        <hr />
        <div className="flex justify-between">
          <p>Shipping fee</p>
          <p>
            {formatCurrency(selectedAmount === 0 ? 0 : delivery_fee)}
          </p>
        </div>
        <hr />
        <div className="flex justify-between">
          <b>Total</b>
          <b>
            {formatCurrency(selectedAmount === 0 
              ? 0 
              : selectedAmount + delivery_fee)}
          </b>
        </div>
      </div>
    </div>
  );
};

export default SelectedCartTotal;
