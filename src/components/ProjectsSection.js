function ProjectsSection({ projects }) {
  const featuredProjects = projects.filter((project) => project.featured);

  return (
    <section aria-label="Featured projects" className="content-section" id="projects">
      <div className="section-heading">
        <p className="section-heading__eyebrow">Projects</p>
        <h2>Featured builds with technical depth and clear outcomes.</h2>
      </div>

      <div className="project-grid">
        {featuredProjects.map((project) => (
          <article className="glass-panel project-card" key={project.title}>
            <div className="project-card__header">
              <p className="project-card__eyebrow">{project.impact}</p>
              <h3>{project.title}</h3>
            </div>

            <p className="project-card__summary">{project.summary}</p>

            <ul className="project-card__stack">
              {project.stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="project-card__links">
              <a href={project.repoUrl} target="_blank" rel="noreferrer">
                View Code
              </a>
              {project.liveUrl ? (
                <a href={project.liveUrl} target="_blank" rel="noreferrer">
                  Live Demo
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ProjectsSection;
