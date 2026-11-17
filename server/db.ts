import { MongoClient, type Db } from 'mongodb';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export type DocBase = { _id?: string };

export interface CollectionAdapter<T extends DocBase> {
  find(query?: Record<string, unknown>, options?: { sort?: Record<string, 1 | -1>; limit?: number }): Promise<T[]>;
  findOne(query: Record<string, unknown>): Promise<T | null>;
  insertOne(doc: Omit<T, '_id'> & { _id?: string }): Promise<T>;
  updateOne(query: Record<string, unknown>, update: Partial<T>): Promise<boolean>;
  replaceOrInsert(id: string, doc: T): Promise<T>;
  deleteOne(query: Record<string, unknown>): Promise<boolean>;
  countDocuments(query?: Record<string, unknown>): Promise<number>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const LOCAL_DB_FILE = path.join(DATA_DIR, 'local-db.json');

type LocalStore = Record<string, DocBase[]>;

let localCache: LocalStore | null = null;
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let dbMode: 'mongodb' | 'local' = 'local';

function loadLocalStore(): LocalStore {
  if (localCache) return localCache;
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf8');
      localCache = JSON.parse(raw) as LocalStore;
      return localCache;
    }
  } catch {
    // start fresh if corrupt
  }
  localCache = {};
  return localCache;
}

function saveLocalStore(store: LocalStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch {
    // ignore disk errors in read-only environments
  }
}

function matchesQuery(doc: DocBase, query: Record<string, unknown>): boolean {
  const rec = doc as Record<string, unknown>;
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined) continue;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      const ops = v as Record<string, unknown>;
      if ('$ne' in ops && rec[k] === ops.$ne) return false;
      if ('$in' in ops && Array.isArray(ops.$in) && !ops.$in.includes(rec[k])) return false;
    } else if (rec[k] !== v) {
      return false;
    }
  }
  return true;
}

function sortDocs<T extends DocBase>(docs: T[], sort?: Record<string, 1 | -1>): T[] {
  if (!sort) return docs;
  const entries = Object.entries(sort);
  return [...docs].sort((a, b) => {
    const ar = a as Record<string, unknown>;
    const br = b as Record<string, unknown>;
    for (const [key, dir] of entries) {
      const av = ar[key];
      const bv = br[key];
      if (av === bv) continue;
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * dir;
      }
      if (typeof av === 'boolean' && typeof bv === 'boolean') {
        return ((av ? 1 : 0) - (bv ? 1 : 0)) * dir;
      }
      return String(av).localeCompare(String(bv)) * dir;
    }
    return 0;
  });
}

export async function initDatabase(): Promise<{ mode: 'mongodb' | 'local'; note: string }> {
  const uri = process.env.MONGODB_URI?.trim();
  if (uri) {
    try {
      mongoClient = new MongoClient(uri, { serverSelectionTimeoutMS: 6000 });
      await mongoClient.connect();
      mongoDb = mongoClient.db('bits_and_brains');
      await mongoDb.command({ ping: 1 });
      dbMode = 'mongodb';
      console.log('[DB] Connected to MongoDB Atlas (bits_and_brains).');
      return { mode: 'mongodb', note: 'Connected to MongoDB Atlas.' };
    } catch (err) {
      console.warn('[DB] Could not connect to MONGODB_URI, falling back to local file store:', (err as Error).message);
      mongoClient = null;
      mongoDb = null;
    }
  } else {
    console.log('[DB] MONGODB_URI not set. Using persistent local JSON collection store until MONGODB_URI is configured.');
  }
  dbMode = 'local';
  loadLocalStore();
  return {
    mode: 'local',
    note: 'Using local preview storage. Add MONGODB_URI in Secrets to connect MongoDB Atlas.',
  };
}

export function getDbMode(): 'mongodb' | 'local' {
  return dbMode;
}

export function getCollection<T extends DocBase>(name: string): CollectionAdapter<T> {
  if (mongoDb) {
    const col = mongoDb.collection<T>(name);
    return {
      async find(query = {}, options = {}) {
        let cursor = col.find(query as never);
        if (options.sort) cursor = cursor.sort(options.sort as never);
        if (options.limit) cursor = cursor.limit(options.limit);
        return (await cursor.toArray()) as T[];
      },
      async findOne(query) {
        return (await col.findOne(query as never)) as T | null;
      },
      async insertOne(doc) {
        const _id = doc._id || crypto.randomUUID();
        const fullDoc = { ...doc, _id } as T;
        await col.insertOne(fullDoc as never);
        return fullDoc;
      },
      async updateOne(query, update) {
        const res = await col.updateOne(query as never, { $set: update } as never);
        return res.matchedCount > 0;
      },
      async replaceOrInsert(id, doc) {
        const fullDoc = { ...doc, _id: id } as T;
        await col.replaceOne({ _id: id } as never, fullDoc as never, { upsert: true });
        return fullDoc;
      },
      async deleteOne(query) {
        const res = await col.deleteOne(query as never);
        return res.deletedCount > 0;
      },
      async countDocuments(query = {}) {
        return await col.countDocuments(query as never);
      },
    };
  }

  return {
    async find(query = {}, options = {}) {
      const store = loadLocalStore();
      const rows = (store[name] || []) as T[];
      const filtered = rows.filter((d) => matchesQuery(d, query));
      const sorted = sortDocs(filtered, options.sort);
      return options.limit ? sorted.slice(0, options.limit) : sorted;
    },
    async findOne(query) {
      const store = loadLocalStore();
      const rows = (store[name] || []) as T[];
      return rows.find((d) => matchesQuery(d, query)) || null;
    },
    async insertOne(doc) {
      const store = loadLocalStore();
      if (!store[name]) store[name] = [];
      const _id = doc._id || crypto.randomUUID();
      const fullDoc = { ...doc, _id } as T;
      store[name].push(fullDoc);
      saveLocalStore(store);
      return fullDoc;
    },
    async updateOne(query, update) {
      const store = loadLocalStore();
      const rows = (store[name] || []) as T[];
      const idx = rows.findIndex((d) => matchesQuery(d, query));
      if (idx === -1) return false;
      rows[idx] = { ...rows[idx], ...update };
      saveLocalStore(store);
      return true;
    },
    async replaceOrInsert(id, doc) {
      const store = loadLocalStore();
      if (!store[name]) store[name] = [];
      const rows = store[name] as T[];
      const fullDoc = { ...doc, _id: id } as T;
      const idx = rows.findIndex((d) => d._id === id);
      if (idx === -1) rows.push(fullDoc);
      else rows[idx] = fullDoc;
      saveLocalStore(store);
      return fullDoc;
    },
    async deleteOne(query) {
      const store = loadLocalStore();
      const rows = (store[name] || []) as T[];
      const idx = rows.findIndex((d) => matchesQuery(d, query));
      if (idx === -1) return false;
      rows.splice(idx, 1);
      saveLocalStore(store);
      return true;
    },
    async countDocuments(query = {}) {
      const store = loadLocalStore();
      const rows = (store[name] || []) as T[];
      return rows.filter((d) => matchesQuery(d, query)).length;
    },
  };
}
