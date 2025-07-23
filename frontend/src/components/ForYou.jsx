import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import axios from "axios";

const ForYou = () => {
  const { token, BACKEND_URL } = useContext(ShopContext);
  const [recommended, setRecommended] = useState([]);
  const [hasOrder, setHasOrder] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendation = async () => {
      setLoading(true);
      try {
        if (!token) {
          setRecommended([]);
          setHasOrder(false);
          setLoading(false);
          return;
        }
        // Cek apakah user sudah pernah checkout
        const orderRes = await axios.post(
          BACKEND_URL + "/api/order/userorders",
          {},
          { headers: { token } }
        );
        if (orderRes.data.success && orderRes.data.orders.length > 0) {
          setHasOrder(true);
          // Ambil rekomendasi dari backend
          const recRes = await axios.post(
            BACKEND_URL + "/api/product/recommend-on-checkout",
            { userId: orderRes.data.orders[0].userID },
            { headers: { token } }
          );
          if (recRes.data.success) {
            setRecommended(recRes.data.recommended);
          } else {
            setRecommended([]);
          }
        } else {
          setHasOrder(false);
          setRecommended([]);
        }
      } catch (err) {
        setHasOrder(false);
        setRecommended([]);
      }
      setLoading(false);
    };
    fetchRecommendation();
  }, [token, BACKEND_URL]);

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
        <div className="text-center py-8">Loading...</div>
      ) : hasOrder && recommended.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {recommended.map((item) => (
            <div key={item._id} className="relative">
              <ProductItem
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
              />
              <span className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full shadow">
                Score: {((item.similarityScore ?? 0) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {hasOrder
            ? "Belum ada rekomendasi produk untuk Anda."
            : "Checkout produk favorit Anda untuk mendapatkan rekomendasi!"}
        </div>
      )}
      <div className="flex justify-center mt-8">
        <a href="/recommendation" className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition">Lihat Semua Rekomendasi</a>
      </div>
    </div>
  );
};

export default ForYou;
