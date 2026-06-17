'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateReceiptPdf } from '@/services/receipts.service';

export function useGenerateReceiptPdf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => generateReceiptPdf(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      queryClient.invalidateQueries({ queryKey: ['receipt', data.id] });
    },
  });
}
