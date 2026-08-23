export interface AccountProfile {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  roles: string[];
}

export interface AccountProfileResponse {
  success: boolean;
  message: string;
  data: AccountProfile;
  pagination: null;
  errors: unknown;
}

export interface UpdateAccountProfileRequest {
  fullName: string;
  phoneNumber: string;
}
