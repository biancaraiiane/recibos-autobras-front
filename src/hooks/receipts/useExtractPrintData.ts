'use client';

import { useMutation } from '@tanstack/react-query';
import { extractMultiplePrints } from '@/services/receipts.service';

export function useExtractPrintData() {
  return useMutation({
    mutationFn: extractMultiplePrints,
  });
}
