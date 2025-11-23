import axiosClient from "@/lib/axiosclient";
import type { LoginCredentials, RegisterCredentials, UserDetails } from "./user.type";

export const USER_API_BASE = "/auth";

export async function login(payload: LoginCredentials): Promise<UserDetails> {
  const response = await axiosClient.post(`${USER_API_BASE}/login`, payload);
  return response.data;
}

export async function register(payload: RegisterCredentials): Promise<UserDetails> {
  const response = await axiosClient.post(`${USER_API_BASE}/register`, payload);

  return response.data;
}

export async function logout(): Promise<void> {
  await axiosClient.post(`${USER_API_BASE}/logout`);
}

export async function getMe(): Promise<UserDetails> {
  const response = await axiosClient.get(`${USER_API_BASE}/me`);
  return response.data;
}
