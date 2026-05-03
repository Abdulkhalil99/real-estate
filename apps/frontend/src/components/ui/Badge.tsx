import { cn } from '@/lib/utils';
import { PropertyStatus } from '@/types';

interface BadgeProps { children: React.ReactNode; variant?: string; className?: string; }

export default function Badge({ children, variant = 'info', className }: BadgeProps) {
  return <span className={cn('badge', 'badge-' + variant, className)}>{children}</span>;
}

export function StatusBadge({ status }: { status: PropertyStatus }) {
  const map: Record<PropertyStatus, { label: string; variant: string }> = {
    FOR_SALE: { label: 'For Sale', variant: 'sale'   },
    FOR_RENT: { label: 'For Rent', variant: 'rent'   },
    SOLD:     { label: 'Sold',     variant: 'sold'   },
    RENTED:   { label: 'Rented',   variant: 'rented' },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}
