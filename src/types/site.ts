export type AdminRole = 'owner' | 'moderator';

export interface HomeBubble {
  id: string;
  title: string;
  subtitle: string;
  to: string;
  color: 'blue' | 'pink';
}

export interface BottomQuickLink {
  id: string;
  label: string;
  to: string;
}

export interface CollectiveMember {
  id: string;
  name: string;
  role: string;
  inspiration: string;
  description: string;
  accent: 'blue' | 'pink';
  imageUrl?: string;
  imageAlt?: string;
  comingSoon?: boolean;
}

export interface SeasonEpisode {
  id: string;
  number: number;
  title: string;
  summary: string;
  videoUrl?: string;
}

export interface BeliefCard {
  id: string;
  title: string;
  description: string;
}

export interface CodePrinciple {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface PaymentOptionInfo {
  id: 'pay_as_you_go' | 'flat_rate' | 'payment_plan' | 'community_rate';
  title: string;
  description: string;
}

export interface BookServiceItem {
  id: string;
  category: string;
  name: string;
  description: string;
  included: string;
  priceLabel: string;
  basePrice: number;
  priceUnit: 'hour' | 'session' | 'flat' | 'month' | 'each' | 'starting';
}

export interface PageSeoMeta {
  title: string;
  description: string;
}

export interface SiteSectionToggle {
  [key: string]: boolean;
}

export interface SiteContent {
  _id?: string;
  branding: {
    siteName: string;
    handle: string;
    logoUrl: string;
    logoAlt: string;
    youtubeUrl: string;
    footerPrivacyNote: string;
  };
  pagesEnabled: {
    channel: boolean;
    about: boolean;
    ourCode: boolean;
    bookABrain: boolean;
    resources: boolean;
    community: boolean;
    events: boolean;
    bootcamps: boolean;
  };
  seo: Record<string, PageSeoMeta>;
  home: {
    topName: string;
    promptLine: string;
    bubbles: HomeBubble[];
    bottomLinks: BottomQuickLink[];
  };
  channel: {
    heroTitle: string;
    heroSubtitle: string;
    subscribeLabel: string;
    videoEmbedUrl: string;
    videoPlaceholderText: string;
    missionHeading: string;
    missionText: string;
    collectiveHeading: string;
    collectiveMembers: CollectiveMember[];
    seasonHeading: string;
    episodes: SeasonEpisode[];
    spotlightHeading: string;
    toolHeading: string;
    sectionsEnabled: SiteSectionToggle;
  };
  about: {
    heroTitle: string;
    heroSubtitle: string;
    photoUrl: string;
    photoAlt: string;
    bioHeading: string;
    bioText: string;
    storyHeading: string;
    storyText: string;
    credentialsHeading: string;
    credentialsText: string;
    beliefsHeading: string;
    beliefs: BeliefCard[];
    sectionsEnabled: SiteSectionToggle;
  };
  ourCode: {
    heading: string;
    intro: string;
    acmNotePrefix: string;
    acmLinkLabel: string;
    acmLinkUrl: string;
    principles: CodePrinciple[];
    newsHeading: string;
    newsSubheading: string;
    sectionsEnabled: SiteSectionToggle;
  };
  bookABrain: {
    heading: string;
    intro: string;
    priceNote: string;
    communityDiscountPercent: number;
    paymentOptions: PaymentOptionInfo[];
    services: BookServiceItem[];
    sectionsEnabled: SiteSectionToggle;
  };
  resources: {
    heading: string;
    intro: string;
    emergencyBanner: string;
    quickExitNote: string;
  };
  community: {
    heading: string;
    intro: string;
    agreementText: string;
  };
  events: {
    heading: string;
    intro: string;
  };
  bootcamps: {
    heading: string;
    intro: string;
  };
}

export interface SpotlightItem {
  _id: string;
  name: string;
  years: string;
  whatTheyDid: string;
  whyItMatters: string;
  photoUrl?: string;
  photoAlt?: string;
  order: number;
  createdAt: string;
}

export interface ToolOfTheWeekItem {
  _id: string;
  name: string;
  whatItDoes: string;
  whoItIsFor: string;
  tryItUrl: string;
  isCurrent: boolean;
  weekLabel: string;
  createdAt: string;
}

export type NewsCategory =
  | 'AI'
  | 'Cybersecurity'
  | 'Privacy'
  | 'Diversity in Tech'
  | 'Laws & Policy';

export interface NewsArticle {
  _id: string;
  title: string;
  sourceName: string;
  link: string;
  summary: string;
  publishedAt: string;
  categories: NewsCategory[];
  pinned?: boolean;
  hidden?: boolean;
}

export interface BookingSubmission {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  bestTime: 'Morning 8–12' | 'Afternoon 12–5' | 'Evening 5–8';
  serviceIds: string[];
  serviceSnapshots: { id: string; name: string; priceLabel: string; basePrice: number }[];
  paymentOption: 'Pay As You Go' | 'Flat Rate' | 'Payment Plan';
  budgetRange: 'Under $100' | '$100–$300' | '$300–$750' | '$750+';
  communityRate: boolean;
  communityGroup: string;
  message: string;
  subtotal: number;
  discountAmount: number;
  estimatedTotal: number;
  status: 'new' | 'contacted' | 'booked' | 'done';
  notes: string;
  createdAt: string;
}

export interface ResourceEntry {
  _id: string;
  name: string;
  category:
    | 'Foster Youth'
    | 'Justice-Impacted Youth'
    | 'Homeless Youth'
    | 'Domestic Violence Survivors'
    | 'Mental Health'
    | 'Housing'
    | 'Education'
    | 'Jobs'
    | 'Legal Help';
  description: string;
  whoItServes: string;
  phone: string;
  website: string;
  area: string;
}

export type CommunityTopic =
  | 'Intro to Computer Science'
  | 'Coding'
  | 'AI & Machine Learning'
  | 'Cybersecurity'
  | 'Careers in Tech'
  | 'Other';

export interface CommunityPost {
  _id: string;
  displayName: string;
  email?: string;
  topic: CommunityTopic;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface TechEventItem {
  _id: string;
  title: string;
  date: string;
  cost: number;
  costLabel: string;
  zip: string;
  city: string;
  link: string;
  mode: 'online' | 'in-person';
  description?: string;
}

export interface BootcampProgram {
  _id: string;
  name: string;
  provider: string;
  description: string;
  costType: 'Free' | 'Low Cost' | 'Paid';
  ageGroup: 'Teens' | 'Young Adults' | 'Adults' | 'All Ages';
  mode: 'Online' | 'In Person' | 'Both';
  topic: string;
  link: string;
  area?: string;
}

export interface SiteVersionRecord {
  _id: string;
  pageKey: string;
  snapshot: unknown;
  savedAt: string;
  savedBy: string;
  note: string;
}
