import './SkillsSection.css';

function SkillsSection({ skills }) {
  return (
    <section className="content-section skills" id="skills" aria-labelledby="skills-title">
      <div className="skills-head">
        <h2 className="section-title kinetic-title" id="skills-title">
          Skills
        </h2>
        <p className="skills-head__lede">
          Tools and concepts I reach for when shipping software.
        </p>
      </div>

      <div className="skills-list">
        {skills.map((skillGroup) => (
          <div className="skills-row" key={skillGroup.title}>
            <p className="skills-row__label">{skillGroup.title}</p>
            <p className="skills-row__items">{skillGroup.items.join(' · ')}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SkillsSection;
