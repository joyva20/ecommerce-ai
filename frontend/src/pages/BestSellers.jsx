import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import style from "./Collection.module.css";

const BestSellers = () => {
  const { products, search, showSearch, BACKEND_URL } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("rating-high");
  const [productRatings, setProductRatings] = useState({});

  const toggleCategory = (e) => {
    if (category.includes(e.target.value))
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value))
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  // Fetch product ratings
  const fetchProductRatings = async () => {
    try {
      const ratings = {};
      console.log('🌟 Fetching ratings for best sellers...');
      
      for (const product of products) {
        try {
          const response = await fetch(`${BACKEND_URL}/api/reviews/product/${product._id}`);
          const data = await response.json();
          
          if (data.success && data.averageRating) {
            ratings[product._id] = {
              rating: data.averageRating,
              totalReviews: data.totalReviews
            };
          }
        } catch (error) {
          console.log(`No reviews for product ${product._id}`);
        }
      }
      
      console.log('🌟 Product ratings fetched:', ratings);
      setProductRatings(ratings);
    } catch (error) {
      console.error('Error fetching product ratings:', error);
    }
  };

  const applyfilter = () => {
    console.log('🔍 Applying best sellers filter...');
    
    // Start with all products
    let productsCopy = structuredClone(products);
    
    // Filter products with rating 3+ only
    productsCopy = productsCopy.filter(product => {
      const rating = productRatings[product._id]?.rating || 0;
      const hasGoodRating = rating >= 3;
      
      if (hasGoodRating) {
        console.log(`⭐ Best Seller: ${product.name} - Rating: ${rating}`);
      }
      
      return hasGoodRating;
    });
    
    console.log(`🌟 Found ${productsCopy.length} best sellers (rating 3+)`);

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      console.log('🔍 After search filter:', productsCopy.length);
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category),
      );
      console.log('🔍 After category filter:', productsCopy.length);
    }

    if (subCategory.length > 0) {
      // Create mapping for subCategory filter values
      const subCategoryMapping = {
        "Top Wear": ["Top Wear", "Topwear"],
        "Bottom Wear": ["Bottom Wear", "Bottomwear"],
        "Top & Bottom Wear": ["Top & Bottom Wear", "Winterwear"]
      };

      productsCopy = productsCopy.filter((item) => {
        return subCategory.some(selectedSub => {
          const mappedValues = subCategoryMapping[selectedSub] || [selectedSub];
          return mappedValues.includes(item.subCategory);
        });
      });
      console.log('🔍 After subcategory filter:', productsCopy.length);
    }
    
    console.log('🎯 Final best sellers:', productsCopy.length);
    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let filterproductsCopy = structuredClone(filterProducts);
    
    switch (sortType) {
      case "rating-high":
        filterproductsCopy.sort((a, b) => {
          const ratingA = productRatings[a._id]?.rating || 0;
          const ratingB = productRatings[b._id]?.rating || 0;
          return ratingB - ratingA;
        });
        break;
        
      case "rating-low":
        filterproductsCopy.sort((a, b) => {
          const ratingA = productRatings[a._id]?.rating || 0;
          const ratingB = productRatings[b._id]?.rating || 0;
          return ratingA - ratingB;
        });
        break;
        
      case "Low-High":
        filterproductsCopy.sort((a, b) => a.price - b.price);
        break;
        
      case "High-Low":
        filterproductsCopy.sort((a, b) => b.price - a.price);
        break;
        
      default:
        // Keep rating-high as default
        filterproductsCopy.sort((a, b) => {
          const ratingA = productRatings[a._id]?.rating || 0;
          const ratingB = productRatings[b._id]?.rating || 0;
          return ratingB - ratingA;
        });
        break;
    }
    
    setFilterProducts(filterproductsCopy);
  };

  // Fetch ratings when products change
  useEffect(() => {
    if (products.length > 0) {
      fetchProductRatings();
    }
  }, [products, BACKEND_URL]);

  // Apply filter when ratings are loaded or filters change
  useEffect(() => {
    if (Object.keys(productRatings).length > 0) {
      applyfilter();
    }
  }, [category, subCategory, products, showSearch, search, productRatings]);
  
  useEffect(sortProduct, [sortType, filterProducts.length]);

  return (
    <div className="flex flex-col gap-1 border-t pt-10 sm:flex-row sm:gap-10">
      {/* Left Side - Filters */}
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 flex cursor-pointer items-center gap-2 text-xl"
        >
          FILTERS
          <img
            className={`h-3 sm:hidden ${showFilter ? `rotate-90` : ``}`}
            src={assets.dropdown_icon}
            alt="dropdown"
          />
        </p>
        {/* Category Filter */}
        <div
          className={`mt-6 border border-gray-300 py-3 pl-5 ${showFilter ? `` : `hidden`} sm:block`}
        >
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex items-center gap-2">
              <label className={`${style.checkbox} ${style.bounce}`}>
                <input
                  className={`w-3 ${style.checkbox}`}
                  type="checkbox"
                  value={"Men"}
                  onChange={toggleCategory}
                />{" "}
                <svg viewBox="0 0 21 21">
                  <polyline points="5 10.75 8.5 14.25 16 6"></polyline>
                </svg>
              </label>
              Men
            </p>
            <p className="flex items-center gap-2">
              <label className={`${style.checkbox} ${style.bounce}`}>
                <input
                  className={`w-3 ${style.checkbox}`}
                  type="checkbox"
                  value={"Women"}
                  onChange={toggleCategory}
                />{" "}
                <svg viewBox="0 0 21 21">
                  <polyline points="5 10.75 8.5 14.25 16 6"></polyline>
                </svg>
              </label>
              Women
            </p>
            <p className="flex items-center gap-2">
              <label className={`${style.checkbox} ${style.bounce}`}>
                <input
                  className={`w-3 ${style.checkbox}`}
                  type="checkbox"
                  value={"Kids"}
                  onChange={toggleCategory}
                />{" "}
                <svg viewBox="0 0 21 21">
                  <polyline points="5 10.75 8.5 14.25 16 6"></polyline>
                </svg>
              </label>
              Kids
            </p>
          </div>
        </div>
        {/* SubCategory Filter */}
        <div
          className={`my-5 border border-gray-300 py-3 pl-5 ${showFilter ? `` : `hidden`} sm:block`}
        >
          <p className="mb-3 text-sm font-medium">TYPE</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex items-center gap-2">
              <label className={`${style.checkbox} ${style.bounce}`}>
                <input
                  className={`w-3 ${style.checkbox}`}
                  type="checkbox"
                  value={"Top Wear"}
                  onChange={toggleSubCategory}
                />{" "}
                <svg viewBox="0 0 21 21">
                  <polyline points="5 10.75 8.5 14.25 16 6"></polyline>
                </svg>
              </label>
              Top Wear
            </p>
            <p className="flex items-center gap-2">
              <label className={`${style.checkbox} ${style.bounce}`}>
                <input
                  className={`w-3 ${style.checkbox}`}
                  type="checkbox"
                  value={"Bottom Wear"}
                  onChange={toggleSubCategory}
                />{" "}
                <svg viewBox="0 0 21 21">
                  <polyline points="5 10.75 8.5 14.25 16 6"></polyline>
                </svg>
              </label>
              Bottom Wear
            </p>
            <p className="flex items-center gap-2">
              <label className={`${style.checkbox} ${style.bounce}`}>
                <input
                  className={`w-3 ${style.checkbox}`}
                  type="checkbox"
                  value={"Top & Bottom Wear"}
                  onChange={toggleSubCategory}
                />{" "}
                <svg viewBox="0 0 21 21">
                  <polyline points="5 10.75 8.5 14.25 16 6"></polyline>
                </svg>
              </label>
              Top & Bottom Wear
            </p>
          </div>
        </div>
      </div>
      {/* Right Side */}
      <div className="flex-1">
        <div className="mb-4 flex justify-between text-base sm:text-2xl">
          <Title text1={`BEST`} text2={`SELLERS`} />
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="border-2 border-gray-300 px-2 text-sm"
          >
            <option value="rating-high">Sort by: Highest Rating</option>
            <option value="rating-low">Sort by: Lowest Rating</option>
            <option value="Low-High">Sort by: Low to High Price</option>
            <option value="High-Low">Sort by: High to Low Price</option>
          </select>
        </div>
        
        {/* Best Sellers Info */}
        <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⭐</span>
            <h3 className="text-lg font-semibold text-yellow-800">Best Sellers Collection</h3>
          </div>
          <p className="text-sm text-yellow-700">
            Featuring our top-rated products with 3+ star ratings from satisfied customers. 
            These items have proven quality and customer satisfaction!
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            {filterProducts.length} best sellers found
          </p>
        </div>
        
        {/* Show All Products - Map Products */}
        <div className="md:gird-cols-3 grid grid-cols-2 gap-4 gap-y-6 lg:grid-cols-4">
          {filterProducts.length > 0 ? (
            filterProducts.map((item) => {
              const rating = productRatings[item._id];
              return (
                <div key={item._id} className="relative">
                  <ProductItem
                    id={item._id}
                    image={item.image}
                    name={item.name}
                    price={item.price}
                    sizes={item.sizes}
                  />
                  {/* Rating Badge */}
                  {rating && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold">
                      ⭐ {rating.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Best Sellers Yet</h3>
              <p className="text-gray-500">
                Products need at least 3+ star ratings to appear here. 
                Check back soon as more customers leave reviews!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BestSellers;
