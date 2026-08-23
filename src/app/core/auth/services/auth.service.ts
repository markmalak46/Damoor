import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import {
  AuthData,
  AuthUser,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  StoredAuthSession,
} from '../models/damoor-auth.models';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private static readonly storageKey = 'damoor.auth.session';

  private readonly platformId = inject(PLATFORM_ID);
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = this.normalizeBaseUrl(environment.baseUrl);
  private readonly router = inject(Router);
  private readonly currentUserSignal = signal<AuthUser | null>(this.readStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();

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
      localStorage.removeItem(AuthService.storageKey);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  persistAuthSession(authData: AuthData): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const session: StoredAuthSession = {
      ...authData,
      storedAtUtc: new Date().toISOString(),
    };

    localStorage.setItem(AuthService.storageKey, JSON.stringify(session));
    localStorage.setItem('DamoorToken', authData.accessToken);
    localStorage.setItem('token', authData.accessToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
    this.currentUserSignal.set(authData.user);
  }

  updateCurrentUser(user: AuthUser): void {
    this.currentUserSignal.set(user);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem('user', JSON.stringify(user));

    const storedSession = localStorage.getItem(AuthService.storageKey);
    if (!storedSession) {
      return;
    }

    try {
      const session = JSON.parse(storedSession) as StoredAuthSession;
      localStorage.setItem(
        AuthService.storageKey,
        JSON.stringify({
          ...session,
          user,
        }),
      );
    } catch {
      localStorage.removeItem(AuthService.storageKey);
    }
  }

  private normalizeBaseUrl(baseUrl: string): string {
    return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

  private readStoredUser(): AuthUser | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser) as AuthUser;
      } catch {
        localStorage.removeItem('user');
      }
    }

    const storedSession = localStorage.getItem(AuthService.storageKey);
    if (!storedSession) {
      return null;
    }

    try {
      const session = JSON.parse(storedSession) as StoredAuthSession;
      return session.user;
    } catch {
      localStorage.removeItem(AuthService.storageKey);
      return null;
    }
  }

}
