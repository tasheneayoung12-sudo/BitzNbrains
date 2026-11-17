import type {
  BookServiceItem,
  BootcampProgram,
  NewsCategory,
  ResourceEntry,
  TechEventItem,
} from '../types/site';

export interface InvoiceEstimate {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  estimatedTotal: number;
  paymentPlanInstallments: number[] | null;
}

export function calculateInvoiceEstimate(
  selectedServices: BookServiceItem[],
  applyCommunityDiscount: boolean,
  discountPercent: number,
  paymentOption: 'Pay As You Go' | 'Flat Rate' | 'Payment Plan'
): InvoiceEstimate {
  const subtotal = selectedServices.reduce((sum, s) => sum + (Number(s.basePrice) || 0), 0);
  const effectiveDiscountPct = applyCommunityDiscount ? Math.max(0, Math.min(100, discountPercent)) : 0;
  const discountAmount = Math.round(subtotal * (effectiveDiscountPct / 100) * 100) / 100;
  const estimatedTotal = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

  let paymentPlanInstallments: number[] | null = null;
  if (paymentOption === 'Payment Plan' && estimatedTotal > 0) {
    if (estimatedTotal > 300) {
      const part = Math.round((estimatedTotal / 3) * 100) / 100;
      const last = Math.round((estimatedTotal - part * 2) * 100) / 100;
      paymentPlanInstallments = [part, part, last];
    } else {
      const half = Math.round((estimatedTotal / 2) * 100) / 100;
      const rest = Math.round((estimatedTotal - half) * 100) / 100;
      paymentPlanInstallments = [half, rest];
    }
  }

  return {
    subtotal,
    discountPercent: effectiveDiscountPct,
    discountAmount,
    estimatedTotal,
    paymentPlanInstallments,
  };
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export function validateBookingForm(input: {
  fullName: string;
  phone: string;
  email: string;
  bestTime: string;
  serviceIds: string[];
  communityRate: boolean;
  communityGroup: string;
  message: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.fullName.trim()) {
    errors.fullName = 'Please add your full name so I know who to ask for.';
  }
  if (!input.phone.trim() || !isValidPhone(input.phone)) {
    errors.phone = 'Please add your phone number so I can call you back.';
  }
  if (!input.email.trim() || !isValidEmail(input.email)) {
    errors.email = 'Please add a valid email address so I can send your quote.';
  }
  if (!input.bestTime) {
    errors.bestTime = 'Please pick the best time of day to reach you.';
  }
  if (!input.serviceIds || input.serviceIds.length === 0) {
    errors.serviceIds = 'Please pick at least one service you want help with.';
  }
  if (input.communityRate && !input.communityGroup.trim()) {
    errors.communityGroup = 'Please share which community group applies for the discount.';
  }
  if (!input.message.trim()) {
    errors.message = 'Please tell me a little about what you need help with.';
  }
  return errors;
}

export function validateCommunityForm(input: {
  displayName: string;
  email: string;
  topic: string;
  comment: string;
  agreed: boolean;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.displayName.trim()) {
    errors.displayName = 'Please add a display name to show next to your post.';
  }
  if (!input.email.trim() || !isValidEmail(input.email)) {
    errors.email = 'Please add a valid email address (it will never be shown publicly).';
  }
  if (!input.topic.trim()) {
    errors.topic = 'Please choose a topic for your post.';
  }
  if (input.comment.trim().length < 5) {
    errors.comment = 'Please write a short comment or question (at least 5 characters).';
  }
  if (!input.agreed) {
    errors.agreed = 'Please check the box agreeing to keep the community respectful.';
  }
  return errors;
}

export function filterAndSortResources(
  resources: ResourceEntry[],
  search: string,
  category: string
): ResourceEntry[] {
  const q = search.trim().toLowerCase();
  return [...resources]
    .filter((item) => {
      if (category && category !== 'All' && item.category !== category) {
        return false;
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
}

export function filterBootcamps(
  programs: BootcampProgram[],
  filters: {
    search: string;
    freeOrLowCost: boolean;
    ageGroup: string;
    mode: string;
    topic: string;
  }
): BootcampProgram[] {
  const q = filters.search.trim().toLowerCase();
  return programs.filter((p) => {
    if (filters.freeOrLowCost && p.costType === 'Paid') return false;
    if (filters.ageGroup && filters.ageGroup !== 'All' && p.ageGroup !== filters.ageGroup && p.ageGroup !== 'All Ages') {
      return false;
    }
    if (filters.mode && filters.mode !== 'All') {
      if (filters.mode === 'Online' && p.mode === 'In Person') return false;
      if (filters.mode === 'In Person' && p.mode === 'Online') return false;
    }
    if (filters.topic && filters.topic !== 'All' && p.topic !== filters.topic) {
      return false;
    }
    if (q) {
      const hay = `${p.name} ${p.provider} ${p.description} ${p.topic}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function filterEvents(
  events: (TechEventItem & { distanceMiles?: number | null })[],
  options: {
    radiusMiles: number;
    freeOrLowCost: boolean;
    hasZipOrigin: boolean;
  }
): (TechEventItem & { distanceMiles?: number | null })[] {
  return events.filter((ev) => {
    if (options.freeOrLowCost && ev.cost >= 25) {
      return false;
    }
    if (ev.mode === 'online') {
      return true;
    }
    if (!options.hasZipOrigin) {
      return true;
    }
    if (typeof ev.distanceMiles === 'number') {
      return ev.distanceMiles <= options.radiusMiles;
    }
    return false;
  });
}

export function stripHtmlAndLimitSentences(raw: string, maxSentences = 2): string {
  const text = raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return '';
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  if (!sentences || sentences.length === 0) {
    return text.length > 220 ? `${text.slice(0, 217).trim()}...` : text;
  }
  const picked = sentences
    .slice(0, maxSentences)
    .map((s) => s.trim())
    .join(' ')
    .trim();
  return picked.length > 280 ? `${picked.slice(0, 277).trim()}...` : picked;
}

export function classifyNewsCategories(title: string, summary: string, sourceName: string): NewsCategory[] {
  const text = `${title} ${summary} ${sourceName}`.toLowerCase();
  const cats = new Set<NewsCategory>();

  if (/\b(ai|artificial intelligence|machine learning|llm|chatgpt|openai|gemini|claude|neural|deep learning|model)\b/.test(text)) {
    cats.add('AI');
  }
  if (/\b(cyber|security|breach|ransomware|malware|vulnerability|cisa|phishing|hack|zero-day|patch|exploit)\b/.test(text)) {
    cats.add('Cybersecurity');
  }
  if (/\b(privacy|surveillance|tracking|personal data|gdpr|encryption|spyware|biometric|consent)\b/.test(text)) {
    cats.add('Privacy');
  }
  if (/\b(diversity|inclusion|women in tech|accessibility|ada|underrepresented|equity|bias|inclusive|stem access)\b/.test(text)) {
    cats.add('Diversity in Tech');
  }
  if (/\b(law|policy|regulation|congress|eu|ftc|fcc|court|antitrust|legislation|copyright|senate|ban|bill)\b/.test(text)) {
    cats.add('Laws & Policy');
  }

  if (cats.size === 0) {
    cats.add('AI');
  }
  return Array.from(cats);
}

export function toCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const escapeCell = (val: string | number | boolean | null | undefined) => {
    const str = val === null || val === undefined ? '' : String(val);
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  return [
    headers.map(escapeCell).join(','),
    ...rows.map((r) => r.map(escapeCell).join(',')),
  ].join('\n');
}
