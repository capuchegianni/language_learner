import session from 'express-session';
import Database from 'better-sqlite3';

/**
 * A lightweight SQLite-based session store for express-session.
 * Uses better-sqlite3 for synchronous, high-performance SQLite access.
 * Replaces the unmaintained better-sqlite3-session-store package.
 */
export class SqliteSessionStore extends session.Store {
  private db: InstanceType<typeof Database>;
  private clearExpiredInterval: ReturnType<typeof setInterval> | null = null;

  constructor(options: {
    dbPath: string;
    clearExpiredIntervalMs?: number;
  }) {
    super();

    this.db = new Database(options.dbPath);

    // Create sessions table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY NOT NULL,
        sess TEXT NOT NULL,
        expired INTEGER NOT NULL
      )
    `);

    // Create index on expired column for cleanup queries
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_sessions_expired ON sessions (expired)
    `);

    // Periodically clear expired sessions
    const intervalMs = options.clearExpiredIntervalMs || 900000; // 15 min default
    this.clearExpiredInterval = setInterval(() => {
      this.clearExpired();
    }, intervalMs);

    // Clear on startup too
    this.clearExpired();
  }

  get(sid: string, callback: (err?: Error | null, session?: session.SessionData | null) => void): void {
    try {
      const row = this.db.prepare('SELECT sess FROM sessions WHERE sid = ? AND expired > ?').get(sid, Date.now()) as
        | { sess: string }
        | undefined;

      if (!row) {
        return callback(null, null);
      }

      callback(null, JSON.parse(row.sess));
    } catch (err) {
      callback(err as Error);
    }
  }

  set(sid: string, sessionData: session.SessionData, callback?: (err?: Error | null) => void): void {
    try {
      const maxAge = sessionData.cookie?.maxAge || 86400000; // 1 day default
      const expired = Date.now() + maxAge;
      const sess = JSON.stringify(sessionData);

      this.db
        .prepare(
          'INSERT INTO sessions (sid, sess, expired) VALUES (?, ?, ?) ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expired = excluded.expired',
        )
        .run(sid, sess, expired);

      callback?.(null);
    } catch (err) {
      callback?.(err as Error);
    }
  }

  destroy(sid: string, callback?: (err?: Error | null) => void): void {
    try {
      this.db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
      callback?.(null);
    } catch (err) {
      callback?.(err as Error);
    }
  }

  touch(sid: string, sessionData: session.SessionData, callback?: (err?: Error | null) => void): void {
    try {
      const maxAge = sessionData.cookie?.maxAge || 86400000;
      const expired = Date.now() + maxAge;

      this.db.prepare('UPDATE sessions SET expired = ? WHERE sid = ?').run(expired, sid);
      callback?.(null);
    } catch (err) {
      callback?.(err as Error);
    }
  }

  private clearExpired(): void {
    try {
      this.db.prepare('DELETE FROM sessions WHERE expired < ?').run(Date.now());
    } catch {
      // Silently ignore cleanup errors
    }
  }

  /** Call this when shutting down to clean up the interval timer. */
  close(): void {
    if (this.clearExpiredInterval) {
      clearInterval(this.clearExpiredInterval);
      this.clearExpiredInterval = null;
    }
    this.db.close();
  }
}
