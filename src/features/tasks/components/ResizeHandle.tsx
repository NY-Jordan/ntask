import { getCurrentWindow } from '@tauri-apps/api/window';

type Direction = 'North' | 'South' | 'East' | 'West' | 'NorthEast' | 'NorthWest' | 'SouthEast' | 'SouthWest';

function drag(direction: Direction) {
  return () => getCurrentWindow().startResizeDragging(direction);
}

const EDGE = 4;
const CORNER = 10;

/**
 * `decorations:false` means there's no native OS resize border, so manual
 * resizing needs explicit grab zones along every edge/corner that hand off
 * to the compositor via startResizeDragging — same mechanism the OS uses
 * for a normal window's border. Corners render after edges so they win the
 * hit-test in the overlapping pixels near each corner.
 */
export function ResizeHandle() {
  return (
    <>
      <div
        onMouseDown={drag('North')}
        className="absolute inset-x-0 top-0 cursor-ns-resize"
        style={{ height: EDGE }}
        aria-hidden="true"
      />
      <div
        onMouseDown={drag('South')}
        className="absolute inset-x-0 bottom-0 cursor-ns-resize"
        style={{ height: EDGE }}
        aria-hidden="true"
      />
      <div
        onMouseDown={drag('West')}
        className="absolute inset-y-0 left-0 cursor-ew-resize"
        style={{ width: EDGE }}
        aria-hidden="true"
      />
      <div
        onMouseDown={drag('East')}
        className="absolute inset-y-0 right-0 cursor-ew-resize"
        style={{ width: EDGE }}
        aria-hidden="true"
      />

      <div
        onMouseDown={drag('NorthWest')}
        className="absolute left-0 top-0 cursor-nwse-resize"
        style={{ width: CORNER, height: CORNER }}
        aria-hidden="true"
      />
      <div
        onMouseDown={drag('NorthEast')}
        className="absolute right-0 top-0 cursor-nesw-resize"
        style={{ width: CORNER, height: CORNER }}
        aria-hidden="true"
      />
      <div
        onMouseDown={drag('SouthWest')}
        className="absolute bottom-0 left-0 cursor-nesw-resize"
        style={{ width: CORNER, height: CORNER }}
        aria-hidden="true"
      />
      <div
        onMouseDown={drag('SouthEast')}
        className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
        aria-hidden="true"
      >
        <svg viewBox="0 0 16 16" className="h-full w-full text-white/20">
          <path d="M14 2 2 14M14 8 8 14M14 14v0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </>
  );
}
