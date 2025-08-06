import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import MyProfile from "./pages/MyProfile";
import RecommendationPage from "./pages/RecommendationPage";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import PlaceOrders from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import PaymentResult from "./pages/PaymentResult";
import NoPage from "./pages/NoPage";
import Footer from "./components/Footer";
import BacktoTopButton from "./components/BacktoTopButton";
import SearchBar from "./components/SearchBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globalNoEdit.css";
import "./globalNoEdit.css";

const pages = {
  home: { path: "/", element: <Home /> },
  collection: { path: "/collection", element: <Collection /> },
  about: { path: "/about", element: <About /> },
  contact: { path: "/contact", element: <Contact /> },
  product: { path: "/product/:productId", element: <Product /> },
  cart: { path: "/cart", element: <Cart /> },
  login: { path: "/login", element: <Login /> },
  placeOrders: { path: "/place-order", element: <PlaceOrders /> },
  orders: { path: "/orders", element: <Orders /> },
  paymentFinish: { path: "/payment/finish", element: <PaymentResult /> },
  paymentError: { path: "/payment/error", element: <PaymentResult /> },
  paymentPending: { path: "/payment/pending", element: <PaymentResult /> },
  myProfile: { path: "/my-profile", element: <MyProfile /> },
  recommendation: { path: "/recommendation", element: <RecommendationPage /> },
};

const App = () => {
  const [showGlobalComponent, setShowGlobalComponent] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Update NavBar visibility based on current path
    if (location.pathname === "/404") {
      setShowGlobalComponent(false);
    } else {
      setShowGlobalComponent(true);
    }
  }, [location.pathname]);

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      {/* react-toastify */}
      <ToastContainer />
      {/* Unchangable UI's Defined here: */}
      {showGlobalComponent && <NavBar />}
      {showGlobalComponent && <SearchBar />}
      {/* Routes */}
      <Routes>
        {Object.entries(pages).map(([key, { path, element }]) => (
          <Route key={key} path={path} element={element} />
        ))}
        <Route path="/home" element={<Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/404" />} />
        <Route path="/404" element={<NoPage />} />
      </Routes>
      {showGlobalComponent && <BacktoTopButton />}
      {showGlobalComponent && <Footer />}
    </div>
  );
};

export default App;
