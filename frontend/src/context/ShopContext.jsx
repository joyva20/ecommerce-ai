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
  
  const [search, setSearch] = useState(``);
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [selectedCartItems, setSelectedCartItems] = useState({}); // Track selected items for checkout
  const [productsDB, setProductsDB] = useState([]);
  const [token, setToken] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false); // Add loading state
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
    console.log('🔍 AddToCart params:', { itemid, size });
    
    // Find product info for better debugging
    const productInfo = productsDB.find(product => product._id === itemid);
    if (productInfo) {
      console.log('📦 Product info:', {
        name: productInfo.name,
        sizes: productInfo.sizes,
        isEmpty: productInfo.sizes?.length === 0
      });
    }
    
    // Special handling: Don't validate size for "No Size" products
    // Only validate size for products that actually require size selection
    if (size !== "No Size" && (!size || size.trim() === '')) {
      console.log('🚫 Size validation failed for regular product:', { size });
      toast.error("Please select a size");
      return;
    }
    
    // Additional check: Make sure "No Size" is passed correctly
    if (size === "No Size") {
      console.log('👕 No Size product detected - proceeding without size validation');
    }
    
    console.log('✅ Size validation passed:', { size });
    console.log('🛍️ AddToCart proceeding with:', { itemid, size });
    
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
        
        // Update local cart state - only once, after API success
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

  // Toggle selected state for cart item
  const toggleSelectCartItem = (itemid, size) => {
    let selectedData = structuredClone(selectedCartItems);
    if (selectedData[itemid]) {
      if (selectedData[itemid][size]) {
        delete selectedData[itemid][size];
        // Remove itemid object if no sizes selected
        if (Object.keys(selectedData[itemid]).length === 0) {
          delete selectedData[itemid];
        }
      } else {
        selectedData[itemid][size] = true;
      }
    } else {
      selectedData[itemid] = {};
      selectedData[itemid][size] = true;
    }
    setSelectedCartItems(selectedData);
  };

  // Select all cart items
  const selectAllCartItems = () => {
    let selectedData = {};
    for (const itemid in cartItems) {
      selectedData[itemid] = {};
      for (const size in cartItems[itemid]) {
        if (cartItems[itemid][size] > 0) {
          selectedData[itemid][size] = true;
        }
      }
    }
    setSelectedCartItems(selectedData);
  };

  // Unselect all cart items
  const unselectAllCartItems = () => {
    setSelectedCartItems({});
  };

  // Check if item is selected
  const isItemSelected = (itemid, size) => {
    return selectedCartItems[itemid] && selectedCartItems[itemid][size];
  };

  // Get selected cart amount
  const getSelectedCartAmount = () => {
    let totalAmount = 0;
    for (const itemid in selectedCartItems) {
      let itemInfo = productsDB.find((product) => product._id === itemid);
      if (itemInfo) {
        for (const size in selectedCartItems[itemid]) {
          try {
            if (selectedCartItems[itemid][size] && cartItems[itemid] && cartItems[itemid][size] > 0) {
              totalAmount += itemInfo.price * cartItems[itemid][size];
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    }
    return totalAmount;
  };

  // Get selected cart count
  const getSelectedCartCount = () => {
    let totalCount = 0;
    for (const itemid in selectedCartItems) {
      for (const size in selectedCartItems[itemid]) {
        try {
          if (selectedCartItems[itemid][size] && cartItems[itemid] && cartItems[itemid][size] > 0) {
            totalCount += cartItems[itemid][size];
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
    return totalCount;
  };

  // Clear selected items from cart after successful checkout
  const clearSelectedFromCart = async () => {
    try {
      // Clear from backend
      for (const itemid in selectedCartItems) {
        for (const size in selectedCartItems[itemid]) {
          if (selectedCartItems[itemid][size]) {
            await axios.post(
              BACKEND_URL + "/api/cart/update",
              { itemid, size, quantity: 0 },
              { headers: { token } }
            );
          }
        }
      }
      
      // Clear from local state
      let newCartItems = structuredClone(cartItems);
      for (const itemid in selectedCartItems) {
        for (const size in selectedCartItems[itemid]) {
          if (selectedCartItems[itemid][size] && newCartItems[itemid]) {
            delete newCartItems[itemid][size];
            // Remove itemid object if no sizes left
            if (Object.keys(newCartItems[itemid]).length === 0) {
              delete newCartItems[itemid];
            }
          }
        }
      }
      setCartItems(newCartItems);
      setSelectedCartItems({});
    } catch (error) {
      console.error('Error clearing selected items:', error);
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

  // Refresh products data - can be called manually
  const refreshProductsData = async () => {
    await getProductsData();
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
          // Add cache busting to force refresh
          const photoWithCacheBust = `${response.data.photo}?t=${Date.now()}`;
          setProfilePhoto(photoWithCacheBust);
        } else {
          setProfilePhoto(null);
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
    selectedCartItems,
    addToCart,
    getCartCount,
    UpdateQuantity,
    getCartAmount,
    // Selective cart functions
    toggleSelectCartItem,
    selectAllCartItems,
    unselectAllCartItems,
    isItemSelected,
    getSelectedCartAmount,
    getSelectedCartCount,
    clearSelectedFromCart,
    // Product management
    refreshProductsData,
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
