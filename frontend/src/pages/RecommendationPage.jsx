import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import axios from "axios";

const RecommendationPage = () => {
  const { token, BACKEND_URL } = useContext(ShopContext);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendation = async () => {
      console.log('🔄 Starting recommendation fetch...');
      setLoading(true);
      try {
        if (!token) {
          console.log('👤 No token - fetching general recommendations');
          // If no token, show general recommendations from popular products
          try {
            const productRes = await axios.get(BACKEND_URL + "/api/product/list");
            console.log('📦 Product list response:', productRes.data.success, productRes.data.products?.length);
            if (productRes.data.success) {
              // Show first 6 products as general recommendations
              const generalRecs = productRes.data.products.slice(0, 6);
              console.log('✅ Setting general recommendations:', generalRecs.length);
              setRecommended(generalRecs);
            }
          } catch (error) {
            console.error('❌ Error fetching general recommendations:', error);
            setRecommended([]);
          }
          setLoading(false);
          return;
        }

        console.log('🔑 Token found - fetching user-specific recommendations');
        // Try to get user order history first
        const orderRes = await axios.post(
          BACKEND_URL + "/api/order/userorders",
          {},
          { headers: { token } }
        );

        console.log('📋 Order history response:', orderRes.data.success, orderRes.data.orders?.length);

        if (orderRes.data.success && orderRes.data.orders.length > 0) {
          // User has order history - get personalized recommendations
          console.log('🎯 User has order history - getting personalized recommendations');
          const latestOrder = orderRes.data.orders[0];
          const cartItemsForAPI = latestOrder.items.map(item => ({
            name: item.name,
            category: item.category || 'General',
            id: item._id
          }));

          console.log('🛒 Cart items for API:', cartItemsForAPI);

          // Get recommendations from the new recommendation service
          const recRes = await axios.post(
            BACKEND_URL + "/api/recommendations/checkout",
            { cartItems: cartItemsForAPI },
            { headers: { token } }
          );
          
          console.log('🤖 Recommendation response:', recRes.data.success, recRes.data.recommendations?.length);
          
          if (recRes.data.success && recRes.data.recommendations.length > 0) {
            console.log('✅ Setting personalized recommendations:', recRes.data.recommendations.length);
            console.log('🎯 Sample recommendation:', recRes.data.recommendations[0]);
            
            // Map ML recommendations to frontend products
            const mappedRecommendations = [];
            const availableProducts = await axios.get(BACKEND_URL + "/api/product/list");
            
            if (availableProducts.data.success) {
              console.log('📦 Available products:', availableProducts.data.products.length);
              
              for (const rec of recRes.data.recommendations) {
                // Try to find matching product
                const matchingProduct = availableProducts.data.products.find(p => 
                  p.name.toLowerCase().includes(rec.nama_pakaian.toLowerCase()) ||
                  rec.nama_pakaian.toLowerCase().includes(p.name.toLowerCase()) ||
                  p.name.toLowerCase().replace(/\s+/g, '').includes(rec.nama_pakaian.toLowerCase().replace(/\s+/g, ''))
                );
                
                if (matchingProduct) {
                  console.log('✅ Matched:', rec.nama_pakaian, '→', matchingProduct.name);
                  mappedRecommendations.push({
                    ...matchingProduct,
                    similarity_score: rec.similarity_score,
                    match_percentage: rec.match_percentage,
                    based_on: rec.based_on,
                    source: rec.source
                  });
                } else {
                  console.log('❌ No match found for:', rec.nama_pakaian);
                }
              }
              
              console.log('🎯 Final mapped recommendations:', mappedRecommendations.length);
              setRecommended(mappedRecommendations);
              
              // If no matches, show some general products as fallback
              if (mappedRecommendations.length === 0) {
                console.log('🔄 No matches, showing general products');
                const generalProducts = availableProducts.data.products
                  .filter(p => p.bestseller || Math.random() > 0.5)
                  .slice(0, 6);
                setRecommended(generalProducts);
              }
            } else {
              console.log('⚠️ Failed to get available products');
              // Fallback to raw recommendations if product mapping fails
              console.log('🔄 Using raw recommendations as fallback');
              setRecommended(recRes.data.recommendations.slice(0, 6));
            }
          } else {
            console.log('⚠️ No personalized recommendations - fallback to general');
            // Fallback to general recommendations
            const productRes = await axios.get(BACKEND_URL + "/api/product/list");
            if (productRes.data.success) {
              setRecommended(productRes.data.products.slice(0, 6));
            }
          }
        } else {
          console.log('📭 User has no order history - showing general recommendations');
          // User has no order history - show general recommendations
          try {
            const productRes = await axios.get(BACKEND_URL + "/api/product/list");
            if (productRes.data.success) {
              // Filter and show products that might be interesting
              const generalRecs = productRes.data.products
                .filter(product => product.bestseller || Math.random() > 0.5) // Random selection with bestsellers
                .slice(0, 6);
              console.log('✅ Setting filtered general recommendations:', generalRecs.length);
              setRecommended(generalRecs);
            }
          } catch (error) {
            console.error('❌ Error fetching general recommendations:', error);
            setRecommended([]);
          }
        }
      } catch (error) {
        console.error('💥 Error fetching recommendations:', error);
        // Show general recommendations as fallback
        try {
          const productRes = await axios.get(BACKEND_URL + "/api/product/list");
          if (productRes.data.success) {
            console.log('🔄 Fallback to general products:', productRes.data.products.length);
            setRecommended(productRes.data.products.slice(0, 6));
          }
        } catch (fallbackError) {
          console.error('💀 Fallback recommendations failed:', fallbackError);
          setRecommended([]);
        }
      }
      console.log('🏁 Recommendation fetch completed');
      setLoading(false);
    };
    fetchRecommendation();
  }, [token, BACKEND_URL]);

  return (
    <div className="my-10 min-h-[60vh]">
      <div className="py-8 text-center text-3xl">
        <Title text1={`RECOMMENDATION`} text2={`FOR YOU`} />
        <p className="m-auto w-3/4 text-xs text-gray-600 sm:text-sm md:text-base">
          {token 
            ? "Rekomendasi produk berdasarkan riwayat belanja dan preferensi Anda."
            : "Rekomendasi produk populer untuk Anda. Login untuk mendapatkan rekomendasi yang lebih personal."
          }
        </p>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : recommended.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {recommended.map((item, index) => (
            <div key={item._id || index} className="relative">
              {/* Check if it's a real product or raw recommendation */}
              {item.image ? (
                <ProductItem
                  id={item._id}
                  image={item.image}
                  name={item.name}
                  price={item.price}
                />
              ) : (
                /* Raw recommendation display */
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="w-full h-40 bg-gray-200 rounded mb-4 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                  <h3 className="font-medium text-sm mb-2">{item.nama_pakaian}</h3>
                  <p className="text-xs text-gray-600">Category: {item.categories}</p>
                  <p className="text-xs text-gray-600">Type: {item.type}</p>
                  {item.based_on && (
                    <p className="text-xs text-blue-600 mt-1">Based on: {item.based_on}</p>
                  )}
                </div>
              )}
              
              {/* Show similarity score if available */}
              {(item.similarityScore || item.similarity_score || item.match_percentage) && (
                <span className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full shadow">
                  {item.match_percentage 
                    ? `${item.match_percentage.toFixed(0)}%`
                    : `${((item.similarityScore || item.similarity_score || 0) * 100).toFixed(0)}%`
                  }
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Tidak ada rekomendasi produk untuk Anda saat ini.
        </div>
      )}
    </div>
  );
};

export default RecommendationPage;
