'use client';

import { useMutation } from '@tanstack/react-query';
import { downloadReceiptPdf } from '@/services/receipts.service';

export function useDownloadReceiptPdf() {
  return useMutation({
    mutationFn: ({ id, numeroRecibo }: { id: string; numeroRecibo: string }) =>
      downloadReceiptPdf(id, numeroRecibo),
  });
}
