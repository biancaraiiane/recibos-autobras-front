'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReceipt } from '@/services/receipts.service';
import { CreateReceiptPayload } from '@/types/receipt';

export function useCreateReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReceiptPayload) => createReceipt(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
  });
}
