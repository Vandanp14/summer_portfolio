function SkillsSection({ skills }) {
  return (
    <section className="content-section" id="skills">
      <div className="section-heading">
        <p className="section-heading__eyebrow">Skills</p>
        <h2>Tools and concepts I reach for when shipping software.</h2>
      </div>

      <div className="skills-grid">
        {skills.map((skillGroup) => (
          <article className="glass-panel skill-card" key={skillGroup.title}>
            <p className="skill-card__label">{skillGroup.title}</p>
            <ul>
              {skillGroup.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export default SkillsSection;
