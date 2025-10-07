export type LoginBody = { 
  email: string; 
  password: string; 
};

export type LoginResponse = {
  status: string;
  user: { 
    user_id: number; 
    name: string; 
    email: string; 
    role: 'admin' | 'bidan' | 'dinkes' | 'ibu_hamil'; 
  };
  authorization: { 
    token: string; 
    type: 'bearer'; 
    expires_in: number | null; 
  };
};

export type User = {
  user_id: number;
  name: string;
  email: string;
  role: 'admin' | 'bidan' | 'dinkes' | 'ibu_hamil';
};

export type MeResponse = {
  status: string;
  user: User;
};
