export interface SignUpRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  roles: string[];
}

export interface AuthData {
  accessToken: string;
  tokenType: string;
  expiresAtUtc: string;
  user: AuthUser;
}

export interface SignUpResponse {
  success: boolean;
  message: string;
  data: AuthData | null;
  pagination: unknown | null;
  errors: AuthErrors;
}

export type SignInResponse = SignUpResponse;

export type AuthErrors = string[] | Record<string, string[]> | null;

export interface StoredAuthSession extends AuthData {
  storedAtUtc: string;
}
