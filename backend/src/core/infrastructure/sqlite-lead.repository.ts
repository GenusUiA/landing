/*
 * File: src/core/infrastructure/sqlite-lead.repository.ts
 * Description: SQLite-backed implementation of the ILeadRepository interface using positional parameters.
 * Exports: SqliteLeadRepository
 */

import { ILeadRepository } from '../domain/lead.repository.interface';
import { Lead } from '../domain/lead.entity';
import db from './db';

export class SqliteLeadRepository implements ILeadRepository {
  /*
   * Inserts a Lead entity into the local SQLite database using standard positional placeholders.
   * Parameter: lead (Lead) - The Lead entity to store.
   * Returns: Generated database record ID.
   */
  public async create(lead: Lead): Promise<number> {
    const statement = db.prepare(`
      INSERT INTO leads (
        name, phone, topic, comment,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        source_page, user_agent, ip
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = statement.run(
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
      lead.client.ip ?? null
    );

    return Number(result.lastInsertRowid);
  }

  /*
   * Checks whether a phone submission exists within the lookback window using positional placeholders.
   * Parameter: phone (string) - Target normalized phone number.
   * Parameter: windowMinutes (number) - Window duration in minutes.
   * Returns: Boolean indicating if a record exists.
   */
  public async existsRecentByPhone(phone: string, windowMinutes: number): Promise<boolean> {
    const timestampCutoff = new Date(Date.now() - windowMinutes * 60 * 1000)
      .toISOString()
      .replace('T', ' ')
      .slice(0, 19);

    const statement = db.prepare(`
      SELECT id FROM leads 
      WHERE phone = ? AND created_at >= ? 
      LIMIT 1
    `);

    const record = statement.get(phone, timestampCutoff);
    return Boolean(record);
  }
}