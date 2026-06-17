'use client';

import { useState, useCallback } from 'react';
import { FiUploadCloud, FiX, FiInfo, FiAlertCircle } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { ReceiptDraftItem } from '@/types/receipt';
import { useExtractPrintData } from '@/hooks/receipts/useExtractPrintData';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ACCEPTED_ATTR = '.jpg,.jpeg,.png,.webp,.gif';

interface UploadPrintsProps {
  previews: string[];
  onPreviewsChange: (previews: string[]) => void;
  onExtractedItems: (items: ReceiptDraftItem[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function UploadPrints({
  previews,
  onPreviewsChange,
  onExtractedItems,
  onContinue,
  onBack,
}: UploadPrintsProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [extractError, setExtractError] = useState('');

  const { mutate: extract, isPending: extracting } = useExtractPrintData();

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    Array.from(fileList).forEach((file) => {
      if (ACCEPTED_TYPES.includes(file.type)) {
        newPreviews.push(URL.createObjectURL(file));
        newFiles.push(file);
      }
    });
    if (newFiles.length === 0) return;
    setFiles((prev) => [...prev, ...newFiles]);
    onPreviewsChange([...previews, ...newPreviews]);
  };

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      processFiles(e.dataTransfer.files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [previews, files]
  );

  const removePreview = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    onPreviewsChange(previews.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    setExtractError('');

    if (files.length === 0) {
      onContinue();
      return;
    }

    extract(files, {
      onSuccess: ({ items }) => {
        const draftItems: ReceiptDraftItem[] = items.map((item) => ({
          ...item,
          _key: crypto.randomUUID(),
        }));
        onExtractedItems(draftItems);
        onContinue();
      },
      onError: (err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 415) {
          setExtractError('Tipo de arquivo não permitido. Envie JPEG, PNG, WebP ou GIF.');
        } else if (status === 400) {
          setExtractError('Nenhuma imagem enviada.');
        } else {
          setExtractError(
            'Não foi possível extrair os dados automaticamente. Você pode preencher manualmente.'
          );
        }
        onContinue();
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <FiInfo size={16} className="shrink-0 mt-0.5" />
        <p>
          O sistema tentará ler os dados do print automaticamente.
          Você poderá <strong>revisar e editar tudo</strong> na próxima etapa.
          Os prints <strong>não serão salvos</strong> no sistema.
        </p>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-slate-50 rounded-xl p-12 text-center transition-colors cursor-pointer bg-white"
        onClick={() => !extracting && document.getElementById('print-input')?.click()}
      >
        <input
          id="print-input"
          type="file"
          accept={ACCEPTED_ATTR}
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <FiUploadCloud size={28} className="text-blue-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-700">Arraste e solte os arquivos aqui</p>
            <p className="text-sm text-slate-500 mt-1">ou clique para selecionar</p>
          </div>
          <p className="text-xs text-slate-400">Formatos aceitos: JPG, PNG, WebP — Múltiplos arquivos permitidos</p>
        </div>
      </div>

      {previews.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-3">
            {previews.length} print{previews.length > 1 ? 's' : ''} carregado{previews.length > 1 ? 's' : ''}:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative group aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Print ${i + 1}`} className="w-full h-full object-cover" />
                {!extracting && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removePreview(i); }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {extractError && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <FiAlertCircle size={16} className="shrink-0 mt-0.5" />
          <p>{extractError}</p>
        </div>
      )}

      <div className="flex gap-3 justify-between pt-2">
        <Button variant="secondary" onClick={onBack} disabled={extracting}>
          Voltar
        </Button>
        <Button onClick={handleContinue} disabled={previews.length === 0 || extracting} loading={extracting}>
          {extracting ? 'Extraindo dados...' : 'Continuar'}
        </Button>
      </div>
    </div>
  );
}
