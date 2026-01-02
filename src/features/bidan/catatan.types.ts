export interface CatatanIbu {
    catatan_id: number;
    user_id: number;
    nama_ibu: string;
    tanggal_kunjungan: string;
    status_kunjungan: "sedang_berlangsung" | "selesai";
    q1_demam: 0 | 1;
    q2_pusing: 0 | 1;
    q3_sulit_tidur: 0 | 1;
    q4_risiko_tb: 0 | 1;
    q5_gerakan_bayi: 0 | 1;
    q6_nyeri_perut: 0 | 1;
    q7_cairan_jalan_lahir: 0 | 1;
    q8_sakit_kencing: 0 | 1;
    q9_diare: 0 | 1;
    hasil_kunjungan: string | null;
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

export type UpdateCatatanIbuPayload = {
    hasil_kunjungan: string;
    status_kunjungan: "selesai";
};

export type UpdateCatatanIbuResponse = {
    status?: string;
    message?: string;
    data?: CatatanIbu;
};

