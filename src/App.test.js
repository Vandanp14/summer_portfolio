import { render, screen, within } from '@testing-library/react';
import App from './App';

test('renders a recruiter-first portfolio shell', () => {
  render(<App />);
  const resumeUrl =
    'https://drive.google.com/file/d/1XZIbed6pfAnyLFdAvmiSdF7pIH8kbQ9J/view?usp=sharing';

  expect(
    screen.getByRole('heading', {
      name: /vandan patel/i,
      level: 1,
    })
  ).toBeInTheDocument();

  expect(screen.getAllByRole('link', { name: /view resume/i })).toHaveLength(2);
  screen.getAllByRole('link', { name: /view resume/i }).forEach((resumeLink) => {
    expect(resumeLink).toHaveAttribute('href', resumeUrl);
  });

  const navigation = screen.getByRole('navigation', { name: /primary/i });
  expect(within(navigation).getByRole('link', { name: /projects/i })).toHaveAttribute('href', '#projects');

  const projectSection = screen.getByLabelText(/featured projects/i);
  expect(within(projectSection).getAllByRole('article')).toHaveLength(4);

  expect(
    screen
      .getAllByRole('link', { name: /email/i })
      .some((emailLink) => emailLink.getAttribute('href') === 'mailto:patelvandan024@gmail.com')
  ).toBe(true);
  expect(screen.getAllByRole('link', { name: /linkedin/i })).not.toHaveLength(0);
});
