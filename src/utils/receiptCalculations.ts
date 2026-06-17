import { ReceiptItem } from '@/types/receipt';

export function calcItemTaxAmount(item: Pick<ReceiptItem, 'quantidade' | 'valor_unitario' | 'tax_percent'>): number {
  const qty = item.quantidade || 0;
  const price = item.valor_unitario || 0;
  const tax = item.tax_percent || 0;
  return qty * price * (tax / 100);
}

export function calcItemTotal(item: Pick<ReceiptItem, 'quantidade' | 'valor_unitario' | 'tax_percent'>): number {
  const qty = item.quantidade || 0;
  const price = item.valor_unitario || 0;
  const taxAmount = calcItemTaxAmount(item);
  return qty * price + taxAmount;
}

export function calcSubtotal(items: ReceiptItem[]): number {
  return items.reduce((acc, item) => acc + (item.quantidade || 0) * (item.valor_unitario || 0), 0);
}

export function calcTotalTax(items: ReceiptItem[]): number {
  return items.reduce((acc, item) => acc + (item.tax_amount || 0), 0);
}

export function calcTotal(items: ReceiptItem[]): number {
  return calcSubtotal(items) + calcTotalTax(items);
}

export function recalcItem(item: ReceiptItem): ReceiptItem {
  const tax_amount = calcItemTaxAmount(item);
  const valor_total = calcItemTotal(item);
  return { ...item, tax_amount, valor_total };
}
