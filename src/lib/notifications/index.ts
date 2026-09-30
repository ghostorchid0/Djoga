export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  } catch {
    return false;
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermissionState(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export function sendDailyReminderNotification(targetAmount: number = 1000): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const formatted = targetAmount.toLocaleString('fr-FR');
      new Notification('Security Fund', {
        body: `N'oublie pas de protéger ton avenir. Cotisation du jour : ${formatted} FCFA.`,
        icon: '/pwa-192x192.png',
        badge: '/favicon-32x32.png',
        tag: 'daily-reminder',
      });
    } catch {
      // Ignore background notification failure
    }
  }
}
