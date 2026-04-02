import type { LoginInput, LoginResponse, SignupInput, SignupResponse } from '../types/auth.types';
import axiosInstance from './axiosInstance';

export async function signup(input: SignupInput): Promise<SignupResponse> {
  const response = await axiosInstance.post<SignupResponse>('/api/auth/signup', input);
  return response.data;
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const response = await axiosInstance.post<LoginResponse>('/api/auth/login', input);
  return response.data;
}

export async function logout(): Promise<void> {
  await axiosInstance.post('/api/auth/logout');
}
