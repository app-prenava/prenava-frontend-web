import api from '@/lib/apiClient';
import { LoginBody, LoginResponse, MeResponse } from './auth.types';

export const login = async (body: LoginBody) => {
  const { data } = await api.post<LoginResponse>('/api/auth/login', body);
  return data;
};

export const me = async () => {
  const { data } = await api.get<MeResponse>('/api/auth/me');
  return data;
};

export const logout = async () => {
  const { data } = await api.post('/api/auth/logout');
  return data;
};

export const refresh = async () => {
  const { data } = await api.post('/api/auth/refresh');
  return data;
};
