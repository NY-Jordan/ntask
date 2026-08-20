import { useEffect, useRef } from 'react';
import { currentMonitor, getCurrentWindow } from '@tauri-apps/api/window';
import { LogicalPosition, LogicalSize } from '@tauri-apps/api/dpi';

export type PanelMode = 'fab' | 'list' | 'add' | 'edit' | 'detail' | 'categories' | 'links';

export const FAB_SIZE = 84;

const PANEL_SIZES: Record<Exclude<PanelMode, 'fab'>, { width: number; height: number }> = {
  list: { width: 380, height: 480 },
  add: { width: 380, height: 560 },
  edit: { width: 380, height: 560 },
  detail: { width: 400, height: 560 },
  categories: { width: 380, height: 480 },
  links: { width: 380, height: 520 },
};

const PANEL_SIZE_STORAGE_KEY = 'taskbar:panelSize';

function loadStoredPanelSize(): { width: number; height: number } | null {
  try {
    const raw = localStorage.getItem(PANEL_SIZE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { width?: unknown; height?: unknown };
    if (typeof parsed.width === 'number' && typeof parsed.height === 'number') {
      return { width: parsed.width, height: parsed.height };
    }
  } catch {
    // ignore malformed/unavailable storage
  }
  return null;
}

function storePanelSize(width: number, height: number) {
  try {
    localStorage.setItem(PANEL_SIZE_STORAGE_KEY, JSON.stringify({ width, height }));
  } catch {
    // storage unavailable — resizing still works, it just won't persist
  }
}

/**
 * The window itself is resized to exactly match whichever UI is showing — a
 * small square for the collapsed FAB, a larger rectangle sized per panel
 * view once open. This is only the *default* size for a given view: once
 * open, the user can freely drag/resize the window (see ResizeHandle and
 * the panel header's drag region) and that manual size sticks until the
 * next mode change.
 *
 * The FAB/panel can be dragged anywhere on screen, so instead of
 * re-anchoring to a fixed corner, this keeps whichever edges the window is
 * currently closest to fixed and grows away from them — the same "flip
 * toward free space" behavior as a tooltip or popover.
 */
export function useWindowMode(mode: PanelMode) {
  // Distinguishes our own setSize() calls from the user dragging a
  // ResizeHandle, so the resize listener below only persists user-driven
  // resizes and doesn't immediately overwrite the saved size with whatever
  // default the current view just applied.
  const skipNextResizeSave = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const win = getCurrentWindow();

    async function apply() {
      const stored = mode !== 'fab' ? loadStoredPanelSize() : null;
      const { width, height } = mode === 'fab' ? { width: FAB_SIZE, height: FAB_SIZE } : (stored ?? PANEL_SIZES[mode]);
      if (cancelled) return;

      // A resizable window lets WebKitGTK auto-negotiate its size against
      // the content's "natural" size, which can override an explicit
      // setSize with something content-derived instead. Pinning min==max
      // while collapsed forces the compositor to honor the exact FAB size;
      // panel views clear the max so the user's manual resize (via
      // ResizeHandle) still works.
      if (mode === 'fab') {
        await win.setMinSize(new LogicalSize(width, height));
        await win.setMaxSize(new LogicalSize(width, height));
      } else {
        await win.setMaxSize(undefined);
        await win.setMinSize(new LogicalSize(FAB_SIZE, FAB_SIZE));
      }
      skipNextResizeSave.current = true;
      await win.setSize(new LogicalSize(width, height));

      // Re-anchoring reads the window's current screen position, which some
      // platforms (e.g. Wayland compositors) refuse to report to clients.
      // Treat that as best-effort so a failure here never blocks the resize.
      try {
        const monitor = await currentMonitor();
        const scale = await win.scaleFactor();
        const position = (await win.outerPosition()).toLogical(scale);
        const currentSize = (await win.outerSize()).toLogical(scale);
        if (!monitor || cancelled) return;

        const screenWidth = monitor.size.width / monitor.scaleFactor;
        const screenHeight = monitor.size.height / monitor.scaleFactor;

        const currentRight = position.x + currentSize.width;
        const currentBottom = position.y + currentSize.height;

        // Collapsing back to the FAB always keeps the panel's bottom-right
        // corner fixed, so the FAB reappears exactly where that corner was
        // instead of jumping to whichever edge the heuristic below picks.
        const anchorRight = mode === 'fab' || screenWidth - currentRight < position.x;
        const anchorBottom = mode === 'fab' || screenHeight - currentBottom < position.y;

        const x = anchorRight ? currentRight - width : position.x;
        const y = anchorBottom ? currentBottom - height : position.y;

        await win.setPosition(new LogicalPosition(x, y));
      } catch (error) {
        console.error('useWindowMode: re-anchoring failed', error);
      }
    }

    apply();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  // Persist user-driven resizes (dragging a ResizeHandle) so the panel
  // reopens at the size the user last left it, regardless of which view
  // triggered the open.
  useEffect(() => {
    const win = getCurrentWindow();
    let unlisten: (() => void) | undefined;
    let cancelled = false;

    win
      .onResized(async ({ payload }) => {
        if (skipNextResizeSave.current) {
          skipNextResizeSave.current = false;
          return;
        }
        if (mode === 'fab') return;
        const scale = await win.scaleFactor();
        const { width, height } = payload.toLogical(scale);
        storePanelSize(width, height);
      })
      .then((fn) => {
        if (cancelled) {
          fn();
        } else {
          unlisten = fn;
        }
      });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [mode]);
}
