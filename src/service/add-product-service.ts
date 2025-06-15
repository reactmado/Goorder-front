import axiosInstance from "../api/api";

// Types
export interface Category {
  id: number;
  name: string;
  businessId: string;
  parentCategoryId: number | null; // Changed to allow null for top-level categories
  image: string;
  subCategories: string[]; // This might be an array of category names or simplified representation.
}

export interface SubCategory {
  categoryId: number; // Renamed for clarity in some contexts if it refers to the subcategory's own ID
  categoryName: string;
  categoryImage: string;
  businessId: string;
  parentCategoryId: number;
  products: Product[];
  subCategories: string[]; // This might be an array of category names or simplified representation.
}

export interface ProductImage {
  url: string;
}

export interface ProductVariant {
  id: number;
  price: number;
  image: string; // URL of the image
  stock: number;
  color: string;
  size: string;
  weight: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  stock: number;
  category: { id: number; name: string }; // Simplified category object in Product
  businessId: string;
  images: ProductImage[];
  variants: ProductVariant[];
  ingredients: any[]; // Consider defining a proper interface for Ingredient
}

export interface Variant {
  id: number;
  price: number;
  image: string | File; // Can be a File object for new uploads or a string (URL) for existing
  stock: number;
  color: string;
  size: string;
  weight: string;
}

export interface NewProduct {
  name: string;
  categoryId: number;
  price: number;
  stock: number;
  variants: Variant[];
  images: Array<string | File>; // Can be File objects for new uploads or strings (URLs) for existing
}

export interface UpdateProductDto {
  id?: number; // Include ID for update operations
  name?: string;
  categoryId?: number;
  price?: number;
  stock?: number;
  // Potentially add fields for images and variants if your PUT endpoint supports updating them
  // For now, assuming only basic product details are updated
}

/**
 * Service class for product-related API operations
 */
class ProductService {
  /**
   * Fetch all categories for a business
   * @returns Promise with categories array
   */
  async getCategories(): Promise<Category[]> {
    const businessId = localStorage.getItem("id");
    if (!businessId) {
      throw new Error("Business ID not found in local storage");
    }

    const response = await axiosInstance.get(
      `/api/Category?businessId=${businessId}`
    );
    return response.data;
  }

  /**
   * Fetch subcategories for a specific parent category
   * @param parentId The ID of the parent category
   * @returns Promise with subcategories array
   */
  async getSubCategories(parentId: number): Promise<SubCategory[]> {
    const response = await axiosInstance.get(
      `/api/Category/subCategories/${parentId}`
    );
    return response.data;
  }

  /**
   * Fetch all products for a business or a specific category
   * @param categoryId Optional category ID to filter products
   * @returns Promise with products array
   */
  async getProducts(categoryId?: number): Promise<Product[]> {
    const businessId = localStorage.getItem("id");
    if (!businessId) {
      throw new Error("Business ID not found in local storage");
    }

    const params = new URLSearchParams({
      businessId: businessId,
    });

    if (categoryId) {
      params.append("CategoryId", categoryId.toString());
    }

    const response = await axiosInstance.get(
      `/api/Product?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Fetch a specific product by ID
   * @param productId The ID of the product to fetch
   * @returns Promise with the product details
   */
  async getProductById(productId: number): Promise<Product> {
    const response = await axiosInstance.get(`/api/Product/${productId}`);
    return response.data;
  }

  /**
   * Add a new product
   * @param product The product data to add
   * @returns Promise with the created product
   */
  async addProduct(product: NewProduct): Promise<Product> {
    const businessId = localStorage.getItem("id");
    if (!businessId) {
      throw new Error("Business ID not found in local storage");
    }

    // Create FormData for multipart/form-data submission
    const formData = new FormData();

    // Add business ID to form data
    formData.append("businessId", businessId);

    // Add basic product information to form data
    formData.append("Name", product.name);
    formData.append("CategoryId", product.categoryId.toString());
    formData.append("Price", product.price.toString());
    formData.append("Stock", product.stock.toString());

    // Add product images to form data
    product.images.forEach((image) => {
      if (image instanceof File) {
        formData.append("Images", image);
      }
      // If image is a string (URL of existing image), you might need a different handling
      // or ensure your backend understands existing URLs differently than new files.
      // For now, assuming new images are always File objects.
    });

    // Process variants
    product.variants.forEach((variant, index) => {
      // Ensure variant ID is sent if it exists (for pre-existing variants if updating)
      // For new variants, backend might assign ID, or use a temporary client-side ID like Date.now()
      if (variant.id) {
        formData.append(`Variants[${index}].id`, variant.id.toString());
      }
      formData.append(`Variants[${index}].price`, variant.price.toString());
      formData.append(`Variants[${index}].stock`, variant.stock.toString());

      if (variant.color) {
        formData.append(`Variants[${index}].color`, variant.color);
      }

      if (variant.size) {
        formData.append(`Variants[${index}].size`, variant.size);
      }

      if (variant.weight) {
        formData.append(`Variants[${index}].weight`, variant.weight);
      }

      // Handle variant image
      if (variant.image instanceof File) {
        formData.append(`Variants[${index}].Image`, variant.image);
      } else if (typeof variant.image === "string" && variant.image) {
        formData.append(`Variants[${index}].Image`, variant.image);
      } else {
        // Set default image if none provided or a placeholder if required by API
        // formData.append(`Variants[${index}].Image`, "default_image_url_or_placeholder");
      }
    });

    // Override the default content-type header for FormData
    const response = await axiosInstance.post("/api/Product", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  /**
   * Update an existing product
   * @param productId The ID of the product to update
   * @param productData The updated product data (only basic fields for now)
   * @returns Promise with the updated product
   */
  async updateProduct(
    productId: number,
    productData: UpdateProductDto
  ): Promise<Product> {
    // The API documentation shows a PUT endpoint /api/Product/{productId}
    // that accepts a JSON body with name, categoryId, price, stock.
    // If you need to update images or variants, your API would need dedicated endpoints or a more complex DTO.
    const response = await axiosInstance.put(
      `/api/Product/${productId}`,
      productData
    );
    return response.data;
  }

  /**
   * Delete a product
   * @param productId The ID of the product to delete
   * @returns Promise resolving when the product is deleted
   */
  async deleteProduct(productId: number): Promise<void> {
    await axiosInstance.delete(`/api/Product/${productId}`);
  }

  /**
   * Get authentication details from localStorage
   * @returns Object containing token and businessId
   */
  getAuthDetails() {
    const token = localStorage.getItem("token");
    const businessId = localStorage.getItem("id");
    return { token, businessId };
  }
}

// Create and export a singleton instance
const productService = new ProductService();
export default productService;