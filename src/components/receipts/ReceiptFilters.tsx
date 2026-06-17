'use client';

import { useState, useCallback } from 'react';
import { FiSearch, FiCalendar, FiX } from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export interface FilterValues {
  search: string;
  data_inicio: string;
  data_fim: string;
}

interface ReceiptFiltersProps {
  onFilter: (values: FilterValues) => void;
}

export default function ReceiptFilters({ onFilter }: ReceiptFiltersProps) {
  const [search, setSearch] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const handleFilter = useCallback(() => {
    onFilter({ search, data_inicio: dataInicio, data_fim: dataFim });
  }, [search, dataInicio, dataFim, onFilter]);

  const handleClear = () => {
    setSearch('');
    setDataInicio('');
    setDataFim('');
    onFilter({ search: '', data_inicio: '', data_fim: '' });
  };

  const hasFilters = search || dataInicio || dataFim;

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Buscar por cliente, nº recibo ou VIN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
          leftIcon={<FiSearch size={14} />}
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-slate-500">
          <FiCalendar size={14} />
        </div>
        <Input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          placeholder="De"
        />
        <span className="text-slate-400 text-sm">até</span>
        <Input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          placeholder="Até"
        />
      </div>
      <Button onClick={handleFilter} icon={<FiSearch size={14} />}>
        Filtrar
      </Button>
      {hasFilters && (
        <Button variant="ghost" onClick={handleClear} icon={<FiX size={14} />}>
          Limpar
        </Button>
      )}
    </div>
  );
}
