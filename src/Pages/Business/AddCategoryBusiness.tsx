import React, { useState, useRef, useEffect } from "react";
import { FaPlus, FaEllipsisV } from "react-icons/fa";
import "../../styles/AddCategoryBusiness.css";
import Navbar from "../../components/navbar copy/Navbar";
import CategoryService, {
  CategoryResponse,
} from "../../service/AddCategoryBusiness_service";

const AddCategoryBusiness: React.FC = () => {
  // Define the page status: "market" displays images and the file upload option,
  // "drinks" hides the file upload option in the pop-up.
  const pageStatus = "market"; // Change to "drinks" to hide the file upload option

  // Local state to toggle the pop-up (modal)
  const [showPopup, setShowPopup] = useState(false);
  // Local state for storing the selected image URL for preview
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // Local state for category name
  const [categoryName, setCategoryName] = useState("");
  // Local state for selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Local state for categories fetched from API
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  // Local state for loading
  const [isLoading, setIsLoading] = useState(false);
  // Local state for error message
  const [error, setError] = useState<string | null>(null);
  // Local state for success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // State to track which category's menu is open
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  // State for delete confirmation dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // State to track which category is being deleted
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  // State to track the category being edited
  const [editingCategory, setEditingCategory] =
    useState<CategoryResponse | null>(null);

  // Reference to the hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // Event listener to close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId !== null) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openMenuId]);

  // Fetch categories from API
  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // You need to get the businessId from localStorage or context
      const businessId = localStorage.getItem("businessId") || "";
      const fetchedCategories = await CategoryService.getCategories(businessId);
      setCategories(fetchedCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving a new category or updating an existing one
  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      setError("Category name is required");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (editingCategory) {
        // Update existing category
        await CategoryService.updateCategory(
          editingCategory.id,
          categoryName,
          selectedFile || undefined
        );
        setSuccessMessage("Category updated successfully!");
      } else {
        // Add new category
        await CategoryService.addCategory(
          categoryName,
          selectedFile || undefined
        );
        setSuccessMessage("Category added successfully!");
      }

      // Success! Clear form and close popup
      setCategoryName("");
      setSelectedImage(null);
      setSelectedFile(null);
      setShowPopup(false);
      setEditingCategory(null); // Clear editing state

      setTimeout(() => setSuccessMessage(null), 3000);

      // Refresh the categories list
      fetchCategories();
    } catch (err) {
      console.error("Error saving category:", err);
      setError("Failed to save category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle category menu
  const toggleMenu = (e: React.MouseEvent, categoryId: number) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === categoryId ? null : categoryId);
  };

  // Open delete confirmation dialog
  const confirmDelete = (e: React.MouseEvent, categoryId: number) => {
    e.stopPropagation();
    setCategoryToDelete(categoryId);
    setShowDeleteConfirm(true);
    setOpenMenuId(null); // Close the menu
  };

  // Handle actual category deletion
  const handleDeleteCategory = async () => {
    if (categoryToDelete === null) return;

    setIsLoading(true);
    setError(null);
    try {
      await CategoryService.deleteCategory(categoryToDelete);

      // Close delete confirmation
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);

      // Show success message
      setSuccessMessage("Category deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Refresh the categories list
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Failed to delete category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel category deletion
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
  };

  // Handlers for opening/closing the modal
  const handleOpenPopup = () => {
    setEditingCategory(null); // Ensure we're in "add" mode
    setCategoryName("");
    setSelectedImage(null);
    setSelectedFile(null);
    setShowPopup(true);
    setError(null);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setCategoryName("");
    setSelectedImage(null);
    setSelectedFile(null);
    setError(null);
    setEditingCategory(null); // Clear editing state when closing
  };

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  // Trigger the hidden file input when the "Add" button is clicked
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection and update the preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const imageURL = URL.createObjectURL(file);
      setSelectedImage(imageURL);
    }
  };

  // Handle click on "Modify" button
  const handleEditClick = (e: React.MouseEvent, category: CategoryResponse) => {
    e.stopPropagation();
    setEditingCategory(category);
    setCategoryName(category.name);
    setSelectedImage(category.image || null); // Use existing image if available
    setSelectedFile(null); // Clear selected file, user will re-upload if needed
    setShowPopup(true);
    setOpenMenuId(null); // Close the menu
    setError(null);
  };

  return (
    <div className="add-category-business-page">
      <Navbar />

      {/* Wrap main content with a container that will be blurred if the popup is active */}
      <div
        className={`page-content${
          showPopup || showDeleteConfirm ? " blurred" : ""
        }`}
      >
        {/* Sidebar */}

        {/* Main content area */}
        <div className="add-category-business-content">
          {/* Header: Page title and Add My Store button */}
          <div className="add-category-business-header">
            <h1 className="page-title">Add Category</h1>
            <button
              className="add-subcategory-button"
              onClick={handleOpenPopup}
              disabled={isLoading}
            >
              <FaPlus className="plus-icon" />
              Add Category
            </button>
          </div>

          {/* Subheading */}
          <h2 className="categories-heading">Categories</h2>

          {/* Success message */}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          {/* Loading message */}
          {isLoading && !showPopup && !showDeleteConfirm && (
            <div className="loading-message">Loading categories...</div>
          )}

          {/* Error message */}
          {error && !showPopup && !showDeleteConfirm && (
            <div className="error-message">{error}</div>
          )}

          {/* Categories grid */}
          <div className="categories-grid">
            {categories.length > 0 ? (
              categories.map((item, index) => (
                <div className="category-card" key={item.id || index}>
                  {/* Three dots menu */}
                  <div className="category-menu">
                    <button
                      className="menu-button"
                      onClick={(e) => toggleMenu(e, item.id)}
                    >
                      <FaEllipsisV />
                    </button>
                    {/* Dropdown menu */}
                    {openMenuId === item.id && (
                      <div className="dropdown-menu">
                        <button onClick={(e) => handleEditClick(e, item)}>
                          Modify
                        </button>
                        <button onClick={(e) => confirmDelete(e, item.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {pageStatus === "market" && item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="category-image"
                    />
                  )}
                  <p className="category-label">{item.name}</p>
                </div>
              ))
            ) : !isLoading ? (
              <div className="no-categories">
                No categories found. Add your first category!
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Modal (Pop-up) */}
      {showPopup && (
        <div className="popup-overlay" onClick={handleClosePopup}>
          <div className="popup-content" onClick={stopPropagation}>
            <h2 className="popup-title">
              {editingCategory ? "Modify Category" : "Add New Category"}
            </h2>

            {/* Error message in popup */}
            {error && <div className="error-message popup-error">{error}</div>}

            {/* Form Fields */}
            <div className="form-group">
              <label htmlFor="categoryName" className="input-label">
                Category Name
              </label>
              <input
                id="categoryName"
                type="text"
                className="text-input"
                placeholder="Enter category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Conditional Upload Photo section */}
            {pageStatus === "market" && (
              <div className="form-group">
                <label className="input-label">Upload Photo</label>
                <div className="upload-section">
                  {/* Upload placeholder displays the image preview at the designated size */}
                  <div className="upload-photo-placeholder">
                    {selectedImage && (
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="uploaded-image"
                      />
                    )}
                  </div>
                  {/* "Add" button triggers file selection */}
                  <div
                    className="upload-add-box"
                    onClick={handleUploadClick}
                    style={{
                      opacity: isLoading ? 0.7 : 1,
                      cursor: isLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    <FaPlus className="upload-add-icon" />
                    <span>Add</span>
                  </div>
                </div>
              </div>
            )}

            {/* Save button - centered */}
            <div className="popup-actions">
              <button
                className="save-button"
                onClick={handleSaveCategory}
                disabled={isLoading}
              >
                {isLoading
                  ? "Saving..."
                  : editingCategory
                  ? "Save Changes"
                  : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="delete-modal-overlay" onClick={cancelDelete}>
          <div className="delete-modal-content" onClick={stopPropagation}>
            <h2 className="delete-modal-title">Confirm Deletion</h2>
            <p className="delete-modal-message">
              Are you sure you want to delete this category? This action cannot
              be undone.
            </p>

            <div className="delete-modal-actions">
              <button
                className="delete-modal-cancel-button"
                onClick={cancelDelete}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="delete-modal-confirm-button"
                onClick={handleDeleteCategory}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCategoryBusiness;
