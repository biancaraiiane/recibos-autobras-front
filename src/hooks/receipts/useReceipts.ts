'use client';

import { useQuery } from '@tanstack/react-query';
import { getReceipts } from '@/services/receipts.service';
import { ReceiptFilters } from '@/types/receipt';

export function useReceipts(filters?: ReceiptFilters) {
  return useQuery({
    queryKey: ['receipts', filters],
    queryFn: () => getReceipts(filters),
    retry: 1,
  });
}
