import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';

const ProductRecommendations = ({ productId, category, type = 'similar', limit = 5 }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  useEffect(() => {
    if ((type === 'similar' && productId) || (type === 'category' && category)) {
      fetchRecommendations();
    }
  }, [productId, category, type, limit]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      let url;
      if (type === 'similar') {
        url = `${backendUrl}/api/recommendations/similar/${productId}?limit=${limit}`;
      } else if (type === 'category') {
        url = `${backendUrl}/api/recommendations/category/${category}?limit=${limit}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setRecommendations(data.recommendations);
      } else {
        setError(data.error || 'Failed to fetch recommendations');
      }
    } catch (err) {
      setError('Recommendation service unavailable');
      console.error('Recommendation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    // Navigate to product page
    window.location.href = `/product/${productId}`;
  };

  if (loading) {
    return (
      <div className="my-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2 text-gray-600">Loading recommendations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8">
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const title = type === 'similar' ? 'You might also like' : `Popular in ${category}`;

  return (
    <div className="my-8">
      <div className="text-center py-8">
        <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-600 mt-2">AI-powered recommendations just for you</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {recommendations.map((product) => (
          <div
            key={product.productId}
            className="cursor-pointer group transition-transform hover:scale-105"
            onClick={() => handleProductClick(product.productId)}
          >
            <div className="overflow-hidden rounded-lg bg-gray-100">
              <img
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                src={product.image?.[0] || assets.logo}
                alt={product.name}
                onError={(e) => {
                  e.target.src = assets.logo;
                }}
              />
            </div>
            
            <div className="pt-3 pb-2">
              <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-gray-900">
                {product.name}
              </p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm font-medium text-gray-900">
                  Rp {Number(product.price).toLocaleString('id-ID')}
                </p>
                {product.bestseller && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Bestseller
                  </span>
                )}
              </div>
              {type === 'similar' && product.similarity_score && (
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full"
                      style={{ width: `${Math.round(product.similarity_score * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(product.similarity_score * 100)}% similar
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {type === 'similar' && (
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Recommendations based on product features and similarity
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductRecommendations;
