export interface CatatanIbu {
    catatan_id: number;
    user_id: number;
    nama_ibu: string;
    user?: {
        user_id: number;
        name: string;
        email?: string;
        phone?: string | null;
    } | null;
    tanggal_kunjungan: string;
    status_kunjungan: "sedang_berlangsung" | "selesai";
    q1_demam: 0 | 1 | boolean | null;
    q2_pusing: 0 | 1 | boolean | null;
    q3_sulit_tidur: 0 | 1 | boolean | null;
    q4_risiko_tb: 0 | 1 | boolean | null;
    q5_gerakan_bayi: 0 | 1 | boolean | null;
    q6_nyeri_perut: 0 | 1 | boolean | null;
    q7_cairan_jalan_lahir: 0 | 1 | boolean | null;
    q8_sakit_kencing: 0 | 1 | boolean | null;
    q9_diare: 0 | 1 | boolean | null;
    systolic_bp?: number | null;
    diastolic_bp?: number | null;
    weight_kg?: number | null;
    fundal_height_cm?: number | null;
    fetal_heart_rate_bpm?: number | null;
    hemoglobin_gdl?: number | null;
    therapy_notes?: string | null;
    next_visit_date?: string | null;
    hasil_kunjungan: string | null;
    pertanyaan?: Array<{
        id: string;
        pertanyaan: string;
        jawaban: boolean | number | null;
    }>;
    created_at?: string;
    updated_at?: string;
}

export type GetCatatanIbuListResponse = {
    status?: string;
    message?: string;
    data: CatatanIbu[];
};

export type GetCatatanIbuDetailResponse = {
    status?: string;
    message?: string;
    data: CatatanIbu | CatatanIbu[];
};

export type CreateCatatanIbuPayload = {
    user_id: number;
    tanggal_kunjungan: string;
    status_kunjungan?: "sedang_berlangsung" | "selesai";
    q1_demam?: boolean;
    q2_pusing?: boolean;
    q3_sulit_tidur?: boolean;
    q4_risiko_tb?: boolean;
    q5_gerakan_bayi?: boolean;
    q6_nyeri_perut?: boolean;
    q7_cairan_jalan_lahir?: boolean;
    q8_sakit_kencing?: boolean;
    q9_diare?: boolean;
    systolic_bp?: number | null;
    diastolic_bp?: number | null;
    weight_kg?: number | null;
    fundal_height_cm?: number | null;
    fetal_heart_rate_bpm?: number | null;
    hemoglobin_gdl?: number | null;
    therapy_notes?: string | null;
    next_visit_date?: string | null;
    hasil_kunjungan?: string | null;
};

export type UpdateCatatanIbuPayload = {
    hasil_kunjungan?: string;
    status_kunjungan?: "sedang_berlangsung" | "selesai";
    tanggal_kunjungan?: string;
    q1_demam?: boolean;
    q2_pusing?: boolean;
    q3_sulit_tidur?: boolean;
    q4_risiko_tb?: boolean;
    q5_gerakan_bayi?: boolean;
    q6_nyeri_perut?: boolean;
    q7_cairan_jalan_lahir?: boolean;
    q8_sakit_kencing?: boolean;
    q9_diare?: boolean;
    systolic_bp?: number | null;
    diastolic_bp?: number | null;
    weight_kg?: number | null;
    fundal_height_cm?: number | null;
    fetal_heart_rate_bpm?: number | null;
    hemoglobin_gdl?: number | null;
    therapy_notes?: string | null;
    next_visit_date?: string | null;
};

export type UpdateCatatanIbuResponse = {
    status?: string;
    message?: string;
    data?: CatatanIbu;
};
