/* eslint-disable react/prop-types */
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { formatCurrency } from "../utils/formatCurrency";
import NoSizeProductModal from "./NoSizeProductModal";

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const ProductItem = ({ id, image, name, price, sizes }) => {
  const { products } = useContext(ShopContext);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Check if this is a "No Size" product
  const isNoSizeProduct = sizes && sizes.length === 1 && sizes[0] === "No Size";
  
  // Get full product data for modal
  const fullProduct = products.find(p => p._id === id);

  const handleClick = (e) => {
    if (isNoSizeProduct) {
      e.preventDefault(); // Prevent navigation to product page
      setShowModal(true); // Show modal instead
    }
    // For regular products, let the Link handle navigation naturally
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleViewDetails = () => {
    setShowModal(false);
    scrollToTop();
    navigate(`/product/${id}`);
  };

  // If it's a "No Size" product, render without Link to prevent navigation
  if (isNoSizeProduct) {
    return (
      <>
        <div 
          onClick={handleClick}
          className="cursor-pointer text-gray-700 flex flex-col justify-between relative group"
        >
          {/* No Size Badge */}
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full z-10">
            One Size
          </div>
          
          <div className="overflow-hidden h-full">
            <img 
              className="hover:scale-110 transition ease-in-out h-full object-center" 
              src={image[0]} 
              alt={name} 
            />
          </div>
          
          <div>
            <p className="pt-3 pb-1 text-sm">{name}</p>
            <p className="text-sm font-medium">{formatCurrency(price)}</p>
            
            {/* Quick Add Button for No Size Products */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
              className="mt-2 w-full bg-black text-white text-xs py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              Quick Add
            </button>
          </div>
        </div>

        {/* Modal for No Size Products */}
        <NoSizeProductModal 
          product={fullProduct}
          isOpen={showModal}
          onClose={handleCloseModal}
          onViewDetails={handleViewDetails}
        />
      </>
    );
  }

  // For regular products, render with Link for proper navigation
  return (
    <Link 
      onClick={scrollToTop}
      to={`/product/${id}`} 
      className="cursor-pointer text-gray-700 flex flex-col justify-between"
    >
      <div className="overflow-hidden h-full">
        <img 
          className="hover:scale-110 transition ease-in-out h-full object-center" 
          src={image[0]} 
          alt={name} 
        />
      </div>
      
      <div>
        <p className="pt-3 pb-1 text-sm">{name}</p>
        <p className="text-sm font-medium">{formatCurrency(price)}</p>
      </div>
    </Link>
  );
};

export default ProductItem;
