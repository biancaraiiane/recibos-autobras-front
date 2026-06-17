'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { LoginPayload } from '@/types/user';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (response) => {
      const { user, token } = response.data;

      setAuth(user, token);
      router.push('/dashboard');
    },
  });
}