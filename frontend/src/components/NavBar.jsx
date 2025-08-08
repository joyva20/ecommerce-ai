import { assets } from "../assets/assets";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { clearRandomOrder } from "../utils/randomOrder";

const NavBar = () => {
  const [isVisible, setisVisible] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
    BACKEND_URL,
    profilePhoto,
    refreshProfilePhoto,
  } = useContext(ShopContext);
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const logout = () => {
    // Clear random order before logout
    clearRandomOrder(token);
    
    navigate("/");  // Redirect ke homepage, bukan login page
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
    setShowDropdown(false);
    
    console.log('🎲 User logged out, random order cleared');
  };

  const toggleDropdown = () => {
    if (token) {
      setShowDropdown(!showDropdown);
    } else {
      toast.info("Please login to access your profile");
      navigate("/login");
    }
  };
  return (
    <div className="flex items-center justify-between py-2 font-medium">
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="w-24"></img>
      </Link>
      <ul className="hidden gap-5 text-sm text-gray-700 sm:flex">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>HOME</p>
          <hr className="hidden h-[1.5px] w-2/4 border-none bg-gray-700" />
        </NavLink>
        <NavLink to="/bestsellers" className="flex flex-col items-center gap-1">
          <p>BEST SELLERS</p>
          <hr className="hidden h-[1.5px] w-2/4 border-none bg-gray-700" />
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>COLLECTION</p>
          <hr className="hidden h-[1.5px] w-2/4 border-none bg-gray-700" />
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>ABOUT</p>
          <hr className="hidden h-[1.5px] w-2/4 border-none bg-gray-700" />
        </NavLink>
        <NavLink to="/contact" className="flex flex-col items-center gap-1">
          <p>CONTACT</p>
          <hr className="hidden h-[1.5px] w-2/4 border-none bg-gray-700" />
        </NavLink>
      </ul>
      <div className="flex items-center gap-6">
        <img
          onClick={() => {
            setShowSearch(true);
            if (!location.pathname.includes("collection"))
              navigate("/collection");
          }}
          src={assets.search_icon}
          alt="Search"
          className="w-5 cursor-pointer"
        />
        <div className="profile-dropdown relative">
          <img
            src={profilePhoto || assets.profile_icon}
            alt={token ? "Profile" : "Click to Login"}
            className={`w-7 h-7 rounded-full object-cover cursor-pointer transition-all ${
              token 
                ? "border border-gray-300 hover:border-gray-500" 
                : "border-2 border-gray-400 hover:border-blue-500 opacity-70 hover:opacity-100"
            }`}
            onClick={toggleDropdown}
            title={token ? "Profile Menu" : "Click to Login"}
          />
          
          {/* Dropdown Menu */}
          {showDropdown && token && (
            <div className="dropdown-menu absolute right-0 z-50 mt-2 w-40 rounded-lg bg-white shadow-lg border border-gray-200">
              <div className="flex flex-col py-2">
                <div className="flex items-center px-4 py-2 border-b border-gray-100">
                  <img
                    src={profilePhoto || assets.profile_icon}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border border-gray-300 mr-2"
                  />
                  <span className="text-sm text-gray-700 font-medium">Profile</span>
                </div>
                <button
                  className="text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    navigate("/my-profile");
                    setShowDropdown(false);
                  }}
                >
                  My Profile
                </button>
                <button
                  className="text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    navigate("/orders");
                    setShowDropdown(false);
                  }}
                >
                  Orders
                </button>
                <button
                  className="text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} alt="Orders" className="w-5 min-w-5" />
          <p className="absolute bottom-[-5px] right-[-5px] aspect-square w-4 rounded-full bg-black text-center text-[8px] leading-4 text-white">
            {getCartCount()}
          </p>
        </Link>
        {/* Visibility will be set to true when clicked (on Small Screen Sizes) */}
        <img
          onClick={() => setisVisible(true)}
          src={assets.menu_icon}
          alt="Menu"
          className="w-5 cursor-pointer sm:hidden"
        />
      </div>
      {/* Sidebar Menu for small Screens */}
      <div
        className={`absolute bottom-0 right-0 top-0 z-10 overflow-hidden bg-white transition-all ${
          isVisible ? `w-full` : `w-0`
        }`}
      >
        <div className="flex flex-col text-gray-600">
          <div
            onClick={() => setisVisible(false)}
            className="flex items-center gap-4 p-3"
          >
            <img
              src={assets.dropdown_icon}
              alt="Close Sidebar"
              className="h-4 rotate-180"
            />
            <p>Back</p>
          </div>
          <NavLink
            onClick={() => setisVisible(false)}
            className="border py-2 pl-6"
            to="/"
          >
            Home
          </NavLink>
          <NavLink
            onClick={() => setisVisible(false)}
            className="border py-2 pl-6"
            to="/collection"
          >
            COLLECTION
          </NavLink>
          <NavLink
            onClick={() => setisVisible(false)}
            className="border py-2 pl-6"
            to="/about"
          >
            ABOUT
          </NavLink>
          <NavLink
            onClick={() => setisVisible(false)}
            className="border py-2 pl-6"
            to="/contact"
          >
            CONTACT
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
