import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { NotificationCard } from '@/components/dashboard/NotificationCard';
import { mockNotifications } from '@/data/mockData';
import { Notification } from '@/types/animal';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bildirimler</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 
                ? `${unreadCount} okunmamış bildirim` 
                : 'Tüm bildirimler okundu'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead} className="gap-2">
              <CheckCheck className="w-5 h-5" />
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tümü ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Okunmamış ({unreadCount})
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationCard 
              key={notification.id} 
              notification={notification}
              onRead={handleRead}
            />
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12 bg-card rounded-2xl border-2 border-border">
            <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              {filter === 'unread' ? 'Okunmamış bildirim yok' : 'Bildirim yok'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
