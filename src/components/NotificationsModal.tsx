import { X, Bell, CheckCircle, AlertTriangle, Info, Calendar, Trash2 } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsModalProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

export default function NotificationsModal({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}: NotificationsModalProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-[#4ECDC4]" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-[#FFB84D]" />;
      case 'reminder':
        return <Calendar size={20} className="text-[#FF6B6B]" />;
      default:
        return <Info size={20} className="text-[#F8F9FA]" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-[#537d90] rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-slide-in-down">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#FF6B6B] bg-opacity-10 p-2 rounded-lg">
              <Bell size={24} className="text-[#FF6B6B]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F8F9FA]">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} color="#14233C" />
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="px-6 py-3 border-b border-gray-200">
            <button
              onClick={onMarkAllAsRead}
              className="text-sm font-semibold text-[#FF6B6B] hover:text-[#FF5252] transition-colors"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <Bell size={40} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-[#F8F9FA] mb-2">No notifications</h3>
              <p className="text-sm text-gray-600 text-center">
                We'll notify you about important updates and reminders
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors group ${
                    !notification.read ? 'bg-[#FF6B6B] bg-opacity-5' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-[#F8F9FA] text-sm">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-[#FF6B6B] rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <button
                              onClick={() => onMarkAsRead(notification.id)}
                              className="text-xs font-semibold text-[#4ECDC4] hover:text-[#3db8b0] transition-colors"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => onDelete(notification.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Trash2 size={14} className="text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
