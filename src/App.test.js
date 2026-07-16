import { render, screen, within } from '@testing-library/react';
import App from './App';

const RESUME_URL =
  'https://drive.google.com/file/d/1XZIbed6pfAnyLFdAvmiSdF7pIH8kbQ9J/view?usp=sharing';

test('renders the editorial portfolio shell', () => {
  render(<App />);

  // Single display name headline (h1) in the hero.
  const headings = screen.getAllByRole('heading', {
    name: /vandan patel/i,
    level: 1,
  });
  expect(headings).toHaveLength(1);

  // Primary navigation exposes the section anchors.
  const navigation = screen.getByRole('navigation', { name: /primary/i });
  expect(
    within(navigation).getByRole('link', { name: /projects/i })
  ).toHaveAttribute('href', '#projects');
  expect(
    within(navigation).getByRole('link', { name: /about/i })
  ).toHaveAttribute('href', '#about');

  // A real project surfaces by title.
  expect(
    screen.getByRole('heading', { name: /full stack transit tracker/i })
  ).toBeInTheDocument();

  // Resume link appears (hero + contact) and points at the resume URL.
  const resumeLinks = screen.getAllByRole('link', { name: /view resume/i });
  expect(resumeLinks.length).toBeGreaterThanOrEqual(1);
  resumeLinks.forEach((resumeLink) => {
    expect(resumeLink).toHaveAttribute('href', RESUME_URL);
  });

  // Direct contact links are present.
  expect(
    screen
      .getAllByRole('link', { name: /email/i })
      .some((link) => link.getAttribute('href') === 'mailto:patelvandan024@gmail.com')
  ).toBe(true);
  expect(screen.getAllByRole('link', { name: /linkedin/i })).not.toHaveLength(0);
});
