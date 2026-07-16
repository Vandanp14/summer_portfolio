import './SkillsSection.css';

function SkillsSection({ skills }) {
  return (
    <section className="content-section skills" id="skills" aria-labelledby="skills-title">
      <div className="section-heading">
        <p className="eyebrow">Skills</p>
        <h2 className="section-title" id="skills-title">
          Tools and concepts I reach for when shipping software.
        </h2>
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
