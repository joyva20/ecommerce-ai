import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import axios from "axios";

const RecommendationPage = () => {
  const { token, BACKEND_URL } = useContext(ShopContext);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasOrderHistory, setHasOrderHistory] = useState(false);
  const [dominanceInfo, setDominanceInfo] = useState(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  useEffect(() => {
    const fetchRecommendation = async () => {
      console.log('🔄 Starting dominance-based recommendation fetch...');
      setLoading(true);
      try {
        if (!token) {
          console.log('👤 No token - no recommendations');
          setRecommended([]);
          setHasOrderHistory(false);
          setLoading(false);
          return;
        }

        console.log('🔑 Token found - fetching personalized recommendations with dominance logic');
        
        // Get personalized recommendations with dominance logic
        const recRes = await axios.get(
          BACKEND_URL + "/api/recommendations/personalized?limit=10",
          { headers: { token } }
        );
        
        console.log('🤖 Dominance recommendation response:', recRes.data.success, recRes.data.recommendations?.length);
        console.log('📊 Dominance info:', recRes.data.dominance);
        
        if (recRes.data.success) {
          if (recRes.data.recommendations.length > 0) {
            setHasOrderHistory(true);
            setDominanceInfo(recRes.data.dominance);
            setFallbackUsed(recRes.data.fallback_used || false);
            
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
                  console.log('✅ RecommendationPage matched:', rec.nama_pakaian, '→', matchingProduct.name);
                  mappedRecommendations.push({
                    ...matchingProduct,
                    similarity_score: rec.similarity_score,
                    based_on: rec.based_on,
                    dominance_match: rec.matches_dominance,
                    fallback_mode: rec.fallback_mode,
                    database_fallback: rec.database_fallback,
                    product_category: rec.product_category,
                    product_type: rec.product_type
                  });
                } else {
                  console.log('❌ RecommendationPage no match for:', rec.nama_pakaian);
                }
              }
              
              console.log('🎯 Final mapped recommendations:', mappedRecommendations.length);
              setRecommended(mappedRecommendations);
            } else {
              console.log('⚠️ Failed to get products list');
              setRecommended([]);
            }
          } else {
            // User has order history but no matching dominant recommendations
            console.log('📭 User has order history but no matching dominant recommendations');
            setHasOrderHistory(true);
            setDominanceInfo(recRes.data.dominance);
            setRecommended([]);
          }
        } else {
          // User has no order history
          console.log('📭 User has no order history');
          setHasOrderHistory(false);
          setRecommended([]);
        }
      } catch (error) {
        console.error('💥 Error fetching recommendations:', error);
        setRecommended([]);
        setHasOrderHistory(false);
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
            ? hasOrderHistory 
              ? dominanceInfo 
                ? fallbackUsed
                  ? `Menampilkan rekomendasi berdasarkan riwayat belanja Anda`
                  : dominanceInfo.is_type_tie
                    ? `Rekomendasi berdasarkan distribusi seimbang tipe produk`
                    : dominanceInfo.primary_type
                      ? `Rekomendasi berdasarkan tipe dominan: ${dominanceInfo.primary_type.toUpperCase()}`
                      : `Rekomendasi berdasarkan riwayat belanja Anda`
                : "Rekomendasi produk berdasarkan riwayat belanja dan preferensi Anda."
              : "Lakukan checkout untuk mendapatkan rekomendasi produk yang dipersonalisasi."
            : "Login dan lakukan checkout untuk mendapatkan rekomendasi produk personal."
          }
        </p>
        {dominanceInfo && (
          <div className="mt-4 text-center">
            <span className={`inline-block px-4 py-2 rounded-full text-sm ${fallbackUsed ? 'bg-orange-100 text-orange-700' : dominanceInfo.is_type_tie ? 'bg-blue-100 text-blue-700' : 'bg-black text-white'}`}>
              {fallbackUsed 
                ? 'Mode Fallback' 
                : dominanceInfo.is_type_tie 
                  ? `Distribusi Seimbang Tipe`
                  : dominanceInfo.primary_type
                    ? `Tipe Dominan: ${dominanceInfo.primary_type.charAt(0).toUpperCase() + dominanceInfo.primary_type.slice(1)} (${dominanceInfo.primary_type_count || 0} item)`
                    : 'Rekomendasi Personal'
              }
            </span>
            {dominanceInfo.primary_category && !fallbackUsed && (
              <span className="inline-block ml-2 px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                Kategori: {dominanceInfo.primary_category.charAt(0).toUpperCase() + dominanceInfo.primary_category.slice(1)} ({dominanceInfo.primary_category_count || 0})
              </span>
            )}
          </div>
        )}
      </div>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : recommended.length > 0 ? (
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
              {item.dominance_match && !item.fallback_mode && (
                <span className="absolute top-2 left-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full shadow">
                  Perfect Match
                </span>
              )}
              
              {/* Show fallback indicator */}
              {item.fallback_mode && !item.database_fallback && (
                <span className="absolute top-2 left-2 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full shadow">
                  Based on History
                </span>
              )}
              
              {/* Show database fallback indicator */}
              {item.database_fallback && (
                <span className="absolute top-2 left-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full shadow">
                  Recommended
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
        <div className="text-center py-8">
          {token ? (
            hasOrderHistory ? (
              dominanceInfo ? (
                /* User has order history but no matching recommendations */
                <div className="text-gray-500">
                  <h3 className="text-lg font-medium mb-2">Rekomendasi Sedang Diproses</h3>
                  <p className="mb-2">
                    {dominanceInfo.is_type_tie 
                      ? `Tipe Seimbang`
                      : dominanceInfo.primary_type
                        ? `Tipe Dominan: ${dominanceInfo.primary_type.charAt(0).toUpperCase() + dominanceInfo.primary_type.slice(1)} (${dominanceInfo.primary_type_count || 0} item)`
                        : 'Menganalisis pola belanja Anda'
                    }
                  </p>
                  <p className="mb-4">Sistem sedang mencari produk yang sesuai dengan preferensi tipe produk Anda. Silakan refresh halaman atau checkout produk lain untuk mendapatkan rekomendasi.</p>
                  <a href="/collection" className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition">
                    Lanjut Belanja
                  </a>
                </div>
              ) : (
                /* User has order history but no dominance info */
                <div className="text-gray-500">
                  <h3 className="text-lg font-medium mb-2">Analisis Pola Belanja</h3>
                  <p className="mb-4">Sistem sedang menganalisis pola belanja Anda. Lakukan lebih banyak pembelian untuk mendapatkan rekomendasi yang lebih personal.</p>
                  <a href="/collection" className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition">
                    Lanjut Belanja
                  </a>
                </div>
              )
            ) : (
              /* User is logged in but no order history */
              <div className="text-gray-500">
                <h3 className="text-lg font-medium mb-2">Belum Ada Rekomendasi</h3>
                <p className="mb-4">Untuk mendapatkan rekomendasi produk personal berdasarkan dominasi kategori dan tipe, silakan lakukan checkout terlebih dahulu.</p>
                <a href="/collection" className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition">
                  Mulai Belanja
                </a>
              </div>
            )
          ) : (
            /* User not logged in */
            <div className="text-gray-500">
              <h3 className="text-lg font-medium mb-2">Login Required</h3>
              <p className="mb-4">Silakan login untuk mendapatkan rekomendasi produk personal berdasarkan dominasi kategori dan tipe favorit Anda.</p>
              <a href="/login" className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition">
                Login
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecommendationPage;
