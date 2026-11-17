import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import zipcodes from 'zipcodes';
import { createServer as createViteServer } from 'vite';

import { getCollection, getDbMode, initDatabase, type DocBase } from './server/db.ts';
import { DEFAULT_SITE_CONTENT, ensureSeedData } from './server/seed.ts';
import {
  attachSessionIfPresent,
  clearSessionCookie,
  hashPassword,
  recordFailedAttempt,
  requireAdmin,
  requireOwner,
  resetFailedAttempts,
  setSessionCookie,
  signSessionToken,
  verifyPassword,
  type AdminUserDoc,
  type AuthedRequest,
  type PasswordResetDoc,
} from './server/auth.ts';
import { addNewsletterContact, getNotifyEmail, sendTransactionalEmail } from './server/brevo.ts';
import { refreshNewsFeeds, startNewsScheduler } from './server/rss.ts';
import {
  calculateInvoiceEstimate,
  haversineMiles,
  isValidEmail,
  toCsv,
  validateBookingForm,
  validateCommunityForm,
} from './src/lib/domain.ts';
import type {
  BookingSubmission,
  BootcampProgram,
  CommunityPost,
  NewsArticle,
  ResourceEntry,
  SiteContent,
  SiteVersionRecord,
  SpotlightItem,
  TechEventItem,
  ToolOfTheWeekItem,
} from './src/types/site.ts';

interface MediaDoc extends DocBase {
  filename: string;
  mimeType: string;
  dataBase64: string;
  altText: string;
  createdAt: string;
}

const PORT = Number(process.env.PORT || 3000);

function getBaseUrl(req: express.Request): string {
  const configured = process.env.APP_URL?.trim();
  if (configured && configured !== 'MY_APP_URL') {
    return configured.replace(/\/$/, '');
  }
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers.host || `localhost:${PORT}`;
  return `${proto}://${host}`;
}

async function startServer() {
  const dbStatus = await initDatabase();
  await ensureSeedData();
  startNewsScheduler();

  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '4mb' }));
  app.use(cookieParser());
  app.use(attachSessionIfPresent);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login tries right now. Please wait a few minutes and try again.' },
  });

  const publicFormLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 25,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'You are sending forms too fast. Please wait a few minutes and try again.' },
  });

  // --- SEO: robots.txt and sitemap.xml ---
  app.get('/robots.txt', (req, res) => {
    const base = getBaseUrl(req);
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${base}/sitemap.xml\n`
    );
  });

  app.get('/sitemap.xml', async (req, res) => {
    const base = getBaseUrl(req);
    const site = (await getCollection<SiteContent>('site_content').findOne({ _id: 'main' })) || DEFAULT_SITE_CONTENT;
    const routes = [
      { path: '/', enabled: true },
      { path: '/channel', enabled: site.pagesEnabled.channel },
      { path: '/about', enabled: site.pagesEnabled.about },
      { path: '/our-code', enabled: site.pagesEnabled.ourCode },
      { path: '/book-a-brain', enabled: site.pagesEnabled.bookABrain },
      { path: '/resources', enabled: site.pagesEnabled.resources },
      { path: '/community', enabled: site.pagesEnabled.community },
      { path: '/events', enabled: site.pagesEnabled.events },
      { path: '/bootcamps', enabled: site.pagesEnabled.bootcamps },
    ].filter((r) => r.enabled);

    const urls = routes
      .map(
        (r) =>
          `  <url>\n    <loc>${base}${r.path}</loc>\n    <changefreq>weekly</changefreq>\n  </url>`
      )
      .join('\n');
    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
    );
  });

  // --- Uploaded Media Serving ---
  app.get('/api/media/:id', async (req, res) => {
    const media = await getCollection<MediaDoc>('media').findOne({ _id: req.params.id });
    if (!media) {
      res.status(404).send('Not found');
      return;
    }
    const buf = Buffer.from(media.dataBase64, 'base64');
    res.setHeader('Content-Type', media.mimeType || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(buf);
  });

  // --- Public Site Content ---
  app.get('/api/site-content', async (_req, res) => {
    const doc = await getCollection<SiteContent>('site_content').findOne({ _id: 'main' });
    res.json(doc || DEFAULT_SITE_CONTENT);
  });

  // --- Channel: Spotlights & Free Tools ---
  app.get('/api/spotlights', async (_req, res) => {
    const list = await getCollection<SpotlightItem>('spotlights').find({}, { sort: { createdAt: -1 } });
    res.json(list);
  });

  app.get('/api/tools', async (_req, res) => {
    const list = await getCollection<ToolOfTheWeekItem>('tools_of_the_week').find({}, { sort: { createdAt: -1 } });
    res.json(list);
  });

  // --- Newsletter Signup (Brevo) ---
  app.post('/api/newsletter', publicFormLimiter, async (req, res) => {
    const firstName = String(req.body?.firstName || '').trim();
    const email = String(req.body?.email || '').trim();
    if (!firstName) {
      res.status(400).json({ error: 'Please add your first name so we know how to greet you.' });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Please enter a valid email address so we can send updates.' });
      return;
    }
    const result = await addNewsletterContact(firstName, email);
    res.json({
      ok: true,
      message: result.alreadyExists
        ? "You're already on our list! Thanks for staying connected."
        : 'Welcome! You are signed up for Bits & Brains updates.',
    });
  });

  // --- News (RSS cached in MongoDB "news") ---
  app.get('/api/news', async (req, res) => {
    const category = String(req.query.category || '').trim();
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = 12;

    const all = await getCollection<NewsArticle>('news').find(
      { hidden: { $ne: true } },
      { sort: { pinned: -1, publishedAt: -1 } }
    );

    const filtered =
      category && category !== 'All'
        ? all.filter((item) => item.categories?.includes(category as never))
        : all;

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    res.json({ items, total, page, totalPages });
  });

  // --- Book a Brain ---
  app.post('/api/bookings', publicFormLimiter, async (req, res) => {
    const body = req.body || {};
    const input = {
      fullName: String(body.fullName || ''),
      phone: String(body.phone || ''),
      email: String(body.email || ''),
      bestTime: String(body.bestTime || ''),
      serviceIds: Array.isArray(body.serviceIds) ? body.serviceIds.map(String) : [],
      paymentOption: (body.paymentOption || 'Pay As You Go') as BookingSubmission['paymentOption'],
      budgetRange: (body.budgetRange || '$100–$300') as BookingSubmission['budgetRange'],
      communityRate: Boolean(body.communityRate),
      communityGroup: String(body.communityGroup || ''),
      message: String(body.message || ''),
    };

    const errors = validateBookingForm(input);
    if (Object.keys(errors).length > 0) {
      res.status(400).json({ error: Object.values(errors)[0], errors });
      return;
    }

    const site =
      (await getCollection<SiteContent>('site_content').findOne({ _id: 'main' })) ||
      DEFAULT_SITE_CONTENT;
    const selectedServices = site.bookABrain.services.filter((s) =>
      input.serviceIds.includes(s.id)
    );
    if (selectedServices.length === 0) {
      res.status(400).json({ error: 'Please pick at least one valid service.' });
      return;
    }

    const estimate = calculateInvoiceEstimate(
      selectedServices,
      input.communityRate,
      site.bookABrain.communityDiscountPercent,
      input.paymentOption
    );

    const bookingDoc: Omit<BookingSubmission, '_id'> = {
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      bestTime: input.bestTime as BookingSubmission['bestTime'],
      serviceIds: selectedServices.map((s) => s.id),
      serviceSnapshots: selectedServices.map((s) => ({
        id: s.id,
        name: s.name,
        priceLabel: s.priceLabel,
        basePrice: s.basePrice,
      })),
      paymentOption: input.paymentOption,
      budgetRange: input.budgetRange,
      communityRate: input.communityRate,
      communityGroup: input.communityGroup.trim(),
      message: input.message.trim(),
      subtotal: estimate.subtotal,
      discountAmount: estimate.discountAmount,
      estimatedTotal: estimate.estimatedTotal,
      status: 'new',
      notes: '',
      createdAt: new Date().toISOString(),
    };

    const saved = await getCollection<BookingSubmission>('book_a_brain').insertOne(bookingDoc);

    const linesHtml = selectedServices
      .map((s) => `<li><strong>${s.name}</strong> — ${s.priceLabel} (Est. base $${s.basePrice})</li>`)
      .join('');
    const discountHtml = input.communityRate
      ? `<p>Community Discount (${site.bookABrain.communityDiscountPercent}% — ${input.communityGroup}): -$${estimate.discountAmount.toFixed(2)}</p>`
      : '';

    await sendTransactionalEmail({
      subject: `New Book a Brain Request from ${bookingDoc.fullName}`,
      htmlContent: `
        <h2>New Book a Brain Request</h2>
        <p><strong>Client:</strong> ${bookingDoc.fullName}<br/>
        <strong>Phone:</strong> ${bookingDoc.phone}<br/>
        <strong>Email:</strong> ${bookingDoc.email}<br/>
        <strong>Best Time:</strong> ${bookingDoc.bestTime}<br/>
        <strong>Payment Option:</strong> ${bookingDoc.paymentOption}<br/>
        <strong>Budget Range:</strong> ${bookingDoc.budgetRange}</p>
        <h3>Services Requested</h3>
        <ul>${linesHtml}</ul>
        <p><strong>Estimated Subtotal:</strong> $${estimate.subtotal.toFixed(2)}</p>
        ${discountHtml}
        <p><strong>Estimated Total:</strong> $${estimate.estimatedTotal.toFixed(2)}</p>
        <h3>Client Message</h3>
        <p>${bookingDoc.message}</p>
      `,
      textContent: `New Book a Brain Request from ${bookingDoc.fullName} (${bookingDoc.email}, ${bookingDoc.phone}). Estimated Total: $${estimate.estimatedTotal.toFixed(2)}. Message: ${bookingDoc.message}`,
    });

    res.status(201).json({
      ok: true,
      bookingId: saved._id,
      message: "Thank you! I'll reach out within 1–2 business days.",
    });
  });

  // --- Resources ---
  app.get('/api/resources', async (_req, res) => {
    const items = await getCollection<ResourceEntry>('resources').find({}, { sort: { name: 1 } });
    res.json(items);
  });

  // --- Community Forum ---
  app.get('/api/community', async (_req, res) => {
    const posts = await getCollection<CommunityPost>('forum_postings_reviewed').find(
      { status: 'approved' },
      { sort: { createdAt: -1 } }
    );
    // Strip email so it is NEVER exposed publicly
    res.json(
      posts.map((p) => ({
        _id: p._id,
        displayName: p.displayName,
        topic: p.topic,
        comment: p.comment,
        status: p.status,
        createdAt: p.createdAt,
      }))
    );
  });

  app.post('/api/community', publicFormLimiter, async (req, res) => {
    const body = req.body || {};
    // Honeypot check: bots often fill hidden "website" field
    if (body.website && String(body.website).trim() !== '') {
      res.status(201).json({
        ok: true,
        message: 'Thank you! Please allow 24–48 hours for your comment to be reviewed and posted.',
      });
      return;
    }

    const input = {
      displayName: String(body.displayName || ''),
      email: String(body.email || ''),
      topic: String(body.topic || ''),
      comment: String(body.comment || ''),
      agreed: Boolean(body.agreed),
    };
    const errors = validateCommunityForm(input);
    if (Object.keys(errors).length > 0) {
      res.status(400).json({ error: Object.values(errors)[0], errors });
      return;
    }

    const post = await getCollection<CommunityPost>('forum_postings_reviewed').insertOne({
      displayName: input.displayName.trim(),
      email: input.email.trim().toLowerCase(),
      topic: input.topic as CommunityPost['topic'],
      comment: input.comment.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    const base = getBaseUrl(req);
    await sendTransactionalEmail({
      subject: 'New community post to review',
      htmlContent: `
        <h2>New community post to review</h2>
        <p><strong>Display name:</strong> ${post.displayName}</p>
        <p><strong>Topic:</strong> ${post.topic}</p>
        <p><strong>Comment:</strong> ${post.comment}</p>
        <p><a href="${base}/admin">Review and approve or reject in Admin</a></p>
      `,
      textContent: `New community post to review from ${post.displayName} in ${post.topic}: "${post.comment}". Review at ${base}/admin`,
    });

    res.status(201).json({
      ok: true,
      message: 'Thank you! Please allow 24–48 hours for your comment to be reviewed and posted.',
    });
  });

  // --- Tech Events (with Zip-to-Coordinates distance calculation) ---
  app.get('/api/events', async (req, res) => {
    const zipQuery = String(req.query.zip || '').trim();
    const origin = /^\d{5}$/.test(zipQuery) ? zipcodes.lookup(zipQuery) : undefined;
    const events = await getCollection<TechEventItem>('events').find({}, { sort: { date: 1 } });

    const enriched = events.map((ev) => {
      if (ev.mode === 'online' || !origin || !ev.zip) {
        return { ...ev, distanceMiles: null };
      }
      const target = zipcodes.lookup(ev.zip);
      if (!target) return { ...ev, distanceMiles: null };
      const dist = haversineMiles(
        origin.latitude,
        origin.longitude,
        target.latitude,
        target.longitude
      );
      return { ...ev, distanceMiles: Math.round(dist * 10) / 10 };
    });

    res.json({
      zipOrigin: origin ? { zip: origin.zip, city: origin.city, state: origin.state } : null,
      zipValid: zipQuery === '' || Boolean(origin),
      events: enriched,
    });
  });

  // --- Bootcamps & Certifications ---
  app.get('/api/programs', async (_req, res) => {
    const list = await getCollection<BootcampProgram>('programs').find({}, { sort: { name: 1 } });
    res.json(list);
  });

  // --- Admin Auth ---
  app.get('/api/auth/status', async (req: AuthedRequest, res) => {
    const adminCount = await getCollection<AdminUserDoc>('admins').countDocuments();
    res.json({
      hasAdmin: adminCount > 0,
      authenticated: Boolean(req.adminUser),
      user: req.adminUser
        ? { email: req.adminUser.email, role: req.adminUser.role }
        : null,
    });
  });

  app.post('/api/auth/setup', authLimiter, async (req, res) => {
    const col = getCollection<AdminUserDoc>('admins');
    const existingCount = await col.countDocuments();
    if (existingCount > 0) {
      res.status(400).json({ error: 'An admin account already exists. Please log in instead.' });
      return;
    }

    const email = String(req.body?.email || '').trim().toLowerCase();
    const name = String(req.body?.name || 'Owner').trim();
    const password = String(req.body?.password || '');

    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Please choose a password that is at least 8 characters long.' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const created = await col.insertOne({
      email,
      name,
      passwordHash,
      role: 'owner',
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: new Date().toISOString(),
    });

    const token = signSessionToken({ userId: created._id || '', email: created.email, role: 'owner' });
    setSessionCookie(res, token, req);
    res.status(201).json({ ok: true, user: { email: created.email, role: 'owner' } });
  });

  app.post('/api/auth/login', authLimiter, async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!isValidEmail(email) || !password) {
      res.status(400).json({ error: 'Please enter both your email and password.' });
      return;
    }

    const col = getCollection<AdminUserDoc>('admins');
    const user = await col.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'That email or password did not match. Please try again.' });
      return;
    }

    if (user.lockedUntil && Date.now() < user.lockedUntil) {
      const minsLeft = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      res.status(423).json({
        error: `Too many wrong tries. Your login is locked for ${minsLeft} minute(s) for safety.`,
      });
      return;
    }

    const matches = await verifyPassword(password, user.passwordHash);
    if (!matches) {
      const status = await recordFailedAttempt(user);
      if (status.locked) {
        res.status(423).json({
          error: '5 wrong tries reached. Login is locked for 15 minutes for safety.',
        });
        return;
      }
      res.status(401).json({
        error: `Wrong password. You have ${status.remaining} more ${status.remaining === 1 ? 'try' : 'tries'} before a short lock.`,
      });
      return;
    }

    await resetFailedAttempts(user._id || '');
    const token = signSessionToken({ userId: user._id || '', email: user.email, role: user.role });
    setSessionCookie(res, token, req);
    res.json({ ok: true, user: { email: user.email, role: user.role } });
  });

  app.post('/api/auth/logout', (_req, res) => {
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const user = await getCollection<AdminUserDoc>('admins').findOne({ email });
    // Always show calm non-leaking confirmation, and send reset link to NOTIFY_EMAIL if found
    if (user) {
      const rawToken = crypto.randomBytes(24).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      await getCollection<PasswordResetDoc>('password_resets').insertOne({
        email: user.email,
        tokenHash,
        expiresAt: Date.now() + 60 * 60 * 1000,
        used: false,
      });
      const base = getBaseUrl(req);
      const resetLink = `${base}/admin?reset=${rawToken}`;
      await sendTransactionalEmail({
        subject: 'Reset your Bits & Brains Admin password',
        toEmail: getNotifyEmail(),
        htmlContent: `
          <h2>Password Reset Request</h2>
          <p>Someone asked to reset the admin password for <strong>${user.email}</strong>.</p>
          <p><a href="${resetLink}">Click here to set a new password</a> (valid for 1 hour).</p>
        `,
        textContent: `Reset password for ${user.email}: ${resetLink}`,
      });
    }
    res.json({
      ok: true,
      message: `If that account exists, a password reset link was sent to ${getNotifyEmail()}.`,
    });
  });

  app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
    const token = String(req.body?.token || '').trim();
    const newPassword = String(req.body?.password || '');
    if (!token) {
      res.status(400).json({ error: 'Reset link is missing a code. Please ask for a new reset link.' });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: 'Please choose a new password with at least 8 characters.' });
      return;
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetCol = getCollection<PasswordResetDoc>('password_resets');
    const record = await resetCol.findOne({ tokenHash, used: false });
    if (!record || Date.now() > record.expiresAt) {
      res.status(400).json({ error: 'This reset link has expired. Please request a fresh one.' });
      return;
    }

    const adminCol = getCollection<AdminUserDoc>('admins');
    const user = await adminCol.findOne({ email: record.email });
    if (!user) {
      res.status(400).json({ error: 'Account not found.' });
      return;
    }

    const passwordHash = await hashPassword(newPassword);
    await adminCol.updateOne(
      { _id: user._id },
      { passwordHash, failedAttempts: 0, lockedUntil: null }
    );
    await resetCol.updateOne({ _id: record._id }, { used: true });
    res.json({ ok: true, message: 'Password updated! You can log in now.' });
  });

  // --- Admin Dashboard Overview ---
  app.get('/api/admin/overview', requireAdmin, async (_req, res) => {
    const newBookings = await getCollection<BookingSubmission>('book_a_brain').countDocuments({ status: 'new' });
    const pendingPosts = await getCollection<CommunityPost>('forum_postings_reviewed').countDocuments({ status: 'pending' });
    const newsletterCount = await getCollection('newsletter_subscribers').countDocuments();
    const recentSubscribers = await getCollection('newsletter_subscribers').find({}, { sort: { createdAt: -1 }, limit: 8 });
    res.json({
      dbMode: getDbMode(),
      newBookings,
      pendingPosts,
      newsletterCount,
      recentSubscribers,
    });
  });

  // --- Admin: Site Content + Undo Versions (Owner only) ---
  app.put('/api/admin/site-content', requireOwner, async (req: AuthedRequest, res) => {
    const nextContent = req.body?.content as SiteContent | undefined;
    const pageKey = String(req.body?.pageKey || 'all');
    const note = String(req.body?.note || 'Saved changes');

    if (!nextContent || !nextContent.branding) {
      res.status(400).json({ error: 'Site content data is missing.' });
      return;
    }

    const siteCol = getCollection<SiteContent>('site_content');
    const current = (await siteCol.findOne({ _id: 'main' })) || DEFAULT_SITE_CONTENT;

    // Save previous snapshot for Undo (keep last 10 versions per pageKey)
    const verCol = getCollection<SiteVersionRecord>('site_content_versions');
    await verCol.insertOne({
      pageKey,
      snapshot: current,
      savedAt: new Date().toISOString(),
      savedBy: req.adminUser?.email || 'owner',
      note,
    });
    const allForKey = await verCol.find({ pageKey }, { sort: { savedAt: -1 } });
    if (allForKey.length > 10) {
      for (const old of allForKey.slice(10)) {
        await verCol.deleteOne({ _id: old._id });
      }
    }

    const saved = await siteCol.replaceOrInsert('main', { ...nextContent, _id: 'main' });
    res.json(saved);
  });

  app.get('/api/admin/versions', requireOwner, async (req, res) => {
    const pageKey = req.query.pageKey ? String(req.query.pageKey) : undefined;
    const versions = await getCollection<SiteVersionRecord>('site_content_versions').find(
      pageKey ? { pageKey } : {},
      { sort: { savedAt: -1 }, limit: 20 }
    );
    res.json(versions);
  });

  app.post('/api/admin/versions/:id/restore', requireOwner, async (req, res) => {
    const version = await getCollection<SiteVersionRecord>('site_content_versions').findOne({
      _id: req.params.id,
    });
    if (!version || !version.snapshot) {
      res.status(404).json({ error: 'Could not find that saved version.' });
      return;
    }
    const restored = await getCollection<SiteContent>('site_content').replaceOrInsert('main', {
      ...(version.snapshot as SiteContent),
      _id: 'main',
    });
    res.json(restored);
  });

  // --- Admin: Upload Image (Alt text required) ---
  app.post('/api/admin/media', requireOwner, async (req, res) => {
    const filename = String(req.body?.filename || 'upload.png');
    const mimeType = String(req.body?.mimeType || 'image/png');
    const dataUrl = String(req.body?.dataUrl || '');
    const altText = String(req.body?.altText || '').trim();

    if (!altText) {
      res.status(400).json({ error: 'Please add alt text describing the image so screen readers can read it.' });
      return;
    }
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      res.status(400).json({ error: 'Please choose a valid PNG, JPG, GIF, SVG, or WebP image file.' });
      return;
    }
    const saved = await getCollection<MediaDoc>('media').insertOne({
      filename,
      mimeType: match[1] || mimeType,
      dataBase64: match[2],
      altText,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ url: `/api/media/${saved._id}`, altText: saved.altText, _id: saved._id });
  });

  // --- Admin: Bookings Inbox ---
  app.get('/api/admin/bookings', requireOwner, async (_req, res) => {
    const list = await getCollection<BookingSubmission>('book_a_brain').find({}, { sort: { createdAt: -1 } });
    res.json(list);
  });

  app.patch('/api/admin/bookings/:id', requireOwner, async (req, res) => {
    const updates: Partial<BookingSubmission> = {};
    if (req.body?.status) updates.status = req.body.status;
    if (typeof req.body?.notes === 'string') updates.notes = req.body.notes;
    const ok = await getCollection<BookingSubmission>('book_a_brain').updateOne(
      { _id: req.params.id },
      updates
    );
    if (!ok) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }
    res.json({ ok: true });
  });

  // --- Admin: Community Moderation (Owner & Moderator) ---
  app.get('/api/admin/community', requireAdmin, async (_req, res) => {
    const list = await getCollection<CommunityPost>('forum_postings_reviewed').find(
      {},
      { sort: { createdAt: -1 } }
    );
    res.json(list);
  });

  app.patch('/api/admin/community/:id', requireAdmin, async (req, res) => {
    const status = req.body?.status;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      res.status(400).json({ error: 'Invalid status.' });
      return;
    }
    const ok = await getCollection<CommunityPost>('forum_postings_reviewed').updateOne(
      { _id: req.params.id },
      { status }
    );
    if (!ok) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }
    res.json({ ok: true });
  });

  app.delete('/api/admin/community/:id', requireAdmin, async (req, res) => {
    const ok = await getCollection<CommunityPost>('forum_postings_reviewed').deleteOne({
      _id: req.params.id,
    });
    res.json({ ok });
  });

  // --- Admin: Moderators Management (Owner only) ---
  app.get('/api/admin/moderators', requireOwner, async (_req, res) => {
    const admins = await getCollection<AdminUserDoc>('admins').find({}, { sort: { createdAt: 1 } });
    res.json(
      admins.map((a) => ({
        _id: a._id,
        email: a.email,
        name: a.name,
        role: a.role,
        createdAt: a.createdAt,
      }))
    );
  });

  app.post('/api/admin/moderators', requireOwner, async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const name = String(req.body?.name || 'Moderator').trim();
    const password = String(req.body?.password || '');
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters.' });
      return;
    }
    const col = getCollection<AdminUserDoc>('admins');
    if (await col.findOne({ email })) {
      res.status(400).json({ error: 'Someone with that email already has access.' });
      return;
    }
    const created = await col.insertOne({
      email,
      name,
      passwordHash: await hashPassword(password),
      role: 'moderator',
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ _id: created._id, email: created.email, name: created.name, role: created.role });
  });

  app.delete('/api/admin/moderators/:id', requireOwner, async (req, res) => {
    const col = getCollection<AdminUserDoc>('admins');
    const target = await col.findOne({ _id: req.params.id });
    if (!target) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    if (target.role === 'owner') {
      res.status(400).json({ error: 'You cannot remove the main owner account.' });
      return;
    }
    await col.deleteOne({ _id: req.params.id });
    res.json({ ok: true });
  });

  // --- Admin: List Managers CRUD (Owner only) ---
  const managedCollections = ['spotlights', 'tools_of_the_week', 'resources', 'events', 'programs'] as const;

  app.get('/api/admin/list/:collection', requireOwner, async (req, res) => {
    const colName = req.params.collection;
    if (!managedCollections.includes(colName as never)) {
      res.status(404).json({ error: 'Unknown list.' });
      return;
    }
    const items = await getCollection(colName).find({});
    res.json(items);
  });

  app.post('/api/admin/list/:collection', requireOwner, async (req, res) => {
    const colName = req.params.collection;
    if (!managedCollections.includes(colName as never)) {
      res.status(404).json({ error: 'Unknown list.' });
      return;
    }
    const doc = { ...req.body, createdAt: req.body?.createdAt || new Date().toISOString() };
    const created = await getCollection(colName).insertOne(doc);
    res.status(201).json(created);
  });

  app.put('/api/admin/list/:collection/:id', requireOwner, async (req, res) => {
    const colName = req.params.collection;
    if (!managedCollections.includes(colName as never)) {
      res.status(404).json({ error: 'Unknown list.' });
      return;
    }
    const payload = { ...req.body };
    delete payload._id;
    const ok = await getCollection(colName).updateOne({ _id: req.params.id }, payload);
    if (!ok) {
      res.status(404).json({ error: 'Item not found.' });
      return;
    }
    res.json({ ok: true });
  });

  app.delete('/api/admin/list/:collection/:id', requireOwner, async (req, res) => {
    const colName = req.params.collection;
    if (!managedCollections.includes(colName as never)) {
      res.status(404).json({ error: 'Unknown list.' });
      return;
    }
    await getCollection(colName).deleteOne({ _id: req.params.id });
    res.json({ ok: true });
  });

  // --- Admin: News management (pin, hide, refresh RSS) ---
  app.get('/api/admin/news', requireOwner, async (_req, res) => {
    const items = await getCollection<NewsArticle>('news').find({}, { sort: { pinned: -1, publishedAt: -1 } });
    res.json(items);
  });

  app.patch('/api/admin/news/:id', requireOwner, async (req, res) => {
    const updates: Partial<NewsArticle> = {};
    if (typeof req.body?.pinned === 'boolean') updates.pinned = req.body.pinned;
    if (typeof req.body?.hidden === 'boolean') updates.hidden = req.body.hidden;
    await getCollection<NewsArticle>('news').updateOne({ _id: req.params.id }, updates);
    res.json({ ok: true });
  });

  app.post('/api/admin/news/refresh', requireOwner, async (_req, res) => {
    const result = await refreshNewsFeeds();
    res.json(result);
  });

  // --- Admin: CSV Exports ---
  app.get('/api/admin/export/:list', requireOwner, async (req, res) => {
    const listName = req.params.list;
    let csv = '';

    if (listName === 'bookings') {
      const rows = await getCollection<BookingSubmission>('book_a_brain').find({}, { sort: { createdAt: -1 } });
      csv = toCsv(
        ['ID', 'Created At', 'Status', 'Full Name', 'Phone', 'Email', 'Best Time', 'Services', 'Payment Option', 'Budget Range', 'Community Rate', 'Community Group', 'Estimated Total', 'Notes', 'Message'],
        rows.map((r) => [
          r._id,
          r.createdAt,
          r.status,
          r.fullName,
          r.phone,
          r.email,
          r.bestTime,
          r.serviceSnapshots?.map((s) => s.name).join('; '),
          r.paymentOption,
          r.budgetRange,
          r.communityRate ? 'Yes' : 'No',
          r.communityGroup,
          r.estimatedTotal,
          r.notes,
          r.message,
        ])
      );
    } else if (listName === 'community') {
      const rows = await getCollection<CommunityPost>('forum_postings_reviewed').find({}, { sort: { createdAt: -1 } });
      csv = toCsv(
        ['ID', 'Created At', 'Status', 'Display Name', 'Email', 'Topic', 'Comment'],
        rows.map((r) => [r._id, r.createdAt, r.status, r.displayName, r.email || '', r.topic, r.comment])
      );
    } else if (listName === 'newsletter') {
      const rows = await getCollection<{
        _id?: string;
        firstName?: string;
        email?: string;
        createdAt?: string;
        syncedToBrevo?: boolean;
      }>('newsletter_subscribers').find({}, { sort: { createdAt: -1 } });
      csv = toCsv(
        ['ID', 'First Name', 'Email', 'Signed Up At', 'Synced to Brevo'],
        rows.map((r) => [r._id || '', String(r.firstName || ''), String(r.email || ''), String(r.createdAt || ''), Boolean(r.syncedToBrevo)])
      );
    } else if (listName === 'resources') {
      const rows = await getCollection<ResourceEntry>('resources').find({}, { sort: { name: 1 } });
      csv = toCsv(
        ['ID', 'Name', 'Category', 'Area', 'Phone', 'Website', 'Who It Serves', 'Description'],
        rows.map((r) => [r._id, r.name, r.category, r.area, r.phone, r.website, r.whoItServes, r.description])
      );
    } else if (listName === 'events') {
      const rows = await getCollection<TechEventItem>('events').find({}, { sort: { date: 1 } });
      csv = toCsv(
        ['ID', 'Title', 'Date', 'Mode', 'Cost', 'Zip', 'City', 'Link'],
        rows.map((r) => [r._id, r.title, r.date, r.mode, r.costLabel, r.zip, r.city, r.link])
      );
    } else if (listName === 'programs') {
      const rows = await getCollection<BootcampProgram>('programs').find({}, { sort: { name: 1 } });
      csv = toCsv(
        ['ID', 'Name', 'Provider', 'Cost', 'Age Group', 'Mode', 'Topic', 'Area', 'Link', 'Description'],
        rows.map((r) => [r._id, r.name, r.provider, r.costType, r.ageGroup, r.mode, r.topic, r.area || '', r.link, r.description])
      );
    } else {
      res.status(404).json({ error: 'Unknown export list.' });
      return;
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="bits-and-brains-${listName}.csv"`);
    res.send(csv);
  });

  // --- Vite Middleware (Dev) or Static Dist (Prod) ---
  const distPath = path.resolve(process.cwd(), 'dist');
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(distPath);

  if (isProd) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Bits & Brains Collective running on http://localhost:${PORT} (DB: ${dbStatus.mode})`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
