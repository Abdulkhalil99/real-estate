import { cn } from '@/lib/utils';

export default function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const px = { sm: 16, md: 24, lg: 40 }[size];
  return <div className={cn('spinner', className)} style={{ width: px, height: px }} />;
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );
}
