import { Category } from '../Shop/models/shop.models';

export interface AdminCategoryMutationRequest {
  name: string;
  description: string;
}

export interface AdminCategoryMutationData {
  id: number;
  name: string;
  description: string;
}

export interface AdminCategoryMutationResponse {
  success: boolean;
  message: string;
  data: AdminCategoryMutationData;
  pagination: null;
  errors: unknown;
}

export interface AdminCategoryDeleteResponse {
  success: boolean;
  message: string;
  data: null | Category;
  pagination: null;
  errors: unknown;
}
