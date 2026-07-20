function Header({
  sections,
  activeSection,
  mobileNavOpen,
  onToggleMenu,
  onNavigate,
}) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-brand" href="#home" onClick={onNavigate}>
          Vandan Patel
        </a>

        <button
          aria-controls="primary-navigation"
          aria-expanded={mobileNavOpen}
          aria-label="Toggle navigation menu"
          className="site-header__menu-button"
          onClick={onToggleMenu}
          type="button"
        >
          <span />
          <span />
        </button>

        <nav
          aria-label="Primary"
          className={`site-nav ${mobileNavOpen ? 'site-nav--open' : ''}`}
          id="primary-navigation"
        >
          {sections.map((section) => (
            <a
              className={activeSection === section.id ? 'is-active' : ''}
              href={`#${section.id}`}
              key={section.id}
              onClick={onNavigate}
            >
              {section.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="dragon-progress" aria-hidden="true">
        <div className="dragon-progress__track">
          <span className="dragon-progress__bar" />
          <span className="dragon-progress__marker" />
        </div>
      </div>
    </header>
  );
}

export default Header;
