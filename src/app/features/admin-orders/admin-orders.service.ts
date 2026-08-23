import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/services/auth.service';
import {
  AdminOrderDetails,
  AdminOrderDetailsResponse,
  UpdateAdminOrderStatusRequest,
  AdminOrdersQuery,
  AdminOrdersResponse,
} from './admin-orders.models';

@Injectable({
  providedIn: 'root',
})
export class AdminOrdersService {
  private readonly httpClient = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiBaseUrl = this.normalizeBaseUrl(environment.baseUrl);

  getOrders(query: AdminOrdersQuery): Observable<AdminOrdersResponse> {
    let params = new HttpParams()
      .set('Page', query.page)
      .set('PageSize', query.pageSize);

    if (query.status) {
      params = params.set('Status', query.status);
    }

    if (query.search.trim()) {
      params = params.set('Search', query.search.trim());
    }

    if (query.asc !== null) {
      params = params.set('Asc', query.asc);
    }

    return this.httpClient
      .get<AdminOrdersResponse>(`${this.apiBaseUrl}Admin/Orders`, {
        headers: this.createAuthHeaders(),
        params,
      })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'We could not load admin orders.');
          }

          return response;
        }),
      );
  }

  getOrder(orderId: number): Observable<AdminOrderDetails> {
    return this.httpClient
      .get<AdminOrderDetailsResponse>(`${this.apiBaseUrl}Admin/Orders/${orderId}`, {
        headers: this.createAuthHeaders(),
      })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'We could not load this admin order.');
          }

          if (!response.data) {
            throw new Error(response.message || 'We could not load this admin order.');
          }

          return response.data;
        }),
      );
  }

  updateOrderStatus(
    orderId: number,
    request: UpdateAdminOrderStatusRequest,
  ): Observable<AdminOrderDetailsResponse> {
    return this.httpClient.put<AdminOrderDetailsResponse>(
      `${this.apiBaseUrl}Admin/Orders/${orderId}/status`,
      request,
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
