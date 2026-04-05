// ═══════════════════════════════════════════════════
//  PWA Notification System — Real-time alerts
// ═══════════════════════════════════════════════════

export interface NotificationConfig {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showHarvest: boolean;
  showWater: boolean;
  showWeather: boolean;
  showSeason: boolean;
  showAlerts: boolean;
}

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  enabled: false, // Must be explicitly enabled by user
  soundEnabled: true,
  vibrationEnabled: true,
  showHarvest: true,
  showWater: true,
  showWeather: true,
  showSeason: true,
  showAlerts: true,
};

// Load/Save notification config
export function loadNotificationConfig(): NotificationConfig {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_CONFIG;
  try {
    const stored = localStorage.getItem("botania-notification-config");
    if (stored) {
      return { ...DEFAULT_NOTIFICATION_CONFIG, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_NOTIFICATION_CONFIG;
}

export function saveNotificationConfig(config: NotificationConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("botania-notification-config", JSON.stringify(config));
  } catch {
    // ignore
  }
}

// Check if browser supports notifications
export function supportsNotifications(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

// Get current notification permission
export function getNotificationPermission(): NotificationPermission {
  if (!supportsNotifications()) return "denied";
  return Notification.permission;
}

// Request notification permission from user
export async function requestNotificationPermission(): Promise<boolean> {
  if (!supportsNotifications()) return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

// Show a browser notification
export function showNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!supportsNotifications()) return null;
  if (Notification.permission !== "granted") return null;

  try {
    const notification = new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    return notification;
  } catch {
    return null;
  }
}

// Notification types with game-specific logic
export type GameNotificationType =
  | "harvest_ready"
  | "plant_needs_water"
  | "frost_warning"
  | "heatwave_warning"
  | "season_changed"
  | "disease_detected"
  | "pest_detected";

export function showGameNotification(
  type: GameNotificationType,
  data?: {
    plantName?: string;
    emoji?: string;
    message?: string;
  }
): Notification | null {
  const config = loadNotificationConfig();
  if (!config.enabled) return null;

  const notifications: Record<GameNotificationType, { title: string; body: string; tag: string }> = {
    harvest_ready: {
      title: `${data?.emoji || "🌾"} Récolte prête !`,
      body: data?.message || `${data?.plantName || "Une plante"} est prête à être récoltée !`,
      tag: "harvest",
    },
    plant_needs_water: {
      title: `${data?.emoji || "💧"} Plante assoiffée`,
      body: data?.message || `${data?.plantName || "Une plante"} a besoin d'eau !`,
      tag: "water",
    },
    frost_warning: {
      title: "🥶 Alerte Gel",
      body: data?.message || "Température proche de 0°C ! Protégez vos plantes.",
      tag: "weather",
    },
    heatwave_warning: {
      title: "🌡️ Alerte Canicule",
      body: data?.message || "Température élevée ! Arrosez plus fréquemment.",
      tag: "weather",
    },
    season_changed: {
      title: `${data?.emoji || "📅"} Changement de saison`,
      body: data?.message || "Une nouvelle saison a commencé dans votre jardin.",
      tag: "season",
    },
    disease_detected: {
      title: `${data?.emoji || "🤒"} Maladie détectée`,
      body: data?.message || `${data?.plantName || "Une plante"} est malade !`,
      tag: "alert",
    },
    pest_detected: {
      title: `${data?.emoji || "🐛"} Parasites détectés`,
      body: data?.message || `${data?.plantName || "Une plante"} a des parasites !`,
      tag: "alert",
    },
  };

  const notification = notifications[type];
  if (!notification) return null;

  // Check if this notification type is enabled
  if (type === "harvest_ready" && !config.showHarvest) return null;
  if (type === "plant_needs_water" && !config.showWater) return null;
  if (type === "frost_warning" && !config.showWeather) return null;
  if (type === "heatwave_warning" && !config.showWeather) return null;
  if (type === "season_changed" && !config.showSeason) return null;
  if ((type === "disease_detected" || type === "pest_detected") && !config.showAlerts) return null;

  // Vibration pattern
  if (config.vibrationEnabled && "vibrate" in navigator) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch {
      // Vibration not available
    }
  }

  return showNotification(notification.title, {
    body: notification.body,
    tag: notification.tag,
    requireInteraction: type === "frost_warning" || type === "heatwave_warning",
  });
}

// Service Worker registration for push notifications
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

export async function registerServiceWorker(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    serviceWorkerRegistration = await navigator.serviceWorker.register("/sw.js");
    return true;
  } catch {
    return false;
  }
}

// Check if app is installed as PWA
export function isPWAInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}
