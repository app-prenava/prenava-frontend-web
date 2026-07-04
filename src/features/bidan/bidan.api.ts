import api from '@/lib/apiClient';
// import { GetAllUsersResponse } from '@/features/admin/admin.types';

// Ibu hamil user with embedded profile fields from users_profile
export type IbuHamilUser = {
  user_id: number;
  name: string;
  email: string;
  role?: 'ibu_hamil';
  is_active: number;
  created_at?: string;
  updated_at?: string;
  profile?: {
    photo?: string | null;
    tanggal_lahir?: string | null;
    usia?: number | string | null;
    alamat?: string | null;
    no_telepon?: string | null;
    pendidikan_terakhir?: string | null;
    pekerjaan?: string | null;
    golongan_darah?: string | null;
  } | null;
  // Some backends might flatten profile fields at top-level
  photo?: string | null;
  tanggal_lahir?: string | null;
  usia?: number | string | null;
  alamat?: string | null;
  no_telepon?: string | null;
  pendidikan_terakhir?: string | null;
  pekerjaan?: string | null;
  golongan_darah?: string | null;
};

export type GetIbuHamilUsersResponse = {
  status?: string;
  message?: string;
  data: IbuHamilUser[];
};

export const getIbuHamilUsers = async (): Promise<GetIbuHamilUsersResponse> => {
  // Ambil daftar pengguna role ibu_hamil dari endpoint baru yang Anda set
  const res = await api.get<GetIbuHamilUsersResponse>('/api/bidan/ibu-hamil');

  const raw = res?.data ?? {};
  // Normalisasi berbagai kemungkinan bentuk respons BE
  const list: IbuHamilUser[] = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw)
        ? raw
        : [];

  return {
    status: raw.status ?? 'success',
    message: raw.message ?? '',
    data: list,
  };
};

// ============================================
// Health History & Analytics Types
// ============================================

export interface ExpressionScores {
  Sad: number;
  Fear: number;
  Angry: number;
  Happy: number;
  Disgust: number;
  Neutral: number;
  Surprise: number;
}

export interface FatigueAnalysis {
  score: number;
  probabilities: {
    Fatigue: number;
    NonFatigue: number;
  };
}

export interface DepressionPrediction {
  level: string;
  score: number;
  fatigue: FatigueAnalysis;
  expression: {
    score: number;
    probabilities: ExpressionScores;
  };
  face_detected: boolean;
  face_confidence: number;
  success: boolean;
  disclaimer: string;
}

export interface AnemiaDetection {
  label: string;
  confidence: number;
  threshold_used: number;
  probability_anemia: number;
  probability_non_anemia: number;
}

export interface HealthHistoryRecord {
  id: number;
  user_id: number;
  user_name?: string;
  type: 'depression' | 'anemia'; // Unified table: type field
  result: string; // JSON string containing prediction data
  created_at: string;
  updated_at?: string;
  // Legacy fields (for backwards compatibility)
  depression_prediction?: DepressionPrediction | string;
  anemia_detection?: AnemiaDetection | string;
  recommendations?: any;
  [key: string]: any;
}

export interface HealthHistoryResponse {
  status: 'success' | 'error';
  message: string;
  data: HealthHistoryRecord[];
}

// Aggregated Analytics Types
export interface DepressionAnalytics {
  summary: {
    safe: number;
    detected: number;
  };
  expressionScores?: ExpressionScores;
  overallScore?: number;
}

export interface AnemiaAnalytics {
  categories: {
    anemia_ringan: number;
    anemia: number;
    anemia_sedang: number;
  };
}

export interface StuntingPrediction {
  status: string;
  probability: number;
  stunting_risk: string; // "Rendah", "Sedang", "Tinggi"
  threshold_used: number;
  prediction_class: number;
}

export interface StuntingHistoryRecord {
  id: number;
  user_id?: number;
  user_name?: string;
  date: string;
  status: string;
  riskLevel: number; // 0 = Rendah, 1 = Tinggi (numeric mapping from backend)
  score: number;
  user?: {
    user_id: number;
    name: string;
    email: string;
  };
  [key: string]: any;
}

export interface StuntingHistoryResponse {
  success: boolean;
  message?: string;
  data: StuntingHistoryRecord[] | null;
}

export interface StuntingAnalytics {
  totalPredictions: number;
  riskCategories: {
    rendah: number;
    tinggi: number;
  };
}

// ============================================
// Health History API
// ============================================

export const getHealthHistory = async (): Promise<HealthHistoryResponse> => {
  console.log('[API] Fetching health history from /api/health/history');
  const { data } = await api.get<HealthHistoryResponse>('/api/health/history');
  console.log('[API] Health history response:', {
    status: data.status,
    message: data.message,
    recordCount: data.data?.length || 0,
  });
  
  return data;
};

// ============================================
// Stunting History API
// ============================================

export const getStuntingHistory = async (): Promise<StuntingHistoryResponse> => {
  console.log('[API] Fetching stunting history from /api/stunting/history');
  const { data } = await api.get<StuntingHistoryResponse>('/api/stunting/history');
  console.log('[API] Stunting history response:', {
    success: data.success,
    message: data.message,
    recordCount: data.data?.length || 0,
  });
  
  return data;
};

// ============================================
// Analytics Aggregation Functions
// ============================================

export const aggregateDepressionAnalytics = (records: HealthHistoryRecord[]): DepressionAnalytics => {
  console.log('[DEPRESSION] Starting aggregation with', records.length, 'records');
  
  let safe = 0;
  let detected = 0;
  const allExpressionScores: ExpressionScores[] = [];
  const allScores: number[] = [];

  // Filter for depression records only (type === 'depression')
  const depressionRecords = records.filter(r => r.type === 'depression');
  console.log('[DEPRESSION] Filtered to', depressionRecords.length, 'depression records from', records.length, 'total');

  depressionRecords.forEach((record, index) => {
    // Parse the result field (JSON string)
    console.log(`[DEPRESSION] Record ${index}:`, {
      type: record.type,
      hasResult: !!record.result,
      result: record.result,
    });

    if (!record.result) {
      console.log(`[DEPRESSION] Record ${index}: No result field, skipping`);
      return;
    }

    let pred: any = record.result;
    
    // Parse if it's a string
    if (typeof record.result === 'string') {
      console.log(`[DEPRESSION] Record ${index}: result is a string, parsing...`);
      try {
        pred = JSON.parse(record.result);
        console.log(`[DEPRESSION] Record ${index}: Successfully parsed`, pred);
      } catch (e) {
        console.error(`[DEPRESSION] Record ${index}: Failed to parse JSON`, e);
        return;
      }
    }

    console.log(`[DEPRESSION] Record ${index}: Parsed prediction object:`, pred);

    // Aggregate depression levels based on actual level text
    // Levels can be: "Indikator depresi tidak signifikan" (safe) or "Terdapat beberapa indikator depresi" (detected)
    const level = (pred.level || pred.depression_level || '').toLowerCase();
    console.log(`[DEPRESSION] Record ${index}: Level field = "${level}"`);
    
    // Check if it contains "indikator depresi" AND is NOT "tidak signifikan"
    const isDepressed = level.includes('indikator depresi') && !level.includes('tidak signifikan');
    console.log(`[DEPRESSION] Record ${index}: Is depressed? ${isDepressed}`);
    
    if (isDepressed) {
      detected++;
      console.log(`[DEPRESSION] Record ${index}: Marked as DETECTED. Total detected: ${detected}`);
    } else {
      safe++;
      console.log(`[DEPRESSION] Record ${index}: Marked as SAFE. Total safe: ${safe}`);
    }

    // Collect expression scores and overall scores
    if (pred.expression?.probabilities) {
      allExpressionScores.push(pred.expression.probabilities);
      console.log(`[DEPRESSION] Record ${index}: Added expression scores`);
    }
    if (pred.score) {
      allScores.push(pred.score);
      console.log(`[DEPRESSION] Record ${index}: Added score ${pred.score}`);
    }
  });

  console.log('[DEPRESSION] Aggregation complete:', { safe, detected, totalScores: allScores.length });

  // Calculate average expression scores
  const avgExpressionScores = averageExpressionScores(allExpressionScores);
  const avgScore = allScores.length > 0 ? allScores.reduce((a, b) => a + b) / allScores.length : 0;

  console.log('[DEPRESSION] Final result:', { safe, detected, avgScore, hasExpressionScores: !!avgExpressionScores });

  return {
    summary: { safe, detected },
    expressionScores: avgExpressionScores,
    overallScore: avgScore,
  };
};

export const aggregateAnemiaAnalytics = (records: HealthHistoryRecord[]): AnemiaAnalytics => {
  console.log('[ANEMIA] Starting aggregation with', records.length, 'records');
  
  let anemia = 0;
  let nonAnemia = 0;

  // Filter for anemia records only (type === 'anemia')
  const anemiaRecords = records.filter(r => r.type === 'anemia');
  console.log('[ANEMIA] Filtered to', anemiaRecords.length, 'anemia records from', records.length, 'total');

  anemiaRecords.forEach((record, index) => {
    // Parse the result field (JSON string)
    console.log(`[ANEMIA] Record ${index}:`, {
      type: record.type,
      hasResult: !!record.result,
      result: record.result,
    });

    if (!record.result) {
      console.log(`[ANEMIA] Record ${index}: No result field, skipping`);
      return;
    }

    let det: any = record.result;
    
    // Parse if it's a string
    if (typeof record.result === 'string') {
      console.log(`[ANEMIA] Record ${index}: result is a string, parsing...`);
      try {
        det = JSON.parse(record.result);
        console.log(`[ANEMIA] Record ${index}: Successfully parsed`, det);
      } catch (e) {
        console.error(`[ANEMIA] Record ${index}: Failed to parse JSON`, e);
        return;
      }
    }

    console.log(`[ANEMIA] Record ${index}: Parsed detection object:`, det);

    // Count based on label: must be exactly "non-anemia" (with hyphen or space) OR exactly "anemia"
    const label = (det.label || '').toLowerCase().trim();
    console.log(`[ANEMIA] Record ${index}: Label field = "${label}"`);
    
    if (label === 'anemia') {
      anemia++;
      console.log(`[ANEMIA] Record ${index}: Marked as ANEMIA. Total anemia: ${anemia}`);
    } else if (label === 'non-anemia' || label === 'non anemia') {
      nonAnemia++;
      console.log(`[ANEMIA] Record ${index}: Marked as NON-ANEMIA. Total non-anemia: ${nonAnemia}`);
    } else {
      console.log(`[ANEMIA] Record ${index}: Label doesn't match any category (label: "${label}")`);
    }
  });

  console.log('[ANEMIA] Aggregation complete:', { anemia, nonAnemia });
  console.log('[ANEMIA] Final result:', { 
    anemia_ringan: 0, 
    anemia, 
    anemia_sedang: nonAnemia 
  });

  return {
    categories: {
      anemia_ringan: 0,
      anemia: anemia,
      anemia_sedang: nonAnemia,
    },
  };
};

function averageExpressionScores(allScores: ExpressionScores[]): ExpressionScores | undefined {
  if (allScores.length === 0) return undefined;

  const emotions = ['Sad', 'Fear', 'Angry', 'Happy', 'Disgust', 'Neutral', 'Surprise'] as const;
  const avgScores: any = {};

  emotions.forEach(emotion => {
    const scores = allScores.map(s => s[emotion] || 0);
    avgScores[emotion] = scores.reduce((a, b) => a + b) / scores.length;
  });

  return avgScores;
}

// ============================================
// Stunting Analytics Aggregation
// ============================================

export const aggregateStuntingAnalytics = (records: StuntingHistoryRecord[]): StuntingAnalytics => {
  console.log('[STUNTING] Starting aggregation with', records.length, 'records');
  
  let rendah = 0;
  let tinggi = 0;

  records.forEach((record, index) => {
    console.log(`[STUNTING] Record ${index}:`, {
      id: record.id,
      riskLevel: record.riskLevel,
      type: typeof record.riskLevel,
    });

    if (record.riskLevel === null || record.riskLevel === undefined) {
      console.log(`[STUNTING] Record ${index}: No riskLevel field, skipping`);
      return;
    }

    // Map numeric risk levels to categories: 0 = Rendah, 1 = Tinggi
    // riskLevel is always numeric from backend mapping
    if (record.riskLevel === 0) {
      rendah++;
      console.log(`[STUNTING] Record ${index}: Marked as RENDAH. Total: ${rendah}`);
    } else if (record.riskLevel === 1) {
      tinggi++;
      console.log(`[STUNTING] Record ${index}: Marked as TINGGI. Total: ${tinggi}`);
    } else {
      console.log(`[STUNTING] Record ${index}: Risk level doesn't match expected values (riskLevel: ${record.riskLevel}). Expected 0 or 1.`);
    }
  });

  console.log('[STUNTING] Aggregation complete:', { rendah, tinggi });

  return {
    totalPredictions: records.length,
    riskCategories: {
      rendah,
      tinggi,
    },
  };
}

export type BidanProfile = {
  tempat_praktik: string;
  alamat_praktik: string;
  kota_tempat_praktik: string;
  kecamatan_tempat_praktik: string;
  telepon_tempat_praktik: string;
  spesialisasi: string;
  photo?: string | null;
};

export type GetBidanProfileResponse = {
  message: string;
  data: BidanProfile & { photo?: string | null };
};

export type UpdateBidanProfileBody = BidanProfile;

export type UpdateBidanProfileResponse = {
  message: string;
};

export const getBidanProfile = async () => {
  const { data } = await api.get<GetBidanProfileResponse>('/api/profile');
  return data;
};

// Create profile (used when profile does not yet exist)
export const createBidanProfile = async (body: UpdateBidanProfileBody | FormData) => {
  const { data } = await api.post<UpdateBidanProfileResponse>('/api/profile/create', body);
  return data;
};

// Update profile (accepts JSON body or FormData when including a file)
export const updateBidanProfile = async (body: UpdateBidanProfileBody | FormData) => {
  const { data } = await api.post<UpdateBidanProfileResponse>('/api/profile/update', body);
  return data;
};