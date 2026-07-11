function AboutSection({ profile }) {
  return (
    <section className="content-section content-section--split" id="about">
      <div className="section-heading">
        <p className="section-heading__eyebrow">About</p>
        <h2>{profile.aboutTitle}</h2>
      </div>

      <div className="about-layout">
        <article className="glass-panel narrative-card">
          {profile.aboutParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>

        <article className="glass-panel focus-card">
          <p className="focus-card__label">What I like building</p>
          <ul className="focus-list">
            {profile.focusAreas.map((focusArea) => (
              <li key={focusArea}>{focusArea}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export default AboutSection;
