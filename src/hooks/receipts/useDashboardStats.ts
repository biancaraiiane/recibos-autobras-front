'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/services/receipts.service';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    retry: 1,
  });
}
