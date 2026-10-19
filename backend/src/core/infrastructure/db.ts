/**
 * @file src/core/infrastructure/db.ts
 * @description SQLite database connection bootstrap and schema migration runner.
 * @exports default (Database.Database)
 */

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'leads.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    topic TEXT NOT NULL,
    comment TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    source_page TEXT,
    user_agent TEXT,
    ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_leads_phone_created 
  ON leads(phone, created_at);
`);

export default db;