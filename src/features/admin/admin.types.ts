export type UserRole = 'admin' | 'bidan' | 'dinkes' | 'ibu_hamil';

export type User = {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: number; // 1 for active, 0 for inactive
  created_at: string;
  updated_at: string;
  // Profile fields from bidan_profile table (can be nested or flat)
  alamat_praktik?: string | null;
  kota_tempat_praktik?: string | null;
  spesialisasi?: string | null;
  // Alternative nested structure
  profile?: {
    alamat_praktik?: string | null;
    kota_tempat_praktik?: string | null;
    spesialisasi?: string | null;
  } | null;
};

export type GetAllUsersResponse = {
  status: 'success';
  message: string;
  data: User[];
};

export type CreateAccountBody = {
  name: string;
  email: string;
  password: string;
};

export type CreateAccountResponse = {
  status: 'success';
  message: string;
  data: {
    user_id: number;
    name: string;
    email: string;
    role: 'bidan' | 'dinkes';
    is_active: boolean;
  };
};

// Keep old types for backward compatibility
export type UserListItem = User;
export type UserListResponse = GetAllUsersResponse;

export type ResetPasswordBody = {
  new_password: string;
};

export type ResetPasswordResponse = {
  status: string;
  message: string;
};

// Banner types
export type Banner = {
  id: number;
  name: string;
  image_url: string;
  url: string;
  is_active: number; // 1 for active, 0 for inactive
  created_at: string;
  updated_at: string;
};

export type BannerResponse = {
  status: 'success';
  message: string;
  data: Banner[];
};

export type CreateBannerBody = {
  name: string;
  image: File;
  url: string;
};

export type CreateBannerResponse = {
  status: 'success';
  message: string;
  data: Banner;
};

export type UpdateBannerBody = {
  name?: string;
  image?: File;
  url?: string;
  is_active?: number;
};

export type UpdateBannerResponse = {
  status: 'success';
  message: string;
  data: Banner;
};

// Rekomendasi Gerakan (Sport Recommendations) types
export type RekomendasiGerakan = {
  id: number;
  activity: string;
  video_link: string;
  long_text: string;
  picture_1: string | null;
  picture_2: string | null;
  picture_3: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
};

export type RekomendasiGerakanResponse = {
  status: 'success';
  message: string;
  data: RekomendasiGerakan[];
};

export type SingleRekomendasiResponse = {
  status: 'success';
  message: string;
  data: RekomendasiGerakan;
};

export type CreateRekomendasiBody = {
  activity: string;
  video_link: string;
  long_text: string;
  picture_1?: File;
  picture_2?: File;
  picture_3?: File;
};

export type UpdateRekomendasiBody = {
  activity?: string;
  video_link?: string;
  long_text?: string;
  picture_1?: File;
  picture_2?: File;
  picture_3?: File;
  is_active?: number;
};

// History Log types
export type HistoryLog = {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  user_role?: string;
  action: string;
  activity_type?: string;
  activity_label?: string;
  description?: string;
  ip_address?: string;
  device?: string;
  created_at: string;
};

export type HistoryLogResponse = {
  status: 'success';
  message: string;
  data: HistoryLog[];
};

export type HistoryLogFilters = {
  role?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
};
