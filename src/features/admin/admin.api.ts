import api from '@/lib/apiClient';
import {
  CreateAccountBody,
  CreateAccountResponse,
  GetAllUsersResponse,
  ResetPasswordBody,
  ResetPasswordResponse,
  BannerResponse,
  CreateBannerBody,
  CreateBannerResponse,
  UpdateBannerBody,
  UpdateBannerResponse,
} from './admin.types';

// Lightweight types for admin detail views
export type AdminBidanProfile = {
  user_id: number;
  tempat_praktik?: string | null;
  alamat_praktik?: string | null;
  kota_tempat_praktik?: string | null;
  kecamatan_tempat_praktik?: string | null;
  telepon_tempat_praktik?: string | null;
  spesialisasi?: string | null;
  photo?: string | null;
};

export type AdminDinkesProfile = {
  user_id: number;
  nip?: string | null;
  jabatan?: string | null;
  photo?: string | null;
};

type MaybeWrapped<T> = { status?: string; message?: string; data?: T | null; profile?: T | null } | T | null;

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
  // Try different endpoints to get bidan data with profile
  try {
    // First try with profile endpoint
    const { data } = await api.get<GetAllUsersResponse>('/api/users?role=bidan');
    return data;
  } catch (error) {
    // Fallback to admin endpoint if profile endpoint fails
    const { data } = await api.get<GetAllUsersResponse>('/api/admin/users/?role=bidan');
    return data;
  }
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

export const deactivateUser = async (userId: number) => {
  const { data } = await api.post(`/api/admin/users/${userId}/deactivate`);
  return data;
};

export const activateUser = async (userId: number) => {
  const { data } = await api.post(`/api/admin/users/${userId}/activate`);
  return data;
};

// Fetch Bidan profile by user id (try multiple likely endpoints)
export const getBidanProfileByUserId = async (userId: number): Promise<AdminBidanProfile | null> => {
  const tryEndpoints = [
    `/api/admin/bidan/${userId}/profile`,
    `/api/profile/bidan/${userId}`,
    `/api/users/${userId}/profile`,
  ];
  for (const ep of tryEndpoints) {
    try {
      const { data } = await api.get<MaybeWrapped<AdminBidanProfile>>(ep);
      const raw: any = data ?? {};
      return (raw.data ?? raw.profile ?? raw) as AdminBidanProfile;
    } catch (_) {
      // try next
    }
  }
  return null;
};

// Fetch Dinkes profile by user id (try multiple likely endpoints)
export const getDinkesProfileByUserId = async (userId: number): Promise<AdminDinkesProfile | null> => {
  const tryEndpoints = [
    `/api/admin/dinkes/${userId}/profile`,
    `/api/profile/dinkes/${userId}`,
    `/api/users/${userId}/dinkes-profile`,
  ];
  for (const ep of tryEndpoints) {
    try {
      const { data } = await api.get<MaybeWrapped<AdminDinkesProfile>>(ep);
      const raw: any = data ?? {};
      return (raw.data ?? raw.profile ?? raw) as AdminDinkesProfile;
    } catch (_) {
      // try next
    }
  }
  return null;
};

// Banner API functions
export const getBanners = async () => {
  const { data } = await api.get<BannerResponse>('/api/banner/show/all');
  return data;
};

export const createBanner = async (body: CreateBannerBody) => {
  const formData = new FormData();
  formData.append('name', body.name);
  formData.append('url', body.url);
  formData.append('photo', body.image); // Changed from 'image' to 'photo' to match server expectation

  const { data } = await api.post<CreateBannerResponse>('/api/banner/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const updateBanner = async (bannerId: number, body: UpdateBannerBody) => {
  const formData = new FormData();
  if (body.name) formData.append('name', body.name);
  if (body.image) formData.append('photo', body.image); // Changed from 'image' to 'photo'
  if (body.url) formData.append('url', body.url);
  if (body.is_active !== undefined) formData.append('is_active', body.is_active.toString());

  const { data } = await api.put<UpdateBannerResponse>(`/api/banner/update/${bannerId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const deleteBanner = async (bannerId: number) => {
  const { data } = await api.delete(`/api/banner/delete/${bannerId}`);
  return data;
};

export const toggleBannerStatus = async (bannerId: number, isActive: number) => {
  const { data } = await api.post(`/api/banner/update/${bannerId}`, {
    is_active: isActive,
  });
  return data;
};
