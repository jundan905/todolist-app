import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api/authApi';
import { getErrorMessage } from '../utils/errorUtils';
import type { SignupInput } from '../types/auth.types';

export function useSignup() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: SignupInput) => signup(input),
    onSuccess: () => {
      void navigate('/login');
    },
    onError: (error: unknown) => {
      return getErrorMessage(error);
    },
  });
}
