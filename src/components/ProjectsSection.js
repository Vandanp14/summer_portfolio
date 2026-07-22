import './ProjectsSection.css';

// Emphasize numeric tokens (e.g. "7,000+", "50%", "15") inside an impact line.
// Capturing group keeps the matched stat tokens in the split output.
const STAT_PATTERN = /(\d[\d,]*(?:\.\d+)?[%+]?)/g;

function renderImpact(impact) {
  return impact
    .split(STAT_PATTERN)
    .filter((part) => part !== '')
    .map((part, index) =>
      /\d/.test(part) ? (
        <span className="projects-stat" key={`${part}-${index}`}>
          {part}
        </span>
      ) : (
        part
      )
    );
}

function ProjectsSection({ projects }) {
  const featuredProjects = projects.filter((project) => project.featured);

  return (
    <section aria-labelledby="projects-title" className="content-section projects" id="projects">
      <div className="section-heading">
        <p className="eyebrow">Selected work</p>
        <h2 className="section-title kinetic-title" id="projects-title">
          Projects
        </h2>
      </div>

      <ol className="projects-list">
        {featuredProjects.map((project, index) => (
          <li className="projects-row" key={project.title}>
            <span className="projects-index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className="projects-content">
              <h3 className="projects-title-row">{project.title}</h3>
              <p className="projects-summary">{project.summary}</p>

              <p className="projects-stack">{project.stack.join(' · ')}</p>

              <p className="projects-impact">{renderImpact(project.impact)}</p>

              <div className="projects-links">
                <a
                  className="projects-link"
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View code
                  <span className="projects-link__glyph" aria-hidden="true">
                    →
                  </span>
                </a>

                {project.liveUrl ? (
                  <a
                    className="projects-link"
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Live demo
                    <span className="projects-link__glyph" aria-hidden="true">
                      →
                    </span>
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default ProjectsSection;
