import { getCollection } from './db.ts';
import type { AdminUserDoc } from './auth.ts';
import type {
  BootcampProgram,
  CommunityPost,
  ResourceEntry,
  SiteContent,
  SpotlightItem,
  TechEventItem,
  ToolOfTheWeekItem,
} from '../src/types/site.ts';

export const DEFAULT_SITE_CONTENT: SiteContent = {
  _id: 'main',
  branding: {
    siteName: 'Bits & Brains Collective',
    handle: '@BitsNBrainsCo',
    logoUrl: '',
    logoAlt: 'Bits & Brains Collective floating brain logo',
    youtubeUrl: 'https://www.youtube.com/@BitsNBrainsCo',
    footerPrivacyNote:
      'Your privacy matters. Contact info you share with us is never shown publicly or sold to anyone.',
  },
  pagesEnabled: {
    channel: true,
    about: true,
    ourCode: true,
    bookABrain: true,
    resources: true,
    community: true,
    events: true,
    bootcamps: true,
  },
  seo: {
    home: {
      title: 'Bits & Brains Collective – Computer Science, Made Easy',
      description:
        'Explore computer science videos, friendly tech help, free community support, and plain-language resources from Bits & Brains Collective.',
    },
    channel: {
      title: 'The Channel – Bits & Brains Collective',
      description:
        'Computer science made easy. Watch Season 1 episodes, meet the Collective, explore Who Built This spotlights, and grab the Free Tool of the Week.',
    },
    about: {
      title: 'Meet the Creator – Bits & Brains Collective',
      description:
        'Get to know the creator behind Bits & Brains Collective, their story, credentials, and core beliefs.',
    },
    ourCode: {
      title: 'Our Code & Tech Ethics News – Bits & Brains Collective',
      description:
        'Read the Bits & Brains Code and catch plain-language tech ethics news from trusted sources.',
    },
    bookABrain: {
      title: 'Book a Brain – Tech Help, Websites & Tutoring | Bits & Brains',
      description:
        'Book 1-on-1 tech tutoring, website building, creative editing, or office organization with clear prices and community discounts.',
    },
    resources: {
      title: 'You Are Not Alone – Helpful Resources | Bits & Brains Collective',
      description:
        'Find trusted support programs for youth, housing, mental health, legal help, education, and jobs in plain language.',
    },
    community: {
      title: 'Join the Community – Bits & Brains Collective',
      description:
        'Share ideas, ask beginner-friendly tech questions, and learn together in a respectful community.',
    },
    events: {
      title: 'Tech Events Near You – Bits & Brains Collective',
      description:
        'Find free and low-cost tech events near your zip code or online.',
    },
    bootcamps: {
      title: 'Bootcamps & Certifications – Bits & Brains Collective',
      description:
        'Search free and low-cost coding bootcamps, IT programs, and tech certificates by age, topic, and format.',
    },
  },
  home: {
    topName: 'Bits & Brains Collective',
    promptLine: 'Where do you want to start?',
    bubbles: [
      {
        id: 'b-about',
        title: 'Meet the Creator',
        subtitle: 'The person behind the brains',
        to: '/about',
        color: 'pink',
      },
      {
        id: 'b-channel',
        title: 'Watch the Channel',
        subtitle: 'Tech made easy, one video at a time',
        to: '/channel',
        color: 'blue',
      },
      {
        id: 'b-book',
        title: 'Book a Brain',
        subtitle: 'Get help with tech, websites & more',
        to: '/book-a-brain',
        color: 'blue',
      },
      {
        id: 'b-community',
        title: 'Join the Community',
        subtitle: 'Share ideas and ask questions',
        to: '/community',
        color: 'pink',
      },
    ],
    bottomLinks: [
      { id: 'ql-resources', label: 'Resources', to: '/resources' },
      { id: 'ql-events', label: 'Tech Events', to: '/events' },
      { id: 'ql-bootcamps', label: 'Bootcamps', to: '/bootcamps' },
      { id: 'ql-code', label: 'Our Code', to: '/our-code' },
    ],
  },
  channel: {
    heroTitle: 'Computer Science, Made Easy.',
    heroSubtitle:
      'Short, friendly videos that explain how computers, coding, and AI (smart computer tools) really work—without confusing tech words.',
    subscribeLabel: 'Subscribe on YouTube',
    videoEmbedUrl: '',
    videoPlaceholderText: 'Channel trailer video placeholder — add your YouTube embed link in Admin.',
    missionHeading: 'Our Mission',
    missionText:
      'Bits & Brains spotlights the lesser-known people who built computer science and makes tech feel possible for everyone.',
    collectiveHeading: 'Meet the Collective',
    collectiveMembers: [
      {
        id: 'ada',
        name: 'Ada, the Brains',
        role: 'Main Host',
        inspiration: 'Inspired by Ada Lovelace',
        description:
          'Breaks down big computer science ideas into everyday stories anyone can follow.',
        accent: 'blue',
      },
      {
        id: 'dorothy',
        name: 'Dorothy, the Upskill Coach',
        role: 'Career & Learning Guide',
        inspiration: 'Inspired by Dorothy Vaughan',
        description:
          'Helps you learn new tech skills step by step so you never feel left behind.',
        accent: 'pink',
      },
      {
        id: 'katherine',
        name: 'Katherine, the Navigator',
        role: 'Math & Logic Guide',
        inspiration: 'Inspired by Katherine Johnson',
        description:
          'Shows how step-by-step thinking and simple math power everything from apps to rockets.',
        accent: 'blue',
      },
      {
        id: 'camille',
        name: 'Camille, the Protector',
        role: 'Cybersecurity Guide',
        inspiration: 'Staying safe online',
        description:
          'Teaches easy habits to protect your passwords, personal info, and peace of mind online.',
        accent: 'pink',
      },
      {
        id: 'ai-duo',
        name: 'Two New Brains Coming Soon',
        role: 'Machine Learning & AI Guides',
        inspiration: 'Next up in the Collective',
        description:
          'Two new characters are joining soon to walk you through machine learning and AI in plain words.',
        accent: 'blue',
        comingSoon: true,
      },
    ],
    seasonHeading: 'Season 1 Episodes',
    episodes: [
      {
        id: 'ep-1',
        number: 1,
        title: 'What is computer science?',
        summary: 'See how solving everyday problems is the real heart of computer science.',
      },
      {
        id: 'ep-2',
        number: 2,
        title: 'How do computers work?',
        summary: 'Take a quick peek inside a computer to see how tiny switches become apps.',
      },
      {
        id: 'ep-3',
        number: 3,
        title: 'What is an algorithm?',
        summary: 'Learn why an algorithm (a step-by-step recipe) is simpler than it sounds.',
      },
      {
        id: 'ep-4',
        number: 4,
        title: 'What is AI?',
        summary: 'Understand artificial intelligence (computers spotting patterns) without the hype.',
      },
      {
        id: 'ep-5',
        number: 5,
        title: 'Machine learning vs. deep learning',
        summary: 'Learn the plain-language difference between these two common AI buzzwords.',
      },
      {
        id: 'ep-6',
        number: 6,
        title: 'How does ChatGPT work?',
        summary: 'Find out how chat tools predict the next word—and what they get wrong.',
      },
    ],
    spotlightHeading: 'Who Built This? Meet the people tech forgot to mention.',
    toolHeading: 'Free Tool of the Week',
    sectionsEnabled: {
      mission: true,
      collective: true,
      season1: true,
      spotlights: true,
      freeTool: true,
      newsletter: true,
    },
  },
  about: {
    heroTitle: 'Meet the Creator',
    heroSubtitle:
      'Placeholder intro — edit this in Admin to tell visitors who you are and why you started Bits & Brains Collective.',
    photoUrl: '',
    photoAlt: 'Portrait photo placeholder of the Bits & Brains Collective creator',
    bioHeading: 'About Me',
    bioText:
      '[Placeholder bio] Share a warm 2–3 sentence introduction about yourself, your background, and what excites you about teaching tech in plain words.',
    storyHeading: 'My Story',
    storyText:
      '[Placeholder story] Explain the moment you decided tech explanations should be friendly, clear, and open to everyone—especially people who rarely see themselves in tech.',
    credentialsHeading: 'Experience & Credentials',
    credentialsText:
      '[Placeholder credentials] List your teaching experience, certifications, community work, or projects you are proud of.',
    beliefsHeading: 'What I Believe',
    beliefs: [
      {
        id: 'belief-1',
        title: 'Belief Placeholder 1',
        description: 'Plain words beat fancy jargon every single time.',
      },
      {
        id: 'belief-2',
        title: 'Belief Placeholder 2',
        description: 'Everyone deserves patience and respect while learning something new.',
      },
      {
        id: 'belief-3',
        title: 'Belief Placeholder 3',
        description: 'Knowing who built technology helps more people see they belong here too.',
      },
      {
        id: 'belief-4',
        title: 'Belief Placeholder 4',
        description: 'Helpful tech should protect people’s safety, privacy, and dignity.',
      },
    ],
    sectionsEnabled: {
      bio: true,
      story: true,
      credentials: true,
      beliefs: true,
    },
  },
  ourCode: {
    heading: 'The Bits & Brains Code',
    intro:
      'These are the promises that guide everything we teach, build, and share. Edit these placeholders anytime in Admin.',
    acmNotePrefix: 'Inspired by the',
    acmLinkLabel: 'ACM Code of Ethics',
    acmLinkUrl: 'https://www.acm.org/code-of-ethics',
    principles: [
      {
        id: 'p-1',
        icon: 'HeartHandshake',
        title: 'Lead with Kindness',
        description: '[Placeholder] We treat every learner, client, and neighbor with patience and respect.',
      },
      {
        id: 'p-2',
        icon: 'MessageSquareHeart',
        title: 'Speak in Plain Words',
        description: '[Placeholder] We explain tech clearly instead of hiding behind confusing jargon.',
      },
      {
        id: 'p-3',
        icon: 'ShieldCheck',
        title: 'Protect People’s Privacy',
        description: '[Placeholder] We never sell personal info or collect details we do not truly need.',
      },
      {
        id: 'p-4',
        icon: 'Accessibility',
        title: 'Build for Everyone',
        description: '[Placeholder] We design websites and lessons so people of all abilities can use them.',
      },
      {
        id: 'p-5',
        icon: 'SearchCheck',
        title: 'Stay Honest About Limits',
        description: '[Placeholder] We share where facts come from and admit when we do not know yet.',
      },
      {
        id: 'p-6',
        icon: 'Users',
        title: 'Give Credit Where It Is Due',
        description: '[Placeholder] We honor the pioneers and community builders who paved the way.',
      },
    ],
    newsHeading: 'Tech Ethics in the News',
    newsSubheading:
      'Short summaries from trusted newsrooms on AI, cybersecurity, privacy, fairness, and tech laws.',
    sectionsEnabled: {
      principles: true,
      news: true,
    },
  },
  bookABrain: {
    heading: 'Book a Brain',
    intro:
      'Friendly, plain-language help with computers, websites, creative projects, and getting organized.',
    priceNote: 'Prices are starting points. Every project gets a free quote first.',
    communityDiscountPercent: 20,
    paymentOptions: [
      {
        id: 'pay_as_you_go',
        title: 'Pay As You Go',
        description: 'Hourly, pay after each session.',
      },
      {
        id: 'flat_rate',
        title: 'Flat-Rate Packages',
        description: 'One set price, no surprises.',
      },
      {
        id: 'payment_plan',
        title: 'Payment Plans',
        description: '50% to start, 50% when done. Projects over $300 can be split into 3 payments.',
      },
      {
        id: 'community_rate',
        title: 'Community Rate',
        description: '20% off for nonprofits, students, and current/former foster youth.',
      },
    ],
    services: [
      {
        id: 'tech-tutoring',
        category: 'Tech Help & Teaching',
        name: '1-on-1 Tech Tutoring',
        description: 'Learn computers, coding, or AI basics at your own pace.',
        included: 'Live screen-share help, plain-language notes, practice tips.',
        priceLabel: '$35/hour, or 4 sessions for $120',
        basePrice: 35,
        priceUnit: 'hour',
      },
      {
        id: 'workshops',
        category: 'Tech Help & Teaching',
        name: 'Workshops for Groups & Organizations',
        description: 'Interactive beginner-friendly tech sessions for your team or youth group.',
        included: 'Custom slide deck, live Q&A, take-home handout.',
        priceLabel: 'from $200 per session',
        basePrice: 200,
        priceUnit: 'starting',
      },
      {
        id: 'lesson-plans',
        category: 'Tech Help & Teaching',
        name: 'Lesson Plans & Learning Materials',
        description: 'Easy-to-follow worksheets, guides, and activities for classes.',
        included: 'Editable docs, clear teacher notes, plain-language student pages.',
        priceLabel: '$40/hour',
        basePrice: 40,
        priceUnit: 'hour',
      },
      {
        id: 'career-coaching',
        category: 'Tech Help & Teaching',
        name: 'Resume, Interview & Career Coaching',
        description: 'Get ready for tech or office jobs with calm, practical feedback.',
        included: 'Resume review, mock interview practice, next-step checklist.',
        priceLabel: '$40/session',
        basePrice: 40,
        priceUnit: 'session',
      },
      {
        id: 'build-website',
        category: 'Websites',
        name: "I'll Build Your Website (3–5 pages)",
        description: 'A fast, mobile-friendly website built for your goals.',
        included: '3–5 pages, mobile layout, contact form, basic Google setup.',
        priceLabel: 'from $750 (payment plan available)',
        basePrice: 750,
        priceUnit: 'starting',
      },
      {
        id: 'care-plan',
        category: 'Websites',
        name: 'Website Care Plan',
        description: 'Keep your site safe, updated, and running smoothly.',
        included: 'Updates, backups, and small fixes (1 hour per month).',
        priceLabel: '$75/month',
        basePrice: 75,
        priceUnit: 'month',
      },
      {
        id: 'care-plus',
        category: 'Websites',
        name: 'Website Care Plus',
        description: 'Extra monthly support plus search and accessibility checkups.',
        included: '3 hours of help, Google search checkup, accessibility check.',
        priceLabel: '$150/month',
        basePrice: 150,
        priceUnit: 'month',
      },
      {
        id: 'website-fix',
        category: 'Websites',
        name: 'One-Time Website Fix',
        description: 'Quick help when something on your website looks broken or stuck.',
        included: 'Troubleshooting, bug fix, and clear summary of what changed.',
        priceLabel: '$45/hour',
        basePrice: 45,
        priceUnit: 'hour',
      },
      {
        id: 'seo-setup',
        category: 'Websites',
        name: 'Help People Find You on Google (SEO setup)',
        description: 'SEO (helping people find your website on Google) done cleanly.',
        included: 'Page titles, descriptions, search tags, and Google sitemap setup.',
        priceLabel: '$200 flat',
        basePrice: 200,
        priceUnit: 'flat',
      },
      {
        id: 'ada-check',
        category: 'Websites',
        name: 'Make Your Website Easy for Everyone to Use',
        description: 'ADA accessibility (making sites work for screen readers and keyboards) check + fixes.',
        included: 'Color contrast, keyboard navigation, image descriptions, and fixes.',
        priceLabel: 'from $250',
        basePrice: 250,
        priceUnit: 'starting',
      },
      {
        id: 'video-editing',
        category: 'Creative',
        name: 'Video Editing',
        description: 'Clean cuts, captions, and pacing for social clips or longer talks.',
        included: 'Captions, color cleanup, and ready-to-post video file.',
        priceLabel: '$50 under 60s; longer videos $35/hour',
        basePrice: 50,
        priceUnit: 'each',
      },
      {
        id: 'photo-editing',
        category: 'Creative',
        name: 'Photo & Image Editing',
        description: 'Brighten, crop, or clean up photos for your website or flyers.',
        included: 'Lighting adjustment, background cleanup, web-ready sizes.',
        priceLabel: '$10 per image or 5 for $40',
        basePrice: 10,
        priceUnit: 'each',
      },
      {
        id: 'flyers-graphics',
        category: 'Creative',
        name: 'Flyers & Social Media Graphics',
        description: 'Eye-catching, easy-to-read designs made in Canva or Figma.',
        included: 'Custom layout, print & social sizes, editable template link.',
        priceLabel: '$40 per design',
        basePrice: 40,
        priceUnit: 'each',
      },
      {
        id: 'data-entry',
        category: 'Office & Organization',
        name: 'Data Entry & Office Tasks',
        description: 'Careful spreadsheet updates, forms, and everyday admin help.',
        included: 'Accurate spreadsheet cleanup, document formatting, checklists.',
        priceLabel: '$25/hour',
        basePrice: 25,
        priceUnit: 'hour',
      },
      {
        id: 'inbox-cleanup',
        category: 'Office & Organization',
        name: 'Inbox Clean-Up',
        description: 'Turn an overwhelming email inbox into calm, organized folders.',
        included: 'Sort messages, unsubscribe from junk, set up folders & filters.',
        priceLabel: '$100 flat',
        basePrice: 100,
        priceUnit: 'flat',
      },
      {
        id: 'calendar-setup',
        category: 'Office & Organization',
        name: 'Calendar & Schedule Setup',
        description: 'Build a simple weekly schedule and reminder system that sticks.',
        included: 'Calendar blocks, booking links, reminders ($100/mo ongoing).',
        priceLabel: '$60 flat; ongoing help $100/month',
        basePrice: 60,
        priceUnit: 'flat',
      },
      {
        id: 'newsletter-setup',
        category: 'Office & Organization',
        name: 'Email Newsletter Setup',
        description: 'Set up your email list and welcome message in Brevo or Klaviyo.',
        included: 'Signup form connection, list setup, reusable email template.',
        priceLabel: '$40/hour',
        basePrice: 40,
        priceUnit: 'hour',
      },
      {
        id: 'project-board',
        category: 'Office & Organization',
        name: 'Project Board Setup',
        description: 'Organize tasks in Jira, Monday.com, or Trello so nothing slips.',
        included: 'Columns, task templates, and a quick walkthrough video.',
        priceLabel: '$75 flat',
        basePrice: 75,
        priceUnit: 'flat',
      },
      {
        id: 'grant-writing',
        category: 'Writing & Testing',
        name: 'Grant Writing Support',
        description: 'Research, editing, and organizing answers for community grants.',
        included: 'Grant research list, plain-language drafting, checklist.',
        priceLabel: '$45/hour',
        basePrice: 45,
        priceUnit: 'hour',
      },
      {
        id: 'how-to-guides',
        category: 'Writing & Testing',
        name: 'How-To Guides & Instructions',
        description: 'Clear step-by-step manuals with screenshots anyone can follow.',
        included: 'Plain-language steps, labeled screenshots, PDF or doc.',
        priceLabel: '$35/hour',
        basePrice: 35,
        priceUnit: 'hour',
      },
      {
        id: 'app-testing',
        category: 'Writing & Testing',
        name: 'App & Website Testing',
        description: 'Find confusing buttons and bugs before your visitors do.',
        included: 'Full click-through test, bug list with screenshots, fix tips.',
        priceLabel: '$35/hour',
        basePrice: 35,
        priceUnit: 'hour',
      },
    ],
    sectionsEnabled: {
      paymentOptions: true,
      services: true,
      bookingForm: true,
    },
  },
  resources: {
    heading: "You're Not Alone. Help Is Right Here.",
    intro:
      'Whether you need housing, someone to talk to, legal support, or a fresh start with school or work, these programs are here to help. Everything is listed A to Z in plain words.',
    emergencyBanner: 'In immediate danger? Call 911.',
    quickExitNote: 'Need to leave fast? Click Quick Exit.',
  },
  community: {
    heading: 'Join the Community',
    intro:
      'Ask questions, share ideas, and talk about tech in a warm, respectful space. Every post is reviewed by a real person before it goes live.',
    agreementText:
      'I agree to keep it respectful: no profanity, hate, harassment or disrespect of any kind.',
  },
  events: {
    heading: 'Tech Events Near You',
    intro:
      'Find free and affordable workshops, meetups, and coding nights near your zip code or online.',
  },
  bootcamps: {
    heading: 'Bootcamps & Certifications',
    intro:
      'Browse coding programs, IT training, and tech certificates—filtered by cost, age group, and whether they are online or in person.',
  },
};

export const SEED_SPOTLIGHTS: Omit<SpotlightItem, '_id'>[] = [
  {
    name: '[Placeholder] Trailblazer Name 1',
    years: '[Years, e.g. 1900–1980]',
    whatTheyDid: '[Placeholder: One clear sentence describing what they built or discovered.]',
    whyItMatters: '[Placeholder: Why their work still shows up in the tech we use today.]',
    photoUrl: '',
    photoAlt: 'Portrait placeholder for Spotlight 1',
    order: 1,
    createdAt: new Date('2026-11-01T10:00:00Z').toISOString(),
  },
  {
    name: '[Placeholder] Trailblazer Name 2',
    years: '[Years]',
    whatTheyDid: '[Placeholder: One clear sentence describing what they built or discovered.]',
    whyItMatters: '[Placeholder: Why their work matters today.]',
    photoUrl: '',
    photoAlt: 'Portrait placeholder for Spotlight 2',
    order: 2,
    createdAt: new Date('2026-10-15T10:00:00Z').toISOString(),
  },
  {
    name: '[Placeholder] Trailblazer Name 3',
    years: '[Years]',
    whatTheyDid: '[Placeholder: One clear sentence describing what they built or discovered.]',
    whyItMatters: '[Placeholder: Why their work matters today.]',
    photoUrl: '',
    photoAlt: 'Portrait placeholder for Spotlight 3',
    order: 3,
    createdAt: new Date('2026-10-01T10:00:00Z').toISOString(),
  },
];

export const SEED_TOOLS: Omit<ToolOfTheWeekItem, '_id'>[] = [
  {
    name: 'Scratch',
    whatItDoes: 'Lets you snap colorful coding blocks together to build games and animations with zero typing.',
    whoItIsFor: 'Complete beginners, visual learners, kids, and anyone curious about how coding logic works.',
    tryItUrl: 'https://scratch.mit.edu',
    isCurrent: true,
    weekLabel: 'This Week',
    createdAt: new Date('2026-11-10T10:00:00Z').toISOString(),
  },
  {
    name: 'Bitwarden',
    whatItDoes: 'Remembers all your passwords safely in one place so you only need one strong main password.',
    whoItIsFor: 'Anyone tired of forgetting passwords or reusing the same password everywhere.',
    tryItUrl: 'https://bitwarden.com',
    isCurrent: false,
    weekLabel: 'Past Pick',
    createdAt: new Date('2026-11-03T10:00:00Z').toISOString(),
  },
];

export const SEED_RESOURCES: Omit<ResourceEntry, '_id'>[] = [
  {
    name: '211',
    category: 'Housing',
    description:
      'Free, confidential help connecting you with local food, housing, utility bills, health care, and crisis support. [VERIFY]',
    whoItServes: 'Anyone in the U.S. or Canada looking for local help',
    phone: '[VERIFY]',
    website: '[VERIFY]',
    area: 'National',
  },
  {
    name: '988 Suicide & Crisis Lifeline',
    category: 'Mental Health',
    description:
      'Free, 24/7 confidential support by call or text when you are going through a hard time or emotional crisis. [VERIFY]',
    whoItServes: 'Anyone needing emotional support or crisis help',
    phone: '[VERIFY]',
    website: '[VERIFY]',
    area: 'National',
  },
  {
    name: 'Covenant House',
    category: 'Homeless Youth',
    description:
      'Safe shelter, meals, job help, and loving support for young people facing homelessness. [VERIFY]',
    whoItServes: 'Youth and young adults experiencing homelessness',
    phone: '[VERIFY]',
    website: '[VERIFY]',
    area: 'National',
  },
  {
    name: 'FosterClub',
    category: 'Foster Youth',
    description:
      'Peer support, leadership programs, and plain-language guides for young people in or leaving foster care. [VERIFY]',
    whoItServes: 'Current and former foster youth',
    phone: '[VERIFY]',
    website: '[VERIFY]',
    area: 'National',
  },
  {
    name: 'John Burton Advocates for Youth',
    category: 'Education',
    description:
      'Helps current and former foster and homeless youth get into college, find housing, and build stable futures. [VERIFY]',
    whoItServes: 'Current and former foster and homeless youth in California',
    phone: '[VERIFY]',
    website: '[VERIFY]',
    area: 'CA',
  },
  {
    name: 'Juvenile Law Center',
    category: 'Legal Help',
    description:
      'Works to protect the rights and futures of young people in the foster care and justice systems. [VERIFY]',
    whoItServes: 'Justice-impacted and foster youth',
    phone: '[VERIFY]',
    website: '[VERIFY]',
    area: 'National',
  },
  {
    name: 'National Domestic Violence Hotline',
    category: 'Domestic Violence Survivors',
    description:
      '24/7 confidential safety planning, crisis support, and local shelter referrals for anyone affected by relationship abuse. [VERIFY]',
    whoItServes: 'Domestic violence survivors and loved ones',
    phone: '[VERIFY]',
    website: '[VERIFY]',
    area: 'National',
  },
  {
    name: 'National Runaway Safeline',
    category: 'Homeless Youth',
    description:
      'Free, confidential 24/7 support, problem-solving, and shelter connections for youth thinking about running away or already on the street. [VERIFY]',
    whoItServes: 'Runaway, homeless, and at-risk youth',
    phone: '[VERIFY]',
    website: '[VERIFY]',
    area: 'National',
  },
];

export const SEED_BOOTCAMPS: Omit<BootcampProgram, '_id'>[] = [
  {
    name: 'Cisco Networking Academy',
    provider: 'Cisco [VERIFY]',
    description: 'Free and low-cost courses in networking, cybersecurity, and basic IT skills. [VERIFY]',
    costType: 'Free',
    ageGroup: 'All Ages',
    mode: 'Both',
    topic: 'Cybersecurity & IT',
    link: '[VERIFY]',
    area: 'National / Online',
  },
  {
    name: 'Code.org',
    provider: 'Code.org [VERIFY]',
    description: 'Beginner-friendly coding lessons and projects designed for students and classrooms. [VERIFY]',
    costType: 'Free',
    ageGroup: 'Teens',
    mode: 'Online',
    topic: 'Coding',
    link: '[VERIFY]',
    area: 'Online',
  },
  {
    name: 'freeCodeCamp',
    provider: 'freeCodeCamp [VERIFY]',
    description: 'Self-paced interactive coding lessons and free certificates in web building, Python, and data. [VERIFY]',
    costType: 'Free',
    ageGroup: 'All Ages',
    mode: 'Online',
    topic: 'Coding',
    link: '[VERIFY]',
    area: 'Online',
  },
  {
    name: 'Google Career Certificates',
    provider: 'Google [VERIFY]',
    description: 'Job-ready certificates in IT support, data analytics, cybersecurity, and UX design. [VERIFY]',
    costType: 'Low Cost',
    ageGroup: 'Adults',
    mode: 'Online',
    topic: 'Tech Certificates',
    link: '[VERIFY]',
    area: 'Online',
  },
  {
    name: 'NPower',
    provider: 'NPower [VERIFY]',
    description: 'Tuition-free tech training and job placement for military-connected folks and young adults from underserved communities. [VERIFY]',
    costType: 'Free',
    ageGroup: 'Young Adults',
    mode: 'Both',
    topic: 'Cybersecurity & IT',
    link: '[VERIFY]',
    area: 'Multiple Cities / Online',
  },
  {
    name: 'Per Scholas',
    provider: 'Per Scholas [VERIFY]',
    description: 'Tuition-free IT, cloud, and coding training designed to launch full-time tech careers. [VERIFY]',
    costType: 'Free',
    ageGroup: 'Adults',
    mode: 'Both',
    topic: 'Coding & IT',
    link: '[VERIFY]',
    area: 'Multiple Cities / Online',
  },
  {
    name: 'Year Up',
    provider: 'Year Up [VERIFY]',
    description: 'Free job training, college credits, and internships for young adults ages 18–29. [VERIFY]',
    costType: 'Free',
    ageGroup: 'Young Adults',
    mode: 'Both',
    topic: 'IT & Careers',
    link: '[VERIFY]',
    area: 'Multiple Cities / Online',
  },
];

export const SEED_EVENTS: Omit<TechEventItem, '_id'>[] = [
  {
    title: 'Beginner Python Study Night (Online)',
    date: '2026-12-05',
    cost: 0,
    costLabel: 'Free',
    zip: '',
    city: 'Online',
    link: 'https://www.eventbrite.com/d/online/free--python/',
    mode: 'online',
    description: 'Bring a laptop and learn the basics of Python with friendly mentors.',
  },
  {
    title: 'Community Web Accessibility Workshop',
    date: '2026-12-10',
    cost: 0,
    costLabel: 'Free',
    zip: '90001',
    city: 'Los Angeles, CA',
    link: 'https://www.meetup.com',
    mode: 'in-person',
    description: 'Hands-on session showing how screen readers work and how to make sites easier to use.',
  },
  {
    title: 'Intro to Cybersecurity Basics',
    date: '2026-12-14',
    cost: 10,
    costLabel: '$10',
    zip: '94103',
    city: 'San Francisco, CA',
    link: 'https://www.eventbrite.com',
    mode: 'in-person',
    description: 'Learn how to spot scams, lock down accounts, and stay safer online.',
  },
  {
    title: 'Tech Career Q&A for Beginners (Online)',
    date: '2026-12-18',
    cost: 0,
    costLabel: 'Free',
    zip: '',
    city: 'Online',
    link: 'https://www.meetup.com',
    mode: 'online',
    description: 'Ask anything about getting started in IT, support, coding, or design.',
  },
];

export const SEED_COMMUNITY_POSTS: Omit<CommunityPost, '_id'>[] = [
  {
    displayName: 'Maya R.',
    email: 'maya-demo@example.com',
    topic: 'Intro to Computer Science',
    comment: 'Thank you for explaining algorithms like a cooking recipe! That finally clicked for me.',
    status: 'approved',
    createdAt: new Date('2026-11-10T14:20:00Z').toISOString(),
  },
  {
    displayName: 'Jordan T.',
    email: 'jordan-demo@example.com',
    topic: 'Careers in Tech',
    comment: 'For anyone just starting out: checking out 1-on-1 tutoring and freeCodeCamp together helped me build my first page.',
    status: 'approved',
    createdAt: new Date('2026-11-12T18:45:00Z').toISOString(),
  },
];

export async function ensureSeedData() {
  const siteCol = getCollection<SiteContent>('site_content');
  const existingSite = await siteCol.findOne({ _id: 'main' });
  if (!existingSite) {
    await siteCol.replaceOrInsert('main', DEFAULT_SITE_CONTENT);
  }

  const spotlightsCol = getCollection<SpotlightItem>('spotlights');
  if ((await spotlightsCol.countDocuments()) === 0) {
    for (const s of SEED_SPOTLIGHTS) await spotlightsCol.insertOne(s);
  }

  const toolsCol = getCollection<ToolOfTheWeekItem>('tools_of_the_week');
  if ((await toolsCol.countDocuments()) === 0) {
    for (const t of SEED_TOOLS) await toolsCol.insertOne(t);
  }

  const resCol = getCollection<ResourceEntry>('resources');
  if ((await resCol.countDocuments()) === 0) {
    for (const r of SEED_RESOURCES) await resCol.insertOne(r);
  }

  const progCol = getCollection<BootcampProgram>('programs');
  if ((await progCol.countDocuments()) === 0) {
    for (const p of SEED_BOOTCAMPS) await progCol.insertOne(p);
  }

  const eventsCol = getCollection<TechEventItem>('events');
  if ((await eventsCol.countDocuments()) === 0) {
    for (const e of SEED_EVENTS) await eventsCol.insertOne(e);
  }

  const postsCol = getCollection<CommunityPost>('forum_postings_reviewed');
  if ((await postsCol.countDocuments()) === 0) {
    for (const p of SEED_COMMUNITY_POSTS) await postsCol.insertOne(p);
  }

  const adminsCol = getCollection<AdminUserDoc>('admins');
  if ((await adminsCol.countDocuments()) === 0) {
    await adminsCol.insertOne({
      email: 'bitznbrainsco@gmail.com',
      name: 'Owner',
      // Pre-computed bcryptjs (cost 12) cipher hash of initial owner password
      passwordHash: '$2b$12$gbaPQKn6q79d.o9GqUWS0eXTf.No9YyIEh0s0E.TuM6RXe10m4Iae',
      role: 'owner',
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: new Date().toISOString(),
    });
  }
}
