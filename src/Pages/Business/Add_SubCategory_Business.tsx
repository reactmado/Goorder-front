import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/navbar copy/Navbar";
import { FaEllipsisV, FaPlus, FaArrowLeft } from "react-icons/fa"; // Added FaArrowLeft
import {
  CategoryService,
  Category,
  SubCategory,
  CategoryFormData,
} from "../../service/Add_SubCategory_Business_service";
import "../../styles/Add_SubCategory_Business.css";

// --- CategoryFormModal Component ---
interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData, id?: number) => void;
  isLoading: boolean;
  editingItem: Category | SubCategory | null;
  parentCategoryId?: number | null;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  editingItem,
  parentCategoryId,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
      
      if (editingItem) {
        setCategoryName(
          "name" in editingItem ? editingItem.name : editingItem.categoryName
        );
        setImagePreview(
          "image" in editingItem ? editingItem.image : editingItem.categoryImage
        );
        setSelectedFile(null);
      } else {
        setCategoryName("");
        setSelectedFile(null);
        setImagePreview(null);
      }
    }
  }, [isOpen, editingItem]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      if (!editingItem) {
        setImagePreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setError("Category name is required.");
      return;
    }
    setError(null);

    const data: CategoryFormData = {
      name: categoryName.trim(),
      image: selectedFile || undefined,
    };

    if (parentCategoryId !== null && parentCategoryId !== undefined) {
      data.parentCategoryId = parentCategoryId;
    }

    try {
      if (editingItem) {
        const id =
          "id" in editingItem ? editingItem.id : editingItem.categoryId;
        await onSubmit(data, id);
      } else {
        await onSubmit(data);
      }
      handleClose();
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCategoryName("");
      setSelectedFile(null);
      setImagePreview(null);
      setError(null);
      setIsAnimating(false);
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isAnimating ? 'animating' : ''}`} onClick={handleClose}>
      <div className={`modal-content ${isAnimating ? 'modal-animating' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-centered">
          <button type="button" className="modal-back-button" onClick={handleClose}>
            <FaArrowLeft />
          </button>
          <h2 className="modal-title">
            {editingItem ? "Edit Category" : parentCategoryId ? "Add Subcategory" : "Add Category"}
          </h2>
          <div className="modal-header-spacer"></div>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-notification">
              <span className="error-icon">⚠️</span>
              <p className="error-message">{error}</p>
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">
              <span className="label-text">Category Name</span>
              <span className="label-required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name..."
                required
                disabled={isLoading}
                className="form-input"
              />
              <div className="input-underline"></div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-text">Upload Photo</span>
            </label>
            <div className="image-upload-section">
              <div className="image-preview-container">
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <div className="image-overlay">
                      <span>Change</span>
                    </div>
                  </div>
                ) : (
                  <div className="image-placeholder">
                    <div className="placeholder-icon">📷</div>
                    <span>No image</span>
                  </div>
                )}
              </div>
              
              <button
                type="button"
                className="upload-button-enhanced"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  disabled={isLoading}
                  ref={fileInputRef}
                />
                <div className="upload-icon">📤</div>
                <span>{imagePreview ? "Change Photo" : "Upload Photo"}</span>
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-button-enhanced" 
              disabled={isLoading || !categoryName.trim()}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingItem ? "Update Category" : "Create Category"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- DeleteConfirmationModal Component ---
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  isLoading: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <div className="delete-icon">🗑️</div>
          <h2 className="delete-modal-title">Confirm Deletion</h2>
        </div>
        
        <div className="delete-modal-body">
          <p className="delete-modal-message">
            Are you sure you want to delete <strong>"{itemName}"</strong>?
          </p>
          <p className="delete-modal-warning">
            This action cannot be undone and will permanently remove this item.
          </p>
        </div>

        <div className="delete-modal-actions">
          <button
            className="delete-modal-cancel-button"
            onClick={onClose}
            disabled={isLoading}
          >
            Keep Item
          </button>
          <button
            className="delete-modal-confirm-button"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner-small"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Forever</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- AddSubCategoryBusiness Main Component ---
const AddSubCategoryBusiness: React.FC = () => {
  const [categories, setCategories] = useState<(Category | SubCategory)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [pageTitle, setPageTitle] = useState("Categories");
  const [isViewingSubcategories, setIsViewingSubcategories] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | SubCategory | null>(null);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const businessId = localStorage.getItem("id");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".dropdown-menu") &&
        !target.closest(".menu-button")
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const fetchCategories = async () => {
    if (!businessId) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    setIsViewingSubcategories(false);
    setPageTitle("Categories");
    setSelectedCategoryId(null);
    setOpenMenuId(null);

    try {
      const data = await CategoryService.fetchCategories(businessId);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubcategories = async (parentId: number) => {
    setIsLoading(true);
    setHasError(false);
    setIsViewingSubcategories(true);
    setSelectedCategoryId(parentId);
    setOpenMenuId(null);

    const parentCategory = categories.find(
      (cat) => getCategoryId(cat) === parentId
    );
    const parentName = parentCategory ? getCategoryName(parentCategory) : "";
    setPageTitle(parentName ? `${parentName} Subcategories` : "Subcategories");

    try {
      const data = await CategoryService.fetchSubcategories(parentId);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrEditCategorySubmit = async (
    data: CategoryFormData,
    id?: number
  ) => {
    setIsSavingCategory(true);
    try {
      if (id) {
        await CategoryService.updateCategory(id, data);
        alert("Category updated successfully!");
      } else {
        await CategoryService.addCategory(data);
        alert("Category added successfully!");
      }
      setIsFormModalOpen(false);
      setEditingItem(null);

      if (isViewingSubcategories && selectedCategoryId) {
        await fetchSubcategories(selectedCategoryId);
      } else {
        await fetchCategories();
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category. Please try again.");
    } finally {
      setIsSavingCategory(false);
    }
  };

  const confirmDeleteItem = (item: Category | SubCategory) => {
    const id = getCategoryId(item);
    const name = getCategoryName(item);
    setItemToDelete({ id, name });
    setIsDeleteConfirmModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteConfirmed = async () => {
    if (!itemToDelete) return;

    setIsLoading(true);
    try {
      await CategoryService.deleteCategory(itemToDelete.id);
      setIsDeleteConfirmModalOpen(false);
      setItemToDelete(null);
      alert("Category deleted successfully!");

      if (isViewingSubcategories && selectedCategoryId) {
        await fetchSubcategories(selectedCategoryId);
      } else {
        await fetchCategories();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (category: Category | SubCategory) => {
    if (!isViewingSubcategories) {
      const categoryId = getCategoryId(category);
      fetchSubcategories(categoryId);
    }
  };

  const handleEditClick = (item: Category | SubCategory) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
    setOpenMenuId(null);
  };

  const getCategoryImage = (category: Category | SubCategory): string => {
    return "image" in category ? category.image : category.categoryImage;
  };

  const getCategoryName = (category: Category | SubCategory): string => {
    return "name" in category ? category.name : category.categoryName;
  };

  const getCategoryId = (category: Category | SubCategory): number => {
    return "id" in category ? category.id : category.categoryId;
  };

  const handleRetry = () => {
    if (isViewingSubcategories && selectedCategoryId) {
      fetchSubcategories(selectedCategoryId);
    } else {
      fetchCategories();
    }
  };

  const toggleMenu = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === itemId ? null : itemId);
  };

  return (
    <div className="add-category-business-page">
      <Navbar />

      <div className={`page-content ${isFormModalOpen || isDeleteConfirmModalOpen ? "blurred" : ""}`}>

        <div className="add-category-business-content">
          <div className="add-category-business-header">
            <div className="header-left">
              {isViewingSubcategories && (
                <button
                  type="button"
                  className="back-button"
                  onClick={fetchCategories}
                >
                  <FaArrowLeft />
                </button>
              )}
              <h1 className="page-title">{pageTitle}</h1>
            </div>

            {isViewingSubcategories && (
              <div className="header-actions">
                <button
                  type="button"
                  className="add-subcategory-button"
                  onClick={() => {
                    setEditingItem(null);
                    setIsFormModalOpen(true);
                  }}
                  disabled={isSavingCategory || isLoading}
                >
                  <FaPlus className="plus-icon" />
                  Add Subcategory
                </button>
              </div>
            )}
          </div>

          {isLoading && !isSavingCategory && (
            <div className="loading-container">
              <div className="loading-spinner-enhanced"></div>
              <p className="loading-text">Loading categories...</p>
            </div>
          )}

          {hasError && !isLoading && (
            <div className="error-container">
              <div className="error-icon-large">❌</div>
              <p className="error-message">
                Failed to load categories. Please try again.
              </p>
              <button
                type="button"
                className="retry-button"
                onClick={handleRetry}
              >
                Try Again
              </button>
            </div>
          )}

          {!isLoading && !hasError && categories.length === 0 && (
            <div className="no-categories-message">
              <div className="empty-state-icon">📂</div>
              <h3 className="empty-state-title">
                No {isViewingSubcategories ? "subcategories" : "categories"} found
              </h3>
              <p className="empty-state-description">
                {!isViewingSubcategories 
                  ? "Create your first category to get started organizing your business." 
                  : "Add subcategories to better organize this category."}
              </p>
            </div>
          )}

          {!isLoading && !hasError && categories.length > 0 && (
            <div className="categories-grid">
              {categories.map((category, index) => (
                <div 
                  key={getCategoryId(category)} 
                  className="category-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {isViewingSubcategories && (
                    <div className="category-menu">
                      <button
                        className="menu-button"
                        onClick={(e) => toggleMenu(e, getCategoryId(category))}
                      >
                        <FaEllipsisV />
                      </button>
                      {openMenuId === getCategoryId(category) && (
                        <div className="dropdown-menu">
                          <button onClick={() => handleEditClick(category)}>
                            <span>✏️</span>
                            Modify
                          </button>
                          <button onClick={() => confirmDeleteItem(category)}>
                            <span>🗑️</span>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className="category-content"
                    onClick={() => handleCategoryClick(category)}
                    style={{
                      cursor: isViewingSubcategories ? "default" : "pointer",
                    }}
                  >
                    <img
                      src={getCategoryImage(category)}
                      alt={getCategoryName(category)}
                      className="category-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-image.png";
                      }}
                    />
                    <p className="category-label">
                      {getCategoryName(category)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleAddOrEditCategorySubmit}
        isLoading={isSavingCategory}
        editingItem={editingItem}
        parentCategoryId={isViewingSubcategories ? selectedCategoryId : null}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirmed}
        itemName={itemToDelete?.name || ""}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AddSubCategoryBusiness;