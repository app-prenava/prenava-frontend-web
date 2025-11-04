export type Shop = {
  product_id: number;
  photo: string;
  product_name: string;
  price: number;
  user_id: number;
  url: string;
  created_at: string;
};

export type ShopResponse = {
  status: string;
  message?: string;
  data: Shop[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
};

export type DeleteShopResponse = {
  status: string;
  message: string;
};

export type ShopLog = {
  shop_logs_id: number;
  user_id: number;
  action: 'create' | 'update' | 'delete' | 'admin_delete';
  data_snapshot: Record<string, any>;
  is_admin: boolean;
  created_at: string;
};

export type ShopLogsResponse = {
  status: string;
  data: ShopLog[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
};

