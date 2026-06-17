'use client';

import Link from 'next/link';
import { FiDownload, FiEye } from 'react-icons/fi';
import { Receipt } from '@/types/receipt';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatUSD } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { useDownloadReceiptPdf } from '@/hooks/receipts/useDownloadReceiptPdf';
import { useToast } from '@/components/ui/Toast';

interface ReceiptsTableProps {
  receipts: Receipt[];
  compact?: boolean;
}

const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  gerado: { label: 'Gerado', variant: 'success' },
  pendente: { label: 'Pendente', variant: 'warning' },
  cancelado: { label: 'Cancelado', variant: 'danger' },
};

export default function ReceiptsTable({ receipts, compact = false }: ReceiptsTableProps) {
  const { mutate: download, isPending: downloading } = useDownloadReceiptPdf();
  const { showToast } = useToast();

  const handleDownload = (receipt: Receipt) => {
    download(
      { id: receipt.id, numeroRecibo: receipt.numero_recibo },
      {
        onError: () => showToast('error', 'Erro ao baixar o PDF.'),
        onSuccess: () => showToast('success', 'Download iniciado!'),
      }
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nº</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Data/Hora</th>
            {!compact && (
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Usuário</th>
            )}
            <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total (USD)</th>
            {!compact && (
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
            )}
            <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {receipts.map((receipt) => {
            const statusInfo = statusMap[receipt.status] || { label: receipt.status, variant: 'neutral' as const };
            return (
              <tr key={receipt.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-medium text-blue-600">#{receipt.numero_recibo}</td>
                <td className="py-3 px-4 text-slate-700">{receipt.cliente_nome}</td>
                <td className="py-3 px-4 text-slate-500">{formatDateTime(receipt.data_hora_geracao)}</td>
                {!compact && (
                  <td className="py-3 px-4 text-slate-500">{receipt.usuarios?.nome ?? '—'}</td>
                )}
                <td className="py-3 px-4 text-right font-semibold text-slate-800">
                  {formatUSD(receipt.total_com_tax || receipt.total)}
                </td>
                {!compact && (
                  <td className="py-3 px-4 text-center">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </td>
                )}
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-1">
                    <Link href={`/receipts/${receipt.id}`}>
                      <Button variant="ghost" size="sm" icon={<FiEye size={14} />} title="Visualizar">
                        <span className="sr-only">Ver</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<FiDownload size={14} />}
                      title="Baixar PDF"
                      loading={downloading}
                      onClick={() => handleDownload(receipt)}
                    >
                      <span className="sr-only">Baixar</span>
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
