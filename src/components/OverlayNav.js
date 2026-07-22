import { useEffect, useRef } from 'react';
import './OverlayNav.css';

/**
 * OverlayNav
 * ----------
 * Full-screen studio menu shown on every viewport. Ships the complete a11y
 * contract ported from the old mobile dropdown: focus moves in on open, Tab is
 * trapped across [toggle + links], Esc closes, the rest of the page is inert +
 * scroll-locked (Lenis stopped when it drives scroll), and focus returns to the
 * toggle on close. Rendered as a sibling of <main>/<footer> so `inert` on those
 * never touches the menu. Closed state is inert + aria-hidden -> out of the tab
 * order and the a11y tree.
 */
function OverlayNav({
  open,
  onClose,
  onNavigate,
  sections,
  activeSection,
  lenisRef,
  toggleRef,
  profile,
}) {
  const navRef = useRef(null);
  const firstLinkRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const nav = navRef.current;
    if (!nav) {
      return undefined;
    }

    const toggle = toggleRef && toggleRef.current;
    const lenis = lenisRef && lenisRef.current;
    const main = document.querySelector('.app-main');
    const footer = document.querySelector('.site-footer');

    document.body.classList.add('overlay-open');

    // Scroll-lock: stop Lenis if it's driving scroll, otherwise lock the body.
    const previousOverflow = document.body.style.overflow;
    if (lenis) {
      lenis.stop();
    } else {
      document.body.style.overflow = 'hidden';
    }

    // Take the page behind the menu out of the tab order / a11y tree.
    if (main) {
      main.inert = true;
    }
    if (footer) {
      footer.inert = true;
    }

    // Move focus into the menu (next frame — after it's no longer clipped/inert).
    const focusId = requestAnimationFrame(() => {
      (firstLinkRef.current || nav.querySelector('a'))?.focus();
    });

    const getFocusable = () => [toggle, ...nav.querySelectorAll('a')].filter(Boolean);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }
      const items = getFocusable();
      if (!items.length) {
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(focusId);
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('overlay-open');

      if (lenis) {
        lenis.start();
      } else {
        document.body.style.overflow = previousOverflow;
      }
      if (main) {
        main.inert = false;
      }
      if (footer) {
        footer.inert = false;
      }
      if (toggle) {
        toggle.focus();
      }
    };
  }, [open, onClose, lenisRef, toggleRef]);

  const handleNavigate = (event, sectionId) => {
    onNavigate(event, sectionId);
    onClose();
  };

  return (
    <nav
      aria-label="Primary"
      aria-hidden={!open}
      className={`overlay-nav${open ? ' is-open' : ''}`}
      id="primary-navigation"
      inert={!open}
      ref={navRef}
    >
      <div className="overlay-nav__inner">
        <ul className="overlay-nav__list">
          {sections.map((section, index) => (
            <li className="overlay-nav__item" key={section.id}>
              <a
                className={`overlay-nav__link${
                  activeSection === section.id ? ' is-active' : ''
                }`}
                href={`#${section.id}`}
                onClick={(event) => handleNavigate(event, section.id)}
                ref={index === 0 ? firstLinkRef : undefined}
              >
                <span className="overlay-nav__index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="overlay-nav__label">{section.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="overlay-nav__foot">
          <span className="overlay-nav__note">Night Fury mode // open to 2026 roles</span>
          <a className="overlay-nav__mail" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </div>
      </div>
    </nav>
  );
}

export default OverlayNav;
