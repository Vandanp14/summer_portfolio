function ContactSection({ profile, contactLinks }) {
  return (
    <section className="content-section" id="contact">
      <div className="section-heading">
        <p className="section-heading__eyebrow">Contact</p>
        <h2>If you&apos;re building something thoughtful, I&apos;d love to connect.</h2>
      </div>

      <div className="contact-layout">
        <article className="glass-panel contact-card">
          <p className="contact-card__intro">{profile.contactBlurb}</p>
          <div className="contact-card__actions">
            <a className="button button--primary" href={profile.resumeUrl} target="_blank" rel="noreferrer">
              View Resume
            </a>
            <a className="button button--secondary" href={`mailto:${profile.email}`}>
              Email Me
            </a>
          </div>
        </article>

        <article className="glass-panel contact-links-card">
          <p className="contact-links-card__label">Reach me directly</p>
          <ul className="contact-link-list">
            {contactLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>
                  <span>{link.label}</span>
                  <span>{link.value}</span>
                </a>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export default ContactSection;
