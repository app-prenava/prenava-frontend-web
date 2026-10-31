import api from '@/lib/apiClient';
import { ShopResponse, DeleteShopResponse, ShopLogsResponse } from './shop.types';

export const shopApi = {
  // Get all shops with pagination
  getAllShops: async (page = 1, perPage = 30): Promise<ShopResponse> => {
    try {
      const response = await api.get('/api/shop/all', {
        params: { page, data: perPage },
      });
      
      const responseData = response.data;
      
      if (responseData?.data && Array.isArray(responseData.data)) {
        return responseData as ShopResponse;
      }
      
      if (Array.isArray(responseData)) {
        return {
          status: 'success',
          data: responseData,
          total: responseData.length,
          per_page: perPage,
          current_page: page,
          last_page: 1,
          from: 1,
          to: responseData.length,
        };
      }
      
      return responseData as ShopResponse;
    } catch (error: any) {
      console.error('Shop API Error:', error);
      throw error;
    }
  },

  // Create shop product
  createShop: async (formData: FormData): Promise<{ status: string; message: string; data?: any }> => {
    const { data } = await api.post('/api/shop/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Update shop product
  updateShop: async (productId: number, formData: FormData): Promise<{ status: string; message: string; data?: any }> => {
    const { data } = await api.post(`/api/shop/update/${productId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Delete shop by ID (Admin)
  deleteShop: async (productId: number): Promise<DeleteShopResponse> => {
    const { data } = await api.post<DeleteShopResponse>(`/api/shop/delete/${productId}`);
    return data;
  },

  // Get shop logs (Admin only)
  getShopLogs: async (page = 1, perPage = 50): Promise<ShopLogsResponse> => {
    const { data } = await api.get<ShopLogsResponse>('/api/admin/shop/logs', {
      params: { page, data: perPage },
    });
    return data;
  },
};
