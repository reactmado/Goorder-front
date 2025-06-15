"use client"

import type React from "react"
import { useState, useEffect, type ChangeEvent } from "react"
import Navbar from "../../components/navbar/Navbar"
import CustomInputField from "../../components/InputField"
import CustomButton from "../../components/Button"
import { getUserProfile, updateUserProfile } from "../../service/Profile_service"
import "../../styles/Profile.css"

// Define interfaces for better type safety
interface ProfileData {
  firstName?: string
  lastName?: string
  address?: string
  role?: string
  phoneNumber?: string
  email: string
  image?: string
}

interface ProfileFormData {
  firstName: string
  lastName: string
  phoneNumber: string
  address: string
  image?: File
}

const Profile: React.FC = () => {
  // State for form fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address, setAddress] = useState("")
  const [role, setRole] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string>("/photos/boy1.png")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showImageConfirmation, setShowImageConfirmation] = useState(false)
  const [newImage, setNewImage] = useState<File | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsInitialLoading(true)
        setError(null)
        const profileData: ProfileData = await getUserProfile()

        // Update form state with fetched data
        setFirstName(profileData.firstName || "")
        setLastName(profileData.lastName || "")
        setAddress(profileData.address || "")
        setRole(profileData.role || "")
        setPhoneNumber(profileData.phoneNumber || "")
        setEmail(profileData.email || "")

        // Set preview image if available from API
        if (profileData.image) {
          setPreviewImage(profileData.image)
        }
      } catch (err: unknown) {
        console.error("Error loading profile:", err)
        setError("Failed to load profile data. Please try again.")
      } finally {
        setIsInitialLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(profileImage !== null)
  }, [profileImage])

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, error])

  // Handle profile image change
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file")
        return
      }

      setNewImage(file)
      setShowImageConfirmation(true)
    }
  }

  // Handle image confirmation
  const handleConfirmImageChange = () => {
    if (newImage) {
      setProfileImage(newImage)

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(newImage)

      setShowImageConfirmation(false)
      setNewImage(null)
      setError(null)
    }
  }

  // Handle image rejection
  const handleRejectImageChange = () => {
    setShowImageConfirmation(false)
    setNewImage(null)
    // Reset file input
    const fileInput = document.getElementById("profile-image-upload") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  // Handle form field changes
  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value)
    setHasUnsavedChanges(true)
  }

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccessMessage(null)

      // Validate required fields
      if (!firstName.trim() || !lastName.trim()) {
        setError("First name and last name are required")
        return
      }

      if (phoneNumber && !/^\+?[\d\s\-$$$$]+$/.test(phoneNumber)) {
        setError("Please enter a valid phone number")
        return
      }

      const updateData: ProfileFormData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
      }

      if (profileImage) {
        updateData.image = profileImage
      }

      await updateUserProfile(updateData)

      setSuccessMessage("Profile updated successfully!")
      setHasUnsavedChanges(false)
      setProfileImage(null)
    } catch (err: unknown) {
      console.error("Error updating profile:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form reset
  const handleResetForm = () => {
    // This would typically refetch the original data
    setHasUnsavedChanges(false)
    setProfileImage(null)
    setError(null)
    setSuccessMessage(null)
  }

  if (isInitialLoading) {
    return (
      <Navbar>
        <div className="profile-loading-container">
          <div className="profile-loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </Navbar>
    )
  }

  return (
    <Navbar>
      <div className="profile-page">
        {/* Profile Header Section */}
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-image-section">
              <div className="profile-image-container">
                <img
                  src={previewImage || "/placeholder.svg?height=120&width=120"}
                  alt="User Avatar"
                  className="profile-avatar"
                />
                <div className="profile-image-overlay">
                  <label htmlFor="profile-image-upload" className="image-upload-button" title="Change profile picture">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="13"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </label>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-upload-input"
                  />
                </div>
              </div>
              <div className="profile-info">
                <h1 className="profile-name">
                  {firstName} {lastName}
                </h1>
                <p className="profile-email">{email}</p>
                <span className="profile-role-badge">{role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="profile-main">
          <div className="profile-content">
            <div className="profile-form-header">
              <h2 className="profile-form-title">Profile Information</h2>
              {hasUnsavedChanges && (
                <div className="unsaved-changes-indicator">
                  <span>You have unsaved changes</span>
                </div>
              )}
            </div>

            {/* Display error message if any */}
            {error && (
              <div className="alert alert-error" role="alert">
                <svg className="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* Display success message if any */}
            {successMessage && (
              <div className="alert alert-success" role="alert">
                <svg className="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {successMessage}
              </div>
            )}

            <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-grid">
                {/* First Name */}
                <div className="form-field">
                  <label htmlFor="firstName" className="form-label">
                    First Name <span className="required">*</span>
                  </label>
                  <CustomInputField
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => handleFieldChange(setFirstName, e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Last Name */}
                <div className="form-field">
                  <label htmlFor="lastName" className="form-label">
                    Last Name <span className="required">*</span>
                  </label>
                  <CustomInputField
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => handleFieldChange(setLastName, e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Phone Number */}
                <div className="form-field">
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number
                  </label>
                  <CustomInputField
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => handleFieldChange(setPhoneNumber, e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Role (Read-only) */}
                <div className="form-field">
                  <label htmlFor="role" className="form-label">
                    Role
                  </label>
                  <CustomInputField
                    id="role"
                    type="text"
                    placeholder="Your role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={true}
                  />
                </div>

                {/* Address */}
                <div className="form-field form-field-full">
                  <label htmlFor="address" className="form-label">
                    Address
                  </label>
                  <CustomInputField
                    id="address"
                    type="text"
                    placeholder="Enter your address"
                    value={address}
                    onChange={(e) => handleFieldChange(setAddress, e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Email (Read-only) */}
                <div className="form-field form-field-full">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <CustomInputField
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={true}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <CustomButton
                  text="Reset"
                  variant="outline"
                  onClick={handleResetForm}
                  disabled={isLoading || !hasUnsavedChanges}
                />
                <CustomButton
                  text={isLoading ? "Saving..." : "Save Changes"}
                  variant="primary"
                  onClick={handleSaveChanges}
                  disabled={isLoading}
                />
              </div>
            </form>
          </div>
        </div>

        {/* Image Confirmation Modal */}
        {showImageConfirmation && (
          <div className="modal-overlay" onClick={handleRejectImageChange}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Confirm Image Change</h3>
                <button className="modal-close" onClick={handleRejectImageChange} aria-label="Close modal">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to update your profile picture?</p>
                {newImage && (
                  <div className="image-preview">
                    <img
                      src={URL.createObjectURL(newImage) || "/placeholder.svg"}
                      alt="New profile preview"
                      className="preview-image"
                    />
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <CustomButton text="Cancel" variant="outline" onClick={handleRejectImageChange} />
                <CustomButton text="Yes, Update" variant="primary" onClick={handleConfirmImageChange} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Navbar>
  )
}

export default Profile
