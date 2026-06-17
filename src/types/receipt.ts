export interface ReceiptItem {
  id?: string;
  descricao_servico: string;
  veiculo: string;
  vin: string;
  quantidade: number;
  valor_unitario: number;
  tax_percent: number;
  tax_amount: number;
  valor_total: number;
}

export interface ReceiptUser {
  nome: string;
  email: string;
}

export type ReceiptStatus = 'gerado' | 'pendente' | 'cancelado';

export interface Receipt {
  id: string;
  numero_recibo: string;
  cliente_nome: string;
  usuarios: ReceiptUser;
  pdf_url?: string;
  pdf_path?: string;
  total: number;
  total_tax: number;
  total_com_tax: number;
  status: ReceiptStatus;
  data_hora_geracao: string;
  itens?: ReceiptItem[];
}

export interface CreateReceiptPayload {
  cliente_nome: string;
  itens: Omit<ReceiptItem, 'id'>[];
}

export interface ReceiptFilters {
  search?: string;
  data_inicio?: string;
  data_fim?: string;
  page?: number;
  limit?: number;
}

export interface ReceiptListResponse {
  data: Receipt[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardStats {
  total_recibos: number;
  total_faturado: number;
  recibos_mes: number;
  ultimos_recibos: Receipt[];
}

export interface ReceiptDraftItem extends ReceiptItem {
  _key: string;
}
