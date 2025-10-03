import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
    const { auth } = usePuterStore();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        await auth.signOut();
        navigate("/auth");
        setShowDropdown(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="navbar-container">
            <nav className="navbar">
                <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <img 
                        src="/favicon.ico" 
                        alt="Recruit Mind" 
                        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex-shrink-0" 
                    />
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gradient truncate">
                        Recruit Mind
                    </p>
                </Link>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
                <Link to="/upload" className="primary-button w-fit text-xs sm:text-sm md:text-base px-3 sm:px-4 py-2">
                    <span className="hidden sm:inline">Upload Resume</span>
                    <span className="sm:hidden">Upload</span>
                </Link>
                {auth.isAuthenticated && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-shadow text-sm sm:text-base flex-shrink-0"
                        >
                            {auth.user?.username?.charAt(0).toUpperCase() || "U"}
                        </button>
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">
                                        {auth.user?.username}
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                    <img src="/icons/logout.svg" alt="logout" className="w-4 h-4 text-red-600" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
        </div>
    );
};

export default Navbar;
