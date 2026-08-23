import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/services/auth.service';
import { OrderDetails, OrderDetailsResponse, OrderSummary, OrdersResponse } from './orders.models';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly httpClient = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiBaseUrl = this.normalizeBaseUrl(environment.baseUrl);

  getOrders(): Observable<OrderSummary[]> {
    return this.httpClient
      .get<OrdersResponse>(`${this.apiBaseUrl}Orders`, {
        headers: this.createAuthHeaders(),
      })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'We could not load your orders.');
          }

          return response.data;
        }),
      );
  }

  getOrder(orderId: number): Observable<OrderDetails> {
    return this.httpClient
      .get<OrderDetailsResponse>(`${this.apiBaseUrl}Orders/${orderId}`, {
        headers: this.createAuthHeaders(),
      })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'We could not load this order.');
          }

          return response.data;
        }),
      );
  }

  cancelOrder(orderId: number): Observable<OrderDetailsResponse> {
    return this.httpClient.post<OrderDetailsResponse>(
      `${this.apiBaseUrl}Orders/${orderId}/cancel`,
      null,
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
