/* eslint-disable react/prop-types */
import { createContext, useEffect, useState } from "react";
// import { products } from "../assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "Rp ";
  const delivery_fee = 10;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  
  // Debug log untuk memastikan BACKEND_URL terbaca
  console.log('🔧 ShopContext BACKEND_URL:', BACKEND_URL);
  
  const [search, setSearch] = useState(``);
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [productsDB, setProductsDB] = useState([]);
  const [token, setToken] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  //Programmatic Redirection: Navigate to different routes based on application state or conditions.
  const navigate = useNavigate();

  const addToCart = async (itemid, size) => {
    console.log('🛍️ ShopContext addToCart called with:', { itemid, size });
    console.log('🔑 Current token:', token);
    console.log('🔑 Token from localStorage:', localStorage.getItem('token'));
    
    // Use current token or get from localStorage
    let currentToken = token || localStorage.getItem('token');
    
    if (!currentToken) {
      console.log('� No token found anywhere');
      toast.error("You should login/create account first");
      return;
    }
    
    // If we got token from localStorage but not in state, update state
    if (!token && currentToken) {
      console.log('🔑 Setting token from localStorage to state');
      setToken(currentToken);
    }
    
    console.log('✅ Using token:', currentToken ? 'yes' : 'no');
    
    // Special handling: Don't validate size for "No Size" products
    // Only validate size for products that actually require size selection
    if (size !== "No Size" && (!size || size.trim() === '')) {
      console.log('🚫 Size validation failed for regular product:', { size });
      toast.error("Select Product Size");
      return;
    }
    
    console.log('✅ Size validation passed:', { size });
    console.log('🛍️ AddToCart proceeding with:', { itemid, size });
    
    let cartData = structuredClone(cartItems);
    if (cartData[itemid]) {
      if (cartData[itemid][size]) {
        cartData[itemid][size] += 1;
      } else {
        cartData[itemid][size] = 1;
      }
    } else {
      cartData[itemid] = {};
      cartData[itemid][size] = 1;
    }
    setCartItems(cartData);
    try {
      console.log('📡 Making API call to add to cart...');
      console.log('📡 Request details:', {
        url: BACKEND_URL + "/api/cart/add",
        data: { itemid, size },
        token: currentToken
      });
      
      const response = await axios.post(
        BACKEND_URL + "/api/cart/add",
        { itemid, size },
        {
          headers: { token: currentToken },
        },
      );
      
      console.log('📡 API Response:', response.data);
      
      if (response.data.success) {
        console.log('✅ Successfully added to cart');
        toast.success(response.data.message);
        
        // Update local cart state if API was successful
        if (cartData[itemid]) {
          if (cartData[itemid][size]) {
            cartData[itemid][size] += 1;
          } else {
            cartData[itemid][size] = 1;
          }
        } else {
          cartData[itemid] = {};
          cartData[itemid][size] = 1;
        }
        setCartItems(cartData);
        
      } else {
        console.log('🚫 Failed to add to cart:', response.data.message);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('💥 Cart API Error:', error);
      console.error('💥 Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      toast.error(error.response?.data?.message || error.message);
    }
  };
  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const size in cartItems[items]) {
        try {
          if (cartItems[items][size] > 0) {
            totalCount += cartItems[items][size];
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
    return totalCount;
  };
  const UpdateQuantity = async (itemid, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemid][size] = quantity;
    setCartItems(cartData);
    if (token) {
      try {
        const response = await axios.post(
          BACKEND_URL + "/api/cart/update",
          { itemid, size, quantity },
          {
            headers: { token },
          },
        );
        if (response.data.success) toast.success(response.data.message);
        else toast.error(response.data.message);
      } catch (error) {
        console.error(error);
        toast.error(error.message);
      }
    }
  };
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = productsDB.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
    return totalAmount;
  };

  const sortSizes = (sizes) => {
    let newSizes = [];
    const sortOrder = ["S", "M", "L", "XL", "XXL"];
    for (let order in sortOrder) {
      sizes.includes(sortOrder[order])
        ? newSizes.push(sortOrder[order])
        : newSizes;
    }
    return newSizes;
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(BACKEND_URL + "/api/product/list");
      if (response.data.success) {
        const DBProducts = response.data.products;
        DBProducts.forEach((item) => {
          item.sizes = sortSizes(item.sizes);
        });
        setProductsDB(DBProducts);
      } else toast.error(response.data.message);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };
  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        BACKEND_URL + "/api/cart/get",
        {},
        { headers: { token } },
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      } else toast.error(response.data.message);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };
  useEffect(() => {
    getProductsData();
  }, []);
  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      setToken(localStorage.getItem("token"));
      getUserCart(localStorage.getItem("token"));
    }
  }, []);

  // Refresh profile photo function
  const refreshProfilePhoto = async () => {
    if (token) {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/user-profile/profile`, {
          headers: { token }
        });
        if (response.data && response.data.photo) {
          setProfilePhoto(response.data.photo);
        }
      } catch (error) {
        console.error("Error refreshing profile photo:", error);
      }
    }
  };

  // Load profile photo when token changes
  useEffect(() => {
    if (token) {
      refreshProfilePhoto();
    } else {
      setProfilePhoto(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = {
    products: productsDB,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    UpdateQuantity,
    getCartAmount,
    navigate,
    BACKEND_URL,
    token,
    setToken,
    profilePhoto,
    refreshProfilePhoto,
  };
  return (
    //Wrapping: {props.children}
    // includes any components or elements that are nested inside ShopContextProvider.
    // These nested components will have access to the context values.
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
