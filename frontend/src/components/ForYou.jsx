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
    <div className="my-10 px-4 sm:px-6 lg:px-8">
      <div className="py-8 text-center">
        <div className="text-3xl mb-4">
          <Title text1={`FOR`} text2={`YOU`} />
        </div>
        <p className="mx-auto max-w-4xl text-xs text-gray-600 sm:text-sm md:text-base leading-relaxed">
          {hasOrder
            ? "Rekomendasi produk spesial untuk Anda berdasarkan riwayat belanja."
            : "Checkout sekarang dan rasakan rekomendasi produk spesial untuk Anda!"}
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recommendations...</p>
          </div>
        </div>
      ) : hasOrder && recommended.length > 0 ? (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
            {recommended.map((item, index) => (
              <div key={item._id || index} className="relative">
                <ProductItem
                  id={item._id}
                  image={item.image}
                  name={item.name}
                  price={item.price}
                  sizes={item.sizes}
                />
                
                {/* Show dominance match indicator - positioned below One Size badge */}
                {item.dominance_match && (
                  <span className="absolute top-12 left-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full shadow-sm z-10">
                    Perfect Match
                  </span>
                )}
                
                {/* Show similarity score - positioned at top right */}
                {item.similarity_score && (
                  <span className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full shadow-sm z-10">
                    {((item.similarity_score || 0) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="text-gray-500">
            {hasOrder ? (
              <>
                <div className="text-6xl mb-6">🎯</div>
                <h3 className="text-lg font-semibold mb-4">Rekomendasi Sedang Diproses</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Sedang memproses rekomendasi untuk Anda. Silakan refresh halaman atau checkout produk lain untuk mendapatkan rekomendasi yang lebih baik.
                </p>
              </>
            ) : token ? (
              <>
                <div className="text-6xl mb-6">🛍️</div>
                <h3 className="text-lg font-semibold mb-4">Mulai Belanja Untuk Rekomendasi Personal</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Checkout sekarang untuk mendapatkan rekomendasi personal berdasarkan dominasi kategori dan tipe produk favorit Anda!
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6">🔐</div>
                <h3 className="text-lg font-semibold mb-4">Login Untuk Rekomendasi Personal</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Login terlebih dahulu untuk mendapatkan rekomendasi personal!
                </p>
              </>
            )}
          </div>
        </div>
      )}
      
      <div className="flex justify-center mt-8">
        <a href="/recommendation" className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
          Lihat Semua Rekomendasi
        </a>
      </div>
    </div>
  );
};

export default ForYou;
