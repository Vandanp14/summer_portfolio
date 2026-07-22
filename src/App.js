import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import './App.css';
import AboutSection from './components/AboutSection';
import AuroraThread from './components/AuroraThread';
import ContactSection from './components/ContactSection';
import CursorFollower from './components/CursorFollower';
import ExperienceSection from './components/ExperienceSection';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import JourneysSection from './components/JourneysSection';
import MarqueeStrip from './components/MarqueeStrip';
import OverlayNav from './components/OverlayNav';
import Preloader from './components/Preloader';
import ProjectsSection from './components/ProjectsSection';
import SkillsSection from './components/SkillsSection';
import {
  contactLinks,
  experience,
  journeys,
  profile,
  projects,
  skills,
} from './data/portfolioData';

const Background3D = lazy(() => import('./components/Background3D'));

gsap.registerPlugin(ScrollTrigger, SplitText);

// Treat a missing matchMedia (e.g. jsdom under test) as "reduce" so no smooth
// scroll / scroll-trigger machinery spins up outside a real browser.
const prefersReducedMotion = () =>
  typeof window.matchMedia !== 'function' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Hermite smoothstep — eases the ambient orb/beam intensity between thresholds.
const smoothstep = (value, edge0, edge1) => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0 || 1)));
  return t * t * (3 - 2 * t);
};

const navigationSections = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'journeys', label: 'Journeys' },
  { id: 'contact', label: 'Contact' },
];

const MARQUEE_WORDS = ['Build', 'Ship', 'Hike', 'Explore', 'Repeat'];

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const lenisRef = useRef(null);
  const toggleRef = useRef(null);

  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);

  // The Night Fury poster is fallback art. Background3D adds `html.webgl-live`
  // the instant its scene genuinely initializes (and removes it on dispose), so
  // the poster is hidden purely via CSS (`html.webgl-live .app-dragon-poster`).
  // When 3D never runs — reduced motion, no WebGL, low-capability — the class is
  // never added and the poster stays as the fallback art.

  useEffect(() => {
    const sectionElements = navigationSections
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);

    if (!sectionElements.length || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((firstEntry, secondEntry) => secondEntry.intersectionRatio - firstEntry.intersectionRatio);

        if (visibleEntries.length > 0) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-30% 0px -45% 0px',
        threshold: [0.2, 0.35, 0.5, 0.65],
      }
    );

    sectionElements.forEach((sectionElement) => observer.observe(sectionElement));

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let frameId = null;

    const updateScrollProgress = () => {
      frameId = null;
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const maxScroll = document.documentElement.scrollHeight - vh;
      const progress = maxScroll > 0
        ? Math.min(1, Math.max(0, scrollY / maxScroll))
        : 0;
      const track = document.querySelector('.dragon-progress__track');
      const width = track ? track.clientWidth : 0;

      document.documentElement.style.setProperty('--scroll-progress', `${progress}`);
      document.documentElement.style.setProperty('--dragon-progress-x', `${progress * width}px`);

      // ── Ambient dosage (design-brief "A Night Flight") ─────────────────────
      // Drive the aurora orb + beam intensity straight off scroll geometry,
      // reusing THIS existing rAF (no new loop). The orb rides the beam and
      // pulses bright in the section seams, dims inside a content fold, and
      // hides entirely across the pinned Journeys tunnel. The beam swells ×2
      // across the marquee "runway" into the tunnel entry, then returns
      // elevated and decays back toward Contact.
      const centerY = scrollY + vh / 2; // page-space y of the viewport centre
      let orbOpacity = 1; // seam / gap → ring reads its native 0.85
      const sections = document.querySelectorAll('.content-section');
      for (let i = 0; i < sections.length; i += 1) {
        const rect = sections[i].getBoundingClientRect();
        const top = rect.top + scrollY;
        const bottom = rect.bottom + scrollY;
        if (centerY >= top && centerY <= bottom) {
          if (sections[i].id === 'journeys') {
            orbOpacity = 0; // pinned tunnel owns the fold
          } else {
            const half = (bottom - top) / 2 || 1;
            const f = Math.min(1, Math.abs(centerY - (top + bottom) / 2) / half);
            // 0.176 → ring reads ~0.15 in the fold; 1 → its native 0.85 in seams.
            orbOpacity = 0.176 + 0.824 * smoothstep(f, 0.55, 1);
          }
          break;
        }
      }
      // Terminus: the orb settles bright above the footer as the page bottoms out.
      orbOpacity = Math.max(orbOpacity, smoothstep(progress, 0.985, 1));
      document.documentElement.style.setProperty('--orb-opacity', `${orbOpacity}`);

      let beamGlow = 1;
      const marquee = document.querySelector('.marquee-strip');
      const journeys = document.getElementById('journeys');
      const contact = document.getElementById('contact');
      if (marquee && journeys && contact) {
        const mTop = marquee.getBoundingClientRect().top + scrollY;
        const jRect = journeys.getBoundingClientRect();
        const jTop = jRect.top + scrollY;
        const jBottom = jRect.bottom + scrollY;
        const cBottom = contact.getBoundingClientRect().bottom + scrollY;
        const runwayStart = mTop - vh * 0.4;
        if (centerY >= runwayStart && centerY < jTop) {
          beamGlow = 1 + smoothstep(centerY, runwayStart, jTop); // 1× → 2×
        } else if (centerY >= jTop && centerY <= jBottom) {
          beamGlow = 2; // elevated behind the tunnel through the pin
        } else if (centerY > jBottom && centerY <= cBottom) {
          beamGlow = 2 - smoothstep(centerY, jBottom, cBottom); // decays 2× → 1×
        }
      }
      document.documentElement.style.setProperty('--beam-glow', `${beamGlow}`);
    };

    const handleScrollProgress = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateScrollProgress);
      }
    };

    updateScrollProgress();
    window.addEventListener('scroll', handleScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);

    return () => {
      window.removeEventListener('scroll', handleScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  // Smooth scroll (Lenis) + section fades + kinetic title line-masks (GSAP
  // ScrollTrigger). Disabled wholesale under reduced motion. Lenis drives the
  // *real* window scroll, so every existing window-scroll listener keeps working.
  useEffect(() => {
    const revealTargets = gsap.utils
      .toArray('.content-section')
      .filter((element) => element.id !== 'home');

    if (prefersReducedMotion()) {
      revealTargets.forEach((element) => element.classList.add('is-revealed'));
      return undefined;
    }

    let cancelled = false;
    let lenis = null;
    let tickerCallback = null;
    let triggers = [];
    let titleTweens = [];
    let titleSplits = [];

    const revealAll = () =>
      revealTargets.forEach((element) => element.classList.add('is-revealed'));

    try {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      lenisRef.current = lenis;

      // One shared rAF loop drives both libraries (GSAP time is seconds → ms).
      lenis.on('scroll', ScrollTrigger.update);
      tickerCallback = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);

      // Sections fade in once (opacity-only via CSS class).
      triggers = ScrollTrigger.batch(revealTargets, {
        start: 'top 85%',
        once: true,
        onEnter: (batch) =>
          batch.forEach((element) => element.classList.add('is-revealed')),
      });

      // Kinetic section titles: each line rises out of an overflow mask on
      // scroll-in, once. Split after fonts load so the line count is correct.
      const setupTitles = () => {
        if (cancelled) {
          return;
        }
        gsap.utils.toArray('.kinetic-title').forEach((element) => {
          const split = SplitText.create(element, {
            type: 'lines',
            linesClass: 'kinetic-line',
            mask: 'lines',
            aria: 'auto',
          });
          titleSplits.push(split);
          const tween = gsap.from(split.lines, {
            yPercent: 110,
            duration: 0.9,
            ease: 'power4.out',
            stagger: 0.12,
            scrollTrigger: { trigger: element, start: 'top 85%', once: true },
          });
          titleTweens.push(tween);
        });
        ScrollTrigger.refresh();
      };

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(setupTitles).catch(setupTitles);
      } else {
        setupTitles();
      }
    } catch (error) {
      // Never leave content hidden if the motion layer fails to initialise.
      revealAll();
    }

    return () => {
      cancelled = true;
      titleTweens.forEach((tween) => {
        if (tween.scrollTrigger) {
          tween.scrollTrigger.kill();
        }
        tween.kill();
      });
      titleSplits.forEach((split) => split.revert());
      triggers.forEach((trigger) => trigger.kill());
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }
      if (lenis) {
        lenis.destroy();
      }
      lenisRef.current = null;
    };
  }, []);

  // Nav clicks: route through Lenis (smooth scroll + sticky-header offset) when
  // it is running, otherwise fall through to the native anchor jump.
  const handleNavigate = useCallback((event, sectionId) => {
    const lenis = lenisRef.current;
    if (!lenis || !sectionId) {
      return;
    }

    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }

    event.preventDefault();
    const header = document.querySelector('.site-header');
    const offset = header ? -(header.offsetHeight + 12) : -84;
    // When this fires from the open overlay menu, Lenis is still stopped by the
    // scroll-lock, so scrollTo() would be silently swallowed. Restart it first:
    // start() is a no-op when already running, and doing it here pre-empts the
    // menu-close cleanup's own start() so that later call can't reset()/kill
    // this scroll animation.
    lenis.start();
    lenis.scrollTo(target, { offset });
  }, []);

  const handleToggleMenu = useCallback(
    () => setOverlayOpen((currentValue) => !currentValue),
    []
  );

  const handleCloseMenu = useCallback(() => setOverlayOpen(false), []);

  // Background parallax — the Night Fury poster drifting on scroll.
  useEffect(() => {
    if (prefersReducedMotion()) {
      return undefined;
    }

    const dragonPoster = document.querySelector('.app-dragon-poster');
    if (!dragonPoster) {
      return undefined;
    }

    let frameId = null;

    const applyParallax = () => {
      frameId = null;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
      const reveal = Math.min(1, progress * 2.4);
      const exit = Math.max(0, (progress - 0.68) * 3.2);
      const opacity = Math.max(0.24, reveal * (1 - exit));
      const y = -18 + progress * 54;
      const scale = 0.96 + reveal * 0.08 - exit * 0.12;
      const rotate = -2 + progress * 5;
      dragonPoster.style.opacity = `${opacity}`;
      dragonPoster.style.transform = `translate3d(0, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`;
    };

    const handleScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(applyParallax);
      }
    };

    applyParallax();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <div className="app-shell">
      <Preloader onComplete={handleIntroComplete} />
      <CursorFollower />

      <img
        aria-hidden="true"
        className="app-dragon-poster"
        src={`${process.env.PUBLIC_URL}/night-fury-portfolio.svg`}
        alt=""
      />

      <Suspense fallback={null}>
        <Background3D />
      </Suspense>

      <AuroraThread />

      <Header
        overlayOpen={overlayOpen}
        onNavigate={handleNavigate}
        onToggleMenu={handleToggleMenu}
        toggleRef={toggleRef}
      />

      <OverlayNav
        activeSection={activeSection}
        lenisRef={lenisRef}
        onClose={handleCloseMenu}
        onNavigate={handleNavigate}
        open={overlayOpen}
        profile={profile}
        sections={navigationSections}
        toggleRef={toggleRef}
      />

      <main className="app-main">
        <HeroSection profile={profile} startReveal={introComplete} />
        <AboutSection profile={profile} />
        <ExperienceSection experience={experience} />
        <ProjectsSection projects={projects} />
        <SkillsSection skills={skills} />
        <MarqueeStrip words={MARQUEE_WORDS} />
        <JourneysSection journeys={journeys} />
        <ContactSection
          contactLinks={contactLinks}
          profile={profile}
        />
      </main>

      <footer className="site-footer">
        <p>{profile.footerNote}</p>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
      </footer>
    </div>
  );
}

export default App;
