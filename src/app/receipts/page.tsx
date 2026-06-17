'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import ReceiptsTable from '@/components/receipts/ReceiptsTable';
import ReceiptFilters, { FilterValues } from '@/components/receipts/ReceiptFilters';
import { useReceipts } from '@/hooks/receipts/useReceipts';

export default function ReceiptsPage() {
  const [filters, setFilters] = useState<FilterValues>({ search: '', data_inicio: '', data_fim: '' });

  const { data, isLoading, isError } = useReceipts({
    search: filters.search || undefined,
    data_inicio: filters.data_inicio || undefined,
    data_fim: filters.data_fim || undefined,
  });

  return (
    <DashboardLayout title="Histórico de Recibos">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-xl font-bold text-slate-800">Histórico de Recibos</h1>
          <Link href="/receipts/new">
            <Button icon={<FiPlus size={16} />}>Novo Recibo</Button>
          </Link>
        </div>

        <Card padding="md">
          <ReceiptFilters onFilter={setFilters} />
        </Card>

        <Card padding="none">
          {isLoading && <Loading text="Carregando recibos..." />}

          {isError && (
            <div className="p-6 text-center text-sm text-slate-500">
              Erro ao carregar recibos. Verifique a conexão com o backend.
            </div>
          )}

          {!isLoading && !isError && !data?.data?.length && (
            <EmptyState
              title="Nenhum recibo encontrado"
              description="Ajuste os filtros ou gere um novo recibo."
              action={
                <Link href="/receipts/new">
                  <Button size="sm" icon={<FiPlus size={14} />}>Novo Recibo</Button>
                </Link>
              }
            />
          )}

          {!isLoading && !isError && data?.data?.length ? (
            <>
              <ReceiptsTable receipts={data.data} />
              <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400">
                {data.total} recibo{data.total !== 1 ? 's' : ''} encontrado{data.total !== 1 ? 's' : ''}
              </div>
            </>
          ) : null}
        </Card>
      </div>
    </DashboardLayout>
  );
}
