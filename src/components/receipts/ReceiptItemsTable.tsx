'use client';

import { useCallback } from 'react';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import { ReceiptDraftItem, ReceiptItem } from '@/types/receipt';
import Button from '@/components/ui/Button';
import { formatUSD } from '@/utils/currency';
import { recalcItem, calcSubtotal, calcTotalTax, calcTotal } from '@/utils/receiptCalculations';

interface ReceiptItemsTableProps {
  items: ReceiptDraftItem[];
  onChange: (items: ReceiptDraftItem[]) => void;
}

function newItem(): ReceiptDraftItem {
  return {
    _key: Math.random().toString(36).slice(2),
    descricao_servico: '',
    veiculo: '',
    vin: '',
    quantidade: 1,
    valor_unitario: 0,
    tax_percent: 0,
    tax_amount: 0,
    valor_total: 0,
  };
}

export default function ReceiptItemsTable({ items, onChange }: ReceiptItemsTableProps) {
  const updateItem = useCallback(
    (key: string, field: keyof ReceiptItem, value: string | number) => {
      const updated = items.map((item) => {
        if (item._key !== key) return item;
        const next = { ...item, [field]: value };
        return recalcItem(next) as ReceiptDraftItem;
      });
      onChange(updated);
    },
    [items, onChange]
  );

  const addItem = () => onChange([...items, newItem()]);

  const removeItem = (key: string) => onChange(items.filter((i) => i._key !== key));

  const subtotal = calcSubtotal(items);
  const totalTax = calcTotalTax(items);
  const total = calcTotal(items);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-[#1a3a6b] text-white">
              <th className="text-left py-3 px-3 font-semibold text-xs uppercase tracking-wide">Descrição</th>
              <th className="text-left py-3 px-3 font-semibold text-xs uppercase tracking-wide">Veículo</th>
              <th className="text-left py-3 px-3 font-semibold text-xs uppercase tracking-wide">VIN</th>
              <th className="text-center py-3 px-3 font-semibold text-xs uppercase tracking-wide w-16">Qtd</th>
              <th className="text-right py-3 px-3 font-semibold text-xs uppercase tracking-wide w-28">Unit Price</th>
              <th className="text-center py-3 px-3 font-semibold text-xs uppercase tracking-wide w-20">TAX %</th>
              <th className="text-right py-3 px-3 font-semibold text-xs uppercase tracking-wide w-24">Tax Amt</th>
              <th className="text-right py-3 px-3 font-semibold text-xs uppercase tracking-wide w-28">Amount</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 text-sm">
                  Nenhum item adicionado. Clique em &quot;+ Adicionar item&quot; abaixo.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item._key} className="hover:bg-slate-50 group">
                <td className="py-2 px-3">
                  <input
                    className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[140px]"
                    placeholder="Ex: Front windshield"
                    value={item.descricao_servico}
                    onChange={(e) => updateItem(item._key, 'descricao_servico', e.target.value)}
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
                    placeholder="Ex: 2010 Subaru Legacy"
                    value={item.veiculo}
                    onChange={(e) => updateItem(item._key, 'veiculo', e.target.value)}
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
                    placeholder="VIN..."
                    value={item.vin}
                    onChange={(e) => updateItem(item._key, 'vin', e.target.value)}
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="number"
                    min={1}
                    className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={item.quantidade}
                    onChange={(e) => updateItem(item._key, 'quantidade', Number(e.target.value))}
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={item.valor_unitario}
                    onChange={(e) => updateItem(item._key, 'valor_unitario', Number(e.target.value))}
                  />
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={item.tax_percent}
                      onChange={(e) => updateItem(item._key, 'tax_percent', Number(e.target.value))}
                    />
                    <span className="ml-1 text-slate-400 text-xs">%</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-right text-slate-600 tabular-nums">
                  {formatUSD(item.tax_amount)}
                </td>
                <td className="py-2 px-3 text-right font-semibold text-slate-800 tabular-nums">
                  {formatUSD(item.valor_total)}
                </td>
                <td className="py-2 px-3">
                  <button
                    onClick={() => removeItem(item._key)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1 rounded"
                    title="Remover item"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button variant="outline" size="sm" icon={<FiPlus size={14} />} onClick={addItem}>
        Adicionar item manualmente
      </Button>

      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal antes de impostos:</span>
            <span className="tabular-nums">{formatUSD(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Total de impostos:</span>
            <span className="tabular-nums">{formatUSD(totalTax)}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-800 text-base border-t border-slate-200 pt-2 mt-2">
            <span>Total com impostos:</span>
            <span className="tabular-nums">{formatUSD(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
