'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiDownload, FiEye } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import ReceiptPreview from '@/components/receipts/ReceiptPreview';
import { useReceipt } from '@/hooks/receipts/useReceipt';
import { useDownloadReceiptPdf } from '@/hooks/receipts/useDownloadReceiptPdf';
import { useToast } from '@/components/ui/Toast';
import { formatUSD } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { ReceiptDraftItem } from '@/types/receipt';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReceiptDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: receipt, isLoading, isError } = useReceipt(id);
  const { mutate: download, isPending: downloading } = useDownloadReceiptPdf();
  const { showToast } = useToast();

  const receiptItems = useMemo<ReceiptDraftItem[]>(
    () => (receipt?.itens || []).map((item, i) => ({ ...item, _key: item.id || `item-${i}` })),
    [receipt?.itens]
  );

  const handleDownload = () => {
    if (!receipt) return;
    download(
      { id: receipt.id, numeroRecibo: receipt.numero_recibo },
      {
        onError: () => showToast('error', 'Erro ao baixar o PDF.'),
        onSuccess: () => showToast('success', 'Download iniciado!'),
      }
    );
  };

  const handleView = () => {
    if (receipt?.pdf_url) {
      window.open(receipt.pdf_url, '_blank');
    } else {
      showToast('info', 'URL do PDF não disponível.');
    }
  };

  const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
    gerado: { label: 'Gerado', variant: 'success' },
    pendente: { label: 'Pendente', variant: 'warning' },
    cancelado: { label: 'Cancelado', variant: 'danger' },
  };

  return (
    <DashboardLayout title="Detalhes do Recibo">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/receipts">
            <Button variant="ghost" size="sm" icon={<FiArrowLeft size={16} />}>
              Voltar
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Detalhes do Recibo</h1>
        </div>

        {isLoading && <Loading text="Carregando recibo..." />}

        {isError && (
          <Card>
            <div className="text-center py-8 text-slate-500">
              Erro ao carregar o recibo. Verifique a conexão com o backend.
            </div>
          </Card>
        )}

        {receipt && (
          <>
            <Card>
              <div className="flex flex-wrap gap-4 items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Recibo</span>
                    <span className="font-bold text-blue-600 text-lg">#{receipt.numero_recibo}</span>
                    <Badge variant={statusMap[receipt.status]?.variant || 'neutral'}>
                      {statusMap[receipt.status]?.label || receipt.status}
                    </Badge>
                  </div>
                  <p className="text-slate-700 font-medium">{receipt.cliente_nome}</p>
                  <p className="text-xs text-slate-500">
                    Gerado em {formatDateTime(receipt.data_hora_geracao)} por {receipt.usuarios?.nome ?? '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-medium">Total Due</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {formatUSD(receipt.total_com_tax || receipt.total)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-5 pt-4 border-t border-slate-100">
                <Button variant="outline" icon={<FiEye size={15} />} onClick={handleView}>
                  Visualizar PDF
                </Button>
                <Button icon={<FiDownload size={15} />} loading={downloading} onClick={handleDownload}>
                  Baixar PDF
                </Button>
              </div>
            </Card>

            <ReceiptPreview
              clienteNome={receipt.cliente_nome}
              items={receiptItems}
              numeroRecibo={receipt.numero_recibo}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
