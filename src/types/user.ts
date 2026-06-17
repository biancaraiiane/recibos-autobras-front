export interface ApiResponse<T> {
  status: string;
  data: T;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface LoginData {
  token: string;
  user: User;
}

export type LoginResponse = ApiResponse<LoginData>;