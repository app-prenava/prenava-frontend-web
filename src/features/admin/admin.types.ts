export type UserRole = 'admin' | 'bidan' | 'dinkes' | 'ibu_hamil';

export type CreateAccountBody = {
  name: string;
  email: string;
  password: string;
};

export type CreateAccountResponse = {
  status: 'success';
  message: string;
  data: {
    user_id: number;
    name: string;
    email: string;
    role: 'bidan' | 'dinkes';
    is_active: boolean;
  };
};

export type UserListItem = {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
};

export type UserListResponse = {
  status: string;
  users: UserListItem[];
};

export type ResetPasswordBody = {
  new_password: string;
};

export type ResetPasswordResponse = {
  status: string;
  message: string;
};
