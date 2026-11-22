import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export interface Province {
  code: string;
  name: string;
}

export interface Regency {
  code: string;
  province_code: string;
  name: string;
}

export interface District {
  code: string;
  regency_code: string;
  name: string;
}

export const getProvinces = async (): Promise<Province[]> => {
  const { data } = await apiClient.get<{ status: string; data: Province[] }>(
    '/api/public/regions/provinces'
  );
  return data.data ?? [];
};

export const getRegencies = async (provinceCode: string): Promise<Regency[]> => {
  if (!provinceCode) return [];
  const { data } = await apiClient.get<{ status: string; data: Regency[] }>(
    '/api/public/regions/regencies',
    { params: { province_code: provinceCode } }
  );
  return data.data ?? [];
};

export const getDistricts = async (regencyCode: string): Promise<District[]> => {
  if (!regencyCode) return [];
  const { data } = await apiClient.get<{ status: string; data: District[] }>(
    '/api/public/regions/districts',
    { params: { regency_code: regencyCode } }
  );
  return data.data ?? [];
};

export const useProvinces = () =>
  useQuery({
    queryKey: ['regions', 'provinces'],
    queryFn: getProvinces,
    staleTime: 24 * 60 * 60 * 1000,
  });

export const useRegencies = (provinceCode?: string) =>
  useQuery({
    queryKey: ['regions', 'regencies', provinceCode],
    queryFn: () => getRegencies(provinceCode!),
    enabled: !!provinceCode,
    staleTime: 24 * 60 * 60 * 1000,
  });

export const useDistricts = (regencyCode?: string) =>
  useQuery({
    queryKey: ['regions', 'districts', regencyCode],
    queryFn: () => getDistricts(regencyCode!),
    enabled: !!regencyCode,
    staleTime: 24 * 60 * 60 * 1000,
  });

