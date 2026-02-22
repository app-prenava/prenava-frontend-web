// Enums
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

// Subscription Plan
export interface SubscriptionPlan {
  subscription_plan_id: number; // Changed from 'id' to match backend response
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionPlanBody {
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  is_active?: boolean;
}

export interface UpdateSubscriptionPlanBody {
  name?: string;
  description?: string;
  price?: number;
  duration_days?: number;
  features?: string[];
  is_active?: boolean;
}

export interface SubscriptionPlansResponse {
  status: string;
  data: SubscriptionPlan[];
}

export interface SubscriptionPlanResponse {
  status: string;
  data: SubscriptionPlan;
}

// Bidan Application
export interface BidanApplication {
  id: number;
  nama: string;
  email: string;
  phone: string;
  bidan_name: string;
  str_number: string;
  sip_number: string;
  practice_address: string;
  plan_id: number;
  plan?: SubscriptionPlan;
  status: ApplicationStatus;
  rejection_reason?: string;
  documents?: string[];
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
  created_at: string;
  updated_at: string;
}

export interface BidanApplicationsResponse {
  status: string;
  data: BidanApplication[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface BidanApplicationResponse {
  status: string;
  data: BidanApplication;
}

export interface RejectApplicationBody {
  rejection_reason: string;
}

// Bidan Account
export interface BidanAccount {
  id: number;
  user_id: number;
  application_id?: number;
  email: string;
  bidan_name: string;
  str_number: string;
  sip_number: string;
  phone: string;
  profile_photo?: string;
  subscription_plan_id?: number;
  subscription_plan?: SubscriptionPlan;
  subscription_start?: string;
  subscription_end?: string;
  is_active: boolean;
  has_location: boolean;
  created_at: string;
  updated_at: string;
}

export interface BidanAccountsResponse {
  status: string;
  data: BidanAccount[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface BidanAccountResponse {
  status: string;
  data: BidanAccount;
}

export interface CreateBidanAccountBody {
  application_id: number;
  email: string;
  password: string;
}

export interface CreateBidanAccountResponse {
  status: string;
  data: {
    user_id: number;
    bidan_id: number;
    email: string;
    temporary_password?: string;
  };
  message: string;
}

// Bidan Location
export interface OperatingHours {
  day: string;
  open: string;
  close: string;
  is_closed?: boolean;
}

export interface BidanLocation {
  id: number;
  bidan_id: number;
  bidan?: BidanAccount;
<<<<<<< HEAD
  latitude: number;
  longitude: number;
=======
  lat: number;
  lng: number;
>>>>>>> af41c31 (feat: appointment bidan)
  address_label: string;
  full_address?: string;
  phone_override?: string;
  notes?: string;
  operating_hours?: OperatingHours[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BidanLocationsResponse {
  status: string;
  data: BidanLocation[];
}

export interface BidanLocationResponse {
  status: string;
  data: BidanLocation;
}

export interface SetBidanLocationBody {
<<<<<<< HEAD
  latitude: number;
  longitude: number;
=======
  lat: number;
  lng: number;
>>>>>>> af41c31 (feat: appointment bidan)
  address_label: string;
  full_address?: string;
  phone_override?: string;
  notes?: string;
  operating_hours?: OperatingHours[];
}

export interface UpdateBidanLocationBody extends Partial<SetBidanLocationBody> {
  is_active?: boolean;
}

// Appointment
export interface Appointment {
  id: number;
  bidan_id: number;
  bidan?: BidanAccount;
  patient_id: number;
  patient_name: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  notes?: string;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
}

export interface AppointmentsResponse {
  status: string;
  data: Appointment[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface AppointmentResponse {
  status: string;
  data: Appointment;
}

// Query params
export interface ApplicationQueryParams {
  status?: ApplicationStatus;
  page?: number;
  limit?: number;
  search?: string;
}

export interface BidanQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  has_location?: boolean;
  is_active?: boolean;
}
