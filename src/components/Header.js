/**
 * Header
 * ------
 * Studio bar: brand + Menu toggle + the dragon scroll-progress marker. The nav
 * itself is a full-screen overlay (see OverlayNav) whose open/close a11y
 * contract lives there. The toggle button ref is owned by App so OverlayNav can
 * return focus to it on close and include it in the focus trap.
 */
function Header({ overlayOpen, onToggleMenu, onNavigate, toggleRef }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a
          className="site-brand"
          href="#home"
          onClick={(event) => onNavigate(event, 'home')}
        >
          Vandan Patel
        </a>

        <button
          aria-controls="primary-navigation"
          aria-expanded={overlayOpen}
          aria-label={overlayOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="site-toggle"
          onClick={onToggleMenu}
          ref={toggleRef}
          type="button"
        >
          <span className="site-toggle__label">{overlayOpen ? 'Close' : 'Menu'}</span>
          <span className="site-toggle__glyph" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
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
