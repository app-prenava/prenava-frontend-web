import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/apiClient';
import type { Appointment, AppointmentsResponse, AppointmentResponse } from '@/features/admin/bidan.types';

// =====================
// API FUNCTIONS
// =====================

export const getBidanAppointments = async (): Promise<Appointment[]> => {
  const { data } = await api.get<AppointmentsResponse>('/api/bidan/appointments');
  const raw = data?.data;
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) {
    return (raw as any).data;
  }
  return [];
};

export const acceptAppointment = async (id: number, data: { confirmed_date: string; confirmed_time: string; notes?: string }): Promise<Appointment> => {
  const response = await api.patch<AppointmentResponse>(`/api/bidan/appointments/${id}/accept`, data);
  return response.data.data;
};

export const rejectAppointment = async (id: number, data: { rejection_reason: string }): Promise<Appointment> => {
  const response = await api.patch<AppointmentResponse>(`/api/bidan/appointments/${id}/reject`, data);
  return response.data.data;
};

export const completeAppointment = async (id: number): Promise<Appointment> => {
  const response = await api.patch<AppointmentResponse>(`/api/bidan/appointments/${id}/complete`);
  return response.data.data;
};

// =====================
// HOOKS
// =====================

export const useBidanAppointments = () => {
  return useQuery({
    queryKey: ['bidanAppointments'],
    queryFn: getBidanAppointments,
  });
};

export const useAcceptAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { confirmed_date: string; confirmed_time: string; notes?: string } }) =>
      acceptAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bidanAppointments'] });
    },
  });
};

export const useRejectAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { rejection_reason: string } }) =>
      rejectAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bidanAppointments'] });
    },
  });
};

export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => completeAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bidanAppointments'] });
    },
  });
};
