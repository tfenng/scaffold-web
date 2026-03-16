export interface User {
  id: number;
  uid: string;
  email?: string;
  name: string;
  used_name: string;
  company: string;
  birth?: string;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
}

export interface UserDetailEnvelope {
  data: User;
}

export interface UserListEnvelope {
  data: User[];
  pagination: Pagination;
}

export interface UserListFilter {
  email?: string;
  name_like?: string;
  page?: number;
  page_size?: number;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export interface ApiErrorEnvelope {
  error: ApiErrorDetail;
}
