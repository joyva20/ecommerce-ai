import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
const Sidebar = () => {
  return (
    <div className="w-[18%] min-h-screen border-r-2">
      <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
        <NavLink
          className={`flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l`}
          to="/dashboard"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4"></path>
          </svg>
          <p className="hidden md:block">Dashboard</p>
        </NavLink>
        <NavLink
          className={`flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l`}
          to="/add"
        >
          <img className="w-5 h-5" src={assets.add_icon} alt="Add" />
          <p className="hidden md:block">Add items</p>
        </NavLink>
        <NavLink
          className={`flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l`}
          to="/list"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="list" />
          <p className="hidden md:block">List items</p>
        </NavLink>
        <NavLink
          className={`flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l`}
          to="/orders"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="Orders" />
          <p className="hidden md:block">Orders</p>
        </NavLink>
        <NavLink
          className={`flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l`}
          to="/user-list"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="User List" />
          <p className="hidden md:block">User List</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
