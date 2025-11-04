import api from '@/lib/apiClient';
import { ShopResponse, DeleteShopResponse, ShopLogsResponse } from './shop.types';

export const shopApi = {
  // Get all shops with pagination
  getAllShops: async (page = 1, perPage = 30): Promise<ShopResponse> => {
    try {
      const response = await api.get('/api/shop/all', {
        params: { page, data: perPage },
      });
      console.log('Shop API Raw Response:', response);
      console.log('Shop API Response Data:', response.data);
      
      // Handle different response structures
      const responseData = response.data;
      
      // If response has nested data structure
      if (responseData?.data && Array.isArray(responseData.data)) {
        return responseData as ShopResponse;
      }
      
      // If response is direct array or has different structure
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
      
      // Default: return as is
      return responseData as ShopResponse;
    } catch (error: any) {
      console.error('Shop API Error:', error);
      console.error('Error Status:', error?.response?.status);
      console.error('Error Message:', error?.response?.data);
      
      // Provide more detailed error information
      if (error?.response?.status === 403) {
        console.error('403 Forbidden - Check if user has admin role and proper permissions');
      }
      
      throw error;
    }
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

