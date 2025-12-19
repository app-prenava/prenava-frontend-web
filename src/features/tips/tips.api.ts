import api from '@/lib/apiClient';
import { storage } from '@/lib/storage';
import {
  GetAllTipCategoriesResponse,
  CreateTipCategoryBody,
  CreateTipCategoryResponse,
  UpdateTipCategoryBody,
  UpdateTipCategoryResponse,
  GetAllTipsResponse,
  GetTipByIdResponse,
  CreateTipBody,
  CreateTipResponse,
  UpdateTipBody,
  UpdateTipResponse,
  DeleteTipResponse,
  DeleteTipCategoryResponse,
} from './tips.types';

// Tip Category API
export const getAllTipCategories = async () => {
  const role = storage.getRole();

  // Untuk halaman manajemen (admin dashboard) gunakan endpoint yang mengembalikan
  // semua kategori beserta field is_active & order.
  const endpoint =
    role === 'admin'
      ? '/api/tips/categories/all'
      : '/api/tips/categories';

  const { data } = await api.get<GetAllTipCategoriesResponse>(endpoint);
  return data;
};

export const createTipCategory = async (body: CreateTipCategoryBody) => {
  const { data } = await api.post<CreateTipCategoryResponse>('/api/tips/categories', body);
  return data;
};

export const updateTipCategory = async (id: number, body: UpdateTipCategoryBody) => {
  const { data } = await api.put<UpdateTipCategoryResponse>(`/api/tips/categories/${id}`, body);
  return data;
};

export const deleteTipCategory = async (id: number) => {
  const { data } = await api.delete<DeleteTipCategoryResponse>(`/api/tips/categories/${id}`);
  return data;
};

// Tips API
export const getAllTips = async (filters?: { category_id?: number; search?: string }) => {
  const params: Record<string, string> = {};
  if (filters?.category_id) params.category_id = filters.category_id.toString();
  if (filters?.search) params.search = filters.search;

  const { data } = await api.get<GetAllTipsResponse>('/api/tips', { params });
  return data;
};

export const getTipById = async (id: number) => {
  const { data } = await api.get<GetTipByIdResponse>(`/api/tips/${id}`);
  return data;
};

export const createTip = async (body: CreateTipBody) => {
  const { data } = await api.post<CreateTipResponse>('/api/tips', body);
  return data;
};

export const updateTip = async (id: number, body: UpdateTipBody) => {
  const { data } = await api.put<UpdateTipResponse>(`/api/tips/${id}`, body);
  return data;
};

export const deleteTip = async (id: number) => {
  const { data } = await api.delete<DeleteTipResponse>(`/api/tips/${id}`);
  return data;
};


