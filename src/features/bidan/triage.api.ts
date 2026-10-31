import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/apiClient';

// =====================
// TYPES & INTERFACES
// =====================

export type TriageCategory = 'MERAH' | 'KUNING' | 'HIJAU';

export interface TriageBadge {
  color: string;
  bg: string;
  border: string;
  label: string;
  badge_class: string;
}

export interface TriageSubScores {
  stunting_weighted: number;
  anemia_weighted: number;
  bp_weighted: number;
  plate_weighted: number;
}

export interface CompletenessBadge {
  percentage: number;
  count: number;
  label: string;
  level: 'HIGH' | 'MODERATE' | 'LOW' | 'EMPTY' | string;
  badge_class: string;
  color: string;
  bg: string;
}

export interface CompletenessData {
  percentage: number;
  modalities_count: number;
  total_modalities: number;
  missing_modalities: string[];
  badge: CompletenessBadge;
}

export interface TriagePatientItem {
  triage_id: number;
  user_id: number;
  patient_name: string;
  patient_email: string;
  phone: string;
  gestational_age_weeks: number;
  pregnancy_status: string;
  triage_score: number;
  triage_category: TriageCategory;
  badge: TriageBadge;
  sub_scores: TriageSubScores;
  completeness?: CompletenessData;
  primary_alert: string;
  suggested_action: string;
  calculated_at: string;
}

export interface TriageSummary {
  critical_red: number;
  warning_yellow: number;
  stable_green: number;
}

export interface TriageQueueResponse {
  status: string;
  total_patients: number;
  summary: TriageSummary;
  data: TriagePatientItem[];
}

export interface TriageHistoryItem {
  id: number;
  user_id: number;
  pregnancy_id: number | null;
  triage_score: number;
  triage_category: TriageCategory;
  stunting_score: number;
  anemia_score: number;
  bp_score: number;
  plate_score: number;
  primary_alert: string;
  suggested_action: string;
  calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface PatientProfile {
  user_profile_id?: number;
  photo?: string | null;
  user_id?: number;
  tanggal_lahir?: string | null;
  usia?: number | null;
  alamat?: string | null;
  no_telepon?: string | null;
  pendidikan_terakhir?: string | null;
  pekerjaan?: string | null;
  golongan_darah?: string | null;
}

export interface PatientPregnancy {
  pregnancy_id: number;
  user_id: number;
  lmp_date?: string | null;
  gestational_age_weeks?: number | null;
  status?: string;
  multiple_gestation?: boolean;
}

export interface TriageDetailData {
  patient: {
    user_id: number;
    name: string;
    email: string;
    profile?: PatientProfile | null;
    pregnancies?: PatientPregnancy[];
  };
  latest_triage: TriagePatientItem | null;
  history: TriageHistoryItem[];
}

export interface TriageDetailResponse {
  status: string;
  patient: TriageDetailData['patient'];
  latest_triage: TriageDetailData['latest_triage'];
  history: TriageHistoryItem[];
}

export interface RecalculateResponse {
  status: string;
  message: string;
  data: TriagePatientItem;
}

// =====================
// API FUNCTIONS
// =====================

export const getTriageQueue = async (): Promise<TriageQueueResponse> => {
  const response = await api.get<TriageQueueResponse>('/api/bidan/patients/triage');
  return response.data;
};

export const getPatientTriageDetail = async (userId: number): Promise<TriageDetailResponse> => {
  const response = await api.get<TriageDetailResponse>(`/api/bidan/patients/${userId}/triage-detail`);
  return response.data;
};

export const recalculatePatientTriage = async (userId: number): Promise<RecalculateResponse> => {
  const response = await api.post<RecalculateResponse>(`/api/bidan/patients/${userId}/recalculate-triage`);
  return response.data;
};

// =====================
// HOOKS
// =====================

export const useTriageQueue = () => {
  return useQuery({
    queryKey: ['bidanTriageQueue'],
    queryFn: getTriageQueue,
    refetchInterval: 30000, // auto refetch every 30s
  });
};

export const usePatientTriageDetail = (userId: number | null) => {
  return useQuery({
    queryKey: ['bidanPatientTriageDetail', userId],
    queryFn: () => (userId ? getPatientTriageDetail(userId) : Promise.reject('No userId')),
    enabled: !!userId,
  });
};

export const useRecalculateTriage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => recalculatePatientTriage(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['bidanTriageQueue'] });
      queryClient.invalidateQueries({ queryKey: ['bidanPatientTriageDetail', userId] });
    },
  });
};
