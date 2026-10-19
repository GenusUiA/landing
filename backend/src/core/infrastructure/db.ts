/*
 * File: src/core/infrastructure/db.ts
 * Purpose: Manages persistent SQLite database connection instance asynchronously.
 */

import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let dbInstance: Database | null = null;

/*
 * Function: getDb
 * Purpose: Returns an existing SQLite connection or establishes a new one and applies schema migrations.
 * Input: none
 * Output: Promise resolving to Database instance
 */
export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = path.resolve(process.cwd(), 'leads.db');

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await dbInstance.exec(`
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

  return dbInstance;
}