import './AuroraThread.css';

/**
 * AuroraThread
 * ------------
 * A purely decorative, dependency-free ambient layer: a vertical aurora "thread"
 * of light running down the center of the page (a magic-tunnel spine) plus a
 * glowing ring/orb that travels top -> bottom tracking scroll progress.
 *
 * Zero JS logic. The traveling orb is positioned entirely in CSS from the
 * `--scroll-progress` (0..1) custom property that App.js already writes onto
 * document.documentElement every scroll frame (rAF-throttled) — so this
 * component adds NO new scroll listeners and re-renders never.
 *
 * Everything is aria-hidden and pointer-events:none; content stays 100%
 * readable and reachable. Motion + capability fallbacks live in the CSS.
 */
function AuroraThread() {
  return (
    <div className="aurora-thread" aria-hidden="true">
      <div className="aurora-thread__ribbon" />
      <div className="aurora-thread__orb" />
    </div>
  );
}

export default AuroraThread;
