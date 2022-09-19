import type { TAccount } from './account';

export type AuthLoginRequest = {
  username: string;
  password: string;
};
export type AuthRegisterRequest = {
  username: string;
  password: string;
  email: string;
  display_name: string;
};

export interface AuthResponse {
  account: TAccount;
  token: string;
}

export type AuthPurpose = 'CREATE_PASSWORD' | 'RESET_PASSWORD' | 'VERIFY_EMAIL' | 'REVERIFY_EMAIL' | '';
export interface AuthInfoResponse {
  email: string;
  purpose: AuthPurpose;
  // In case error
  messageId?: string;
}
