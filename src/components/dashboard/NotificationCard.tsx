import { Notification } from '@/types/animal';
import { Bell, Baby, Syringe, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationCardProps {
  notification: Notification;
  onRead?: (id: string) => void;
}

const priorityStyles = {
  low: 'border-l-muted-foreground bg-card',
  medium: 'border-l-warning bg-warning/5',
  high: 'border-l-destructive bg-destructive/5',
};

const typeIcons = {
  birth: Baby,
  vaccination: Syringe,
  insemination: Calendar,
};

export function NotificationCard({ notification, onRead }: NotificationCardProps) {
  const Icon = typeIcons[notification.type];
  
  return (
    <div 
      className={cn(
        "rounded-xl border-l-4 p-4 shadow-farm-sm transition-all duration-200 hover:shadow-farm-md cursor-pointer",
        priorityStyles[notification.priority],
        notification.isRead && "opacity-60"
      )}
      onClick={() => onRead?.(notification.id)}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          notification.priority === 'high' ? 'bg-destructive/20 text-destructive' :
          notification.priority === 'medium' ? 'bg-warning/20 text-warning' :
          'bg-muted text-muted-foreground'
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {notification.date}
          </p>
        </div>
        {!notification.isRead && (
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
        )}
      </div>
    </div>
  );
}
