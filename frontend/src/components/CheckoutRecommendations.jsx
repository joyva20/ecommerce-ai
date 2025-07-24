import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';

const CheckoutRecommendations = ({ cartItems, onAddToCart }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { currency, BACKEND_URL, products, token } = useContext(ShopContext);

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      fetchRecommendations();
    }
  }, [cartItems]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      // Debug log
      console.log('🛒 CheckoutRecommendations: BACKEND_URL =', BACKEND_URL);
      console.log('🛒 CheckoutRecommendations: Cart items =', cartItems);

      // Prepare cart items for API
      const cartItemsForAPI = cartItems.map(item => ({
        name: item.name,
        category: item.category,
        id: item._id
      }));

      const response = await fetch(`${BACKEND_URL}/api/recommendations/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ cartItems: cartItemsForAPI })
      });

      const data = await response.json();

      if (data.success) {
        // Map recommendations to products in our database
        const mappedRecommendations = data.recommendations.map(rec => {
          // Try to find matching product in our products list
          const matchingProduct = products.find(p => 
            p.name.toLowerCase().includes(rec.nama_pakaian.toLowerCase()) ||
            rec.nama_pakaian.toLowerCase().includes(p.name.toLowerCase())
          );

          return {
            id: matchingProduct?._id || `rec_${Date.now()}_${Math.random()}`,
            name: matchingProduct?.name || rec.nama_pakaian,
            category: matchingProduct?.category || rec.categories,
            price: matchingProduct?.price || 199000, // Default price
            image: matchingProduct?.image || [assets.logo],
            similarity_score: rec.similarity_score,
            match_percentage: rec.match_percentage,
            based_on: rec.based_on,
            originalProduct: matchingProduct
          };
        });

        setRecommendations(mappedRecommendations);
      } else {
        setError(data.error || 'Failed to fetch recommendations');
      }
    } catch (err) {
      setError('Recommendation service unavailable');
      console.error('Recommendation fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (product.originalProduct && onAddToCart) {
      onAddToCart(product.originalProduct._id, 'S'); // Default size
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error('Product not available in our store');
    }
  };

  if (loading) {
    return (
      <div className="my-8 p-6 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-gray-600">Finding perfect recommendations for you...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 p-6 bg-gray-50 rounded-lg">
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Unable to load recommendations at this time</p>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="my-8 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          🤖 You might also like
        </h3>
        <p className="text-gray-600 text-sm">
          AI-powered recommendations based on your cart items
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {recommendations.map((product, index) => (
          <div
            key={product.id}
            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            {/* Product Image */}
            <div className="relative overflow-hidden bg-gray-100">
              <img
                className="w-full h-32 sm:h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                src={product.image[0]}
                alt={product.name}
                onError={(e) => {
                  e.target.src = assets.logo;
                }}
              />
              {/* Similarity Badge */}
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                {product.match_percentage}% match
              </div>
            </div>

            {/* Product Info */}
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">
                {product.name}
              </h4>
              
              <div className="text-xs text-gray-500 mb-2">
                Similar to: {product.based_on}
              </div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-gray-900">
                  {currency}{Number(product.price).toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-gray-500">
                  {product.category}
                </span>
              </div>

              {/* Add to Cart Button */}
              {product.originalProduct ? (
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white text-xs py-2 px-3 rounded-md transition-colors duration-200 font-medium"
                >
                  Add to Cart
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 text-xs py-2 px-3 rounded-md cursor-not-allowed"
                >
                  Not Available
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* AI Info */}
      <div className="text-center mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          🧠 Powered by Machine Learning • {recommendations.length} recommendations found
        </p>
      </div>
    </div>
  );
};

export default CheckoutRecommendations;
