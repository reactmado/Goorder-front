import React, { useState, useEffect, useRef } from "react";
import Sidebar_2 from "../../components/Sidebar_2/Sidebar_2";
import Navbar from "../../components/navbar copy/Navbar";
import { FaEllipsisV, FaArrowLeft } from "react-icons/fa"; // Import FaArrowLeft for new back button style

import "../../styles/add-product-business_1.css";
import productService, {
  Category,
  SubCategory,
  Product,
  Variant,
  NewProduct,
  UpdateProductDto,
} from "../../service/add-product-service";

interface EditProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productId: number, data: UpdateProductDto) => Promise<void>;
  isLoading: boolean;
  product: Product | null;
}

const EditProductForm: React.FC<EditProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  product,
}) => {
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price || 0);
  const [stock, setStock] = useState(product?.stock || 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && product) {
      setName(product.name);
      setPrice(product.price);
      setStock(product.stock);
      setError(null);
    }
  }, [isOpen, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (price <= 0) {
      setError("Price must be greater than 0.");
      return;
    }
    if (stock < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    setError(null);
    try {
      await onSubmit(product.id, { name, price, stock });
      onClose(); // Close on successful submission
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content new-modal-design"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Edit Product</h2>
          <button type="button" className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label htmlFor="edit-name">Product Name</label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-price">Price</label>
            <input
              type="number"
              id="edit-price"
              name="price"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              step="0.01"
              min="0"
              placeholder="0.00"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-stock">Stock</label>
            <input
              type="number"
              id="edit-stock"
              name="stock"
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value))}
              min="0"
              placeholder="0"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Product"}
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
      <div
        className="modal-content new-modal-design delete-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Confirm Deletion</h2>
          <button type="button" className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <p className="delete-modal-message">
          Are you sure you want to delete "<strong>{itemName}</strong>"? This
          action cannot be undone.
        </p>
        <div className="form-actions">
          <button
            className="cancel-button"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="submit-button delete-confirm-button"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AddProductBusiness_1: React.FC = () => {
  // Define states
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<
    number | null
  >(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddProductForm, setShowAddProductForm] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<
    "categories" | "subcategories" | "products"
  >("categories");

  // New product form state
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "", // Reset fields for new product
    categoryId: 0,
    price: 0,
    stock: 0,
    variants: [],
    images: [],
  });

  // State for edit product form
  const [showEditProductForm, setShowEditProductForm] =
    useState<boolean>(false);
  const [currentEditProduct, setCurrentEditProduct] = useState<Product | null>(
    null
  );

  // State for delete confirmation modal
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null); // State for three dots menu

  // Effect to close menu when clicking outside
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close menu if click is outside the menu and not on a menu button
      const target = event.target as HTMLElement;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        !target.closest(".menu-button")
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const categoriesData = await productService.getCategories();
      setCategories(categoriesData);
      setLoading(false);
      setViewMode("categories");
      setSelectedCategoryId(null);
      setSelectedSubCategoryId(null);
      setSelectedCategoryName("");
      setProducts([]);
      setSubCategories([]);
      setOpenMenuId(null); // Close any open menu when changing view
    } catch (err) {
      setError("Failed to fetch categories");
      setLoading(false);
      console.error("Error fetching categories:", err);
    }
  };

  // Fetch subcategories for a specific parent category
  const fetchSubCategories = async (parentId: number) => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const subCategoriesData = await productService.getSubCategories(parentId);
      setSubCategories(subCategoriesData);
      setSelectedCategoryId(parentId);
      setSelectedSubCategoryId(null); // Reset subcategory ID when viewing subcategories
      setLoading(false);

      // Find parent category name for the title
      const parentCategory = categories.find((cat) => cat.id === parentId);
      const parentName = parentCategory ? parentCategory.name : "";
      setSelectedCategoryName(parentName);

      setOpenMenuId(null); // Close any open menu when changing view

      // Check if there are subcategories
      if (subCategoriesData.length > 0) {
        setViewMode("subcategories");
      } else {
        // If no subcategories, fetch products directly
        fetchProducts(parentId);
      }
    } catch (err) {
      setError("Failed to fetch subcategories");
      setLoading(false);
      console.error("Error fetching subcategories:", err);
    }
  };

  // Fetch products for a specific category or subcategory
  const fetchProducts = async (categoryId: number) => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const productsData = await productService.getProducts(categoryId);
      setProducts(productsData);
      setLoading(false);
      setViewMode("products");
      setOpenMenuId(null); // Close any open menu when changing view
    } catch (err) {
      setError("Failed to fetch products");
      setLoading(false);
      console.error("Error fetching products:", err);
    }
  };

  // Handle category click
  const handleCategoryClick = (categoryId: number, categoryName: string) => {
    setSelectedCategoryName(categoryName);
    fetchSubCategories(categoryId);
  };

  // Handle subcategory click
  const handleSubcategoryClick = (
    subCategoryId: number,
    subCategoryName: string
  ) => {
    setSelectedSubCategoryId(subCategoryId); // Store the selected subcategory ID
    setSelectedCategoryName(subCategoryName); // Update for product view title
    fetchProducts(subCategoryId);
  };

  // Open edit product form
  const handleEditClick = (product: Product) => {
    setCurrentEditProduct(product);
    setShowEditProductForm(true);
    setOpenMenuId(null); // Close three dots menu
  };

  // Submit edit product
  const handleSubmitEditProduct = async (
    productId: number,
    productData: UpdateProductDto
  ) => {
    try {
      setLoading(true);
      await productService.updateProduct(productId, productData);
      alert("Product updated successfully!");
      setShowEditProductForm(false);
      setCurrentEditProduct(null);

      // Refresh products in the current view
      const currentCategoryId = selectedSubCategoryId || selectedCategoryId;
      if (currentCategoryId) {
        await fetchProducts(currentCategoryId);
      }
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation modal
  const handleDeleteClick = (product: Product) => {
    setProductToDelete({ id: product.id, name: product.name });
    setShowDeleteConfirmation(true);
    setOpenMenuId(null); // Close three dots menu
  };

  // Confirm delete product
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setLoading(true);
      await productService.deleteProduct(productToDelete.id);
      alert("Product deleted successfully!");
      setShowDeleteConfirmation(false);
      setProductToDelete(null);

      // Refresh products in the current view
      const currentCategoryId = selectedSubCategoryId || selectedCategoryId;
      if (currentCategoryId) {
        await fetchProducts(currentCategoryId);
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Open add product form
 
 
  // Handle input change for the new product form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: name === "price" || name === "stock" ? parseFloat(value) : value,
    });
  };

  // Add a new variant to the product
  const addVariant = () => {
    const newVariant: Variant = {
      id: Date.now(), // Use timestamp for unique ID
      price: 0,
      image: "",
      stock: 0,
      color: "",
      size: "",
      weight: "",
    };
    setNewProduct({
      ...newProduct,
      variants: [...newProduct.variants, newVariant],
    });
  };

  // Handle variant input change
  const handleVariantChange = (
    index: number,
    field: keyof Variant,
    value: string | number | File
  ) => {
    const updatedVariants = [...newProduct.variants];
    if (field === "price" || field === "stock") {
      updatedVariants[index][field] = parseFloat(value as string);
    } else if (field === "id") {
      updatedVariants[index][field] = Number(value);
    } else if (field === "image") {
      if (value instanceof File) {
        updatedVariants[index][field] = value as File & string;
      } else {
        updatedVariants[index][field] = value as string;
      }
    } else {
      updatedVariants[index][field as "color" | "size" | "weight"] =
        value as string;
    }

    setNewProduct({
      ...newProduct,
      variants: updatedVariants,
    });
  };

  // Handle file input change for product images
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (index !== undefined) {
      // For variant image
      handleVariantChange(index, "image", file);
    } else {
      // For product images
      const updatedImages = [...newProduct.images];
      updatedImages.push(file);
      setNewProduct({
        ...newProduct,
        images: updatedImages,
      });
    }
  };

  // Remove an image from product images
  const removeImage = (index: number) => {
    const updatedImages = [...newProduct.images];
    updatedImages.splice(index, 1);
    setNewProduct({
      ...newProduct,
      images: updatedImages,
    });
  };

  // Submit new product - Using the service
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await productService.addProduct(newProduct);
      alert("Product added successfully!");
      setNewProduct({
        name: "",
        categoryId: 0,
        price: 0,
        stock: 0,
        variants: [],
        images: [],
      });
      setShowAddProductForm(false);
      setLoading(false);

      // Refresh products in the current view - use the correct ID
      const currentCategoryId = selectedSubCategoryId || selectedCategoryId;
      if (currentCategoryId) {
        await fetchProducts(currentCategoryId);
      }
    } catch (err: unknown) {
      setLoading(false);
      let errorMessage =
        "Failed to add product. Please check your inputs and try again.";
      if (err && typeof err === "object") {
        if ("response" in err) {
          const errorResponse = err as {
            response: { status: number; data: unknown };
          };
          console.error("Response error:", {
            status: errorResponse.response.status,
            data: errorResponse.response.data,
          });
          if (typeof errorResponse.response.data === "string") {
            errorMessage = `Error ${errorResponse.response.status}: ${errorResponse.response.data}`;
          } else if (typeof errorResponse.response.data === "object") {
            const errorData = JSON.stringify(errorResponse.response.data);
            errorMessage = `Error ${errorResponse.response.status}: ${errorData}`;
          }
        } else if ("request" in err) {
          errorMessage =
            "No response received from server. Please check your internet connection.";
        } else if (
          "message" in err &&
          typeof (err as { message: string }).message === "string"
        ) {
          errorMessage = `Error: ${(err as { message: string }).message}`;
        }
      }
      setError(errorMessage);
      console.error("Full error object:", err);
    }
  };

  // Remove a variant
  const removeVariant = (index: number) => {
    const updatedVariants = [...newProduct.variants];
    updatedVariants.splice(index, 1);
    setNewProduct({
      ...newProduct,
      variants: updatedVariants,
    });
  };

  // Go back to categories from current view
  const backToCategories = () => {
    fetchCategories(); // Re-fetch categories to ensure data is fresh
  };

  // Go back to subcategories from products view
  const backToSubcategories = () => {
    if (selectedCategoryId) {
      fetchSubCategories(selectedCategoryId);
    } else {
      backToCategories();
    }
  };

  // Render products list
  const renderProducts = () => {
    return (
      <>
        <div className="subcategory-header">
          <h2 className="categories-heading">
            Products {selectedCategoryName ? `- ${selectedCategoryName}` : ""}
          </h2>
          <div className="header-actions">
            {viewMode === "products" && selectedSubCategoryId && (
              <button className="back-to-button" onClick={backToSubcategories}>
                <FaArrowLeft /> Back to Subcategories
              </button>
            )}
            {viewMode === "products" && (
              <button className="back-to-button" onClick={backToCategories}>
                <FaArrowLeft /> Back to Categories
              </button>
            )}
         
          </div>
        </div>

        <div className="categories-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="category-card">
                <img
                  src={
                    product.images && product.images.length > 0
                      ? product.images[0].url
                      : "/placeholder.png"
                  }
                  alt={product.name}
                  className="category-image"
                />
                <p className="category-label">{product.name}</p>
                <p className="product-price">${product.price.toFixed(2)}</p>
                <p className="product-stock">Stock: {product.stock}</p>
                <p className="product-rating">Rating: {product.rating}/5</p>
                {product.variants && product.variants.length > 0 && (
                  <span className="has-variants">
                    {product.variants.length} variants
                  </span>
                )}
                <div className="product-actions">
                  <button
                    className="menu-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(
                        openMenuId === product.id ? null : product.id
                      );
                    }}
                  >
                    <FaEllipsisV />
                  </button>
                  {openMenuId === product.id && (
                    <div className="dropdown-menu" ref={menuRef}>
                      <button onClick={() => handleEditClick(product)}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteClick(product)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-items-message">
              No products found in this category.
            </p>
          )}
        </div>
      </>
    );
  };

  // Render subcategories
  const renderSubcategories = () => {
    return (
      <>
        <div className="subcategory-header">
          <h2 className="categories-heading">
            Subcategories of {selectedCategoryName}
          </h2>
          <div className="header-actions">
            <button className="back-to-button" onClick={backToCategories}>
              <FaArrowLeft /> Back to Categories
            </button>
       
          </div>
        </div>

        <div className="categories-grid">
          {subCategories.length > 0 ? (
            subCategories.map((subCategory) => (
              <div
                key={subCategory.categoryId}
                className="category-card"
                onClick={() =>
                  handleSubcategoryClick(
                    subCategory.categoryId,
                    subCategory.categoryName
                  )
                }
              >
                <img
                  src={subCategory.categoryImage || "/placeholder.png"}
                  alt={subCategory.categoryName}
                  className="category-image"
                />
                <p className="category-label">{subCategory.categoryName}</p>
                <button className="view-button">View Products</button>
              </div>
            ))
          ) : (
            <p className="no-items-message">
              No subcategories found. You can add a product directly to this
              category.
            </p>
          )}
        </div>
      </>
    );
  };

  // Render categories
  const renderCategories = () => {
    return (
      <>
        <h2 className="categories-heading">Categories</h2>
        <div className="categories-grid">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category.id}
                className="category-card"
                onClick={() => handleCategoryClick(category.id, category.name)}
              >
                <img
                  src={category.image || "/placeholder.png"}
                  alt={category.name}
                  className="category-image"
                />
                <p className="category-label">{category.name}</p>
                {category.subCategories &&
                  category.subCategories.length > 0 && (
                    <span className="has-subcategories">Has subcategories</span>
                  )}
              </div>
            ))
          ) : (
            <p className="no-items-message">
              No categories found. Click "Add New Category" to create your first
              one.
            </p>
          )}
        </div>
      </>
    );
  };

  // Render content based on current view mode
  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button
            className="retry-button"
            onClick={
              viewMode === "categories"
                ? fetchCategories
                : () =>
                    selectedCategoryId
                      ? fetchSubCategories(selectedCategoryId)
                      : fetchCategories()
            }
          >
            Retry
          </button>
        </div>
      );
    }

    switch (viewMode) {
      case "products":
        return renderProducts();
      case "subcategories":
        return renderSubcategories();
      case "categories":
      default:
        return renderCategories();
    }
  };

  return (
    <div className="add-category-business-page">
      <Navbar />

      {/* Main content container */}
      <div
        className={`page-content ${
          showAddProductForm || showEditProductForm || showDeleteConfirmation
            ? "blurred"
            : ""
        }`}
      >
        {/* Sidebar */}
        <Sidebar_2 />

        {/* Main content area */}
        <div className="add-category-business-content">
          {/* Header */}
          <div className="add-category-business-header">
            <h1 className="page-title">
              {viewMode === "products"
                ? "View Products"
                : viewMode === "subcategories"
                ? "Select Subcategory"
                : "Select Category"}
            </h1>
          </div>

          {/* Main Content */}
          {renderContent()}

          {/* Add Product Form Modal */}
          {showAddProductForm && (
            <div className="modal-overlay">
              <div
                className="modal-content new-modal-design"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Add New Product</h2>
                  <button
                    className="close-button"
                    onClick={() => setShowAddProductForm(false)}
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleSubmitProduct} className="modal-form">
                  <div className="form-group">
                    <label htmlFor="name">Product Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newProduct.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="stock">Stock</label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={newProduct.stock}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="0"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Product Images */}
                  <div className="form-section">
                    <h3>Product Images</h3>
                    <div className="file-upload-container">
                      <label
                        htmlFor="product-image"
                        className="file-upload-label"
                      >
                        <span>Upload Product Image</span>
                      </label>
                      <input
                        type="file"
                        id="product-image"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-input"
                        disabled={loading}
                      />
                    </div>

                    {newProduct.images.length > 0 && (
                      <div className="image-preview-container">
                        {newProduct.images.map((image, index) => (
                          <div key={`image-${index}`} className="image-preview">
                            <div className="image-preview-content">
                              {image instanceof File ? (
                                <div className="file-name">
                                  {image.name}
                                  <button
                                    type="button"
                                    className="remove-image"
                                    onClick={() => removeImage(index)}
                                  >
                                    &times;
                                  </button>
                                </div>
                              ) : (
                                <div className="url-name">
                                  {typeof image === "string" ? image : ""}
                                  <button
                                    type="button"
                                    className="remove-image"
                                    onClick={() => removeImage(index)}
                                  >
                                    &times;
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Variants */}
                  <div className="form-section">
                    <h3>Variants</h3>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="add-button"
                      disabled={loading}
                    >
                      Add Variant
                    </button>

                    {newProduct.variants.map((variant, vIndex) => (
                      <div key={`variant-${vIndex}`} className="variant-item">
                        <div className="variant-header">
                          <h4>Variant #{vIndex + 1}</h4>
                          <button
                            type="button"
                            className="remove-variant"
                            onClick={() => removeVariant(vIndex)}
                            disabled={loading}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="form-group">
                          <label htmlFor={`variant-price-${vIndex}`}>
                            Price
                          </label>
                          <input
                            type="number"
                            id={`variant-price-${vIndex}`}
                            value={variant.price}
                            onChange={(e) =>
                              handleVariantChange(
                                vIndex,
                                "price",
                                e.target.value
                              )
                            }
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            required
                            disabled={loading}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`variant-stock-${vIndex}`}>
                            Stock
                          </label>
                          <input
                            type="number"
                            id={`variant-stock-${vIndex}`}
                            value={variant.stock}
                            onChange={(e) =>
                              handleVariantChange(
                                vIndex,
                                "stock",
                                e.target.value
                              )
                            }
                            min="0"
                            placeholder="0"
                            required
                            disabled={loading}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`variant-color-${vIndex}`}>
                            Color
                          </label>
                          <input
                            type="text"
                            id={`variant-color-${vIndex}`}
                            value={variant.color}
                            onChange={(e) =>
                              handleVariantChange(
                                vIndex,
                                "color",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Red"
                            disabled={loading}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`variant-size-${vIndex}`}>Size</label>
                          <input
                            type="text"
                            id={`variant-size-${vIndex}`}
                            value={variant.size}
                            onChange={(e) =>
                              handleVariantChange(
                                vIndex,
                                "size",
                                e.target.value
                              )
                            }
                            placeholder="e.g., M, Large"
                            disabled={loading}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`variant-weight-${vIndex}`}>
                            Weight
                          </label>
                          <input
                            type="text"
                            id={`variant-weight-${vIndex}`}
                            value={variant.weight}
                            onChange={(e) =>
                              handleVariantChange(
                                vIndex,
                                "weight",
                                e.target.value
                              )
                            }
                            placeholder="e.g., 100g, 1kg"
                            disabled={loading}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`variant-image-${vIndex}`}>
                            Variant Image
                          </label>
                          <input
                            type="file"
                            id={`variant-image-${vIndex}`}
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, vIndex)}
                            className="file-input"
                            required
                            disabled={loading}
                          />
                          {variant.image instanceof File && (
                            <div className="file-name">
                              {variant.image.name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={loading}
                    >
                      {loading ? "Adding..." : "Add Product"}
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setShowAddProductForm(false)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Product Form Modal */}
      <EditProductForm
        isOpen={showEditProductForm}
        onClose={() => setShowEditProductForm(false)}
        onSubmit={handleSubmitEditProduct}
        isLoading={loading}
        product={currentEditProduct}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDeleteProduct}
        itemName={productToDelete?.name || ""}
        isLoading={loading}
      />
    </div>
  );
};

export default AddProductBusiness_1;