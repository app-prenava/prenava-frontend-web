import api from '@/lib/apiClient';
import { GetAllUsersResponse } from '@/features/admin/admin.types';

export const getIbuHamilUsers = async () => {
  const { data } = await api.get<GetAllUsersResponse>('/api/admin/users?role=ibu_hamil');
  return data;
};

