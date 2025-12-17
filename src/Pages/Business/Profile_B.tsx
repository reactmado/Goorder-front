"use client";

import React, { useState, useEffect, useCallback } from "react";
import "../../styles/Profile_B.css"; // Ensure this CSS is linked
import Navbar from "../../components/navbar copy/Navbar";
import {
  getBusinessProfile,
  updateBusinessProfile,
} from "../../service/Profile_B_service";

// Define a simple loading spinner component
const LoadingSpinner: React.FC = () => (
  <div className="profile_b-loading-overlay">
    <div className="profile_b-spinner"></div>
    <p>Loading profile data...</p>
  </div>
);

// Define a reusable Toast/Notification component
interface ToastProps {
  message: string | null;
  type: "success" | "error" | null;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  if (!message || !type) return null;

  return (
    <div className={`profile_b-toast profile_b-toast-${type}`}>
      <span>{message}</span>
      <button onClick={onClose}>&times;</button>
    </div>
  );
};


const Profile_B: React.FC = () => {
  const [businessName, setBusinessName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [businessImage, setBusinessImage] = useState<string>(""); // URL from backend
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // New file to upload
  const [loading, setLoading] = useState(false); // For save changes
  const [loadingData, setLoadingData] = useState(false); // For initial data load
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | null>(null);

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingData(true);
        const profile = await getBusinessProfile();

        setBusinessName(profile.businessName || "");
        setPhoneNumber(
          profile.phoneNumber === "undefined" ? "" : profile.phoneNumber || ""
        );
        setAddress(
          profile.address === "undefined" ? "" : profile.address || ""
        );
        setBankAccount(
          profile.bankAccountNumber === "undefined"
            ? ""
            : profile.bankAccountNumber || ""
        );
        setBusinessImage(profile.image || ""); // Keep original image URL
      } catch (err) {
        setToastMessage("Failed to load profile data.");
        setToastType("error");
        console.error("Error loading profile:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadProfile();
  }, []);

  // Handle file input changes
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setBusinessImage(URL.createObjectURL(e.target.files[0])); // Show local preview
    }
  }, []);

  // Clear toast messages after 5 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
        setToastType(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setToastMessage(null);
      setToastType(null);

      const profileData = {
        BusinessName: businessName.trim(),
        Address: address.trim(),
        PhoneNumber: phoneNumber.trim(),
        BankAccountNumber: bankAccount.trim(),
        // Only send Image if a new file is selected
        Image: selectedFile || undefined,
      };

      await updateBusinessProfile(profileData);
      setToastMessage("Profile updated successfully!");
      setToastType("success");
      setSelectedFile(null); // Clear selected file after successful upload

      // Re-fetch profile to ensure all data (especially image URL if it changed) is up-to-date
      const updatedProfile = await getBusinessProfile();
      setBusinessName(updatedProfile.businessName || "");
      setPhoneNumber(
        updatedProfile.phoneNumber === "undefined" ? "" : updatedProfile.phoneNumber || ""
      );
      setAddress(
        updatedProfile.address === "undefined" ? "" : updatedProfile.address || ""
      );
      setBankAccount(
        updatedProfile.bankAccountNumber === "undefined"
          ? ""
          : updatedProfile.bankAccountNumber || ""
      );
      setBusinessImage(updatedProfile.image || ""); // Update image URL from backend
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as any)?.response?.data?.message || "Failed to update profile"; // More robust error access
      setToastMessage(errorMessage);
      setToastType("error");
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check if any modal/popup is open (including the custom toast for blurring main content)
  const isAnyModalOpen = toastMessage !== null; // The toast itself acts as a kind of overlay for blur effect

  return (
    <div className="profile_b-page">
      <Navbar isModalOpen={isAnyModalOpen} /> {/* Pass modal state to Navbar */}

      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      {loadingData && <LoadingSpinner />}

      <div className={`profile_b-content ${loadingData || isAnyModalOpen ? "blurred" : ""}`}> {/* Blur main content if loading or toast is shown */}
        <div className="profile_b-topbar">
          <div className="profile_b-avatar-container">
            {businessImage ? (
              <img
                src={businessImage}
                alt="Business Avatar"
                className="profile_b-avatar"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/business_placeholder.jpg";
                  (e.target as HTMLImageElement).classList.add('broken-image'); // Add class for styling broken images
                }}
              />
            ) : (
              <div className="profile_b-avatar-placeholder">
                <span><img src="/images/business_placeholder.jpg" alt="Placeholder" /></span>
              </div>
            )}
            <label htmlFor="profile_b-upload-input" className="profile_b-upload-overlay">
                Click to Change
            </label>
            <input
              type="file"
              id="profile_b-upload-input"
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept="image/*"
              disabled={loading}
            />
          </div>
        </div>

        <div className="profile_b-main">
          <h2 className="profile_b-title">Business Profile Data</h2>

          <div className="profile_b-form">
            <div className="profile_b-field">
              <label htmlFor="businessName">Business Name</label>
              <input
                type="text"
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={loading}
                placeholder="Enter business name"
              />
            </div>
            <div className="profile_b-field">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                placeholder="Enter phone number"
              />
            </div>
            <div className="profile_b-field">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading}
                placeholder="Enter address"
              />
            </div>

            <div className="profile_b-field">
              <label htmlFor="bankAccount">Bank Account Number</label>
              <input
                type="text"
                id="bankAccount"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                disabled={loading}
                placeholder="Enter bank account number"
              />
            </div>
          </div>

          <div className="profile_b-actions">
            <button
              className="profile_b-save-btn"
              onClick={handleSaveChanges}
              disabled={loading || loadingData}
              type="button"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile_B;