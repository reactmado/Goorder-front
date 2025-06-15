"use client"

import type React from "react"
import { useState, useEffect, type ChangeEvent, type FormEvent } from "react"
import Navbar from "../../components/navbar/Navbar"
import CustomButton from "../../components/Button"
import CustomInputField from "../../components/InputField"
import {
  FaUserPlus,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaUser,
} from "react-icons/fa"
import "../../styles/add-admin.css"
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  type AdminDTO,
  type AdminCreateDTO,
} from "../../service/AddAdmin_service"

const AddAdmin: React.FC = () => {
  const [admins, setAdmins] = useState<AdminDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminDTO | null>(null)
  const [notification, setNotification] = useState({
    message: "",
    visible: false,
    type: "error" as "error" | "success",
  })
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    email: "",
    password: "",
    role: "",
  })

  const showNotification = (message: string, type: "error" | "success") => {
    setNotification({ message, visible: true, type })
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }))
    }, 5000)
  }

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const data = await getAdmins()
        setAdmins(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching admins:", error)
        showNotification("Failed to load admins", "error")
        setLoading(false)
      }
    }
    fetchAdmins()
  }, [])

  useEffect(() => {
    if (editingAdmin) {
      const names = editingAdmin.firstName.split(" ")
      const firstName = names[0] || ""
      const lastName = names.slice(1).join(" ") || ""

      setFormData({
        firstName,
        lastName,
        phoneNumber: editingAdmin.phoneNumber,
        address: editingAdmin.address || "",
        email: editingAdmin.email || "",
        password: "",
        role: "Limited Admin",
      })
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        email: "",
        password: "",
        role: "Limited Admin",
      })
    }
  }, [editingAdmin])

  const handleDeleteClick = (adminId: string) => {
    setSelectedAdminId(adminId)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedAdminId) {
      try {
        setIsProcessing(true)
        await deleteAdmin(selectedAdminId)
        setAdmins(admins.filter((admin) => admin.id !== selectedAdminId))
        setShowDeleteModal(false)
        setSelectedAdminId(null)
        showNotification("Admin deleted successfully", "success")
      } catch (error) {
        console.error("Failed to delete admin:", error)
        showNotification("Failed to delete admin", "error")
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const openAddAdmin = () => {
    setEditingAdmin(null)
    setShowAdminModal(true)
  }

  const openEditAdmin = (admin: AdminDTO) => {
    setEditingAdmin(admin)
    setShowAdminModal(true)
  }

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      setIsProcessing(true)

      if (editingAdmin) {
        const formDataForUpdate = new FormData()
        formDataForUpdate.append("FirstName", formData.firstName)
        formDataForUpdate.append("LastName", formData.lastName)
        formDataForUpdate.append("PhoneNumber", formData.phoneNumber)
        formDataForUpdate.append("Address", formData.address)

        const updatedAdmin = await updateAdmin(editingAdmin.id, formDataForUpdate)
        setAdmins(admins.map((admin) => (admin.id === updatedAdmin.id ? updatedAdmin : admin)))
        showNotification("Admin updated successfully", "success")
      } else {
        const newAdmin: AdminCreateDTO = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          email: formData.email,
          password: formData.password,
        }

        const createdAdmin = await createAdmin(newAdmin)
        setAdmins([...admins, createdAdmin])
        showNotification("Admin created successfully", "success")
      }

      setShowAdminModal(false)
    } catch (error) {
      console.error("Error saving admin:", error)
      showNotification("Failed to save admin", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  const getFullName = (admin: AdminDTO) => {
    return `${admin.firstName} ${admin.lastName}`.trim()
  }

  if (loading) {
    return (
      <Navbar>
        <div className="add-admin-loading">
          <div className="loading-spinner">
            <FaSpinner className="animate-spin" />
          </div>
          <p>Loading admins...</p>
        </div>
      </Navbar>
    )
  }

  return (
    <Navbar>
      <div className="add-admin-page">
        {/* Header */}
        <header className="add-admin-header">
          <div className="header-content">
            <div className="header-info">
              <div className="header-icon">
                <FaUserPlus />
              </div>
              <div className="header-text">
                <h1>Manage Admins</h1>
                <p>Create, edit, and manage admin accounts</p>
              </div>
            </div>
            <CustomButton text="Add New Admin" className="add-admin-btn" onClick={openAddAdmin} />
          </div>
        </header>

        {/* Notifications */}
        {notification.visible && (
          <div className={`notification ${notification.type === "error" ? "error" : "success"}`}>
            {notification.type === "error" ? (
              <FaExclamationTriangle className="notification-icon" />
            ) : (
              <FaCheckCircle className="notification-icon" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification((prev) => ({ ...prev, visible: false }))}
              className="close-notification"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="add-admin-content">
          {admins.length > 0 ? (
            <div className="admin-grid">
              {admins.map((admin) => (
                <div key={admin.id} className="admin-card">
                  <div className="admin-card-header">
                    <h3>{getFullName(admin)}</h3>
                    <span className="admin-badge">Admin</span>
                  </div>
                  <div className="admin-card-content">
                    <div className="admin-info">
                      <FaPhone className="info-icon" />
                      <span>{admin.phoneNumber}</span>
                    </div>
                    {admin.address && (
                      <div className="admin-info">
                        <FaMapMarkerAlt className="info-icon" />
                        <span>{admin.address}</span>
                      </div>
                    )}
                    {admin.email && (
                      <div className="admin-info">
                        <FaEnvelope className="info-icon" />
                        <span>{admin.email}</span>
                      </div>
                    )}
                    <div className="admin-actions">
                      <CustomButton text="Edit" className="edit-btn" onClick={() => openEditAdmin(admin)} />
                      <CustomButton text="Delete" className="delete-btn" onClick={() => handleDeleteClick(admin.id)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaUser className="empty-icon" />
              <h3>No admins found</h3>
              <p>Get started by adding your first admin</p>
              <CustomButton text="Add New Admin" onClick={openAddAdmin} />
            </div>
          )}
        </div>

        {/* Admin Modal */}
        {showAdminModal && (
          <div className="modal-overlay" onClick={() => setShowAdminModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingAdmin ? "Edit Admin" : "Add New Admin"}</h3>
                <button className="close-modal" onClick={() => setShowAdminModal(false)}>
                  ×
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="admin-form">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <CustomInputField
                    type="text"
                    name="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    disabled={isProcessing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <CustomInputField
                    type="text"
                    name="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    disabled={isProcessing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number *</label>
                  <CustomInputField
                    type="tel"
                    name="phoneNumber"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phoneNumber}
                    onChange={handleFormChange}
                    disabled={isProcessing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <CustomInputField
                    type="text"
                    name="address"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={handleFormChange}
                    disabled={isProcessing}
                  />
                </div>

                {!editingAdmin && (
                  <>
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <CustomInputField
                        type="email"
                        name="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={handleFormChange}
                        disabled={isProcessing}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="password">Password *</label>
                      <CustomInputField
                        type="password"
                        name="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleFormChange}
                        disabled={isProcessing}
                        showEyeIcon={true}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="modal-actions">
                  <CustomButton
                    text="Cancel"
                    className="cancel-btn"
                    onClick={() => setShowAdminModal(false)}
                    disabled={isProcessing}
                  />
                  <CustomButton text={isProcessing ? "Processing..." : "Save"} type="submit" disabled={isProcessing} />
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Delete Admin</h3>
                <button className="close-modal" onClick={() => setShowDeleteModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this admin? This action cannot be undone.</p>
              </div>
              <div className="modal-actions">
                <CustomButton
                  text="Cancel"
                  className="cancel-btn"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isProcessing}
                />
                <CustomButton
                  text={isProcessing ? "Deleting..." : "Delete"}
                  className="delete-btn"
                  onClick={handleConfirmDelete}
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Navbar>
  )
}

export default AddAdmin
