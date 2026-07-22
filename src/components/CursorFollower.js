import { useEffect, useRef } from 'react';
import './CursorFollower.css';

const HOVER_SELECTOR = 'a, button, [data-cursor-hover], input, textarea, select';

/**
 * CursorFollower
 * --------------
 * A 1:1 dot plus an eased trailing ring (mix-blend-mode: difference). The ring
 * grows over interactive elements. Strictly fine-pointer: on touch/coarse the
 * whole thing bails and the native cursor is untouched. `cursor: none` is
 * applied ONLY once the drawn cursor is live (via html.cursor-drawn), so a
 * failed/aborted setup never hides the native cursor. Reduced motion drops the
 * rAF trail — the ring snaps to the pointer instead of lerping.
 */
function CursorFollower() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    // Fine pointer only — never take over touch/coarse cursors.
    if (
      typeof window.matchMedia !== 'function' ||
      !window.matchMedia('(pointer: fine)').matches
    ) {
      return undefined;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) {
      return undefined;
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement;
    root.classList.add('cursor-drawn'); // now (and only now) hide native cursor

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { x: pointer.x, y: pointer.y };
    let rafId = null;
    let visible = false;

    const place = (el, x, y) => {
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    };

    const reveal = () => {
      if (!visible) {
        visible = true;
        root.classList.add('cursor-visible');
      }
    };

    const onMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      place(dot, pointer.x, pointer.y);
      if (reduce) {
        place(ring, pointer.x, pointer.y); // snap: no vestibular-triggering lag
      }
      reveal();
    };

    const lerp = (a, b, t) => a + (b - a) * t;
    const loop = () => {
      ringPos.x = lerp(ringPos.x, pointer.x, 0.18);
      ringPos.y = lerp(ringPos.y, pointer.y, 0.18);
      place(ring, ringPos.x, ringPos.y);
      rafId = requestAnimationFrame(loop);
    };

    const onOver = (event) => {
      if (event.target.closest?.(HOVER_SELECTOR)) {
        ring.classList.add('is-hover');
      }
    };
    const onOut = (event) => {
      if (event.target.closest?.(HOVER_SELECTOR)) {
        ring.classList.remove('is-hover');
      }
    };
    const onLeaveWindow = () => root.classList.remove('cursor-visible');
    const onEnterWindow = () => {
      if (visible) {
        root.classList.add('cursor-visible');
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    document.addEventListener('mouseleave', onLeaveWindow);
    document.addEventListener('mouseenter', onEnterWindow);
    if (!reduce) {
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('mouseleave', onLeaveWindow);
      document.removeEventListener('mouseenter', onEnterWindow);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      root.classList.remove('cursor-drawn', 'cursor-visible');
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
    </>
  );
}

export default CursorFollower;
