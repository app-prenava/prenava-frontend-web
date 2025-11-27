import api from '@/lib/apiClient';
// import { GetAllUsersResponse } from '@/features/admin/admin.types';

// Ibu hamil user with embedded profile fields from users_profile
export type IbuHamilUser = {
  user_id: number;
  name: string;
  email: string;
  role?: 'ibu_hamil';
  is_active: number;
  created_at?: string;
  updated_at?: string;
  profile?: {
    photo?: string | null;
    tanggal_lahir?: string | null;
    usia?: number | string | null;
    alamat?: string | null;
    no_telepon?: string | null;
    pendidikan_terakhir?: string | null;
    pekerjaan?: string | null;
    golongan_darah?: string | null;
  } | null;
  // Some backends might flatten profile fields at top-level
  photo?: string | null;
  tanggal_lahir?: string | null;
  usia?: number | string | null;
  alamat?: string | null;
  no_telepon?: string | null;
  pendidikan_terakhir?: string | null;
  pekerjaan?: string | null;
  golongan_darah?: string | null;
};

export type GetIbuHamilUsersResponse = {
  status?: string;
  message?: string;
  data: IbuHamilUser[];
};

export const getIbuHamilUsers = async (): Promise<GetIbuHamilUsersResponse> => {
  // Ambil daftar pengguna role ibu_hamil dari endpoint baru yang Anda set
  const res = await api.get<GetIbuHamilUsersResponse>('/api/bidan/ibu-hamil');

  const raw = res?.data ?? {};
  // Normalisasi berbagai kemungkinan bentuk respons BE
  const list: IbuHamilUser[] = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.data)
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


export type BidanProfile = {
  tempat_praktik: string;
  alamat_praktik: string;
  kota_tempat_praktik: string;
  kecamatan_tempat_praktik: string;
  telepon_tempat_praktik: string;
  spesialisasi: string;
  photo?: string | null;
};

export type GetBidanProfileResponse = {
  message: string;
  data: BidanProfile & { photo?: string | null };
};

export type UpdateBidanProfileBody = BidanProfile;

export type UpdateBidanProfileResponse = {
  message: string;
};

export const getBidanProfile = async () => {
  const { data } = await api.get<GetBidanProfileResponse>('/api/profile');
  return data;
};

// Create profile (used when profile does not yet exist)
export const createBidanProfile = async (body: UpdateBidanProfileBody | FormData) => {
  const { data } = await api.post<UpdateBidanProfileResponse>('/api/profile/create', body);
  return data;
};

// Update profile (accepts JSON body or FormData when including a file)
export const updateBidanProfile = async (body: UpdateBidanProfileBody | FormData) => {
  const { data } = await api.post<UpdateBidanProfileResponse>('/api/profile/update', body);
  return data;
};