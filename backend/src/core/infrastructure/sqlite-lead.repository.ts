/*
 * File: src/core/infrastructure/sqlite-lead.repository.ts
 * Purpose: SQLite implementation of ILeadRepository using async sqlite3 driver.
 */

import { ILeadRepository } from '../domain/lead.repository.interface';
import { Lead } from '../domain/lead.entity';
import { getDb } from './db';

export class SqliteLeadRepository implements ILeadRepository {
  /*
   * Method: create
   * Purpose: Writes a new lead to the database.
   * Input: lead (Lead entity)
   * Output: Promise resolving to number (generated row ID)
   */
  public async create(lead: Lead): Promise<number> {
    const db = await getDb();

    const result = await db.run(
      `INSERT INTO leads (
        name, phone, topic, comment,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        source_page, user_agent, ip
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lead.name,
        lead.phone,
        lead.topic,
        lead.comment ?? null,
        lead.utm.utmSource ?? null,
        lead.utm.utmMedium ?? null,
        lead.utm.utmCampaign ?? null,
        lead.utm.utmContent ?? null,
        lead.utm.utmTerm ?? null,
        lead.utm.sourcePage ?? null,
        lead.client.userAgent ?? null,
        lead.client.ip ?? null,
      ]
    );

    return Number(result.lastID);
  }

  /*
   * Method: existsRecentByPhone
   * Purpose: Checks whether a record with the same phone exists within the given time window.
   * Input: phone (string), windowMinutes (number)
   * Output: Promise resolving to boolean
   */
  public async existsRecentByPhone(phone: string, windowMinutes: number): Promise<boolean> {
    const db = await getDb();

    const timestampCutoff = new Date(Date.now() - windowMinutes * 60 * 1000)
      .toISOString()
      .replace('T', ' ')
      .slice(0, 19);

    const record = await db.get(
      `SELECT id FROM leads WHERE phone = ? AND created_at >= ? LIMIT 1`,
      [phone, timestampCutoff]
    );

    return Boolean(record);
  }
}