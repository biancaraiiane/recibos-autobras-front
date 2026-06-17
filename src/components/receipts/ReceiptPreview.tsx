'use client';

import { ReceiptDraftItem } from '@/types/receipt';
import { formatUSD, formatUSDPlain } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { calcSubtotal, calcTotalTax, calcTotal } from '@/utils/receiptCalculations';

interface ReceiptPreviewProps {
  clienteNome: string;
  items: ReceiptDraftItem[];
  numeroRecibo?: string;
}

export default function ReceiptPreview({ clienteNome, items, numeroRecibo }: ReceiptPreviewProps) {
  const today = new Date().toISOString();
  const subtotal = calcSubtotal(items);
  const totalTax = calcTotalTax(items);
  const total = calcTotal(items);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div className="w-48 h-20 flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-autobras.png"
            alt="Autobras"
            className="max-w-full max-h-full object-contain object-left"
          />
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-light text-slate-800 tracking-tight">RECEIPT</h1>
          <p className="text-sm text-slate-500 mt-1">TAX RECEIPT</p>
          <div className="mt-3 text-sm text-slate-700">
            <p className="font-semibold">Autobras LLC</p>
            <p>Henderson pass</p>
            <p>San Antonio</p>
            <p>United States</p>
          </div>
          <p className="text-sm text-slate-600 mt-2">+1 210 589 0667</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Bill To</p>
          <p className="font-semibold text-slate-800">{clienteNome || '—'}</p>
          <p className="text-sm text-slate-500">United States</p>
        </div>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Receipt Nº:</span>
            <span className="font-medium text-slate-800">
              {numeroRecibo && numeroRecibo !== '—' ? numeroRecibo : (
                <span className="text-slate-400 italic text-xs">Auto-generated</span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Issue date:</span>
            <span className="font-medium text-slate-800">{formatDate(today)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Due date:</span>
            <span className="font-medium text-slate-800">{formatDate(today)}</span>
          </div>
        </div>
      </div>

      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="bg-[#4d94d8] text-white">
            <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide">Description</th>
            <th className="text-center py-3 px-3 font-semibold text-xs uppercase tracking-wide w-16">Qty</th>
            <th className="text-right py-3 px-3 font-semibold text-xs uppercase tracking-wide w-28">Unit Price (USD)</th>
            <th className="text-right py-3 px-3 font-semibold text-xs uppercase tracking-wide w-20">Tax</th>
            <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wide w-28">Amount (USD)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item, i) => (
            <tr key={item._key || i} className="align-top">
              <td className="py-3 px-4 text-slate-700">
                <p>{item.descricao_servico || '—'}</p>
                {item.veiculo && <p className="text-xs text-slate-500">{item.veiculo}</p>}
                {item.vin && <p className="text-xs text-slate-400">Vin: {item.vin}</p>}
              </td>
              <td className="py-3 px-3 text-center text-slate-600">{item.quantidade}</td>
              <td className="py-3 px-3 text-right text-slate-600 tabular-nums">
                {formatUSDPlain(item.valor_unitario)}
              </td>
              <td className="py-3 px-3 text-right text-slate-600 tabular-nums">
                {item.tax_percent > 0 ? `${formatUSDPlain(item.tax_percent)}%` : '—'}
              </td>
              <td className="py-3 px-4 text-right font-medium text-slate-800 tabular-nums">
                {formatUSDPlain(item.valor_total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(totalTax > 0) && (
        <div className="text-sm text-right mb-2 text-slate-600">
          <div className="flex justify-end gap-8">
            <span>Subtotal:</span>
            <span className="tabular-nums w-24">{formatUSD(subtotal)}</span>
          </div>
          <div className="flex justify-end gap-8">
            <span>Total Tax:</span>
            <span className="tabular-nums w-24">{formatUSD(totalTax)}</span>
          </div>
        </div>
      )}

      <div className="border-t-2 border-slate-800 pt-3">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-slate-800 uppercase tracking-wide">Total Due (USD)</span>
          <span className="text-2xl font-bold text-slate-800 tabular-nums">{formatUSDPlain(total)}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-sm italic text-slate-500">Lifetime labor warranty</p>
      </div>
    </div>
  );
}
