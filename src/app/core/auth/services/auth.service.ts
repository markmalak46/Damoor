import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthData, SignInRequest, SignInResponse, SignUpRequest, SignUpResponse, StoredAuthSession } from '../models/damoor-auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private static readonly storageKey = 'damoor.auth.session';
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = this.normalizeBaseUrl(environment.baseUrl);
  private readonly router = inject(Router);

  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    return !!localStorage.getItem('DamoorToken');
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return localStorage.getItem('DamoorToken');
  }

  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('DamoorToken', token);
    }
  }

  signUp(request: SignUpRequest): Observable<SignUpResponse> {
    return this.httpClient.post<SignUpResponse>(`${this.apiBaseUrl}Auth/sign-up`, request);
  }

  signIn(request: SignInRequest): Observable<SignInResponse> {
    return this.httpClient.post<SignInResponse>(`${this.apiBaseUrl}Auth/sign-in`, request);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('DamoorToken');
    }

    this.router.navigate(['/login']);
  }

  persistAuthSession(authData: AuthData): void {
    const session: StoredAuthSession = {
      ...authData,
      storedAtUtc: new Date().toISOString(),
    };

    localStorage.setItem(AuthService.storageKey, JSON.stringify(session));
    localStorage.setItem('token', authData.accessToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
  }

  private normalizeBaseUrl(baseUrl: string): string {
    return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

}
