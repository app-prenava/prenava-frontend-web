import api from '@/lib/apiClient';
import type {
    CatatanIbu,
    GetCatatanIbuListResponse,
    GetCatatanIbuDetailResponse,
    UpdateCatatanIbuPayload,
    UpdateCatatanIbuResponse,
} from './catatan.types';

export const getCatatanIbuList = async (): Promise<GetCatatanIbuListResponse> => {
    const res = await api.get<GetCatatanIbuListResponse>('/api/catatan-ibu');

    const raw = res?.data ?? {};
    const list: CatatanIbu[] = Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw)
            ? raw
            : [];

    return {
        status: raw.status ?? 'success',
        message: raw.message ?? '',
        data: list,
    };
};

export const getCatatanIbuDetail = async (
    catatanId: number
): Promise<GetCatatanIbuDetailResponse> => {
    const res = await api.get(`/api/catatan-ibu/${catatanId}`);

    const raw = res?.data ?? {};

    // Backend returns array - return as is for component to handle
    const data = Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw)
            ? raw
            : raw.data ?? raw;

    return {
        status: raw.status ?? 'success',
        message: raw.message ?? '',
        data: data as CatatanIbu | CatatanIbu[],
    };
};

export const updateCatatanIbu = async (
    catatanId: number,
    payload: UpdateCatatanIbuPayload
): Promise<UpdateCatatanIbuResponse> => {
    const res = await api.put<UpdateCatatanIbuResponse>(
        `/api/catatan-ibu/${catatanId}`,
        payload
    );

    return res.data;
};

