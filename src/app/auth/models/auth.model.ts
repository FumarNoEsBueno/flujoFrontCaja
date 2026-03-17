export interface User {
  id: number;
  rut: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

export interface LoginRequest {
  rut: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';
