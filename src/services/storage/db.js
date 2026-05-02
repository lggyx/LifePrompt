/**
 * Dexie Database Setup
 * IndexedDB wrapper for local data persistence
 */

import Dexie from 'dexie';

class LifePromptDB extends Dexie {
  constructor() {
    super('LifePromptDB');

    this.version(1).stores({
      articles: '++id, title, sourceType, createdAt, updatedAt, isPublished, *tags',
      tags: '++id, name, color, count',
      userProfile: '++id',
      settings: 'key',
      syncQueue: '++id, status, createdAt',
      chatHistory: '++id, createdAt',
    });

    this.articles = this.table('articles');
    this.tags = this.table('tags');
    this.userProfile = this.table('userProfile');
    this.settings = this.table('settings');
    this.syncQueue = this.table('syncQueue');
    this.chatHistory = this.table('chatHistory');
  }
}

export const db = new LifePromptDB();

// ===== ARTICLE REPOSITORY =====
export const articleRepo = {
  async getAll(options = {}) {
    let query = this.articles.orderBy('createdAt').reverse();
    if (options.limit) query = query.limit(options.limit);
    if (options.offset) query = query.offset(options.offset);
    return await query.toArray();
  },

  async getById(id) {
    return await this.articles.get(id);
  },

  async create(data) {
    const now = new Date().toISOString();
    return await this.articles.add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  },

  async update(id, data) {
    return await this.articles.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id) {
    return await this.articles.delete(id);
  },

  async search(query) {
    const lowerQuery = query.toLowerCase();
    return await this.articles
      .filter((article) =>
        article.title?.toLowerCase().includes(lowerQuery) ||
        article.summary?.toLowerCase().includes(lowerQuery) ||
        article.content?.toLowerCase().includes(lowerQuery) ||
        article.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
      )
      .toArray();
  },

  async getByTag(tagName) {
    return await this.articles
      .filter((article) => article.tags?.includes(tagName))
      .toArray();
  },

  async getBySourceType(sourceType) {
    return await this.articles
      .where('sourceType')
      .equals(sourceType)
      .reverse()
      .sortBy('createdAt');
  },

  async getStats() {
    const total = await this.articles.count();
    const published = await this.articles
      .filter((a) => a.isPublished)
      .count();
    return { total, published };
  },
};

// ===== TAG REPOSITORY =====
export const tagRepo = {
  async getAll() {
    return await this.tags.orderBy('count').reverse().toArray();
  },

  async create(data) {
    return await this.tags.add({
      ...data,
      createdAt: new Date().toISOString(),
    });
  },

  async updateCount(name, delta = 1) {
    const tag = await this.tags.where('name').equals(name).first();
    if (tag) {
      await this.tags.update(tag.id, { count: Math.max(0, (tag.count || 0) + delta) });
    }
  },

  async delete(id) {
    return await this.tags.delete(id);
  },
};

// ===== SETTINGS REPOSITORY =====
export const settingsRepo = {
  async get(key) {
    const entry = await this.settings.get(key);
    return entry?.value;
  },

  async set(key, value) {
    return await this.settings.put({ key, value });
  },

  async getAll() {
    const entries = await this.settings.toArray();
    return Object.fromEntries(entries.map((e) => [e.key, e.value]));
  },
};

// ===== USER PROFILE REPOSITORY =====
export const userProfileRepo = {
  async get() {
    return await this.userProfile.toCollection().first();
  },

  async createOrUpdate(data) {
    const existing = await this.get();
    if (existing) {
      return await this.userProfile.update(existing.id, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    }
    return await this.userProfile.add({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
};

// ===== SYNC QUEUE REPOSITORY =====
export const syncQueueRepo = {
  async enqueue(action, payload) {
    return await this.syncQueue.add({
      action,
      payload,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  },

  async getPending() {
    return await this.syncQueue.where('status').equals('pending').toArray();
  },

  async markDone(id) {
    return await this.syncQueue.update(id, { status: 'done' });
  },

  async markError(id, error) {
    return await this.syncQueue.update(id, { status: 'error', error });
  },
};

// Bind repos to db instance
Object.setPrototypeOf(articleRepo, db);
Object.setPrototypeOf(tagRepo, db);
Object.setPrototypeOf(settingsRepo, db);
Object.setPrototypeOf(userProfileRepo, db);
Object.setPrototypeOf(syncQueueRepo, db);

// ===== DATABASE INIT / SEED =====
export async function initDatabase(seedFn) {
  try {
    await db.open();
    console.log('[DB] Database opened successfully');

    // Seed with mock data if empty (dev mode)
    const articleCount = await db.articles.count();
    if (articleCount === 0 && seedFn) {
      console.log('[DB] Seeding mock data...');
      await seedFn();
    }

    return true;
  } catch (err) {
    console.error('[DB] Failed to open database:', err);
    return false;
  }
}

export default db;
