import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { NextFunction, Request, Response } from 'express';
import { getCollection, type DocBase } from './db.ts';
import type { AdminRole } from '../src/types/site.ts';

export interface AdminUserDoc extends DocBase {
  email: string;
  name: string;
  passwordHash: string;
  role: AdminRole;
  failedAttempts: number;
  lockedUntil: number | null;
  createdAt: string;
}

export interface PasswordResetDoc extends DocBase {
  email: string;
  tokenHash: string;
  expiresAt: number;
  used: boolean;
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: AdminRole;
  exp: number;
}

export interface AuthedRequest extends Request {
  adminUser?: SessionPayload;
}

export const SESSION_COOKIE_NAME = 'bnb_admin_session';
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours auto-logout
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 min lockout after 5 wrong tries
const MAX_FAILED_ATTEMPTS = 5;

const fallbackSecret = crypto.randomBytes(32).toString('hex');

function getSessionSecret(): string {
  return process.env.SESSION_SECRET?.trim() || fallbackSecret;
}

export function signSessionToken(payload: Omit<SessionPayload, 'exp'>): string {
  const full: SessionPayload = {
    ...payload,
    exp: Date.now() + SESSION_DURATION_MS,
  };
  const encoded = Buffer.from(JSON.stringify(full), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return null;
  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encoded)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!parsed.exp || Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, token: string, req: Request) {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS,
    path: '/',
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
}

export function attachSessionIfPresent(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
  const session = verifySessionToken(token);
  if (session) {
    req.adminUser = session;
  }
  next();
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.adminUser) {
    res.status(401).json({ error: 'Please log in to continue.' });
    return;
  }
  next();
}

export function requireOwner(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.adminUser) {
    res.status(401).json({ error: 'Please log in to continue.' });
    return;
  }
  if (req.adminUser.role !== 'owner') {
    res.status(403).json({ error: 'Only the site owner can change this setting.' });
    return;
  }
  next();
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function recordFailedAttempt(user: AdminUserDoc): Promise<{ locked: boolean; remaining: number }> {
  const col = getCollection<AdminUserDoc>('admins');
  const nextAttempts = (user.failedAttempts || 0) + 1;
  if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
    await col.updateOne(
      { _id: user._id },
      { failedAttempts: nextAttempts, lockedUntil: Date.now() + LOCKOUT_DURATION_MS }
    );
    return { locked: true, remaining: 0 };
  }
  await col.updateOne({ _id: user._id }, { failedAttempts: nextAttempts });
  return { locked: false, remaining: MAX_FAILED_ATTEMPTS - nextAttempts };
}

export async function resetFailedAttempts(userId: string) {
  const col = getCollection<AdminUserDoc>('admins');
  await col.updateOne({ _id: userId }, { failedAttempts: 0, lockedUntil: null });
}
