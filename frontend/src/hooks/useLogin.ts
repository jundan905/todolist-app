import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import { useAuthStore } from '../stores/useAuthStore';
import { getErrorMessage } from '../utils/errorUtils';
import type { LoginInput } from '../types/auth.types';

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (data) => {
      useAuthStore.getState().setToken(data.accessToken);
      useAuthStore.getState().setUser(data.user);
      void navigate('/todos');
    },
    onError: (error: unknown) => {
      return getErrorMessage(error);
    },
  });
}
