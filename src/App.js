import { lazy, Suspense, useEffect, useState } from 'react';
import './App.css';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import ExperienceSection from './components/ExperienceSection';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ProjectsSection from './components/ProjectsSection';
import SkillsSection from './components/SkillsSection';
import {
  contactLinks,
  experience,
  profile,
  projects,
  skills,
} from './data/portfolioData';

const Background3D = lazy(() => import('./components/Background3D'));

const navigationSections = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
];

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0
        ? Math.min(1, Math.max(0, window.scrollY / maxScroll))
        : 0;
      const track = document.querySelector('.dragon-progress__track');
      const width = track ? track.clientWidth : 0;

      document.documentElement.style.setProperty('--scroll-progress', `${progress}`);
      document.documentElement.style.setProperty('--dragon-progress-x', `${progress * width}px`);
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

  // Scroll reveal — fade sections up the first time they enter view.
  useEffect(() => {
    const revealTargets = Array.from(
      document.querySelectorAll('.content-section')
    ).filter((element) => element.id !== 'home');

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion) {
      revealTargets.forEach((element) => element.classList.add('is-revealed'));
      return undefined;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observerInstance.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealTargets.forEach((element) => revealObserver.observe(element));

    return () => {
      revealObserver.disconnect();
    };
  }, []);

  // Background parallax — barely-there warm washes drifting on scroll.
  useEffect(() => {
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
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
      if (dragonPoster) {
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
      }
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
      <img
        aria-hidden="true"
        className="app-dragon-poster"
        src={`${process.env.PUBLIC_URL}/light-fury-portfolio.svg`}
        alt=""
      />

      <Suspense fallback={null}>
        <Background3D />
      </Suspense>

      <Header
        activeSection={activeSection}
        mobileNavOpen={mobileNavOpen}
        onNavigate={() => setMobileNavOpen(false)}
        onToggleMenu={() => setMobileNavOpen((currentValue) => !currentValue)}
        sections={navigationSections}
      />

      <main className="app-main">
        <HeroSection profile={profile} />
        <AboutSection profile={profile} />
        <ExperienceSection experience={experience} />
        <ProjectsSection projects={projects} />
        <SkillsSection skills={skills} />
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
