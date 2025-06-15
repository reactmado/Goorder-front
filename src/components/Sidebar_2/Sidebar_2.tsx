import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaCog,
  FaEye,
  FaEnvelope,
  FaBoxOpen,
  FaImages,
  FaBullhorn,
  FaShoppingCart,
  FaSignOutAlt, // Keep this for the logout icon
  FaBars,
  FaTimes, // Keep this for close button
} from "react-icons/fa";

// NEW ICON IMPORTS
import { HiSparkles, HiSquares2X2 } from "react-icons/hi2";

// Import the business profile service
import {
  getBusinessProfile,
  BusinessProfile,
} from "../../service/Profile_B_service";

import "./Sidebar_2.css";

export interface Sidebar_2Props {
  /** The name of the logged-in user */
  name?: string;
  /** The email of the logged-in user */
  email?: string;
  /** (Optional) URL of the user's avatar image */
  avatarUrl?: string;
  /** Whether the mobile menu is currently open */
  isMobileMenuOpen?: boolean;
  /** Function to toggle the mobile menu open/closed */
  toggleMobileMenu?: () => void;
}

const Sidebar_2: React.FC<Sidebar_2Props> = ({
  name: propName,
  email: propEmail,
  avatarUrl: propAvatarUrl,
  isMobileMenuOpen = false,
  toggleMobileMenu,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // State to handle toggling of the "Orders" submenu
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // State for user profile data
  const [userProfile, setUserProfile] = useState<BusinessProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // State to manage internal mobile menu state if toggleMobileMenu prop isn't provided
  const [mobileOpen, setMobileOpen] = useState(isMobileMenuOpen);
  // State to manage overlay visibility
  const [overlayVisible, setOverlayVisible] = useState(isMobileMenuOpen);

  const isActive = (path: string) => location.pathname === path;

  // Use useCallback to memoize the function and fix the ESLint warning
  const handleToggleMobileMenu = useCallback(
    (forceState?: boolean) => {
      const newState =
        typeof forceState !== "undefined" ? forceState : !mobileOpen;

      if (toggleMobileMenu) {
        toggleMobileMenu();
      } else {
        setMobileOpen(newState);
      }

      setOverlayVisible(newState);

      // Prevent body scrolling when menu is open
      if (newState) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    },
    [mobileOpen, toggleMobileMenu]
  );

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError(null);
        const profile = await getBusinessProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setProfileError(
          error instanceof Error ? error.message : "Failed to load profile"
        );
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    // Update internal state when prop changes
    setMobileOpen(isMobileMenuOpen);
    setOverlayVisible(isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  // Handle window resize to automatically close mobile menu on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileOpen) {
        handleToggleMobileMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileOpen, handleToggleMobileMenu]); // Fixed: Added handleToggleMobileMenu to dependencies

  // Handle logout with confirmation modal
  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    try {
      // Clear all storage data safely
      if (typeof Storage !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch (error) {
      console.warn("Could not clear storage:", error);
    }

    // Close modal
    setShowLogoutModal(false);

    // Navigate to login or home page with replace to prevent back navigation
    navigate("/login", { replace: true });
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Handle navigation with error handling
  const handleNavigate = (path: string) => {
    try {
      // Navigate to the specified path
      navigate(path);

      // Close mobile menu if on mobile screen
      if (window.innerWidth <= 768) {
        handleToggleMobileMenu(false);
      }
    } catch (error) {
      console.warn("Navigation error:", error);
    }
  };

  // Determine if using internal or external mobile menu state
  const isMenuOpen = toggleMobileMenu ? isMobileMenuOpen : mobileOpen;

  // Determine which data to display (props take priority over fetched data)
  const displayName = propName || userProfile?.businessName || "Loading...";
  const displayphoneNumber = propEmail || userProfile?.phoneNumber || "Loading..."; // Fallback since API doesn't provide email
  const displayAvatar = propAvatarUrl || userProfile?.image;

  return (
    <>
      {/* Mobile menu toggle button */}
      <button
        className="sidebar_2-toggle"
        onClick={() => handleToggleMobileMenu()}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Background overlay for mobile */}
      {overlayVisible && (
        <div
          className={`sidebar_2-overlay ${overlayVisible ? "active" : ""}`}
          onClick={() => handleToggleMobileMenu(false)}
        />
      )}

      {/* Logout Confirmation Modal - REPLACED WITH SIDEBAR'S MODAL */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-modal-header">
              <div className="logout-icon">
                <FaSignOutAlt />
              </div>
              <button className="close-modal" onClick={cancelLogout}>
                <FaTimes />
              </button>
            </div>
            <div className="logout-modal-body">
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to sign out of your account?</p>
            </div>
            <div className="logout-modal-actions">
              <button className="cancel-btn" onClick={cancelLogout}>
                <span>Cancel</span>
              </button>
              <button className="confirm-btn" onClick={confirmLogout}>
                <FaSignOutAlt />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`sidebar_2 ${isMenuOpen ? "mobile-open" : ""}`}>
        {/* Top Section: Menu Items */}
        <div className="sidebar_2-top">
          <ul className="sidebar_2-menu">
            {/* Dashboard */}
            <li className={isActive("/BusDashboard") ? "active" : ""}>
              <Link
                to="/BusDashboard"
                onClick={() => handleNavigate("/BusDashboard")}
              >
                <FaHome className="sidebar_2-icon" />
                <span>Dashboard</span>
              </Link>
            </li>

            {/* Profile */}
            <li className={isActive("/profile_b") ? "active" : ""}>
              <Link
                to="/profile_b"
                onClick={() => handleNavigate("/profile_b")}
              >
                <FaUser className="sidebar_2-icon" />
                <span>Profile</span>
              </Link>
            </li>

            {/* Settings */}
            <li className={isActive("/Bus-settings") ? "active" : ""}>
              <Link
                to="/Bus-settings"
                onClick={() => handleNavigate("/Bus-settings")}
              >
                <FaCog className="sidebar_2-icon" />
                <span>Settings</span>
              </Link>
            </li>

            {/* User review */}
            <li className={isActive("/reviews") ? "active" : ""}>
              <Link to="/reviews" onClick={() => handleNavigate("/reviews")}>
                <FaEye className="sidebar_2-icon" />
                <span>User review</span>
              </Link>
            </li>

            {/* Messages */}
            <li className={isActive("/messages") ? "active" : ""}>
              <Link to="/messages" onClick={() => handleNavigate("/messages")}>
                <FaEnvelope className="sidebar_2-icon" />
                <span>Messages</span>
              </Link>
            </li>

            {/* Add Category */}
            <li className={isActive("/add-category-business") ? "active" : ""}>
              <Link
                to="/add-category-business"
                onClick={() => handleNavigate("/add-category-business")}
              >
                <HiSparkles className="sidebar_2-icon" />
                <span>Add Category</span>
              </Link>
            </li>

            {/* Add Subcategory */}
            <li
              className={isActive("/add-subcategory-business") ? "active" : ""}
            >
              <Link
                to="/add-subcategory-business"
                onClick={() => handleNavigate("/add-subcategory-business")}
              >
                <HiSquares2X2 className="sidebar_2-icon" />
                <span>Add Subcategory</span>
              </Link>
            </li>

            {/* Add Product */}
            <li className={isActive("/add-product-business_1") ? "active" : ""}>
              <Link
                to="/add-product-business_1"
                onClick={() => handleNavigate("/add-product-business_1")}
              >
                <FaBoxOpen className="sidebar_2-icon" />
                <span>Add Product</span>
              </Link>
            </li>

            {/* Image Generator */}
            <li className={isActive("/image-generator") ? "active" : ""}>
              <Link
                to="/image-generator"
                onClick={() => handleNavigate("/image-generator")}
              >
                <FaImages className="sidebar_2-icon" />
                <span>Image Generator</span>
              </Link>
            </li>

            {/* Marketing AI */}
            <li className={isActive("/marketing-ai") ? "active" : ""}>
              <Link
                to="/marketing-ai"
                onClick={() => handleNavigate("/marketing-ai")}
              >
                <FaBullhorn className="sidebar_2-icon" />
                <span>Marketing AI</span>
              </Link>
            </li>

            <li className={isActive("/orders/all") ? "active" : ""}>
              <Link
                to="/orders/all"
                onClick={() => handleNavigate("/orders/all")}
              >
                <FaShoppingCart className="sidebar_2-icon" />
                <span> Orders </span>
              </Link>
            </li>

            {/* Logout */}
            <li>
              <a href="#" onClick={handleLogoutClick}>
                <FaSignOutAlt className="sidebar_2-icon" />
                <span>Logout</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Bottom Section: User Info */}
        <div className="sidebar_2-bottom">
          {displayAvatar && (
            <img
              src={displayAvatar}
              alt="User Avatar"
              className="sidebar_2-avatar"
              onError={(e) => {
                // Hide image if it fails to load
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <div className="sidebar_2-user-info">
            <span className="sidebar_2-user-name">
              {profileLoading ? "Loading..." : displayName}
            </span>
            <span className="sidebar_2-user-email">
              {profileError ? "Error loading profile" : displayphoneNumber}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar_2;