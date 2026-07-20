export const profile = {
  name: 'Vandan Patel',
  avatar: null,
  avatarInitials: 'VP',
  title: 'Computer science student building clean, useful software with a thoughtful engineering mindset.',
  heroBadge: 'Incoming Software Engineering Intern at Fanatics Collectibles',
  heroLocation: 'Oswego, NY',
  heroHighlights: ['SUNY Oswego CS', 'Graduating Dec 2026', 'Full-stack + systems projects'],
  heroDescription:
    'I like building products that feel clear, fast, and genuinely helpful. From dashboards and automation tools to systems-heavy coursework, I care about software that solves real problems without feeling overdesigned.',
  aboutTitle: 'I care about software that is useful first, polished second, and thoughtful all the way through.',
  aboutParagraphs: [
    'I am a computer science student at SUNY Oswego, and a lot of the work that motivates me starts with one simple question: how can this be made easier for real people to use? That mindset has pushed me toward dashboard work, automation projects, and engineering decisions that reduce friction instead of adding it.',
    'What keeps software fun for me is the mix of product thinking and technical depth. I enjoy shaping the front-end experience, but I am just as interested in the backend logic, performance tradeoffs, and system behavior that make an application reliable.',
  ],
  focusAreas: [
    'Full-stack products with clean UX and strong data flow',
    'Internal tools and automation that save teams real time',
    'Systems work that strengthens performance and concurrency intuition',
    'Collaborative engineering where communication matters as much as code',
  ],
  contactBlurb:
    'I am always open to internships, new grad opportunities, and thoughtful conversations about software engineering, product-building, and practical technical work.',
  footerNote: 'Designed and built in React with a minimal, personal portfolio system.',
  email: 'patelvandan024@gmail.com',
  resumeUrl: 'https://drive.google.com/file/d/1XZIbed6pfAnyLFdAvmiSdF7pIH8kbQ9J/view?usp=sharing',
  metrics: [
    { value: '30+', label: 'Staff supported with KPI dashboards' },
    { value: '50%', label: 'Faster reporting workflow improvements' },
    { value: '4', label: 'Featured engineering projects' },
    { value: '2026', label: 'Graduation target and internship runway' },
  ],
};

export const experience = [
  {
    eyebrow: 'Incoming',
    title: 'Software Engineering Intern',
    organization: 'Fanatics Collectibles',
    location: 'New York, NY',
    period: 'Summer 2026',
    summary:
      'Selected for an upcoming software engineering internship focused on product-scale development, giving my portfolio a strong forward-looking signal for recruiters.',
    highlights: [
      'Adds immediate momentum to my engineering story ahead of graduation in December 2026.',
      'Positions me to bring large-scale product experience back into future projects and team environments.',
    ],
  },
  {
    eyebrow: 'Current',
    title: 'Software Developer Intern',
    organization: 'SUNY Oswego Facilities Services',
    location: 'Oswego, NY',
    period: 'Apr 2024 - Present',
    summary:
      'Built React and Tailwind dashboards for more than 30 staff members, cutting report generation time in half while improving visibility into operational KPIs.',
    highlights: [
      'Integrated REST APIs for real-time data sync and increased system accessibility by 25%.',
      'Delivered sprint commitments consistently while contributing requirements docs and Drupal 10 implementations.',
    ],
  },
  {
    eyebrow: 'Data',
    title: 'Data Analyst Intern',
    organization: 'Institutional Research and Assessment',
    location: 'Oswego, NY',
    period: 'Aug 2025 - Dec 2025',
    summary:
      'Created Tableau dashboards and automated SQL-backed reporting pipelines used to analyze retention, GPA, and course performance for more than 7,000 students.',
    highlights: [
      'Reduced manual reporting time by 40% through ETL automation and query optimization.',
      'Standardized data definitions and surfaced retention signals through SPSS-driven analysis.',
    ],
  },
  {
    eyebrow: 'Operations',
    title: 'Project Analyst',
    organization: 'Major Projects Office',
    location: 'Oswego, NY',
    period: 'Nov 2023 - Apr 2024',
    summary:
      'Improved delivery tracking across 40+ project deliverables by implementing Jira Gantt workflows and clearer Excel-based reporting for five cross-functional teams.',
    highlights: [
      'Reduced data errors by 30% and shortened decision cycles by 20% through QA improvements.',
      'Coordinated communication across project managers, engineers, and analysts to keep schedules aligned.',
    ],
  },
];

export const projects = [
  {
    title: 'Full Stack Transit Tracker',
    summary:
      'Built a full-stack transit platform that combined a modular React interface with Flask and MySQL to surface live bus information for a campus audience.',
    stack: ['React', 'Flask', 'MySQL', 'REST APIs'],
    impact: 'Live transit tooling for 7,000+ students',
    repoUrl: 'https://github.com/Vandanp14/Centro-Bus-Predictor',
    visual: 'T',
    featured: true,
  },
  {
    title: 'Multi-Threaded HTTP Web Server',
    summary:
      'Designed a concurrent HTTP server in C++17 with a four-thread worker pool, thread-safe task queue, and robust request lifecycle handling.',
    stack: ['C++17', 'POSIX', 'Concurrency', 'Sockets'],
    impact: 'Systems project centered on throughput and reliability',
    repoUrl: 'https://github.com/Vandanp14/Multi-Threaded-Web-Server',
    visual: 'W',
    featured: true,
  },
  {
    title: 'TA Grading Automation System',
    summary:
      'Automated grading and email delivery with Python, Bash, regex parsing, and HTML generation, shrinking a repetitive workflow from hours to minutes.',
    stack: ['Python', 'Regex', 'Bash', 'HTML'],
    impact: 'Reduced grading time from 3 hours to 15 minutes',
    repoUrl: 'https://github.com/Vandanp14/05-python-project-Vandanp14',
    visual: 'G',
    featured: true,
  },
  {
    title: 'Job Listing Aggregator',
    summary:
      'Collected and normalized daily job data with Selenium, BeautifulSoup, and SQL, then prepared analytics-friendly output for downstream Tableau reporting.',
    stack: ['Python', 'Selenium', 'BeautifulSoup', 'SQL'],
    impact: 'Collected 250+ job postings per day',
    repoUrl: 'https://github.com/Vandanp14/Freeport-Job-Scraper',
    visual: 'J',
    featured: true,
  },
];

export const skills = [
  {
    title: 'Languages',
    items: ['Python', 'JavaScript', 'Java', 'C++', 'SQL', 'Scala', 'Clojure', 'Bash'],
  },
  {
    title: 'Frameworks and Tools',
    items: ['React', 'Flask', 'Tailwind', 'Docker', 'MySQL', 'Git', 'Selenium', 'BeautifulSoup'],
  },
  {
    title: 'Engineering Focus',
    items: ['REST APIs', 'CI/CD', 'Agile and Scrum', 'Data Structures', 'Systems Programming', 'Microservices'],
  },
];

export const contactLinks = [
  {
    label: 'Email',
    href: 'mailto:patelvandan024@gmail.com',
    external: false,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/Vandanp14',
    external: true,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/vpatel1410',
    external: true,
  },
  {
    label: 'Website',
    href: 'https://vandanpatel.me',
    external: true,
  },
];
