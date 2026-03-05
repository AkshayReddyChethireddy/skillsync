import { apiClient } from './client';
import type { Token, User, LoginRequest, RegisterRequest } from '../types/api';

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<User>('/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    apiClient.post<Token>('/auth/login', data).then((r) => r.data),

  getMe: () => apiClient.get<User>('/auth/me').then((r) => r.data),

  updateMe: (data: { full_name?: string; avatar_url?: string }) =>
    apiClient.put<User>('/auth/me', data).then((r) => r.data),

  changePassword: (data: { current_password: string; new_password: string }) =>
    apiClient.put('/auth/me/password', data),
};
