import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSubscriptionPlans,
  getSubscriptionPlan,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  toggleSubscriptionPlanStatus,
  getBidanApplications,
  getBidanApplication,
  approveApplication,
  rejectApplication,
  getBidanAccounts,
  getBidanAccount,
  createBidanAccount,
  toggleBidanStatus,
  getBidanLocations,
  getBidanLocation,
  setBidanLocation,
  updateBidanLocation,
  deleteBidanLocation,
  getBidansWithoutLocation,
  getPublicSubscriptionPlans,
} from '@/features/admin/bidanService.api';
import type {
  ApplicationStatus,
  CreateSubscriptionPlanBody,
  UpdateSubscriptionPlanBody,
  ApproveApplicationBody,
  RejectApplicationBody,
  CreateBidanAccountBody,
  SetBidanLocationBody,
  UpdateBidanLocationBody,
  ApplicationQueryParams,
  BidanQueryParams,
} from '@/features/admin/bidan.types';

// =====================
// Query Keys
// =====================

export const queryKeys = {
  subscriptionPlans: ['subscriptionPlans'] as const,
  subscriptionPlan: (id: number) => ['subscriptionPlan', id] as const,
  bidanApplications: (params?: ApplicationQueryParams) => ['bidanApplications', params] as const,
  bidanApplication: (id: number) => ['bidanApplication', id] as const,
  bidanAccounts: (params?: BidanQueryParams) => ['bidanAccounts', params] as const,
  bidanAccount: (id: number) => ['bidanAccount', id] as const,
  bidanLocations: ['bidanLocations'] as const,
  bidanLocation: (bidanId: number) => ['bidanLocation', bidanId] as const,
  bidansWithoutLocation: ['bidansWithoutLocation'] as const,
};

// =====================
// Subscription Plans Hooks
// =====================

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: queryKeys.subscriptionPlans,
    queryFn: getSubscriptionPlans,
  });
};

export const useSubscriptionPlan = (id: number) => {
  return useQuery({
    queryKey: queryKeys.subscriptionPlan(id),
    queryFn: () => getSubscriptionPlan(id),
    enabled: !!id,
  });
};

export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubscriptionPlanBody) => createSubscriptionPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionPlans });
    },
  });
};

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSubscriptionPlanBody }) =>
      updateSubscriptionPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionPlans });
    },
  });
};

export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteSubscriptionPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionPlans });
    },
  });
};

export const useToggleSubscriptionPlanStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => toggleSubscriptionPlanStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionPlans });
    },
  });
};

// =====================
// Bidan Applications Hooks
// =====================

export const useBidanApplications = (status?: ApplicationStatus) => {
  const params: ApplicationQueryParams = status ? { status } : {};

  return useQuery({
    queryKey: queryKeys.bidanApplications(params),
    queryFn: () => getBidanApplications(params),
  });
};

export const useBidanApplication = (id: number) => {
  return useQuery({
    queryKey: queryKeys.bidanApplication(id),
    queryFn: () => getBidanApplication(id),
    enabled: !!id,
  });
};

export const useApproveApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejection_reason }: { id: number; rejection_reason?: string }) =>
      rejection_reason
        ? rejectApplication(id, rejection_reason)
        : approveApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bidanApplications'] });
    },
  });
};

export const useRejectApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejection_reason }: { id: number; rejection_reason: string }) =>
      rejectApplication(id, rejection_reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bidanApplications'] });
    },
  });
};

// =====================
// Bidan Accounts Hooks
// =====================

export const useBidanAccounts = (params?: BidanQueryParams) => {
  return useQuery({
    queryKey: queryKeys.bidanAccounts(params),
    queryFn: () => getBidanAccounts(params),
  });
};

export const useBidanAccount = (id: number) => {
  return useQuery({
    queryKey: queryKeys.bidanAccount(id),
    queryFn: () => getBidanAccount(id),
    enabled: !!id,
  });
};

export const useCreateBidanAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBidanAccountBody) => createBidanAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bidanAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['bidanApplications'] });
    },
  });
};

export const useToggleBidanStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => toggleBidanStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bidanAccounts'] });
    },
  });
};

// =====================
// Bidan Locations Hooks
// =====================

export const useBidanLocations = () => {
  return useQuery({
    queryKey: queryKeys.bidanLocations,
    queryFn: getBidanLocations,
  });
};

export const useBidanLocation = (bidanId: number) => {
  return useQuery({
    queryKey: queryKeys.bidanLocation(bidanId),
    queryFn: () => getBidanLocation(bidanId),
    enabled: !!bidanId,
  });
};

export const useSetBidanLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bidanId, data }: { bidanId: number; data: SetBidanLocationBody }) =>
      setBidanLocation(bidanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bidanLocations });
      queryClient.invalidateQueries({ queryKey: ['bidanAccounts'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.bidansWithoutLocation });
    },
  });
};

export const useUpdateBidanLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bidanId, data }: { bidanId: number; data: UpdateBidanLocationBody }) =>
      updateBidanLocation(bidanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bidanLocations });
    },
  });
};

export const useDeleteBidanLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bidanId: number) => deleteBidanLocation(bidanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bidanLocations });
      queryClient.invalidateQueries({ queryKey: queryKeys.bidansWithoutLocation });
    },
  });
};

export const useBidansWithoutLocation = () => {
  return useQuery({
    queryKey: queryKeys.bidansWithoutLocation,
    queryFn: getBidansWithoutLocation,
  });
};

// =====================
// Public Hooks (No Auth Required)
// =====================

export const usePublicSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['publicSubscriptionPlans'],
    queryFn: getPublicSubscriptionPlans,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
