import type { AuthInfoResponse, AuthLoginRequest, AuthRegisterRequest, AuthResponse } from '@/types/auth';
import request from '@/utils/request';

export const login = (data: AuthLoginRequest): Promise<AuthResponse | undefined> => {
  return request.post('/auth/login', {
    data,
  });
};
export const register = (data: AuthRegisterRequest): Promise<AuthResponse | undefined> => {
  return request.post('/auth/register', {
    data,
  });
};
export const forgotPassword = (email: string): Promise<boolean | undefined> => {
  return request.post(`/auth/forgot-password/${email}`);
};
export const validateEmail = (token: string): Promise<boolean | undefined> => {
  return request.get('/auth/validate', {
    params: { token }
  });
};
export const reValidateEmail = (): Promise<any> => {
  return request.post('/auth/validate');
};
export const resetPassword = (token: string, newPassword: string) => {
  return request.post('/auth/reset-password', {
    params: { token },
    data: {
      newPassword,
    },
  });
};

// Other actions
export const getByToken = (token: string): Promise<AuthInfoResponse> => {
  return request.get('/auth/token', { params: { token } });
};
