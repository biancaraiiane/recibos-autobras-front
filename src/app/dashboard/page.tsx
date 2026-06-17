'use client';

import Link from 'next/link';
import { FiPlus, FiFileText, FiDollarSign, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import ReceiptsTable from '@/components/receipts/ReceiptsTable';
import { useAuthStore } from '@/stores/auth.store';
import { useDashboardStats } from '@/hooks/receipts/useDashboardStats';
import { formatUSD } from '@/utils/currency';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading, isError } = useDashboardStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Olá, {user?.nome?.split(' ')[0] || 'Bem-vindo'}!
            </h1>
            <p className="text-slate-500 text-sm mt-1">Bem-vindo ao sistema de recibos.</p>
          </div>
          <Link href="/receipts/new">
            <Button size="lg" icon={<FiPlus size={18} />}>
              Novo Recibo
            </Button>
          </Link>
        </div>

        {isLoading && <Loading text="Carregando resumo..." />}

        {isError && (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
            <FiAlertCircle size={18} />
            <div>
              <p className="font-medium">API não disponível</p>
              <p className="text-xs mt-0.5">Conecte o backend em <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_API_URL</code> para ver os dados reais.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FiFileText size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium tracking-wide">Total de recibos</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">
                  {isLoading ? '—' : (stats?.total_recibos ?? '—')}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <FiDollarSign size={22} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium tracking-wide">Faturado (USD)</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">
                  {isLoading ? '—' : formatUSD(stats?.total_faturado)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <FiCalendar size={22} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium tracking-wide">Este mês</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">
                  {isLoading ? '—' : (stats?.recibos_mes ?? '—')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card padding="none">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Últimos Recibos</h2>
            <Link href="/receipts">
              <Button variant="ghost" size="sm">
                Ver todos os recibos
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <Loading text="Carregando recibos..." />
          ) : stats?.ultimos_recibos?.length ? (
            <ReceiptsTable receipts={stats.ultimos_recibos} compact />
          ) : (
            <EmptyState
              title="Nenhum recibo gerado ainda"
              description="Clique em Novo Recibo para começar."
              action={
                <Link href="/receipts/new">
                  <Button icon={<FiPlus size={14} />} size="sm">Novo Recibo</Button>
                </Link>
              }
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
