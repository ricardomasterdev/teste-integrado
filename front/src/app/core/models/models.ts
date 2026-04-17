export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  nome: string;
  role: string;
  expiresIn: number;
}

export interface Beneficio {
  id?: number;
  nome: string;
  descricao?: string;
  valor: number;
  ativo?: boolean;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type { PageResponse } from './pagination';

export interface TransferRequest {
  fromId: number;
  toId: number;
  amount: number;
}

export interface BeneficioTransferencia {
  id: number;
  beneficioOrigemId: number;
  beneficioOrigemNome?: string;
  beneficioDestinoId: number;
  beneficioDestinoNome?: string;
  valor: number;
  usuario: string;
  status: 'SUCCESS' | 'FAILED_INSUFFICIENT' | 'FAILED_LOCK' | 'FAILED' | 'FAILED_VALIDATION';
  mensagem: string;
  createdAt: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  code: string;
  message: string;
  path: string;
  details?: string[];
}

export interface AppUser {
  id?: number;
  username: string;
  nome: string;
  role: 'ADMIN' | 'USER';
  ativo?: boolean;
  createdAt?: string;
}

export interface AppUserCreateRequest {
  username: string;
  password: string;
  nome: string;
  role: 'ADMIN' | 'USER';
  ativo?: boolean;
}

export interface AppUserUpdateRequest {
  nome: string;
  role: 'ADMIN' | 'USER';
  ativo?: boolean;
  password?: string;
}

export interface LoginLog {
  id: number;
  username: string;
  nome?: string;
  ip?: string;
  userAgent?: string;
  sucesso: boolean;
  mensagem?: string;
  createdAt: string;
}
