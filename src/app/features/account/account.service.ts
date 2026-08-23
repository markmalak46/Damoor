import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/services/auth.service';
import { AccountProfile, AccountProfileResponse, UpdateAccountProfileRequest } from './account.models';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly httpClient = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiBaseUrl = this.normalizeBaseUrl(environment.baseUrl);

  getProfile(): Observable<AccountProfile> {
    return this.httpClient
      .get<AccountProfileResponse>(`${this.apiBaseUrl}Account/me`, {
        headers: this.createAuthHeaders(),
      })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'We could not load your account.');
          }

          return response.data;
        }),
      );
  }

  updateProfile(request: UpdateAccountProfileRequest): Observable<AccountProfileResponse> {
    return this.httpClient.put<AccountProfileResponse>(`${this.apiBaseUrl}Account/me`, request, {
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
