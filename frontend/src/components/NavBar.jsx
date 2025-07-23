import { assets } from "../assets/assets";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
const NavBar = () => {
  const [isVisible, setisVisible] = useState(false);
  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
  } = useContext(ShopContext);
  const location = useLocation();
  const [profilePhoto, setProfilePhoto] = useState(null);
  useEffect(() => {
    // Ambil foto profil user jika sudah login
    if (token) {
      fetch("/api/user/profile", { credentials: "include" })
        .then(res => res.json())
        .then(data => setProfilePhoto(data.photo))
        .catch(() => setProfilePhoto(null));
    } else {
      setProfilePhoto(null);
    }
  }, [token]);

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
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
        <div className="group relative">
          <Link to={token ? "/my-profile" : "/login"}>
            <img
              src={profilePhoto || assets.profile_icon}
              alt="Profile Icon"
              className="w-7 h-7 rounded-full object-cover border border-gray-300 cursor-pointer"
            />
          </Link>
          {/* Dropdown Menu */}
          <div
            className={`${token === "" || !token ? `group-hover:hidden` : "group-hover:block"} dropdown-menu absolute right-0 z-10 hidden pt-4`}
          >
            <div className="flex w-40 flex-col gap-2 rounded-lg bg-slate-100 px-5 py-3 text-gray-500 items-center">
              <img
                src={profilePhoto || assets.profile_icon}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border border-gray-300 mb-2"
              />
              <p
                className="cursor-pointer hover:text-black"
                onClick={() => navigate("/my-profile")}
              >My Profile</p>
              <p
                className="cursor-pointer hover:text-black"
                onClick={() => navigate("/orders")}
              >Orders</p>
              <p className="cursor-pointer hover:text-black" onClick={logout}>
                Logout
              </p>
            </div>
          </div>
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
