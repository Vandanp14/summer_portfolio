import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import './HeroSection.css';

gsap.registerPlugin(SplitText);

const FOLLOWER_SELECTOR =
  '.hero__eyebrow, .hero__title, .hero__description, .hero__actions, .hero__meta, .hero__stats';

const reducedMotion = () =>
  typeof window.matchMedia !== 'function' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function HeroSection({ profile, startReveal = true }) {
  const rootRef = useRef(null);
  const nameRef = useRef(null);
  const primaryButtonRef = useRef(null);

  const metaLine = [profile.heroLocation, ...profile.heroHighlights].join(' · ');

  // Choreographed load reveal: the name splits into characters that rise + fade
  // in (~0.9s), then the badge/title/description/CTAs/meta/stats follow in one
  // sequence. Split only after fonts load (no FOUT re-measure); the container
  // keeps its readable text via SplitText's aria:'auto'. Reduced motion → no
  // split, everything visible immediately. StrictMode-safe (reverts on unmount).
  useEffect(() => {
    // Dependency array is always literally [startReveal] — a single, constant
    // slot — so React never sees it change size between renders. All conditions
    // (wait for the preloader curtain to start lifting; refs mounted) are guarded
    // inside so the effect simply no-ops until it's ready to run.
    const root = rootRef.current;
    const name = nameRef.current;
    if (!startReveal || !root || !name) {
      return undefined;
    }

    const followers = root.querySelectorAll(FOLLOWER_SELECTOR);

    if (reducedMotion()) {
      gsap.set(name, { autoAlpha: 1 });
      followers.forEach((element) =>
        gsap.set(element, { clearProps: 'opacity,transform' })
      );
      return undefined;
    }

    let split = null;
    let timeline = null;
    let cancelled = false;

    const build = () => {
      if (cancelled) {
        return;
      }
      split = SplitText.create(name, {
        type: 'words,chars',
        charsClass: 'hero__char',
        aria: 'auto',
      });
      gsap.set(name, { autoAlpha: 1 });

      timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      timeline
        .from(
          split.chars,
          {
            yPercent: 120,
            opacity: 0,
            rotateX: -40,
            transformOrigin: '50% 100%',
            duration: 0.7,
            stagger: 0.02,
          },
          0
        )
        .to(
          followers,
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.07,
          },
          0.4
        );
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(build).catch(build);
    } else {
      build();
    }

    return () => {
      cancelled = true;
      if (timeline) {
        timeline.kill();
      }
      if (split) {
        split.revert();
      }
      gsap.set(name, { clearProps: 'all' });
      followers.forEach((element) => gsap.set(element, { clearProps: 'all' }));
    };
  }, [startReveal]);

  // Magnetic primary CTA — fine-pointer, motion-friendly only. Small translate
  // (capped at 8px) eased toward the cursor, springs home on leave.
  useEffect(() => {
    const button = primaryButtonRef.current;
    if (!button) {
      return undefined;
    }

    const finePointer =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: fine)').matches;
    if (reducedMotion() || !finePointer) {
      return undefined;
    }

    const xTo = gsap.quickTo(button, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(button, 'y', { duration: 0.5, ease: 'power3.out' });
    const MAX_SHIFT = 8;
    const STRENGTH = 0.4;

    const onMove = (event) => {
      const rect = button.getBoundingClientRect();
      let tx = (event.clientX - (rect.left + rect.width / 2)) * STRENGTH;
      let ty = (event.clientY - (rect.top + rect.height / 2)) * STRENGTH;
      const magnitude = Math.hypot(tx, ty);
      if (magnitude > MAX_SHIFT) {
        tx = (tx / magnitude) * MAX_SHIFT;
        ty = (ty / magnitude) * MAX_SHIFT;
      }
      xTo(tx);
      yTo(ty);
    };

    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    button.addEventListener('pointermove', onMove);
    button.addEventListener('pointerleave', onLeave);

    return () => {
      button.removeEventListener('pointermove', onMove);
      button.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(button);
      gsap.set(button, { clearProps: 'transform' });
    };
  }, []);

  return (
    <section
      className="content-section hero"
      id="home"
      aria-labelledby="hero-name"
      ref={rootRef}
    >
      <div className="hero__inner">
        <p className="eyebrow hero__eyebrow">
          <span className="hero__dot" aria-hidden="true" />
          {profile.heroBadge}
        </p>

        <h1 className="hero__name" id="hero-name" ref={nameRef}>
          {profile.name}
        </h1>

        <p className="hero__title">{profile.title}</p>

        <p className="hero__description">{profile.heroDescription}</p>

        <div className="hero__actions">
          <a
            className="button button--primary"
            href={profile.resumeUrl}
            ref={primaryButtonRef}
            target="_blank"
            rel="noreferrer"
          >
            View resume
          </a>
          <a className="button button--secondary" href="#contact">
            Get in touch
          </a>
        </div>

        <p className="hero__meta">{metaLine}</p>

        <dl className="hero__stats" aria-label="Portfolio highlights">
          {profile.metrics.map((metric) => (
            <div className="hero__stat" key={metric.label}>
              <dt className="hero__stat-value">{metric.value}</dt>
              <dd className="hero__stat-label">{metric.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default HeroSection;
