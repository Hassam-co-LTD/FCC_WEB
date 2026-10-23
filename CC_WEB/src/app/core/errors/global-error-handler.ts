import { ErrorHandler, Injectable, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

const CHUNK_RELOAD_KEY = 'chunkReloadAt';

/** Lazy route chunks fail to load after a redeploy (old hashed file names). */
export function isChunkLoadError(error: unknown): boolean {
  const message = String((error as any)?.message ?? error ?? '');
  return (
    /ChunkLoadError/i.test(message) ||
    /Loading chunk [\w-]+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message)
  );
}

/**
 * Reload the page once to pick up the new build. Guarded so a genuinely
 * missing chunk cannot cause an endless reload loop.
 */
export function reloadForChunkError(): boolean {
  try {
    const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0);
    if (Date.now() - last < 10_000) return false;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
  } catch {
    // storage unavailable: still try a single reload
  }
  window.location.reload();
  return true;
}

/**
 * Last line of defence for errors nobody else handled (template errors,
 * exceptions in subscriptions, unhandled promise rejections, ...).
 * Logs the error and shows a short, non-blocking notice instead of leaving
 * the user staring at a half-rendered screen.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);
  private lastNoticeAt = 0;

  handleError(error: unknown): void {
    const actual = (error as any)?.rejection ?? error; // unwrap promise rejections

    console.error('Unhandled application error:', actual);

    if (!isPlatformBrowser(this.platformId)) return;

    if (isChunkLoadError(actual) && reloadForChunkError()) return;

    // HTTP errors are reported by the calling screen / ApiService.
    if (actual instanceof HttpErrorResponse || (actual as any)?.status !== undefined) return;

    // Throttle so a failing change-detection loop does not spam the user.
    const now = Date.now();
    if (now - this.lastNoticeAt < 5000) return;
    this.lastNoticeAt = now;

    this.zone.run(() => {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Something went wrong',
        text: 'An unexpected error occurred. Please try again.',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      }).catch(() => undefined);
    });
  }
}
