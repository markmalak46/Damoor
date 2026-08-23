import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/services/auth.service';
import {
  CategoriesApiResponse,
  Category,
  CreateProductVariantReviewRequest,
  DeleteReviewResponse,
  ProductVariantDetails,
  ProductVariantDetailsApiResponse,
  ProductVariant,
  ProductVariantReview,
  ProductVariantReviewMutationResponse,
  ProductVariantReviewsApiResponse,
  ProductVariantsApiResponse,
  ShopProduct,
  UpdateProductVariantReviewRequest,
} from '../models/shop.models';
import { mapVariantsToShopProducts } from './shop-product.mapper';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private readonly httpClient = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiBaseUrl = this.normalizeBaseUrl(environment.baseUrl);

  getProducts(): Observable<ShopProduct[]> {
    return this.httpClient
      .get<ProductVariantsApiResponse>(`${this.apiBaseUrl}ProductVariants`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'We could not load the collection.');
          }

          return mapVariantsToShopProducts(response.data);
        }),
      );
  }

  getCategories(): Observable<Category[]> {
    return this.httpClient
      .get<CategoriesApiResponse>(`${this.apiBaseUrl}Categories`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'We could not load categories.');
          }

          return response.data;
        }),
      );
  }

  getProductVariants(): Observable<ProductVariant[]> {
    return this.httpClient
      .get<ProductVariantsApiResponse>(`${this.apiBaseUrl}ProductVariants`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'We could not load product variants.');
          }

          return response.data;
        }),
      );
  }

  getProductVariant(variantId: number): Observable<ProductVariantDetails> {
    return this.httpClient
      .get<ProductVariantDetailsApiResponse>(`${this.apiBaseUrl}ProductVariants/${variantId}`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'We could not load this product.');
          }

          return response.data;
        }),
      );
  }

  getProductVariantReviews(variantId: number): Observable<ProductVariantReview[]> {
    return this.httpClient
      .get<ProductVariantReviewsApiResponse>(`${this.apiBaseUrl}ProductVariants/${variantId}/reviews`, {
        headers: this.createAuthHeaders(),
      })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'We could not load reviews for this product.');
          }

          return response.data;
        }),
      );
  }

  createProductVariantReview(
    variantId: number,
    request: CreateProductVariantReviewRequest,
  ): Observable<ProductVariantReviewMutationResponse> {
    return this.httpClient.post<ProductVariantReviewMutationResponse>(
      `${this.apiBaseUrl}ProductVariants/${variantId}/reviews`,
      request,
      { headers: this.createAuthHeaders() },
    );
  }

  updateProductVariantReview(
    variantId: number,
    reviewId: number,
    request: UpdateProductVariantReviewRequest,
  ): Observable<ProductVariantReviewMutationResponse> {
    return this.httpClient.put<ProductVariantReviewMutationResponse>(
      `${this.apiBaseUrl}ProductVariants/${variantId}/reviews/${reviewId}`,
      request,
      { headers: this.createAuthHeaders() },
    );
  }

  deleteReview(reviewId: number): Observable<DeleteReviewResponse> {
    return this.httpClient.delete<DeleteReviewResponse>(`${this.apiBaseUrl}Reviews/${reviewId}`, {
      headers: this.createAuthHeaders(),
    });
  }

  private createAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private normalizeBaseUrl(baseUrl: string): string {
    return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }
}
