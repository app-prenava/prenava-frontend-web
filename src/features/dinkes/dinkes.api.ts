import api from '@/lib/apiClient';

export type DinkesProfile = {
    nip: string;
    jabatan: string;
    photo?: string | null;
};

export type GetDinkesProfileResponse = {
    message: string;
    data: DinkesProfile;
};

export type UpdateDinkesProfileBody = DinkesProfile;

export type UpdateDinkesProfileResponse = {
    message: string;
};

export const getDinkesProfile = async () => {
    const { data } = await api.get<GetDinkesProfileResponse>('/api/profile');
    return data;
};

export const createDinkesProfile = async (body: UpdateDinkesProfileBody | FormData) => {
    const { data } = await api.post<UpdateDinkesProfileResponse>('/api/profile/create', body);
    return data;
};

export const updateDinkesProfile = async (body: UpdateDinkesProfileBody | FormData) => {
    const { data } = await api.post<UpdateDinkesProfileResponse>('/api/profile/update', body);
    return data;
};

