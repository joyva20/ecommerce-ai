import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import { formatCurrency } from "../utils/formatCurrency";
import { toast } from "react-toastify";

const Product = () => {
  /*Assuming a route pattern like /posts/:postId
   is matched by /posts/123 
   then params.postId will be "123".*/
  const { productId } = useParams();
  const { products, currency, addToCart, BACKEND_URL, token } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  // Helper function to check if product is "No Size"
  const isNoSizeProduct = (product) => {
    if (!product || !product.sizes) return false;
    
    // Check for empty sizes array (common for accessories like socks)
    if (product.sizes.length === 0) return true;
    
    // Check for explicit "No Size" entry
    if (product.sizes.length === 1 && product.sizes[0] === "No Size") return true;
    
    return false;
  };

  // Helper function to handle add to cart logic
  const handleAddToCart = () => {
    // Prevent double clicks with simple timestamp check
    const now = Date.now();
    if (window.lastAddToCartTime && (now - window.lastAddToCartTime) < 1000) {
      console.log('🚫 Prevented double click - ignoring');
      return;
    }
    window.lastAddToCartTime = now;
    
    console.log('🛍️ ADD TO CART clicked');
    console.log('🛍️ Product Data:', productData);
    console.log('🔑 Token available:', !!token);
    console.log('📏 Current size state:', size);
    
    let selectedSize;
    const noSizeProduct = isNoSizeProduct(productData);
    
    console.log('🔍 Is No Size Product?', noSizeProduct);
    console.log('🔍 Product sizes:', productData?.sizes);
    
    if (noSizeProduct) {
      selectedSize = "No Size";
      console.log('🛍️ No Size product - auto using "No Size"');
    } else {
      selectedSize = size;
      console.log('🛍️ Regular product - using selected size:', selectedSize);
      
      // Validate size selection for regular products only
      if (!selectedSize || selectedSize.trim() === '') {
        console.log('🚫 Size validation failed - showing toast error');
        toast.error("Please select a size");
        return;
      }
    }
    
    console.log('🛍️ Final selected size:', selectedSize);
    console.log('🛍️ Calling addToCart with:', { productId: productData._id, size: selectedSize });
    addToCart(productData._id, selectedSize);
  };

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item);
        console.log('🛍️ Product Data:', item);
        console.log('🛍️ Product Sizes:', item.sizes);
        setImage(item.image[0]);
        
        // Auto-set size for "No Size" products or clear size for regular products
        if (isNoSizeProduct(item)) {
          // Product is No Size (empty array or explicit "No Size") - auto select it
          console.log('📏 Auto-selecting No Size for product:', item.name);
          setSize("No Size");
        } else if (item.sizes && item.sizes.length > 0) {
          // Product has regular sizes - clear selection so user must choose
          console.log('📏 Regular sizes available, clearing selection');
          setSize("");
        } else {
          // Fallback case
          console.log('📏 Fallback: No sizes defined for product');
          setSize("");
        }
        
        // Stop the Loop
        return null;
      }
    });
  };

  const fetchProductReviews = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/reviews/product/${productId}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
        setTotalReviews(data.reviews.length);
        
        // Calculate average rating
        if (data.reviews.length > 0) {
          const total = data.reviews.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(total / data.reviews.length);
        } else {
          setAverageRating(0);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <img key={`full-${i}`} src={assets.star_icon} alt="Rating Icon" className="w-3" />
      );
    }
    
    // Half star (if needed)
    if (hasHalfStar && fullStars < 5) {
      stars.push(
        <img key="half" src={assets.star_icon} alt="Rating Icon" className="w-3 opacity-50" />
      );
    }
    
    // Empty stars
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <img key={`empty-${i}`} src={assets.star_dull_icon} alt="Rating Icon" className="w-3" />
      );
    }
    
    return stars;
  };
  useEffect(() => {
    fetchProductData();
    fetchProductReviews();
  }, [productId, products]);

  return productData ? (
    <div className="bortder-t-2 pt-10 opacity-100 transition-opacity duration-500 ease-in">
      {/*----------------------- Product Data/Features -----------------------*/}
      <div className="flex flex-col gap-12 sm:flex-row sm:gap-12">
        {/*----------------------- Product Images -----------------------*/}
        <div className="flex flex-1 flex-col-reverse gap-3 sm:flex-row">
          <div className="flex w-full justify-between overflow-x-auto sm:w-[18.7%] sm:flex-col sm:justify-normal sm:overflow-y-auto">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] flex-shrink-0 cursor-pointer sm:mb-3 sm:w-full"
                alt="Product Image"
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img className="h-auto w-full" src={image} alt="Product Image" />
          </div>
        </div>
        {/* ----------------------- Product info    -----------------------*/}
        <div className="flex-1">
          <h1 className="mt-2 text-2xl font-medium">{productData.name}</h1>
          <div className="mt-2 flex items-center gap-1">
            {totalReviews > 0 ? (
              <>
                {renderStars(averageRating)}
                <p className="pl-2">({totalReviews})</p>
              </>
            ) : (
              <>
                {renderStars(0)}
                <p className="pl-2">(No reviews yet)</p>
              </>
            )}
          </div>
          <p className="mt-2 text-3xl font-medium">
            {formatCurrency(productData.price)}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>
          
          {/* Conditional Size Selection - Only show if product has regular sizes */}
          {productData.sizes && 
           productData.sizes.length > 0 &&
           !isNoSizeProduct(productData) && (
            <div className="my-8 flex flex-col gap-4">
              <p>Select Size</p>
              <div className="flex gap-2">
                {productData.sizes
                  .filter(item => item !== "No Size") // Filter out "No Size" from display
                  .map((item, index) => {
                    return (
                      <button
                        onClick={() => setSize(item)}
                        className={`border bg-gray-200 px-2 py-2 ${item === size ? `border-orange-500` : ``}`}
                        key={index}
                      >
                        {item}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
          
          {/* Show info for No Size products */}
          {isNoSizeProduct(productData) && (
            <div className="my-8">
              <p className="text-sm text-gray-600 italic">One size fits all</p>
            </div>
          )}
          
          {/* We Need to Add this to Global context - using global addToCart Function */}
          <button
            onClick={handleAddToCart}
            className="bg-black px-8 py-3 text-sm text-white hover:bg-gray-900 active:bg-gray-700"
          >
            ADD TO CART
          </button>
          <hr className="mt-8 sm:w-4/5" />
          <div className="mt-5 flex flex-col gap-1 text-sm text-gray-500">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>
      {/* ------------ Description & Review Section ------------*/}
      <div className="mt-20">
        <div className="flex">
          <b 
            className={`border px-5 py-3 text-sm cursor-pointer ${
              activeTab === 'description' ? 'bg-gray-100' : ''
            }`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </b>
          <p 
            className={`border px-5 py-3 text-sm cursor-pointer ${
              activeTab === 'reviews' ? 'bg-gray-100' : ''
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({totalReviews})
          </p>
        </div>
        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
          {activeTab === 'description' ? (
            <>
              <p>
                An E-commerce website is an online platform that facilitates the
                buying and selling of products or services over the internet. It
                serves as virtual marketplace where businesses and individuals can
                showcase their products, interact with customers, and conduct
                transactions without the need for a physical presence. E-commerce
                websites have gained immense popularity due to their convenience,
                accessibility, and the global reach they offer.
              </p>
              <p>
                E-commerce websites typically display products or services along
                with detailed descriptions, images, prices, and any available
                variations (e.g., sizes, colors). Each product usually has its own
                dedicated page with relevant information.
              </p>
            </>
          ) : (
            <div className="reviews-section">
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">
                            {review.user?.name || 'Anonymous User'}
                          </span>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Be the first to review this product!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* ------------ Display related products ------------*/}
      <RelatedProducts
        id={productData._id}
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
