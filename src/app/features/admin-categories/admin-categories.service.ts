import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/services/auth.service';
import {
  AdminCategoryDeleteResponse,
  AdminCategoryMutationRequest,
  AdminCategoryMutationResponse,
} from './admin-categories.models';

@Injectable({
  providedIn: 'root',
})
export class AdminCategoriesService {
  private readonly httpClient = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiBaseUrl = this.normalizeBaseUrl(environment.baseUrl);

  createCategory(request: AdminCategoryMutationRequest): Observable<AdminCategoryMutationResponse> {
    return this.httpClient.post<AdminCategoryMutationResponse>(
      `${this.apiBaseUrl}Admin/Categories`,
      request,
      { headers: this.createAuthHeaders() },
    );
  }

  updateCategory(
    categoryId: number,
    request: AdminCategoryMutationRequest,
  ): Observable<AdminCategoryMutationResponse> {
    return this.httpClient.put<AdminCategoryMutationResponse>(
      `${this.apiBaseUrl}Admin/Categories/${categoryId}`,
      request,
      { headers: this.createAuthHeaders() },
    );
  }

  deleteCategory(categoryId: number): Observable<AdminCategoryDeleteResponse> {
    return this.httpClient.delete<AdminCategoryDeleteResponse>(
      `${this.apiBaseUrl}Admin/Categories/${categoryId}`,
      { headers: this.createAuthHeaders() },
    );
  }

  private createAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private normalizeBaseUrl(baseUrl: string): string {
    return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }
}
