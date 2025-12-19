export interface TipCategory {
  id: number;
  name: string;
  slug: string;
  icon_name: string | null;
  icon_url: string | null;
  description: string | null;
  order: number;
  is_active: boolean;
  tips_count: number;
}

export interface PregnancyTip {
  id: number;
  judul: string;
  konten: string;
  category: {
    id: number;
    name: string;
    slug: string;
    icon_name: string | null;
    icon_url: string | null;
  } | null;
  created_by: {
    id: number;
    name: string;
  } | null;
  is_published: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export type GetAllTipCategoriesResponse = {
  status: 'success';
  message: string;
  data: TipCategory[];
};

export type CreateTipCategoryBody = {
  name: string;
  slug: string;
  icon_name?: string | null;
  icon_url?: string | null;
  description?: string | null;
  order?: number;
  is_active?: boolean;
};

export type CreateTipCategoryResponse = {
  status: 'success';
  message: string;
  data: TipCategory;
};

export type UpdateTipCategoryBody = Partial<Omit<CreateTipCategoryBody, 'is_active'>> & {
  is_active?: boolean | number;
};

export type UpdateTipCategoryResponse = {
  status: 'success';
  message: string;
  data: TipCategory;
};

export type GetAllTipsResponse = {
  status: 'success';
  message: string;
  data: PregnancyTip[];
};

export type GetTipByIdResponse = {
  status: 'success';
  message: string;
  data: PregnancyTip;
};

export type CreateTipBody = {
  category_id: number;
  judul: string;
  konten: string;
  is_published?: boolean;
  order?: number;
};

export type CreateTipResponse = {
  status: 'success';
  message: string;
  data: PregnancyTip;
};

export type UpdateTipBody = Partial<CreateTipBody>;

export type UpdateTipResponse = {
  status: 'success';
  message: string;
  data: PregnancyTip;
};

export type DeleteTipResponse = {
  status: 'success';
  message: string;
};

export type DeleteTipCategoryResponse = {
  status: 'success';
  message: string;
};


