/* eslint-disable react/prop-types */
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);

  return (
    <Link className="cursor-pointer text-gray-700 flex flex-col justify-between" to={`/product/${id}`}>
      <div className="overflow-hidden h-full">
        <img className="hover:scale-110 transition ease-in-out h-full object-center"src={image[0]} alt="" />
      </div>
      <div>
      <p className="pt-3 pb-1 text-sm">{name}</p>
      <p className="text-sm font-medium">{currency}{price}</p>
      </div>
    </Link>
  );
};

export default ProductItem;
