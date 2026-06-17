import api from './api';
import {
  Receipt,
  ReceiptItem,
  CreateReceiptPayload,
  ReceiptFilters,
  ReceiptListResponse,
  DashboardStats,
} from '@/types/receipt';

export interface ExtractPrintResult {
  rawText: string;
  items: ReceiptItem[];
}

export async function extractPrintData(file: File): Promise<ExtractPrintResult> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<{ status: string; data: ExtractPrintResult }>(
    '/receipts/extract-print',
    formData,
    { headers: { 'Content-Type': undefined } }
  );
  return data.data;
}

export async function extractMultiplePrints(files: File[]): Promise<{
  rawTexts: string[];
  items: ReceiptItem[];
}> {
  const results = await Promise.allSettled(files.map(extractPrintData));
  const rawTexts: string[] = [];
  const items: ReceiptItem[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      rawTexts.push(result.value.rawText);
      items.push(...result.value.items);
    }
  }
  return { rawTexts, items };
}

export async function getReceipts(params?: ReceiptFilters): Promise<ReceiptListResponse> {
  const { data } = await api.get('/receipts', { params });
  // backend returns { status, data: [...], meta: { total, page, limit, totalPages } }
  const receipts: Receipt[] = Array.isArray(data?.data) ? data.data : (data?.data?.data ?? []);
  const meta = data?.meta ?? {};
  return {
    data: receipts,
    total: meta.total ?? data?.total ?? 0,
    page: meta.page ?? data?.page ?? 1,
    limit: meta.limit ?? data?.limit ?? 20,
  };
}

export async function getReceiptById(id: string): Promise<Receipt> {
  const { data } = await api.get(`/receipts/${id}`);
  return data?.data ?? data;
}

export async function createReceipt(payload: CreateReceiptPayload): Promise<Receipt> {
  const { data } = await api.post<{ status: string; data: Receipt }>('/receipts', payload);
  console.log('[createReceipt] raw response:', JSON.stringify(data));
  return data.data ?? (data as unknown as Receipt);
}

export async function generateReceiptPdf(id: string): Promise<Receipt> {
  const { data } = await api.post<{ status: string; data: Receipt }>(`/receipts/${id}/generate-pdf`);
  console.log('[generateReceiptPdf] raw response:', JSON.stringify(data));
  return data.data ?? (data as unknown as Receipt);
}

export async function getReceiptPdfUrl(id: string): Promise<{ url: string }> {
  const { data } = await api.get<{ url: string }>(`/receipts/${id}/pdf`);
  return data;
}

export async function downloadReceiptPdf(id: string, numeroRecibo: string): Promise<void> {
  const response = await api.get(`/receipts/${id}/pdf`, { responseType: 'blob' });

  const contentType = response.headers['content-type'];
  if (typeof contentType === 'string' && contentType.includes('application/json')) {
    const text = await response.data.text();
    const json = JSON.parse(text);
    if (json.url) {
      window.open(json.url, '_blank');
      return;
    }
  }

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `receipt-${numeroRecibo}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const { data } = await api.get<{ status: string; data: DashboardStats } | DashboardStats>('/receipts/stats');
    const stats = (data as { data: DashboardStats }).data ?? (data as DashboardStats);
    if (stats?.total_recibos !== undefined) return stats;
    throw new Error('empty');
  } catch {
    try {
      const receiptsData = await getReceipts({ limit: 100 });
      const receipts = receiptsData.data ?? [];
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      return {
        total_recibos: receiptsData.total ?? receipts.length,
        total_faturado: receipts.reduce((s, r) => s + (r.total_com_tax || r.total || 0), 0),
        recibos_mes: receipts.filter((r) => new Date(r.data_hora_geracao) >= startOfMonth).length,
        ultimos_recibos: receipts.slice(0, 5),
      };
    } catch {
      return { total_recibos: 0, total_faturado: 0, recibos_mes: 0, ultimos_recibos: [] };
    }
  }
}
