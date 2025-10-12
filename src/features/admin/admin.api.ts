import api from '@/lib/apiClient';
import {
  CreateAccountBody,
  CreateAccountResponse,
  GetAllUsersResponse,
  ResetPasswordBody,
  ResetPasswordResponse,
} from './admin.types';

export const createBidan = async (body: CreateAccountBody) => {
  const { data } = await api.post<CreateAccountResponse>(
    '/api/admin/create/account/bidan',
    body
  );
  return data;
};

export const createDinkes = async (body: CreateAccountBody) => {
  const { data } = await api.post<CreateAccountResponse>(
    '/api/admin/create/account/dinkes',
    body
  );
  return data;
};

export const getAllUsers = async (role?: string) => {
  const params = role ? { role } : {};
  const { data } = await api.get<GetAllUsersResponse>('/api/admin/users', { params });
  return data;
};

export const getBidans = async () => {
  const { data } = await api.get<GetAllUsersResponse>('/api/admin/users?role=bidan');
  return data;
};

export const getDinkes = async () => {
  const { data } = await api.get<GetAllUsersResponse>('/api/admin/users?role=dinkes');
  return data;
};

// Keep old function for backward compatibility
export const getUserList = getAllUsers;

export const resetUserPassword = async (userId: number, body: ResetPasswordBody) => {
  const { data } = await api.post<ResetPasswordResponse>(
    `/api/admin/users/${userId}/reset-password`,
    body
  );
  return data;
};
