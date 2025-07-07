// Notification service for user feedback
export interface NotificationData {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

class NotificationService {
  private notifications: NotificationData[] = [];
  private listeners: ((notifications: NotificationData[]) => void)[] = [];

  // Add notification
  addNotification(notification: NotificationData) {
    const newNotification = {
      ...notification,
      duration: notification.duration || 5000,
    };

    this.notifications.push(newNotification);
    this.notifyListeners();

    // Auto remove after duration
    setTimeout(() => {
      this.removeNotification(newNotification);
    }, newNotification.duration);
  }

  // Remove notification
  removeNotification(notification: NotificationData) {
    this.notifications = this.notifications.filter(n => n !== notification);
    this.notifyListeners();
  }

  // Subscribe to notifications
  subscribe(listener: (notifications: NotificationData[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Convenience methods
  success(title: string, message: string) {
    this.addNotification({ type: 'success', title, message });
  }

  error(title: string, message: string) {
    this.addNotification({ type: 'error', title, message });
  }

  info(title: string, message: string) {
    this.addNotification({ type: 'info', title, message });
  }

  warning(title: string, message: string) {
    this.addNotification({ type: 'warning', title, message });
  }
}

export const notificationService = new NotificationService();