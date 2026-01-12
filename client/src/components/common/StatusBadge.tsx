import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 'active' | 'completed' | 'on-hold' | 'todo' | 'in-progress' | 'planning' | 'done';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: { label: 'Active', className: 'status-active' },
  completed: { label: 'Completed', className: 'status-completed' },
  'on-hold': { label: 'On Hold', className: 'status-on-hold' },
  todo: { label: 'To Do', className: 'status-pending' },
  'in-progress': { label: 'In Progress', className: 'status-active' },
  planning: { label: 'Planning', className: 'status-pending' },
  done: { label: 'Done', className: 'status-completed' },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.todo;

  return (
    <Badge
      variant="outline"
      className={cn(config.className, 'font-medium', className)}
    >
      {config.label}
    </Badge>
  );
};
