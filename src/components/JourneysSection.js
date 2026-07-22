import { useEffect, useState } from 'react';
import JourneyTunnel, { canRun3D } from './JourneyTunnel';
import './JourneysSection.css';

// ── Fallback path (unchanged behaviour) ──────────────────────────────────
// Flat photo marquee + per-image onError swap. Rendered whenever the device
// cannot (or should not) run the 3D tunnel: reduced-motion, mobile, no-WebGL,
// data-saver, low-memory / low-core, software renderers, and jsdom under test.
function JourneyCard({ item, duplicate }) {
  const base = process.env.PUBLIC_URL || '';
  const [failed, setFailed] = useState(false);

  return (
    <li
      className={`journeys__item${failed ? ' journeys__item--fallback' : ''}`}
      style={failed ? { aspectRatio: `${item.width} / ${item.height}` } : undefined}
      aria-hidden={duplicate || undefined}
    >
      {failed ? (
        <div className="journeys__fallback" aria-hidden="true" />
      ) : (
        <img
          className="journeys__img"
          src={`${base}/${item.src}`}
          alt={duplicate ? '' : item.alt}
          width={item.width}
          height={item.height}
          loading="lazy"
          decoding="async"
          draggable="false"
          onError={() => setFailed(true)}
        />
      )}
      <div className="journeys__caption">
        <span className="journeys__tag">{item.tag}</span>
        <span className="journeys__place">{item.place}</span>
      </div>
    </li>
  );
}

function JourneyMarquee({ journeys }) {
  return (
    <div className="journeys__viewport">
      <ul className="journeys__track">
        {journeys.map((item) => (
          <JourneyCard key={item.id} item={item} duplicate={false} />
        ))}
        {journeys.map((item) => (
          <JourneyCard key={`${item.id}-dup`} item={item} duplicate />
        ))}
      </ul>
    </div>
  );
}

export default function JourneysSection({ journeys = [] }) {
  // Capability decided once, client-side, after mount. Initial render is the
  // marquee → SSR / jsdom safe, and the marquee shows immediately on
  // mobile / reduced-motion with no WebGL attempt. Only capable clients swap
  // in the 3D tunnel. If the tunnel later reports it cannot run (async load
  // failure, edge resize), it flips back to the marquee.
  const [mode, setMode] = useState('fallback');

  useEffect(() => {
    if (canRun3D()) setMode('tunnel');
  }, []);

  return (
    <section id="journeys" className="content-section journeys" aria-labelledby="journeys-title">
      <div className="section-heading">
        <p className="eyebrow">Beyond code</p>
        <h2 className="section-title kinetic-title" id="journeys-title">
          Hiking &amp; travelling
        </h2>
      </div>

      {mode === 'tunnel' ? (
        <JourneyTunnel journeys={journeys} onUnsupported={() => setMode('fallback')} />
      ) : (
        <JourneyMarquee journeys={journeys} />
      )}
    </section>
  );
}
