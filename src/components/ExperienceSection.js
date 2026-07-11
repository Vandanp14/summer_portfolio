function ExperienceSection({ experience }) {
  return (
    <section className="content-section" id="experience">
      <div className="section-heading">
        <p className="section-heading__eyebrow">Experience</p>
        <h2>Impact across dashboards, data systems, and developer workflows.</h2>
      </div>

      <div className="timeline">
        {experience.map((role) => (
          <article className="glass-panel timeline-card" key={`${role.organization}-${role.title}`}>
            <div className="timeline-card__meta">
              <div>
                <p className="timeline-card__eyebrow">{role.eyebrow}</p>
                <h3>{role.title}</h3>
                <p className="timeline-card__company">
                  {role.organization} <span>{role.location}</span>
                </p>
              </div>
              <p className="timeline-card__period">{role.period}</p>
            </div>

            <p className="timeline-card__summary">{role.summary}</p>

            <ul className="timeline-card__highlights">
              {role.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ExperienceSection;
