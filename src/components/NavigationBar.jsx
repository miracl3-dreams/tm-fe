import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";
import { FiSettings } from "react-icons/fi";
import { GiHamburgerMenu } from "react-icons/gi";
import { RxCross2 } from "react-icons/rx";
import IconProfile from "./IconProfile";
import Cards from "./Cards";
import axios from "../utils/Axios";
import { toast, Bounce } from "react-toastify";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../components/ui/tooltip";

const NavigationBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [userData, setUserData] = useState({ userName: "", email: "" });
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    if (storedName && storedEmail) {
      setUserData({ userName: storedName, email: storedEmail });
    }
  }, []);

  const handleHamburgerButton = () => {
    setMobileView((prev) => !prev);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.warn("No token found, redirecting to login.");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        "/api/v1/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Successfully Logout!", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <div>
      {/* Desktop Navigation */}
      <nav className="bg-blue-500 flex justify-between items-center px-5 py-5 text-white">
        <Link to={"/dashboard"} className="text-3xl font-bold hover:text-black">
          Task Management
        </Link>
        <ul className="hidden lg:flex items-center gap-8 font-bold">
          <TooltipProvider>
            <li className="hover:text-black">
              <Tooltip>
                <TooltipTrigger>
                  <Link to={"tasks"}>Tasks</Link>
                </TooltipTrigger>
                <TooltipContent>Manage your tasks</TooltipContent>
              </Tooltip>
            </li>
            <li className="hover:text-black">
              <Tooltip>
                <TooltipTrigger>
                  <Link to={"posts"}>Posts</Link>
                </TooltipTrigger>
                <TooltipContent>View posts</TooltipContent>
              </Tooltip>
            </li>
            <li className="hover:text-black">
              <Tooltip>
                <TooltipTrigger>
                  <Link to={"contact"}>Contact</Link>
                </TooltipTrigger>
                <TooltipContent>Get in touch</TooltipContent>
              </Tooltip>
            </li>
          </TooltipProvider>
          <li className="relative">
            <div
              className="flex items-center cursor-pointer"
              onClick={toggleDropdown}
            >
              <IconProfile />
            </div>
            {isDropdownOpen && (
              <div className="absolute z-10 right-0 mt-2 w-56">
                <Cards className="bg-white text-black shadow-md">
                  <div className="border-b pb-3 mb-3 text-sm text-gray-700">
                    <p className="font-semibold">{userData.userName}</p>
                    <p>{userData.email}</p>
                  </div>
                  <button
                    className="flex items-center gap-2 px-2 py-1 w-full hover:bg-gray-100 rounded text-left"
                    onClick={handleSettings}
                  >
                    <FiSettings /> Account Settings
                  </button>
                  <button
                    className="flex items-center gap-2 px-2 py-1 w-full hover:bg-gray-100 rounded text-left"
                    onClick={handleLogout}
                  >
                    <LuLogOut /> Logout
                  </button>
                </Cards>
              </div>
            )}
          </li>
        </ul>

        {/* Mobile Hamburger Menu */}
        <button className="text-2xl lg:hidden" onClick={handleHamburgerButton}>
          {mobileView ? <RxCross2 /> : <GiHamburgerMenu />}
        </button>

        {mobileView && (
          <ul className="fixed left-0 top-0 z-10 bg-blue-500 flex flex-col items-center gap-5 px-10 pt-10 h-[100vh] text-white font-bold">
            <li>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Link onClick={handleHamburgerButton} to={"tasks"}>
                      Tasks
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Manage your tasks</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </li>
            <li>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Link onClick={handleHamburgerButton} to={"posts"}>
                      Posts
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>View posts</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </li>
            <li>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Link onClick={handleHamburgerButton} to={"contact"}>
                      Contact
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Get in touch</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </li>
            <li className="relative">
              <div
                className="flex items-center cursor-pointer"
                onClick={toggleDropdown}
              >
                <IconProfile />
              </div>
              {isDropdownOpen && (
                <div className="absolute z-10 mt-2 w-56">
                  <Cards className="bg-white text-black shadow-md">
                    <div className="border-b pb-3 mb-3 text-sm text-gray-700">
                      <p className="font-semibold">{userData.userName}</p>
                      <p>{userData.email}</p>
                    </div>
                    <button
                      className="flex items-center gap-2 px-2 py-1 w-full hover:bg-gray-100 rounded text-left"
                      onClick={handleSettings}
                    >
                      <FiSettings /> Settings
                    </button>
                    <button
                      className="flex items-center gap-2 px-2 py-1 w-full hover:bg-gray-100 rounded text-left"
                      onClick={handleLogout}
                    >
                      <LuLogOut /> Logout
                    </button>
                  </Cards>
                </div>
              )}
            </li>
          </ul>
        )}
      </nav>

      {/* Outlet for Nested Routes */}
      <Outlet />
    </div>
  );
};

export default NavigationBar;
