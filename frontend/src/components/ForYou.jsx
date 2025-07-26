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
      console.log('🏠 ForYou: Starting dominance-based recommendation fetch...');
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
        
        console.log('🏠 ForYou: Getting personalized recommendations with dominance logic...');
        const recRes = await axios.get(
          BACKEND_URL + "/api/recommendations/personalized?limit=5",
          { headers: { token } }
        );
        
        console.log('🏠 ForYou: Dominance response:', recRes.data.success, recRes.data.recommendations?.length);
        console.log('🏠 ForYou: Dominance info:', recRes.data.dominance);
        
        if (recRes.data.success) {
          if (recRes.data.recommendations.length > 0) {
            setHasOrder(true);
            
            // Map ML recommendations to actual products from database
            const mappedRecommendations = [];
            
            // Get available products
            const availableProducts = await axios.get(BACKEND_URL + "/api/product/list");
            
            if (availableProducts.data.success) {
              console.log('📦 Available products for mapping:', availableProducts.data.products.length);
              
              for (const rec of recRes.data.recommendations) {
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
                    based_on: rec.based_on,
                    dominance_match: rec.matches_dominance
                  });
                } else {
                  console.log('❌ ForYou no match for:', rec.nama_pakaian);
                }
              }
              
              console.log('🏠 ForYou: Final mapped recommendations:', mappedRecommendations.length);
              setRecommended(mappedRecommendations);
            } else {
              console.log('⚠️ ForYou: Failed to get products list');
              setRecommended([]);
            }
          } else {
            // User has order history but no matching dominant recommendations
            console.log('🏠 ForYou: No recommendations match user dominance');
            setHasOrder(true);
            setRecommended([]);
          }
        } else {
          // No purchase history or authentication failed
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
              <ProductItem
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
              />
              
              {/* Show dominance match indicator */}
              {item.dominance_match && (
                <span className="absolute top-2 left-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full shadow">
                  Perfect Match
                </span>
              )}
              
              {/* Show similarity score */}
              {item.similarity_score && (
                <span className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full shadow">
                  {((item.similarity_score || 0) * 100).toFixed(0)}%
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {hasOrder
            ? "Sedang memproses rekomendasi untuk Anda. Silakan refresh halaman atau checkout produk lain untuk mendapatkan rekomendasi yang lebih baik."
            : token 
              ? "Checkout sekarang untuk mendapatkan rekomendasi personal berdasarkan dominasi kategori dan tipe produk favorit Anda!"
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
