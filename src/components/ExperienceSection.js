import './ExperienceSection.css';

function ExperienceSection({ experience }) {
  return (
    <section className="content-section xp" id="experience" aria-labelledby="xp-title">
      <div className="section-heading">
        <p className="eyebrow">Where I've worked</p>
        <h2 className="section-title" id="xp-title">
          Impact across dashboards, data systems, and developer workflows.
        </h2>
      </div>

      <ol className="xp-list">
        {experience.map((role) => (
          <li className="xp-row" key={`${role.organization}-${role.title}`}>
            <div className="xp-row__aside">
              <p className="xp-period">{role.period}</p>
              <p className="xp-location">{role.location}</p>
            </div>

            <div className="xp-row__main">
              <p className="eyebrow xp-tag">{role.eyebrow}</p>
              <h3 className="xp-title">{role.title}</h3>
              <p className="xp-org">{role.organization}</p>
              <p className="xp-summary">{role.summary}</p>

              <ul className="xp-highlights">
                {role.highlights.map((highlight) => (
                  <li className="xp-highlight" key={highlight}>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default ExperienceSection;
