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

export const RISK_LEVELS = [
  'highly_recommended', 'allowed_with_caution', 'avoid',
] as const;

export type RiskLevel = typeof RISK_LEVELS[number];

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  highly_recommended: 'Sangat Direkomendasikan',
  allowed_with_caution: 'Boleh dengan Catatan',
  avoid: 'Hindari',
};

export type RekomendasiGerakan = {
  id: number;
  code: string;
  name: string;
  category: string;
  risk_level_high: RiskLevel | null;
  risk_level_low: RiskLevel | null;
  video_link: string | null;
  long_text: string | null;
  picture_1: string | null;
  picture_2: string | null;
  picture_3: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateRekomendasiBody = {
  code: string;
  name: string;
  category: string;
  risk_level_high?: RiskLevel | '';
  risk_level_low?: RiskLevel | '';
  video_link: string;
  long_text?: string;
  picture_1?: File;
  picture_2?: File;
  picture_3?: File;
};

export type UpdateRekomendasiBody = {
  code?: string;
  name?: string;
  category?: string;
  risk_level_high?: RiskLevel | '';
  risk_level_low?: RiskLevel | '';
  video_link?: string;
  long_text?: string;
  picture_1?: File;
  picture_2?: File;
  picture_3?: File;
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
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
  };
};

export type HistoryLogFilters = {
  role?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  per_page?: number;
  page?: number;
};


// ============================================
// Generic API Response Types
// ============================================

export type ApiResponse<T> = {
  status: 'success' | 'error';
  message: string;
  data?: T;
  error?: string;
};

export type PaginatedResponse<T> = {
  status: 'success';
  message: string;
  data: T[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
};

// ============================================
// Common Types
// ============================================

export type SuccessResponse<T> = {
  status: 'success';
  message: string;
  data: T;
};

export type ErrorResponse = {
  status: 'error';
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
};

export type BaseEntity = {
  id: number;
  created_at: string;
  updated_at: string;
};

// ============================================
// Filter/Query Types
// ============================================

export type PaginationParams = {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
};

export type DateRange = {
  start_date?: string; // ISO format: YYYY-MM-DD
  end_date?: string;   // ISO format: YYYY-MM-DD
};

// ============================================
// Status Types
// ============================================

export type StatusCode = 'success' | 'error' | 'pending' | 'processing';

export type ActiveStatus = 0 | 1; // 0 = inactive, 1 = active

// ============================================
// Export Type Combinations (for convenience)
// ============================================

/**
 * Utility type for extracting data from API responses
 * Usage: ExtractData<GetAllUsersResponse> = User[]
 */
export type ExtractData<T> = T extends SuccessResponse<infer U> ? U : never;

/**
 * Utility type for API request/response pair
 */
export type ApiEndpoint<TRequest, TResponse> = {
  request: TRequest;
  response: TResponse;
};