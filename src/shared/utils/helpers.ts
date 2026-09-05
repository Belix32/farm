// ===== Utility Functions =====

/** Format price in kopecks to RUB string */
export function formatPrice(kopecks: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kopecks / 100);
}

/** Format date to Russian locale */
export function formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

/** Format relative time (e.g., "5 мин назад") */
export function formatRelativeTime(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays < 7) return `${diffDays} дн назад`;
  return formatDate(d, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Generate unique ID */
export function generateId(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Debounce function */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/** Throttle function */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/** Class names utility (clsx alternative) */
export function cn(...classes: (string | boolean | undefined | Record<string, boolean>)[]): string {
  return classes
    .flatMap(c => {
      if (!c) return [];
      if (typeof c === 'string') return c;
      if (typeof c === 'object') return Object.entries(c).filter(([, v]) => v).map(([k]) => k);
      return [];
    })
    .join(' ');
}

/** Deep clone */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Get nested property safely */
export function get<T>(obj: any, path: string, fallback?: T): T {
  return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj) ?? fallback;
}

/** Sleep/promise delay */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Format phone for display */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  }
  return phone;
}

/** Mask phone for input */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 1) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 4) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

/** Storage helpers with JSON */
export const storage = {
  get<T>(key: string, fallback?: T): T | undefined {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage set failed:', e);
    }
  },
  remove(key: string): void {
    localStorage.removeItem(key);
  },
  clear(): void {
    localStorage.clear();
  },
};

/** Copy to clipboard */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}

/** Download blob as file */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Get query params from URL */
export function getQueryParams(): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

/** Set query param without reload */
export function setQueryParam(key: string, value: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.replaceState({}, '', url);
}

/** Remove query param */
export function removeQueryParam(key: string): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(key);
  window.history.replaceState({}, '', url);
}

/** Check if mobile */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/** Check if iOS */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/** Check if PWA mode */
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
}

/** Vibrate (mobile) */
export function vibrate(pattern: number | number[] = 50): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

/** Play notification sound */
export function playNotificationSound(frequency = 800, duration = 200): void {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;
    oscillator.start();
    setTimeout(() => oscillator.stop(), duration);
  } catch {
    // Ignore audio errors
  }
}

/** Request notification permission */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  return await Notification.requestPermission();
}

/** Show local notification */
export function showNotification(title: string, options?: NotificationOptions): Notification | null {
  if (Notification.permission === 'granted') {
    return new Notification(title, { icon: '/icon-192.png', badge: '/icon-192.png', ...options });
  }
  return null;
}

/** Haptic feedback for buttons */
export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  if ('vibrate' in navigator) {
    const patterns = { light: 10, medium: 20, heavy: 30 };
    navigator.vibrate(patterns[type]);
  }
}

/** Intersection observer for lazy loading */
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    rootMargin: '100px',
    threshold: 0.1,
    ...options,
  });
}

/** Format file size */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Б';
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Truncate text */
export function truncate(text: string, length: number, suffix = '…'): string {
  if (text.length <= length) return text;
  return text.slice(0, length - suffix.length) + suffix;
}

/** Capitalize first letter */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Slugify string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}