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
          <span className="site-brand__mark">VP</span>
          <span className="site-brand__text">Vandan Patel</span>
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
    </header>
  );
}

export default Header;
