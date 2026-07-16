import './ContactSection.css';

function ContactSection({ profile, contactLinks }) {
  return (
    <section className="content-section contact" id="contact" aria-labelledby="contact-title">
      <div className="contact__inner">
        <p className="eyebrow contact__eyebrow">Contact</p>
        <h2 className="contact__title" id="contact-title">
          Let&apos;s build something useful.
        </h2>
        <p className="contact__blurb">{profile.contactBlurb}</p>

        <div className="contact__actions">
          <a className="button button--primary" href={`mailto:${profile.email}`}>
            Email me
          </a>
          <a
            className="button button--secondary"
            href={profile.resumeUrl}
            target="_blank"
            rel="noreferrer"
          >
            View resume
          </a>
        </div>

        <nav className="contact__links" aria-label="Direct contact links">
          {contactLinks.map((link) => (
            <a
              key={link.label}
              className="contact__link"
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
            >
              {link.label}
              {link.external && (
                <span className="contact__link-mark" aria-hidden="true">
                  ↗
                </span>
              )}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}

export default ContactSection;
