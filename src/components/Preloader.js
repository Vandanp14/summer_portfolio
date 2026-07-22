import { useEffect, useRef, useState } from 'react';
import './Preloader.css';

const SESSION_KEY = 'introSeen';
const DURATION = 800; // counter beat — completes inside the opaque gate
const HARD_CAP = 900; // opaque gate cap; fonts.ready usually beats it (≤0.9s)
const CURTAIN_MS = 500; // curtain lift — mirrors the .preloader--lift transition
const REVEAL_AT = 0.6; // hero SplitText fires at 60% of the curtain lift

const prefersReducedMotion = () =>
  typeof window.matchMedia !== 'function' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const readSeen = () => {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1';
  } catch (error) {
    return false;
  }
};

const markSeen = () => {
  try {
    window.sessionStorage.setItem(SESSION_KEY, '1');
  } catch (error) {
    /* storage blocked — the intro simply plays each load */
  }
};

const easeInOut = (x) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

/**
 * Preloader
 * ---------
 * 0 -> 100 tabular counter, then a curtain lift into the hero choreography.
 * Completion is tied to REAL readiness (fonts + dragon poster decode) with a
 * hard cap so the hero is never held hostage. Once-per-session via
 * sessionStorage; reduced motion skips the whole thing. `onComplete` fires at
 * 60% of the curtain lift so the hero name emerges from under the rising
 * curtain. Total intro (gate + curtain) stays ≤1.4s.
 */
function Preloader({ onComplete }) {
  const [count, setCount] = useState(0);
  // 'active' -> 'lifting' -> 'done'
  const [status, setStatus] = useState('active');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Skip: reduced motion or already seen this session -> straight to content.
    if (prefersReducedMotion() || readSeen()) {
      setStatus('done');
      onCompleteRef.current?.();
      return undefined;
    }

    let rafId = null;
    let capId = null;
    let revealId = null;
    let finished = false;

    const finish = () => {
      if (finished) {
        return;
      }
      finished = true;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (capId) {
        clearTimeout(capId);
      }
      markSeen(); // set only on real completion -> StrictMode-remount safe
      setCount(100);
      setStatus('lifting');
      // Hero SplitText starts at 60% of the curtain lift so the name emerges
      // from under the rising curtain instead of before it starts moving.
      revealId = window.setTimeout(
        () => onCompleteRef.current?.(),
        CURTAIN_MS * REVEAL_AT
      );
    };

    const start = performance.now();
    const counterDone = new Promise((resolve) => {
      const tick = (now) => {
        const progress = Math.min((now - start) / DURATION, 1);
        setCount(Math.round(easeInOut(progress) * 100));
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };
      rafId = requestAnimationFrame(tick);
    });

    const fontsReady =
      document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();

    const poster = document.querySelector('.app-dragon-poster');
    const posterDecode =
      poster && typeof poster.decode === 'function'
        ? poster.decode().catch(() => {})
        : Promise.resolve();

    Promise.all([counterDone, fontsReady, posterDecode]).then(finish).catch(finish);
    capId = window.setTimeout(finish, HARD_CAP);

    return () => {
      finished = true;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (capId) {
        clearTimeout(capId);
      }
      if (revealId) {
        clearTimeout(revealId);
      }
    };
  }, []);

  const handleTransitionEnd = (event) => {
    if (event.target === event.currentTarget && status === 'lifting') {
      setStatus('done');
    }
  };

  if (status === 'done') {
    return null;
  }

  return (
    <div
      className={`preloader${status === 'lifting' ? ' preloader--lift' : ''}`}
      onTransitionEnd={handleTransitionEnd}
      aria-hidden="true"
    >
      <div className="preloader__inner">
        <span className="preloader__label">Entering Night Fury mode</span>
        <span className="preloader__count">{count}</span>
      </div>
    </div>
  );
}

export default Preloader;
