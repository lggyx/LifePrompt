/**
 * SQLite Database Setup (sql.js)
 * Browser-compatible SQLite with localStorage persistence
 */

import initSqlJs from 'sql.js';

const IDB_NAME = 'lifeprompt';
const IDB_STORE = 'sqlite_db';
const IDB_KEY = 'db';

function openIdb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
  });
}

// Load database from IndexedDB or create new
async function loadDatabase() {
  const SQL = await initSqlJs({
    locateFile: (file) => `/sql-wasm.wasm`,
  });

  try {
    const idb = await openIdb();
    const tx = idb.transaction(IDB_STORE, 'readonly');
    const store = tx.objectStore(IDB_STORE);
    const result = await new Promise((resolve) => {
      const req = store.get(IDB_KEY);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
    if (result instanceof ArrayBuffer) {
      return new SQL.Database(new Uint8Array(result));
    }
  } catch {
    // fallthrough to create new
  }
  return new SQL.Database();
}

// Save database to IndexedDB (supports much larger size than localStorage)
async function saveDatabase(db) {
  const data = db.export();
  const idb = await openIdb();
  const tx = idb.transaction(IDB_STORE, 'readwrite');
  const store = tx.objectStore(IDB_STORE);
  store.put(data.buffer, IDB_KEY);
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

let _db = null;
let _ready = false;

// ===== INITIALIZATION =====
export async function initDatabase(seedFn) {
  if (_ready) return _db;

  _db = await loadDatabase();

  // Create tables if not exists
  const schema = `
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT,
      content TEXT,
      sourceType TEXT NOT NULL DEFAULT 'manual',
      sourceUrl TEXT,
      screenshotData TEXT,
      isPublished INTEGER NOT NULL DEFAULT 0,
      publishPlatform TEXT,
      aiGeneratedTitle TEXT,
      aiGeneratedSummary TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT,
      count INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS article_tags (
      articleId INTEGER NOT NULL,
      tagId INTEGER NOT NULL,
      PRIMARY KEY (articleId, tagId),
      FOREIGN KEY (articleId) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      articleId INTEGER NOT NULL,
      data TEXT NOT NULL,
      mimeType TEXT NOT NULL DEFAULT 'image/jpeg',
      caption TEXT,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (articleId) REFERENCES articles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS userProfile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      style TEXT,
      tone TEXT,
      preferredTitleLength TEXT,
      preferredSummaryLength TEXT,
      preferredTags TEXT,
      avoidWords TEXT,
      favoriteExpressions TEXT,
      constraints TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS syncQueue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      error TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chatHistory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      model TEXT,
      metadata TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS aiConfigs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      name TEXT NOT NULL,
      apiKey TEXT NOT NULL,
      baseUrl TEXT,
      model TEXT,
      temperature REAL DEFAULT 0.7,
      isActive INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS glassesInbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      imageData TEXT NOT NULL,
      mimeType TEXT NOT NULL DEFAULT 'image/jpeg',
      title TEXT,
      summary TEXT,
      content TEXT,
      tags TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      uploader TEXT,
      articleId INTEGER,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (articleId) REFERENCES articles(id) ON DELETE SET NULL
    );
  `;

  _db.run(schema);
  await saveDatabase(_db);
  _ready = true;

  console.log('[DB] SQLite database initialized');

  if (seedFn) {
    const count = _db.exec('SELECT COUNT(*) as c FROM articles')[0]?.values[0][0] || 0;
    if (count === 0) {
      await seedFn();
    }
  }

  return _db;
}

export function getDb() {
  if (!_ready || !_db) throw new Error('Database not initialized. Call initDatabase() first.');
  return _db;
}

// ===== HELPERS =====
function now() {
  return new Date().toISOString();
}

function stmt(sql) {
  return getDb().prepare(sql);
}

let _saveTimeout = null;
let _savePending = false;

function scheduleSave() {
  if (_savePending) return;
  _savePending = true;
  clearTimeout(_saveTimeout);
  _saveTimeout = setTimeout(async () => {
    _savePending = false;
    try {
      await saveDatabase(getDb());
    } catch (err) {
      console.error('[DB] Persist failed:', err);
    }
  }, 50);
}

function run(sql, params = {}) {
  getDb().run(sql, params);
  scheduleSave();
}

function query(sql, params = {}) {
  const res = getDb().exec(sql, params);
  if (!res || res.length === 0) return [];
  const [{ columns, values }] = res;
  return values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => {
      const val = row[i];
      obj[col] = val;
    });
    return obj;
  });
}

function queryOne(sql, params = {}) {
  const rows = query(sql, params);
  return rows[0] || null;
}

// ===== ARTICLE REPOSITORY =====
export const articleRepo = {
  _withTags(article) {
    if (!article) return null;
    const tags = query(
      `SELECT t.* FROM tags t
       JOIN article_tags at ON at.tagId = t.id
       WHERE at.articleId = $id`,
      { $id: article.id }
    );
    return { ...article, tags: tags.map((t) => t.name) };
  },

  _withImages(article) {
    if (!article) return null;
    const images = query(
      `SELECT id, data, mimeType, caption, sortOrder FROM images WHERE articleId = $id ORDER BY sortOrder`,
      { $id: article.id }
    );
    return { ...article, images };
  },

  getAll(options = {}) {
    let sql = 'SELECT * FROM articles ORDER BY createdAt DESC';
    const params = {};
    if (options.limit) {
      sql += ' LIMIT $limit';
      params.$limit = options.limit;
    }
    if (options.offset) {
      sql += ' OFFSET $offset';
      params.$offset = options.offset;
    }
    const rows = query(sql, params);
    return rows.map((r) => this._withTags(this._withImages(r)));
  },

  getById(id) {
    const row = queryOne('SELECT * FROM articles WHERE id = $id', { $id: id });
    return this._withTags(this._withImages(row));
  },

  create(data) {
    const time = now();
    const sql = `
      INSERT INTO articles (title, summary, content, sourceType, sourceUrl, screenshotData, isPublished, publishPlatform, aiGeneratedTitle, aiGeneratedSummary, createdAt, updatedAt)
      VALUES ($title, $summary, $content, $sourceType, $sourceUrl, $screenshotData, $isPublished, $publishPlatform, $aiGeneratedTitle, $aiGeneratedSummary, $createdAt, $updatedAt)
    `;
    run(sql, {
      $title: data.title ?? '',
      $summary: data.summary ?? '',
      $content: data.content ?? '',
      $sourceType: data.sourceType ?? 'manual',
      $sourceUrl: data.sourceUrl ?? null,
      $screenshotData: data.screenshotData ?? null,
      $isPublished: data.isPublished ? 1 : 0,
      $publishPlatform: data.publishPlatform ?? null,
      $aiGeneratedTitle: data.aiGeneratedTitle ?? null,
      $aiGeneratedSummary: data.aiGeneratedSummary ?? null,
      $createdAt: time,
      $updatedAt: time,
    });

    const result = queryOne('SELECT last_insert_rowid() as id');
    const articleId = result.id;

    // Handle tags
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach((tagName) => {
        let tag = queryOne('SELECT * FROM tags WHERE name = $name', { $name: tagName });
        if (!tag) {
          run('INSERT INTO tags (name, color, count, createdAt) VALUES ($name, $color, 1, $createdAt)', {
            $name: tagName,
            $color: null,
            $createdAt: time,
          });
          tag = queryOne('SELECT * FROM tags WHERE name = $name', { $name: tagName });
        } else {
          run('UPDATE tags SET count = count + 1 WHERE id = $id', { $id: tag.id });
        }
        run('INSERT OR IGNORE INTO article_tags (articleId, tagId) VALUES ($articleId, $tagId)', {
          $articleId: articleId,
          $tagId: tag.id,
        });
      });
    }

    // Handle images
    if (data.images && data.images.length > 0) {
      data.images.forEach((img, idx) => {
        run(
          'INSERT INTO images (articleId, data, mimeType, caption, sortOrder, createdAt) VALUES ($articleId, $data, $mimeType, $caption, $sortOrder, $createdAt)',
          {
            $articleId: articleId,
            $data: img.data,
            $mimeType: img.mimeType ?? 'image/jpeg',
            $caption: img.caption ?? null,
            $sortOrder: idx,
            $createdAt: time,
          }
        );
      });
    }

    return articleId;
  },

  update(id, data) {
    const fields = [];
    const params = { $id: id, $updatedAt: now() };

    if (data.title !== undefined) { fields.push('title = $title'); params.$title = data.title; }
    if (data.summary !== undefined) { fields.push('summary = $summary'); params.$summary = data.summary; }
    if (data.content !== undefined) { fields.push('content = $content'); params.$content = data.content; }
    if (data.sourceType !== undefined) { fields.push('sourceType = $sourceType'); params.$sourceType = data.sourceType; }
    if (data.sourceUrl !== undefined) { fields.push('sourceUrl = $sourceUrl'); params.$sourceUrl = data.sourceUrl; }
    if (data.screenshotData !== undefined) { fields.push('screenshotData = $screenshotData'); params.$screenshotData = data.screenshotData; }
    if (data.isPublished !== undefined) { fields.push('isPublished = $isPublished'); params.$isPublished = data.isPublished ? 1 : 0; }
    if (data.publishPlatform !== undefined) { fields.push('publishPlatform = $publishPlatform'); params.$publishPlatform = data.publishPlatform; }
    if (data.aiGeneratedTitle !== undefined) { fields.push('aiGeneratedTitle = $aiGeneratedTitle'); params.$aiGeneratedTitle = data.aiGeneratedTitle; }
    if (data.aiGeneratedSummary !== undefined) { fields.push('aiGeneratedSummary = $aiGeneratedSummary'); params.$aiGeneratedSummary = data.aiGeneratedSummary; }

    if (fields.length > 0) {
      fields.push('updatedAt = $updatedAt');
      run(`UPDATE articles SET ${fields.join(', ')} WHERE id = $id`, params);
    }

    // Update tags if provided
    if (data.tags) {
      // Remove old tags
      const oldTags = query('SELECT tagId FROM article_tags WHERE articleId = $id', { $id: id });
      oldTags.forEach((t) => {
        run('UPDATE tags SET count = MAX(0, count - 1) WHERE id = $id', { $id: t.tagId });
      });
      run('DELETE FROM article_tags WHERE articleId = $id', { $id: id });

      // Add new tags
      data.tags.forEach((tagName) => {
        let tag = queryOne('SELECT * FROM tags WHERE name = $name', { $name: tagName });
        if (!tag) {
          run('INSERT INTO tags (name, color, count, createdAt) VALUES ($name, $color, 1, $createdAt)', {
            $name: tagName,
            $color: null,
            $createdAt: now(),
          });
          tag = queryOne('SELECT * FROM tags WHERE name = $name', { $name: tagName });
        } else {
          run('UPDATE tags SET count = count + 1 WHERE id = $id', { $id: tag.id });
        }
        run('INSERT OR IGNORE INTO article_tags (articleId, tagId) VALUES ($articleId, $tagId)', {
          $articleId: id,
          $tagId: tag.id,
        });
      });
    }

    // Update images if provided
    if (data.images) {
      run('DELETE FROM images WHERE articleId = $id', { $id: id });
      data.images.forEach((img, idx) => {
        run(
          'INSERT INTO images (articleId, data, mimeType, caption, sortOrder, createdAt) VALUES ($articleId, $data, $mimeType, $caption, $sortOrder, $createdAt)',
          {
            $articleId: id,
            $data: img.data,
            $mimeType: img.mimeType ?? 'image/jpeg',
            $caption: img.caption ?? null,
            $sortOrder: idx,
            $createdAt: now(),
          }
        );
      });
    }

    return id;
  },

  delete(id) {
    run('DELETE FROM articles WHERE id = $id', { $id: id });
    return id;
  },

  search(queryStr) {
    const like = `%${queryStr.toLowerCase()}%`;
    const sql = `
      SELECT DISTINCT a.* FROM articles a
      LEFT JOIN article_tags at ON at.articleId = a.id
      LEFT JOIN tags t ON t.id = at.tagId
      WHERE LOWER(a.title) LIKE $q
         OR LOWER(a.summary) LIKE $q
         OR LOWER(a.content) LIKE $q
         OR LOWER(t.name) LIKE $q
      ORDER BY a.createdAt DESC
    `;
    const rows = query(sql, { $q: like });
    return rows.map((r) => this._withTags(this._withImages(r)));
  },

  getByTag(tagName) {
    const rows = query(
      `SELECT a.* FROM articles a
       JOIN article_tags at ON at.articleId = a.id
       JOIN tags t ON t.id = at.tagId
       WHERE t.name = $tagName
       ORDER BY a.createdAt DESC`,
      { $tagName: tagName }
    );
    return rows.map((r) => this._withTags(this._withImages(r)));
  },

  getBySourceType(sourceType) {
    const rows = query('SELECT * FROM articles WHERE sourceType = $sourceType ORDER BY createdAt DESC', {
      $sourceType: sourceType,
    });
    return rows.map((r) => this._withTags(this._withImages(r)));
  },

  getStats() {
    const total = queryOne('SELECT COUNT(*) as c FROM articles').c;
    const published = queryOne('SELECT COUNT(*) as c FROM articles WHERE isPublished = 1').c;
    return { total, published };
  },
};

// ===== TAG REPOSITORY =====
export const tagRepo = {
  getAll() {
    return query('SELECT * FROM tags ORDER BY count DESC');
  },

  create(data) {
    const time = now();
    run('INSERT OR IGNORE INTO tags (name, color, count, createdAt) VALUES ($name, $color, $count, $createdAt)', {
      $name: data.name,
      $color: data.color ?? null,
      $count: data.count ?? 0,
      $createdAt: time,
    });
    const tag = queryOne('SELECT * FROM tags WHERE name = $name', { $name: data.name });
    return tag?.id;
  },

  updateCount(name, delta = 1) {
    run('UPDATE tags SET count = MAX(0, count + $delta) WHERE name = $name', {
      $delta: delta,
      $name: name,
    });
  },

  delete(id) {
    run('DELETE FROM tags WHERE id = $id', { $id: id });
    return id;
  },
};

// ===== SETTINGS REPOSITORY =====
export const settingsRepo = {
  get(key) {
    const row = queryOne('SELECT value FROM settings WHERE key = $key', { $key: key });
    if (!row) return undefined;
    try {
      return JSON.parse(row.value);
    } catch {
      return row.value;
    }
  },

  set(key, value) {
    const json = JSON.stringify(value);
    run('INSERT OR REPLACE INTO settings (key, value) VALUES ($key, $value)', {
      $key: key,
      $value: json,
    });
  },

  getAll() {
    const rows = query('SELECT * FROM settings');
    const obj = {};
    rows.forEach((r) => {
      try {
        obj[r.key] = JSON.parse(r.value);
      } catch {
        obj[r.key] = r.value;
      }
    });
    return obj;
  },
};

// ===== USER PROFILE REPOSITORY =====
export const userProfileRepo = {
  get() {
    return queryOne('SELECT * FROM userProfile ORDER BY id LIMIT 1');
  },

  createOrUpdate(data) {
    const existing = this.get();
    const time = now();
    if (existing) {
      const fields = [];
      const params = { $id: existing.id };
      Object.keys(data).forEach((key) => {
        if (key === 'id') return;
        fields.push(`${key} = $${key}`);
        params[`$${key}`] = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
      });
      if (fields.length > 0) {
        fields.push(`updatedAt = $updatedAt`);
        params.$updatedAt = time;
        run(`UPDATE userProfile SET ${fields.join(', ')} WHERE id = $id`, params);
      }
      return existing.id;
    }

    const keys = Object.keys(data).filter((k) => k !== 'id');
    const cols = [...keys, 'createdAt', 'updatedAt'].join(', ');
    const placeholders = keys.map((k) => `$${k}`).join(', ') + ', $createdAt, $updatedAt';
    const params = { $createdAt: time, $updatedAt: time };
    keys.forEach((key) => {
      params[`$${key}`] = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
    });
    run(`INSERT INTO userProfile (${cols}) VALUES (${placeholders})`, params);
    const result = queryOne('SELECT last_insert_rowid() as id');
    return result.id;
  },
};

// ===== SYNC QUEUE REPOSITORY =====
export const syncQueueRepo = {
  enqueue(action, payload) {
    run('INSERT INTO syncQueue (action, payload, status, createdAt) VALUES ($action, $payload, $status, $createdAt)', {
      $action: action,
      $payload: JSON.stringify(payload),
      $status: 'pending',
      $createdAt: now(),
    });
    const result = queryOne('SELECT last_insert_rowid() as id');
    return result.id;
  },

  getPending() {
    return query("SELECT * FROM syncQueue WHERE status = 'pending' ORDER BY createdAt");
  },

  markDone(id) {
    run('UPDATE syncQueue SET status = $status WHERE id = $id', { $status: 'done', $id: id });
  },

  markError(id, error) {
    run('UPDATE syncQueue SET status = $status, error = $error WHERE id = $id', {
      $status: 'error',
      $error: error,
      $id: id,
    });
  },
};

// ===== IMAGE REPOSITORY =====
export const imageRepo = {
  getByArticleId(articleId) {
    return query('SELECT * FROM images WHERE articleId = $articleId ORDER BY sortOrder', { $articleId: articleId });
  },

  getById(id) {
    return queryOne('SELECT * FROM images WHERE id = $id', { $id: id });
  },

  create(data) {
    run(
      'INSERT INTO images (articleId, data, mimeType, caption, sortOrder, createdAt) VALUES ($articleId, $data, $mimeType, $caption, $sortOrder, $createdAt)',
      {
        $articleId: data.articleId,
        $data: data.data,
        $mimeType: data.mimeType ?? 'image/jpeg',
        $caption: data.caption ?? null,
        $sortOrder: data.sortOrder ?? 0,
        $createdAt: now(),
      }
    );
    const result = queryOne('SELECT last_insert_rowid() as id');
    return result.id;
  },

  delete(id) {
    run('DELETE FROM images WHERE id = $id', { $id: id });
    return id;
  },
};

// ===== CHAT HISTORY REPOSITORY =====
export const chatHistoryRepo = {
  getAll(limit = 100) {
    return query('SELECT * FROM chatHistory ORDER BY createdAt DESC LIMIT $limit', { $limit: limit });
  },

  create(data) {
    run('INSERT INTO chatHistory (role, content, model, metadata, createdAt) VALUES ($role, $content, $model, $metadata, $createdAt)', {
      $role: data.role,
      $content: data.content,
      $model: data.model ?? null,
      $metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      $createdAt: now(),
    });
    const result = queryOne('SELECT last_insert_rowid() as id');
    return result.id;
  },

  clear() {
    run('DELETE FROM chatHistory');
  },
};

// ===== AI CONFIG REPOSITORY =====
export const aiConfigRepo = {
  getAll() {
    return query('SELECT * FROM aiConfigs ORDER BY createdAt');
  },

  getActive() {
    return queryOne('SELECT * FROM aiConfigs WHERE isActive = 1 LIMIT 1');
  },

  create(data) {
    run(
      'INSERT INTO aiConfigs (provider, name, apiKey, baseUrl, model, temperature, isActive, createdAt) VALUES ($provider, $name, $apiKey, $baseUrl, $model, $temperature, $isActive, $createdAt)',
      {
        $provider: data.provider,
        $name: data.name,
        $apiKey: data.apiKey,
        $baseUrl: data.baseUrl ?? null,
        $model: data.model ?? null,
        $temperature: data.temperature ?? 0.7,
        $isActive: data.isActive ? 1 : 0,
        $createdAt: now(),
      }
    );
    const result = queryOne('SELECT last_insert_rowid() as id');
    return result.id;
  },

  update(id, data) {
    const fields = [];
    const params = { $id: id };
    Object.keys(data).forEach((key) => {
      if (key === 'id') return;
      fields.push(`${key} = $${key}`);
      params[`$${key}`] = data[key];
    });
    if (fields.length > 0) {
      run(`UPDATE aiConfigs SET ${fields.join(', ')} WHERE id = $id`, params);
    }
    return id;
  },

  delete(id) {
    run('DELETE FROM aiConfigs WHERE id = $id', { $id: id });
    return id;
  },

  setActive(id) {
    run('UPDATE aiConfigs SET isActive = 0');
    run('UPDATE aiConfigs SET isActive = 1 WHERE id = $id', { $id: id });
  },
};

// ===== GLASSES INBOX REPOSITORY =====
export const glassesInboxRepo = {
  getAll(options = {}) {
    let sql = 'SELECT * FROM glassesInbox ORDER BY createdAt DESC';
    const params = {};
    if (options.limit) {
      sql += ' LIMIT $limit';
      params.$limit = options.limit;
    }
    if (options.offset) {
      sql += ' OFFSET $offset';
      params.$offset = options.offset;
    }
    return query(sql, params);
  },

  getById(id) {
    return queryOne('SELECT * FROM glassesInbox WHERE id = $id', { $id: id });
  },

  create(data) {
    const time = now();
    run(
      'INSERT INTO glassesInbox (imageData, mimeType, title, summary, content, tags, status, uploader, createdAt, updatedAt) VALUES ($imageData, $mimeType, $title, $summary, $content, $tags, $status, $uploader, $createdAt, $updatedAt)',
      {
        $imageData: data.imageData,
        $mimeType: data.mimeType ?? 'image/jpeg',
        $title: data.title ?? null,
        $summary: data.summary ?? null,
        $content: data.content ?? null,
        $tags: Array.isArray(data.tags) ? JSON.stringify(data.tags) : (data.tags ?? null),
        $status: data.status ?? 'pending',
        $uploader: data.uploader ?? 'unknown',
        $createdAt: time,
        $updatedAt: time,
      }
    );
    const result = queryOne('SELECT last_insert_rowid() as id');
    return result.id;
  },

  update(id, data) {
    const fields = [];
    const params = { $id: id, $updatedAt: now() };

    if (data.title !== undefined) { fields.push('title = $title'); params.$title = data.title; }
    if (data.summary !== undefined) { fields.push('summary = $summary'); params.$summary = data.summary; }
    if (data.content !== undefined) { fields.push('content = $content'); params.$content = data.content; }
    if (data.tags !== undefined) { fields.push('tags = $tags'); params.$tags = Array.isArray(data.tags) ? JSON.stringify(data.tags) : data.tags; }
    if (data.status !== undefined) { fields.push('status = $status'); params.$status = data.status; }
    if (data.articleId !== undefined) { fields.push('articleId = $articleId'); params.$articleId = data.articleId; }

    if (fields.length > 0) {
      fields.push('updatedAt = $updatedAt');
      run(`UPDATE glassesInbox SET ${fields.join(', ')} WHERE id = $id`, params);
    }
    return id;
  },

  delete(id) {
    run('DELETE FROM glassesInbox WHERE id = $id', { $id: id });
    return id;
  },

  getPending() {
    return query("SELECT * FROM glassesInbox WHERE status = 'pending' ORDER BY createdAt DESC");
  },

  getProcessed() {
    return query("SELECT * FROM glassesInbox WHERE status IN ('processed','archived') ORDER BY createdAt DESC");
  },
};
