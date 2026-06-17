'use client';

import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

export function useMe() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: isAuthenticated,
    retry: false,
  });
}
