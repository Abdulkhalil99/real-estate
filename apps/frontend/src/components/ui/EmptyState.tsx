import { LucideIcon } from 'lucide-react';

export default function EmptyState({ icon: Icon, title, description, action }: {
  icon: LucideIcon; title: string; description: string; action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon"><Icon className="w-7 h-7" /></div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
