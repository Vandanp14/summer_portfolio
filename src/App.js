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

  return (
    <div className="app-shell">
      <div className="app-shell__aurora app-shell__aurora--primary" />
      <div className="app-shell__aurora app-shell__aurora--secondary" />
      <div className="app-shell__grid" aria-hidden="true" />

      <Header
        activeSection={activeSection}
        mobileNavOpen={mobileNavOpen}
        onNavigate={() => setMobileNavOpen(false)}
        onToggleMenu={() => setMobileNavOpen((currentValue) => !currentValue)}
        sections={navigationSections}
      />

      <main className="app-main">
        <HeroSection
          contactLinks={contactLinks}
          profile={profile}
        />
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
