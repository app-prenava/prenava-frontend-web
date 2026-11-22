import api from '@/lib/apiClient';

export type DinkesProfile = {
  nip: string;
  jabatan: string;
  photo?: string | null;
  province_code?: string | null;
  province_name?: string | null;
  regency_code?: string | null;
  regency_name?: string | null;
};

export type GetDinkesProfileResponse = {
  message: string;
  data?: DinkesProfile;
  profile?: DinkesProfile;
};

export type UpdateDinkesProfileBody = Pick<DinkesProfile, 'nip' | 'jabatan' | 'photo'>;

export type UpdateDinkesProfileResponse = {
  message: string;
};

export interface DinkesDistrictStat {
  district_code: string;
  district_name: string;
  ibu_hamil_count: number;
  pmb_count: number;
  trimester_1: number;
  trimester_2: number;
  trimester_3: number;
  pasca_melahirkan: number;
  risk_anemia: number;
  risk_depression: number;
  risk_stunting: number;
  high_risk_ibu_count: number;
}

export interface DinkesDashboardData {
  region: {
    province_code: string;
    province_name: string;
    regency_code: string;
    regency_name: string;
  };
  summary: {
    total_ibu_hamil: number;
    total_pmb_verified: number;
    total_districts: number;
    total_districts_covered: number;
    ibu_hamil_high_risk: number;
  };
  trimester_distribution: {
    trimester_1: number;
    trimester_2: number;
    trimester_3: number;
    pasca_melahirkan: number;
    belum_diisi: number;
  };
  risk_distribution: {
    anemia: { anemia: number; non_anemia: number; belum_skrining: number };
    depression: { detected: number; safe: number; belum_skrining: number };
    stunting: { tinggi: number; rendah: number; belum_skrining: number };
  };
  by_district: DinkesDistrictStat[];
}

export interface DinkesDashboardResponse {
  status: string;
  data: DinkesDashboardData;
}

export interface DinkesIbuHamilItem {
  user_id: number;
  name: string;
  email: string;
  is_active: boolean;
  age: number | null;
  phone: string | null;
  district_code: string | null;
  district_name: string;
  trimester: string;
  risk_anemia: 'berisiko' | 'aman' | 'belum_skrining';
  risk_depression: 'berisiko' | 'aman' | 'belum_skrining';
  risk_stunting: 'berisiko' | 'aman' | 'belum_skrining';
  is_high_risk: boolean;
  created_at: string | null;
}

export interface DinkesBidanItem {
  user_id: number;
  name: string;
  email: string;
  is_active: boolean;
  tempat_praktik: string | null;
  alamat_praktik: string | null;
  district_code: string | null;
  district_name: string;
  phone: string | null;
  spesialisasi: string | null;
  str_number: string | null;
  sip_number: string | null;
  is_verified_partner: boolean;
  has_active_subscription: boolean;
  created_at: string | null;
}

export interface DinkesUsersData {
  region: {
    province_code: string;
    province_name: string;
    regency_code: string;
    regency_name: string;
  };
  districts: { code: string; name: string }[];
  ibu_hamil: DinkesIbuHamilItem[];
  bidans: DinkesBidanItem[];
}

export const getDinkesDashboard = async (): Promise<DinkesDashboardData> => {
  const { data } = await api.get<DinkesDashboardResponse>('/api/dinkes/dashboard');
  return data.data;
};

export const getDinkesUsers = async (): Promise<DinkesUsersData> => {
  const { data } = await api.get<{ status: string; data: DinkesUsersData }>('/api/dinkes/users');
  return data.data;
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
