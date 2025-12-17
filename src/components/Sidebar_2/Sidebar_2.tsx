"use client";

import React, { useState, useEffect } from "react";
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
  FaSignOutAlt,
  FaTimes,
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
  /** Whether the sidebar is currently open */
  isOpen?: boolean;
  /** Function to toggle the sidebar open/closed */
  onToggle?: (isOpen: boolean) => void;
  /** Whether a modal is currently open on the page */
  isModalOpen?: boolean; // New prop for modal awareness
}

const Sidebar_2: React.FC<Sidebar_2Props> = ({
  name: propName,
  email: propEmail,
  avatarUrl: propAvatarUrl,
  isOpen = true,
  onToggle,
  isModalOpen = false, // Default to false
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // State to handle logout modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // State for user profile data
  const [userProfile, setUserProfile] = useState<BusinessProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // State to manage overlay visibility for mobile
  const [overlayVisible, setOverlayVisible] = useState(false);

  const isActive = (path: string) => location.pathname === path;

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

  // Handle window resize to automatically close mobile menu on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1023 && !isOpen) {
        // On desktop, ensure sidebar is open by default
        onToggle?.(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, onToggle]);

  // Handle overlay for mobile
  useEffect(() => {
    if (window.innerWidth <= 1023) {
      setOverlayVisible(isOpen);
      // Prevent body scrolling when menu is open on mobile
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
      if (window.innerWidth <= 1023) {
        onToggle?.(false);
      }
    } catch (error) {
      console.warn("Navigation error:", error);
    }
  };

  // Determine which data to display (props take priority over fetched data)
  const displayName = propName || userProfile?.businessName || "Loading...";
  const displayphoneNumber = propEmail || userProfile?.phoneNumber || "Loading...";
  const displayAvatar = propAvatarUrl || userProfile?.image;

  return (
    <>
      {/* Background overlay for mobile */}
      {overlayVisible && window.innerWidth <= 1023 && (
        <div
          className={`sidebar_2-overlay ${overlayVisible ? "active" : ""}`}
          onClick={() => onToggle?.(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
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

      <div className={`sidebar_2 ${isOpen ? "mobile-open" : "collapsed"} ${isModalOpen ? "modal-open" : ""}`}> {/* Add modal-open class */}
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
                <span>Orders</span>
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
              src={displayAvatar || "/placeholder.svg"}
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