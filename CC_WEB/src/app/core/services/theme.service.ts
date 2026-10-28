import { Injectable, signal } from '@angular/core';
import { isBrowserEnv } from '../utils/browser-storage';

/** localStorage key; kept when the session storage is cleared on logout. */
export const THEME_STORAGE_KEY = 'theme';

/**
 * Light / dark theme for the logged-in app.
 *
 * Dark mode is the `dark-theme` class on <html> (see styles.scss). It is only
 * applied while the main layout is shown, so the login screens keep their own
 * look. index.html sets the class before Angular starts to avoid a light flash.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(this.readPreference());

  private layoutActive = false;

  toggle(): void {
    this.isDark.set(!this.isDark());
    try {
      localStorage.setItem(THEME_STORAGE_KEY, this.isDark() ? 'dark' : 'light');
    } catch {
      // preference just won't persist
    }
    this.apply();
  }

  /** Called by the layout so the theme only affects logged-in pages. */
  setLayoutActive(active: boolean): void {
    this.layoutActive = active;
    this.apply();
  }

  private apply(): void {
    if (!isBrowserEnv()) return;
    document.documentElement.classList.toggle('dark-theme', this.layoutActive && this.isDark());
  }

  private readPreference(): boolean {
    if (!isBrowserEnv()) return false;
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored) return stored === 'dark';
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch {
      return false;
    }
  }
}
