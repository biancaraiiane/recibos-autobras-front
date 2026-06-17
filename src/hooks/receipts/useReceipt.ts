'use client';

import { useQuery } from '@tanstack/react-query';
import { getReceiptById } from '@/services/receipts.service';

export function useReceipt(id: string | null) {
  return useQuery({
    queryKey: ['receipt', id],
    queryFn: () => getReceiptById(id!),
    enabled: !!id,
  });
}
