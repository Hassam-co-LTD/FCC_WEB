/**
 * SSR-safe wrappers around sessionStorage / localStorage.
 *
 * On the server (SSR / prerender) the Web Storage globals do not exist, and in
 * the browser they can throw (private mode, quota exceeded, blocked storage).
 * These helpers never throw: reads fall back to null / the given default.
 */

type StorageKind = 'session' | 'local';

function getStorage(kind: StorageKind): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return kind === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export function isBrowserEnv(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function getSessionItem(key: string): string | null {
  try {
    return getStorage('session')?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function setSessionItem(key: string, value: string): void {
  try {
    getStorage('session')?.setItem(key, value);
  } catch (error) {
    console.error(`Unable to write "${key}" to sessionStorage:`, error);
  }
}

export function removeSessionItem(key: string): void {
  try {
    getStorage('session')?.removeItem(key);
  } catch {
    // nothing to clean up
  }
}

export function clearSessionStorage(): void {
  try {
    getStorage('session')?.clear();
  } catch {
    // nothing to clean up
  }
}

export function clearLocalStorage(): void {
  try {
    getStorage('local')?.clear();
  } catch {
    // nothing to clean up
  }
}

/** Parse JSON safely; returns `fallback` for null, empty or malformed input. */
export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw || raw === 'undefined' || raw === 'null') return fallback;
  try {
    return (JSON.parse(raw) as T) ?? fallback;
  } catch (error) {
    console.error('Failed to parse stored JSON:', error);
    return fallback;
  }
}

/** Read and parse a JSON value from sessionStorage without ever throwing. */
export function readSessionJson<T = any>(key: string, fallback: T): T {
  return safeJsonParse<T>(getSessionItem(key), fallback);
}
