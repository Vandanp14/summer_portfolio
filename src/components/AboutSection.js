import './AboutSection.css';

function AboutSection({ profile }) {
  return (
    <section className="content-section about" id="about" aria-labelledby="about-title">
      <div className="about-grid">
        <div className="about-lede">
          <p className="eyebrow">About</p>
          <h2 className="about-statement" id="about-title">
            {profile.aboutTitle}
          </h2>
        </div>

        <div className="about-body">
          <div className="about-paragraphs">
            {profile.aboutParagraphs.map((paragraph) => (
              <p className="about-paragraph" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className="about-focus">
            <p className="eyebrow about-focus__label">Focus</p>
            <ul className="about-focus__list">
              {profile.focusAreas.map((focusArea) => (
                <li className="about-focus__row" key={focusArea}>
                  <span className="about-focus__mark" aria-hidden="true" />
                  <span className="about-focus__text">{focusArea}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
