function HeroSection({ profile, contactLinks }) {
  const primaryLinks = contactLinks.filter((link) => link.featured);

  return (
    <section className="hero-section" id="home">
      <div className="hero-copy">
        <p className="hero-copy__eyebrow">{profile.heroBadge}</p>
        <h1>{profile.name}</h1>
        <p className="hero-copy__title">{profile.title}</p>
        <p className="hero-copy__description">{profile.heroDescription}</p>

        <ul className="hero-copy__meta" aria-label="Profile details">
          <li>{profile.heroLocation}</li>
          {profile.heroHighlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>

        <div className="hero-copy__actions">
          <a className="button button--primary" href={profile.resumeUrl} target="_blank" rel="noreferrer">
            View Resume
          </a>
          <a className="button button--secondary" href="#contact">
            Contact Me
          </a>
        </div>

        <ul className="hero-socials" aria-label="Professional links">
          {primaryLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <aside className="hero-panel glass-panel" aria-label="Profile highlights">
        <div className="hero-panel__status">
          <p className="hero-panel__label">Now building</p>
          <p>{profile.currentFocus}</p>
        </div>

        <div className="metric-grid">
          {profile.metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <p className="metric-card__value">{metric.value}</p>
              <p className="metric-card__label">{metric.label}</p>
            </article>
          ))}
        </div>
      </aside>
    </section>
  );
}

export default HeroSection;
