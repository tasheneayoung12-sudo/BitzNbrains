import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateInvoiceEstimate,
  classifyNewsCategories,
  filterAndSortResources,
  filterBootcamps,
  filterEvents,
  haversineMiles,
  stripHtmlAndLimitSentences,
  toCsv,
  validateBookingForm,
  validateCommunityForm,
} from './domain';
import type { BookServiceItem, BootcampProgram, ResourceEntry, TechEventItem } from '../types/site';

test('calculateInvoiceEstimate applies community discount and 3-way payment plan above $300', () => {
  const services: BookServiceItem[] = [
    {
      id: 'web',
      category: 'Websites',
      name: "I'll Build Your Website",
      description: '3-5 pages',
      included: 'Design and launch',
      priceLabel: 'from $750',
      basePrice: 750,
      priceUnit: 'starting',
    },
  ];
  const est = calculateInvoiceEstimate(services, true, 20, 'Payment Plan');
  assert.equal(est.subtotal, 750);
  assert.equal(est.discountAmount, 150);
  assert.equal(est.estimatedTotal, 600);
  assert.deepEqual(est.paymentPlanInstallments, [200, 200, 200]);
});

test('calculateInvoiceEstimate splits 50/50 for payment plan at or under $300', () => {
  const services: BookServiceItem[] = [
    {
      id: 'seo',
      category: 'Websites',
      name: 'SEO Setup',
      description: 'Google setup',
      included: 'Meta tags',
      priceLabel: '$200 flat',
      basePrice: 200,
      priceUnit: 'flat',
    },
  ];
  const est = calculateInvoiceEstimate(services, false, 20, 'Payment Plan');
  assert.equal(est.estimatedTotal, 200);
  assert.deepEqual(est.paymentPlanInstallments, [100, 100]);
});

test('validateBookingForm returns clear plain-language error messages', () => {
  const errors = validateBookingForm({
    fullName: '',
    phone: '123',
    email: 'not-an-email',
    bestTime: '',
    serviceIds: [],
    communityRate: true,
    communityGroup: '',
    message: '',
  });
  assert.match(errors.phone, /phone number/i);
  assert.match(errors.fullName, /full name/i);
  assert.match(errors.serviceIds, /at least one service/i);
  assert.match(errors.communityGroup, /community group/i);
});

test('validateCommunityForm blocks submission unless respectful agreement is checked', () => {
  const errors = validateCommunityForm({
    displayName: 'Alex',
    email: 'alex@example.com',
    topic: 'Coding',
    comment: 'Hello everyone!',
    agreed: false,
  });
  assert.ok(errors.agreed);
});

test('filterAndSortResources sorts A-Z and filters by name or description', () => {
  const list: ResourceEntry[] = [
    {
      _id: '1',
      name: 'Juvenile Law Center',
      category: 'Legal Help',
      description: 'Legal rights for youth.',
      whoItServes: 'Youth',
      phone: '[VERIFY]',
      website: '[VERIFY]',
      area: 'National',
    },
    {
      _id: '2',
      name: '211',
      category: 'Housing',
      description: 'Connects you to local food and housing.',
      whoItServes: 'Everyone',
      phone: '[VERIFY]',
      website: '[VERIFY]',
      area: 'National',
    },
    {
      _id: '3',
      name: 'Covenant House',
      category: 'Homeless Youth',
      description: 'Shelter and housing support.',
      whoItServes: 'Youth',
      phone: '[VERIFY]',
      website: '[VERIFY]',
      area: 'National',
    },
  ];

  const sortedAll = filterAndSortResources(list, '', 'All');
  assert.deepEqual(sortedAll.map((r) => r.name), ['211', 'Covenant House', 'Juvenile Law Center']);

  const housingSearch = filterAndSortResources(list, 'housing', 'All');
  assert.deepEqual(housingSearch.map((r) => r.name), ['211', 'Covenant House']);
});

test('filterEvents always includes online events and filters in-person by radius & cost', () => {
  const events: (TechEventItem & { distanceMiles?: number | null })[] = [
    {
      _id: '1',
      title: 'Online Intro to Python',
      date: '2026-12-01',
      cost: 0,
      costLabel: 'Free',
      zip: '',
      city: 'Online',
      link: 'https://example.com/1',
      mode: 'online',
    },
    {
      _id: '2',
      title: 'Local Tech Mixer',
      date: '2026-12-02',
      cost: 15,
      costLabel: '$15',
      zip: '90001',
      city: 'Los Angeles, CA',
      link: 'https://example.com/2',
      mode: 'in-person',
      distanceMiles: 12,
    },
    {
      _id: '3',
      title: 'Expensive Conference',
      date: '2026-12-03',
      cost: 150,
      costLabel: '$150',
      zip: '90001',
      city: 'Los Angeles, CA',
      link: 'https://example.com/3',
      mode: 'in-person',
      distanceMiles: 5,
    },
    {
      _id: '4',
      title: 'Far Meetup',
      date: '2026-12-04',
      cost: 0,
      costLabel: 'Free',
      zip: '10001',
      city: 'New York, NY',
      link: 'https://example.com/4',
      mode: 'in-person',
      distanceMiles: 2400,
    },
  ];

  const filtered = filterEvents(events, { radiusMiles: 25, freeOrLowCost: true, hasZipOrigin: true });
  assert.deepEqual(filtered.map((e) => e._id), ['1', '2']);
});

test('haversineMiles computes realistic distance', () => {
  const miles = haversineMiles(34.0522, -118.2437, 34.0522, -118.2437);
  assert.equal(miles, 0);
  const laToSf = haversineMiles(34.0522, -118.2437, 37.7749, -122.4194);
  assert.ok(laToSf > 330 && laToSf < 370);
});

test('filterBootcamps filters by cost, age, mode, topic, and query', () => {
  const items: BootcampProgram[] = [
    {
      _id: '1',
      name: 'freeCodeCamp',
      provider: 'freeCodeCamp',
      description: 'Free coding lessons online',
      costType: 'Free',
      ageGroup: 'All Ages',
      mode: 'Online',
      topic: 'Coding',
      link: '[VERIFY]',
    },
    {
      _id: '2',
      name: 'Year Up',
      provider: 'Year Up',
      description: 'Career training for young adults',
      costType: 'Free',
      ageGroup: 'Young Adults',
      mode: 'Both',
      topic: 'IT & Careers',
      link: '[VERIFY]',
    },
  ];
  const res = filterBootcamps(items, {
    search: 'young',
    freeOrLowCost: true,
    ageGroup: 'Young Adults',
    mode: 'All',
    topic: 'All',
  });
  assert.deepEqual(res.map((p) => p.name), ['Year Up']);
});

test('stripHtmlAndLimitSentences trims HTML and limits to 2 sentences', () => {
  const out = stripHtmlAndLimitSentences(
    '<p>Sentence one is clear. Sentence two explains more! Sentence three should be dropped.</p>',
    2
  );
  assert.equal(out, 'Sentence one is clear. Sentence two explains more!');
});

test('classifyNewsCategories detects cybersecurity and laws', () => {
  const cats = classifyNewsCategories(
    'CISA warns of critical vulnerability as Congress debates privacy bill',
    'New cybersecurity advisory issued.',
    'CISA'
  );
  assert.ok(cats.includes('Cybersecurity'));
  assert.ok(cats.includes('Privacy'));
  assert.ok(cats.includes('Laws & Policy'));
});

test('toCsv escapes commas and quotes properly', () => {
  const csv = toCsv(['Name', 'Note'], [['Ada, Lovelace', 'Said "hello"']]);
  assert.equal(csv, 'Name,Note\n"Ada, Lovelace","Said ""hello"""');
});
