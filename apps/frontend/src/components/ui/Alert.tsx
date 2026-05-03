import { cn } from '@/lib/utils';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?:   string;
  children: React.ReactNode;
  className?: string;
}

const icons = {
  info:    Info,
  success: CheckCircle,
  warning: AlertTriangle,
  danger:  XCircle,
};

export default function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const Icon = icons[variant];

  return (
    <div className={cn('alert', `alert-${variant}`, className)}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div>
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}