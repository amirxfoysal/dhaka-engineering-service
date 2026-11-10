import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationsContext';
import './AdminNotifications.css';

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminNotifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className={`admin-notifications${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="admin-notifications__bell"
        aria-label={unreadCount ? `${unreadCount} unread notifications` : 'Notifications'}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Bell size={18} strokeWidth={2.2} />
        {unreadCount > 0 && (
          <span className="admin-notifications__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="admin-notifications__panel" role="dialog" aria-label="Admin notifications">
          <div className="admin-notifications__head">
            <div>
              <strong>Notifications</strong>
              <span>{unreadCount} unread</span>
            </div>
            <div className="admin-notifications__head-actions">
              <button
                type="button"
                onClick={() => {
                  void markAllAsRead();
                }}
                disabled={!unreadCount}
                title="Mark all read"
              >
                <CheckCheck size={15} />
              </button>
              <button
                type="button"
                onClick={() => {
                  void clearAll();
                }}
                disabled={!notifications.length}
                title="Clear all"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <p className="admin-notifications__empty">No notifications yet.</p>
          ) : (
            <ul className="admin-notifications__list">
              {notifications.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`admin-notifications__item${item.read ? '' : ' is-unread'}`}
                    onClick={() => {
                      void markAsRead(item.id);
                      setOpen(false);
                      navigate(`/admin/bookings`);
                    }}
                  >
                    <span className="admin-notifications__dot" aria-hidden />
                    <span className="admin-notifications__body">
                      <strong>{item.title}</strong>
                      <em>{item.message}</em>
                      <small>{formatWhen(item.createdAt)}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
