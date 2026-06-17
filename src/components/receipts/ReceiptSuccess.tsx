'use client';

import { FiCheckCircle, FiDownload, FiEye, FiPlus } from 'react-icons/fi';
import { Receipt } from '@/types/receipt';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatUSD } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { useDownloadReceiptPdf } from '@/hooks/receipts/useDownloadReceiptPdf';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/auth.store';

interface ReceiptSuccessProps {
  receipt: Receipt;
  onNew?: () => void;
}

export default function ReceiptSuccess({ receipt, onNew }: ReceiptSuccessProps) {
  const { mutate: download, isPending: downloading } = useDownloadReceiptPdf();
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const geradoPor = receipt.usuarios?.nome || user?.nome || '—';

  const handleDownload = () => {
    if (receipt.pdf_url) {
      const link = document.createElement('a');
      link.href = receipt.pdf_url;
      link.download = `receipt-${receipt.numero_recibo}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    download(
      { id: receipt.id, numeroRecibo: receipt.numero_recibo },
      {
        onError: () => showToast('error', 'Erro ao baixar o PDF.'),
        onSuccess: () => showToast('success', 'Download iniciado!'),
      }
    );
  };

  const handleView = () => {
    if (receipt.pdf_url) {
      window.open(receipt.pdf_url, '_blank');
    } else {
      showToast('info', 'URL do PDF não disponível.');
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
          <FiCheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Recibo gerado com sucesso!</h1>
        <p className="text-slate-500 mt-2">O PDF foi gerado e salvo com segurança.</p>
      </div>

      <Card className="mb-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-500">Número do recibo</span>
            <span className="font-semibold text-blue-600">#{receipt.numero_recibo}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-500">Cliente</span>
            <span className="font-medium text-slate-800">{receipt.cliente_nome}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-500">Data/Hora</span>
            <span className="font-medium text-slate-800">{formatDateTime(receipt.data_hora_geracao)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-500">Gerado por</span>
            <span className="font-medium text-slate-800">{geradoPor}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-slate-500">Total</span>
            <span className="text-xl font-bold text-slate-800">
              {formatUSD(receipt.total_com_tax || receipt.total)}
            </span>
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          fullWidth
          icon={<FiEye size={16} />}
          onClick={handleView}
        >
          Visualizar PDF
        </Button>
        <Button
          fullWidth
          icon={<FiDownload size={16} />}
          loading={downloading}
          onClick={handleDownload}
        >
          Baixar PDF
        </Button>
      </div>

      <div className="mt-4">
        <Button variant="ghost" fullWidth icon={<FiPlus size={16} />} onClick={onNew}>
          Gerar outro recibo
        </Button>
      </div>
    </div>
  );
}
