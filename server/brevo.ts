import { getCollection, type DocBase } from './db.ts';

interface NewsletterSubscriber extends DocBase {
  firstName: string;
  email: string;
  createdAt: string;
  syncedToBrevo: boolean;
}

export function getNotifyEmail(): string {
  return process.env.NOTIFY_EMAIL?.trim() || 'bitznbrainsco@gmail.com';
}

export async function addNewsletterContact(firstName: string, email: string): Promise<{ ok: boolean; alreadyExists?: boolean }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = firstName.trim();
  const col = getCollection<NewsletterSubscriber>('newsletter_subscribers');
  const existing = await col.findOne({ email: cleanEmail });
  let syncedToBrevo = false;

  const apiKey = process.env.BREVO_API_KEY?.trim();
  const listIdRaw = process.env.BREVO_LIST_ID?.trim();
  const listId = listIdRaw ? Number(listIdRaw) : undefined;

  if (apiKey) {
    try {
      const payload: Record<string, unknown> = {
        email: cleanEmail,
        attributes: { FIRSTNAME: cleanName },
        updateEnabled: true,
      };
      if (listId && !Number.isNaN(listId)) {
        payload.listIds = [listId];
      }
      const res = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        syncedToBrevo = true;
      } else {
        const body = await res.text();
        console.warn('[Brevo] Contact API returned non-OK:', res.status, body);
      }
    } catch (err) {
      console.warn('[Brevo] Contact sync failed:', (err as Error).message);
    }
  }

  if (!existing) {
    await col.insertOne({
      firstName: cleanName,
      email: cleanEmail,
      createdAt: new Date().toISOString(),
      syncedToBrevo,
    });
    return { ok: true, alreadyExists: false };
  }

  await col.updateOne({ _id: existing._id }, { firstName: cleanName, syncedToBrevo });
  return { ok: true, alreadyExists: true };
}

export async function sendTransactionalEmail(params: {
  subject: string;
  htmlContent: string;
  textContent: string;
  toEmail?: string;
}): Promise<{ sent: boolean; mode: 'brevo' | 'logged' }> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const recipient = params.toEmail || getNotifyEmail();

  if (!apiKey) {
    console.log(`[Email preview -> ${recipient}] Subject: ${params.subject}`);
    return { sent: false, mode: 'logged' };
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Bits & Brains Collective',
          email: getNotifyEmail(),
        },
        to: [{ email: recipient }],
        subject: params.subject,
        htmlContent: params.htmlContent,
        textContent: params.textContent,
      }),
    });
    if (!res.ok) {
      const msg = await res.text();
      console.warn('[Brevo] Transactional email error:', res.status, msg);
      return { sent: false, mode: 'logged' };
    }
    return { sent: true, mode: 'brevo' };
  } catch (err) {
    console.warn('[Brevo] Failed to send email:', (err as Error).message);
    return { sent: false, mode: 'logged' };
  }
}
