import apiClient from '@/lib/apiClient';
import type {
  SubscriptionPlan,
  SubscriptionPlansResponse,
  SubscriptionPlanResponse,
  CreateSubscriptionPlanBody,
  UpdateSubscriptionPlanBody,
  BidanApplication,
  BidanApplicationsResponse,
  BidanApplicationResponse,
  BidanAccount,
  BidanAccountsResponse,
  BidanAccountResponse,
  CreateBidanAccountBody,
  CreateBidanAccountResponse,
  BidanLocation,
  BidanLocationResponse,
  SetBidanLocationBody,
  UpdateBidanLocationBody,
  ApplicationQueryParams,
  BidanQueryParams,
} from './bidan.types';

// =====================
// Subscription Plans API
// =====================

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await apiClient.get<SubscriptionPlansResponse>('/api/admin/subscription-plans');
  return response.data.data;
};

export const getSubscriptionPlan = async (id: number): Promise<SubscriptionPlan> => {
  const response = await apiClient.get<SubscriptionPlanResponse>(`/api/admin/subscription-plans/${id}`);
  return response.data.data;
};

export const createSubscriptionPlan = async (data: CreateSubscriptionPlanBody): Promise<SubscriptionPlan> => {
  const response = await apiClient.post<SubscriptionPlanResponse>('/api/admin/subscription-plans', data);
  return response.data.data;
};

export const updateSubscriptionPlan = async (id: number, data: UpdateSubscriptionPlanBody): Promise<SubscriptionPlan> => {
  const response = await apiClient.put<SubscriptionPlanResponse>(`/api/admin/subscription-plans/${id}`, data);
  return response.data.data;
};

export const deleteSubscriptionPlan = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/admin/subscription-plans/${id}`);
};

export const toggleSubscriptionPlanStatus = async (id: number): Promise<SubscriptionPlan> => {
  const response = await apiClient.patch<SubscriptionPlanResponse>(`/api/admin/subscription-plans/${id}/toggle`);
  return response.data.data;
};

// =====================
// Bidan Applications API
// =====================

export const getBidanApplications = async (params?: ApplicationQueryParams): Promise<BidanApplicationsResponse> => {
  const response = await apiClient.get<BidanApplicationsResponse>('/api/admin/bidan-applications', { params });
  return response.data;
};

export const getBidanApplication = async (id: number): Promise<BidanApplication> => {
  const response = await apiClient.get<BidanApplicationResponse>(`/api/admin/bidan-applications/${id}`);
  return response.data.data;
};

export const approveApplication = async (id: number): Promise<BidanApplication> => {
  const response = await apiClient.patch<BidanApplicationResponse>(`/api/admin/bidan-applications/${id}/approve`);
  return response.data.data;
};

export const rejectApplication = async (id: number, rejection_reason: string): Promise<BidanApplication> => {
  const response = await apiClient.patch<BidanApplicationResponse>(`/api/admin/bidan-applications/${id}/reject`, {
    reason: rejection_reason,
    rejection_reason,
  });
  return response.data.data;
};

// =====================
// Bidan Accounts API
// =====================

export const getBidanAccounts = async (params?: BidanQueryParams): Promise<BidanAccountsResponse> => {
  const response = await apiClient.get<BidanAccountsResponse>('/api/admin/bidans', { params });
  return response.data;
};

export const getBidanAccount = async (id: number): Promise<BidanAccount> => {
  const response = await apiClient.get<BidanAccountResponse>(`/api/admin/bidans/${id}`);
  return response.data.data;
};

export const createBidanAccount = async (data: CreateBidanAccountBody): Promise<CreateBidanAccountResponse> => {
  const response = await apiClient.post<CreateBidanAccountResponse>('/api/admin/bidans', data);
  return response.data;
};

export const toggleBidanStatus = async (id: number): Promise<BidanAccount> => {
  const response = await apiClient.patch<BidanAccountResponse>(`/api/admin/bidans/${id}/toggle`);
  return response.data.data;
};

// =====================
// Bidan Locations API
// =====================

export const getBidanLocations = async (): Promise<BidanLocation[]> => {
  const response = await apiClient.get<any>('/api/admin/bidan-locations');
  const outer = response.data;
  const inner = outer?.data;
  if (inner?.data && Array.isArray(inner.data)) return inner.data;
  if (Array.isArray(inner)) return inner;
  return [];
};

export const getBidanLocation = async (bidanId: number): Promise<BidanLocation> => {
  const response = await apiClient.get<BidanLocationResponse>(`/api/admin/bidans/${bidanId}/location`);
  return response.data.data;
};

export const setBidanLocation = async (bidanId: number, data: SetBidanLocationBody): Promise<BidanLocation> => {
  const response = await apiClient.post<BidanLocationResponse>(`/api/admin/bidans/${bidanId}/location`, data);
  return response.data.data;
};

export const updateBidanLocation = async (locationId: number, data: UpdateBidanLocationBody): Promise<BidanLocation> => {
  const response = await apiClient.put<BidanLocationResponse>(`/api/admin/bidan-locations/${locationId}`, data);
  return response.data.data;
};

export const toggleBidanLocationActive = async (locationId: number): Promise<{ location_id: number; is_active: boolean }> => {
  const response = await apiClient.patch<{ status: string; message: string; data: { location_id: number; is_active: boolean } }>(
    `/api/admin/bidan-locations/${locationId}/toggle-active`
  );
  return response.data.data;
};

export const deleteBidanLocation = async (bidanId: number): Promise<void> => {
  await apiClient.delete(`/api/admin/bidans/${bidanId}/location`);
};

// =====================
// Bidans without Location
// =====================

export const getBidansWithoutLocation = async (): Promise<BidanAccount[]> => {
  const response = await apiClient.get<any>('/api/admin/bidans', {
    params: { has_location: false },
  });
  const outer = response.data;
  const inner = outer?.data;
  if (inner?.data && Array.isArray(inner.data)) return inner.data;
  if (Array.isArray(inner)) return inner;
  return [];
};

// =====================
// Public API (No Auth Required)
// =====================

export const getPublicSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await apiClient.get<SubscriptionPlansResponse>('/api/public/subscription-plans');
  return response.data.data;
};

// Types for subscription application
export interface SubscriptionApplicationBody {
  subscription_plan_id: number;
  full_name: string;
  email: string;
  phone: string;
  bidan_name: string;
  full_address: string;
  city?: string;
  province?: string;
  str_number?: string;
  sip_number?: string;
  document_url?: string;
}

export interface SubscriptionApplicationResponse {
  data: {
    id: number;
    application_id?: number;
    full_name?: string;
    email?: string;
    phone?: string;
    bidan_name: string;
    full_address?: string;
    subscription_plan_id?: number;
    status: 'pending' | 'approved' | 'rejected';
    submitted_at: string;
  };
}

export interface ApplicationStatusCheckResult {
  application_id: number;
  status: 'pending' | 'approved' | 'rejected';
  full_name?: string;
  bidan_name: string;
  plan_name?: string;
  province?: string;
  city?: string;
  district?: string;
  submitted_at: string;
  approved_at?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
}

export const createSubscriptionApplication = async (
  data: SubscriptionApplicationBody | FormData
): Promise<SubscriptionApplicationResponse['data']> => {
  const isFormData = data instanceof FormData;
  const response = await apiClient.post<SubscriptionApplicationResponse>(
    '/api/public/bidan-applications',
    data,
    isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : undefined
  );
  return response.data.data;
};

export const checkPublicApplicationStatus = async (
  email: string
): Promise<ApplicationStatusCheckResult> => {
  const response = await apiClient.get<{ status: string; data: ApplicationStatusCheckResult }>(
    '/api/public/bidan-applications/status',
    { params: { email } }
  );
  return response.data.data;
};
