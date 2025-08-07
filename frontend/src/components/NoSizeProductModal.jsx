import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { formatCurrency } from '../utils/formatCurrency';

const NoSizeProductModal = ({ product, isOpen, onClose, onViewDetails }) => {
  const { addToCart, token } = useContext(ShopContext);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    console.log('🛍️ Modal Add to Cart clicked for No Size product:', product.name);
    addToCart(product._id, "No Size");
    onClose(); // Close modal after adding to cart
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      onClose();
      window.location.href = `/product/${product._id}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Quick Add to Cart</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4">
          {/* Product Image */}
          <div className="mb-4">
            <img 
              src={product.image[0]} 
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>

          {/* Product Info */}
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <p className="text-2xl font-bold text-gray-900 mb-3">
              {formatCurrency(product.price)}
            </p>
            
            {/* One Size Info */}
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800 font-medium">
                ✨ One Size Fits All
              </p>
              <p className="text-xs text-blue-600 mt-1">
                This product comes in a universal size
              </p>
            </div>

            {/* Product Description (shortened) */}
            <div className="text-sm text-gray-600 mb-4">
              <p className="line-clamp-3">
                {product.description.length > 150 
                  ? product.description.substring(0, 150) + "..." 
                  : product.description
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleViewDetails}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              View Details
            </button>
            
            {token ? (
              <button
                onClick={handleAddToCart}
                className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
              >
                Add to Cart
              </button>
            ) : (
              <button
                onClick={() => alert("Please login first")}
                className="flex-1 px-4 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                disabled
              >
                Login to Add
              </button>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p>✓ 100% Original product</p>
            <p>✓ Cash on delivery available</p>
            <p>✓ Easy return within 7 days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoSizeProductModal;
