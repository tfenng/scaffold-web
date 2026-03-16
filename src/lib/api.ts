import axios from "axios";
import type {
  ApiErrorDetail,
  ApiErrorEnvelope,
  UserDetailEnvelope,
  UserListEnvelope,
  UserListFilter,
} from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
});

type CreateUserPayload = {
  uid: string;
  email?: string;
  name: string;
  used_name?: string;
  company?: string;
  birth?: string;
};

type UpdateUserPayload = {
  email?: string;
  name: string;
  used_name?: string;
  company?: string;
  birth?: string;
};

export const userApi = {
  getById: (id: number) => api.get<UserDetailEnvelope>(`/api/v1/users/${id}`),

  list: (filter: UserListFilter) =>
    api.get<UserListEnvelope>("/api/v1/users", { params: filter }),

  create: (data: CreateUserPayload) =>
    api.post<UserDetailEnvelope>("/api/v1/users", data),

  update: (id: number, data: UpdateUserPayload) =>
    api.put<UserDetailEnvelope>(`/api/v1/users/${id}`, data),

  delete: (id: number) => api.delete<void>(`/api/v1/users/${id}`),
};

export function getApiError(error: unknown): ApiErrorDetail | null {
  if (!axios.isAxiosError<ApiErrorEnvelope>(error)) {
    return null;
  }

  return error.response?.data?.error ?? null;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  return getApiError(error)?.message ?? fallback;
}

export default api;
