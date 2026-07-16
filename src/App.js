import { useEffect, useState } from 'react';
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

    const sage = document.querySelector('.app-bg--sage');
    const champagne = document.querySelector('.app-bg--champagne');

    if (!sage && !champagne) {
      return undefined;
    }

    let frameId = null;

    const applyParallax = () => {
      frameId = null;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      if (sage) {
        sage.style.transform = `translate3d(0, ${scrollY * -0.06}px, 0)`;
      }
      if (champagne) {
        champagne.style.transform = `translate3d(0, ${scrollY * 0.04}px, 0)`;
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
      <div aria-hidden="true" className="app-bg app-bg--sage" />
      <div aria-hidden="true" className="app-bg app-bg--champagne" />

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
