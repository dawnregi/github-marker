import { useMutation, useQuery, type UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { login, register, logout, getMe } from './user.api';
import {  useNavigate } from '@tanstack/react-router';
import type { LoginCredentials, RegisterCredentials, UserDetails, ErrorResponse } from './user.type';
import { AxiosError } from 'axios';
import { getErrorMessage } from '@/utils/errorHandler';
import { useAuthStore } from '@/store/authStore';

export function useMe() {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  return useQuery<UserDetails, AxiosError<ErrorResponse>>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await getMe();
        setUser(data);
        return data;
      } catch (error) {
        setUser(null);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    retry: false,
    staleTime: Infinity,
  });
}

export function useLogin(): UseMutationResult<UserDetails, AxiosError<ErrorResponse>, LoginCredentials> {
  const navigate =useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setUser(data);
      toast.success('Login successful', {
        description: `Welcome back, ${data.name}!`,
      });
      navigate({ to: '/app/dashboard' });
    },
    onError: (error) => {
      toast.error('Login failed', {
        description: getErrorMessage(error),
      });
    },
  });
}


export function useRegister (): UseMutationResult<UserDetails, AxiosError<ErrorResponse>, RegisterCredentials> {
  const navigate =useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setUser(data);
      toast.success('Registration successful', {
        description: `Welcome, ${data.name}!`,
      });
      navigate({ to: '/app/dashboard' });
    },
    onError: (error) => {
      toast.error('Registration failed', {
        description: getErrorMessage(error),
      });
    },
  });
}


export function useLogout(): UseMutationResult<void, AxiosError<ErrorResponse>, void> {
  const navigate = useNavigate();
  const clearUser = useAuthStore((state) => state.clearUser);
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearUser();
      toast.success('Logout successful', {
        description: 'You have been logged out successfully.',
      });
      navigate({ to: '/auth/login' });
    },
    onError: (error) => {
      toast.error('Logout failed', {
        description: getErrorMessage(error),
      });
    },
  });
}

