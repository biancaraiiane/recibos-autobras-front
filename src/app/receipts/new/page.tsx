'use client';

import { useState } from 'react';
import { FiUploadCloud, FiEdit, FiInfo, FiChevronRight, FiImage, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import UploadPrints from '@/components/receipts/UploadPrints';
import ReceiptItemsTable from '@/components/receipts/ReceiptItemsTable';
import ReceiptPreview from '@/components/receipts/ReceiptPreview';
import ReceiptSuccess from '@/components/receipts/ReceiptSuccess';
import { ReceiptDraftItem, Receipt } from '@/types/receipt';
import { useCreateReceipt } from '@/hooks/receipts/useCreateReceipt';
import { useGenerateReceiptPdf } from '@/hooks/receipts/useGenerateReceiptPdf';
import { useToast } from '@/components/ui/Toast';

type Step = 'info' | 'prints' | 'review' | 'preview' | 'success';
type Method = 'prints' | 'manual' | null;

function PrintsPanel({ previews, onRemove }: { previews: string[]; onRemove: (i: number) => void }) {
  const [expanded, setExpanded] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (previews.length === 0) return null;

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FiImage size={15} />
            Prints de referência ({previews.length}) — apenas para consulta, não serão salvos
          </div>
          {expanded ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
        </button>

        {expanded && (
          <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative group aspect-video rounded-lg overflow-hidden border border-blue-200 bg-white cursor-pointer"
                onClick={() => setLightbox(src)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Print ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiX size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            <button
              className="absolute -top-10 right-0 text-white/80 hover:text-white"
              onClick={() => setLightbox(null)}
            >
              <FiX size={24} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox}
              alt="Print ampliado"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default function NewReceiptPage() {
  const [step, setStep] = useState<Step>('info');
  const [method, setMethod] = useState<Method>(null);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteError, setClienteError] = useState('');
  const [items, setItems] = useState<ReceiptDraftItem[]>([]);
  const [printPreviews, setPrintPreviews] = useState<string[]>([]);
  const [createdReceipt, setCreatedReceipt] = useState<Receipt | null>(null);

  const { mutate: createReceipt, isPending: creating } = useCreateReceipt();
  const { mutate: generatePdf, isPending: generating } = useGenerateReceiptPdf();
  const { showToast } = useToast();

  const isLoading = creating || generating;

  const handleNewReceipt = () => {
    setStep('info');
    setMethod(null);
    setClienteNome('');
    setClienteError('');
    setItems([]);
    setPrintPreviews([]);
    setCreatedReceipt(null);
  };

  const handleInfoContinue = () => {
    if (!clienteNome.trim()) {
      setClienteError('O nome do cliente é obrigatório.');
      return;
    }
    if (!method) {
      showToast('info', 'Escolha um método para continuar.');
      return;
    }
    setClienteError('');
    setStep(method === 'prints' ? 'prints' : 'review');
  };

  const handleGeneratePdf = () => {
    if (items.length === 0) {
      showToast('error', 'Adicione pelo menos um item ao recibo.');
      return;
    }

    const payload = {
      cliente_nome: clienteNome,
      itens: items.map(({ _key, ...rest }) => rest),
    };

    createReceipt(payload, {
      onSuccess: (receipt) => {
        generatePdf(receipt.id, {
          onSuccess: (finalReceipt) => {
            setCreatedReceipt({ ...receipt, ...finalReceipt });
            setStep('success');
          },
          onError: () => {
            setCreatedReceipt(receipt);
            setStep('success');
            showToast('info', 'Recibo criado, mas o PDF pode demorar a ser gerado.');
          },
        });
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } };
        showToast('error', error?.response?.data?.message || 'Erro ao criar o recibo.');
      },
    });
  };

  const removePreview = (index: number) => {
    setPrintPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const steps = [
    { key: 'info', label: 'Informações' },
    { key: 'review', label: 'Revisar dados' },
    { key: 'preview', label: 'Pré-visualização' },
    { key: 'success', label: 'Concluído' },
  ];

  const currentStepIndex = steps.findIndex(
    (s) => s.key === step || (step === 'prints' && s.key === 'review')
  );

  return (
    <DashboardLayout title="Novo Recibo">
      <div className="max-w-5xl mx-auto space-y-4">
        {step !== 'success' && (
          <div className="flex items-center gap-2 text-sm flex-wrap">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 ${i <= currentStepIndex ? 'text-blue-600' : 'text-slate-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i < currentStepIndex ? 'bg-blue-600 border-blue-600 text-white' : i === currentStepIndex ? 'border-blue-600 text-blue-600' : 'border-slate-300 text-slate-400'}`}>
                    {i < currentStepIndex ? '✓' : i + 1}
                  </div>
                  <span className={`font-medium ${i === currentStepIndex ? 'text-blue-600' : ''}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && <FiChevronRight size={14} className="text-slate-300" />}
              </div>
            ))}
          </div>
        )}

        {/* ETAPA 1 — Informações */}
        {step === 'info' && (
          <Card>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Novo Recibo</h2>
                <p className="text-slate-500 text-sm mt-1">Preencha as informações iniciais do recibo.</p>
              </div>

              <div className="space-y-2">
                <Input
                  label="Nome do cliente / empresa"
                  placeholder="Digite o nome do cliente ou empresa"
                  value={clienteNome}
                  onChange={(e) => { setClienteNome(e.target.value); setClienteError(''); }}
                  error={clienteError}
                  required
                />
                <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  <FiInfo size={13} className="shrink-0" />
                  O nome do cliente é obrigatório e sempre deve ser preenchido manualmente.
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">Como deseja adicionar os dados do serviço?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setMethod('prints')}
                    className={`relative p-5 rounded-xl border-2 text-left transition-all ${method === 'prints' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                  >
                    {method === 'prints' && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                      <FiUploadCloud size={20} className="text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">Enviar print(s) dos serviços</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Envie um ou mais prints com as informações dos serviços realizados.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('manual')}
                    className={`relative p-5 rounded-xl border-2 text-left transition-all ${method === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                  >
                    {method === 'manual' && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
                      <FiEdit size={20} className="text-slate-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">Preencher manualmente</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Preencha cada item do serviço manualmente.
                    </p>
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleInfoContinue} size="lg" disabled={!method || !clienteNome.trim()}>
                  Continuar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ETAPA 2 — Upload de prints */}
        {step === 'prints' && (
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">Envie os prints dos serviços</h2>
              <p className="text-slate-500 text-sm mt-1">
                Envie os prints e o sistema tentará preencher os dados automaticamente.
              </p>
            </div>
            <UploadPrints
              previews={printPreviews}
              onPreviewsChange={setPrintPreviews}
              onExtractedItems={setItems}
              onContinue={() => setStep('review')}
              onBack={() => setStep('info')}
            />
          </Card>
        )}

        {/* ETAPA 3 — Revisar dados */}
        {step === 'review' && (
          <div className="space-y-4">
            {/* Painel de prints — aparece aqui na revisão */}
            <PrintsPanel previews={printPreviews} onRemove={removePreview} />

            <Card>
              <div className="mb-5">
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 mb-4">
                  <FiInfo size={16} className="shrink-0 mt-0.5" />
                  <p>Consulte os prints acima e preencha os dados abaixo. Impostos podem ser editados item a item.</p>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Revise e edite os dados do recibo</h2>
                <p className="text-slate-500 text-sm mt-1">Edite preços, quantidades e impostos conforme necessário.</p>
              </div>

              <div className="mb-5">
                <Input
                  label="Nome do cliente / empresa"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  required
                />
              </div>

              <p className="text-sm font-semibold text-slate-700 mb-3">Itens do recibo</p>
              <ReceiptItemsTable items={items} onChange={setItems} />

              <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setStep(method === 'prints' ? 'prints' : 'info')}>
                  Voltar
                </Button>
                <Button
                  onClick={() => {
                    if (!clienteNome.trim()) {
                      showToast('error', 'Preencha o nome do cliente.');
                      return;
                    }
                    if (items.length === 0) {
                      showToast('error', 'Adicione pelo menos um item ao recibo.');
                      return;
                    }
                    setStep('preview');
                  }}
                >
                  Salvar e Continuar
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ETAPA 4 — Pré-visualização */}
        {step === 'preview' && (
          <div className="space-y-4">
            <Card>
              <h2 className="text-xl font-bold text-slate-800">Pré-visualização do recibo</h2>
              <p className="text-slate-500 text-sm mt-1">Confirme como ficará o recibo antes de gerar o PDF.</p>
            </Card>

            <ReceiptPreview
              clienteNome={clienteNome}
              items={items}
              numeroRecibo="—"
            />

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep('review')}>
                Voltar
              </Button>
              <Button onClick={handleGeneratePdf} loading={isLoading} size="lg">
                {creating ? 'Criando recibo...' : generating ? 'Gerando PDF...' : 'Gerar PDF'}
              </Button>
            </div>
          </div>
        )}

        {/* ETAPA 5 — Sucesso */}
        {step === 'success' && createdReceipt && (
          <ReceiptSuccess receipt={createdReceipt} onNew={handleNewReceipt} />
        )}
      </div>
    </DashboardLayout>
  );
}
