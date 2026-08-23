export interface ProductVariantsApiResponse {
  success: boolean;
  message: string;
  data: ProductVariant[];
}

export interface ProductVariantDetailsApiResponse {
  success: boolean;
  message: string;
  data: ProductVariantDetails;
  pagination: null;
  errors: unknown;
}

export interface CategoriesApiResponse {
  success: boolean;
  message: string;
  data: Category[];
  pagination: null;
  errors: unknown;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  productCount: number;
}

export interface ProductVariantImage {
  id: number;
  imageUrl: string;
  isMain: boolean;
}

export interface ProductVariant {
  id: number;
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  isInStock: boolean;
  images: ProductVariantImage[];
}

export interface ProductVariantDetails {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  isInStock: boolean;
  images: ProductVariantImage[];
}

export interface ProductVariantReview {
  id: number;
  productId: number;
  productVariantId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ProductVariantReviewsApiResponse {
  success: boolean;
  message: string;
  data: ProductVariantReview[];
  pagination: null;
  errors: unknown;
}

export interface ProductVariantReviewMutationResponse {
  success: boolean;
  message: string;
  data: ProductVariantReview;
  pagination: null;
  errors: unknown;
}

export interface DeleteReviewResponse {
  success: boolean;
  message: string;
  data: null;
  pagination: null;
  errors: unknown;
}

export interface CreateProductVariantReviewRequest {
  rating: number;
  comment: string;
}

export type UpdateProductVariantReviewRequest = CreateProductVariantReviewRequest;

export interface ShopProduct {
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  variants: ProductVariant[];
  representativeVariants: ProductVariant[];
  defaultVariant: ProductVariant;
  availableColors: string[];
  availableSizes: string[];
  isInStock: boolean;
}

export interface ShopFilters {
  search: string;
  categoryId: number | null;
  color: string | null;
  size: string | null;
  inStockOnly: boolean;
}

export type ShopSortOption = 'newest' | 'price' | 'name';
export type ShopSortDirection = 'asc' | 'desc';

export interface FilterOption<T> {
  label: string;
  value: T;
}

export interface WishlistItem {
  id: number;
  productVariantId: number;
  productId: number;
  productName: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  salePrice: number | null;
  mainImageUrl: string;
  addedAt: string;
}

export interface WishlistData {
  wishlistId: number;
  items: WishlistItem[];
}

export interface WishlistMutationResponse {
  success: boolean;
  message: string;
  data: WishlistData;
  pagination: null;
  errors: unknown;
}

export interface AddCartItemRequest {
  productVariantId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productVariantId: number;
  sku: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  mainImageUrl: string;
}

export interface CartData {
  cartId: number;
  items: CartItem[];
  total: number;
}

export interface CartMutationResponse {
  success: boolean;
  message: string;
  data: CartData;
  pagination: null;
  errors: unknown;
}
