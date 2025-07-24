import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import axios from "axios";

const ForYou = () => {
  const { token, BACKEND_URL, products } = useContext(ShopContext);
  const [recommended, setRecommended] = useState([]);
  const [hasOrder, setHasOrder] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendation = async () => {
      console.log('🏠 ForYou: Starting recommendation fetch...');
      console.log('🏠 ForYou: BACKEND_URL =', BACKEND_URL);
      console.log('🏠 ForYou: Token =', !!token);
      
      setLoading(true);
      
      try {
        if (!BACKEND_URL) {
          console.log('🏠 ForYou: No BACKEND_URL');
          setLoading(false);
          return;
        }

        if (!token) {
          console.log('🏠 ForYou: No token - showing placeholder');
          setRecommended([]);
          setHasOrder(false);
          setLoading(false);
          return;
        }
        
        console.log('🏠 ForYou: Checking user order history...');
        const orderRes = await axios.post(
          BACKEND_URL + "/api/order/userorders",
          {},
          { headers: { token } }
        );
        
        console.log('🏠 ForYou: Order response:', orderRes.data.success, orderRes.data.orders?.length);
        
        if (orderRes.data.success && orderRes.data.orders.length > 0) {
          setHasOrder(true);
          
          const latestOrder = orderRes.data.orders[0];
          const cartItemsForAPI = latestOrder.items.map(item => ({
            name: item.name,
            category: item.category || 'General',
            id: item._id
          }));

          console.log('🏠 ForYou: Getting recommendations for cart items:', cartItemsForAPI);
          const recRes = await axios.post(
            BACKEND_URL + "/api/recommendations/checkout",
            { cartItems: cartItemsForAPI },
            { headers: { token } }
          );
          
          console.log('🏠 ForYou: Recommendation response:', recRes.data.success, recRes.data.recommendations?.length);
          
          if (recRes.data.success && recRes.data.recommendations.length > 0) {
            // Map ML recommendations to actual products from database
            const mappedRecommendations = [];
            
            // Get available products
            const availableProducts = await axios.get(BACKEND_URL + "/api/product/list");
            
            if (availableProducts.data.success) {
              console.log('📦 Available products for mapping:', availableProducts.data.products.length);
              
              for (const rec of recRes.data.recommendations.slice(0, 4)) {
                // Try to find matching product in products list
                const matchingProduct = availableProducts.data.products.find(p => 
                  p.name.toLowerCase().includes(rec.nama_pakaian.toLowerCase()) ||
                  rec.nama_pakaian.toLowerCase().includes(p.name.toLowerCase()) ||
                  p.name.toLowerCase().replace(/\s+/g, '').includes(rec.nama_pakaian.toLowerCase().replace(/\s+/g, ''))
                );
                
                if (matchingProduct) {
                  console.log('✅ ForYou matched:', rec.nama_pakaian, '→', matchingProduct.name);
                  mappedRecommendations.push({
                    ...matchingProduct,
                    similarity_score: rec.similarity_score,
                    match_percentage: rec.match_percentage,
                    based_on: rec.based_on
                  });
                } else {
                  console.log('❌ ForYou no match for:', rec.nama_pakaian);
                }
              }
              
              console.log('🏠 ForYou: Final mapped recommendations:', mappedRecommendations.length);
              setRecommended(mappedRecommendations);
              
              // If no matches, show some general products as fallback
              if (mappedRecommendations.length === 0) {
                console.log('🔄 ForYou: No matches, showing general products');
                const generalProducts = availableProducts.data.products
                  .filter(p => p.bestseller || Math.random() > 0.7)
                  .slice(0, 4);
                setRecommended(generalProducts);
              }
            } else {
              console.log('⚠️ ForYou: Failed to get products list');
              setRecommended([]);
            }
          } else {
            console.log('🏠 ForYou: No recommendations found - showing bestsellers');
            // Fallback to products from context if available
            if (products && products.length > 0) {
              const fallbackProducts = products
                .filter(p => p.bestseller || Math.random() > 0.7)
                .slice(0, 4);
              console.log('🔄 ForYou: Using context products as fallback:', fallbackProducts.length);
              setRecommended(fallbackProducts);
            } else {
              setRecommended([]);
            }
          }
        } else {
          console.log('🏠 ForYou: User has no order history');
          setHasOrder(false);
          setRecommended([]);
        }
      } catch (error) {
        console.error('🏠 ForYou: Error fetching recommendations:', error);
        setRecommended([]);
        setHasOrder(false);
      }
      setLoading(false);
    };
    
    fetchRecommendation();
  }, [token, BACKEND_URL, products]);

  return (
    <div className="my-10">
      <div className="py-8 text-center text-3xl">
        <Title text1={`FOR`} text2={`YOU`} />
        <p className="m-auto w-3/4 text-xs text-gray-600 sm:text-sm md:text-base">
          {hasOrder
            ? "Rekomendasi produk spesial untuk Anda berdasarkan riwayat belanja."
            : "Checkout sekarang dan rasakan rekomendasi produk spesial untuk Anda!"}
        </p>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading recommendations...</div>
      ) : hasOrder && recommended.length > 0 ? (
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
                  <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No Image</span>
                  </div>
                  <h3 className="font-medium text-xs mb-1">{item.nama_pakaian}</h3>
                  <p className="text-xs text-gray-600">{item.categories}</p>
                </div>
              )}
              
              {/* Show similarity score */}
              {(item.match_percentage || item.similarity_score) && (
                <span className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full shadow">
                  {item.match_percentage 
                    ? `${item.match_percentage.toFixed(0)}%`
                    : `${((item.similarity_score || 0) * 100).toFixed(0)}%`
                  }
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {hasOrder
            ? "Belum ada rekomendasi produk untuk Anda."
            : token 
              ? "Sistem rekomendasi sedang dalam pengembangan. Silakan checkout untuk mendapatkan rekomendasi personal!"
              : "Login terlebih dahulu untuk mendapatkan rekomendasi personal!"
          }
        </div>
      )}
      
      <div className="flex justify-center mt-8">
        <a href="/recommendation" className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition">
          Lihat Semua Rekomendasi
        </a>
      </div>
    </div>
  );
};

export default ForYou;
