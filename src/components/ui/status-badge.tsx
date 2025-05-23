
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'EM ABERTO' | 'PRONTO PARA RETIRAR' | 'ENCERRADO';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles = {
    'EM ABERTO': 'bg-blue-100 text-blue-800 border-blue-200',
    'PRONTO PARA RETIRAR': 'bg-green-100 text-green-800 border-green-200',
    'ENCERRADO': 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
        statusStyles[status],
        className
      )}
    >
      {status}
    </span>
  );
}
