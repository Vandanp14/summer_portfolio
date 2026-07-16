import './HeroSection.css';

function HeroSection({ profile }) {
  const metaLine = [profile.heroLocation, ...profile.heroHighlights].join(' · ');

  return (
    <section className="content-section hero" id="home" aria-labelledby="hero-name">
      <div className="hero__inner">
        <p className="eyebrow hero__eyebrow">
          <span className="hero__dot" aria-hidden="true" />
          {profile.heroBadge}
        </p>

        <h1 className="hero__name" id="hero-name">
          {profile.name}
        </h1>

        <p className="hero__title">{profile.title}</p>

        <p className="hero__description">{profile.heroDescription}</p>

        <div className="hero__actions">
          <a
            className="button button--primary"
            href={profile.resumeUrl}
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
