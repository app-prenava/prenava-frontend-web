export type UserRole = 'admin' | 'bidan' | 'dinkes' | 'ibu_hamil';

export type User = {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type GetAllUsersResponse = {
  status: 'success';
  message: string;
  data: User[];
};

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

// Keep old types for backward compatibility
export type UserListItem = User;
export type UserListResponse = GetAllUsersResponse;

export type ResetPasswordBody = {
  new_password: string;
};

export type ResetPasswordResponse = {
  status: string;
  message: string;
};
