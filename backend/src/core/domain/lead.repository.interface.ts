/**
 * @file src/core/domain/lead.repository.interface.ts
 * @description Inverted dependency contract defining persistence capabilities for Lead entities.
 * @exports ILeadRepository
 */

import { Lead } from './lead.entity';

export interface ILeadRepository {
  /**
   * Persists a newly constructed Lead entity.
   * @param lead - Domain entity instance.
   * @returns A promise resolving to the generated unique identifier.
   */
  create(lead: Lead): Promise<number>;

  /**
   * Determines whether an entry with the target phone number exists within the specified lookback window.
   * @param phone - E.164 normalized phone string.
   * @param windowMinutes - Cooldown timeframe in minutes.
   * @returns A promise resolving to true if duplicate exists, false otherwise.
   */
  existsRecentByPhone(phone: string, windowMinutes: number): Promise<boolean>;
}