import { FiLoader } from 'react-icons/fi';

interface LoadingProps {
  text?: string;
  fullPage?: boolean;
}

export default function Loading({ text = 'Carregando...', fullPage = false }: LoadingProps) {
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="animate-spin text-blue-600" size={32} />
          <p className="text-sm text-slate-600">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <FiLoader className="animate-spin text-blue-600" size={28} />
        <p className="text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}
