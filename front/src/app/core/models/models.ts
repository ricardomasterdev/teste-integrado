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

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface TransferRequest {
  fromId: number;
  toId: number;
  amount: number;
}

export interface BeneficioTransferencia {
  id: number;
  beneficioOrigemId: number;
  beneficioDestinoId: number;
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
