import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/services/auth.service';
import { CheckoutRequest, CheckoutResponse } from './checkout.models';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private readonly httpClient = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiBaseUrl = this.normalizeBaseUrl(environment.baseUrl);

  placeOrder(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.httpClient.post<CheckoutResponse>(`${this.apiBaseUrl}Checkout`, request, {
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
