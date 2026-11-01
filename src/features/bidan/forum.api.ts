import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/apiClient';

export interface GestationalContext {
  weeks: number | null;
  trimester: number | null;
  label: string;
}

export interface PatientInfo {
  id: number | string;
  name: string;
  actual_name?: string;
  profile_image?: string | null;
}

export interface ForumThreadItem {
  id: number;
  judul: string;
  deskripsi: string;
  kategori: string;
  kategori_label: string;
  is_anonymous: boolean;
  gestational_context: GestationalContext | null;
  has_bidan_reply: boolean;
  apresiasi: number;
  komen: number;
  gambar: string | null;
  created_at: string;
  updated_at: string;
  patient: PatientInfo;
}

export interface ForumCommentItem {
  id: number;
  user_id: number | string;
  author_name: string;
  author_role: string;
  komentar: string;
  is_bidan_reply: boolean;
  is_pinned: boolean;
  suggest_appointment: boolean;
  created_at: string;
}

export interface ForumThreadDetail extends ForumThreadItem {
  comments: ForumCommentItem[];
}

export interface ForumStats {
  needs_reply: number;
  validated: number;
  total: number;
}

export interface ForumThreadsResponse {
  status: string;
  stats: ForumStats;
  data: ForumThreadItem[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface BidanReplyPayload {
  komentar: string;
  suggest_appointment?: boolean;
}

// =====================
// API FUNCTIONS
// =====================

export const getBidanForumThreads = async (params: {
  tab?: 'needs_reply' | 'validated' | 'all';
  kategori?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ForumThreadsResponse> => {
  const queryParams = new URLSearchParams();
  if (params.tab) queryParams.append('tab', params.tab);
  if (params.kategori && params.kategori !== 'semua') queryParams.append('kategori', params.kategori);
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await api.get(`/bidan/forum/threads?${queryParams.toString()}`);
  return response.data;
};

export const getBidanThreadDetail = async (postId: number): Promise<{ status: string; data: ForumThreadDetail }> => {
  const response = await api.get(`/bidan/forum/threads/${postId}`);
  return response.data;
};

export const replyBidanThread = async (
  postId: number,
  payload: BidanReplyPayload
): Promise<{ status: string; message: string; data: any }> => {
  const response = await api.post(`/bidan/forum/threads/${postId}/reply`, payload);
  return response.data;
};

// =====================
// REACT QUERY HOOKS
// =====================

export const useBidanForumThreads = (params: {
  tab?: 'needs_reply' | 'validated' | 'all';
  kategori?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['bidan-forum-threads', params],
    queryFn: () => getBidanForumThreads(params),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useBidanThreadDetail = (postId: number | null) => {
  return useQuery({
    queryKey: ['bidan-thread-detail', postId],
    queryFn: () => getBidanThreadDetail(postId!),
    enabled: !!postId,
  });
};

export const useBidanReplyThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, payload }: { postId: number; payload: BidanReplyPayload }) =>
      replyBidanThread(postId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bidan-forum-threads'] });
      queryClient.invalidateQueries({ queryKey: ['bidan-thread-detail', variables.postId] });
    },
  });
};
