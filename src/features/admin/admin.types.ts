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
