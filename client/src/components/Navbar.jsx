import {
  BarChart3Icon,
  BuildingIcon,
  Calculator,
  Clock,
  FileTextIcon,
  HomeIcon,
  LogOutIcon,
  MapIcon,
  PlaneIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import WorldMapImage from "../assets/WorldMap.png";
import user from "../assets/user.png";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const { user: authUser, logout } = useAuth();

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#1E1F23] to-[#2F4550] text-white p-6 shadow-xl z-50">
      <div className="flex flex-col h-full">
        {/* Profile Section */}
        <div className="mb-8 relative">
          <div className="relative w-24 h-24 mx-auto mb-4 group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-500 to-yellow-400 absolute -top-4 -left-4 z-0 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="w-24 h-24 rounded-full bg-gray-300 relative z-10 overflow-hidden border-2 border-[#1E1F23] shadow-lg transform group-hover:scale-105 transition-transform duration-300">
              <img
                src={user}
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-100">
            {authUser?.name || "Guest User"}
          </h2>
          <p className="text-sm text-gray-300 text-center">
            {authUser?.email || "guest@example.com"}
          </p>
          <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-2">
          {[
            {
              to: "/dashboard",
              icon: <HomeIcon className="w-5 h-5" />,
              label: "DASHBOARD",
            },
            {
              to: "/flights",
              icon: <PlaneIcon className="w-5 h-5" />,
              label: "FLIGHTS",
            },
            {
              to: "/flight-map",
              icon: <MapIcon className="w-5 h-5" />,
              label: "FLIGHT MAP",
            },
            {
              to: "/report",
              icon: <BarChart3Icon className="w-5 h-5" />,
              label: "REPORTS",
            },
            {
              to: "/cost-estimation",
              icon: <Calculator className="w-5 h-5" />,
              label: "COST ESTIMATION",
            },
            {
              to: "/eta-estimation",
              icon: <Clock className="w-5 h-5" />,
              label: "ETA ESTIMATION",
            },
            {
              to: "/airports",
              icon: <BuildingIcon className="w-5 h-5" />,
              label: "AIRPORTS",
            },
            {
              to: "/airlines",
              icon: <FileTextIcon className="w-5 h-5" />,
              label: "AIRLINES",
            },
          ].map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 text-yellow-500 border-l-4 border-yellow-500"
                    : "hover:bg-[#3A5463] text-gray-300 hover:text-white"
                }`}
              >
                <span className={`${isActive ? "text-yellow-500" : ""}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className="mt-auto mb-4 flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/40"
        >
          <LogOutIcon className="w-5 h-5" />
          <span className="font-medium">LOGOUT</span>
        </button>

        {/* Active Users Section */}
        {/* <div className="mt-auto">
          <div className="border-t border-gray-700/50 pt-4">
            <h3 className="text-sm font-medium mb-3 text-yellow-500 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              ACTIVE USERS
            </h3>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-b from-gray-400 to-gray-500 border-2 border-[#1E1F23] transform hover:translate-y-[-2px] transition-transform duration-200 cursor-pointer"
                ></div>
              ))}
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 border-2 border-[#1E1F23] flex items-center justify-center text-xs font-bold shadow-lg transform hover:translate-y-[-2px] transition-transform duration-200 cursor-pointer">
                +70
              </div>
            </div>
          </div>
        </div> */}
        <div className="mt-4 opacity-60 hover:opacity-100 transition-opacity duration-300">
          <div className="w-full h-16 rounded-lg overflow-hidden shadow-md">
            <img
              src={WorldMapImage}
              alt="World Map"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
